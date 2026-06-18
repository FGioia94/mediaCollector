import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import * as rolesApi from "../api/roles";
import {
  EmptyMsg,
  ErrorMsg,
  SkeletonTable,
  errorMessage,
} from "../components/StatusViews";
import type { Role } from "../types";
import { validateRoleName } from "../utils/validation";

export function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [name, setName] = useState("");

  const load = () => {
    rolesApi
      .listRoles()
      .then(setRoles)
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const nameError = validateRoleName(name);
    if (nameError) {
      setActionMsg(nameError);
      return;
    }
    try {
      await rolesApi.createRole(name.trim());
      setName("");
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this role?")) return;
    try {
      await rolesApi.deleteRole(id);
      load();
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  return (
    <section className="admin-page">
      <header className="page-header">
        <h1>Admin · Roles</h1>
      </header>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {actionMsg && <p className="status">{actionMsg}</p>}
      <form onSubmit={handleCreate} className="hstack">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New role name (e.g. EDITOR)"
          required
        />
        <button type="submit">Create</button>
      </form>
      {roles === null && !error && <SkeletonTable rows={4} cols={2} />}
      {roles && roles.length === 0 && <EmptyMsg>No roles.</EmptyMsg>}
      {roles && roles.length > 0 && (
        <ul className="list">
          {roles.map((role) => (
            <li key={role.id}>
              <span>
                #{role.id} {role.name}
              </span>
              <span className="row-actions">
                <button type="button" onClick={() => handleDelete(role.id)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
