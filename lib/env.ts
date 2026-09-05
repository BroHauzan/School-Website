// Env helpers. Never throw at import — build must stay green without keys.
export function req(key: string): string | undefined {
  const v = process.env[key];
  if (!v || !v.trim()) return undefined;
  return v.trim();
}

export const firebaseClientEnv = {
  apiKey: req("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: req("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: req("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: req("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: req("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: req("NEXT_PUBLIC_FIREBASE_APP_ID"),
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

export const firebaseAdminEnv = {
  projectId: req("FIREBASE_ADMIN_PROJECT_ID") ?? firebaseClientEnv.projectId,
  clientEmail: req("FIREBASE_ADMIN_CLIENT_EMAIL"),
  privateKey: req("FIREBASE_ADMIN_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  storageBucket: req("FIREBASE_STORAGE_BUCKET") ?? firebaseClientEnv.storageBucket,
};

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    firebaseAdminEnv.projectId &&
      firebaseAdminEnv.clientEmail &&
      firebaseAdminEnv.privateKey
  );
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
