import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { getToken, setToken } from "../api/client";
import * as authApi from "../api/auth";
import type { RegisterRequest } from "../types";

const USER_ID_KEY = "mediahub.userId";
const EMAIL_KEY = "mediahub.email";

interface AuthState {
  token: string | null;
  email: string | null;
  userId: number | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readInitial(): AuthState {
  const storedId = localStorage.getItem(USER_ID_KEY);
  return {
    token: getToken(),
    email: localStorage.getItem(EMAIL_KEY),
    userId: storedId ? Number(storedId) : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitial);

  useEffect(() => {
    if (state.email) localStorage.setItem(EMAIL_KEY, state.email);
    else localStorage.removeItem(EMAIL_KEY);
  }, [state.email]);

  useEffect(() => {
    if (state.userId === null) localStorage.removeItem(USER_ID_KEY);
    else localStorage.setItem(USER_ID_KEY, String(state.userId));
  }, [state.userId]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setToken(response.token);
    setState((prev) => ({
      ...prev,
      token: response.token,
      email: response.email,
      userId: response.userId,
    }));
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const response = await authApi.register(body);
    setToken(response.token);
    setState((prev) => ({
      ...prev,
      token: response.token,
      email: response.email,
      userId: response.userId,
    }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setState({ token: null, email: null, userId: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.token,
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
