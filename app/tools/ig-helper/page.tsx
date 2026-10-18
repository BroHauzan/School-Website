"use client";

import { useState } from "react";

export default function InstagramHelperPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError(null);
    setImageUrl(null);
    setCopied(false);

    try {
      const res = await fetch("/api/tools/ig-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        imageUrl?: string;
        message?: string;
      } | null;

      if (!res.ok || !data?.success || !data.imageUrl) {
        throw new Error(data?.message || "Gagal mengekstrak thumbnail Instagram.");
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!imageUrl) return;
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback manual selection
      const el = document.getElementById("cloudinary-url-output") as HTMLTextAreaElement | null;
      if (el) {
        el.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  return (
    <main className="min-h-screen bg-sand px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-navy/10 bg-paper p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-semibold tracking-wider text-navy-muted uppercase">
              Alat Internal Humas SMASA
            </span>
            <h1 className="mt-1 text-2xl font-serif font-bold text-navy sm:text-3xl">
              Instagram Thumbnail Extractor
            </h1>
            <p className="mt-2 text-sm text-navy-muted">
              Ambil gambar sampul dari tautan postingan Instagram publik secara otomatis dan simpan langsung ke Cloudinary folder berita.
            </p>
          </div>

          <form onSubmit={handleExtract} className="space-y-4">
            <div>
              <label
                htmlFor="ig-url-input"
                className="block text-xs font-medium uppercase tracking-wider text-navy"
              >
                URL Postingan Instagram
              </label>
              <input
                id="ig-url-input"
                type="url"
                required
                placeholder="https://www.instagram.com/p/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="mt-1.5 w-full rounded-lg border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <button
              id="btn-extract"
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex w-full items-center justify-center rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Memproses & Mengunggah...
                </span>
              ) : (
                "Ambil & Upload Gambar"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Ekstraksi Gagal</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          {imageUrl && (
            <div
              id="result-container"
              className="mt-8 space-y-4 rounded-xl border border-navy/15 bg-navy/[0.02] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy">
                  URL Cloudinary Hasil Upload
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="rounded-md border border-navy/20 bg-white px-3 py-1 text-xs font-medium text-navy transition hover:bg-navy/5"
                >
                  {copied ? "✓ Tersalin!" : "Salin URL"}
                </button>
              </div>

              <textarea
                id="cloudinary-url-output"
                readOnly
                rows={2}
                value={imageUrl}
                className="w-full resize-none rounded-lg border border-navy/20 bg-white p-2.5 font-mono text-xs text-navy focus:outline-none"
              />

              <div>
                <span className="block mb-2 text-xs font-semibold uppercase tracking-wider text-navy">
                  Pratinjau Gambar
                </span>
                <div className="overflow-hidden rounded-lg border border-navy/15 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Thumbnail Instagram yang diunggah"
                    className="max-h-96 w-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
