import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";
import { loginApi } from "../services/apiClient";

interface AppContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const apiUser = await loginApi(email, password);
    const user = {
      ...apiUser,
      avatarInitials: apiUser.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      };
      setUser(user);
      return user;
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
