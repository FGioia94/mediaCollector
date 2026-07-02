import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { ErrorMsg, errorMessage } from "../components/StatusViews";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!identifier.trim()) {
      setError("Email or username is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-page auth-shell">
      <p className="eyebrow">Welcome back</p>
      <h1>Login</h1>
      <p className="form-help">Access your catalog, editorial tools, and review workspace.</p>
      <form onSubmit={handleSubmit} className="vstack">
        <label>
          Email or username
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-links">
        Forgot your password? <Link to="/forgot-password">Reset it</Link>.
      </p>
      <p className="auth-links">
        Don&apos;t have an account? <Link to="/register">Register</Link>.
      </p>
    </section>
  );
}
