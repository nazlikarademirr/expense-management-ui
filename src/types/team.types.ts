import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type Team = {
  id: string;
  name: string;
  department: string;
  departmentManager: string | null;
  departmentHead: string | null;
  searchText: string;
  isActive: boolean;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type TeamRequest = {
  name: string;
  department: string;
  departmentManager: string | null;
  departmentHead: string | null;
};

const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.Team.NAME_MIN_LENGTH))
    .max(128, t(Dictionary.Team.NAME_MAX_LENGTH)),
  department: z
    .string()
    .trim()
    .min(2, t(Dictionary.Team.DEPARTMENT_MIN_LENGTH))
    .max(128, t(Dictionary.Team.DEPARTMENT_MAX_LENGTH)),
  departmentManager: z
    .string()
    .trim()
    .max(128, t(Dictionary.Team.DEPARTMENT_MANAGER_MAX_LENGTH))
    .nullable()
    .optional(),
  departmentHead: z
    .string()
    .trim()
    .max(128, t(Dictionary.Team.DEPARTMENT_HEAD_MAX_LENGTH))
    .nullable()
    .optional(),
});

export default teamSchema;
export type { Team, TeamRequest };
