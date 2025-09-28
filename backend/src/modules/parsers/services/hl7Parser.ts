import { LabDataParser, ParseResult, HL7Message, HL7Segment, HL7OBXSegment, LabReport, LabObservation } from '../types/parserTypes';
import { CreatePatientResultRequest } from '../../results/types/resultTypes';
import { createNumericResult, createDescriptorResult, MetricResult } from '../../metrics/types/metricTypes';
import { 
  convertFirestoreTimestamp, 
  getLabOrderData, 
  getLabData,
  createPatientResultsFromObservations 
} from '../../../shared/utils';
import { db } from '../../../config/firebase';

export class HL7Parser implements LabDataParser {
  private config = {
    metricMapping: {
      // LOINC codes for CMP metrics
      '33747-0': 'Glucose',
      '2951-2': 'Sodium', 
      '2823-3': 'Potassium',
      '2075-0': 'Chloride',
      '2028-9': 'Carbon Dioxide (CO2)',
      '3094-0': 'Blood Urea Nitrogen (BUN)',
      '2160-0': 'Creatinine',
      '2885-2': 'Total Protein',
      '1751-7': 'Albumin',
      '1975-2': 'Total Bilirubin',
      '6768-6': 'Alkaline Phosphatase (ALP)',
      '1742-6': 'Alanine Aminotransferase (ALT)',
      '1920-8': 'Aspartate Aminotransferase (AST)',
      '17861-6': 'Calcium',
      
      // LOINC codes for CBC metrics
      '33747-1': 'White Blood Cell Count (WBC)',
      '789-8': 'Red Blood Cell Count (RBC)',
      '718-7': 'Hemoglobin',
      '4544-3': 'Hematocrit',
      '787-2': 'Mean Corpuscular Volume (MCV)',
      '785-6': 'Mean Corpuscular Hemoglobin (MCH)',
      '786-4': 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
      '777-3': 'Platelet Count',
      '770-8': 'Neutrophils',
      '736-9': 'Lymphocytes',
      '5905-5': 'Monocytes',
      '713-8': 'Eosinophils',
      '706-2': 'Basophils',
      
      // Legacy short codes (for backward compatibility)
      'GLU': 'Glucose',
      'CHOL': 'Total Cholesterol',
      'HDL': 'HDL Cholesterol',
      'LDL': 'LDL Cholesterol',
      'TRIG': 'Triglycerides',
      'HBA1C': 'Hemoglobin A1C',
      'CREAT': 'Creatinine',
      'BUN': 'Blood Urea Nitrogen (BUN)',
      'ALT': 'Alanine Aminotransferase (ALT)',
      'AST': 'Aspartate Aminotransferase (AST)',
      'TSH': 'Thyroid Stimulating Hormone',
      'T4': 'Free T4',
      'T3': 'Free T3',
      'WBC': 'White Blood Cell Count (WBC)',
      'RBC': 'Red Blood Cell Count (RBC)',
      'HGB': 'Hemoglobin',
      'HCT': 'Hematocrit',
      'PLT': 'Platelet Count'
    } as { [key: string]: string },
    defaultUnit: '',
    dateFormat: 'YYYYMMDDHHMMSS',
    timezone: 'UTC'
  };

  async parse(data: string, labOrderId: string, labTestId: string): Promise<ParseResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Parse HL7 message
      const hl7Message = this.parseHL7Message(data);
      
      // If no labOrderId provided, use file upload parsing
      if (!labOrderId || !labTestId) {
        return this.parseForFileUpload(hl7Message);
      }
      
      // Extract lab report data
      const labReport = await this.extractLabReport(hl7Message, labOrderId, labTestId);
      
      if (!labReport) {
        errors.push('Failed to extract lab report data from HL7 message');
        return { success: false, results: [], errors, warnings };
      }
      
      // Convert observations to patient results
      const results = await this.convertObservationsToResults(labReport, labOrderId, labTestId);
      
      return {
        success: true,
        results,
        errors,
        warnings
      };
    } catch (error) {
      console.error('HL7 parsing error:', error);
      return {
        success: false,
        results: [],
        errors: [`HL7 parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  private parseForFileUpload(hl7Message: HL7Message): ParseResult {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Debug: Log available segments
      console.log('Available segments:', hl7Message.segments.map(s => s.segmentType));
      console.log('HL7 message parsed successfully for file upload');
      
      // Extract basic lab report info from HL7 message
      const mshSegment = hl7Message.segments.find(s => s.segmentType === 'MSH');
      const obrSegment = hl7Message.segments.find(s => s.segmentType === 'OBR');
      
      if (!mshSegment) {
        errors.push('Missing required MSH segment');
        return { success: false, results: [], errors, warnings };
      }
      
      if (!obrSegment) {
        warnings.push('No OBR segment found, using default test name');
      }
      
      // Extract order ID from OBR segment (OBR-2: Placer Order Number, OBR-3: Filler Order Number)
      const orderId = this.extractOrderId(obrSegment);
      const orderingProvider = this.extractOrderingProvider(obrSegment);
      
      // Extract lab name from MSH segment
      const labName = mshSegment.fields[3] || 'Unknown Lab';
      
      // Extract test name from OBR segment
      const testName = obrSegment?.fields[4]?.split('^')[0] || 'Unknown Test';
      
      // Extract observations from OBX segments
      const observations: LabObservation[] = [];
      const obxSegments = hl7Message.segments.filter(s => s.segmentType === 'OBX');
      
      console.log(`Found ${obxSegments.length} OBX segments`);
      
      for (const obxSegment of obxSegments) {
        const obx = this.parseOBXSegment(obxSegment);
        if (obx && obx.observationResultStatus === 'F') { // Final results only
          console.log(`Processing OBX segment: ${obx.observationId} = ${obx.observationValue}`);
          const observation = this.convertOBXToObservation(obx);
          if (observation) {
            console.log(`Created observation: ${observation.metricName} = ${JSON.stringify(observation.result)}`);
            observations.push(observation);
          } else {
            console.warn(`Failed to convert OBX segment: ${obx.observationId}`);
          }
        }
      }
      
      console.log(`Created ${observations.length} observations from HL7 file`);
      
      // Create a lab report for file upload with extracted order ID
      const labReport: LabReport = {
        patientId: '', // Will be set when creating lab order
        labName,
        orderId: orderId || 0, // Use extracted order ID or default to 0
        orderingProvider: orderingProvider || 'File Upload',
        reportDate: new Date(),
        observations
      };
      
      if (orderId) {
        console.log(`Extracted order ID from HL7: ${orderId}`);
      } else {
        warnings.push('No order ID found in HL7 message, will generate new one');
      }
      
      return {
        success: true,
        results: [],
        errors,
        warnings,
        labReport // Include the parsed lab report
      };
    } catch (error) {
      console.error('Error parsing HL7 for file upload:', error);
      return {
        success: false,
        results: [],
        errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
        warnings: []
      };
    }
  }

  private parseHL7Message(data: string): HL7Message {
    const lines = data.split('\n').filter(line => line.trim());
    const segments: HL7Segment[] = [];
    
    for (const line of lines) {
      const fields = line.split('|');
      segments.push({
        segmentType: fields[0],
        fields: fields.slice(1)
      });
    }
    
    // Extract MSH segment for message header
    const mshSegment = segments.find(s => s.segmentType === 'MSH');
    if (!mshSegment) {
      throw new Error('Missing MSH segment in HL7 message');
    }
    
    return {
      messageType: mshSegment.fields[8] || '',
      messageControlId: mshSegment.fields[9] || '',
      sendingApplication: mshSegment.fields[2] || '',
      sendingFacility: mshSegment.fields[3] || '',
      receivingApplication: mshSegment.fields[4] || '',
      receivingFacility: mshSegment.fields[5] || '',
      messageDateTime: this.parseHL7DateTime(mshSegment.fields[6] || ''),
      segments
    };
  }

  private async extractLabReport(hl7Message: HL7Message, labOrderId: string, labTestId: string): Promise<LabReport | null> {
    try {
      // Get lab order data
      const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
      if (!labOrderDoc.exists) {
        throw new Error('Lab order not found');
      }
      
      const labOrderData = labOrderDoc.data();
      
      // Get patient data
      const patientDoc = await db.collection('patients').doc(labOrderData?.patientId).get();
      const patientData = patientDoc.data();
      
      // Get lab data
      const labDoc = await db.collection('labs').doc(labOrderData?.labId).get();
      const labData = labDoc.data();
      
      // Extract observations from OBX segments
      const observations: LabObservation[] = [];
      const obxSegments = hl7Message.segments.filter(s => s.segmentType === 'OBX');
      
      for (const obxSegment of obxSegments) {
        const obx = this.parseOBXSegment(obxSegment);
        if (obx && obx.observationResultStatus === 'F') { // Final results only
          const observation = this.convertOBXToObservation(obx);
          if (observation) {
            observations.push(observation);
          }
        }
      }
      
      return {
        patientId: labOrderData?.patientId,
        labName: labData?.name || 'Unknown Lab',
        orderId: labOrderData?.orderId || 0,
        orderingProvider: labOrderData?.orderingProvider || 'Unknown Provider',
        reportDate: new Date(),
        observations
      };
    } catch (error) {
      console.error('Error extracting lab report:', error);
      return null;
    }
  }

  private parseOBXSegment(segment: HL7Segment): HL7OBXSegment | null {
    try {
      const fields = segment.fields;
      return {
        setId: fields[0] || undefined,
        valueType: fields[1] || '',
        observationId: fields[2] || '',
        observationSubId: fields[3] || undefined,
        observationValue: fields[4] || '',
        units: fields[5] || undefined,
        referenceRange: fields[6] || undefined,
        abnormalFlags: fields[7] || undefined,
        probability: fields[8] || undefined,
        natureOfAbnormalTest: fields[9] || undefined,
        observationResultStatus: fields[10] || '',
        effectiveDateTime: fields[11] ? this.parseHL7DateTime(fields[11]) : undefined,
        userDefinedAccessChecks: fields[12] || undefined,
        observationDateTime: fields[13] ? this.parseHL7DateTime(fields[13]) : undefined,
        producerId: fields[14] || undefined,
        responsibleObserver: fields[15] || undefined,
        observationMethod: fields[16] || undefined
      };
    } catch (error) {
      console.error('Error parsing OBX segment:', error);
      return null;
    }
  }

  private convertOBXToObservation(obx: HL7OBXSegment): LabObservation | null {
    try {
      // Extract metric name from observation ID
      // Format: LOINC_CODE^DESCRIPTION^LOINC_SYSTEM
      const observationIdParts = obx.observationId.split('^');
      const loincCode = observationIdParts[0];
      const description = observationIdParts[1] || '';
      
      // Try to find metric name using LOINC code first, then fall back to description
      let metricName = this.config.metricMapping[loincCode];
      
      console.log(`HL7 Parser - LOINC Code: ${loincCode}, Description: ${description}, Mapped Name: ${metricName}`);
      
      if (!metricName) {
        // If no LOINC code mapping, try to match by description
        const descriptionLower = description.toLowerCase();
        for (const [code, name] of Object.entries(this.config.metricMapping)) {
          if (name.toLowerCase().includes(descriptionLower) || descriptionLower.includes(name.toLowerCase())) {
            metricName = name;
            console.log(`HL7 Parser - Found match by description: ${name}`);
            break;
          }
        }
      }
      
      // If still no match, use the description as fallback
      if (!metricName) {
        metricName = description || loincCode;
        console.warn(`No metric mapping found for LOINC code ${loincCode} (${description}), using description as fallback`);
      }
      
      console.log(`HL7 Parser - Final metric name: ${metricName}`);
      
      // Parse result value based on value type and create typed result
      let result: MetricResult;
      let status: 'normal' | 'high' | 'low' | 'critical' | 'abnormal' | 'positive' | 'negative' | undefined;
      
      // Determine status from abnormal flags
      if (obx.abnormalFlags) {
        switch (obx.abnormalFlags.toUpperCase()) {
          case 'H':
            status = 'high';
            break;
          case 'L':
            status = 'low';
            break;
          case 'A':
            status = 'abnormal';
            break;
          case 'C':
            status = 'critical';
            break;
          default:
            status = 'normal';
        }
      } else {
        status = 'normal';
      }
      
      switch (obx.valueType) {
        case 'NM': // Numeric
          const numericValue = parseFloat(obx.observationValue);
          if (isNaN(numericValue)) {
            return null;
          }
          // Convert status to numeric result compatible status
          const numericStatus = status === 'abnormal' ? 'normal' : status as 'normal' | 'high' | 'low' | 'critical';
          result = createNumericResult(numericValue, numericStatus, obx.abnormalFlags);
          break;
        case 'ST': // String
        case 'TX': // Text
          // Convert status to descriptor result compatible status
          const descriptorStatus = status === 'high' || status === 'low' || status === 'critical' ? 'abnormal' : status as 'normal' | 'abnormal' | 'positive' | 'negative';
          result = createDescriptorResult(obx.observationValue, descriptorStatus);
          break;
        case 'CE': // Coded Entry
          const codedValue = obx.observationValue.split('^')[1] || obx.observationValue;
          // Convert status to descriptor result compatible status
          const codedStatus = status === 'high' || status === 'low' || status === 'critical' ? 'abnormal' : status as 'normal' | 'abnormal' | 'positive' | 'negative';
          result = createDescriptorResult(codedValue, codedStatus);
          break;
        default:
          // For unknown types, try to parse as numeric first, then fall back to string
          const parsedValue = parseFloat(obx.observationValue);
          if (!isNaN(parsedValue)) {
            // Convert status to numeric result compatible status
            const defaultNumericStatus = status === 'abnormal' ? 'normal' : status as 'normal' | 'high' | 'low' | 'critical';
            result = createNumericResult(parsedValue, defaultNumericStatus, obx.abnormalFlags);
          } else {
            // Convert status to descriptor result compatible status
            const defaultDescriptorStatus = status === 'high' || status === 'low' || status === 'critical' ? 'abnormal' : status as 'normal' | 'abnormal' | 'positive' | 'negative';
            result = createDescriptorResult(obx.observationValue, defaultDescriptorStatus);
          }
      }
      
      return {
        metricName,
        result,
        unit: obx.units,
        referenceRange: obx.referenceRange,
        status: obx.observationResultStatus,
        observationDate: obx.effectiveDateTime || obx.observationDateTime
      };
    } catch (error) {
      console.error('Error converting OBX to observation:', error);
      return null;
    }
  }

  private async convertObservationsToResults(
    labReport: LabReport, 
    labOrderId: string, 
    labTestId: string
  ): Promise<CreatePatientResultRequest[]> {
    // Get lab order and lab data
    const labOrderData = await getLabOrderData(labOrderId);
    const labData = await getLabData(labOrderData?.labId || '');
    
    // Transform observations to the format expected by shared utility
    const observations = labReport.observations.map(obs => ({
      metricName: obs.metricName,
      result: obs.result,
      observationDate: obs.observationDate
    }));
    
    // Use shared utility to create patient results
    return createPatientResultsFromObservations(
      observations,
      labOrderData,
      labData,
      labOrderId,
      labTestId,
      labReport
    );
  }

  private parseHL7DateTime(dateTimeStr: string): Date {
    try {
      // HL7 date format: YYYYMMDDHHMMSS[.SSSS][+/-ZZZZ]
      const cleanStr = dateTimeStr.replace(/[+-]\d{4}$/, ''); // Remove timezone
      const year = cleanStr.substring(0, 4);
      const month = cleanStr.substring(4, 6);
      const day = cleanStr.substring(6, 8);
      const hour = cleanStr.substring(8, 10) || '00';
      const minute = cleanStr.substring(10, 12) || '00';
      const second = cleanStr.substring(12, 14) || '00';
      
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    } catch (error) {
      console.error('Error parsing HL7 date:', error);
      return new Date();
    }
  }

  private extractOrderId(obrSegment: HL7Segment | undefined): number | null {
    if (!obrSegment) return null;

    console.log('OBR segment fields:', obrSegment.fields);
    console.log('OBR-2 (Placer Order Number):', obrSegment.fields[2]);
    console.log('OBR-3 (Filler Order Number):', obrSegment.fields[3]);

    // OBR-2: Placer Order Number (most common)
    if (obrSegment.fields[2]) {
      const placerOrderNumber = obrSegment.fields[2];
      console.log('Processing placer order number:', placerOrderNumber);
      const orderId = parseInt(placerOrderNumber);
      if (!isNaN(orderId)) {
        console.log('Extracted order ID from OBR-2:', orderId);
        return orderId;
      }
    }

    // OBR-3: Filler Order Number (alternative)
    if (obrSegment.fields[3]) {
      const fillerOrderNumber = obrSegment.fields[3];
      console.log('Processing filler order number:', fillerOrderNumber);
      const orderId = parseInt(fillerOrderNumber);
      if (!isNaN(orderId)) {
        console.log('Extracted order ID from OBR-3:', orderId);
        return orderId;
      }
    }

    console.log('No valid order ID found in OBR segment');
    return null;
  }

  private extractOrderingProvider(obrSegment: HL7Segment | undefined): string | null {
    if (!obrSegment) return null;

    // OBR-16: Ordering Provider (most common)
    if (obrSegment.fields[16]) {
      const orderingProviderField = obrSegment.fields[16];
      // HL7 format: ID^Lastname^Firstname^Middlename^Suffix^Prefix^Degree^Source Table^ID^Lastname^Firstname^Middlename^Suffix^Prefix^Degree
      const parts = orderingProviderField.split('^');
      if (parts.length >= 3) {
        const firstName = parts[2] || '';
        const lastName = parts[1] || '';
        return `${firstName} ${lastName}`.trim();
      }
      // If it's just a simple name without separators
      return orderingProviderField;
    }

    return null;
  }
}

