import { LabDataParser, ParseResult, HL7Message, HL7Segment, HL7OBXSegment, LabReport, LabObservation, CreatePatientResultRequest } from '../types/parserTypes';
import { createNumericResult, createDescriptorResult, MetricResult } from '../../metrics/types/metricTypes';
import { db } from '../../../config/firebase';

export class HL7Parser implements LabDataParser {
  private config = {
    metricMapping: {
      'GLU': 'Blood Glucose',
      'CHOL': 'Total Cholesterol',
      'HDL': 'HDL Cholesterol',
      'LDL': 'LDL Cholesterol',
      'TRIG': 'Triglycerides',
      'HBA1C': 'Hemoglobin A1C',
      'CREAT': 'Creatinine',
      'BUN': 'Blood Urea Nitrogen',
      'ALT': 'Alanine Aminotransferase',
      'AST': 'Aspartate Aminotransferase',
      'TSH': 'Thyroid Stimulating Hormone',
      'T4': 'Free T4',
      'T3': 'Free T3',
      'WBC': 'White Blood Cell Count',
      'RBC': 'Red Blood Cell Count',
      'HGB': 'Hemoglobin',
      'HCT': 'Hematocrit',
      'PLT': 'Platelet Count'
    },
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
      const metricCode = obx.observationId.split('^')[0];
      const metricName = this.config.metricMapping[metricCode] || metricCode;
      
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
          result = createNumericResult(numericValue, status, obx.abnormalFlags);
          break;
        case 'ST': // String
        case 'TX': // Text
          result = createDescriptorResult(obx.observationValue, status);
          break;
        case 'CE': // Coded Entry
          const codedValue = obx.observationValue.split('^')[1] || obx.observationValue;
          result = createDescriptorResult(codedValue, status);
          break;
        default:
          // For unknown types, try to parse as numeric first, then fall back to string
          const parsedValue = parseFloat(obx.observationValue);
          if (!isNaN(parsedValue)) {
            result = createNumericResult(parsedValue, status, obx.abnormalFlags);
          } else {
            result = createDescriptorResult(obx.observationValue, status);
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
    const results: CreatePatientResultRequest[] = [];
    
    // Get lab order data for additional context
    const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
    const labOrderData = labOrderDoc.data();
    
    for (const observation of labReport.observations) {
      // Find matching metric by name
      const metricsSnapshot = await db.collection('metrics')
        .where('name', '==', observation.metricName)
        .get();
      
      if (!metricsSnapshot.empty) {
        const metricDoc = metricsSnapshot.docs[0];
        const metricData = metricDoc.data();
        
        results.push({
          patientId: labReport.patientId,
          metricId: metricDoc.id,
          metricName: observation.metricName,
          result: observation.result,
          labOrderId: labOrderId,
          labTestId: labTestId,
          labId: labOrderData?.labId || '',
          labName: labReport.labName,
          orderId: labReport.orderId,
          orderingProvider: labReport.orderingProvider,
          resultDate: observation.observationDate || labReport.reportDate
        });
      }
    }
    
    return results;
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
}

