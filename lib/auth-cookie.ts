// Cookie name shared between proxy.ts (edge-safe) and server auth.
// File ini SENGAJA tanpa "server-only" agar bisa diimpor proxy.ts.
export const SESSION_COOKIE = "smasa_admin_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
