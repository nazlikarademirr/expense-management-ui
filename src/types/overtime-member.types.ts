import z from "zod/v4";

type OvertimeMember = {
  id: string;
  userId: string | null;
  userFullName: string;
  expenseId: string;
  price: number;
  createUser: string;
  createUserFullName: string;
  createDate: Date;
};

type OvertimeMemberRequest = {
  userId: string | null;
  expenseId: string;
  price: number;
};

type OvertimeMemberResponse = {
  id: string;
  userId: string;
  userFullName: string;
  expenseId: string;
  price: number;
  createUser: string;
  createUserFullName: string;
  createDate: Date;
};

const overtimeMemberSchema = z.object({
  userId: z.string("User must be selected."),
  price: z
    .number("Price cannot be empty.")
    .min(1, "Price cannot be 0 or less."),
});

export default overtimeMemberSchema;
export type { OvertimeMember, OvertimeMemberRequest, OvertimeMemberResponse };
