/**
 * Editor blok bergaya WordPress: daftar blok dengan header (nama tipe +
 * tombol naik/turun/hapus), form field di bawah tiap header, dan menu
 * "+ Tambah blok" berisi 10 tipe yang tersedia.
 *
 * Tanpa drag-and-drop (tombol ↑/↓ supaya andal di HP) dan tanpa input
 * HTML/CSS bebas — admin hanya mengisi field bertipe.
 */
"use client";

import { memo, useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Blok, BlokTipe } from "@/lib/halaman-schema";
import { MAX_BLOK, emptyBlok, newBlokId } from "@/lib/halaman-schema";
import { cn } from "@/lib/utils";
import { BLOK_DESKRIPSI, BLOK_IKON, BLOK_LABEL, BLOK_TIPE_ORDER, ringkasBlok } from "./blok-meta";
import { BlokForm } from "./BlokForm";

function kelasTombolIkon(): string {
  return "inline-flex size-9 items-center justify-center rounded-full border border-navy/20 text-sm text-navy transition-colors hover:border-navy/50 disabled:opacity-40 disabled:hover:border-navy/20";
}

/** Grid pemilih tipe blok — komponen (bukan fungsi yang dipanggil saat render)
 *  agar callback `onSelect` hanya dipanggil dari event handler klik. */
function PilihanBlok({
  onSelect,
  onTutup,
}: {
  onSelect: (tipe: BlokTipe) => void;
  onTutup: () => void;
}) {
  return (
    <div className="mt-3 rounded-lg border border-navy/10 bg-paper p-3 shadow-sm" data-tour="blok-pilih">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">Pilih jenis blok</p>
        <button
          type="button"
          onClick={onTutup}
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
              data-tipe={tipe}
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

type BlokCardProps = {
  b: Blok;
  i: number;
  total: number;
  prefix: string;
  penuh: boolean;
  cardId: string;
  errMsg?: string;
  isCollapsed: boolean;
  onToggle: (cardId: string) => void;
  onGanti: (i: number, patch: Partial<Blok>) => void;
  onHapus: (i: number) => void;
  onDuplikat: (i: number) => void;
  onPindah: (i: number, arah: -1 | 1) => void;
  onPindahKe: (i: number, target: number) => void;
};

// Didefinisikan di luar BlockEditor supaya identitas komponen stabil antar
// render — definisi di dalam menyebabkan unmount/remount tiap ketikan dan
// fokus input lepas setelah 1 huruf.
const BlokCard = memo(function BlokCard({
  b,
  i,
  total,
  prefix,
  penuh,
  cardId,
  errMsg,
  isCollapsed,
  onToggle,
  onGanti,
  onHapus,
  onDuplikat,
  onPindah,
  onPindahKe,
}: BlokCardProps) {
  const label = BLOK_LABEL[b.tipe] ?? b.tipe;
  return (
    <div className={cn("rounded-lg border bg-paper", errMsg ? "border-red-500/50" : "border-navy/10")}>
      <div className="flex flex-wrap items-center gap-3 border-b border-navy/10 px-4 py-3 sm:px-5">
        <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">
          #{i + 1} · {BLOK_IKON[b.tipe] ?? "▪"} {label}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm text-muted">{ringkasBlok(b)}</p>
        <div className="flex shrink-0 items-center gap-2" data-tour="blok-pindah">
          <button type="button" onClick={() => onPindah(i, -1)} disabled={i === 0} className={kelasTombolIkon()} aria-label={`Naikkan blok ${label}`} title="Naikkan">↑</button>
          <button type="button" onClick={() => onPindah(i, 1)} disabled={i === total - 1} className={kelasTombolIkon()} aria-label={`Turunkan blok ${label}`} title="Turunkan">↓</button>
          <label className="flex items-center gap-1 text-xs text-muted" title="Pindah langsung ke nomor blok">
            Ke
            <input
              key={`ke-${cardId}-${i}`}
              type="number"
              min={1}
              max={total}
              defaultValue={i + 1}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const el = e.target as HTMLInputElement;
                  const v = Math.round(Number(el.value));
                  if (!Number.isFinite(v) || !Number.isInteger(v) || v < 1 || v > total || v === i + 1) {
                    el.value = String(i + 1);
                    return;
                  }
                  onPindahKe(i, v);
                }
              }}
              onBlur={(e) => {
                const el = e.target as HTMLInputElement;
                const v = Math.round(Number(el.value));
                if (!Number.isFinite(v) || !Number.isInteger(v) || v < 1 || v > total || v === i + 1) {
                  if (el.value !== String(i + 1)) el.value = String(i + 1);
                  return;
                }
                onPindahKe(i, v);
              }}
              className="w-14 rounded border border-navy/20 px-1 py-1 text-center text-xs"
              aria-label={`Pindah blok ${i + 1} ke posisi`}
            />
          </label>
          <button type="button" onClick={() => onToggle(cardId)} className="rounded-full border border-navy/20 px-3 py-1.5 text-xs text-navy hover:border-navy/50" aria-label={isCollapsed ? "Buka blok" : "Ciutkan blok"}>
            {isCollapsed ? "Buka" : "Ciut"}
          </button>
          <button type="button" onClick={() => onDuplikat(i)} disabled={penuh} data-tour="blok-duplikat" className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-navy/50 disabled:opacity-40" aria-label={`Duplikat blok ${label}`} title="Duplikat blok ini">Duplikat</button>
          <button type="button" onClick={() => onHapus(i)} className="rounded-full border border-red-900/25 px-3.5 py-1.5 text-xs font-medium text-red-900 transition-colors hover:border-red-900/60" aria-label={`Hapus blok ${label}`}>Hapus</button>
        </div>
      </div>
      {errMsg ? (
        <p role="alert" className="border-b border-red-500/20 bg-red-50 px-4 py-2 text-xs text-red-900">{errMsg}</p>
      ) : null}
      {!isCollapsed ? (
        <div className="px-4 py-5 sm:px-5">
          <BlokForm blok={b} onChange={(patch) => onGanti(i, patch)} idPrefix={prefix} />
        </div>
      ) : null}
    </div>
  );
});

export function BlockEditor({
  value,
  onChange,
  blockErrors = {},
}: {
  value: Blok[];
  onChange: (b: Blok[]) => void;
  /** blok index → pesan error validasi klien, untuk highlight kartu. */
  blockErrors?: Record<number, string>;
}) {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const idDasar = useId();
  const blok = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const penuh = blok.length >= MAX_BLOK;

  // Ref pola: callback stabil (identitas sama antar render) supaya `memo`
  // BlokCard benar-benar skip render. Tanpa ini, lambda inline + useCallback
  // ber-dep `blok`/`onChange` selalu baru tiap ketikan → memo gagal total.
  const blokRef = useRef(blok);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    blokRef.current = blok;
    onChangeRef.current = onChange;
  }, [blok, onChange]);

  const blokDeferred = useDeferredValue(blok);
  const perkiraanKB = useMemo(() => {
    try {
      return Math.round(JSON.stringify(blokDeferred).length / 1024);
    } catch {
      return 0;
    }
  }, [blokDeferred]);
  const dokumenBesar = perkiraanKB > 800;

  const toggleCollapsed = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const ganti = useCallback((i: number, patch: Partial<Blok>) => {
    const cur = blokRef.current;
    onChangeRef.current(cur.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }, []);

  const hapus = useCallback((i: number) => {
    const cur = blokRef.current;
    onChangeRef.current(cur.filter((_, idx) => idx !== i));
    setInsertIndex(null);
  }, []);

  const duplikat = useCallback((i: number) => {
    const cur = blokRef.current;
    if (cur.length >= MAX_BLOK) return;
    const target = cur[i];
    if (!target) return;
    const jumlahFoto = target.tipe === "galeri" ? (target.items ?? []).length : 0;
    if (jumlahFoto > 10) {
      const ok = window.confirm(
        `Blok galeri ini berisi ${jumlahFoto} foto. Duplikat akan menambah ~${jumlahFoto} gambar di halaman (berat dimuat). Lanjut?`,
      );
      if (!ok) return;
    }
    const copy: Blok = JSON.parse(JSON.stringify(target));
    copy.id = newBlokId();
    const next = [...cur.slice(0, i + 1), copy, ...cur.slice(i + 1)];
    onChangeRef.current(next);
    setInsertIndex(null);
  }, []);

  const pindah = useCallback((i: number, arah: -1 | 1) => {
    const cur = blokRef.current;
    const j = i + arah;
    if (j < 0 || j >= cur.length) return;
    const next = cur.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChangeRef.current(next);
    setInsertIndex(null);
  }, []);

  const pindahKe = useCallback((i: number, target: number) => {
    const cur = blokRef.current;
    if (!Number.isFinite(target) || target < 1 || target > cur.length || target - 1 === i) return;
    const next = cur.slice();
    const [b] = next.splice(i, 1);
    next.splice(target - 1, 0, b!);
    onChangeRef.current(next);
    setInsertIndex(null);
  }, []);

  const tambah = useCallback((tipe: BlokTipe) => {
    const cur = blokRef.current;
    if (cur.length >= MAX_BLOK) return;
    onChangeRef.current([...cur, { ...emptyBlok(tipe), id: newBlokId() }]);
    setMenuTerbuka(false);
    setInsertIndex(null);
  }, []);

  const tambahDi = useCallback((pos: number, tipe: BlokTipe) => {
    const cur = blokRef.current;
    if (cur.length >= MAX_BLOK) return;
    const baru: Blok = { ...emptyBlok(tipe), id: newBlokId() };
    const next = [...cur.slice(0, pos), baru, ...cur.slice(pos)];
    onChangeRef.current(next);
    setMenuTerbuka(false);
    setInsertIndex(null);
  }, []);

  const tutupPilihan = useCallback(() => {
    setMenuTerbuka(false);
    setInsertIndex(null);
  }, []);

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
      {blok.length >= 20 ? (
        <p className="rounded-lg border border-navy/10 bg-cream px-4 py-3 text-xs leading-relaxed text-muted">
          Halaman ini punya {blok.length} blok. Pakai tombol “Ciut” per blok dan kolom “Ke” untuk lompat posisi
          agar tetap responsif.
        </p>
      ) : null}
      {dokumenBesar ? (
        <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          Isi halaman ≈ {perkiraanKB} KB (mendekati batas dokumen ~1 MB). Pertimbangkan memecah ke halaman lain —
          penyimpanan bisa gagal bila terlalu besar.
        </p>
      ) : null}

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

          {insertIndex === 0 && !penuh ? <PilihanBlok onSelect={(tipe) => tambahDi(0, tipe)} onTutup={tutupPilihan} /> : null}

          {blok.map((b, i) => {
            const prefix = `${idDasar}-${b.id ?? i}`;
            const isInsertingHere = insertIndex === i + 1;
            const cardId = b.id ?? `idx-${i}`;

            return (
              <div key={b.id ?? `idx-${i}`} className="space-y-3">
                <BlokCard
                  b={b}
                  i={i}
                  total={blok.length}
                  prefix={prefix}
                  penuh={penuh}
                  cardId={cardId}
                  errMsg={blockErrors[i]}
                  isCollapsed={collapsed.has(cardId)}
                  onToggle={toggleCollapsed}
                  onGanti={ganti}
                  onHapus={hapus}
                  onDuplikat={duplikat}
                  onPindah={pindah}
                  onPindahKe={pindahKe}
                />

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

                {isInsertingHere && !penuh ? <PilihanBlok onSelect={(tipe) => tambahDi(i + 1, tipe)} onTutup={tutupPilihan} /> : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-navy/10 bg-cream p-4">
        <button
          type="button"
          data-tour="blok-tambah"
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

        {menuTerbuka && !penuh ? <PilihanBlok onSelect={tambah} onTutup={tutupPilihan} /> : null}
      </div>
    </section>
  );
}
