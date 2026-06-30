// src/components/landing/isValidEmail.js
// Minimal, intentionally permissive email-format check for the waitlist form.
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}
