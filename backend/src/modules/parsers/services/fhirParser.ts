import { LabDataParser, ParseResult, FHIRBundle, FHIRObservation, LabReport, LabObservation, CreatePatientResultRequest } from '../types/parserTypes';
import { createNumericResult, createDescriptorResult, createBooleanResult, MetricResult } from '../../metrics/types/metricTypes';
import { db } from '../../../config/firebase';

export class FHIRParser implements LabDataParser {
  private config = {
    metricMapping: {
      '33747-0': 'Blood Glucose',
      '2093-3': 'Total Cholesterol',
      '2085-9': 'HDL Cholesterol',
      '2089-1': 'LDL Cholesterol',
      '2571-8': 'Triglycerides',
      '4548-4': 'Hemoglobin A1C',
      '2160-0': 'Creatinine',
      '3094-0': 'Blood Urea Nitrogen',
      '1742-6': 'Alanine Aminotransferase',
      '1920-8': 'Aspartate Aminotransferase',
      '3016-3': 'Thyroid Stimulating Hormone',
      '3024-7': 'Free T4',
      '3026-2': 'Free T3',
      '33747-0': 'White Blood Cell Count',
      '789-8': 'Red Blood Cell Count',
      '718-7': 'Hemoglobin',
      '4544-3': 'Hematocrit',
      '777-3': 'Platelet Count'
    },
    defaultUnit: '',
    dateFormat: 'ISO8601',
    timezone: 'UTC'
  };

  async parse(data: string, labOrderId: string, labTestId: string): Promise<ParseResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Parse FHIR bundle
      const fhirBundle = this.parseFHIRBundle(data);
      
      // Extract lab report data
      const labReport = await this.extractLabReport(fhirBundle, labOrderId, labTestId);
      
      if (!labReport) {
        errors.push('Failed to extract lab report data from FHIR bundle');
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
      console.error('FHIR parsing error:', error);
      return {
        success: false,
        results: [],
        errors: [`FHIR parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  private parseFHIRBundle(data: string): FHIRBundle {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.resourceType !== 'Bundle') {
        throw new Error('Invalid FHIR bundle: resourceType must be Bundle');
      }
      
      return parsed as FHIRBundle;
    } catch (error) {
      throw new Error(`Failed to parse FHIR JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractLabReport(fhirBundle: FHIRBundle, labOrderId: string, labTestId: string): Promise<LabReport | null> {
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
      
      // Extract observations from FHIR bundle
      const observations: LabObservation[] = [];
      
      for (const entry of fhirBundle.entry) {
        if (entry.resource.resourceType === 'Observation') {
          const observation = entry.resource as FHIRObservation;
          if (observation.status === 'final') { // Final results only
            const labObservation = this.convertFHIRToObservation(observation);
            if (labObservation) {
              observations.push(labObservation);
            }
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

  private convertFHIRToObservation(fhirObservation: FHIRObservation): LabObservation | null {
    try {
      // Extract metric name from observation code
      const metricCode = fhirObservation.code.coding?.[0]?.code || '';
      const metricName = this.config.metricMapping[metricCode] || 
                        fhirObservation.code.text || 
                        fhirObservation.code.coding?.[0]?.display || 
                        metricCode;
      
      // Parse result value based on FHIR value type and create typed result
      let result: MetricResult | null = null;
      let unit: string | undefined;
      let status: 'normal' | 'high' | 'low' | 'critical' | 'abnormal' | 'positive' | 'negative' | undefined;
      
      // Determine status from interpretation
      if (fhirObservation.interpretation && fhirObservation.interpretation.length > 0) {
        const interpretation = fhirObservation.interpretation[0];
        const interpretationCode = interpretation.coding?.[0]?.code;
        switch (interpretationCode) {
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
          case 'POS':
            status = 'positive';
            break;
          case 'NEG':
            status = 'negative';
            break;
          default:
            status = 'normal';
        }
      } else {
        status = 'normal';
      }
      
      if (fhirObservation.valueQuantity) {
        result = createNumericResult(fhirObservation.valueQuantity.value, status);
        unit = fhirObservation.valueQuantity.unit;
      } else if (fhirObservation.valueString) {
        result = createDescriptorResult(fhirObservation.valueString, status);
      } else if (fhirObservation.valueBoolean !== undefined) {
        result = createBooleanResult(fhirObservation.valueBoolean, status);
      } else if (fhirObservation.valueInteger !== undefined) {
        result = createNumericResult(fhirObservation.valueInteger, status);
      } else if (fhirObservation.valueCodeableConcept) {
        const codedValue = fhirObservation.valueCodeableConcept.text || 
                          fhirObservation.valueCodeableConcept.coding?.[0]?.display ||
                          fhirObservation.valueCodeableConcept.coding?.[0]?.code;
        result = createDescriptorResult(codedValue, status);
      }
      
      if (result === null || result === undefined) {
        return null;
      }
      
      // Extract reference range
      let referenceRange: string | undefined;
      if (fhirObservation.referenceRange && fhirObservation.referenceRange.length > 0) {
        const refRange = fhirObservation.referenceRange[0];
        if (refRange.low && refRange.high) {
          referenceRange = `${refRange.low.value}${refRange.low.unit || ''} - ${refRange.high.value}${refRange.high.unit || ''}`;
        } else if (refRange.text) {
          referenceRange = refRange.text;
        }
      }
      
      // Parse effective date
      let observationDate: Date | undefined;
      if (fhirObservation.effectiveDateTime) {
        observationDate = new Date(fhirObservation.effectiveDateTime);
      }
      
      return {
        metricName,
        result,
        unit,
        referenceRange,
        status: fhirObservation.status,
        observationDate
      };
    } catch (error) {
      console.error('Error converting FHIR observation:', error);
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
}

