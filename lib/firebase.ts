"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseClientEnv, isFirebaseConfigured } from "./env";

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined" && !isFirebaseConfigured()) return null;
  if (!isFirebaseConfigured()) return null;
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }
  app = initializeApp({
    apiKey: firebaseClientEnv.apiKey!,
    authDomain: firebaseClientEnv.authDomain!,
    projectId: firebaseClientEnv.projectId!,
    storageBucket: firebaseClientEnv.storageBucket!,
    messagingSenderId: firebaseClientEnv.messagingSenderId,
    appId: firebaseClientEnv.appId!,
  });
  return app;
}

export function getClientAuth(): Auth | null {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

export function getClientDb(): Firestore | null {
  const a = getFirebaseApp();
  return a ? getFirestore(a) : null;
}

export function getClientStorage(): FirebaseStorage | null {
  const a = getFirebaseApp();
  return a ? getStorage(a) : null;
}
