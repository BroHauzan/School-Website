import "server-only";

// Env SERVER-ONLY. Jangan pernah impor dari file client — guard "server-only"
// akan mematikan build bila file ini bocor ke bundle browser.

function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key || undefined;
}

export const firebaseAdminEnv = {
  projectId:
    process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    firebaseAdminEnv.projectId &&
      firebaseAdminEnv.clientEmail &&
      firebaseAdminEnv.privateKey
  );
}

/** Allowlist email admin. Kosong = login admin DITOLAK (fail-closed). */
export function adminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Daftar env wajib yang masih kosong (untuk pesan setup di panel admin). */
export function missingEnvReport(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");
  if (adminAllowlist().length === 0) missing.push("ADMIN_EMAILS");
  return missing;
}

export const cloudinaryEnv = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};