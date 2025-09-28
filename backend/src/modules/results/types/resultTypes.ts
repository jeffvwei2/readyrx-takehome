import { MetricResult } from '../../metrics/types/metricTypes';

export interface PatientResult {
  id: string;
  patientId: string;
  metricId: string;
  metricName: string;
  result: MetricResult;
  labOrderId: string;
  labTestId: string;
  labId: string;
  labName: string;
  orderId: number;
  orderingProvider: string;
  resultDate: Date;
  createdAt: Date;
}

export interface CreatePatientResultRequest {
  patientId: string;
  metricId: string;
  metricName: string;
  result: MetricResult;
  labOrderId: string;
  labTestId: string;
  labId: string;
  labName: string;
  orderId: number;
  orderingProvider: string;
  resultDate: Date;
}

export interface CreatePatientResultResponse {
  id: string;
  message: string;
}

export interface UpdatePatientResultRequest {
  patientId?: string;
  metricId?: string;
  metricName?: string;
  result?: MetricResult;
  labOrderId?: string;
  labTestId?: string;
  labId?: string;
  labName?: string;
  orderId?: number;
  orderingProvider?: string;
  resultDate?: Date;
}

// Query interfaces for specialized patient queries
export interface PatientMetricHistory {
  metricId: string;
  metricName: string;
  results: Array<{
    id: string;
    result: MetricResult;
    resultDate: Date;
    labName: string;
    orderingProvider: string;
    orderId: number;
  }>;
}

export interface PatientResultsSummary {
  patientId: string;
  totalResults: number;
  uniqueMetrics: number;
  dateRange: {
    earliest: Date;
    latest: Date;
  };
  metrics: PatientMetricHistory[];
}

export interface MetricTrendData {
  metricId: string;
  metricName: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent?: number;
  latestValue: MetricResult;
  previousValue?: MetricResult;
  latestDate: Date;
  previousDate?: Date;
}
