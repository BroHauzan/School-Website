"use client";

import { useRef, useState } from "react";
import { inputCls } from "./Field";

export function ImageUploadField({
  value,
  onChange,
  uploadUrl = "/api/berita/upload",
  previewAlt = "Pratinjau gambar header",
}: {
  value: string;
  onChange: (url: string) => void;
  uploadUrl?: string;
  previewAlt?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: form });
      const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Upload gagal.");
      if (!json?.url) throw new Error("Upload gagal: URL kosong.");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-navy/50 disabled:opacity-50"
        >
          {busy ? "Mengunggah…" : value ? "Ganti gambar" : "Unggah gambar"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
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
