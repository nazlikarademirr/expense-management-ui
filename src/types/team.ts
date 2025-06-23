type Team = {
  id: string;
  name: string;
  searchText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

type TeamRequest = {
  name: string;
};

type TeamResponse = {
  id: string;
  name: string;
  searhText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

export type { Team, TeamRequest, TeamResponse };
