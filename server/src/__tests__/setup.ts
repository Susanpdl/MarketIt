/**
 * Ensures auth modules can load when JWT_SECRET is not inherited from the environment (e.g. CI).
 */
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "vitest-jwt-secret-do-not-use-in-prod";
}
