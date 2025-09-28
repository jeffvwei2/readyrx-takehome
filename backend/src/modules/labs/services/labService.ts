import { getAllLabs as getAllLabsService } from './getAllLabs';
import { createLab as createLabService } from './createLab';
import { getLabById as getLabByIdService } from './getLabById';
import { updateLab as updateLabService } from './updateLab';
import { deleteLab as deleteLabService } from './deleteLab';

export class LabService {
  static async getAllLabs() {
    return getAllLabsService();
  }

  static async createLab(name: string, interfaceType: string) {
    return createLabService(name, interfaceType);
  }

  static async getLabById(id: string) {
    return getLabByIdService(id);
  }

  static async updateLab(id: string, updates: any) {
    return updateLabService(id, updates);
  }

  static async deleteLab(id: string) {
    return deleteLabService(id);
  }
}
