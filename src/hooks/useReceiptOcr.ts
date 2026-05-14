import { useState, useCallback } from "react";
import { OcrResult, OcrStatus } from "../types/ocr.types";
import { useTranslation } from "react-i18next";
import Dictionary from "../helpers/translation/dictionary";
import { extractReceiptData } from "../request-handler/ocr-request-handler";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

interface UseReceiptOcrReturn {
  status: OcrStatus;
  result: OcrResult | null;
  error: string | null;
  previewUrl: string | null;
  processFile: (file: File) => Promise<OcrResult | null>;
  reset: () => void;
}

function useReceiptOcr(): UseReceiptOcrReturn {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OcrStatus>("idle");
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const processFile = useCallback(
    async (file: File): Promise<OcrResult | null> => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t(Dictionary.Expense.FILE_UPLOAD_RULE));
        setStatus("error");
        return null;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(
          t(Dictionary.Expense.FILE_SIZE, {
            fileSize: MAX_SIZE_MB,
          }),
        );
        setStatus("error");
        return null;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));

      setStatus("uploading");
      setError(null);
      setResult(null);

      try {
        setStatus("processing");
        const data = await extractReceiptData(file);

        if (data.confidence < 0.5) {
          setError(t(Dictionary.Expense.LOW_IMAGE_QUALITY));
        }

        setResult(data);
        setStatus("success");
        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t(Dictionary.Common.UNEXPECTED_ERROR);
        setError(message);
        setStatus("error");
        return null;
      }
    },
    [previewUrl],
  );

  return { status, result, error, previewUrl, processFile, reset };
}

export default useReceiptOcr;
