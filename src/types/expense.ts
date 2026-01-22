import { OvertimeMember } from "./overtime-member";

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

export type { Expense, ExpenseRequest, ExpenseResponse };
