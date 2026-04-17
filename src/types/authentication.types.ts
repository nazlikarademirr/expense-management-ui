import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";
import { t } from "i18next";

type AuthenticationRequest = {
  email: string;
  password: string;
};

type AuthenticationResponse = {
  accessToken: string;
};

const TokenDataSchema = z.object({
  UserId: z.uuid(),
  Name: z.string(),
  Surname: z.string(),
  Email: z.string(),
  Role: z.string(),
  HasTemporaryPassword: z.string(),
});

type CurrentUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  hasTemporaryPassword: string;
};

const authenticationRequestSchema = z.object({
  email: z
    .email()
    .trim()
    .min(1, t(Dictionary.Login.EMAIL_CANNOT_BE_EMPTY))
    .refine((v) => v.includes("@acibadem.com"), {
      message: t(Dictionary.Login.EMAIL_VALID),
    }),
  password: z
    .string()
    .trim()
    .min(1, t(Dictionary.Login.PASSWORD_CANNOT_BE_EMPTY)),
});

export { authenticationRequestSchema, TokenDataSchema };
export type { AuthenticationRequest, AuthenticationResponse, CurrentUser };
