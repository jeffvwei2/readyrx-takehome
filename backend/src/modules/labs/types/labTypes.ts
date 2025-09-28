import { InterfaceType, BaseEntity, CreateResponse } from '../../../shared/types/common';

export interface Lab extends BaseEntity {
  name: string;
  interfaceType: InterfaceType;
}

export interface CreateLabRequest {
  name: string;
  interfaceType: InterfaceType;
}

export interface CreateLabResponse extends CreateResponse {}

export interface UpdateLabRequest {
  name?: string;
  interfaceType?: InterfaceType;
}
