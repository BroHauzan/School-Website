"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke console (bisa diganti dengan error reporting service)
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy-muted">
        Terjadi Kesalahan
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink lg:text-5xl">
        Ups, ada yang salah
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        Halaman ini tidak dapat dimuat saat ini. Coba muat ulang atau kembali ke beranda.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-navy-light"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-navy/5"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
