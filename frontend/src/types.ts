export interface Patient {
  id: string;
  name: string;
  email: string;
  insurance: string;
  createdAt: Date | string | { _seconds: number; _nanoseconds: number }; // Firestore Timestamp, string, or Date
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

// Utility function to convert Firestore Timestamp to JavaScript Date
export const convertFirestoreTimestamp = (timestamp: any): Date => {
  if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
    // Firestore Timestamp format
    return new Date(timestamp._seconds * 1000);
  } else if (typeof timestamp === 'string') {
    // String date format
    return new Date(timestamp);
  } else if (timestamp instanceof Date) {
    // Already a Date object
    return timestamp;
  } else {
    // Fallback to current date
    return new Date();
  }
};

// Lab Order Types
export interface LabOrder {
  id: string;
  name: string;
  orderId: number;
  status: string;
  orderingProvider: string;
  orderedDate: string | { _seconds: number; _nanoseconds: number }; // Firestore Timestamp or string
  completedDate?: string | { _seconds: number; _nanoseconds: number }; // Firestore Timestamp or string
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
  resultDate: string | { _seconds: number; _nanoseconds: number }; // Firestore Timestamp or string
  createdAt: string | { _seconds: number; _nanoseconds: number }; // Firestore Timestamp or string
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
}

// Lab Test Types
export interface LabTest {
  id: string;
  name: string;
  metricIds: string[];
  createdAt: Date | string | { _seconds: number; _nanoseconds: number };
}

// Lab Types
export interface Lab {
  id: string;
  name: string;
  interfaceType: string;
  createdAt: Date | string | { _seconds: number; _nanoseconds: number };
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
