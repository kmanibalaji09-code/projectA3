import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role, User } from "../types";
import { loginApi } from "../services/apiClient";

interface AppContextValue {
  user: User | null;
  login: (role: Role) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (role: Role) => {
    const credentials = role === "DEVELOPER"
      ? { email: "developer@a3.demo", password: "password123" }
      : { email: "customer@a3.demo", password: "password123" };
    const apiUser = await loginApi(credentials.email, credentials.password);
    setUser({
      ...apiUser,
      avatarInitials: apiUser.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    });
  };

  const logout = () => {
    localStorage.removeItem("a3_access_token");
    setUser(null);
  };

  return <AppContext.Provider value={{ user, login, logout }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
