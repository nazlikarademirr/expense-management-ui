import z from "zod/v4";

type AuthenticationRequest = {
  email: string;
  password: string;
};

type AuthenticationResponse = {
  accessToken: string;
};

const TokenDataSchema = z.object({
  UserId: z.string().uuid(),
  Name: z.string(),
  Surname: z.string(),
  Email: z.string(),
  Role: z.string(),
  HideExpenses: z.string(),
  HasTemporaryPassword: z.string(),
});

type CurrentUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  hideExpenses: string;
  hasTemporaryPassword: string;
};

export { TokenDataSchema };
export type { AuthenticationRequest, AuthenticationResponse, CurrentUser };
