import { request } from "./client";
import type { Role } from "../types";

export const listRoles = (): Promise<Role[]> => request("/roles/all");

export const getRole = (id: number): Promise<Role> => request(`/roles/${id}`);

export const createRole = (name: string): Promise<Role> =>
  request("/roles", { method: "POST", body: { name } });

export const updateRole = (id: number, name: string): Promise<Role> =>
  request(`/roles/${id}`, { method: "PUT", body: { name } });

export const deleteRole = (id: number): Promise<void> =>
  request(`/roles/${id}`, { method: "DELETE" });
