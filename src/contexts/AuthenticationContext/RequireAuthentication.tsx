import { useAuthentication } from "./AuthenticationProvider";
import routes from "../../constants/routes";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";

function RequireAuthentication({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const auth = useAuthentication();

  const sessionToken = sessionStorage.getItem("token");

  if (!sessionToken) {
    auth.logout();
    return <Navigate to={routes.login} replace />;
  }

  const payload = jwtDecode(sessionToken);

  if (payload && payload.exp && new Date(payload.exp * 1000) < new Date()) {
    auth.logout();
    toast.error(t(Dictionary.Authentication.SESSION_EXPIRED));
    return <Navigate to={routes.login} replace />;
  }

  return <>{children}</>;
}

export default RequireAuthentication;
