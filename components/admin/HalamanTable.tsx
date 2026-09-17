"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HalamanDoc, NavGroupsItem } from "@/lib/halaman-schema";
import { ConfirmDialog } from "./ConfirmDialog";
import { DampakHapus } from "./DampakHapus";
import { HalamanRiwayatDialog } from "./HalamanRiwayatDialog";

/** Alamat yang ditampilkan ke admin — halaman bawaan pakai path aslinya. */
function alamatHalaman(h: HalamanDoc): string {
  if (h.systemPath) return h.systemPath === "/" ? "/" : h.systemPath;
  return `/halaman/${h.slug}`;
}

export function HalamanTable({
  items,
  groups,
}: {
  items: HalamanDoc[];
  groups: NavGroupsItem[];
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  // Toast sukses setelah simpan (QA 4.1): form tulis ke sessionStorage lalu redirect ke sini.
  const [notice, setNotice] = useState<string | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const msg = window.sessionStorage.getItem("halaman-notice");
      if (msg) window.sessionStorage.removeItem("halaman-notice");
      return msg;
    } catch {
      return null;
    }
  });
  // Halaman yang dialog hapusnya sedang terbuka: dipakai untuk memuat dampak.
  const [dampakUntuk, setDampakUntuk] = useState<string | null>(null);
  const labelGrup = new Map(groups.map((g) => [g.groupKey, g.label]));

  // `paksa` dikirim hanya setelah admin melihat peringatan tautan di dialog,
  // supaya server tahu ini keputusan sadar — bukan klik asal.
  async function onDelete(id: string, paksa = false): Promise<boolean> {
    setErr(null);
    try {
      const url = `/api/halaman/${id}${paksa ? "?paksa=1" : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal menghapus.");
      router.refresh();
      return true;
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? "Koneksi terputus — halaman belum dihapus. Periksa internet lalu coba lagi."
          : e instanceof Error
            ? e.message
            : "Gagal menghapus.";
      setErr(msg);
      throw new Error(msg);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-navy/10 bg-paper p-10 text-center">
        <p className="font-display text-2xl text-ink">Belum ada halaman</p>
        <p className="mt-2 text-sm text-muted">Klik “Halaman baru” untuk membuat yang pertama.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-navy/10 bg-paper">
      {notice ? (
        <p role="status" className="flex items-center justify-between gap-3 border-b border-emerald-600/20 bg-emerald-50 px-6 py-3 text-sm text-emerald-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-xs underline" aria-label="Tutup pemberitahuan">Tutup</button>
        </p>
      ) : null}
      {err ? (
        <p role="alert" className="border-b border-red-500/20 bg-red-50 px-6 py-3 text-sm text-red-900">
          {err}
        </p>
      ) : null}
      <ul className="divide-y divide-navy/10">
        {items.map((h) => {
          const isSystem = h.systemPath !== null;
          const grup = h.groupKey ? labelGrup.get(h.groupKey) ?? "Menu induk tidak dikenal" : "Tanpa menu";
          return (
            <li key={h.id} className="flex flex-wrap items-start gap-4 px-6 py-5 transition-colors hover:bg-cream">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {isSystem ? (
                    <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">
                      Halaman bawaan
                    </span>
                  ) : null}
                  {!h.published ? (
                    <span className="rounded-full border border-amber-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                      Draft
                    </span>
                  ) : null}
                  <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">
                    {h.blok.length} blok
                  </span>
                </div>
                <p className="mt-2 truncate font-display text-lg text-ink">{h.judul}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{alamatHalaman(h)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {grup} · urutan #{h.urutan}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/pratinjau/${h.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-navy/20 px-4 py-1.5 text-xs text-navy transition-colors hover:border-navy/50"
                >
                  Pratinjau
                </Link>
                <HalamanRiwayatDialog id={h.id} judul={h.judul} />
                <Link
                  href={`/admin/halaman/${h.id}/ubah`}
                  className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-navy-light"
                >
                  Ubah
                </Link>
                {isSystem ? (
                  <>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Halaman bawaan tidak bisa dihapus — alamatnya dipakai menu & tautan lain"
                      className="cursor-not-allowed rounded-full border border-navy/10 px-4 py-1.5 text-xs font-medium text-muted opacity-40"
                    >
                      Hapus
                    </button>
                    <ConfirmDialog
                      title="Kosongkan isi halaman bawaan?"
                      desc={`Isi dan tambahan konten “${h.judul}” akan dikosongkan. Halaman ${alamatHalaman(h)} tetap bisa dibuka pengunjung seperti biasa, lalu bisa Anda isi ulang. Riwayat sebelumnya tetap tersimpan.`}
                      confirm="Ya, kosongkan isi"
                      triggerLabel="Kosongkan isi"
                      triggerClassName="rounded-full border border-amber-600/40 px-4 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:border-amber-600/70"
                      onOk={() => onDelete(h.id)}
                    />
                  </>
                ) : (
                  <ConfirmDialog
                    title="Hapus halaman?"
                    desc={`“${h.judul}” beserta seluruh isinya akan dihapus permanen dan alamat ${alamatHalaman(h)} tidak bisa lagi dibuka.`}
                    extra={dampakUntuk === h.id ? <DampakHapus id={h.id} /> : null}
                    confirm={dampakUntuk === h.id ? "Tetap hapus" : undefined}
                    onOpenChange={(open) => setDampakUntuk(open ? h.id : null)}
                    onOk={() => onDelete(h.id, true)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
