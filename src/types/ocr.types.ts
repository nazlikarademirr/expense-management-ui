export interface OcrResult {
  date: string | null;
  totalPrice: string | null;
  rawText: string[];
  confidence: number;
}

export interface OcrError {
  message: string;
  status: number | null;
}

export type OcrStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";
