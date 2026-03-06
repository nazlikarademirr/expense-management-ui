import z from "zod/v4";

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
  id: string | undefined;
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
    .min(1, "Email cannot be empty.")
    .refine((v) => v.includes("@acibadem.com"), {
      message: "Please enter your Acıbadem email address.",
    }),
  password: z.string().trim().min(1, "Password cannot be empty."),
});

export { authenticationRequestSchema, TokenDataSchema };
export type { AuthenticationRequest, AuthenticationResponse, CurrentUser };
