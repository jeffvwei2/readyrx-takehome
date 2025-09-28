import { getAllLabOrders as getAllLabOrdersService } from './getAllLabOrders';
import { getLabOrdersByPatientId as getLabOrdersByPatientIdService } from './getLabOrdersByPatientId';
import { getLabOrderByOrderIdAndPatientId as getLabOrderByOrderIdAndPatientIdService } from './getLabOrderByOrderIdAndPatientId';
import { createLabOrder as createLabOrderService } from './createLabOrder';
import { getLabOrderById as getLabOrderByIdService } from './getLabOrderById';
import { getLabOrderWithDetails as getLabOrderWithDetailsService } from './getLabOrderWithDetails';
import { updateLabOrder as updateLabOrderService } from './updateLabOrder';
import { deleteLabOrder as deleteLabOrderService } from './deleteLabOrder';

export class LabOrderService {
  static async getAllLabOrders() {
    return getAllLabOrdersService();
  }

  static async getLabOrdersByPatientId(patientId: string) {
    return getLabOrdersByPatientIdService(patientId);
  }

  static async getLabOrderByOrderIdAndPatientId(orderId: number, patientId: string) {
    return getLabOrderByOrderIdAndPatientIdService(orderId, patientId);
  }

  static async createLabOrder(
    name: string,
    patientId: string,
    orderId: number,
    labId: string,
    labTestId: string,
    orderingProvider: string,
    status?: string,
    completedDate?: Date
  ) {
    return createLabOrderService(name, patientId, orderId, labId, labTestId, orderingProvider, status, completedDate);
  }

  static async getLabOrderById(id: string) {
    return getLabOrderByIdService(id);
  }

  static async getLabOrderWithDetails(id: string) {
    return getLabOrderWithDetailsService(id);
  }

  static async updateLabOrder(id: string, updates: any) {
    return updateLabOrderService(id, updates);
  }

  static async deleteLabOrder(id: string) {
    return deleteLabOrderService(id);
  }
}
