type OvertimeMember = {
  id: string;
  userId: string;
  expenseId: string;
  price: number;
  createUser: string;
  createDate: Date;
};

type OvertimeMemberRequest = {
  userId: string;
  expenseId: string;
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
