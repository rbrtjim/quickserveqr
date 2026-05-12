"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "@/lib/api";

interface User {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("quickserve_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        localStorage.removeItem("quickserve_user");
      }
    }
    setLoading(false);
  }, []);

  const saveUser = (data: User) => {
    setUser(data);
    localStorage.setItem("quickserve_user", JSON.stringify(data));
  };

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password) as User;
    saveUser(data);
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    const data = await apiRegister(email, password, fullName, role) as User;
    saveUser(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("quickserve_user");
  };

  const isAuthenticated = !!user;
  const hasRole = (roles: string[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
