import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth-server";
import { getHalamanById } from "@/lib/halaman-server";
import { PagePreview } from "@/components/admin/PagePreview";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pratinjau halaman",
  robots: { index: false, follow: false },
};

export default async function PratinjauPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const item = await getHalamanById(id);
  if (!item) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-28">
          <h1 className="font-display text-4xl text-ink">Halaman tidak ditemukan</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Halaman yang ingin dipratinjau tidak ada atau sudah dihapus.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-50 border-b border-amber-500/40 bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
              Mode pratinjau
            </p>
            <p className="mt-0.5 text-sm text-amber-900">
              Tampilan ini hanya untuk admin. Pengunjung belum tentu melihat perubahan yang belum disimpan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
              {item.published ? "Tayang" : "Draft"}
            </span>
            <a
              href={`/admin/halaman/${item.id}/ubah`}
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-light"
            >
              Kembali ke editor
            </a>
          </div>
        </div>
      </div>
      <PagePreview doc={item} />
    </div>
  );
}
