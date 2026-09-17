"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import { DampakMenuForm } from "./DampakMenuForm";
import { BlockEditor } from "@/components/blocks/BlockEditor";
import { HalamanLivePreview } from "./HalamanLivePreview";
import {
  slugifyHalaman,
  validateHalaman,
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
  const [notice, setNotice] = useState<string | null>(null);
  const [blockErrors, setBlockErrors] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [pahamDampak, setPahamDampak] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const draftKey = mode === "edit" && id ? `halaman-draft:${id}` : "halaman-draft:baru";
  const [draftTersedia, setDraftTersedia] = useState(false);
  // Alamat otomatis dari judul sampai admin menyentuh kolomnya sendiri.
  const [slugTouched, setSlugTouched] = useState(systemPath !== null || initial.slug !== "");

  const isSystem = systemPath !== null;
  const sortedGroups = [...groups].sort((a, b) => a.urutan - b.urutan || a.label.localeCompare(b.label));

  // Apakah perubahan yang belum disimpan membuat halaman keluar dari navbar
  // publik? Dipakai untuk memunculkan peringatan dampak menu (QA 2.3).
  const keluarDariNavbar =
    mode === "edit" &&
    (initial.published !== false || initial.showInNav !== false) &&
    (v.published === false || v.showInNav === false) &&
    initial.groupKey !== null;

  const alamatForm = isSystem
    ? systemPath ?? "/"
    : `/${slugifyHalaman(v.slug || v.judul)}`;

  // Draft recovery: baca localStorage setelah mount agar tidak hydration-mismatch (QA 3.1).
  // Pemeriksaan ditunda ke task berikutnya (bukan sinkron di body effect) agar
  // memenuhi react-hooks/set-state-in-effect.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const ada = window.localStorage.getItem(draftKey);
        if (ada && JSON.stringify(JSON.parse(ada)) !== JSON.stringify(initial)) {
          setDraftTersedia(true);
        }
      } catch {
        // storage rusak — abaikan
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [draftKey, initial]);

  // Peringatan sebelum meninggalkan halaman dengan perubahan belum disimpan.
  const dirty = useMemo(
    () => JSON.stringify(v) !== JSON.stringify(initial),
    [v, initial],
  );

  // Preview memakai nilai tertunda agar mengetik di form tidak tersendat
  // merender ulang seluruh blok tiap huruf.
  const blokTertunda = useDeferredValue(v.blok);

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Draft recovery: simpan perubahan ke localStorage agar refresh/back tidak hilang (QA 3.1).
  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(v));
      } catch {
        // storage penuh — abaikan, beforeunload tetap melindungi
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [v, dirty, draftKey]);

  function pulihkanDraft() {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        setV(JSON.parse(raw));
        setNotice("Draft yang belum tersimpan dipulihkan dari perangkat ini.");
      }
    } catch {
      setError("Draft tersimpan rusak dan tidak bisa dipulihkan.");
    } finally {
      setDraftTersedia(false);
    }
  }

  function buangDraft() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // abaikan
    }
    setDraftTersedia(false);
  }

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
    setNotice(null);
    setBlockErrors({});
    setPreviewError(null);

    // Validasi klien cermin validateHalaman agar admin tahu blok #N yang bermasalah (QA 3.3).
    const payloadAwal: Record<string, unknown> = {
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
    if (!isSystem) payloadAwal.slug = slugifyHalaman(v.slug || v.judul);
    const cek = validateHalaman(payloadAwal);
    if (!cek.ok) {
      const perBlok: Record<number, string> = {};
      for (const msg of cek.errors) {
        const m = msg.match(/blok #(\d+)/);
        if (m) perBlok[Number(m[1]) - 1] = msg;
      }
      setBlockErrors(perBlok);
      setError(cek.errors.join(" "));
      return;
    }

    // Guard ukuran dokumen Firestore (~1 MiB) sebelum save (QA 3.4).
    try {
      if (JSON.stringify(payloadAwal.blok ?? []).length > 800 * 1024) {
        setError("Isi halaman terlalu besar (>800 KB). Pecah ke beberapa halaman atau kurangi foto galeri.");
        return;
      }
    } catch {
      // abaikan
    }

    // Konfirmasi 2 langkah saat halaman keluar dari navbar (QA 2.3).
    if (keluarDariNavbar && !pahamDampak) {
      setError('Centang dulu "Saya paham halaman ini akan hilang dari menu website" di panel kanan sebelum menyimpan.');
      return;
    }

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
        | { error?: string; data?: { id?: string; slug?: string } }
        | null;

      if (res.status === 409) {
        throw new Error(
          "Halaman ini sudah diubah orang lain sejak Anda membukanya. Muat ulang halaman ini, lalu ulangi perubahan Anda.",
        );
      }
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan.");

      buangDraft();
      const slugDiminta = !isSystem ? slugifyHalaman(v.slug || v.judul) : null;
      const slugFinal = typeof json?.data?.slug === "string" ? json.data.slug : slugDiminta;
      // QA 2.2: alamat bentrok di-suffix otomatis — tampilkan URL final eksplisit.
      const suffixNote =
        slugDiminta && slugFinal && slugFinal !== slugDiminta
          ? ` Alamat "${slugDiminta}" sudah dipakai, disimpan sebagai /halaman/${slugFinal}.`
          : "";

      if (mode === "create" && json?.data?.id) {
        try {
          window.sessionStorage.setItem(
            "halaman-notice",
            `Halaman ${v.published ? "tayang" : "tersimpan sebagai draft"} di /halaman/${slugFinal ?? slugDiminta ?? ""}.${suffixNote}`,
          );
        } catch {
          // abaikan
        }
        router.push(`/admin/halaman/${json.data.id}/ubah`);
      } else {
        try {
          window.sessionStorage.setItem(
            "halaman-notice",
            `Perubahan tersimpan.${suffixNote}`,
          );
        } catch {
          // abaikan
        }
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

  async function onPreview() {
    setPreviewError(null);
    const previewPayload: Record<string, unknown> = {
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
    if (!isSystem) previewPayload.slug = slugifyHalaman(v.slug || v.judul);
    const cek = validateHalaman(previewPayload);
    if (!cek.ok) {
      setPreviewError("Perbaiki kesalahan pada form sebelum pratinjau.");
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch(`/api/halaman/${id}/preview-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftBlocks: v.blok }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string; data?: { token?: string } } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal membuat pratinjau.");
      const token = json?.data?.token;
      if (!token) throw new Error("Token pratinjau tidak diterima.");
      const slug = !isSystem ? slugifyHalaman(v.slug || v.judul) : (systemPath ?? "/").replace(/^\//, "");
      window.open(`/preview/${slug}?token=${encodeURIComponent(token)}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat pratinjau.";
      setPreviewError(msg);
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6 rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
        {draftTersedia ? (
          <div role="status" className="rounded-lg border border-navy/20 bg-cream px-4 py-3 text-sm text-ink">
            Ada perubahan yang belum tersimpan dari perangkat ini.
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={pulihkanDraft} className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-cream">Pulihkan draft</button>
              <button type="button" onClick={buangDraft} className="rounded-full border border-navy/20 px-4 py-1.5 text-xs text-navy">Buang</button>
            </div>
          </div>
        ) : null}
        {notice ? (
          <p role="status" className="rounded-lg border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </p>
        ) : null}
        <Field
          label="Nama / Judul halaman"
          htmlFor="h-judul"
          hint="Nama halaman untuk menu, alamat web, dan daftar admin. Otomatis dipakai di banner jika judul banner dikosongkan."
        >
          <input
            id="h-judul"
            value={v.judul}
            onChange={(e) => onJudulChange(e.target.value)}
            placeholder="Contoh: Profil Sekolah, Visi & Misi, PPDB"
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
          <Field label="Menu" htmlFor="h-menu" hint="Masukkan halaman ini ke kelompok menu di website. Butuh kelompok baru? Buat dulu di halaman Atur menu.">
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
            <p className="mt-2 text-xs text-muted">
              <a href="/admin/menu" className="underline">Buka Atur menu ↗</a> untuk tambah kelompok baru.
            </p>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl text-ink">Kustomisasi banner atas (Hero)</h3>
              <p className="mt-1 text-sm text-muted">
                Opsional — isi bagian ini hanya jika ingin tulisan di banner berbeda dari nama halaman.
              </p>
            </div>
            <span className="rounded-full border border-navy/15 bg-paper px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted">
              Opsional
            </span>
          </div>
          <div className="mt-5 space-y-6">
            <Field
              label="Judul banner (Hero)"
              htmlFor="h-hero-title"
              hint="Opsional — isi jika ingin headline banner lebih panjang atau berupa slogan. Kosongkan untuk memakai nama halaman."
            >
              <input
                id="h-hero-title"
                value={v.heroTitle}
                onChange={(e) => set("heroTitle", e.target.value)}
                placeholder={v.judul.trim() ? `Sama dengan nama: "${v.judul.trim()}"` : "Sama dengan nama halaman"}
                className={inputCls}
              />
            </Field>
            <Field
              label="Deskripsi banner (Hero)"
              htmlFor="h-hero-desc"
              hint="Kalimat pengantar di bawah judul banner (maks 400 karakter). Kosongkan jika tidak perlu."
            >
              <textarea
                id="h-hero-desc"
                value={v.heroDescription}
                onChange={(e) => set("heroDescription", e.target.value)}
                placeholder="Tulis ringkasan atau pengantar halaman..."
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
            <BlockEditor
              value={v.blok}
              onChange={(blok) => {
                set("blok", blok);
                setBlockErrors({});
              }}
              blockErrors={blockErrors}
            />
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
            data-tour="halaman-publish"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50"
          >
            {busy ? "Menyimpan…" : v.published ? (mode === "create" ? "Simpan & tayangkan" : "Simpan & tayangkan") : (mode === "create" ? "Simpan sebagai draft" : "Simpan draft")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (dirty && !window.confirm("Perubahan belum disimpan. Yakin keluar tanpa menyimpan?")) return;
              buangDraft();
              router.push("/admin/halaman");
            }}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-sm text-navy transition-colors hover:border-navy/50"
          >
            Batal
          </button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="lg:sticky lg:top-24" data-tour="halaman-preview">
          <HalamanLivePreview
            judul={v.judul}
            heroTitle={v.heroTitle}
            heroDescription={v.heroDescription}
            blok={blokTertunda}
            slug={v.slug}
            navLabel={v.navLabel}
            systemPath={systemPath}
            published={v.published}
            isSystem={isSystem}
          />
        </div>
        <div className="space-y-4 rounded-lg border border-navy/10 bg-paper p-6">
          <h3 className="font-display text-lg text-ink">Status tayang</h3>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={v.published}
              onChange={(e) => set("published", e.target.checked)}
              className="mt-1 size-4 accent-[#09122b]"
            />
            <span>
              <span className="font-medium text-ink">Tayangkan ke website</span>
              <span className="block text-xs text-muted">Mati = Draft, halaman belum bisa dibuka pengunjung.</span>
            </span>
          </label>
          {/* Peringatan dampak ke navbar/tautan saat halaman ini berhenti tayang (QA 2.3). */}
          <DampakMenuForm
            id={id}
            aktif={keluarDariNavbar}
            alamatSekarang={alamatForm}
          />
          {keluarDariNavbar ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <input
                type="checkbox"
                checked={pahamDampak}
                onChange={(e) => setPahamDampak(e.target.checked)}
                className="mt-0.5 size-4 accent-[#92400e]"
              />
              <span>Saya paham halaman ini akan hilang dari menu website.</span>
            </label>
          ) : null}
        </div>

        <div className="space-y-4 rounded-lg border border-navy/10 bg-paper p-6">
          <h3 className="font-display text-lg text-ink">Pratinjau</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Buka versi draft di tab baru. Perubahan belum disimpan akan ditampilkan.
          </p>
          <button
            type="button"
            onClick={onPreview}
            disabled={previewing || mode === "create"}
            className="mt-3 rounded-full border border-navy/20 px-5 py-2.5 text-sm text-navy transition-colors hover:border-navy/50 disabled:opacity-50"
          >
            {previewing ? "Membuka pratinjau..." : "Buka pratinjau"}
          </button>
          {previewError ? (
            <p className="mt-2 rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">{previewError}</p>
          ) : null}
          {mode === "create" ? (
            <p className="mt-3 text-xs text-muted">Simpan halaman terlebih dahulu sebelum membuka pratinjau.</p>
          ) : null}
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
