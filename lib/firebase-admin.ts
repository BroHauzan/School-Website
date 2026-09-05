import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseAdminEnv, isFirebaseAdminConfigured } from "./env";

let app: App | null = null;

export function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0]!;
    return app;
  }
  // Pesan eksplisit: tanpa ini, cert() yang rusak hanya menghasilkan 500 kosong di Vercel.
  const key = firebaseAdminEnv.privateKey!;
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
    throw Object.assign(
      new Error(
        "FIREBASE_ADMIN_PRIVATE_KEY tidak valid: harus diawali -----BEGIN PRIVATE KEY-----. Paste ulang dari Firebase Console."
      ),
      { status: 500 }
    );
  }
  app = initializeApp({
    credential: cert({
      projectId: firebaseAdminEnv.projectId!,
      clientEmail: firebaseAdminEnv.clientEmail!,
      privateKey: firebaseAdminEnv.privateKey!,
    }),
    projectId: firebaseAdminEnv.projectId!,
    storageBucket: firebaseAdminEnv.storageBucket,
  });
  return app;
}

export function adminConfigured(): boolean {
  return isFirebaseAdminConfigured();
}

export function getAdminAuth() {
  const a = getAdminApp();
  if (!a) throw new Error("Firebase Admin belum dikonfigurasi.");
  return getAuth(a);
}

export function getAdminDb() {
  const a = getAdminApp();
  if (!a) throw new Error("Firebase Admin belum dikonfigurasi.");
  return getFirestore(a);
}

export function getAdminBucket() {
  const a = getAdminApp();
  if (!a) throw new Error("Firebase Admin belum dikonfigurasi.");
  const bucketName = firebaseAdminEnv.storageBucket;
  const storage = getStorage(a);
  return bucketName ? storage.bucket(bucketName) : storage.bucket();
}
