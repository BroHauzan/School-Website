"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeritaForm } from "@/components/admin/BeritaForm";
import { todayISO } from "@/lib/berita-schema";

function BeritaBaruFormWrapper() {
  const searchParams = useSearchParams();
  const imageUrlParam = searchParams.get("imageUrl") || "";

  const initial = useMemo(
    () => ({
      title: "",
      excerpt: "",
      tag: "Kesiswaan",
      image: imageUrlParam.trim() || "/hero-school.webp",
      dateISO: todayISO(),
      bodyText: "",
      featured: false,
      published: true,
    }),
    [imageUrlParam]
  );

  return <BeritaForm key={imageUrlParam} mode="create" initial={initial} />;
}

export default function BeritaBaruPage() {
  return (
    <div>
      <Link
        href="/admin"
        className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy"
      >
        ← Semua berita
      </Link>
      <div className="mt-4">
        <SectionHeading
          eyebrow="Berita baru"
          title={
            <>
              Tulis <i className="text-navy-muted">berita</i>
            </>
          }
        />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-navy/5" />}>
            <BeritaBaruFormWrapper />
          </Suspense>
        </div>
      </Reveal>
    </div>
  );
}
