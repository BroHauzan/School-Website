import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  MAPS,
  SCHOOL,
  SOCIALS,
  displayPhone,
  fullAddress,
  telHref,
  waHref,
} from "@/lib/school";

const CONTACT_ROWS = [
  {
    term: "Telepon",
    value: displayPhone(),
    href: telHref(),
  },
  {
    term: "WhatsApp",
    value: SCHOOL.whatsapp
      ? `+62 ${SCHOOL.whatsapp.replace(/^0/, "")}`
      : "Menunggu verifikasi sekolah",
    href: waHref(),
  },
  {
    term: "Email",
    value: SCHOOL.email,
    href: `mailto:${SCHOOL.email}`,
  },
  {
    term: "Jam layanan",
    value: SCHOOL.officeHours,
    href: null,
  },
];

export function Contact() {
  return (
    <section id="kontak" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Lokasi & Kontak"
          title={
            <>
              Kunjungi kami di <i className="text-navy-muted">Lumajang</i>
            </>
          }
          description="Kampus berada di jantung Kabupaten Lumajang, Jawa Timur — mudah dijangkau dari berbagai arah."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="h-full">
            <div className="flex h-full flex-col justify-between rounded-lg border border-navy/10 bg-paper p-8">
              <address className="not-italic">
                <p className="font-medium text-ink">{SCHOOL.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {fullAddress()}
                </p>
                <p className="mt-1 text-sm text-muted">NPSN {SCHOOL.npsn}</p>

                <dl className="mt-8 space-y-4 text-sm">
                  {CONTACT_ROWS.map(({ term, value, href }) => (
                    <div key={term} className="flex gap-3">
                      <dt className="w-24 shrink-0 font-medium text-ink">
                        {term}
                      </dt>
                      <dd className="text-muted">
                        {href ? (
                          <a
                            href={href}
                            className="break-all text-navy underline-offset-4 transition-colors hover:text-navy-muted hover:underline"
                            {...(href.startsWith("http")
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </address>

              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                  Akun Resmi
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {SOCIALS.map(({ label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-navy/20 px-4 py-2 text-xs font-medium text-navy transition-colors hover:bg-navy hover:text-cream"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-lg border border-navy/10 bg-navy-light">
              <iframe
                src={MAPS.embed}
                title={`Peta lokasi ${SCHOOL.name}`}
                className="min-h-[360px] w-full flex-1 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="flex flex-wrap items-center justify-between gap-4 bg-navy px-6 py-4">
                <p className="text-sm text-cream/70">
                  {SCHOOL.address.street}, {SCHOOL.address.city}
                </p>
                <a
                  href={MAPS.short}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream px-5 py-2 text-sm font-medium text-navy transition-colors hover:bg-white"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
