interface Routes {
  users: string;
  teams: string;
  projects: string;
  expenses: string;
  reports: string;
  login: string;
}

const routes: Routes = {
  users: "/users",
  teams: "/teams",
  projects: "/projects",
  expenses: "/expenses",
  reports: "/reports",
  login: "/",
} as const;

export default routes;
