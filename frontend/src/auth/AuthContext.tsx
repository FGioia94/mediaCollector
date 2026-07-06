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
const USERNAME_KEY = "mediahub.username";
const ROLES_KEY = "mediahub.roles";

interface AuthState {
  token: string | null;
  email: string | null;
  username: string | null;
  userId: number | null;
  roles: string[];
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  canEditContent: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readInitial(): AuthState {
  const storedId = localStorage.getItem(USER_ID_KEY);
  const storedRoles = localStorage.getItem(ROLES_KEY);
  let parsedRoles: string[] = [];

  if (storedRoles) {
    try {
      const candidate = JSON.parse(storedRoles);
      if (Array.isArray(candidate)) {
        parsedRoles = candidate.filter((value): value is string => typeof value === "string");
      }
    } catch {
      parsedRoles = [];
    }
  }

  return {
    token: getToken(),
    email: localStorage.getItem(EMAIL_KEY),
    username: localStorage.getItem(USERNAME_KEY),
    userId: storedId ? Number(storedId) : null,
    roles: parsedRoles,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitial);

  useEffect(() => {
    if (state.email) localStorage.setItem(EMAIL_KEY, state.email);
    else localStorage.removeItem(EMAIL_KEY);
  }, [state.email]);

  useEffect(() => {
    if (state.username) localStorage.setItem(USERNAME_KEY, state.username);
    else localStorage.removeItem(USERNAME_KEY);
  }, [state.username]);

  useEffect(() => {
    if (state.userId === null) localStorage.removeItem(USER_ID_KEY);
    else localStorage.setItem(USER_ID_KEY, String(state.userId));
  }, [state.userId]);

  useEffect(() => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(state.roles));
  }, [state.roles]);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await authApi.login({ identifier, password });
    setToken(response.token);
    setState((prev) => ({
      ...prev,
      token: response.token,
      email: response.email,
      username: response.username,
      userId: response.userId,
      roles: Array.isArray(response.roles) ? response.roles : [],
    }));
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const response = await authApi.register(body);
    setToken(response.token);
    setState((prev) => ({
      ...prev,
      token: response.token,
      email: response.email,
      username: response.username,
      userId: response.userId,
      roles: Array.isArray(response.roles) ? response.roles : [],
    }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLES_KEY);
    setState({ token: null, email: null, username: null, userId: null, roles: [] });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.token,
      isAdmin: state.roles.includes("ADMIN"),
      canEditContent: state.roles.includes("EDITOR") || state.roles.includes("ADMIN"),
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
