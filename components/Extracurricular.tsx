import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { EKSTRAKURIKULER, EKSKUL_TOTAL } from "@/lib/school";

/**
 * Ekstrakurikuler — daftar unit kegiatan siswa yang diverifikasi pihak sekolah.
 * Grid bernomor 01–15 tanpa asumsi tambahan.
 */
export function Extracurricular() {
  return (
    <section id="eskul" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          align="center"
          eyebrow="Ekstrakurikuler"
          title={
            <>
              Habis pelajaran, <i className="text-navy-muted">panggung tetap berlanjut</i>
            </>
          }
          description={`Sekolah hidup selepas bel terakhir berbunyi — ${EKSKUL_TOTAL} ekstrakurikuler siap dipilih sesuai minat.`}
        />

        {/* Grid bernomor 01–15 */}
        <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {EKSTRAKURIKULER.map((ekskul, i) => (
            <Reveal key={ekskul.name} delay={0.04 * i}>
              <article
                aria-label={`${String(i + 1).padStart(2, "0")}. ${ekskul.name}`}
                className="group relative rounded-lg border border-navy/10 bg-paper p-5 transition-all duration-400 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_12px_32px_-16px_rgba(9,18,43,0.2)]"
              >
                {/* Nomor besar pudar — dekoratif */}
                <span
                  aria-hidden="true"
                  className="block font-display text-4xl font-semibold tracking-tight text-navy/10 transition-colors duration-400 group-hover:text-navy/20"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Nama eskul */}
                <h3 className="mt-3 font-display text-base leading-snug text-ink transition-colors duration-400 group-hover:text-navy">
                  {ekskul.name}
                </h3>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
