import { BaseEntity, CreateResponse } from '../../../shared/types/common';

export interface LabTest extends BaseEntity {
  name: string;
  metricIds: string[];
  codes: string[]; // LOINC codes
}

export interface CreateLabTestRequest {
  name: string;
  metricIds?: string[];
  codes?: string[]; // LOINC codes
}

export interface CreateLabTestResponse extends CreateResponse {}

export interface UpdateLabTestRequest {
  name?: string;
  metricIds?: string[];
  codes?: string[]; // LOINC codes
}

// Extended interface for responses that include full metric data
export interface LabTestWithMetrics extends LabTest {
  metrics: Array<{
    id: string;
    name: string;
    result: string | number | boolean;
  }>;
}
