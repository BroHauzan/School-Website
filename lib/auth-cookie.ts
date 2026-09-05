// Cookie name shared between proxy.ts (edge-safe) and server auth.
// File ini SENGAJA tanpa "server-only" agar bisa diimpor proxy.ts.
// Produksi pakai prefix __Host- (wajib Secure + Path=/ + tanpa Domain).
// Dev pakai nama polos supaya cookie tetap tersimpan di http://localhost.
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-smasa_admin_session"
    : "smasa_admin_session";
// 24 jam: cukup untuk seharian kerja admin, membatasi jendela penyalahgunaan
// bila cookie bocor. Jangan naikkan tanpa alasan.
export const SESSION_MAX_AGE = 1 * 24 * 60 * 60;
