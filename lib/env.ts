// Env helpers. Semua akses process.env harus STATIS (identifier literal)
// supaya Next.js bisa inline NEXT_PUBLIC_* ke client bundle.
// Akses dinamis (process.env[key]) TIDAK akan di-inline di browser — hindari.
//
// FILE INI KHUSUS NILAI PUBLIC. Secret/server-only ada di lib/env-server.ts
// (dilindungi import "server-only" supaya tak bisa ikut ke bundle client).

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

// Nilai berikut dibaca di server TAPI dipakai guard publik client
// (mis. isCloudinaryConfigured untuk menonaktifkan UI upload di panel).
// Tidak ada secret di sini — hanya nama cloud & preset unsigned.
export const cloudinaryEnv = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.uploadPreset);
}

