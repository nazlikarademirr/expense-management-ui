import { useCallback, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import styles from "./ReceiptDropzone.module.css";
import { OcrStatus } from "../../types/ocr.types";
import Dictionary from "../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";
import { ActionIcon, Flex, Image, Loader, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { MdOutlineReceiptLong } from "react-icons/md";

interface Props {
  status: OcrStatus;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  onReset: () => void;
  isUnreadable?: boolean;
}

function ReceiptDropzone({
  status,
  onFileSelect,
  previewUrl,
  onReset,
  isUnreadable,
}: Props) {
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
    <Flex
      className={`${styles.dropzone} ${
        isLoading ? styles.loading : ""
      } ${previewUrl ? styles.hasPreview : ""}`}
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
        <Flex className={styles.previewContainer} pos="relative">
          <Image src={previewUrl} className={styles.preview} />

          {isUnreadable && (
            <div className={styles.unreadableOverlay}>
              <Text fw={500} size="md" className={styles.unreadableText}>
                {t(Dictionary.Expense.TEXT_COULD_NOT_BE_DETECTED)}
              </Text>
            </div>
          )}

          {isLoading && (
            <Flex
              className={styles.overlay}
              direction="column"
              align="center"
              justify="center"
              gap="xs"
            >
              <Loader size="sm" />

              <Text size="sm">
                {status === "uploading"
                  ? t(Dictionary.Common.LOADING)
                  : t(Dictionary.Expense.PHOTO_PROCESSING)}
              </Text>
            </Flex>
          )}

          {!isLoading && (
            <ActionIcon
              type="button"
              className={styles.resetBtn}
              aria-label={t(Dictionary.Expense.REMOVE_IMAGE)}
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Flex>
      ) : (
        <Flex
          className={styles.placeholder}
          direction="column"
          align="center"
          justify="center"
          gap={4}
        >
          <Text size="xl">
            <MdOutlineReceiptLong size={30} />
          </Text>

          <Text>{t(Dictionary.Expense.RECEIPT_UPLOADER)}</Text>

          <Text size="sm" c="dimmed" className={styles.sub}>
            {t(Dictionary.Expense.RECEIPT_SELECT)}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}

export default ReceiptDropzone;
