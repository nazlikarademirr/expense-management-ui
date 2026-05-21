import z from "zod/v4";
import { OvertimeMember } from "./overtime-member.types";
import ExpenseType from "../enums/expense-type";
import CurrencyType from "../enums/currency-type";
import { t } from "i18next";
import Dictionary from "../helpers/translation/dictionary";

type Expense = {
  id: string;
  userId: string | null;
  userFullName: string;
  projectId: string | null;
  projectName: string;
  expenseType: string;
  expenseDate: Date;
  totalPrice: number;
  currency: string | null;
  description: string;
  outOfOffice: boolean;
  reportId: string | null;
  reportName: string;
  isApproved: boolean;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ExpenseRequest = {
  userId: string;
  projectId: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  description: string;
  outOfOffice: boolean;
  reportId: string;
  overtimeMembers: OvertimeMember[];
};

type ExpenseResponse = {
  id: string;
  userId: string;
  userFullName: string;
  projectId: string;
  projectName: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  description: string;
  outOfOffice: boolean;
  reportId: string;
  reportName: string;
  isApproved: boolean;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

const expenseSchema = z
  .object({
    userId: z.string(t(Dictionary.Expense.USER_MUST_BE_SELECTED)),
    projectId: z.string(t(Dictionary.Expense.PROJECT_MUST_BE_SELECTED)),
    expenseType: z.enum(
      ExpenseType,
      t(Dictionary.Expense.TYPE_MUST_BE_SELECTED),
    ),
    expenseDate: z.date(t(Dictionary.Expense.DATE_MUST_BE_SELECTED)),
    totalPrice: z
      .number(t(Dictionary.Expense.TOTAL_PRICE_CANNOT_BE_EMPTY))
      .min(1, t(Dictionary.Expense.TOTAL_PRICE_CANNOT_BE_ZERO)),
    currency: z.enum(
      CurrencyType,
      t(Dictionary.Expense.CURRENCY_MUST_BE_SELECTED),
    ),
    description: z.string().nullish(),
    outOfOffice: z.boolean(t(Dictionary.Expense.OUT_OF_OFFICE_CANNOT_BE_EMPTY)),
  })
  .superRefine((data, ctx) => {
    if (
      data.expenseType === ExpenseType.Transportation ||
      (data.expenseType === ExpenseType.Other && !data.description)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: t(Dictionary.Expense.DESCRIPTION_RULE),
      });
    }
  });

export default expenseSchema;
export type { Expense, ExpenseRequest, ExpenseResponse };
