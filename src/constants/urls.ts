interface Urls {
  user: string;
  team: string;
  project: string;
  userPassword: string;
  temporaryPassword: string;
  expense: string;
  expenseBulkDelete: string;
  report: string;
  reportBulkDelete: string;
  expenseExcel: string;
  login: string;
}

// const urls: Urls = {
//   user: "https://10.150.0.73/expense/company-service/api/user",
//   team: "https://10.150.0.73/expense/company-service/api/team",
//   project: "https://10.150.0.73/expense/company-service/api/project",
//   userPassword: "https://10.150.0.73/expense/company-service/api/user-password",
//   temporaryPassword:
//     "https://10.150.0.73/expense/company-service/api/temporary-password",
//   expense: "https://10.150.0.73/expense/expense-service/api/expense",
//   expenseBulkDelete:
//     "https://10.150.0.73/expense/expense-service/api/expense/bulk-delete",
//   report: "https://10.150.0.73/expense/report-service/api/report",
//   reportBulkDelete:
//     "https://10.150.0.73/expense/report-service/api/report/bulk-delete",
//   expenseExcel: "https://10.150.0.73/expense/report-service/api/expense-excel",
//   login: "https://10.150.0.73/expense/core-service/api/authenticate",
// } as const;

const origin =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

const urls: Urls = {
  user: `${origin}/company-service/api/user`,
  team: `${origin}/company-service/api/team`,
  project: `${origin}/company-service/api/project`,
  userPassword: `${origin}/company-service/api/user-password`,
  temporaryPassword: `${origin}/company-service/api/temporary-password`,
  expense: `${origin}/expense-service/api/expense`,
  expenseBulkDelete: `${origin}/expense-service/api/expense/bulk-delete`,
  report: `${origin}/report-service/api/report`,
  reportBulkDelete: `${origin}/report-service/api/report/bulk-delete`,
  expenseExcel: `${origin}/report-service/api/expense-excel`,
  login: `${origin}/core-service/api/authenticate`,
} as const;

export default urls;
