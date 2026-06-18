import { useEffect, useState } from "react";

import * as rolesApi from "../api/roles";
import * as usersApi from "../api/users";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
  errorMessage,
} from "../components/StatusViews";
import type { Role, UserResponse } from "../types";

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = () => {
    usersApi
      .listUsers()
      .then(setUsers)
      .catch((err) => setError(errorMessage(err)));
    rolesApi.listRoles().then(setRoles).catch(() => setRoles([]));
  };

  useEffect(load, []);

  const toggleRole = async (user: UserResponse, role: Role) => {
    if (user.systemAdmin) {
      return;
    }

    const current = new Set(user.roles.map((r) => r.id));
    if (current.has(role.id)) current.delete(role.id);
    else current.add(role.id);
    try {
      await usersApi.assignRoles(user.id, Array.from(current));
      setActionMsg(`Updated roles for ${user.email}.`);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    const user = users?.find((u) => u.id === id);
    if (user?.systemAdmin) {
      setActionMsg("System admin account cannot be deleted.");
      return;
    }
    if (!confirm("Delete this user?")) return;
    try {
      await usersApi.deleteUser(id);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section className="admin-page">
      <header className="page-header">
        <h1>Admin · Users</h1>
      </header>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      {users === null && !error && <SkeletonTable rows={6} cols={5} />}
      {users && users.length === 0 && <EmptyMsg>No users.</EmptyMsg>}
      {users && users.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td data-label="Id">{user.id}</td>
                <td data-label="Name">
                  {user.firstName} {user.lastName}
                </td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Roles">
                  {roles.map((role) => {
                    const checked = user.roles.some((r) => r.id === role.id);
                    return (
                      <label key={role.id} className="inline">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={user.systemAdmin}
                          onChange={() => toggleRole(user, role)}
                        />
                        {role.name}
                      </label>
                    );
                  })}
                  {user.systemAdmin && <span className="status">System Admin</span>}
                </td>
                <td data-label="Actions" className="row-actions">
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    disabled={user.systemAdmin}
                    title={user.systemAdmin ? "System admin cannot be deleted" : undefined}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
