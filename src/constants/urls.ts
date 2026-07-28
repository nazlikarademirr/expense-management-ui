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

const urls: Urls = {
  user: "https://localhost:7004/api/user",
  team: "https://localhost:7004/api/team",
  project: "https://localhost:7004/api/project",
  userPassword: "https://localhost:7004/api/user-password",
  temporaryPassword: "https://localhost:7004/api/temporary-password",
  expense: "https://localhost:7165/api/expense",
  expenseBulkDelete: "https://localhost:7165/api/expense/bulk-delete",
  report: "https://localhost:7214/api/report",
  reportBulkDelete: "https://localhost:7214/api/report/bulk-delete",
  expenseExcel: "https://localhost:7214/api/expense-excel",
  login: "https://localhost:7192/api/authenticate",
} as const;

export default urls;
