"use client";

import { memo } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { BLOK_LABEL, slugifyHalaman, type Blok } from "@/lib/halaman-schema";

function teksLokal(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function hrefValidLokal(v: unknown): boolean {
  const s = teksLokal(v);
  if (!s) return false;
  if (s.startsWith("/") && !s.startsWith("//")) return true;
  return /^https:\/\//i.test(s);
}

function punyaItemLokal(v: unknown): boolean {
  return (
    Array.isArray(v) && v.some((x) => typeof x === "string" && x.trim().length > 0)
  );
}

/**
 * Cermin `blokTerisi` di BlockRenderer: true = belum lengkap, tidak akan
 * tampil di publik. Versi longgar (cek non-kosong) supaya pesan placeholder
 * muncul sebelum validasi allowlist/embed yang ketat di renderer.
 */
function blokBelumLengkap(b: Blok): boolean {
  switch (b.tipe) {
    case "paragraf":
    case "heading":
    case "kutipan":
      return teksLokal(b.teks).length === 0;
    case "tombol":
      return teksLokal(b.teks).length === 0 || !hrefValidLokal(b.href);
    case "gambar":
      return teksLokal(b.src).length === 0;
    case "galeri":
    case "daftar":
      return !punyaItemLokal(b.items);
    case "video":
      return teksLokal(b.src).length === 0;
    case "divider":
    case "spacer":
      return false;
    default:
      return true;
  }
}

function fieldKurang(b: Blok): string {
  switch (b.tipe) {
    case "paragraf":
      return "isi tulisan paragraf";
    case "heading":
      return "isi tulisan judul bagian";
    case "kutipan":
      return "isi tulisan kutipan";
    case "tombol": {
      const kurangTeks = teksLokal(b.teks).length === 0;
      const kurangHref = !hrefValidLokal(b.href);
      if (kurangTeks && kurangHref) return "isi tulisan tombol + tujuan tautan";
      if (kurangTeks) return "isi tulisan tombol";
      return "tujuan tautan";
    }
    case "gambar":
      return "sumber gambar";
    case "galeri":
      return "foto galeri (minimal 1 foto)";
    case "daftar":
      return "poin daftar (minimal 1 poin)";
    case "video":
      return "alamat video";
    default:
      return "isi blok";
  }
}

function kunciLokal(b: Blok, i: number): string {
  return typeof b.id === "string" && b.id ? b.id : `blok-${i}`;
}

/**
 * Pratinjau langsung di dalam editor: merender state form yang BELUM
 * disimpan, supaya admin bisa menyusun blok sambil melihat hasilnya.
 * Hero memakai `PageHero` yang sama dengan halaman publik, blok lengkap
 * dirender memakai `BlockRenderer` yang sama dengan halaman publik.
 */
export const HalamanLivePreview = memo(function HalamanLivePreview({
  judul,
  heroTitle,
  heroDescription,
  blok,
  slug,
  navLabel,
  systemPath = null,
  published,
  isSystem,
}: {
  judul: string;
  heroTitle: string;
  heroDescription: string;
  blok: Blok[];
  slug: string;
  navLabel: string;
  systemPath?: string | null;
  published: boolean;
  isSystem: boolean;
}) {
  const daftar = Array.isArray(blok) ? blok : [];
  const title = heroTitle.trim() || judul.trim() || "Judul halaman";
  const desc = heroDescription.trim() || undefined;
  const crumb = navLabel.trim() || judul.trim() || "Halaman";
  const alamat = systemPath ?? `/halaman/${slugifyHalaman(slug || judul) || "alamat-halaman"}`;

  return (
    <div className="overflow-hidden rounded-lg border border-navy/10 bg-cream">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/10 bg-paper px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
          Pratinjau langsung
        </p>
        <span className="rounded-full border border-navy/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy">
          {published ? "Tayang" : "Draft"} · belum tersimpan
        </span>
      </div>
      <div className="[&_h1]:!text-3xl">
        <PageHero
          breadcrumbs={[
            { href: "/", label: "Beranda" },
            { href: alamat, label: crumb },
          ]}
          title={title}
          description={desc}
        />
      </div>
      <div className="max-h-[55vh] overflow-y-auto">
        <section className="mx-auto max-w-6xl px-6 py-16">
          {daftar.length === 0 ? (
            <p className="rounded-lg border border-dashed border-navy/20 px-4 py-8 text-center text-sm text-muted">
              Belum ada isi — tambah blok di panel susun, hasilnya langsung terlihat di sini.
            </p>
          ) : (
            <div className="space-y-6">
              {daftar.map((b, i) => {
                if (!b || typeof b.tipe !== "string" || blokBelumLengkap(b)) {
                  const label =
                    b && typeof b.tipe === "string"
                      ? (BLOK_LABEL as Record<string, string>)[b.tipe] ?? b.tipe
                      : "Blok";
                  const detail =
                    b && typeof b.tipe === "string"
                      ? fieldKurang(b)
                      : "isi blok";
                  return (
                    <p
                      key={kunciLokal(b, i)}
                      className="rounded-lg border border-dashed border-amber-500/60 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
                    >
                      {label}: belum lengkap — {detail}, blok ini belum tampil di publik sampai dilengkapi.
                    </p>
                  );
                }
                return <BlockRenderer key={kunciLokal(b, i)} blok={[b]} tanpaAnimasi />;
              })}
            </div>
          )}
          {isSystem ? (
            <p className="mt-6 rounded-lg border border-navy/10 bg-paper px-4 py-3 text-xs leading-relaxed text-muted">
              Pratinjau ini hanya blok tambahan — bagian inti halaman bawaan tidak
              ditampilkan di sini.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
});
