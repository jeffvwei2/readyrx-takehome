import { ParserFactory, ParserType } from './parserFactory';
import { ParseResult } from '../types/parserTypes';
import { ResultService } from '../../results/services/resultService';
import { db } from '../../../config/firebase';

export class ParserService {
  static async parseLabData(
    data: string,
    labOrderId: string,
    labTestId: string,
    parserType?: ParserType
  ): Promise<ParseResult> {
    try {
      let parseResult: ParseResult;
      
      if (parserType) {
        parseResult = await ParserFactory.parseData(data, parserType, labOrderId, labTestId);
      } else {
        parseResult = await ParserFactory.parseLabData(data, labOrderId, labTestId);
      }
      
      // Only create patient results if we have a labOrderId and labTestId
      // For file uploads (empty labOrderId), we handle result creation separately
      if (labOrderId && labTestId && parseResult.success && parseResult.results.length > 0) {
        const createdResults = await this.createPatientResults(parseResult.results);
        parseResult.results = createdResults;
      }
      
      return parseResult;
    } catch (error) {
      console.error('Parser service error:', error);
      return {
        success: false,
        results: [],
        errors: [`Parser service failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  static async parseAndSaveResults(
    data: string,
    labOrderId: string,
    labTestId: string,
    parserType?: ParserType,
    patientId?: string
  ): Promise<ParseResult> {
    try {
      
      // First, parse the data to extract lab report (without requiring existing lab order)
      const parseResult = await this.parseLabData(data, '', '', parserType);
      
      if (!parseResult.success || !parseResult.labReport) {
        return {
          success: false,
          results: [],
          errors: ['Failed to parse lab data'],
          warnings: []
        };
      }

      console.log(`Parsed lab report with ${parseResult.labReport.observations.length} observations`);
      console.log(`Extracted order ID: ${parseResult.labReport.orderId}`);

      // Check if we need to find/create a lab order
      let finalLabOrderId = labOrderId;
      let isNewOrder = false;

      if (!labOrderId) {
        // No labOrderId provided, need to find or create lab order
        const orderId = parseResult.labReport.orderId;
        
        if (orderId && orderId > 0) {
          // Try to find existing lab order with this orderId
          const existingOrder = await this.findLabOrderByOrderId(orderId);
          
          if (existingOrder) {
            finalLabOrderId = existingOrder.id;
            
            console.log(`Found existing lab order:`, {
              id: existingOrder.id,
              orderId: existingOrder.orderId,
              status: existingOrder.status,
              statusType: typeof existingOrder.status
            });
            
            // Check if the order is already completed
            if (existingOrder.status === 'Completed') {
              console.log(`Lab order ${finalLabOrderId} with orderId ${orderId} is already completed, stopping processing`);
              return {
                success: true,
                results: [],
                errors: [],
                warnings: [`Lab order with orderId ${orderId} is already completed. No new results created.`]
              };
            } else {
              console.log(`Lab order ${finalLabOrderId} with orderId ${orderId} has status '${existingOrder.status}', updating to Completed`);
              // Update existing order to completed
              await this.updateLabOrderStatus(finalLabOrderId, 'Completed');
              console.log(`Updated existing lab order ${finalLabOrderId} with orderId ${orderId} to Completed`);
            }
          } else {
            // Create new lab order
            finalLabOrderId = await this.createNewLabOrder(parseResult.labReport, labTestId, patientId);
            isNewOrder = true;
            console.log(`Created new lab order ${finalLabOrderId} with orderId ${orderId}`);
          }
        } else {
          // No orderId in file, create new lab order
          finalLabOrderId = await this.createNewLabOrder(parseResult.labReport, labTestId, patientId);
          isNewOrder = true;
          console.log(`Created new lab order ${finalLabOrderId} with generated orderId`);
        }
      } else {
        // LabOrderId provided, check if order exists and is already completed
        const existingOrder = await this.getLabOrderById(labOrderId);
        
        if (existingOrder) {
          console.log(`Found provided lab order:`, {
            id: existingOrder.id,
            orderId: existingOrder.orderId,
            status: existingOrder.status,
            statusType: typeof existingOrder.status
          });
          
          if (existingOrder.status === 'Completed') {
            console.log(`Provided lab order ${labOrderId} is already completed, stopping processing`);
            return {
              success: true,
              results: [],
              errors: [],
              warnings: [`Lab order ${labOrderId} is already completed. No new results created.`]
            };
          } else {
            console.log(`Provided lab order ${labOrderId} has status '${existingOrder.status}', updating to Completed`);
            await this.updateLabOrderStatus(labOrderId, 'Completed');
            console.log(`Updated provided lab order ${labOrderId} to Completed`);
          }
        } else {
          console.warn(`Provided lab order ${labOrderId} not found, proceeding with result creation`);
        }
      }

      // Create patient results from the parsed lab report
      console.log(`Creating patient results from lab report with ${parseResult.labReport.observations.length} observations`);
      const results = await this.createResultsFromLabReport(parseResult.labReport, finalLabOrderId, labTestId);
      
      if (results.length > 0) {
        console.log(`Successfully created ${results.length} patient results for lab order ${finalLabOrderId}`);
      } else {
        console.warn(`No patient results were created for lab order ${finalLabOrderId}`);
      }
      
      return {
        success: true,
        results,
        errors: [],
        warnings: []
      };
    } catch (error) {
      console.error('Parse and save error:', error);
      return {
        success: false,
        results: [],
        errors: [`Parse and save failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }


  static async getSupportedParsers(): Promise<ParserType[]> {
    return ParserFactory.getSupportedTypes();
  }

  static async validateLabData(data: string, parserType?: ParserType): Promise<{
    isValid: boolean;
    detectedType?: ParserType;
    errors: string[];
  }> {
    try {
      let detectedType: ParserType;
      
      if (parserType) {
        detectedType = parserType;
      } else {
        // Auto-detect
        const trimmedData = data.trim();
        
        if (trimmedData.startsWith('MSH|')) {
          detectedType = 'HL7';
        } else if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmedData);
            if (parsed.resourceType === 'Bundle') {
              detectedType = 'FHIR';
            } else {
              detectedType = 'JSON';
            }
          } catch {
            return {
              isValid: false,
              errors: ['Invalid JSON format']
            };
          }
        } else {
          return {
            isValid: false,
            errors: ['Unable to detect data format']
          };
        }
      }
      
      // Basic validation based on type
      const errors: string[] = [];
      
      if (detectedType === 'HL7') {
        if (!data.includes('MSH|')) {
          errors.push('HL7 data must contain MSH segment');
        }
        if (!data.includes('OBX|')) {
          errors.push('HL7 data must contain OBX segments for observations');
        }
      } else if (detectedType === 'FHIR') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.resourceType !== 'Bundle') {
            errors.push('FHIR data must be a Bundle resource');
          }
          if (!parsed.entry || !Array.isArray(parsed.entry)) {
            errors.push('FHIR Bundle must contain entry array');
          }
        } catch {
          errors.push('Invalid FHIR JSON format');
        }
      }
      
      return {
        isValid: errors.length === 0,
        detectedType,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static async createPatientResults(results: any[]): Promise<any[]> {
    const createdResults = [];
    
    for (const resultData of results) {
      try {
        const resultId = await ResultService.createResult(resultData);
        createdResults.push({
          ...resultData,
          id: resultId
        });
      } catch (error) {
        console.error('Error creating patient result:', error);
      }
    }
    
    return createdResults;
  }

  private static async createResultsFromLabReport(
    labReport: any, 
    labOrderId: string, 
    labTestId: string
  ): Promise<any[]> {
    const results = [];
    
    console.log(`createResultsFromLabReport called with labOrderId: ${labOrderId}, labTestId: ${labTestId}`);
    console.log(`Lab report has ${labReport.observations.length} observations`);
    
    // Get lab order data to get patient ID and other details
    const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
    const labOrderData = labOrderDoc.data();
    
    if (!labOrderData) {
      console.error('Lab order data not found:', labOrderId);
      return results;
    }
    
    console.log('Found lab order data:', {
      id: labOrderId,
      patientId: labOrderData.patientId,
      orderId: labOrderData.orderId,
      labId: labOrderData.labId
    });
    
    // Get lab data
    const labDoc = await db.collection('labs').doc(labOrderData.labId).get();
    const labData = labDoc.data();
    
    // Create results for each observation in the lab report
    console.log(`Processing ${labReport.observations.length} observations for patient results`);
    
    for (const observation of labReport.observations) {
      console.log(`Parser Service - Looking for metric: "${observation.metricName}"`);
      
      // Find matching metric by name (plain text comparison)
      const metricsSnapshot = await db.collection('metrics')
        .where('name', '==', observation.metricName)
        .get();
      
      console.log(`Parser Service - Found ${metricsSnapshot.docs.length} metrics matching "${observation.metricName}"`);
      
      if (!metricsSnapshot.empty) {
        const metricDoc = metricsSnapshot.docs[0];
        const metricData = metricDoc.data();
        console.log(`Parser Service - Found metric: ${metricDoc.id} for "${observation.metricName}"`);
        console.log(`Parser Service - Metric data name: "${metricData.name}"`);
        
        const resultData = {
          patientId: labOrderData.patientId,
          metricId: metricDoc.id,
          metricName: metricData.name, // Use the plain text name from database
          result: observation.result,
          labOrderId: labOrderId,
          labTestId: labTestId,
          labId: labOrderData.labId,
          labName: labData?.name || labReport.labName,
          orderId: labOrderData.orderId,
          orderingProvider: labOrderData.orderingProvider,
          resultDate: observation.observationDate || labReport.reportDate
        };
        
        console.log(`Parser Service - About to create result with metricName: "${resultData.metricName}"`);
        
        try {
          const resultId = await ResultService.createResult(resultData);
          console.log(`Parser Service - Created patient result: ${resultId} for metric "${metricData.name}"`);
          results.push({
            ...resultData,
            id: resultId
          });
        } catch (error) {
          console.error('Parser Service - Error creating patient result:', error);
        }
      } else {
        console.warn(`Parser Service - No metric found for: "${observation.metricName}"`);
      }
    }
    
    console.log(`Created ${results.length} total results`);
    return results;
  }

  private static async findLabOrderByOrderId(orderId: number): Promise<any> {
    try {
      const snapshot = await db.collection('labOrders')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error finding lab order by orderId:', error);
      return null;
    }
  }

  private static async getLabOrderById(labOrderId: string): Promise<any> {
    try {
      const doc = await db.collection('labOrders').doc(labOrderId).get();
      
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting lab order by ID:', error);
      return null;
    }
  }

  private static async createNewLabOrder(labReport: any, labTestId: string, patientId?: string): Promise<string> {
    try {
      const currentDate = new Date();
      const orderId = labReport.orderId || Math.floor(Math.random() * 1000000) + 1;
      
      const labOrderData = {
        patientId: patientId || '', // Use provided patientId or empty string
        name: `Lab Results - ${labReport.labName}`,
        orderId: orderId,
        labId: 'quest-diagnostics', // Default lab ID
        labTestId: labTestId,
        orderingProvider: labReport.orderingProvider || 'File Upload',
        status: 'Completed',
        orderedDate: currentDate, // Add orderedDate for file upload orders
        completedDate: currentDate,
        createdAt: currentDate,
        updatedAt: currentDate
      };

      const docRef = await db.collection('labOrders').add(labOrderData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating new lab order:', error);
      throw error;
    }
  }

  private static async updateLabOrderStatus(labOrderId: string, status: string): Promise<void> {
    try {
      await db.collection('labOrders').doc(labOrderId).update({
        status: status,
        completedDate: new Date()
      });
    } catch (error) {
      console.error('Error updating lab order status:', error);
    }
  }
}

