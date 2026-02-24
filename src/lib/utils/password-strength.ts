/**
 * Client-side password strength (0–4) for UI indicator.
 * Rules aligned with backend: length >= 8, upper, lower, number, special.
 */
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasNumber = /\d/;
const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (hasUpper.test(password)) score++;
  if (hasLower.test(password)) score++;
  if (hasNumber.test(password)) score++;
  if (hasSpecial.test(password)) score++;
  return Math.min(4, score);
}

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    hasUpper.test(password) &&
    hasLower.test(password) &&
    hasNumber.test(password) &&
    hasSpecial.test(password)
  );
}
