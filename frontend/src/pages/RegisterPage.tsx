import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { ErrorMsg, errorMessage } from "../components/StatusViews";
import {
  validateEmail,
  validatePassword,
  validatePersonName,
} from "../utils/validation";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const firstNameError = validatePersonName("First name", firstName);
    if (firstNameError) {
      setError(firstNameError);
      return;
    }
    const lastNameError = validatePersonName("Last name", lastName);
    if (lastNameError) {
      setError(lastNameError);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-page auth-shell">
      <p className="eyebrow">New account</p>
      <h1>Create your account</h1>
      <p className="form-help">Join MediaHub and start building your personal watch universe.</p>
      <form onSubmit={handleSubmit} className="vstack">
        <label>
          First name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label>
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password (8-16 chars)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={64}
            required
            autoComplete="new-password"
          />
        </label>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="auth-links">
        Already have an account? <Link to="/login">Login</Link>.
      </p>
    </section>
  );
}
