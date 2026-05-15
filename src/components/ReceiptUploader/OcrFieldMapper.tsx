import { useEffect } from "react";
import type { UseFormReturnType } from "@mantine/form";
import { OcrResult } from "../../types/ocr.types";

type FieldMapping<TValues> = {
  date?: keyof TValues;
  totalPrice?: keyof TValues;
};

interface Props<TValues extends Record<string, unknown>> {
  result: OcrResult | null;
  form: UseFormReturnType<TValues>;
  mapping: FieldMapping<TValues>;
  clearOnEmpty?: boolean;
}

function OcrFieldMapper<TValues extends Record<string, unknown>>({
  result,
  form,
  mapping,
}: Props<TValues>) {
  useEffect(() => {
    if (!result) return;

    if (result.confidence < 0.7) {
      return;
    }

    const nextValues: Partial<TValues> = {};

    const toValidDate = (value: string | null): Date | null => {
      if (!value) return null;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return null;

      return date;
    };

    if (mapping.date) {
      const parsedDate = toValidDate(result.date);

      if (parsedDate) {
        nextValues[mapping.date] = parsedDate as TValues[keyof TValues];
      }
    }

    if (mapping.totalPrice && result.totalPrice) {
      const normalizedTotal = result.totalPrice
        .replace(/\./g, "")
        .replace(",", ".");
      nextValues[mapping.totalPrice] = Number(
        normalizedTotal,
      ) as TValues[keyof TValues];
    }

    form.setValues(nextValues);

    Object.keys(nextValues).forEach((fieldName) => {
      form.validateField(fieldName);
    });
  }, [result]);

  return null;
}

export default OcrFieldMapper;
