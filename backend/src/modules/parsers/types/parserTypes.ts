import { PatientResult, CreatePatientResultRequest } from '../../results/types/resultTypes';
import { MetricResult } from '../../metrics/types/metricTypes';

// Base parser interface
export interface LabDataParser {
  parse(data: string, labOrderId: string, labTestId: string): Promise<ParseResult>;
}

// Parser result structure
export interface ParseResult {
  success: boolean;
  results: CreatePatientResultRequest[];
  errors: string[];
  warnings: string[];
  labReport?: LabReport; // Optional lab report for file uploads
}

// Common lab data structures
export interface LabObservation {
  metricName: string;
  result: MetricResult;
  unit?: string;
  referenceRange?: string;
  status?: string;
  observationDate?: Date;
}

export interface LabReport {
  patientId: string;
  labName: string;
  orderId: number;
  orderingProvider: string;
  reportDate: Date;
  observations: LabObservation[];
}

// HL7 specific types
export interface HL7Message {
  messageType: string;
  messageControlId: string;
  sendingApplication: string;
  sendingFacility: string;
  receivingApplication: string;
  receivingFacility: string;
  messageDateTime: Date;
  segments: HL7Segment[];
}

export interface HL7Segment {
  segmentType: string;
  fields: string[];
}

export interface HL7OBXSegment {
  setId?: string;
  valueType: string;
  observationId: string;
  observationSubId?: string;
  observationValue: string;
  units?: string;
  referenceRange?: string;
  abnormalFlags?: string;
  probability?: string;
  natureOfAbnormalTest?: string;
  observationResultStatus: string;
  effectiveDateTime?: Date;
  userDefinedAccessChecks?: string;
  observationDateTime?: Date;
  producerId?: string;
  responsibleObserver?: string;
  observationMethod?: string;
}

// FHIR specific types
export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'collection' | 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  total?: number;
  link?: FHIRBundleLink[];
  entry: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRResource;
  search?: FHIRBundleSearch;
  request?: FHIRBundleRequest;
  response?: FHIRBundleResponse;
}

export interface FHIRBundleLink {
  relation: string;
  url: string;
}

export interface FHIRBundleSearch {
  mode: 'match' | 'include' | 'outcome';
  score?: number;
}

export interface FHIRBundleRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface FHIRBundleResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: FHIRResource;
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
  [key: string]: any;
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FHIRCoding[];
  tag?: FHIRCoding[];
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime?: string;
  effectivePeriod?: FHIRPeriod;
  valueQuantity?: FHIRQuantity;
  valueCodeableConcept?: FHIRCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: FHIRRange;
  valueRatio?: FHIRRatio;
  valueSampledData?: FHIRSampledData;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: FHIRPeriod;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
  period?: FHIRPeriod;
  assigner?: FHIRReference;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>' | 'ad';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
}

export interface FHIRRatio {
  numerator?: FHIRQuantity;
  denominator?: FHIRQuantity;
}

export interface FHIRSampledData {
  origin: FHIRQuantity;
  period: number;
  factor?: number;
  lowerLimit?: number;
  upperLimit?: number;
  dimensions: number;
  data?: string;
}

export interface FHIRObservationReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  type?: FHIRCodeableConcept;
  appliesTo?: FHIRCodeableConcept[];
  age?: FHIRRange;
  text?: string;
}

// Parser configuration
export interface ParserConfig {
  metricMapping: Record<string, string>; // Maps lab codes to metric names
  defaultUnit: string;
  dateFormat: string;
  timezone: string;
}

