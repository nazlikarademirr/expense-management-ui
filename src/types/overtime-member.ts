type OvertimeMember = {
  id: string;
  userId: string | null;
  userFullName: string;
  expenseId: string;
  price: number;
  createUser: string;
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
  createDate: Date;
};

export type { OvertimeMember, OvertimeMemberRequest, OvertimeMemberResponse };
