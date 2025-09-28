import { getAllBiomarkers as getAllBiomarkersService } from './getAllBiomarkers';
import { createBiomarker as createBiomarkerService } from './createBiomarker';
import { getBiomarkerById as getBiomarkerByIdService } from './getBiomarkerById';
import { getBiomarkersByIds as getBiomarkersByIdsService } from './getBiomarkersByIds';
import { updateBiomarker as updateBiomarkerService } from './updateBiomarker';
import { deleteBiomarker as deleteBiomarkerService } from './deleteBiomarker';

export class BiomarkerService {
  static async getAllBiomarkers() {
    return getAllBiomarkersService();
  }

  static async createBiomarker(name: string, result: string | number | boolean) {
    return createBiomarkerService(name, result);
  }

  static async getBiomarkerById(id: string) {
    return getBiomarkerByIdService(id);
  }

  static async getBiomarkersByIds(ids: string[]) {
    return getBiomarkersByIdsService(ids);
  }

  static async updateBiomarker(id: string, updates: any) {
    return updateBiomarkerService(id, updates);
  }

  static async deleteBiomarker(id: string) {
    return deleteBiomarkerService(id);
  }
}
