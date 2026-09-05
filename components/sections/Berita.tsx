import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { listBerita } from "@/lib/berita-server";
import { cn } from "@/lib/utils";
import Link from "next/link";

export async function Berita() {
  const docs = await listBerita();
  const items = docs.map((d) => ({
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    tag: d.tag,
    image: d.image,
    date: d.dateLabel,
  }));
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <section id="berita" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Kabar Terkini"
            title={
              <>
                Berita<i className="text-navy-muted">&nbsp;Sekolah</i>
              </>
            }
            description="Aktivitas, capaian, dan pengumuman terbaru dari lingkungan SMA Negeri 1 Lumajang."
          />
          <Reveal delay={0.15}>
            <Link
              href="/berita"
              className="group inline-flex items-center gap-3 border-b border-navy/25 pb-1 text-sm font-medium uppercase tracking-[0.18em] text-navy transition-colors hover:border-navy"
            >
              Semua berita
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </Reveal>
        </div>

        <div
          className={cn(
            "mt-16 grid gap-10",
            rest.length > 0 && "lg:grid-cols-[1.15fr_0.85fr] lg:gap-14"
          )}
        >
          {/* Berita utama */}
          <Reveal>
            <Link
              href={`/berita/${lead.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-navy/10 bg-paper shadow-[0_24px_60px_-30px_rgba(9,18,43,0.35)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lead.image}
                  alt={lead.title}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <span className="absolute left-5 top-5 rounded-full bg-navy/85 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cream">
                  {lead.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7 lg:p-9">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">{lead.date}</p>
                <h3 className="mt-4 font-display text-2xl leading-snug tracking-[-0.01em] text-ink lg:text-[1.9rem]">
                  {lead.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted">{lead.excerpt}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-navy">
                  Baca selengkapnya
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>

          {rest.length > 0 ? (
            <div className="flex flex-col">
              {rest.map((item, i) => (
                <Reveal key={item.slug} delay={0.08 * (i + 1)}>
                  <Link
                    href={`/berita/${item.slug}`}
                    className={cn(
                      "group block border-b border-navy/10 py-7 first:pt-0 lg:first:pt-0",
                      i === rest.length - 1 && "border-b-0"
                    )}
                  >
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted">
                      <span className="font-semibold text-navy-muted">{item.tag}</span>
                      <span aria-hidden="true" className="h-px w-6 bg-navy/20" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-navy-muted lg:text-[1.4rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                      {item.excerpt}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

