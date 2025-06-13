interface Urls {
  user: string;
  team: string;
  project: string;
  expense: string;
  report: string;
  expenseExcel: string;
}

const urls: Urls = {
  user: "https://localhost:7004/api/user",
  team: "https://localhost:7004/api/team",
  project: "https://localhost:7004/api/project",
  expense: "https://localhost:7165/api/expense",
  report: "https://localhost:7214/api/report",
  expenseExcel: "https://localhost:7214/api/expense-excel",
} as const;

export default urls;
