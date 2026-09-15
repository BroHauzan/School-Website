import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Footer } from "@/components/ui/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getHalamanBySlug, type HalamanDoc } from "@/lib/halaman-server";

/**
 * Isi halaman builder (halaman publik `systemPath === null`).
 * Hero selalu ditampilkan; judul = `heroTitle || judul`, deskripsi =
 * `heroDescription` bila diisi.
 */
export function HalamanBuilderBody({ doc }: { doc: HalamanDoc }) {
  const blok = Array.isArray(doc.blok) ? doc.blok : [];
  if (blok.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 lg:py-28">
        <p className="text-base leading-relaxed text-muted">
          Konten halaman ini sedang disiapkan.
        </p>
      </section>
    );
  }
  return <BlockRenderer blok={blok} />;
}

/**
 * Render publik halaman builder berdasarkan `slug` (`/halaman/[slug]`).
 * Dokumen hilang / draft → 404.
 */
export async function HalamanBuilderPage({ slug }: { slug: string }) {
  const doc = await getHalamanBySlug(slug);
  if (!doc || doc.published === false) notFound();

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
        <section className="mx-auto max-w-6xl px-6 py-16">
          <HalamanBuilderBody doc={doc} />
        </section>
      </main>
      <Footer />
    </>
  );
}
