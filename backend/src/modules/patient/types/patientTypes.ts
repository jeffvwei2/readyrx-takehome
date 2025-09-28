export interface Patient {
  id: string;
  name: string;
  email: string;
  insurance: string;
  createdAt: Date;
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  insurance: string;
}

export interface CreatePatientResponse {
  id: string;
  message: string;
}

export interface UpdatePatientRequest {
  name?: string;
  email?: string;
  insurance?: string;
}
