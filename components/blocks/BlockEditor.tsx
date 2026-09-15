/**
 * Editor blok bergaya WordPress: daftar blok dengan header (nama tipe +
 * tombol naik/turun/hapus), form field di bawah tiap header, dan menu
 * "+ Tambah blok" berisi 10 tipe yang tersedia.
 *
 * Tanpa drag-and-drop (tombol ↑/↓ supaya andal di HP) dan tanpa input
 * HTML/CSS bebas — admin hanya mengisi field bertipe.
 */
"use client";

import { useId, useState } from "react";
import type { Blok, BlokTipe } from "@/lib/halaman-schema";
import { MAX_BLOK, emptyBlok, newBlokId } from "@/lib/halaman-schema";
import { cn } from "@/lib/utils";
import { BLOK_DESKRIPSI, BLOK_IKON, BLOK_LABEL, BLOK_TIPE_ORDER, ringkasBlok } from "./blok-meta";
import { BlokForm } from "./BlokForm";

function kelasTombolIkon(): string {
  return "inline-flex size-9 items-center justify-center rounded-full border border-navy/20 text-sm text-navy transition-colors hover:border-navy/50 disabled:opacity-40 disabled:hover:border-navy/20";
}

export function BlockEditor({
  value,
  onChange,
}: {
  value: Blok[];
  onChange: (b: Blok[]) => void;
}) {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const idDasar = useId();
  const blok = Array.isArray(value) ? value : [];
  const penuh = blok.length >= MAX_BLOK;

  function ganti(i: number, patch: Partial<Blok>) {
    onChange(blok.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  function hapus(i: number) {
    onChange(blok.filter((_, idx) => idx !== i));
  }

  function pindah(i: number, arah: -1 | 1) {
    const j = i + arah;
    if (j < 0 || j >= blok.length) return;
    const next = blok.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChange(next);
  }

  function tambah(tipe: BlokTipe) {
    if (penuh) return;
    onChange([...blok, { ...emptyBlok(tipe), id: newBlokId() }]);
    setMenuTerbuka(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-ink">Isi halaman</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Susun halaman dari atas ke bawah memakai blok. Urutan blok di sini sama dengan urutan di halaman.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-navy/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy/60">
          {blok.length} dari {MAX_BLOK} blok
        </span>
      </div>

      {blok.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy/20 bg-paper px-6 py-10 text-center">
          <p className="font-display text-2xl text-ink">Belum ada isi</p>
          <p className="mt-2 text-sm text-muted">
            Klik “Tambah blok” untuk mulai menulis, menambah foto, atau menyematkan video.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {blok.map((b, i) => {
            const label = BLOK_LABEL[b.tipe] ?? b.tipe;
            const prefix = `${idDasar}-${b.id ?? i}`;
            return (
              <li key={`${b.id ?? "blok"}-${i}`} className="rounded-lg border border-navy/10 bg-paper">
                <div className="flex flex-wrap items-center gap-3 border-b border-navy/10 px-4 py-3 sm:px-5">
                  <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">
                    {BLOK_IKON[b.tipe] ?? "▪"} {label}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-muted">{ringkasBlok(b)}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pindah(i, -1)}
                      disabled={i === 0}
                      className={kelasTombolIkon()}
                      aria-label={`Naikkan blok ${label}`}
                      title="Naikkan"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => pindah(i, 1)}
                      disabled={i === blok.length - 1}
                      className={kelasTombolIkon()}
                      aria-label={`Turunkan blok ${label}`}
                      title="Turunkan"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => hapus(i)}
                      className="rounded-full border border-red-900/25 px-4 py-1.5 text-xs font-medium text-red-900 transition-colors hover:border-red-900/60"
                      aria-label={`Hapus blok ${label}`}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="px-4 py-5 sm:px-5">
                  <BlokForm blok={b} onChange={(patch) => ganti(i, patch)} idPrefix={prefix} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-lg border border-navy/10 bg-cream p-4">
        <button
          type="button"
          onClick={() => setMenuTerbuka((v) => !v)}
          disabled={penuh}
          aria-expanded={menuTerbuka}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-40 disabled:hover:bg-navy"
        >
          + Tambah blok
        </button>

        {penuh ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Batas {MAX_BLOK} blok per halaman sudah tercapai. Hapus atau pisahkan ke halaman lain.
          </p>
        ) : null}

        {menuTerbuka && !penuh ? (
          <div className="mt-4 rounded-lg border border-navy/10 bg-paper p-3">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">Pilih jenis blok</p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {BLOK_TIPE_ORDER.map((tipe) => (
                <li key={tipe}>
                  <button
                    type="button"
                    onClick={() => tambah(tipe)}
                    className={cn(
                      "w-full rounded-lg border border-navy/10 bg-paper px-4 py-3 text-left transition-colors",
                      "hover:border-navy/40 hover:bg-cream",
                    )}
                  >
                    <span className="block text-sm font-medium text-ink">
                      {BLOK_IKON[tipe] ?? "▪"} {BLOK_LABEL[tipe] ?? tipe}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">{BLOK_DESKRIPSI[tipe]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
