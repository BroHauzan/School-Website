"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import { ImageUploadField } from "./ImageUploadField";
import { todayISO } from "@/lib/berita-schema";

export type BeritaFormValue = {
  title: string; excerpt: string; tag: string; image: string;
  dateISO: string; bodyText: string; featured: boolean; published: boolean;
};

export function emptyForm(): BeritaFormValue {
  return {
    title: "", excerpt: "", tag: "Kesiswaan", image: "/hero-school.webp",
    dateISO: todayISO(), bodyText: "", featured: false, published: true,
  };
}

export function BeritaForm({ mode, id, initial }: { mode: "create" | "edit"; id?: string; initial: BeritaFormValue }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof BeritaFormValue>(k: K, val: BeritaFormValue[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const body = v.bodyText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const payload = {
        title: v.title.trim(), excerpt: v.excerpt.trim(), tag: v.tag.trim(),
        image: v.image.trim() || "/hero-school.webp", dateISO: v.dateISO,
        body, featured: v.featured, published: v.published,
      };
      const url = mode === "create" ? "/api/berita" : `/api/berita/${id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");
      router.push("/admin"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
        <Field label="Judul" htmlFor="f-title">
          <input id="f-title" value={v.title} onChange={(e) => set("title", e.target.value)} required className={inputCls} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Tag" htmlFor="f-tag">
            <input id="f-tag" value={v.tag} onChange={(e) => set("tag", e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Tanggal" htmlFor="f-date">
            <input id="f-date" type="date" value={v.dateISO} onChange={(e) => set("dateISO", e.target.value)} required className={inputCls} />
          </Field>
        </div>
        <Field label="Ringkasan" htmlFor="f-excerpt" hint="20–300 karakter.">
          <textarea id="f-excerpt" value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} required className={inputCls} />
        </Field>
        <Field label="Isi berita" htmlFor="f-body" hint="Pisahkan paragraf dengan baris kosong.">
          <textarea id="f-body" value={v.bodyText} onChange={(e) => set("bodyText", e.target.value)} rows={12} required className={`${inputCls} leading-relaxed`} />
        </Field>
        {error ? <p role="alert" className="rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50">
            {busy ? "Menyimpan…" : mode === "create" ? "Terbitkan berita" : "Simpan perubahan"}
          </button>
          <button type="button" onClick={() => router.push("/admin")} className="rounded-full border border-navy/20 px-6 py-2.5 text-sm text-navy transition-colors hover:border-navy/50">
            Batal
          </button>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="rounded-lg border border-navy/10 bg-paper p-6">
          <Field label="Gambar header">
            <ImageUploadField value={v.image} onChange={(url) => set("image", url)} />
          </Field>
        </div>
        <div className="space-y-4 rounded-lg border border-navy/10 bg-paper p-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 size-4 accent-[#09122b]" />
            <span><span className="font-medium text-ink">Tayangkan</span>
            <span className="block text-xs text-muted">Mati = draft.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-1 size-4 accent-[#09122b]" />
            <span><span className="font-medium text-ink">Sorotan utama</span>
            <span className="block text-xs text-muted">Tampil besar di arsip.</span></span>
          </label>
        </div>
      </aside>
    </form>
  );
}
