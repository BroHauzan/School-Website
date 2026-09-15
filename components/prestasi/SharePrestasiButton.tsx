"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/berita-schema";
import {
  SHARE_BODY_SELECTOR,
  SHARE_TITLE_SELECTOR,
  fitTitleToDom,
  waitForLayout,
} from "@/lib/share-card-fit";
import { cn } from "@/lib/utils";
import type { PrestasiDoc } from "@/lib/prestasi-schema";
import { CARD_COLORS, CARD_H, CARD_W } from "./share-card-theme";
import { SharePrestasiCard } from "./SharePrestasiCard";

type Phase = "idle" | "working" | "ready" | "error";

/**
 * Cache `@font-face` CSS (font sudah di-self-host next/font) supaya embed font
 * hanya diunduh sekali per sesi, bukan tiap kali tombol share diklik.
 */
let cachedFontCss: Promise<string> | null = null;

/** Off-screen host: kartu dirender di luar viewport, tak terlihat & tak bisa difokus. */
const HOST_STYLE: React.CSSProperties = {
  position: "fixed",
  left: -10000,
  top: 0,
  width: CARD_W,
  height: CARD_H,
  pointerEvents: "none",
  zIndex: -1,
};

/**
 * Muat semua font yang dipakai node sebelum capture. Nama family diambil dari
 * computed style — next/font memakai nama internal (`__Playfair_Display_xxx`),
 * jadi tidak boleh di-hardcode sebagai "Playfair Display".
 */
async function ensureFonts(node: HTMLElement): Promise<void> {
  const fonts = document.fonts;
  if (!fonts) return;
  await fonts.ready;
  const families = new Set<string>();
  for (const el of [node, ...Array.from(node.querySelectorAll("*"))]) {
    for (const raw of getComputedStyle(el).fontFamily.split(",")) {
      const name = raw.trim().replace(/^["']|["']$/g, "");
      if (name && !/^(ui-|system-ui|sans-serif|serif|monospace|Georgia)/i.test(name)) {
        families.add(name);
      }
    }
  }
  await Promise.all(
    Array.from(families).flatMap((family) => [
      fonts.load(`700 1em "${family}"`).catch(() => null),
      fonts.load(`500 1em "${family}"`).catch(() => null),
      fonts.load(`400 1em "${family}"`).catch(() => null),
    ]),
  );
  await fonts.ready;
}


/**
 * Tombol "Bagikan" per baris prestasi. Saat diklik, kartu 1080x1350 dirender
 * off-screen lalu di-capture jadi PNG (html-to-image di-lazy-load supaya tidak
 * masuk bundle awal). Hasilnya tampil di modal: Unduh PNG atau Web Share API
 * bila browser mendukung berbagi file.
 */
export function SharePrestasiButton({
  prestasi,
  dark = false,
}: {
  prestasi: PrestasiDoc;
  /** true = dipakai di atas latar navy (tabel publik), false = latar terang (admin). */
  dark?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  /**
   * Cap ukuran judul hasil pengukuran DOM. Diisi bila judul ternyata lebih
   * tinggi daripada ruang tersedia setelah font siap (kasus font telat termuat,
   * metrik beda per perangkat). `undefined` = pakai hitungan `fitTitle` apa adanya.
   */
  const [titleSizeCap, setTitleSizeCap] = useState<number | undefined>(undefined);
  /** true = judul punya kata lebih lebar dari kolom; izinkan pemenggalan. */
  const [titleBreakWord, setTitleBreakWord] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Object URL aktif — dipakai saat revoke supaya tidak perlu state di closure. */
  const urlRef = useRef<string | null>(null);

  const fileName = `prestasi-${slugify(prestasi.title)}.png`;

  /**
   * Tutup modal + lepas object URL. URL aktif disimpan di ref supaya
   * pembersihan tidak bergantung pada nilai state di closure.
   */
  const close = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPreviewUrl(null);
    setBlob(null);
    setTitleSizeCap(undefined);
    setTitleBreakWord(false);
    setPhase("idle");
    setError(null);
  }, []);

  // Escape menutup modal.
  useEffect(() => {
    if (phase !== "ready" && phase !== "error") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  // Fokus ke tombol Tutup saat modal terbuka.
  useEffect(() => {
    if (phase === "ready") closeRef.current?.focus();
  }, [phase]);

  // Lepas object URL terakhir saat komponen dilepas.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "working") return;
    let cancelled = false;

    (async () => {
      const node = cardRef.current;
      if (!node) {
        if (!cancelled) { setPhase("error"); setError("Kartu gagal dirender."); }
        return;
      }
      try {
        // Pastikan font sudah siap sebelum capture — cegah teks fallback di PNG.
        await ensureFonts(node);

        // Ukur judul di DOM NYATA setelah font siap, lalu turunkan fontnya
        // sampai tinggi naturalnya muat. Ini menutup celah `fitTitle` yang
        // menghitung baris pakai canvas SEBELUM font display termuat: metrik
        // fallback bikin hasil wrap di DOM 1 baris lebih banyak, dan
        // `html-to-image` menyalin tinggi hasil layout ke clone sehingga baris
        // ekstra itu terpotong diam-diam (HP aman, laptop kepotong).
        const bodyEl = node.querySelector<HTMLElement>(SHARE_BODY_SELECTOR);
        const titleEl = node.querySelector<HTMLElement>(SHARE_TITLE_SELECTOR);
        if (bodyEl && titleEl) {
          const cap = await fitTitleToDom(bodyEl, titleEl, {
            onShrink: (size) => setTitleSizeCap(size),
            onBreakWord: () => setTitleBreakWord(true),
          });
          if (cancelled) return;
          // Perubahan state -> React render ulang, tunggu commit-nya dulu.
          if (cap !== null) await waitForLayout();
        }

        const { toBlob, getFontEmbedCSS } = await import("html-to-image");
        const opts = {
          width: CARD_W,
          height: CARD_H,
          canvasWidth: CARD_W,
          canvasHeight: CARD_H,
          pixelRatio: 1,
          backgroundColor: CARD_COLORS.navy,
          cacheBust: true,
        };

        if (!cachedFontCss) cachedFontCss = getFontEmbedCSS(node);
        let out: Blob | null = null;
        try {
          out = await toBlob(node, { ...opts, fontEmbedCSS: await cachedFontCss });
        } catch {
          // Cache basi / fetch font gagal -> coba sekali lagi tanpa cache.
          cachedFontCss = null;
          out = await toBlob(node, opts);
        }
        if (!out) throw new Error("Hasil gambar kosong.");
        if (cancelled) return;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(out);
        urlRef.current = url;
        setBlob(out);
        setPreviewUrl(url);
        setPhase("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Gagal membuat gambar.");
        setPhase("error");
      }
    })();

    return () => { cancelled = true; };
  }, [phase]);

  /** Web Share API dengan file PNG; tombol hanya tampil bila didukung. */
  async function onShare() {
    if (!blob) return;
    const file = new File([blob], fileName, { type: "image/png" });
    try {
      await navigator.share({
        files: [file],
        title: prestasi.title,
        text: `Prestasi ${prestasi.scope} — ${prestasi.title}`,
      });
    } catch {
      // Pengguna membatalkan share — bukan error.
    }
  }

  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    typeof navigator.share === "function" &&
    blob !== null &&
    navigator.canShare({
      files: [new File([blob], fileName, { type: "image/png" })],
    });

  const showModal = phase === "ready" || phase === "error";

  return (
    <>
      <button
        type="button"
        onClick={() => setPhase("working")}
        disabled={phase === "working"}
        aria-label={`Bagikan prestasi: ${prestasi.title}`}
        aria-busy={phase === "working"}
        title="Bagikan prestasi"
        className={cn(
          // Ghost icon-only: kotak 40x40 agar nyaman di-tap, tanpa border.
          "flex size-10 shrink-0 items-center justify-center rounded-full transition-[opacity,background-color,color] duration-150",
          // Desktop: tersembunyi sampai baris di-hover; selalu muncul saat fokus keyboard.
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          // Perangkat sentuh (tanpa hover): tetap terlihat, redup.
          "pointer-coarse:opacity-60",
          dark
            ? "text-cream/55 hover:bg-white/[0.07] hover:text-cream/95"
            : "text-navy/45 hover:bg-navy/5 hover:text-navy/80",
          "disabled:opacity-50",
        )}
      >
        {phase === "working" ? <SpinnerIcon /> : <ShareIcon />}
      </button>

      {/* Kartu dirender off-screen hanya saat proses capture berjalan.
          Ref ada di wrapper DALAM — offset `left:-10000px` host tidak ikut
          ter-clone html-to-image (hanya node + descendant yang dikloning). */}
      {phase === "working" ? (
        <div style={HOST_STYLE} aria-hidden="true">
          <div ref={cardRef} style={{ width: CARD_W, height: CARD_H }}>
            <SharePrestasiCard
              title={prestasi.title}
              scope={prestasi.scope}
              year={prestasi.year}
              dateLabel={prestasi.dateLabel}
              peraih={prestasi.peraih}
              titleSizeCap={titleSizeCap}
              titleBreakWord={titleBreakWord}
            />
          </div>
        </div>
      ) : null}

      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 sm:p-6"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-prestasi-title"
            className="max-h-full w-full max-w-md overflow-y-auto rounded-lg bg-paper p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="share-prestasi-title" className="font-display text-xl text-ink">
              Bagikan prestasi
            </h3>
            <p className="mt-1 text-sm text-muted">{prestasi.title}</p>

            {phase === "error" ? (
              <p role="alert" className="mt-4 rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">
                {error ?? "Gagal membuat gambar."}
              </p>
            ) : null}

            {previewUrl ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-navy/10 bg-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={`Kartu prestasi ${prestasi.title}`}
                  className="mx-auto block max-h-[60vh] w-auto"
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="rounded-full border border-navy/20 px-5 py-2 text-sm text-navy transition-colors hover:border-navy/50"
              >
                Tutup
              </button>
              {previewUrl ? (
                <a
                  href={previewUrl}
                  download={fileName}
                  className="rounded-full border border-navy/20 px-5 py-2 text-sm font-medium text-navy transition-colors hover:border-navy/50 hover:bg-navy/5"
                >
                  Unduh PNG
                </a>
              ) : null}
              {phase === "ready" && canShare ? (
                <button
                  type="button"
                  onClick={onShare}
                  className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-light"
                >
                  Bagikan
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Ikon share sederhana — tidak menambah dependensi ikon. */
function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

/** Indikator proses saat kartu sedang di-capture. */
function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-4 animate-spin"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}


