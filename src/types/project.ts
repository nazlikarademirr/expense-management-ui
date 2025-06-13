type Project = {
  id: string;
  name: string;
  code: string;
  searchText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

type ProjectRequest = {
  name: string;
  code: string;
};

type ProjectResponse = {
  id: string;
  name: string;
  code: string;
  searchText: string;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

export type { Project, ProjectRequest, ProjectResponse };
