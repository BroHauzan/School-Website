import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { OwlMotif } from "@/components/ui/OwlMotif";

export const metadata = { title: "Masuk — Admin SMAN 1 Lumajang", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy text-cream lg:block">
        <OwlMotif variant="watermark" className="absolute -right-16 top-1/2 size-[480px] -translate-y-1/2 text-cream/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <OwlMotif variant="face" className="size-10 text-cream" />
            <span className="text-sm uppercase tracking-[0.24em]">SMAN 1 · Lumajang</span>
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cream/60">Panel Admin</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">Kelola <i className="text-cream/60">berita</i> sekolah.</h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-cream/70">Tulis, sunting, dan tayangkan kabar terkini SMASA langsung ke situs.</p>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-cream/40">Sejak 1960</p>
        </div>
      </div>
      <div className="flex items-center bg-cream px-6 py-16">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy-muted">Masuk Admin</p>
          <h2 className="mt-4 font-display text-4xl text-ink">Selamat <i className="text-navy-muted">datang</i></h2>
          <Suspense><LoginForm /></Suspense>
          <Link href="/" className="mt-6 inline-block text-sm text-muted transition-colors hover:text-navy">← Kembali ke situs</Link>
        </div>
      </div>
    </div>
  );
}
