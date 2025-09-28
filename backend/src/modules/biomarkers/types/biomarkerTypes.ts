export type BiomarkerResult = string | number | boolean;

export interface Biomarker {
  id: string;
  name: string;
  result: BiomarkerResult;
  createdAt: Date;
}

export interface CreateBiomarkerRequest {
  name: string;
  result: BiomarkerResult;
}

export interface CreateBiomarkerResponse {
  id: string;
  message: string;
}

export interface UpdateBiomarkerRequest {
  name?: string;
  result?: BiomarkerResult;
}
