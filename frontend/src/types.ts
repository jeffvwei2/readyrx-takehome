import { FlexibleDate, convertFirestoreTimestamp } from './utils/dates';

// Re-export for convenience
export type { FlexibleDate };
export { convertFirestoreTimestamp };

export interface Patient {
  id: string;
  name: string;
  email: string;
  insurance: string;
  createdAt: FlexibleDate; // Firestore Timestamp, string, or Date
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  insurance: string;
}

export interface CreatePatientResponse {
  id: string;
  message: string;
}

// Lab Order Types
export interface LabOrder {
  id: string;
  name: string;
  orderId: number;
  status: string;
  orderingProvider: string;
  orderedDate: FlexibleDate; // Firestore Timestamp or string
  completedDate?: FlexibleDate; // Firestore Timestamp or string
  labName: string;
}

// Metric Types
export interface Metric {
  id: string;
  name: string;
  units?: string;
}

// Patient Result Types
export interface PatientResult {
  id: string;
  patientId: string;
  metricId: string;
  metricName: string;
  result: any; // Flexible result type (string, number, boolean, or object)
  units?: string;
  labOrderId: string;
  labTestId: string;
  labId: string;
  labName: string;
  orderId: number;
  orderingProvider: string;
  resultDate: FlexibleDate; // Firestore Timestamp or string
  createdAt: FlexibleDate; // Firestore Timestamp or string
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  orderId: number;
  labName: string;
  provider: string;
  units?: string;
  fullDate?: Date;
  uniqueKey?: string; // Unique identifier for each data point
  displayDate?: string; // More specific date/time for display
}

// Component Prop Types
export interface PatientProfileProps {
  patient: Patient;
}

export interface RecentLabsProps {
  labOrders: LabOrder[];
  loading: boolean;
}

export interface MetricFilterProps {
  patientId: string;
  onMetricSelect: (metricName: string) => void;
  selectedMetric: string;
}

export interface HistoricalChartProps {
  patientId: string;
  metricName: string;
}

export interface PatientFormProps {
  onPatientAdded: () => void;
}

export interface PatientListProps {
  onPatientSelect: (patient: Patient) => void;
}

export interface SidebarProps {
  onPatientSelect: (patient: Patient) => void;
  onRefreshPatients: () => void;
  onLabOrderCreated: () => void;
}

// Lab Test Types
export interface LabTest {
  id: string;
  name: string;
  metricIds: string[];
  createdAt: FlexibleDate;
}

// Lab Types
export interface Lab {
  id: string;
  name: string;
  interfaceType: string;
  createdAt: FlexibleDate;
}

// Lab Order Form Types
export interface LabOrderFormData {
  patientId: string;
  orderingProvider: string;
  labTests: {
    labTestId: string;
    labId: string;
  }[];
}

export interface CreateLabOrderRequest {
  name: string;
  patientId: string;
  orderId: number;
  labId: string;
  labTestId: string;
  orderingProvider: string;
}

export interface CreateLabOrderResponse {
  id: string;
  message: string;
}

export interface LabOrderFormProps {
  onLabOrderCreated: () => void;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileContent: string, fileName: string) => Promise<void>;
  patientId: string;
}


