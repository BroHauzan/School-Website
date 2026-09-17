import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Footer } from "@/components/ui/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getHalamanForPreview, type HalamanDoc } from "@/lib/halaman-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pratinjau Halaman — SMAN 1 Lumajang",
  robots: { index: false, follow: false },
};

type Ctx = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function PreviewPage({ params, searchParams }: Ctx) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  let doc: HalamanDoc | null = null;
  try {
    doc = await getHalamanForPreview(slug, token);
  } catch {
    doc = null;
  }

  if (!doc) {
    notFound();
  }

  const blok = Array.isArray(doc.blok) ? doc.blok : [];

  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: `/halaman/${doc.slug}`, label: doc.judul },
        ]}
        title={doc.heroTitle || doc.judul}
        description={doc.heroDescription || undefined}
      />
      <main id="konten-utama" className="bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            PREVIEW MODE — this content is not yet published
          </div>
        </div>
        <section className="mx-auto max-w-6xl px-6 py-16">
          {blok.length === 0 ? (
            <p className="text-base leading-relaxed text-muted">
              Konten halaman ini sedang disiapkan.
            </p>
          ) : (
            <BlockRenderer blok={blok} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
