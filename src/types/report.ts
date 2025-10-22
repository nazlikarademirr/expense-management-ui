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

type ReportResponse = {
  id: string;
  name: string;
  isApproved: boolean;
  searchText: string;
  createUser: string;
  createDate: Date;
};

export type { Report, ReportRequest, ReportResponse };
