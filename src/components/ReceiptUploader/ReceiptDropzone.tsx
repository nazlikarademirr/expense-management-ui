import { useCallback, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import styles from "./ReceiptDropzone.module.css";
import { OcrStatus } from "../../types/ocr.types";
import Dictionary from "../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";

interface Props {
  status: OcrStatus;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  onReset: () => void;
}

function ReceiptDropzone({ status, onFileSelect, previewUrl, onReset }: Props) {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = "";
    },
    [onFileSelect],
  );

  const isLoading = status === "uploading" || status === "processing";

  return (
    <div
      className={`${styles.dropzone} ${isLoading ? styles.loading : ""} ${previewUrl ? styles.hasPreview : ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !previewUrl && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {previewUrl ? (
        <div className={styles.previewContainer}>
          <img src={previewUrl} className={styles.preview} />
          {isLoading && (
            <div className={styles.overlay}>
              <div className={styles.spinner} />
              <span>
                {status === "uploading"
                  ? t(Dictionary.Common.LOADING)
                  : t(Dictionary.Expense.PHOTO_PROCESSING)}
              </span>
            </div>
          )}
          {!isLoading && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              aria-label={t(Dictionary.Expense.REMOVE_IMAGE)}
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.icon}>🧾</span>
          <p>{t(Dictionary.Expense.RECEIPT_UPLOADER)}</p>
          <span className={styles.sub}>
            {t(Dictionary.Expense.RECEIPT_SELECT)}
          </span>
        </div>
      )}
    </div>
  );
}

export default ReceiptDropzone;
