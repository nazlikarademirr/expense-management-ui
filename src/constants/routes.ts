interface Routes {
  home: string;
  users: string;
  teams: string;
  projects: string;
  expenses: string;
  reports: string;
  expenseExcel: string;
}

const routes: Routes = {
  home: "/",
  users: "/users",
  teams: "/teams",
  projects: "/projects",
  expenses: "/expenses",
  reports: "/reports",
  expenseExcel: "/expense-excel",
} as const;

export default routes;
