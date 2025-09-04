import { OvertimeMember } from "./overtime-member";

type Expense = {
  id: string;
  userId: string;
  projectId: string;
  expenseType: number | null;
  expenseDate: Date;
  totalPrice: number;
  currency: number | null;
  tripDescription: string;
  outOfOffice: boolean;
  reportId: string;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
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
  projectId: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  tripDescription: string;
  outOfOffice: boolean;
  reportId: string;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

export type { Expense, ExpenseRequest, ExpenseResponse };
