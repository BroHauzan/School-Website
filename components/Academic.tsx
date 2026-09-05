import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { PROGRAM_AKADEMIK } from "@/lib/school";
import Link from "next/link";

/**
 * Program Akademik — tiga jurusan yang diverifikasi pihak sekolah.
 * Kartu menampilkan: kode besar (display), nama jurusan, dan daftar mata
 * pelajaran inti sebagai checklist.
 */
export function Academic() {
  return (
    <section id="akademik" className="bg-paper py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          align="center"
          eyebrow="Program Akademik"
          title={
            <>
              Belajar dengan <i className="text-navy-muted">arah</i>, bukan sekadar
              menghafal
            </>
          }
          description="Tiga jalur peminatan — Sosial dan Hukum, Teknik, dan Kesehatan — masing-masing dengan muatan mata pelajaran inti yang relevan."
        />

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-navy/10 bg-navy/10 lg:grid-cols-4">
          {PROGRAM_AKADEMIK.map((jurusan, i) => (
            <Reveal key={jurusan.code} delay={i * 0.1}>
              <article
                aria-label={`${jurusan.name} — ${jurusan.subjects.length} mata pelajaran`}
                className="group relative flex h-full flex-col bg-cream p-8 transition-colors duration-500 hover:bg-navy"
              >
                {/* Code besar — dekoratif / penanda jalur */}
                <span
                  aria-hidden="true"
                  className="block font-display text-4xl font-semibold italic tracking-tight text-navy/20 transition-colors duration-500 group-hover:text-cream/20"
                >
                  {jurusan.code}
                </span>

                {/* Nama jurusan */}
                <h3 className="mt-5 font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-cream">
                  {jurusan.name}
                </h3>

                {/* Daftar mata pelajaran — border-t + list */}
                <ul
                  role="list"
                  className="mt-5 border-t border-navy/10 pt-4 transition-colors duration-500 group-hover:border-cream/15"
                >
                  {jurusan.subjects.map((mapel) => (
                    <li
                      key={mapel}
                      className="flex items-center gap-2 py-1.5 text-sm text-ink transition-colors duration-500 group-hover:text-cream/85"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-navy/35 transition-colors duration-500 group-hover:bg-cream/50"
                      />
                      {mapel}
                    </li>
                  ))}
                </ul>

                <span className="absolute inset-x-8 bottom-0 h-px bg-navy/0 transition-colors duration-500 group-hover:bg-cream/25" />
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="flex flex-col gap-3 rounded-lg border border-navy/10 bg-cream p-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Ingin mengetahui rincian kurikulum, jadwal peminatan, atau pembinaan
              olimpiade sains lebih lanjut?
            </p>
            <Link
              href="/ppdb"
              className="shrink-0 rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-cream transition-all hover:bg-navy-light"
            >
              Lihat jalur masuk
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
