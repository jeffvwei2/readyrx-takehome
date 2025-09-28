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
      
      // If parsing was successful, create patient results
      if (parseResult.success && parseResult.results.length > 0) {
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
    parserType?: ParserType
  ): Promise<ParseResult> {
    try {
      const parseResult = await this.parseLabData(data, labOrderId, labTestId, parserType);
      
      if (parseResult.success && parseResult.results.length > 0) {
        // Update lab order status to completed
        await this.updateLabOrderStatus(labOrderId, 'Completed');
        
        // Log successful parsing
        console.log(`Successfully parsed ${parseResult.results.length} results for lab order ${labOrderId}`);
      }
      
      return parseResult;
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

  static async parseAndSaveResultsForNewOrder(
    data: string,
    labOrderId: string,
    labTestId: string,
    parserType?: ParserType
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

      // Create patient results from the parsed lab report
      console.log(`Creating patient results from lab report with ${parseResult.labReport.observations.length} observations`);
      const results = await this.createResultsFromLabReport(parseResult.labReport, labOrderId, labTestId);
      
      if (results.length > 0) {
        // Update lab order status to completed
        await this.updateLabOrderStatus(labOrderId, 'Completed');
        
        // Log successful parsing
        console.log(`Successfully parsed ${results.length} results for new lab order ${labOrderId}`);
      } else {
        console.warn(`No patient results were created for lab order ${labOrderId}`);
      }
      
      return {
        success: true,
        results,
        errors: [],
        warnings: []
      };
    } catch (error) {
      console.error('Parse and save for new order error:', error);
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
    
    // Get lab order data to get patient ID and other details
    const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
    const labOrderData = labOrderDoc.data();
    
    if (!labOrderData) {
      console.error('Lab order data not found:', labOrderId);
      return results;
    }
    
    // Get lab data
    const labDoc = await db.collection('labs').doc(labOrderData.labId).get();
    const labData = labDoc.data();
    
    // Create results for each observation in the lab report
    console.log(`Processing ${labReport.observations.length} observations for patient results`);
    
    for (const observation of labReport.observations) {
      console.log(`Looking for metric: "${observation.metricName}"`);
      
      // Find matching metric by name
      const metricsSnapshot = await db.collection('metrics')
        .where('name', '==', observation.metricName)
        .get();
      
      if (!metricsSnapshot.empty) {
        const metricDoc = metricsSnapshot.docs[0];
        console.log(`Found metric: ${metricDoc.id} for "${observation.metricName}"`);
        
        const resultData = {
          patientId: labOrderData.patientId,
          metricId: metricDoc.id,
          metricName: observation.metricName,
          result: observation.result,
          labOrderId: labOrderId,
          labTestId: labTestId,
          labId: labOrderData.labId,
          labName: labData?.name || labReport.labName,
          orderId: labOrderData.orderId,
          orderingProvider: labOrderData.orderingProvider,
          resultDate: observation.observationDate || labReport.reportDate
        };
        
        try {
          const resultId = await ResultService.createResult(resultData);
          console.log(`Created patient result: ${resultId} for metric "${observation.metricName}"`);
          results.push({
            ...resultData,
            id: resultId
          });
        } catch (error) {
          console.error('Error creating patient result:', error);
        }
      } else {
        console.warn(`No metric found for: "${observation.metricName}"`);
      }
    }
    
    return results;
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

