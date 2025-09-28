import { BaseEntity, CreateResponse } from '../../../shared/types/common';

export interface Patient extends BaseEntity {
  name: string;
  email: string;
  insurance: string;
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  insurance: string;
}

export interface CreatePatientResponse extends CreateResponse {}

export interface UpdatePatientRequest {
  name?: string;
  email?: string;
  insurance?: string;
}
