import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan — SMAN 1 Lumajang",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy-muted">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink lg:text-5xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        Halaman yang kamu cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-navy-light"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
