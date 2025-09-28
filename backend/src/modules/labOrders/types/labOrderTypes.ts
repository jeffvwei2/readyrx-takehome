import { BaseEntity, CreateResponse } from '../../../shared/types/common';

export type LabOrderStatus = 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';

export interface LabOrder extends BaseEntity {
  name: string;
  patientId: string;
  orderId: number;
  labId: string;
  labName: string;
  labTestId: string;
  status: LabOrderStatus;
  orderingProvider: string;
  orderedDate: Date;
  inProgressDate?: Date;
  completedDate?: Date;
  cancelledDate?: Date;
}

export interface CreateLabOrderRequest {
  name: string;
  patientId: string;
  orderId: number;
  labId: string;
  labTestId: string;
  orderingProvider: string;
  status?: LabOrderStatus;
  completedDate?: Date;
}

export interface CreateLabOrderResponse extends CreateResponse {}

export interface UpdateLabOrderRequest {
  name?: string;
  patientId?: string;
  orderId?: number;
  labId?: string;
  labTestId?: string;
  status?: LabOrderStatus;
  orderingProvider?: string;
}

// Extended interface for responses that include full related data
export interface LabOrderWithDetails extends LabOrder {
  patient: {
    id: string;
    name: string;
    email: string;
    insurance: string;
  };
  lab: {
    id: string;
    name: string;
    interfaceType: string;
  };
  labTest: {
    id: string;
    name: string;
    metricIds: string[];
  };
}
