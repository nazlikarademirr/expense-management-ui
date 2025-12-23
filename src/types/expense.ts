import { OvertimeMember } from "./overtime-member";

type Expense = {
  id: string;
  userId: string | null;
  projectId: string | null;
  expenseType: string;
  expenseDate: Date;
  totalPrice: number;
  currency: string | null;
  tripDescription: string;
  outOfOffice: boolean;
  reportId: string | null;
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
  projectId: string;
  expenseType: number;
  expenseDate: Date;
  totalPrice: number;
  currency: number;
  tripDescription: string;
  outOfOffice: boolean;
  reportId: string;
  isApproved: boolean;
  overtimeMembers: OvertimeMember[];
  isActive: boolean;
  searchText: string;
  createUser: string;
  createDate: Date;
};

export type { Expense, ExpenseRequest, ExpenseResponse };
