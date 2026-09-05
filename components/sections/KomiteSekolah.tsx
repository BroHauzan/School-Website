import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  KOMITE_PIMPINAN,
  KOMITE_BIDANG,
  KOMITE_PENANGGUNG_JAWAB,
  KOMITE_TOTAL_ANGGOTA,
  initials,
} from "@/lib/school";

/**
 * Komite Sekolah — penopang tata kelola sekolah bersama orang tua dan masyarakat.
 * Susunan berdasarkan SK komite terbaru (diverifikasi pihak sekolah).
 */
export function KomiteSekolah() {
  return (
    <section id="komite" className="bg-paper py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          align="center"
          eyebrow="Kemitraan"
          title={
            <>
              Komite<i className="text-navy-muted">&nbsp;Sekolah</i>
            </>
          }
          description={`Sekolah berjalan bersama orang tua dan masyarakat — dipimpin ${KOMITE_TOTAL_ANGGOTA} pengurus yang tersebar di empat bidang kerja.`}
        />

        {/* Penanggung jawab (ex officio) */}
        <Reveal>
          <div className="mt-16 flex flex-col gap-4 rounded-lg border border-navy/10 bg-cream p-8 sm:flex-row sm:items-center sm:gap-8">
            <span
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-full border border-navy/20 font-display text-xl font-semibold tracking-wide text-ink"
            >
              {initials(KOMITE_PENANGGUNG_JAWAB.nama)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy-muted">
                Penanggung Jawab (Ex Officio)
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-balance sm:text-3xl">
                {KOMITE_PENANGGUNG_JAWAB.nama}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Kepala Sekolah sebagai penanggung jawab formal atas seluruh{" "}
                kegiatan komite sekolah.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Pimpinan inti */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-navy/10 bg-navy/10 md:grid-cols-2 lg:grid-cols-4">
          {KOMITE_PIMPINAN.map((orang, i) => (
            <Reveal key={orang.jabatan} delay={0.05 * i} className="h-full">
              <div className="group flex h-full flex-col items-center bg-paper p-8 text-center transition-colors duration-500 hover:bg-navy">
                <span
                  aria-hidden="true"
                  className="flex size-14 shrink-0 items-center justify-center rounded-full border border-navy/20 font-display text-lg font-semibold text-ink transition-colors duration-500 group-hover:border-cream/25 group-hover:text-cream/90"
                >
                  {initials(orang.nama)}
                </span>
                <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-navy-muted transition-colors duration-500 group-hover:text-cream/50">
                  {orang.jabatan}
                </h4>
                <p className="mt-2 text-sm leading-snug text-ink transition-colors duration-500 group-hover:text-cream">
                  {orang.nama}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bidang-bidang */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-navy/10 bg-navy/10 md:grid-cols-2">
          {KOMITE_BIDANG.map((bidang, i) => (
            <Reveal key={bidang.id} delay={0.06 * i} className="h-full">
              <div className="group flex h-full flex-col bg-paper p-8 transition-colors duration-500 hover:bg-navy">
                <h3 className="font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-cream">
                  Bidang {bidang.nama}
                </h3>
                <ul className="mt-6 space-y-3 border-t border-navy/10 pt-5 transition-colors duration-500 group-hover:border-cream/10">
                  {bidang.anggota.map((orang) => (
                    <li
                      key={`${bidang.id}-${orang.nama}`}
                      className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5"
                    >
                      <span className="text-sm font-medium text-ink transition-colors duration-500 group-hover:text-cream/90">
                        {orang.nama}
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-muted transition-colors duration-500 group-hover:text-cream/45">
                        {orang.jabatan}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
