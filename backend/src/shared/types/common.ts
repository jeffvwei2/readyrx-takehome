// Shared types used across all modules

// Common interface types
export type InterfaceType = 'HL7' | 'FHIR' | 'JSON';

// Common API response patterns
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateResponse {
  id: string;
  message: string;
}

export interface UpdateResponse {
  id: string;
  message: string;
}

export interface DeleteResponse {
  message: string;
}

// Common entity base interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
}

// Common request patterns
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Common Firestore timestamp type
export type FirestoreTimestamp = {
  _seconds: number;
  _nanoseconds: number;
};

// Common date types that can be Firestore timestamp, string, or Date
export type FlexibleDate = Date | string | FirestoreTimestamp;