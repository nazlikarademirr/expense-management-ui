type Report = {
  id: string;
  name: string;
  lastReportDate: Date;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

type ReportRequest = {
  name: string;
};

type ReportResponse = {
  id: string;
  name: string;
  lastReportDate: Date;
  isActive: boolean;
  createUser: string;
  createDate: Date;
};

export type { Report, ReportRequest, ReportResponse };
