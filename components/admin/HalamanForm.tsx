"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import { BlockEditor } from "@/components/blocks/BlockEditor";
import {
  slugifyHalaman,
  type Blok,
  type NavGroupsItem,
} from "@/lib/halaman-schema";

/** Nilai form halaman — inilah yang diisi halaman admin dan dikirim ke API. */
export type HalamanFormValue = {
  judul: string;
  slug: string;
  navLabel: string;
  groupKey: string | null;
  urutan: number;
  showInNav: boolean;
  collapsible: boolean;
  published: boolean;
  heroTitle: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  blok: Blok[];
};

export type HalamanFormProps = {
  mode: "create" | "edit";
  /** id dokumen — wajib untuk mode "edit". */
  id?: string;
  initial: HalamanFormValue;
  /** Daftar grup menu (koleksi nav_groups) untuk pilihan "Menu induk". */
  groups: NavGroupsItem[];
  /** Alamat halaman bawaan (mis. "/visi-misi"). Bila terisi → alamat read-only. */
  systemPath?: string | null;
  /** `updatedAt` dokumen saat form dibuka — dikirim agar bentrok terdeteksi. */
  expectedUpdatedAt?: string;
};

export function HalamanForm({
  mode,
  id,
  initial,
  groups,
  systemPath = null,
  expectedUpdatedAt,
}: HalamanFormProps) {
  const router = useRouter();
  const [v, setV] = useState<HalamanFormValue>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Alamat otomatis dari judul sampai admin menyentuh kolomnya sendiri.
  const [slugTouched, setSlugTouched] = useState(systemPath !== null || initial.slug !== "");

  const isSystem = systemPath !== null;
  const sortedGroups = [...groups].sort((a, b) => a.urutan - b.urutan || a.label.localeCompare(b.label));

  // Peringatan sebelum meninggalkan halaman dengan perubahan belum disimpan.
  const dirty = useMemo(
    () => JSON.stringify(v) !== JSON.stringify(initial),
    [v, initial],
  );

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof HalamanFormValue>(k: K, val: HalamanFormValue[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function onJudulChange(judul: string) {
    setV((p) => {
      const next = { ...p, judul };
      // Halaman bawaan: jangan sentuh alamat. Halaman builder yang belum
      // menyentuh kolom alamat: ikut judul supaya admin awam tidak perlu tahu slug.
      if (!isSystem && !slugTouched) next.slug = slugifyHalaman(judul);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        judul: v.judul.trim(),
        navLabel: v.navLabel.trim() || v.judul.trim(),
        groupKey: v.groupKey,
        urutan: Number(v.urutan) || 0,
        showInNav: v.showInNav,
        collapsible: v.collapsible,
        published: v.published,
        heroTitle: v.heroTitle.trim(),
        heroDescription: v.heroDescription.trim(),
        metaTitle: v.metaTitle.trim(),
        metaDescription: v.metaDescription.trim(),
        blok: v.blok,
      };
      // Alamat halaman bawaan tidak boleh diubah — kirim hanya untuk builder.
      if (!isSystem) payload.slug = slugifyHalaman(v.slug || v.judul);
      if (mode === "edit" && expectedUpdatedAt) payload.expectedUpdatedAt = expectedUpdatedAt;

      const res = await fetch(mode === "create" ? "/api/halaman" : `/api/halaman/${id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as
        | { error?: string; data?: { id?: string } }
        | null;

      if (res.status === 409) {
        throw new Error(
          "Halaman ini sudah diubah orang lain sejak Anda membukanya. Muat ulang halaman ini, lalu ulangi perubahan Anda.",
        );
      }
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");

      if (mode === "create" && json?.data?.id) {
        router.push(`/admin/halaman/${json.data.id}/ubah`);
      } else {
        router.push("/admin/halaman");
      }
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Koneksi terputus — perubahan belum tersimpan. Periksa internet lalu coba lagi."
          : err instanceof Error
            ? err.message
            : "Gagal menyimpan.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
        <Field label="Judul halaman" htmlFor="h-judul" hint="Tampil sebagai judul besar di halaman.">
          <input
            id="h-judul"
            value={v.judul}
            onChange={(e) => onJudulChange(e.target.value)}
            required
            className={inputCls}
          />
        </Field>

        {isSystem ? (
          <Field label="Alamat halaman" htmlFor="h-alamat" hint="Halaman bawaan — alamatnya tidak dapat diubah.">
            <input
              id="h-alamat"
              value={systemPath}
              readOnly
              aria-readonly="true"
              className={`${inputCls} cursor-not-allowed bg-cream font-mono text-xs text-muted`}
            />
            <p className="mt-2 rounded-lg border border-navy/10 bg-cream px-4 py-3 text-xs leading-relaxed text-muted">
              Ini halaman bawaan website. Alamatnya sudah dipakai menu dan tautan lain, jadi tidak bisa
              diganti. Isi dan kontennya tetap bisa Anda ubah sebebas halaman biasa.
            </p>
          </Field>
        ) : (
          <Field
            label="Alamat halaman"
            htmlFor="h-alamat"
            hint="Terisi otomatis dari judul. Boleh diubah, pakai huruf kecil dan tanda minus (contoh: profil-sekolah)."
          >
            <input
              id="h-alamat"
              value={v.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              onBlur={() => set("slug", slugifyHalaman(v.slug || v.judul))}
              required
              className={`${inputCls} font-mono text-xs`}
            />
            <p className="mt-2 text-xs text-muted">
              Halaman ini bisa dibuka di{" "}
              <span className="font-mono">/halaman/{slugifyHalaman(v.slug || v.judul) || "alamat-halaman"}</span>
            </p>
          </Field>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Label menu" htmlFor="h-navlabel" hint="Teks di menu atas website. Kosongkan bila sama dengan judul.">
            <input
              id="h-navlabel"
              value={v.navLabel}
              onChange={(e) => set("navLabel", e.target.value)}
              placeholder={v.judul}
              className={inputCls}
            />
          </Field>
          <Field label="Menu induk" htmlFor="h-menu" hint="Kelompokkan halaman ini ke salah satu menu.">
            <select
              id="h-menu"
              value={v.groupKey ?? ""}
              onChange={(e) => set("groupKey", e.target.value === "" ? null : e.target.value)}
              className={inputCls}
            >
              <option value="">Tanpa menu (berdiri sendiri)</option>
              {sortedGroups.map((g) => (
                <option key={g.groupKey} value={g.groupKey}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Urutan" htmlFor="h-urutan" hint="Angka kecil tampil lebih dulu.">
            <input
              id="h-urutan"
              type="number"
              min={0}
              max={9999}
              value={v.urutan}
              onChange={(e) => set("urutan", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <div className="space-y-4 pt-7">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={v.showInNav}
                onChange={(e) => set("showInNav", e.target.checked)}
                className="mt-1 size-4 accent-[#09122b]"
              />
              <span>
                <span className="font-medium text-ink">Tampil di menu</span>
                <span className="block text-xs text-muted">Mati = tetap ada, tapi tak muncul di menu atas.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={v.collapsible}
                onChange={(e) => set("collapsible", e.target.checked)}
                className="mt-1 size-4 accent-[#09122b]"
              />
              <span>
                <span className="font-medium text-ink">Menu dapat dibuka-tutup</span>
                <span className="block text-xs text-muted">Cocok untuk menu induk berisi banyak halaman.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="border-t border-navy/10 pt-6">
          <h3 className="font-display text-xl text-ink">Tampilan halaman</h3>
          <p className="mt-1 text-sm text-muted">
            Bagian ini muncul paling atas saat halaman dibuka. Kosongkan bila tidak perlu.
          </p>
          <div className="mt-5 space-y-6">
            <Field label="Judul hero" htmlFor="h-hero-title" hint="Judul besar. Kosongkan untuk memakai judul halaman.">
              <input
                id="h-hero-title"
                value={v.heroTitle}
                onChange={(e) => set("heroTitle", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Deskripsi hero" htmlFor="h-hero-desc" hint="Kalimat pengantar di bawah judul (maks 400 karakter).">
              <textarea
                id="h-hero-desc"
                value={v.heroDescription}
                onChange={(e) => set("heroDescription", e.target.value)}
                rows={3}
                className={`${inputCls} leading-relaxed`}
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-navy/10 pt-6">
          <h3 className="font-display text-xl text-ink">Isi halaman</h3>
          <p className="mt-1 text-sm text-muted">
            Susun konten dari blok: teks, gambar, galeri, tombol, video, dan lainnya.
          </p>
          <div className="mt-5">
            <BlockEditor value={v.blok} onChange={(blok) => set("blok", blok)} />
          </div>
        </div>

        <div className="border-t border-navy/10 pt-6">
          <h3 className="font-display text-xl text-ink">Pengaturan pencarian</h3>
          <p className="mt-1 text-sm text-muted">
            Dipakai mesin pencari seperti Google. Kosongkan bila tidak yakin — judul halaman akan dipakai.
          </p>
          <div className="mt-5 space-y-6">
            <Field label="Judul di Google" htmlFor="h-meta-title" hint="Maks 70 karakter.">
              <input
                id="h-meta-title"
                value={v.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Deskripsi di Google" htmlFor="h-meta-desc" hint="Maks 160 karakter.">
              <textarea
                id="h-meta-desc"
                value={v.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={3}
                className={`${inputCls} leading-relaxed`}
              />
            </Field>
          </div>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50"
          >
            {busy ? "Menyimpan…" : mode === "create" ? "Simpan halaman" : "Simpan perubahan"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/halaman")}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-sm text-navy transition-colors hover:border-navy/50"
          >
            Batal
          </button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="space-y-4 rounded-lg border border-navy/10 bg-paper p-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={v.published}
              onChange={(e) => set("published", e.target.checked)}
              className="mt-1 size-4 accent-[#09122b]"
            />
            <span>
              <span className="font-medium text-ink">Tayangkan</span>
              <span className="block text-xs text-muted">Mati = Draft, halaman belum bisa dibuka pengunjung.</span>
            </span>
          </label>
        </div>

        <div className="rounded-lg border border-navy/10 bg-paper p-6">
          <h3 className="font-display text-lg text-ink">Pratinjau</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Lihat tampilan halaman seperti yang dilihat pengunjung. Perubahan yang belum disimpan tidak ikut tampil.
          </p>
          {mode === "edit" && id ? (
            <a
              href={`/pratinjau/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full border border-navy/20 px-5 py-2.5 text-sm text-navy transition-colors hover:border-navy/50"
            >
              Buka pratinjau
            </a>
          ) : (
            <p className="mt-4 rounded-lg border border-navy/10 bg-cream px-4 py-3 text-xs leading-relaxed text-muted">
              Simpan halaman dulu, baru pratinjau bisa dibuka.
            </p>
          )}
        </div>

        {isSystem ? (
          <div className="rounded-lg border border-navy/10 bg-paper p-6">
            <h3 className="font-display text-lg text-ink">Halaman bawaan</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Bagian inti halaman ini tetap seperti semula. Yang Anda ubah di sini adalah tambahan konten di
              bawahnya, judul, deskripsi, dan pengaturan menunya.
            </p>
          </div>
        ) : null}
      </aside>
    </form>
  );
}
