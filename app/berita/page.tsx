import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionDivider } from "@/components/SectionDivider";
import { BERITA } from "@/lib/berita";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Berita — SMAN 1 Lumajang",
  description:
    "Kabar terkini SMAN 1 Lumajang: aktivitas, capaian, dan pengumuman terbaru dari lingkungan sekolah.",
};

export default function BeritaPage() {
  const [sorotan, ...lainnya] = BERITA;

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
          <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <p className="text-center text-muted">Belum ada berita.</p>
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
                  Sorotan · {sorotan.date}
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
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{item.date}</p>
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
