import { LabDataParser, ParseResult, FHIRBundle, FHIRObservation, LabReport, LabObservation } from '../types/parserTypes';
import { createNumericResult, createDescriptorResult, createBooleanResult, MetricResult } from '../../metrics/types/metricTypes';
import { CreatePatientResultRequest } from '../../results/types/resultTypes';
import { db } from '../../../config/firebase';

export class FHIRParser implements LabDataParser {
  private config = {
    metricMapping: {
      // CMP (Comprehensive Metabolic Panel) LOINC codes
      '24323-8': 'Comprehensive Metabolic Panel',
      '33747-0': 'Glucose',
      '2951-2': 'Sodium',
      '2823-3': 'Potassium',
      '2075-0': 'Chloride',
      '2028-9': 'Carbon Dioxide (CO2)',
      '3094-0': 'Blood Urea Nitrogen (BUN)',
      '2160-0': 'Creatinine',
      '2885-2': 'Total Protein',
      '1751-7': 'Albumin',
      '1968-7': 'Total Bilirubin',
      '1742-6': 'Alanine Aminotransferase (ALT)',
      '1920-8': 'Aspartate Aminotransferase (AST)',
      '6768-6': 'Alkaline Phosphatase (ALP)',
      '17861-6': 'Calcium',
      
      // CBC (Complete Blood Count) LOINC codes
      '58410-2': 'Complete Blood Count with Differential',
      '33747-1': 'White Blood Cell Count (WBC)',
      '789-8': 'Red Blood Cell Count (RBC)',
      '718-7': 'Hemoglobin',
      '4544-3': 'Hematocrit',
      '785-6': 'Mean Corpuscular Volume (MCV)',
      '786-4': 'Mean Corpuscular Hemoglobin (MCH)',
      '787-2': 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
      '777-3': 'Platelet Count',
      '770-8': 'Neutrophils',
      '736-9': 'Lymphocytes',
      '5905-5': 'Monocytes',
      '713-8': 'Eosinophils',
      '706-2': 'Basophils',
      
      // Additional common LOINC codes
      '2093-3': 'Total Cholesterol',
      '2085-9': 'HDL Cholesterol',
      '2089-1': 'LDL Cholesterol',
      '2571-8': 'Triglycerides',
      '4548-4': 'Hemoglobin A1C',
      '3016-3': 'Thyroid Stimulating Hormone',
      '3024-7': 'Free T4',
      '3026-2': 'Free T3'
    } as { [key: string]: string },
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
      
      // If no labOrderId provided, use file upload parsing
      if (!labOrderId || !labTestId) {
        return this.parseForFileUpload(fhirBundle);
      }
      
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

  private parseForFileUpload(fhirBundle: FHIRBundle): ParseResult {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Extract order ID from FHIR bundle
      const orderId = this.extractOrderId(fhirBundle);
      const orderingProvider = this.extractOrderingProvider(fhirBundle);
      const labName = this.extractLabName(fhirBundle);
      
      // Extract observations from FHIR bundle
      const observations: LabObservation[] = [];
      
      if (fhirBundle.entry) {
        for (const entry of fhirBundle.entry) {
          if (entry.resource && entry.resource.resourceType === 'Observation') {
            const observation = entry.resource as FHIRObservation;
            
            // Extract observation data
            const metricName = this.extractMetricName(observation);
            const value = this.extractValue(observation);
            const unit = this.extractUnit(observation);
            const interpretation = this.extractInterpretation(observation);
            
            if (metricName && value !== null) {
              observations.push({
                metricName,
                result: {
                  type: 'numeric',
                  value: value,
                  status: (interpretation === 'N' ? 'normal' : 'high') as 'normal' | 'high' | 'low' | 'critical',
                  interpretation: interpretation || 'N'
                },
                unit: unit || '',
                referenceRange: this.extractReferenceRange(observation) || undefined,
                status: 'F' // Final
              });
            }
          }
        }
      }
      
      // Create a lab report for file upload with extracted order ID
      const labReport: LabReport = {
        patientId: '', // Will be set when creating lab order
        labName: labName || 'FHIR Lab',
        orderId: orderId || 0, // Use extracted order ID or default to 0
        orderingProvider: orderingProvider || 'File Upload',
        reportDate: new Date(),
        observations
      };
      
      if (orderId) {
        console.log(`Extracted order ID from FHIR: ${orderId}`);
      } else {
        warnings.push('No order ID found in FHIR bundle, will generate new one');
      }
      
      return {
        success: true,
        results: [],
        errors,
        warnings,
        labReport // Include the parsed lab report
      };
    } catch (error) {
      console.error('Error parsing FHIR for file upload:', error);
      return {
        success: false,
        results: [],
        errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
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
      
      if (fhirObservation.valueQuantity && fhirObservation.valueQuantity.value !== undefined) {
        result = createNumericResult(fhirObservation.valueQuantity.value, status as 'normal' | 'high' | 'low' | 'critical');
        unit = fhirObservation.valueQuantity.unit;
      } else if (fhirObservation.valueString) {
        result = createDescriptorResult(fhirObservation.valueString, status as 'normal' | 'abnormal' | 'positive' | 'negative');
      } else if (fhirObservation.valueBoolean !== undefined) {
        result = createBooleanResult(fhirObservation.valueBoolean, status as 'positive' | 'negative');
      } else if (fhirObservation.valueInteger !== undefined) {
        result = createNumericResult(fhirObservation.valueInteger, status as 'normal' | 'high' | 'low' | 'critical');
      } else if (fhirObservation.valueCodeableConcept) {
        const codedValue = fhirObservation.valueCodeableConcept.text || 
                          fhirObservation.valueCodeableConcept.coding?.[0]?.display ||
                          fhirObservation.valueCodeableConcept.coding?.[0]?.code;
        if (codedValue) {
          result = createDescriptorResult(codedValue, status as 'normal' | 'abnormal' | 'positive' | 'negative');
        }
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

  private extractMetricName(observation: FHIRObservation): string | null {
    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      const coding = observation.code.coding[0];
      return coding.display || coding.code || null;
    }
    return null;
  }

  private extractValue(observation: FHIRObservation): number | null {
    if (observation.valueQuantity) {
      return observation.valueQuantity.value || null;
    }
    return null;
  }

  private extractUnit(observation: FHIRObservation): string | null {
    if (observation.valueQuantity && observation.valueQuantity.unit) {
      return observation.valueQuantity.unit;
    }
    return null;
  }

  private extractInterpretation(observation: FHIRObservation): string | null {
    if (observation.interpretation && observation.interpretation.length > 0) {
      const interpretation = observation.interpretation[0];
      if (interpretation.coding && interpretation.coding.length > 0) {
        return interpretation.coding[0].code || null;
      }
    }
    return null;
  }

  private extractReferenceRange(observation: FHIRObservation): string | null {
    if (observation.referenceRange && observation.referenceRange.length > 0) {
      const refRange = observation.referenceRange[0];
      if (refRange.low && refRange.high) {
        return `${refRange.low.value}${refRange.low.unit || ''} - ${refRange.high.value}${refRange.high.unit || ''}`;
      } else if (refRange.text) {
        return refRange.text;
      }
    }
    return null;
  }

  private extractOrderId(fhirBundle: FHIRBundle): number | null {
    if (!fhirBundle.entry) return null;

    // Look for ServiceRequest resources first (most common for lab orders)
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'ServiceRequest') {
        const serviceRequest = entry.resource as any;
        if (serviceRequest.identifier && serviceRequest.identifier.length > 0) {
          const identifier = serviceRequest.identifier[0];
          if (identifier.value) {
            const orderId = parseInt(identifier.value);
            if (!isNaN(orderId)) {
              return orderId;
            }
          }
        }
      }
    }

    // Look for DiagnosticReport resources
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'DiagnosticReport') {
        const diagnosticReport = entry.resource as any;
        if (diagnosticReport.identifier && diagnosticReport.identifier.length > 0) {
          const identifier = diagnosticReport.identifier[0];
          if (identifier.value) {
            const orderId = parseInt(identifier.value);
            if (!isNaN(orderId)) {
              return orderId;
            }
          }
        }
      }
    }

    // Look for Observation resources with basedOn references
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'Observation') {
        const observation = entry.resource as any;
        if (observation.basedOn && observation.basedOn.length > 0) {
          const basedOn = observation.basedOn[0];
          if (basedOn.identifier && basedOn.identifier.value) {
            const orderId = parseInt(basedOn.identifier.value);
            if (!isNaN(orderId)) {
              return orderId;
            }
          }
        }
      }
    }

    return null;
  }

  private extractOrderingProvider(fhirBundle: FHIRBundle): string | null {
    if (!fhirBundle.entry) return null;

    // Look for ServiceRequest resources
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'ServiceRequest') {
        const serviceRequest = entry.resource as any;
        if (serviceRequest.requester && serviceRequest.requester.display) {
          return serviceRequest.requester.display;
        }
        if (serviceRequest.requester && serviceRequest.requester.reference) {
          // Try to resolve the practitioner reference
          const practitionerRef = serviceRequest.requester.reference;
          for (const practitionerEntry of fhirBundle.entry) {
            if (practitionerEntry.resource && 
                practitionerEntry.resource.resourceType === 'Practitioner' &&
                practitionerEntry.fullUrl === practitionerRef) {
              const practitioner = practitionerEntry.resource as any;
              if (practitioner.name && practitioner.name.length > 0) {
                const name = practitioner.name[0];
                return `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
              }
            }
          }
        }
      }
    }

    // Look for DiagnosticReport resources
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'DiagnosticReport') {
        const diagnosticReport = entry.resource as any;
        if (diagnosticReport.performer && diagnosticReport.performer.length > 0) {
          const performer = diagnosticReport.performer[0];
          if (performer.display) {
            return performer.display;
          }
        }
      }
    }

    return null;
  }

  private extractLabName(fhirBundle: FHIRBundle): string | null {
    if (!fhirBundle.entry) return null;

    // Look for DiagnosticReport resources
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'DiagnosticReport') {
        const diagnosticReport = entry.resource as any;
        if (diagnosticReport.performer && diagnosticReport.performer.length > 0) {
          const performer = diagnosticReport.performer[0];
          if (performer.display) {
            return performer.display;
          }
        }
      }
    }

    // Look for Organization resources
    for (const entry of fhirBundle.entry) {
      if (entry.resource && entry.resource.resourceType === 'Organization') {
        const organization = entry.resource as any;
        if (organization.name) {
          return organization.name;
        }
      }
    }

    return null;
  }
}

