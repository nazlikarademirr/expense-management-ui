import { useCallback } from "react";
import type { UseFormReturnType } from "@mantine/form";
import { OcrResult } from "../../types/ocr.types";
import styles from "./ReceiptDropzone.module.css";
import useReceiptOcr from "../../hooks/useReceiptOcr";
import ReceiptDropzone from "./ReceiptDropzone";
import { Flex } from "@mantine/core";
import OcrFieldMapper from "./OcrFieldMapper";

interface FieldMapping<TValues> {
  date?: keyof TValues;
  totalPrice?: keyof TValues;
}

interface Props<TValues extends Record<string, unknown>> {
  form: UseFormReturnType<TValues>;
  mapping: FieldMapping<TValues>;
  onOcrComplete?: (result: OcrResult) => void;
  onResetComplete?: () => void;
  clearOnEmpty?: boolean;
}

function ReceiptUploader<TValues extends Record<string, unknown>>({
  form,
  mapping,
  onOcrComplete,
  onResetComplete,
  clearOnEmpty,
}: Props<TValues>) {
  const { status, result, previewUrl, processFile, reset } = useReceiptOcr();

  const handleFile = useCallback(
    async (file: File) => {
      const ocr = await processFile(file);

      if (ocr && onOcrComplete) {
        onOcrComplete(ocr);
      }
    },
    [processFile, onOcrComplete],
  );

  const handleReset = useCallback(() => {
    reset();
    onResetComplete?.();
  }, [reset, onResetComplete]);

  const isUnreadable =
    status === "success" &&
    result &&
    (result.confidence < 0.7 || (!result.date && !result.totalPrice));

  return (
    <Flex direction="column">
      <Flex className={styles.wrapper} direction="column">
        <ReceiptDropzone
          status={status}
          onFileSelect={handleFile}
          previewUrl={previewUrl}
          onReset={handleReset}
          isUnreadable={!!isUnreadable}
        />
      </Flex>

      <OcrFieldMapper
        result={result}
        form={form}
        mapping={mapping}
        clearOnEmpty={clearOnEmpty}
      />
    </Flex>
  );
}

export default ReceiptUploader;
