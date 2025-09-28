export interface LabTest {
  id: string;
  name: string;
  metricIds: string[];
  codes: string[]; // LOINC codes
  createdAt: Date;
}

export interface CreateLabTestRequest {
  name: string;
  metricIds?: string[];
  codes?: string[]; // LOINC codes
}

export interface CreateLabTestResponse {
  id: string;
  message: string;
}

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
