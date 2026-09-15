"use client";

import { BlockField, BlockInput } from "./BlockField";
import { cn } from "@/lib/utils";

/**
 * Editor daftar baris (`items`) untuk blok `galeri` (URL foto + pratinjau)
 * dan `daftar` (teks biasa). Tanpa drag-and-drop — pakai tombol naik/turun
 * supaya tetap nyaman di HP.
 */
export function BlockItemList({
  items,
  onChange,
  mode,
  max,
  label,
  hint,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  mode: "galeri" | "daftar";
  max?: number;
  label?: string;
  hint?: string;
}) {
  const penuh = typeof max === "number" && items.length >= max;
  const defaultLabel = mode === "galeri" ? "Foto galeri" : "Isi daftar";
  const defaultHint =
    mode === "galeri"
      ? "Tempel alamat foto (mis. /hero-school.webp) atau unggah lewat menu Galeri lalu salin alamatnya."
      : "Satu baris = satu poin dalam daftar.";

  function ubah(i: number, val: string) {
    const next = items.slice();
    next[i] = val;
    onChange(next);
  }

  function tambah() {
    if (penuh) return;
    onChange([...items, ""]);
  }

  function hapus(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function pindah(i: number, arah: -1 | 1) {
    const j = i + arah;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChange(next);
  }

  const btn =
    "rounded-full border border-navy/20 px-3 py-1.5 text-xs text-navy transition-colors hover:border-navy/50 disabled:opacity-40 disabled:hover:border-navy/20";

  return (
    <BlockField label={label ?? defaultLabel} hint={hint ?? defaultHint}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-navy/20 bg-cream px-4 py-3 text-sm text-muted">
            Belum ada isi. Klik “Tambah baris” untuk mulai.
          </p>
        ) : null}

        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-wrap items-start gap-3 rounded-lg border border-navy/10 bg-paper p-3",
              mode === "galeri" && "sm:flex-nowrap",
            )}
          >
            {mode === "galeri" ? (
              <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-navy/10 bg-navy-light">
                {item ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item} alt={`Foto ${i + 1}`} loading="lazy" className="size-16 object-cover" />
                ) : null}
              </div>
            ) : (
              <span className="mt-3 w-6 shrink-0 text-center text-xs font-semibold text-navy/50">{i + 1}.</span>
            )}

            <div className="min-w-0 flex-1">
              <BlockInput
                value={item}
                onChange={(e) => ubah(i, e.target.value)}
                aria-label={`${mode === "galeri" ? "Alamat foto" : "Isi daftar"} ${i + 1}`}
                placeholder={mode === "galeri" ? "/foto-sekolah.webp" : "Tulis di sini…"}
                className={cn(mode === "galeri" && "font-mono text-xs")}
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => pindah(i, -1)} disabled={i === 0} className={btn} aria-label={`Naikkan baris ${i + 1}`}>
                ↑
              </button>
              <button
                type="button"
                onClick={() => pindah(i, 1)}
                disabled={i === items.length - 1}
                className={btn}
                aria-label={`Turunkan baris ${i + 1}`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => hapus(i)}
                className="rounded-full border border-red-900/25 px-3 py-1.5 text-xs text-red-900 transition-colors hover:border-red-900/60"
                aria-label={`Hapus baris ${i + 1}`}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={tambah}
            disabled={penuh}
            className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-navy/50 disabled:opacity-40 disabled:hover:border-navy/20"
          >
            + Tambah baris
          </button>
          <span className="text-xs text-muted">
            {items.length} baris{typeof max === "number" ? ` dari maksimal ${max}` : ""}
          </span>
        </div>
      </div>
    </BlockField>
  );
}
