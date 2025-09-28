import { getAllMetrics as getAllMetricsService } from './getAllMetrics';
import { createMetric as createMetricService } from './createMetric';
import { getMetricById as getMetricByIdService } from './getMetricById';
import { getMetricsByIds as getMetricsByIdsService } from './getMetricsByIds';
import { updateMetric as updateMetricService } from './updateMetric';
import { deleteMetric as deleteMetricService } from './deleteMetric';

export class MetricService {
  static async getAllMetrics() {
    return getAllMetricsService();
  }

  static async createMetric(name: string, result: string | number | boolean) {
    return createMetricService(name, result);
  }

  static async getMetricById(id: string) {
    return getMetricByIdService(id);
  }

  static async getMetricsByIds(ids: string[]) {
    return getMetricsByIdsService(ids);
  }

  static async updateMetric(id: string, updates: any) {
    return updateMetricService(id, updates);
  }

  static async deleteMetric(id: string) {
    return deleteMetricService(id);
  }
}
