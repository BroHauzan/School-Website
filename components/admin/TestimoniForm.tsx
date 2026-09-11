"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import type { TestimoniFormValue } from "@/lib/testimoni-schema";

export function TestimoniForm({ mode, id, initial }: { mode: "create" | "edit"; id?: string; initial: TestimoniFormValue }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof TestimoniFormValue>(k: K, val: TestimoniFormValue[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = { ...v, order: Number(v.order) || 0 };
      const url = mode === "create" ? "/api/testimoni" : `/api/testimoni/${id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");
      router.push("/admin/testimoni"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
      <Field label="Kutipan" htmlFor="t-quote" hint="10–500 karakter. Tulis persis apa yang mereka sampaikan.">
        <textarea id="t-quote" value={v.quote} onChange={(e) => set("quote", e.target.value)}
          required rows={4} className={inputCls} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nama" htmlFor="t-name" hint="Nama lengkap, 3–100 karakter.">
          <input id="t-name" value={v.name} onChange={(e) => set("name", e.target.value)}
            required className={inputCls} />
        </Field>
        <Field label="Peran" htmlFor="t-role" hint="Mis. “Siswa, angkatan 64” atau “Alumni 2012”.">
          <input id="t-role" value={v.role} onChange={(e) => set("role", e.target.value)}
            required className={inputCls} />
        </Field>
      </div>
      <Field label="Urutan" htmlFor="t-order" hint="Angka 0–9999, kecil tampil lebih depan di carousel.">
        <input id="t-order" type="number" min={0} max={9999} value={v.order}
          onChange={(e) => set("order", Number(e.target.value))} className={inputCls} />
      </Field>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 size-4 accent-[#09122b]" />
        <span><span className="font-medium text-ink">Tayangkan</span>
        <span className="block text-xs text-muted">Mati = draft, tidak tampil di carousel publik.</span></span>
      </label>
      {error ? <p role="alert" className="rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50">
          {busy ? "Menyimpan…" : mode === "create" ? "Tambah testimoni" : "Simpan perubahan"}
        </button>
        <button type="button" onClick={() => router.push("/admin/testimoni")} className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-navy text-navy transition-colors hover:border-navy/50">
          Batal
        </button>
      </div>
    </form>
  );
}
