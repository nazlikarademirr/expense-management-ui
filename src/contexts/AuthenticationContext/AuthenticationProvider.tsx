import React, { createContext, useContext, useState } from "react";
import { CurrentUser, TokenDataSchema } from "../../types/authentication.types";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";

interface AuthenticationState {
  currentUser: CurrentUser | null;
  currentUserFullName: string;
  login: (token: string) => CurrentUser;
  logout(): void;
}

const AuthenticationContext = createContext<AuthenticationState | null>(null);

export const useAuthentication = () => {
  const { t } = useTranslation();
  const context = useContext(AuthenticationContext);

  if (!context)
    throw new Error(t(Dictionary.Authentication.USE_AUTHENTICATION_REQUIRED));

  return context;
};

export function AuthenticationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [currentUserFullName, setCurrentUserFullName] = useState<string>("");

  const login = (token: string) => {
    sessionStorage.setItem("token", token);

    const tokenData = TokenDataSchema.parse(jwtDecode(token));

    const user: CurrentUser = {
      id: tokenData.UserId,
      name: tokenData.Name,
      surname: tokenData.Surname,
      email: tokenData.Email,
      role: tokenData.Role,
      hideExpenses: tokenData.HideExpenses,
      hasTemporaryPassword: tokenData.HasTemporaryPassword,
    };

    sessionStorage.setItem("current-user", JSON.stringify(user));

    setCurrentUser(user);

    setCurrentUserFullName(user ? `${user.name} ${user.surname}` : "");

    return user;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("current-user");
    setCurrentUser(null);
    setCurrentUserFullName("");
  };

  return (
    <AuthenticationContext
      value={{
        currentUser,
        currentUserFullName,
        login,
        logout,
      }}
    >
      {children}
    </AuthenticationContext>
  );
}
