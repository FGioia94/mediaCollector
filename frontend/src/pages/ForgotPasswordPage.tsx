import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import * as authApi from "../api/auth";
import { ErrorMsg, errorMessage } from "../components/StatusViews";
import { validateEmail } from "../utils/validation";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setResetLink(null);

    try {
      const response = await authApi.forgotPassword({ email: email.trim() });
      setMessage(response.message);
      setResetLink(response.resetLink ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-page">
      <h1>Forgot password</h1>
      <form onSubmit={handleSubmit} className="vstack">
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
        <ErrorMsg>{error}</ErrorMsg>
        {message && <p className="status">{message}</p>}
        {resetLink && (
          <p className="status">
            Reset link: <a href={resetLink}>{resetLink}</a>
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send reset email"}
        </button>
      </form>
      <p>
        Remembered your password? <Link to="/login">Sign in</Link>.
      </p>
    </section>
  );
}
