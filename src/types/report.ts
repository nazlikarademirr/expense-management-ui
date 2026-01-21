type Report = {
  id: string;
  name: string;
  isApproved: boolean;
  searchText: string;
  createUser: string;
  createDate: Date;
};

type ReportRequest = {
  name: string;
  isApproved: boolean;
};

export type { Report, ReportRequest };
