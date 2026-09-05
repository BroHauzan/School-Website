import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import {
  KEPALA_SEKOLAH,
  STAFF_PERAN_TOTAL,
  STAFF_TEAMS,
  initials,
} from "@/lib/school";

/**
 * Jajaran pimpinan: kepala sekolah + enam tim kerja.
 * Sumber data: lib/school.ts (STAFF_TEAMS), diverifikasi pihak sekolah.
 */
export function Struktur() {
  return (
    <section id="struktur" className="bg-navy py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          dark
          eyebrow="Jajaran Pimpinan"
          title={
            <>
              Orang-orang di balik<i className="text-cream/60">&nbsp;SMASA</i>
            </>
          }
          description={`Satu kepala sekolah dan ${STAFF_PERAN_TOTAL - 1} peran yang tersebar di ${STAFF_TEAMS.length} tim — dari kurikulum dan kesiswaan hingga tata tertib dan keuangan.`}
        />

        {/* Kepala sekolah */}
        <Reveal delay={0.1} className="mt-16">
          <div className="flex flex-col gap-6 rounded-lg border border-cream/15 bg-navy-light p-8 sm:flex-row sm:items-center sm:gap-8 sm:p-10">
            <span
              aria-hidden="true"
              className="flex size-20 shrink-0 items-center justify-center rounded-full border border-cream/25 font-display text-2xl font-semibold tracking-wide text-cream/90"
            >
              {initials(KEPALA_SEKOLAH.nama)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cream/55">
                {KEPALA_SEKOLAH.jabatan}
              </p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-balance sm:text-4xl">
                {KEPALA_SEKOLAH.nama}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/65">
                Menanggung jawab seluruh penyelenggaraan pendidikan di{" "}
                {"SMA Negeri 1 Lumajang"}.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Enam tim */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-cream/10 bg-cream/10 md:grid-cols-2">
          {STAFF_TEAMS.map((tim, i) => (
            <Reveal key={tim.id} delay={0.05 * i} className="h-full">
              <div className="group flex h-full flex-col bg-navy p-8 transition-colors duration-500 hover:bg-navy-light">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl leading-snug text-cream">
                    {tim.nama}
                  </h3>
                  <span className="font-display text-lg text-cream/25 transition-colors duration-500 group-hover:text-cream/40">
                    {String(tim.anggota.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">
                  {tim.tugas}
                </p>
                <ul className="mt-7 space-y-3 border-t border-cream/10 pt-6">
                  {tim.anggota.map((orang) => (
                    <li
                      key={`${tim.id}-${orang.nama}-${orang.jabatan}`}
                      className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5"
                    >
                      <span className="text-sm font-medium text-cream/90">
                        {orang.nama}
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/45">
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
