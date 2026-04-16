import { BrowserRouter, Routes, Route } from "react-router";
import Main from "./layout/Main";
import Users from "./pages/Users/Users";
import routes from "./constants/routes";
import Teams from "./pages/Teams/Teams";
import Projects from "./pages/Projects/Projects";
import Expenses from "./pages/Expenses/Expenses";
import Reports from "./pages/Reports/Reports";
import Login from "./pages/Login/Login";
import { useEffect } from "react";
import { useAuthentication } from "./contexts/AuthenticationContext/AuthenticationProvider";
import RequireAuthentication from "./contexts/AuthenticationContext/RequireAuthentication";

function AppRouter() {
  const auth = useAuthentication();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("current-user");
    const sessionToken = sessionStorage.getItem("token");

    if (!auth.currentUser && sessionUser && sessionToken) {
      auth.login(sessionToken);
    }
  }, []);

  return (
    <BrowserRouter basename="/expense-management">
      <Routes>
        <Route
          path={routes.users}
          element={
            <RequireAuthentication>
              <Main>
                <Users />
              </Main>
            </RequireAuthentication>
          }
        />
        <Route
          path={routes.teams}
          element={
            <RequireAuthentication>
              <Main>
                <Teams />
              </Main>
            </RequireAuthentication>
          }
        />
        <Route
          path={routes.projects}
          element={
            <RequireAuthentication>
              <Main>
                <Projects />
              </Main>
            </RequireAuthentication>
          }
        />
        <Route
          path={routes.expenses}
          element={
            <RequireAuthentication>
              <Main>
                <Expenses />
              </Main>
            </RequireAuthentication>
          }
        />
        <Route
          path={routes.reports}
          element={
            <RequireAuthentication>
              <Main>
                <Reports />
              </Main>
            </RequireAuthentication>
          }
        />

        <Route path={routes.login} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
