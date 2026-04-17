import { t } from "i18next";
import z from "zod/v4";
import Dictionary from "../helpers/translation/dictionary";

type OvertimeMember = {
  id: string;
  userId: string | null;
  userFullName: string;
  expenseId: string;
  price: number;
  createUserId: string;
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
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

const overtimeMemberSchema = z.object({
  userId: z.string(t(Dictionary.Expense.USER_MUST_BE_SELECTED)),
  price: z
    .number(t(Dictionary.Expense.PRICE_CANNOT_BE_EMPTY))
    .min(1, t(Dictionary.Expense.PRICE_CANNOT_BE_ZERO)),
});

export default overtimeMemberSchema;
export type { OvertimeMember, OvertimeMemberRequest, OvertimeMemberResponse };
