"use client";

import { useEffect, useRef, useState } from "react";
import { inputCls } from "./Field";

export interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  uploadUrl?: string;
  previewAlt?: string;
  onBusyChange?: (busy: boolean) => void;
}

export function ImageUploadField({
  value,
  onChange,
  uploadUrl = "/api/berita/upload",
  previewAlt = "Pratinjau gambar header",
  onBusyChange,
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userCancelledRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Local state untuk input agar pengetikan mulus & tidak memicu onChange/re-render preview per karakter
  const [prevValue, setPrevValue] = useState(value);
  const [localUrl, setLocalUrl] = useState(value);

  // Pola resmi React 19 untuk sinkronisasi prop ke state lokal saat prop berubah dari luar
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalUrl(value);
  }

  // Debounce 400ms: propagasikan ke onChange hanya setelah user jeda/berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      const clean = localUrl.trim().replace(/^["']|["']$/g, "");
      if (clean !== value) {
        setLoadError(false);
        onChange(clean);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localUrl, onChange, value]);

  function setBusyBoth(next: boolean) {
    setBusy(next);
    onBusyChange?.(next);
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  async function upload(file: File) {
    // Abort-previous: user eksplisit pilih file baru → batalkan upload lama
    // agar respons basi tidak menimpa URL hasil upload terbaru.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    userCancelledRef.current = false;
    setError(null);
    setBusyBoth(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: form, signal: controller.signal });
      const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Upload gagal.");
      if (!json?.url) throw new Error("Upload gagal: URL kosong.");
      setLoadError(false);
      setLocalUrl(json.url);
      onChange(json.url);
    } catch (e) {
      const errName = typeof e === "object" && e !== null && "name" in e ? (e as { name: unknown }).name : undefined;
      if (errName === "AbortError") {
        // Jangan panggil onChange: hasil upload yang dibatalkan tidak boleh dipakai.
        setError(userCancelledRef.current ? "Upload dibatalkan." : "Upload dibatalkan, mengunggah file baru...");
      } else {
        setError(e instanceof Error ? e.message : "Upload gagal.");
      }
    } finally {
      // Hanya upload terbaru yang boleh menutup status busy.
      if (abortRef.current === controller) {
        abortRef.current = null;
        setBusyBoth(false);
      }
    }
  }

  function cancel() {
    userCancelledRef.current = true;
    abortRef.current?.abort();
  }

  async function handlePasteClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setError("Clipboard kosong atau tidak berisi teks.");
        return;
      }
      const clean = text.trim().replace(/^["']|["']$/g, "");
      setLocalUrl(clean);
      setLoadError(false);
      setError(null);
      onChange(clean);
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 2000);
    } catch {
      setError("Izin clipboard ditolak oleh browser. Tempelkan URL secara manual pada kotak input.");
    }
  }

  function handleUseDefault() {
    const defaultUrl = "/hero-school.webp";
    setLocalUrl(defaultUrl);
    setLoadError(false);
    setError(null);
    onChange(defaultUrl);
  }

  const isCompleteUrl =
    Boolean(value) &&
    (value.startsWith("/") || /^https?:\/\//i.test(value)) &&
    value.length >= 5;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-navy/20 px-4 py-2 text-xs sm:text-sm font-medium text-navy transition-colors hover:border-navy/50"
        >
          {busy ? "Mengunggah…" : value ? "Ganti file gambar" : "Unggah file gambar"}
        </button>
        {busy ? (
          <button
            type="button"
            onClick={cancel}
            className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:border-red-500/60"
          >
            Batalkan
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 5 * 1024 * 1024) {
                setError("Ukuran file melebihi batas 5MB.");
                e.target.value = "";
                return;
              }
              void upload(f);
            }
            e.target.value = "";
          }}
        />
        <span className="text-[11px] text-muted">JPG/PNG/WebP · maks 5MB</span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="f-header-image"
            value={localUrl}
            onChange={(e) => {
              setLoadError(false);
              setLocalUrl(e.target.value);
            }}
            onBlur={() => {
              const clean = localUrl.trim().replace(/^["']|["']$/g, "");
              if (clean !== value) {
                setLoadError(false);
                onChange(clean);
              }
            }}
            placeholder="/hero-school.webp atau https://res.cloudinary.com/..."
            className={`${inputCls} font-mono text-xs flex-1`}
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/20 bg-white px-3 py-2 text-xs font-medium text-navy transition hover:bg-navy/5 active:scale-95"
              title="Tempel URL gambar dari clipboard"
            >
              <span>📋</span>
              <span>{pasteSuccess ? "✓ Tertempel!" : "Tempel URL"}</span>
            </button>
            <button
              type="button"
              onClick={handleUseDefault}
              className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-xs font-medium text-navy-muted transition hover:bg-navy/5 hover:text-navy"
              title="Gunakan gambar bawaan /hero-school.webp"
            >
              Gunakan Default
            </button>
          </div>
        </div>
      </div>

      {isCompleteUrl ? (
        <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-2xl border border-navy/10 bg-navy/5">
          {/* Layer 1 (Background): Blurred Backdrop */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`bg-${value}`}
            src={value}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
          />
          {/* Layer 2 (Gambar Utama): Centered Contain */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={value}
            src={value}
            alt={previewAlt}
            className="relative z-10 h-full w-full object-contain p-2 drop-shadow-md"
            onError={() => setLoadError(true)}
            onLoad={() => setLoadError(false)}
          />
          {loadError ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 p-4 text-center text-white">
              <span className="text-sm font-semibold">⚠️ Gagal memuat pratinjau gambar</span>
              <span className="mt-1 text-xs opacity-80">Pastikan URL valid dan dapat diakses publik.</span>
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
