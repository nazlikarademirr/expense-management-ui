import { useTranslation } from "react-i18next";
import { OcrResult, OcrStatus } from "../../types/ocr.types";
import styles from "./OcrStatusBanner.module.css";
import Dictionary from "../../helpers/translation/dictionary";
import { FiAlertTriangle } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { Alert, Flex, Text } from "@mantine/core";

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
      <Alert
        icon={<FiAlertTriangle size={18} />}
        color="red"
        variant="light"
        radius="md"
        role="alert"
      >
        {error}
      </Alert>
    );
  }

  if (status === "success" && result) {
    const lowConf = result.confidence > 0 && result.confidence < 0.7;

    return (
      <Flex
        className={`${styles.banner} ${lowConf ? styles.warn : styles.success}`}
        role={lowConf ? "alert" : "status"}
        align="center"
        justify="space-between"
        gap={8}
      >
        <Flex align="center" gap={5}>
          {lowConf ? (
            <FiAlertTriangle size={15} style={{ marginTop: 3 }} />
          ) : (
            <TiTick color="green" size={20} />
          )}

          <Text size="sm">
            {lowConf ? t(Dictionary.Expense.TEXT_NOT_DETECTED) : ""}
          </Text>
        </Flex>

        {!lowConf && (
          <Text className={styles.conf}>
            {t(Dictionary.Expense.ACCURACY_RATE)} %
            {Math.round(result.confidence * 100)}
          </Text>
        )}
      </Flex>
    );
  }

  return null;
}

export default OcrStatusBanner;
