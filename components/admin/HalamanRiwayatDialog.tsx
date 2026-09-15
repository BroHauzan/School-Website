"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HalamanVersi } from "@/lib/halaman-schema";

const tanggalID = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatWaktu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${tanggalID.format(d)} WIB`;
}

/**
 * Dialog riwayat versi halaman. Menampilkan maksimum 10 revisi terakhir dan
 * mengizinkan admin mengembalikan halaman ke salah satunya.
 */
export function HalamanRiwayatDialog({ id, judul }: { id: string; judul: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HalamanVersi[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busySavedAt, setBusySavedAt] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/halaman/${id}/riwayat`, { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as
        | { data?: HalamanVersi[]; error?: string }
        | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal memuat riwayat.");
      setItems(Array.isArray(json?.data) ? json.data.slice(0, 10) : []);
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? "Koneksi terputus — riwayat belum bisa dimuat. Periksa internet lalu coba lagi."
          : e instanceof Error
            ? e.message
            : "Gagal memuat riwayat.";
      setErr(msg);
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busySavedAt) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busySavedAt]);

  // Muat riwayat dari event handler, bukan dari efek — menghindari render berantai.
  function bukaDialog() {
    setOpen(true);
    void load();
  }

  async function onRestore(savedAt: string) {
    if (busySavedAt) return;
    setBusySavedAt(savedAt);
    setErr(null);
    try {
      const res = await fetch(`/api/halaman/${id}/riwayat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedAt }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal memulihkan versi.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? "Koneksi terputus — versi belum dipulihkan. Periksa internet lalu coba lagi."
          : e instanceof Error
            ? e.message
            : "Gagal memulihkan versi.";
      setErr(msg);
    } finally {
      setBusySavedAt(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={bukaDialog}
        className="rounded-full border border-navy/20 px-4 py-1.5 text-xs text-navy transition-colors hover:border-navy/50"
      >
        Riwayat
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-6"
          onClick={() => !busySavedAt && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="riwayat-title"
            className="w-full max-w-2xl rounded-lg bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="riwayat-title" className="font-display text-xl text-ink">
              Riwayat halaman
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Simpanan terakhir dari “{judul}”. Pilih “Pulihkan” untuk mengembalikan isi halaman seperti pada
              waktu itu.
            </p>

            {err ? (
              <p role="alert" className="mt-4 rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">
                {err}
              </p>
            ) : null}

            <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-lg border border-navy/10">
              {loading ? (
                <p className="px-5 py-8 text-center text-sm text-muted">Memuat riwayat…</p>
              ) : items && items.length > 0 ? (
                <ul className="divide-y divide-navy/10">
                  {items.map((versi) => (
                    <li key={versi.savedAt} className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base text-ink">{versi.judul || "Tanpa judul"}</p>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-muted">
                          {formatWaktu(versi.savedAt)}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {versi.blok.length} blok konten
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busySavedAt !== null}
                        onClick={() => void onRestore(versi.savedAt)}
                        className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-navy-light disabled:opacity-50"
                      >
                        {busySavedAt === versi.savedAt ? "Memulihkan…" : "Pulihkan"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  Belum ada riwayat. Riwayat tersimpan otomatis setiap kali halaman disimpan.
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                ref={closeRef}
                type="button"
                disabled={busySavedAt !== null}
                onClick={() => setOpen(false)}
                className="rounded-full border border-navy/20 px-5 py-2 text-sm text-navy disabled:opacity-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
