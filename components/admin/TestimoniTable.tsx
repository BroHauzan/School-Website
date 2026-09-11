"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TestimoniDoc } from "@/lib/testimoni-schema";
import { ConfirmDialog } from "./ConfirmDialog";

export function TestimoniTable({ items }: { items: TestimoniDoc[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function onDelete(id: string) {
    setErr(null);
    const res = await fetch(`/api/testimoni/${id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) { setErr(json?.error ?? "Gagal menghapus."); return; }
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-navy/10 bg-paper p-10 text-center">
        <p className="font-display text-2xl text-ink">Belum ada testimoni</p>
        <p className="mt-2 text-sm text-muted">Klik “Tambah testimoni” untuk menginput yang pertama.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-navy/10 bg-paper">
      {err ? <p role="alert" className="border-b border-red-500/20 bg-red-50 px-6 py-3 text-sm text-red-900">{err}</p> : null}
      <ul className="divide-y divide-navy/10">
        {items.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-cream">
            <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy/60">No. {t.order}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-relaxed text-ink/85">“{t.quote}”</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                {t.name} — {t.role}{!t.published ? " · Draft" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/testimoni/${t.id}/ubah`} className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-navy-light">Ubah</Link>
              <ConfirmDialog title="Hapus testimoni?" desc={`Kutipan “${t.name}” akan dihapus permanen.`} onOk={() => onDelete(t.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
