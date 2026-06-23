import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type Report = {
  id: string;
  name: string;
  isApproved: boolean;
  isAbroad: boolean;
  title?: string;
  department?: string;
  requestedAdvanceAmount?: string;
  travelPlace?: string;
  departureAndReturnDates?: string;
  purposeOfTravel?: string;
  advanceReceivedAmount?: number | null;
  advanceReceivedAmountCurrency?: string | null;
  amountToBeRefunded?: number | null;
  amountToBeRefundedCurrency?: string | null;
  amountToBePaid?: number | null;
  amountToBePaidCurrency?: string | null;
  declarant?: string;
  departmentManager?: string;
  departmentHead?: string;
  financeOfficer?: string;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ReportRequest = {
  name: string;
  isApproved: boolean;
  isAbroad: boolean;
  title?: string;
  department?: string;
  requestedAdvanceAmount?: string;
  travelPlace?: string;
  departureAndReturnDates?: string;
  purposeOfTravel?: string;
  advanceReceivedAmount?: number | null;
  advanceReceivedAmountCurrency?: string | null;
  amountToBeRefunded?: number | null;
  amountToBeRefundedCurrency?: string | null;
  amountToBePaid?: number | null;
  amountToBePaidCurrency?: string | null;
  declarant?: string;
  departmentManager?: string;
  departmentHead?: string;
  financeOfficer?: string;
};

const reportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.Report.NAME_MIN_LENGTH))
    .max(128, t(Dictionary.Report.NAME_MAX_LENGTH)),
});

export default reportSchema;
export type { Report, ReportRequest };
