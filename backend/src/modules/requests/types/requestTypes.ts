export interface Request {
  id: string;
  labOrderId: string;
  patientId: string;
  labId: string;
  labTestId: string;
  orderId: number;
  orderingProvider: string;
  metrics: string[];
  interfaceType: 'HL7' | 'FHIR';
  file: string; // FHIR JSON or HL7 text content
  createdAt: Date;
}

export interface CreateRequestRequest {
  labOrderId: string;
  patientId: string;
  labId: string;
  labTestId: string;
  orderId: number;
  orderingProvider: string;
  metrics: string[];
  interfaceType: 'HL7' | 'FHIR';
  file: string;
}

export interface CreateRequestResponse {
  id: string;
  message: string;
}

export interface GetRequestsResponse {
  requests: Request[];
}

export interface GetRequestResponse {
  request: Request | null;
}
