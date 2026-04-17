import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type Project = {
  id: string;
  name: string;
  code: string;
  searchText: string;
  isActive: boolean;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ProjectRequest = {
  name: string;
  code: string;
};

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.Project.NAME_MIN_HEIGHT))
    .max(128, t(Dictionary.Project.NAME_MAX_HEIGHT)),
  code: z
    .string()
    .trim()
    .min(2, t(Dictionary.Project.CODE_MIN_HEIGHT))
    .max(128, t(Dictionary.Project.CODE_MAX_HEIGHT)),
});

export default projectSchema;
export type { Project, ProjectRequest };
