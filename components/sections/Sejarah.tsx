import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Sejarah — empat periode perjalanan SMAN 1 Lumajang sejak 1960.
 * Sumber: arsip sekolah, diverifikasi pihak sekolah.
 */
const PERIODS = [
  {
    era: "Periode I",
    years: "1960 – 1975",
    title: "Perintis",
    body: "SMA Negeri satu-satunya di Kabupaten Lumajang, yang bermula dari Sekolah Menengah Atas B/C dengan 2 ruang kelas di SGB Negeri Lumajang dan 98 peserta didik. Melalui Surat Keputusan tanggal 16 Juli 1960 dari Inspeksi Sekolah Lanjutan, mulai 1 Agustus 1960 SMA B/C Lumajang diubah menjadi SMA A/B/C — saat Lumajang dipimpin Bp. Soekarjono. Tanggal 1 Agustus 1960 itulah SMA Negeri 1 Lumajang resmi lahir.",
  },
  {
    era: "Periode II",
    years: "1976 – 1992",
    title: "Pembangunan dan Kompetisi",
    body: "Masa pengembangan — penambahan ruang dan sarana belajar. Pada 1976 SMPP dipersiapkan sebagai sekolah persiapan di Lumajang dan para siswanya menempati serta menggunakan fasilitas belajar di SMA Negeri 1 Lumajang; tahun 1977 SMPP berdiri sendiri dengan seluruh pengajar berasal dari SMAN 1 Lumajang. Sejak saat itu dimulai kompetisi sehat di bidang pendidikan antara SMA 1 dengan SMPP (SMA 2).",
  },
  {
    era: "Periode III",
    years: "1993 – 2002",
    title: "Masa Krisis",
    body: "Masa merosotnya pamor SMA Negeri 1 Lumajang, khususnya di bidang akademik — ditandai dengan menurunnya animo masyarakat terhadap sekolah.",
  },
  {
    era: "Periode IV",
    years: "2003 – Sekarang",
    title: "Restrukturisasi",
    body: "Masa pembenahan dan penataan ulang berbagai bidang yang mengarah pada peningkatan prestasi akademik dan sarana belajar. Pengelolaan pendidikan mengikuti perkembangan zaman: keterbukaan dalam pengelolaan dana, peningkatan etos kerja, serta kerja sama dengan komite dan masyarakat dalam mewujudkan visi dan misi sekolah.",
  },
];

export function Sejarah() {
  return (
    <section id="sejarah" className="bg-navy py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          dark
          eyebrow="Sejak 1960"
          title={
            <>
              Empat dekade<i className="text-cream/60">&nbsp;SMASA</i>
            </>
          }
          description="Dari dua ruang kelas pinjaman hingga sekolah rujukan — perjalanan SMA Negeri 1 Lumajang dalam empat periode."
        />

        {/* Timeline vertikal */}
        <div className="relative mt-16">
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-0 w-px bg-cream/15 sm:left-[23px]"
          />
          <ol className="space-y-6">
            {PERIODS.map((p, i) => (
              <Reveal key={p.era} delay={0.06 * i}>
                <li className="relative flex gap-6 sm:gap-8">
                  <span
                    aria-hidden="true"
                    className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-cream/25 bg-navy font-display text-sm font-semibold text-cream/90 sm:size-12"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 rounded-lg border border-cream/15 bg-navy-light p-7 sm:p-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cream/55">
                      {p.era} &middot; {p.years}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-tight text-balance sm:text-3xl">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-cream/65 sm:text-base sm:leading-[1.85]">
                      {p.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Penutup kelembagaan */}
        <Reveal delay={0.15}>
          <div className="mt-12 rounded-lg border border-cream/15 bg-navy/40 p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <p className="max-w-2xl text-sm leading-relaxed text-cream/70 sm:text-base sm:leading-[1.85]">
                Secara kelembagaan, 35% lulusan SMA Negeri 1 Lumajang diterima di
                perguruan tinggi negeri — selebihnya di perguruan tinggi swasta
                dan terjun di masyarakat. Hingga kini sekolah telah meluluskan
                kurang lebih 8.000 alumni, dan sebagian besar pegawai Pemerintah
                Kabupaten Lumajang adalah alumni SMA Negeri 1 Lumajang.
              </p>
              <div className="flex gap-8 lg:gap-10">
                <div>
                  <p className="font-display text-4xl font-semibold tracking-tight text-cream lg:text-5xl">
                    ±8.000
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-cream/60">
                    Alumni sejak 1960
                  </p>
                </div>
                <div>
                  <p className="font-display text-4xl font-semibold tracking-tight text-cream lg:text-5xl">
                    35%
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-cream/60">
                    Lulusan lanjut ke PTN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
