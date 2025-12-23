interface Routes {
  users: string;
  teams: string;
  projects: string;
  expenses: string;
  reports: string;
}

const routes: Routes = {
  users: "/users",
  teams: "/teams",
  projects: "/projects",
  expenses: "/",
  reports: "/reports",
} as const;

export default routes;
