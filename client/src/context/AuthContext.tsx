import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "../types";
import { api } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("techprep_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const persist = useCallback((token: string, user: User) => {
    localStorage.setItem("techprep_token", token);
    localStorage.setItem("techprep_user", JSON.stringify(user));
    setUser(user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      persist(res.token, res.user);
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await api.register(email, password);
      persist(res.token, res.user);
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("techprep_token");
    localStorage.removeItem("techprep_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
