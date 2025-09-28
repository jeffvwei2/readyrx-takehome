import { LabDataParser, ParseResult } from '../types/parserTypes';
import { HL7Parser } from './hl7Parser';
import { FHIRParser } from './fhirParser';

export type ParserType = 'HL7' | 'FHIR' | 'JSON';

export class ParserFactory {
  private static parsers: Map<ParserType, LabDataParser> = new Map();

  static {
    // Initialize parsers
    this.parsers.set('HL7', new HL7Parser());
    this.parsers.set('FHIR', new FHIRParser());
    // JSON parser could be added here in the future
  }

  static getParser(type: ParserType): LabDataParser {
    const parser = this.parsers.get(type);
    if (!parser) {
      throw new Error(`Parser for type '${type}' not found`);
    }
    return parser;
  }

  static getSupportedTypes(): ParserType[] {
    return Array.from(this.parsers.keys());
  }

  static async parseData(
    data: string, 
    parserType: ParserType, 
    labOrderId: string, 
    labTestId: string
  ): Promise<ParseResult> {
    const parser = this.getParser(parserType);
    return await parser.parse(data, labOrderId, labTestId);
  }

  static async parseLabData(
    data: string,
    labOrderId: string,
    labTestId: string
  ): Promise<ParseResult> {
    try {
      // Auto-detect parser type based on data format
      const parserType = this.detectParserType(data);
      return await this.parseData(data, parserType, labOrderId, labTestId);
    } catch (error) {
      return {
        success: false,
        results: [],
        errors: [`Failed to parse lab data: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  private static detectParserType(data: string): ParserType {
    const trimmedData = data.trim();
    
    // Check for HL7 format (starts with MSH|)
    if (trimmedData.startsWith('MSH|')) {
      return 'HL7';
    }
    
    // Check for FHIR format (JSON with Bundle resourceType)
    try {
      const parsed = JSON.parse(trimmedData);
      if (parsed.resourceType === 'Bundle') {
        return 'FHIR';
      }
    } catch {
      // Not JSON, continue checking
    }
    
    // Check for JSON format (valid JSON)
    try {
      JSON.parse(trimmedData);
      return 'JSON';
    } catch {
      // Not JSON
    }
    
    throw new Error('Unable to detect parser type from data format');
  }
}

