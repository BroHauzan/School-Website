import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { listBerita } from "@/lib/berita-server";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Berita — SMAN 1 Lumajang",
  description:
    "Kabar terkini SMAN 1 Lumajang: aktivitas, capaian, dan pengumuman terbaru dari lingkungan sekolah.",
};

export default async function BeritaPage() {
  const docs = await listBerita();
  const [sorotan, ...lainnya] = docs;

  if (!sorotan) {
    return (
      <>
        <SiteHeader solidOnTop />
        <PageHero
          breadcrumbs={[
            { href: "/", label: "Beranda" },
            { href: "/berita", label: "Berita" },
          ]}
          title="Kabar Terkini"
          description="Belum ada berita yang tersedia saat ini."
        />
        <main className="bg-cream">
          <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <Reveal>
              <div className="mx-auto max-w-xl rounded-lg border border-navy/10 bg-paper px-8 py-14 text-center shadow-[0_24px_60px_-40px_rgba(9,18,43,0.35)]">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-navy/5 font-display text-2xl italic text-navy-muted">
                  &hellip;
                </span>
                <h2 className="mt-6 font-display text-2xl tracking-[-0.01em] text-ink lg:text-3xl">
                  Belum ada <i className="text-navy-muted">berita</i>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  Kabar terbaru dari lingkungan SMA Negeri 1 Lumajang akan tampil di sini
                  setelah dipublikasikan oleh humas sekolah.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/"
                    className="rounded-full bg-navy px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy-light"
                  >
                    Kembali ke Beranda
                  </Link>
                  <Link
                    href="/ppdb"
                    className="rounded-full border border-navy/25 px-7 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy/60"
                  >
                    Info PPDB
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/berita", label: "Berita" },
        ]}
        title={
          <>
            Kabar <i className="text-cream/70">Terkini</i>
          </>
        }
        description="Aktivitas, capaian, dan pengumuman terbaru dari lingkungan SMA Negeri 1 Lumajang — klik untuk membaca selengkapnya."
      />
      <main className="bg-cream">
        <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal>
            <Link
              href={`/berita/${sorotan.slug}`}
              className="group grid overflow-hidden rounded-lg border border-navy/10 bg-paper shadow-[0_24px_60px_-30px_rgba(9,18,43,0.35)] lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-light lg:aspect-auto lg:min-h-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sorotan.image}
                  alt={sorotan.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <span className="absolute left-5 top-5 rounded-full bg-navy/85 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cream">
                  {sorotan.tag}
                </span>
              </div>
              <div className="flex flex-col justify-center p-7 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy-muted">
                  Sorotan · {sorotan.dateLabel}
                </p>
                <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em] text-ink lg:text-4xl">
                  {sorotan.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted">{sorotan.excerpt}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-navy">
                  Baca selengkapnya
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
          {lainnya.length > 0 ? (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lainnya.map((item, i) => (
                  <Reveal key={item.slug} delay={0.08 * (i + 1)}>
                    <Link
                      href={`/berita/${item.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-lg border border-navy/10 bg-paper transition-shadow hover:shadow-[0_24px_60px_-30px_rgba(9,18,43,0.35)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-navy-light">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <span className="absolute left-4 top-4 rounded-full bg-navy/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream">
                          {item.tag}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{item.dateLabel}</p>
                        <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-navy-muted">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                          {item.excerpt}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy">
                          Baca selengkapnya
                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            &rarr;
                          </span>
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
          ) : null}
        </section>

        <SectionDivider />

        <section className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-12 text-cream lg:px-14 lg:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-light via-transparent to-transparent"
              />
              <div className="relative flex flex-wrap items-end justify-between gap-8">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cream/60">
                    Terhubung dengan SMASA
                  </p>
                  <h2 className="mt-4 font-display text-3xl leading-tight lg:text-4xl">
                    Punya kabar untuk <i className="text-cream/70">dibagikan?</i>
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-cream/70">
                    Prestasi, kegiatan, atau pengumuman dari kelas dan ekskulmu layak
                    diberitakan. Hubungi humas sekolah atau kunjungi halaman kontak.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/#kontak"
                    className="rounded-full bg-cream px-7 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white"
                  >
                    Hubungi Kami
                  </Link>
                  <Link
                    href="/ppdb"
                    className="rounded-full border border-cream/30 px-7 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/60"
                  >
                    Info PPDB
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
