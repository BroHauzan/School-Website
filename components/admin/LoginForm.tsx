"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { isFirebaseConfigured } from "@/lib/env";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const rawNext = search.get("next") || "/admin";
  // Anti open-redirect: hanya path internal absolut ("/...") yang diizinkan.
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const configured = isFirebaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const auth = getClientAuth();
      if (!auth) throw new Error("Konfigurasi Firebase belum lengkap di environment.");
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const ct = res.headers.get("content-type") ?? "";
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        // Error spesifik dari server (mis. allowlist, Admin SDK) tampil apa adanya.
        // Kalau body bukan JSON (fungsi crash / redirect), jangan tutup-tutupi —
        // tampilkan status + content-type agar langsung ketahuan dari screenshot.
        if (json?.error) throw new Error(json.error);
        throw new Error(
          `Login gagal (HTTP ${res.status}${ct ? `, ${ct.split(";")[0]}` : ""}, respons server bukan JSON). Coba lagi; kalau berlanjut, cek Runtime Logs deployment ini.`
        );
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login gagal.";
      setError(
        /auth\/(invalid-credential|wrong-password|user-not-found)/.test(msg)
          ? "Email atau kata sandi salah."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {!configured ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Environment Firebase belum lengkap. Isi <code className="font-mono">.env.local</code>{" "}
          sesuai <code className="font-mono">.env.example</code> lalu restart dev server.
        </div>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
          Email admin
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@sman1lumajang.sch.id"
          className="w-full rounded-lg border border-navy/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-navy/40"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
          Kata sandi
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-navy/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-navy/40"
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50"
      >
        {busy ? "Masuk…" : "Masuk ke panel"}
      </button>
    </form>
  );
}
