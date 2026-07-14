import z from "zod/v4";
import { OvertimeMember } from "./overtime-member.types";
import ExpenseType from "../enums/expense-type";
import CurrencyType from "../enums/currency-type";
import { t } from "i18next";
import Dictionary from "../helpers/translation/dictionary";

type Expense = {
  id: string;
  declarantId: string | null;
  declarantFullName: string;
  projectId: string | null;
  projectName: string;
  expenseType: string;
  expenseDate: Date;
  totalPrice: number;
  currency: string | null;
  description: string;
  reportId: string;
  reportName: string;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ExpenseRequest = {
  declarantId: string;
  projectId: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  description: string;
  reportId: string;
  overtimeMembers: OvertimeMember[];
};

type ExpenseResponse = {
  id: string;
  declarantId: string;
  declarantFullName: string;
  projectId: string;
  projectName: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  description: string;
  reportId: string;
  reportName: string;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

const expenseSchema = z
  .object({
    declarantId: z.string(t(Dictionary.Expense.DECLARANT_MUST_BE_SELECTED)),
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
  })
  .superRefine((data, ctx) => {
    if (
      (data.expenseType === ExpenseType.Transportation ||
        data.expenseType === ExpenseType.Other) &&
      !data.description
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
