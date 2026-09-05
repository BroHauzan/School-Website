import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

/**
 * Alumni — angka mengacu pada halaman Sejarah sman1lumajang.sch.id:
 * ±8000 lulusan, ~35% diterima di perguruan tinggi negeri.
 */
const STATS = [
  { value: "±8.000", label: "Alumni terserak sejak 1960" },
  { value: "35%", label: "Lulusan lanjut ke PTN" },
  { value: "65+", label: "Tahun perjalanan SMASA" },
];

const JEJAK = [
  {
    title: "Mengabdi untuk Daerah",
    desc: "Sebagian besar pegawai Pemerintah Kabupaten Lumajang adalah alumni SMA Negeri 1 Lumajang.",
  },
  {
    title: "Jaringan Angkatan",
    desc: "Setiap angkatan menjaga tali silaturahmi — dari reuni kelas hingga beasiswa untuk adik kelas.",
  },
  {
    title: "Kembali ke Rumah",
    desc: "Alumni hadir sebagai pembina, narasumber karier, dan mentor bagi siswa yang menatap masa depan.",
  },
];

export function Alumni() {
  return (
    <section id="alumni" className="bg-navy-light py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
          <SectionHeading
            dark
            eyebrow="Jejak Lulusan"
            title={
              <>
                Alumni<i className="text-cream/60">&nbsp;SMASA</i>
              </>
            }
            description="Lebih dari empat dekade, burung hantu ini melepas terbang generasinya. Mereka kembali sebagai cahaya bagi generasi berikutnya."
          />

          <Reveal delay={0.1}>
            <div className="grid gap-px overflow-hidden rounded-lg border border-cream/10 bg-cream/10 sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.label} className="bg-navy-light p-6">
                  <p className="font-display text-3xl font-semibold tracking-tight text-cream lg:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-cream/60">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-cream/10 bg-cream/10 lg:grid-cols-3">
          {JEJAK.map((item, i) => (
            <Reveal key={item.title} delay={0.07 * i}>
              <div className="group flex h-full flex-col bg-navy-light p-8 transition-colors duration-500 hover:bg-navy">
                <span className="font-display text-3xl font-semibold text-cream/15 transition-colors duration-500 group-hover:text-cream/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-xl leading-snug text-cream">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/65">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-lg border border-cream/15 bg-navy/40 p-8">
            <p className="max-w-md text-sm leading-relaxed text-cream/70">
              Terdaftar sebagai alumni? Lengkapi data dirimu agar jaringan SMASA tetap
              terhubung — nama, angkatan, kelas, dan jejak kariermu.
            </p>
            <a
              href="https://sman1lumajang.sch.id/alumni"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full border border-cream/40 px-6 py-3 text-sm font-medium uppercase tracking-[0.16em] text-cream transition-all hover:bg-cream hover:text-navy"
            >
              Portal Alumni
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
