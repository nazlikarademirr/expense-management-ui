import { z } from "zod/v4";
import Gender from "../enums/gender";
import Role from "../enums/role";

type User = {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  teamName: string;
  gender: string;
  cardNumber: string;
  email: string;
  password: string;
  role: string;
  searchText: string;
  isActive: boolean;
  createUser: string;
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
  searchText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 letters.")
    .max(128, "Name cannot exceed 128 characters."),
  surname: z
    .string()
    .trim()
    .min(2, "Surname must have at least 2 letters.")
    .max(128, "Surname cannot exceed 128 characters."),
  teamId: z.string("Team must be selected."),
  gender: z.enum(Gender, "Gender must be selected."),
  cardNumber: z
    .string()
    .trim()
    .min(1, "Card number cannot be empty.")
    .max(8, "Card number cannot exceed 8 characters."),
  email: z
    .email()
    .trim()
    .refine((v) => v.includes("@acibadem.com"), {
      message: "Please enter a valid email address.",
    })
    .min(14, "Email must have at least 14 letters.")
    .max(128, "Email cannot exceed 128 characters."),
  password: z
    .string()
    .trim()
    .min(8, "Password cannot be less than 8 characters.")
    .max(32, "Password cannot exceed 32 characters."),
  role: z.enum(Role, "Role must be selected."),
});

export default userSchema;
export type { User, UserRequest, UserResponse };
