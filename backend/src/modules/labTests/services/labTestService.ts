import { getAllLabTests as getAllLabTestsService } from './getAllLabTests';
import { createLabTest as createLabTestService } from './createLabTest';
import { getLabTestById as getLabTestByIdService } from './getLabTestById';
import { updateLabTest as updateLabTestService } from './updateLabTest';
import { deleteLabTest as deleteLabTestService } from './deleteLabTest';

export class LabTestService {
  static async getAllLabTests() {
    return getAllLabTestsService();
  }

  static async createLabTest(name: string, metricIds: string[] = [], codes: string[] = []) {
    return createLabTestService(name, metricIds, codes);
  }

  static async getLabTestById(id: string) {
    return getLabTestByIdService(id);
  }

  static async updateLabTest(id: string, updates: any) {
    return updateLabTestService(id, updates);
  }

  static async deleteLabTest(id: string) {
    return deleteLabTestService(id);
  }
}
