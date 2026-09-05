// Env helpers. Semua akses process.env harus STATIS (identifier literal)
// supaya Next.js bisa inline NEXT_PUBLIC_* ke client bundle.
// Akses dinamis (process.env[key]) TIDAK akan di-inline di browser — hindari.

export const firebaseClientEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseClientEnv.apiKey &&
      firebaseClientEnv.authDomain &&
      firebaseClientEnv.projectId &&
      firebaseClientEnv.storageBucket &&
      firebaseClientEnv.appId
  );
}

// Server-only. File ini tetap diimpor dari client bundle untuk isFirebaseConfigured,
// jadi jangan taruh secret di sini — cukup pembacaan env server yang tidak pernah
// ter-ekspos (tanpa NEXT_PUBLIC_ tidak ikut ke bundle client).
export const firebaseAdminEnv = {
  projectId:
    process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

export const cloudinaryEnv = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.uploadPreset);
}

export function adminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function missingEnvReport(): string[] {
  const out: string[] = [];
  if (!firebaseClientEnv.apiKey) out.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseClientEnv.authDomain) out.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!firebaseClientEnv.projectId) out.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!firebaseClientEnv.storageBucket)
    out.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!firebaseClientEnv.appId) out.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!firebaseAdminEnv.clientEmail) out.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!firebaseAdminEnv.privateKey) out.push("FIREBASE_ADMIN_PRIVATE_KEY");
  return out;
}
