import { OcrResult } from "../types/ocr.types";
import { t } from "i18next";
import Dictionary from "../helpers/translation/dictionary";

const OCR_BASE_URL =
  import.meta.env.VITE_OCR_API_URL ?? "http://10.150.0.73:8000";

export async function extractReceiptData(file: File): Promise<OcrResult> {
  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000);

  try {
    const response = await fetch(`${OCR_BASE_URL}/api/ocr/receipt`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail ?? `Sunucu hatası: ${response.status}`);
    }

    return response.json() as Promise<OcrResult>;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(t(Dictionary.Expense.OCR_REQUEST_TIMED_OUT));
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
