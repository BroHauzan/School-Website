"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { BeritaDoc } from "@/lib/berita-server";
import { ConfirmDialog } from "./ConfirmDialog";

export function BeritaTable({ items }: { items: BeritaDoc[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function onDelete(id: string) {
    setErr(null);
    const res = await fetch(`/api/berita/${id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) { setErr(json?.error ?? "Gagal menghapus."); return; }
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-navy/10 bg-paper p-10 text-center">
        <p className="font-display text-2xl text-ink">Belum ada berita</p>
        <p className="mt-2 text-sm text-muted">Klik “Tulis berita” untuk membuat yang pertama.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-navy/10 bg-paper">
      {err ? <p role="alert" className="border-b border-red-500/20 bg-red-50 px-6 py-3 text-sm text-red-900">{err}</p> : null}
      <ul className="divide-y divide-navy/10">
        {items.map((b, i) => (
          <Reveal key={b.id} delay={Math.min(i, 8) * 0.04}>
            <li className="flex flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-cream">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">{b.tag}</span>
                  {!b.published ? <span className="rounded-full border border-amber-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">Draft</span> : null}
                </div>
                <p className="mt-2 truncate font-display text-lg text-ink">{b.title}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-muted">{b.dateLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/berita/${b.slug}`} target="_blank" className="rounded-full border border-navy/20 px-4 py-1.5 text-xs text-navy transition-colors hover:border-navy/50">Lihat</Link>
                <Link href={`/admin/berita/${b.id}/ubah`} className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-navy-light">Ubah</Link>
                <ConfirmDialog title="Hapus berita?" desc={`“${b.title}” akan dihapus permanen.`} onOk={() => onDelete(b.id)} />
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
