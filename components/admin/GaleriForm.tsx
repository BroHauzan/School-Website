"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import { ImageUploadField } from "./ImageUploadField";

export type GaleriFormValue = {
  caption: string; src: string; wide: boolean; order: number; published: boolean;
};

export function GaleriForm({ mode, id, initial }: { mode: "create" | "edit"; id?: string; initial: GaleriFormValue }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof GaleriFormValue>(k: K, val: GaleriFormValue[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const payload = {
        caption: v.caption.trim(), src: v.src.trim(),
        wide: v.wide, order: Number(v.order) || 0, published: v.published,
      };
      const url = mode === "create" ? "/api/galeri" : `/api/galeri/${id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");
      router.push("/admin/galeri"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
        <Field label="Caption" htmlFor="g-caption" hint="3–160 karakter. Tampil di bawah foto.">
          <input id="g-caption" value={v.caption} onChange={(e) => set("caption", e.target.value)} required className={inputCls} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Urutan" htmlFor="g-order" hint="Kecil tampil duluan.">
            <input id="g-order" type="number" min={0} max={9999} value={v.order} onChange={(e) => set("order", Number(e.target.value))} className={inputCls} />
          </Field>
          <div className="space-y-4 pt-7">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={v.wide} onChange={(e) => set("wide", e.target.checked)} className="mt-1 size-4 accent-[#09122b]" />
              <span><span className="font-medium text-ink">Foto lebar</span>
              <span className="block text-xs text-muted">Rasio 4:3, kalau mati 3:4.</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 size-4 accent-[#09122b]" />
              <span><span className="font-medium text-ink">Tayangkan</span>
              <span className="block text-xs text-muted">Mati = draft.</span></span>
            </label>
          </div>
        </div>
        {error ? <p role="alert" className="rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50">
            {busy ? "Menyimpan..." : mode === "create" ? "Tambah foto" : "Simpan perubahan"}
          </button>
          <button type="button" onClick={() => router.push("/admin/galeri")} className="rounded-full border border-navy/20 px-6 py-2.5 text-sm text-navy transition-colors hover:border-navy/50">
            Batal
          </button>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="rounded-lg border border-navy/10 bg-paper p-6">
          <Field label="Foto">
            <ImageUploadField value={v.src} onChange={(url) => set("src", url)} uploadUrl="/api/galeri/upload" previewAlt="Pratinjau foto galeri" />
          </Field>
        </div>
      </aside>
    </form>
  );
}
