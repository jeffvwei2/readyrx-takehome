import { getAllResults as getAllResultsService } from './getAllResults';
import { createResult as createResultService } from './createResult';
import { getResultById as getResultByIdService } from './getResultById';
import { updateResult as updateResultService } from './updateResult';
import { deleteResult as deleteResultService } from './deleteResult';
import { getPatientResults as getPatientResultsService } from './getPatientResults';
import { getPatientResultsByMetricName as getPatientResultsByMetricNameService } from './getPatientResultsByMetricName';
import { getPatientMetricHistory as getPatientMetricHistoryService } from './getPatientMetricHistory';
import { getPatientResultsSummary as getPatientResultsSummaryService } from './getPatientResultsSummary';
import { getPatientResultsByDateRange as getPatientResultsByDateRangeService } from './getPatientResultsByDateRange';
import { populateResultsFromLabOrder as populateResultsFromLabOrderService } from './populateResultsFromLabOrder';
import { CreatePatientResultRequest } from '../types/resultTypes';

export class ResultService {
  static async getAllResults() {
    return getAllResultsService();
  }

  static async createResult(resultData: CreatePatientResultRequest) {
    return createResultService(resultData);
  }

  static async getResultById(id: string) {
    return getResultByIdService(id);
  }

  static async updateResult(id: string, updates: any) {
    return updateResultService(id, updates);
  }

  static async deleteResult(id: string) {
    return deleteResultService(id);
  }

  // Patient-centric queries
  static async getPatientResults(patientId: string) {
    return getPatientResultsService(patientId);
  }

  static async getPatientResultsByMetricName(patientId: string, metricName: string) {
    return getPatientResultsByMetricNameService(patientId, metricName);
  }

  static async getPatientMetricHistory(patientId: string, metricId: string) {
    return getPatientMetricHistoryService(patientId, metricId);
  }

  static async getPatientResultsSummary(patientId: string) {
    return getPatientResultsSummaryService(patientId);
  }

  static async getPatientResultsByDateRange(patientId: string, startDate: Date, endDate: Date) {
    return getPatientResultsByDateRangeService(patientId, startDate, endDate);
  }

  // Lab order integration
  static async populateResultsFromLabOrder(labOrderId: string) {
    return populateResultsFromLabOrderService(labOrderId);
  }
}
