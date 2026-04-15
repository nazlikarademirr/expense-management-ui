interface Urls {
  user: string;
  team: string;
  project: string;
  userPassword: string;
  temporaryPassword: string;
  expense: string;
  report: string;
  expenseExcel: string;
  login: string;
}

const urls: Urls = {
  user: "https://10.150.0.73/expense/company-service/api/user",
  team: "https://10.150.0.73/expense/company-service/api/team",
  project: "https://10.150.0.73/expense/company-service/api/project",
  userPassword: "https://10.150.0.73/expense/company-service/api/user-password",
  temporaryPassword: "https://10.150.0.73/expense/company-service/api/temporary-password",
  expense: "https://10.150.0.73/expense/expense-service/api/expense",
  report: "https://10.150.0.73/expense/report-service/api/report",
  expenseExcel: "https://10.150.0.73/expense/report-service/api/expense-excel",
  login: "https://10.150.0.73/expense/core-service/api/authenticate",
} as const;

export default urls;
