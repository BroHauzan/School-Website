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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-navy/50"
        >
          {busy ? "Mengunggah…" : value ? "Ganti gambar" : "Unggah gambar"}
        </button>
        {busy ? (
          <button
            type="button"
            onClick={cancel}
            className="rounded-full border border-red-500/30 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:border-red-500/60"
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
        <span className="text-xs text-muted">JPG / PNG / WebP · maks 5MB</span>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/hero-school.webp atau https://…"
        className={`${inputCls} mt-3 font-mono text-xs`}
      />
      {value ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-navy/10 bg-navy-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={previewAlt} className="aspect-[16/9] w-full object-cover" />
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
