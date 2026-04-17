import { z } from "zod/v4";
import Gender from "../enums/gender";
import Role from "../enums/role";
import { t } from "i18next";
import Dictionary from "../helpers/translation/dictionary";

type User = {
  id: string;
  name: string;
  surname: string;
  teamId: string | null;
  teamName: string;
  gender: string;
  cardNumber: string;
  email: string;
  password: string;
  role: string;
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
  gender: number;
  cardNumber: string;
  email: string;
  password: string;
  role: number;
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
  gender: number;
  cardNumber: string;
  email: string;
  password: string;
  role: number;
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
    .min(2, t(Dictionary.User.NAME_MIN_HEIGHT))
    .max(128, t(Dictionary.User.NAME_MAX_HEIGHT)),
  surname: z
    .string()
    .trim()
    .min(2, t(Dictionary.User.SURNAME_MIN_HEIGHT))
    .max(128, t(Dictionary.User.SURNAME_MAX_HEIGHT)),
  teamId: z.string().trim().min(1, t(Dictionary.User.TEAM_MUST_BE_SELECTED)),
  gender: z.enum(Gender, t(Dictionary.User.GENDER_MUST_BE_SELECTED)),
  cardNumber: z
    .string()
    .trim()
    .min(1, t(Dictionary.User.CARD_NUMBER_CANNOT_BE_EMPTY))
    .max(8, t(Dictionary.User.CARD_NUMBER_MAX_HEIGHT)),
  email: z
    .email()
    .trim()
    .refine((v) => v.includes("@acibadem.com"), {
      message: t(Dictionary.User.EMAIL_RULE),
    })
    .min(14, t(Dictionary.User.EMAIL_MIN_HEIGHT))
    .max(128, t(Dictionary.User.EMAIL_MAX_HEIGHT)),
  password: z
    .string()
    .trim()
    .min(8, t(Dictionary.User.PASSWORD_MIN_HEIGHT))
    .max(32, t(Dictionary.User.PASSWORD_MAX_HEIGHT))
    .optional(),
  role: z.enum(Role, t(Dictionary.User.ROLE_MUST_BE_SELECTED)),
});

export default userSchema;
export type { User, UserRequest, UserResponse };
