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

export type { Team, TeamRequest };
