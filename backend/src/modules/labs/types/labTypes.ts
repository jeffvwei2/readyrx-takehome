export type InterfaceType = 'HL7' | 'FHIR' | 'JSON';

export interface Lab {
  id: string;
  name: string;
  interfaceType: InterfaceType;
  createdAt: Date;
}

export interface CreateLabRequest {
  name: string;
  interfaceType: InterfaceType;
}

export interface CreateLabResponse {
  id: string;
  message: string;
}

export interface UpdateLabRequest {
  name?: string;
  interfaceType?: InterfaceType;
}
