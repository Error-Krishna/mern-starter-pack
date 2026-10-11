import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient } from "../lib/api/client";
import { setAccessToken } from "./access-token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthEnvelope {
  success: boolean;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applyAuthPayload(payload: AuthEnvelope["data"], setUser: (user: AuthUser) => void) {
  setAccessToken(payload.accessToken);
  setUser(payload.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .post<AuthEnvelope>("/auth/refresh")
      .then(({ data }) => {
        if (!cancelled) applyAuthPayload(data.data, setUser);
      })
      .catch(() => {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthEnvelope>("/auth/login", { email, password });
    applyAuthPayload(data.data, setUser);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { data } = await apiClient.post<AuthEnvelope>("/auth/register", input);
    applyAuthPayload(data.data, setUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
