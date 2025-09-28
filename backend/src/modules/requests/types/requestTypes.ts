import { InterfaceType, BaseEntity, CreateResponse } from '../../../shared/types/common';

export interface Request extends BaseEntity {
  labOrderId: string;
  patientId: string;
  labId: string;
  labTestId: string;
  orderId: number;
  orderingProvider: string;
  metrics: string[];
  interfaceType: InterfaceType;
  file: string; // FHIR JSON or HL7 text content
}

export interface CreateRequestRequest {
  labOrderId: string;
  patientId: string;
  labId: string;
  labTestId: string;
  orderId: number;
  orderingProvider: string;
  metrics: string[];
  interfaceType: InterfaceType;
  file: string;
}

export interface CreateRequestResponse extends CreateResponse {}

export interface GetRequestsResponse {
  requests: Request[];
}

export interface GetRequestResponse {
  request: Request | null;
}
