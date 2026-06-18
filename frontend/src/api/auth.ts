import { request } from "./client";
import type {
  AuthRequest,
  AuthResponse,
  ForgotPasswordRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types";

export function login(body: AuthRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body,
    auth: false,
  });
}

export function register(body: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body,
    auth: false,
  });
}

export function forgotPassword(body: ForgotPasswordRequest): Promise<MessageResponse> {
  return request<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body,
    auth: false,
  });
}

export function resetPassword(body: ResetPasswordRequest): Promise<MessageResponse> {
  return request<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body,
    auth: false,
  });
}
