import { PageHero } from "@/components/ui/PageHero";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import type { HalamanDoc } from "@/lib/halaman-schema";

/**
 * Tampilan halaman persis seperti yang dilihat pengunjung: hero + blok konten.
 * Dipakai halaman pratinjau (`/pratinjau/[id]`).
 */
export function PagePreview({ doc }: { doc: HalamanDoc }) {
  const judul = doc.heroTitle.trim() || doc.judul;
  const deskripsi = doc.heroDescription.trim() || undefined;

  return (
    <div className="bg-cream">
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: doc.systemPath ?? `/halaman/${doc.slug}`, label: doc.navLabel || doc.judul },
        ]}
        title={judul}
        description={deskripsi}
      />
      <main id="konten-utama" className="mx-auto max-w-6xl px-6 py-28 lg:py-40">
        {doc.blok.length > 0 ? (
          <BlockRenderer blok={doc.blok} />
        ) : (
          <p className="text-sm text-muted">Halaman ini belum memiliki blok konten.</p>
        )}
      </main>
    </div>
  );
}
