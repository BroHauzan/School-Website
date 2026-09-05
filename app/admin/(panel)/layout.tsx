import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/auth-server";
import { adminConfigured } from "@/lib/firebase-admin";
import { missingEnvReport } from "@/lib/env";
import { LogoutButton } from "@/components/admin/LogoutButton";

// Guard server-side: verifikasi session cookie kriptografis.
// proxy.ts hanya cek keberadaan cookie; di sinilah akses benar-benar ditolak.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdminSession();
  if (!session) redirect("/admin/login");

  const ready = adminConfigured();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-40 border-b border-cream/10 bg-navy text-cream">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/smasa.png"
              alt="Logo SMAN 1 Lumajang"
              className="size-8 rounded-full object-contain"
            />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-cream/60">
                SMASA · Admin
              </span>
              <span className="block font-display text-lg leading-tight">Panel Berita</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              Berita
            </Link>
            <Link
              href="/admin/berita/baru"
              className="rounded-full bg-cream px-4 py-2 font-medium text-navy transition-colors hover:bg-white"
            >
              + Tulis berita
            </Link>
            <Link
              href="/berita"
              target="_blank"
              className="hidden rounded-full border border-cream/25 px-4 py-2 text-cream/80 transition-colors hover:border-cream/60 hover:text-cream sm:block"
            >
              Lihat situs
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {!ready ? (
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
            <p className="font-semibold">Firebase Admin belum dikonfigurasi.</p>
            <p className="mt-1">
              Isi environment berikut di <code className="font-mono">.env.local</code> / Vercel:{" "}
              <code className="font-mono">{missingEnvReport().join(", ") || "—"}</code>. Tanpa itu,
              halaman berita tampil kosong dan artikel baru tidak bisa disimpan.
            </p>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">{children}</main>

      <footer className="border-t border-navy/10 py-8">
        <p className="mx-auto max-w-6xl px-6 text-xs uppercase tracking-[0.24em] text-muted">
          SMAN 1 Lumajang · Panel Admin
        </p>
      </footer>
    </div>
  );
}
