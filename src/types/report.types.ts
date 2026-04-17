import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type Report = {
  id: string;
  name: string;
  isApproved: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ReportRequest = {
  name: string;
  isApproved: boolean;
};

const reportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.Report.NAME_MIN_LENGTH))
    .max(128, t(Dictionary.Project.NAME_MAX_LENGTH)),
});

export default reportSchema;
export type { Report, ReportRequest };
