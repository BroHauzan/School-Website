"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import { PRESTASI_SCOPES, ddmmyyToISO, isoToDDMMYY, type PrestasiPeraih, type PrestasiScope } from "@/lib/prestasi-schema";

export type PrestasiFormValue = {
  year: string; scope: PrestasiScope; title: string; dateISO: string;
  /** Satu entri per orang — tiap peraih bisa beda kelas. */
  peraih: PrestasiPeraih[];
  published: boolean;
};

export function PrestasiForm({ mode, id, initial }: { mode: "create" | "edit"; id?: string; initial: PrestasiFormValue }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Input tanggal tampil sebagai dd/mm/yy; disimpan/dikirim sebagai ISO.
  const [dateText, setDateText] = useState(initial.dateISO ? isoToDDMMYY(initial.dateISO) : "");
  const set = <K extends keyof PrestasiFormValue>(k: K, val: PrestasiFormValue[K]) =>
    setV((p) => ({ ...p, [k]: val }));
  const setPeraih = (i: number, k: keyof PrestasiPeraih, val: string) =>
    setV((p) => ({ ...p, peraih: p.peraih.map((r, j) => (j === i ? { ...r, [k]: val } : r)) }));
  const addPeraih = () =>
    setV((p) => ({ ...p, peraih: [...p.peraih, { nama: "", kelas: "" }] }));
  const removePeraih = (i: number) =>
    setV((p) => ({ ...p, peraih: p.peraih.filter((_, j) => j !== i) }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Baris dengan nama kosong dianggap tidak diisi.
    const peraih = v.peraih
      .map((r) => ({ nama: r.nama.trim(), kelas: r.kelas.trim() }))
      .filter((r) => r.nama.length > 0);
    if (peraih.length === 0) { setError("Isi minimal 1 nama peraih."); return; }
    let dateISO = "";
    if (dateText.trim()) {
      const parsed = ddmmyyToISO(dateText);
      if (!parsed) { setError("Tanggal harus format dd/mm/yy, mis. 11/09/26."); return; }
      dateISO = parsed;
    }
    setBusy(true);
    try {
      const payload = {
        year: v.year.trim(), scope: v.scope, title: v.title.trim(),
        dateISO, peraih, published: v.published,
      };
      const url = mode === "create" ? "/api/prestasi" : `/api/prestasi/${id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");
      router.push("/admin/prestasi"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Tahun" htmlFor="p-year" hint="4 digit, mis. 2026.">
          <input id="p-year" type="number" min={1900} max={2100} value={v.year}
            onChange={(e) => set("year", e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Tingkat" htmlFor="p-scope" hint="Tingkat lomba yang diraih.">
          <select id="p-scope" value={v.scope} onChange={(e) => set("scope", e.target.value as PrestasiScope)} className={inputCls}>
            {PRESTASI_SCOPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Tanggal diraih" htmlFor="p-date" hint="Format dd/mm/yy, mis. 11/09/26. Kosongkan bila hanya tahu tahunnya.">
          <input id="p-date" type="text" inputMode="numeric" placeholder="11/09/26"
            value={dateText} onChange={(e) => setDateText(e.target.value)} className={inputCls} />
        </Field>
      </div>
      <Field label="Nama prestasi" htmlFor="p-title" hint="8–160 karakter. Mis. “Juara 3 — Lomba Karya Tulis Ilmiah”.">
        <input id="p-title" value={v.title} onChange={(e) => set("title", e.target.value)} required className={inputCls} />
      </Field>
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
          Peraih
        </legend>
        {v.peraih.map((r, i) => (
          <div key={i} className="grid items-center gap-3 sm:grid-cols-[1fr_220px_auto]">
            <input
              aria-label={`Nama peraih ${i + 1}`}
              value={r.nama}
              onChange={(e) => setPeraih(i, "nama", e.target.value)}
              required={i === 0}
              placeholder="Nama siswa atau tim"
              className={inputCls}
            />
            <input
              aria-label={`Kelas peraih ${i + 1}`}
              value={r.kelas}
              onChange={(e) => setPeraih(i, "kelas", e.target.value)}
              placeholder="Kelas, mis. XII MIPA 1"
              className={inputCls}
            />
            {v.peraih.length > 1 ? (
              <button
                type="button"
                onClick={() => removePeraih(i)}
                aria-label={`Hapus peraih ke-${i + 1}`}
                className="flex size-11 items-center justify-center rounded-lg border border-navy/15 text-lg text-navy/50 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700"
              >
                &times;
              </button>
            ) : (
              <span aria-hidden="true" className="hidden size-11 sm:block" />
            )}
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={addPeraih}
            className="rounded-full border border-navy/25 px-4 py-2 text-xs font-medium text-navy transition-colors hover:border-navy/50 hover:bg-navy/5"
          >
            + Tambah peraih
          </button>
          <p className="text-xs leading-relaxed text-muted">
            Satu orang per baris — kelas tiap peraih bisa berbeda.
          </p>
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 size-4 accent-[#09122b]" />
        <span><span className="font-medium text-ink">Tayangkan</span>
        <span className="block text-xs text-muted">Mati = draft, tidak tampil di halaman publik.</span></span>
      </label>
      {error ? <p role="alert" className="rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50">
          {busy ? "Menyimpan…" : mode === "create" ? "Tambah prestasi" : "Simpan perubahan"}
        </button>
        <button type="button" onClick={() => router.push("/admin/prestasi")} className="rounded-full border border-navy/20 px-6 py-2.5 text-sm text-navy transition-colors hover:border-navy/50">
          Batal
        </button>
      </div>
    </form>
  );
}
