import { BrowserRouter, Routes, Route } from "react-router";
import Main from "./layout/Main";
import Transactions from "./pages/Transactions/Transactions";
import Users from "./pages/Users/Users";
import routes from "./constants/routes";
import Teams from "./pages/Teams/Teams";
import Projects from "./pages/Projects/Projects";
import Expenses from "./pages/Expenses/Expenses";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.home}
          element={
            <Main>
              <Transactions />
            </Main>
          }
        />
        <Route
          path={routes.users}
          element={
            <Main>
              <Users />
            </Main>
          }
        />
        <Route
          path={routes.teams}
          element={
            <Main>
              <Teams />
            </Main>
          }
        />
        <Route
          path={routes.projects}
          element={
            <Main>
              <Projects />
            </Main>
          }
        />
        <Route
          path={routes.expenses}
          element={
            <Main>
              <Expenses />
            </Main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
