type OvertimeMember = {
  id: string;
  userId: string | null;
  expenseId: string | null;
  price: number;
  createUser: string;
  createDate: Date;
};

type OvertimeMemberRequest = {
  userId: string | null;
  expenseId: string | null;
  price: number;
};

type OvertimeMemberResponse = {
  id: string;
  userId: string;
  expenseId: string;
  price: number;
  createUser: string;
  createDate: Date;
};

export type { OvertimeMember, OvertimeMemberRequest, OvertimeMemberResponse };
