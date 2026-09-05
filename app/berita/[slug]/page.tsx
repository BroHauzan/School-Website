import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { getBeritaBySlug, getBeritaLainDb, listBerita } from "@/lib/berita-server";
import Link from "next/link";

export const revalidate = 300;

type BeritaDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const docs = await listBerita();
  return docs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: BeritaDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getBeritaBySlug(slug);
  if (!item) return { title: "Berita — SMAN 1 Lumajang" };
  return {
    title: `${item.title} — SMAN 1 Lumajang`,
    description: item.excerpt,
  };
}

export default async function BeritaDetailPage({ params }: BeritaDetailProps) {
  const { slug } = await params;
  const item = await getBeritaBySlug(slug);
  if (!item) notFound();
  const lainnya = await getBeritaLainDb(slug);

  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/berita", label: "Berita" },
          { href: `/berita/${item.slug}`, label: item.tag },
        ]}
        title={item.title}
        description={`${item.dateLabel} · ${item.tag}`}
      />
      <main className="bg-cream">
        <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
          <Reveal>
            <Link
              href="/berita"
              className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                &larr;
              </span>
              Semua berita
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 overflow-hidden rounded-lg border border-navy/10 bg-navy-light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-10 font-display text-xl italic leading-relaxed text-navy-muted">
              {item.excerpt}
            </p>
          </Reveal>
          <div className="mt-8 space-y-6">
            {item.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className="text-base leading-[1.9] text-ink/85">{paragraph}</p>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-navy/10 pt-8">
              <span className="rounded-full bg-navy px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream">
                {item.tag}
              </span>
              <span className="text-xs uppercase tracking-[0.22em] text-muted">{item.dateLabel}</span>
            </div>
          </Reveal>
        </article>

        {lainnya.length > 0 ? (
          <>
            <SectionDivider />

            <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy-muted">
                      Lanjut Membaca
                    </p>
                    <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-ink lg:text-4xl">
                      Berita <i className="text-navy-muted">Lainnya</i>
                    </h2>
                  </div>
                  <Link
                    href="/berita"
                    className="group inline-flex items-center gap-3 border-b border-navy/25 pb-1 text-sm font-medium uppercase tracking-[0.18em] text-navy transition-colors hover:border-navy"
                  >
                    Semua berita
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </Reveal>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lainnya.map((related, i) => (
                  <Reveal key={related.slug} delay={0.08 * (i + 1)}>
                    <Link
                      href={`/berita/${related.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-lg border border-navy/10 bg-paper transition-shadow hover:shadow-[0_24px_60px_-30px_rgba(9,18,43,0.35)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-navy-light">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={related.image}
                          alt={related.title}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <span className="absolute left-4 top-4 rounded-full bg-navy/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream">
                          {related.tag}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                            {related.dateLabel}
                          </p>
                        <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-navy-muted">
                          {related.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                          {related.excerpt}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

