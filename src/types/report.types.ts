import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type Report = {
  id: string;
  name: string;
  isAbroad: boolean;
  title: string | null;
  department: string | null;
  requestedAdvanceAmount: string | null;
  travelPlace: string | null;
  departureAndReturnDates: string | null;
  purposeOfTravel: string | null;
  advanceReceivedAmount: number | null;
  advanceReceivedAmountCurrency: string | null;
  amountToBeRefunded: number | null;
  amountToBeRefundedCurrency: string | null;
  amountToBePaid: number | null;
  amountToBePaidCurrency: string | null;
  declarant: string | null;
  departmentManager: string | null;
  departmentHead: string | null;
  financeOfficer: string | null;
  tlIban: string | null;
  eurIban: string | null;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ReportRequest = {
  name: string;
  isAbroad: boolean;
  title: string | null;
  department: string | null;
  requestedAdvanceAmount: string | null;
  travelPlace: string | null;
  departureAndReturnDates: string | null;
  purposeOfTravel: string | null;
  advanceReceivedAmount: number | null;
  advanceReceivedAmountCurrency: string | null;
  amountToBeRefunded: number | null;
  amountToBeRefundedCurrency: string | null;
  amountToBePaid: number | null;
  amountToBePaidCurrency: string | null;
  declarant: string | null;
  departmentManager: string | null;
  departmentHead: string | null;
  financeOfficer: string | null;
  tlIban: string | null;
  eurIban: string | null;
};

const reportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.Report.NAME_MIN_LENGTH))
    .max(128, t(Dictionary.Report.NAME_MAX_LENGTH)),
  tlIban: z
    .string()
    .nullable()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return val.replace(/\s/g, "").length === 26;
    }, t(Dictionary.AbroadReport.INVALID_IBAN)),
  eurIban: z
    .string()
    .nullable()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return val.replace(/\s/g, "").length === 26;
    }, t(Dictionary.AbroadReport.INVALID_IBAN)),
});

export default reportSchema;
export type { Report, ReportRequest };
