import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { PpdbCountdown } from "./PpdbCountdown";
import { PPDB_SCHOOL_YEAR, SCHOOL, waHref } from "@/lib/school";

/**
 * // PLACEHOLDER: ketiga jalur berikut kerangka umum PPDB. Persen kuota
 * per jalur belum dicantumkan karena diatur Juknis Dinas — verifikasi.
 */
const PATHS = [
  {
    code: "A",
    name: "Jalur Zonasi",
    desc: "Berdasarkan jarak domisili dari sekolah.",
  },
  {
    code: "B",
    name: "Jalur Prestasi",
    desc: "Berdasarkan nilai rapor dan/atau prestasi unggulan.",
  },
  {
    code: "C",
    name: "Jalur Afirmasi",
    desc: "Untuk keluarga kurang mampu / penyandang disabilitas (sesuai kebijakan daerah).",
  },
];

export function PPDB() {
  return (
    <section id="ppdb" className="bg-paper py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Penerimaan"
          title={
            <>
              Jalur masuk untuk <i className="text-navy-muted">generasi baru</i>
            </>
          }
          description={`Setiap tahun kami menyambut calon siswa baru melalui PPDB tahun ajaran ${PPDB_SCHOOL_YEAR}. Jadwal resmi selalu diumumkan Dinas Pendidikan dan tautan resmi SMAN 1 Lumajang.`}
        />

        <div className="mt-8">
          <PpdbCountdown />
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {PATHS.map(({ code, name, desc }, i) => (
            <Reveal key={code} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-lg border border-navy/10 bg-cream p-8">
                <span className="font-display text-3xl font-semibold italic text-navy/25">
                  Jalur {code}
                </span>
                <h3 className="mt-4 font-display text-xl text-ink">{name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="rounded-lg border border-navy/20 bg-navy p-8 text-cream sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h3 className="font-display text-2xl leading-snug text-balance">
                  Panitia PPDB siap membantu setiap pertanyaan.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  Hubungi kami melalui kontak resmi di bawah. Pastikan mengikuti
                  pengumuman dari kanal resmi agar tidak tertinggal jadwal.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a
                  href={waHref(
                    undefined,
                    `Halo, saya ingin bertanya tentang PPDB ${PPDB_SCHOOL_YEAR} di ${SCHOOL.name}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream px-6 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-white"
                >
                  Tanya via WhatsApp
                </a>
                <a
                  href="https://sman1lumajang.sch.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cream/40 px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-navy"
                >
                  Pengumuman resmi sekolah
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}