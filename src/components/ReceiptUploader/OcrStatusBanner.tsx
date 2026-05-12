import { useTranslation } from "react-i18next";
import { OcrResult, OcrStatus } from "../../types/ocr.types";
import styles from "./OcrStatusBanner.module.css";
import Dictionary from "../../helpers/translation/dictionary";

interface Props {
  status: OcrStatus;
  error: string | null;
  result: OcrResult | null;
}

function OcrStatusBanner({ status, error, result }: Props) {
  const { t } = useTranslation();

  if (status === "idle") return null;

  if (status === "error" && error) {
    return (
      <div className={`${styles.banner} ${styles.error}`} role="alert">
        <span>⚠️</span> {error}
      </div>
    );
  }

  if (status === "success" && result) {
    const lowConf = result.confidence > 0 && result.confidence < 0.7;

    return (
      <div
        className={`${styles.banner} ${lowConf ? styles.warn : styles.success}`}
        role="status"
      >
        <span>{lowConf ? "⚠️" : "✅"}</span>
        <span>{lowConf && t(Dictionary.Expense.LOW_RESOLUTION)}</span>
        <span className={styles.conf}>
          {t(Dictionary.Expense.ACCURACY_RATE)} %
          {Math.round(result.confidence * 100)}
        </span>
      </div>
    );
  }

  return null;
}

export default OcrStatusBanner;
