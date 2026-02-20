import { useAuth } from "./AuthProvider";
import routes from "./constants/routes";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router";

function RequireAuthentication({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const sessionToken = sessionStorage.getItem("token");

  if (sessionToken === "") return <Navigate to={routes.login} replace />;

  if (!sessionToken) {
    auth.logout();
    toast.error("Please log in.");
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
