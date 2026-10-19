import { z } from "zod/v4";
import Role from "../enums/role";
import { t } from "i18next";
import Dictionary from "../helpers/translation/dictionary";

type User = {
  id: string;
  name: string;
  surname: string;
  teamId: string | null;
  teamName: string;
  title: string;
  email: string;
  role: string;
  hideExpenses: boolean;
  temporaryPassword: string | null;
  hasTemporaryPassword: boolean;
  isActive: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type UserRequest = {
  name: string;
  surname: string;
  teamId: string;
  title: string;
  email: string;
  role: number;
  hideExpenses: boolean;
  temporaryPassword: string | null;
  hasTemporaryPassword: boolean;
  isActive: boolean;
};

type UserResponse = {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  teamName: string;
  title: string;
  email: string;
  role: number;
  hideExpenses: boolean;
  temporaryPassword: string | null;
  hasTemporaryPassword: boolean;
  isActive: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t(Dictionary.User.NAME_MIN_LENGTH))
    .max(128, t(Dictionary.User.NAME_MAX_LENGTH)),
  surname: z
    .string()
    .trim()
    .min(2, t(Dictionary.User.SURNAME_MIN_LENGTH))
    .max(128, t(Dictionary.User.SURNAME_MAX_LENGTH)),
  teamId: z
    .string()
    .nullable()
    .refine((value) => value !== null, {
      message: t(Dictionary.User.TEAM_MUST_BE_SELECTED),
    }),
  title: z
    .string()
    .trim()
    .min(2, t(Dictionary.User.TITLE_MIN_LENGTH))
    .max(128, t(Dictionary.User.TITLE_MAX_LENGTH)),
  email: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!val.endsWith("@acibadem.com")) {
        ctx.addIssue({
          code: "custom",
          message: t(Dictionary.User.EMAIL_RULE),
        });
        return;
      }

      if (val.length < 14) {
        ctx.addIssue({
          code: "custom",
          message: t(Dictionary.User.EMAIL_MIN_LENGTH),
        });
        return;
      }

      if (val.length > 128) {
        ctx.addIssue({
          code: "custom",
          message: t(Dictionary.User.EMAIL_MAX_LENGTH),
        });
      }
    }),
  role: z.enum(Role, t(Dictionary.User.ROLE_MUST_BE_SELECTED)),
});

export default userSchema;
export type { User, UserRequest, UserResponse };
