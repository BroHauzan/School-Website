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
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const idDasar = useId();
  const blok = Array.isArray(value) ? value : [];
  const penuh = blok.length >= MAX_BLOK;

  function ganti(i: number, patch: Partial<Blok>) {
    onChange(blok.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  function hapus(i: number) {
    onChange(blok.filter((_, idx) => idx !== i));
  }

  function duplikat(i: number) {
    if (penuh) return;
    const target = blok[i];
    if (!target) return;
    const copy: Blok = JSON.parse(JSON.stringify(target));
    copy.id = newBlokId();
    const next = [...blok.slice(0, i + 1), copy, ...blok.slice(i + 1)];
    onChange(next);
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

  function tambahDi(pos: number, tipe: BlokTipe) {
    if (penuh) return;
    const baru: Blok = { ...emptyBlok(tipe), id: newBlokId() };
    const next = [...blok.slice(0, pos), baru, ...blok.slice(pos)];
    onChange(next);
    setInsertIndex(null);
  }

  function renderPilihanBlok(onSelect: (tipe: BlokTipe) => void) {
    return (
      <div className="mt-3 rounded-lg border border-navy/10 bg-paper p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">Pilih jenis blok</p>
          <button
            type="button"
            onClick={() => {
              setMenuTerbuka(false);
              setInsertIndex(null);
            }}
            className="text-xs text-muted hover:text-ink"
          >
            Tutup ✕
          </button>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BLOK_TIPE_ORDER.map((tipe) => (
            <li key={tipe}>
              <button
                type="button"
                onClick={() => onSelect(tipe)}
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
    );
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
        <div className="space-y-3">
          {/* Sisipkan di paling atas */}
          <div className="group relative flex items-center justify-center py-1">
            <div className="absolute inset-x-0 top-1/2 h-px bg-navy/10 group-hover:bg-navy/25 transition-colors" />
            <button
              type="button"
              onClick={() => {
                setMenuTerbuka(false);
                setInsertIndex(insertIndex === 0 ? null : 0);
              }}
              disabled={penuh}
              className={cn(
                "relative z-10 flex items-center gap-1.5 rounded-full border border-navy/20 bg-cream px-3 py-1 text-xs font-medium text-navy transition-all",
                "hover:border-navy hover:bg-navy hover:text-cream disabled:opacity-40",
                insertIndex === 0 && "border-navy bg-navy text-cream",
              )}
            >
              <span>+</span>
              <span>Sisipkan di awal</span>
            </button>
          </div>

          {insertIndex === 0 && !penuh ? renderPilihanBlok((tipe) => tambahDi(0, tipe)) : null}

          {blok.map((b, i) => {
            const label = BLOK_LABEL[b.tipe] ?? b.tipe;
            const prefix = `${idDasar}-${b.id ?? i}`;
            const isInsertingHere = insertIndex === i + 1;

            return (
              <div key={`${b.id ?? "blok"}-${i}`} className="space-y-3">
                <div className="rounded-lg border border-navy/10 bg-paper">
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
                        onClick={() => duplikat(i)}
                        disabled={penuh}
                        className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-navy/50 disabled:opacity-40"
                        aria-label={`Duplikat blok ${label}`}
                        title="Duplikat blok ini"
                      >
                        Duplikat
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(i)}
                        className="rounded-full border border-red-900/25 px-3.5 py-1.5 text-xs font-medium text-red-900 transition-colors hover:border-red-900/60"
                        aria-label={`Hapus blok ${label}`}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-5">
                    <BlokForm blok={b} onChange={(patch) => ganti(i, patch)} idPrefix={prefix} />
                  </div>
                </div>

                {/* Sisipkan di antara / setelah blok */}
                <div className="group relative flex items-center justify-center py-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-navy/10 group-hover:bg-navy/25 transition-colors" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuTerbuka(false);
                      setInsertIndex(isInsertingHere ? null : i + 1);
                    }}
                    disabled={penuh}
                    className={cn(
                      "relative z-10 flex items-center gap-1.5 rounded-full border border-navy/20 bg-cream px-3 py-1 text-xs font-medium text-navy transition-all",
                      "hover:border-navy hover:bg-navy hover:text-cream disabled:opacity-40",
                      isInsertingHere && "border-navy bg-navy text-cream",
                    )}
                  >
                    <span>+</span>
                    <span>Sisipkan di sini</span>
                  </button>
                </div>

                {isInsertingHere && !penuh ? renderPilihanBlok((tipe) => tambahDi(i + 1, tipe)) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-navy/10 bg-cream p-4">
        <button
          type="button"
          onClick={() => {
            setInsertIndex(null);
            setMenuTerbuka((v) => !v);
          }}
          disabled={penuh}
          aria-expanded={menuTerbuka}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-40 disabled:hover:bg-navy"
        >
          + Tambah blok di akhir
        </button>

        {penuh ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Batas {MAX_BLOK} blok per halaman sudah tercapai. Hapus atau pisahkan ke halaman lain.
          </p>
        ) : null}

        {menuTerbuka && !penuh ? renderPilihanBlok((tipe) => tambah(tipe)) : null}
      </div>
    </section>
  );
}
