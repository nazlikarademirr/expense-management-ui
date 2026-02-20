import { useAuthentication } from "./AuthenticationProvider";
import routes from "../../constants/routes";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router";

function RequireAuthentication({ children }: { children: React.ReactNode }) {
  const auth = useAuthentication();

  const sessionToken = sessionStorage.getItem("token");

  if (!sessionToken) {
    auth.logout();
    return <Navigate to={routes.login} replace />;
  }

  const payload = jwtDecode(sessionToken);

  if (payload && payload.exp && new Date(payload.exp * 1000) < new Date()) {
    auth.logout();
    toast.error("Your session has expired, please log in again.");
    return <Navigate to={routes.login} replace />;
  }

  return <>{children}</>;
}

export default RequireAuthentication;
