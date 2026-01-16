type User = {
  id: string;
  name: string;
  surname: string;
  teamId: string | null;
  teamName: string;
  gender: string;
  cardNumber: string;
  email: string;
  password: string;
  role: string;
  searchText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

type UserRequest = {
  name: string;
  surname: string;
  teamId: string;
  gender: number;
  cardNumber: string;
  email: string;
  password: string;
  role: number;
};

type UserResponse = {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  teamName: string;
  gender: number;
  cardNumber: string;
  email: string;
  password: string;
  role: number;
  searchText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

export type { User, UserRequest, UserResponse };
