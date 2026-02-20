import React, { createContext, useContext, useState } from "react";
import { CurrentUser, TokenDataSchema } from "./types/authentication.types";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  token: string;
  currentUser: CurrentUser | null;
  login: (token: string) => void;
  logout(): void;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used within an AuthProvider.");

  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const login = (token: string) => {
    sessionStorage.setItem("token", token);

    const tokenData = TokenDataSchema.parse(jwtDecode(token));

    const user = {
      id: tokenData.UserId,
      name: tokenData.Name,
      surname: tokenData.Surname,
      email: tokenData.Email,
    };

    sessionStorage.setItem("current-user", JSON.stringify(user));

    setToken(token);
    setCurrentUser(user);
  };

  const logout = () => {
    sessionStorage.setItem("token", "");
    sessionStorage.setItem("current-user", "");
    setToken("");
    setCurrentUser(null);
  };

  return (
    <AuthContext
      value={{
        token,
        currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
