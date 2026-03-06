import z from "zod/v4";
import { OvertimeMember } from "./overtime-member.types";
import ExpenseType from "../enums/expense-type";
import CurrencyType from "../enums/currency-type";

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
  tripDescription: string;
  outOfOffice: boolean;
  reportId: string | null;
  reportName: string;
  isApproved: boolean;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUser: string;
  createDate: Date;
};

type ExpenseRequest = {
  userId: string;
  projectId: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  tripDescription: string;
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
  tripDescription: string;
  outOfOffice: boolean;
  reportId: string;
  reportName: string;
  isApproved: boolean;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUser: string;
  createDate: Date;
};

const expenseSchema = z
  .object({
    userId: z.string("User must be selected."),
    projectId: z.string("Project must be selected."),
    expenseType: z.enum(ExpenseType, "Expense type must be selected."),
    expenseDate: z.date("Expense date must be selected."),
    totalPrice: z
      .number("Total price cannot be empty.")
      .min(1, "Total price cannot be 0 or less."),
    currency: z.enum(CurrencyType, "Currency must be selected."),
    tripDescription: z.string().nullish(),
    outOfOffice: z.boolean("Out of office cannot be empty."),
  })
  .superRefine((data, ctx) => {
    if (
      data.expenseType === ExpenseType.Transportation &&
      !data.tripDescription
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["tripDescription"],
        message:
          "When the expense type is transportation, the description cannot be left blank.",
      });
    }
  });

export default expenseSchema;
export type { Expense, ExpenseRequest, ExpenseResponse };
