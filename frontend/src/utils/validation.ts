const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const ROLE_RE = /^[A-Z][A-Z0-9_]{1,29}$/;

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function validateEmail(value: string): string | null {
  if (isBlank(value)) return "Email is required.";
  if (value.length > 254) return "Email is too long.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 64) return "Password must be at most 64 characters.";
  if (!/[a-z]/.test(value)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(value)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a symbol.";
  return null;
}

export function validatePersonName(label: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (trimmed.length > 50) return `${label} must be at most 50 characters.`;
  if (!NAME_RE.test(trimmed)) return `${label} contains invalid characters.`;
  return null;
}

export function validateRoleName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Role name is required.";
  if (!ROLE_RE.test(trimmed)) {
    return "Role must be uppercase and can include numbers/underscores (e.g. EDITOR).";
  }
  return null;
}

export function validateGenreName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Genre name is required.";
  if (trimmed.length < 2) return "Genre name must be at least 2 characters.";
  if (trimmed.length > 40) return "Genre name must be at most 40 characters.";
  return null;
}

export function validateOptionalHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "URL must start with http:// or https://.";
    }
    return null;
  } catch {
    return "Enter a valid URL.";
  }
}

export function validateIntRange(
  label: string,
  value: number,
  min: number,
  max: number,
): string | null {
  if (!Number.isInteger(value)) return `${label} must be an integer.`;
  if (value < min || value > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return null;
}

export function validateNumberRange(
  label: string,
  value: number,
  min: number,
  max: number,
): string | null {
  if (!Number.isFinite(value)) return `${label} must be a number.`;
  if (value < min || value > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return null;
}

export function validateReviewText(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Review text is required.";
  if (trimmed.length < 5) return "Review must be at least 5 characters.";
  if (trimmed.length > 1000) return "Review must be at most 1000 characters.";
  return null;
}
