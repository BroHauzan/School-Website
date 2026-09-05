"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GaleriDoc } from "@/lib/galeri-schema";
import { ConfirmDialog } from "./ConfirmDialog";

export function GaleriTable({ items }: { items: GaleriDoc[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function onDelete(id: string) {
    setErr(null);
    const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) { setErr(json?.error ?? "Gagal menghapus."); return; }
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-navy/10 bg-paper p-10 text-center">
        <p className="font-display text-2xl text-ink">Belum ada foto</p>
        <p className="mt-2 text-sm text-muted">Klik “Tambah foto” untuk mengunggah yang pertama.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-navy/10 bg-paper">
      {err ? <p role="alert" className="border-b border-red-500/20 bg-red-50 px-6 py-3 text-sm text-red-900">{err}</p> : null}
      <ul className="divide-y divide-navy/10">
        {items.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.caption} className="size-14 shrink-0 rounded-lg border border-navy/10 object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">#{g.order}{g.wide ? " · lebar" : ""}</span>
                  {!g.published ? <span className="rounded-full border border-amber-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">Draft</span> : null}
                </div>
                <p className="mt-2 truncate font-display text-lg text-ink">{g.caption}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/galeri/${g.id}/ubah`} className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-navy-light">Ubah</Link>
                <ConfirmDialog title="Hapus foto?" desc={`“${g.caption}” akan dihapus permanen.`} onOk={() => onDelete(g.id)} />
              </div>
            </li>
        ))}
      </ul>
    </div>
  );
}
