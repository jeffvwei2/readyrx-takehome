import { getAllPatients as getAllPatientsService } from './getAllPatients';
import { createPatient as createPatientService } from './createPatient';
import { getPatientById as getPatientByIdService } from './getPatientById';
import { updatePatient as updatePatientService } from './updatePatient';
import { deletePatient as deletePatientService } from './deletePatient';

export class PatientService {
  static async getAllPatients() {
    return getAllPatientsService();
  }

  static async createPatient(name: string, email: string, insurance: string) {
    return createPatientService(name, email, insurance);
  }

  static async getPatientById(id: string) {
    return getPatientByIdService(id);
  }

  static async updatePatient(id: string, updates: any) {
    return updatePatientService(id, updates);
  }

  static async deletePatient(id: string) {
    return deletePatientService(id);
  }
}
