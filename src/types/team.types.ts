import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type Team = {
  id: string;
  name: string;
  searchText: string;
  isActive: boolean;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type TeamRequest = {
  name: string;
};

const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.Team.NAME_MIN_HEIGHT))
    .max(128, t(Dictionary.Team.NAME_MAX_HEIGHT)),
});

export default teamSchema;
export type { Team, TeamRequest };
