import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * // PLACEHOLDER: ganti dengan testimoni asli siswa / alumni / guru
 * beserta nama lengkap dan angkatan. Saat ini berupa kerangka kosong
 * yang siap diisi data resmi.
 */
const TESTIMONIALS = [
  {
    quote: "Placeholder kutipan siswa. Ganti dengan cerita nyata.",
    name: "Nama Siswa",
    role: "Siswa, angkatan 2024",
  },
  {
    quote: "Placeholder kutipan alumni. Ganti dengan cerita nyata.",
    name: "Nama Alumni",
    role: "Alumni, angkatan 2019",
  },
  {
    quote: "Placeholder kutipan guru. Ganti dengan cerita nyata.",
    name: "Nama Guru",
    role: "Guru mata pelajaran",
  },
];

export function Testimonials() {
  return (
    <section id="testimoni" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Testimoni"
          title={
            <>
              Kata mereka yang <i className="text-navy-muted">pernah duduk di sini</i>
            </>
          }
          description="Suara siswa, alumni, dan guru — apa adanya, tanpa skrip promosi."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <Reveal key={name} delay={i * 0.1}>
              <figure className="flex h-full flex-col justify-between rounded-lg border border-navy/10 bg-paper p-8">
                <div>
                  <span aria-hidden="true" className="block font-display text-5xl italic leading-none text-navy/15">
                    &ldquo;
                  </span>
                  <blockquote className="mt-2 text-base leading-relaxed text-ink/85">
                    {quote}
                  </blockquote>
                </div>
                <figcaption className="mt-8 border-t border-navy/10 pt-5">
                  <p className="font-medium text-ink">{name}</p>
                  <p className="mt-1 text-sm text-muted">{role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}