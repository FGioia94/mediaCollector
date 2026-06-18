import { HttpError, request } from "./client";
import type {
  ChangePasswordRequest,
  MessageResponse,
  ProfileImageUpdateRequest,
  UserRequest,
  UserResponse,
} from "../types";

export const listUsers = (): Promise<UserResponse[]> => request("/users/all");

export const getUser = (id: number): Promise<UserResponse> =>
  request(`/users/${id}`);

export const getMe = (): Promise<UserResponse> => request("/profile/me");

export const createUser = (body: UserRequest): Promise<UserResponse> =>
  request("/users/add", { method: "POST", body });

export const updateUser = (
  id: number,
  body: UserRequest,
): Promise<UserResponse> => request(`/users/${id}`, { method: "PUT", body });

export const updateMyProfileImage = async (
  body: ProfileImageUpdateRequest,
): Promise<UserResponse> => {
  try {
    return await request("/profile/me/image", { method: "PUT", body });
  } catch (error: unknown) {
    if (error instanceof HttpError && (error.status === 403 || error.status === 404)) {
      return request("/users/me/profile-image", { method: "PUT", body });
    }
    throw error;
  }
};

export const updateMyPassword = (
  body: ChangePasswordRequest,
): Promise<MessageResponse> =>
  request("/profile/me/password", { method: "PUT", body });

export const deleteUser = (id: number): Promise<void> =>
  request(`/users/${id}`, { method: "DELETE" });

export const assignRoles = (
  id: number,
  roleIds: number[],
): Promise<UserResponse> =>
  request(`/users/${id}/roles`, { method: "PUT", body: { roleIds } });
