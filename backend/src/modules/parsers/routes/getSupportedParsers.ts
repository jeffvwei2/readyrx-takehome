import { Request, Response } from 'express';
import { ParserService } from '../services/parserService';

export const getSupportedParsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const supportedParsers = await ParserService.getSupportedParsers();
    res.json({
      supportedParsers,
      descriptions: {
        HL7: 'Health Level 7 messaging standard for healthcare data exchange',
        FHIR: 'Fast Healthcare Interoperability Resources - modern healthcare data standard',
        JSON: 'Simple JSON format for lab data (future implementation)'
      }
    });
  } catch (error) {
    console.error('Error getting supported parsers:', error);
    res.status(500).json({ error: 'Failed to get supported parsers' });
  }
};

