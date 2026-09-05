import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import Link from "next/link";

/**
 * Bimbingan Konseling (BK).
 * // PLACEHOLDER: nama guru BK perlu verifikasi dari pihak sekolah.
 */
const LAYANAN = [
  {
    title: "Layanan Akademik",
    desc: "Bimbingan cara belajar, pemilihan jurusan, dan perencanaan studi lanjut.",
  },
  {
    title: "Layanan Pribadi",
    desc: "Ruang aman untuk memahami diri, mengelola emosi, dan membangun kepercayaan diri.",
  },
  {
    title: "Layanan Sosial",
    desc: "Pembinaan keterampilan bergaul, resolusi konflik, dan budaya sekolah yang sehat.",
  },
  {
    title: "Layanan Karier",
    desc: "Eksplorasi minat-bakat serta informasi perguruan tinggi dan dunia kerja.",
  },
];

export function BK() {
  return (
    <section id="bk" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Bimbingan Konseling"
              title={
                <>
                  Ruang untuk<i className="text-navy-muted">&nbsp;tumbuh</i>
                </>
              }
              description="BK bukan tempat bagi yang bermasalah. Ia ruang bagi siapa pun yang ingin mengenali dirinya lebih baik — belajar, berencana, dan bertumbuh."
            />

            <Reveal delay={0.15}>
              <div className="mt-10 rounded-lg border border-navy/10 bg-paper p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy-muted">
                  Konsultasi
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  Siswa dan orang tua dapat menghubungi ruang BK pada jam sekolah.
                  Setiap percakapan dijaga kerahasiaannya.
                </p>
                <p className="mt-5 text-sm font-medium text-ink">
                  Hubungi kami melalui halaman{" "}
                  <Link href="/#kontak" className="underline underline-offset-2 hover:text-navy-muted transition-colors">
                    Kontak
                  </Link>{" "}
                  untuk informasi lebih lanjut.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-navy/10 bg-navy/10 sm:grid-cols-2">
            {LAYANAN.map((item, i) => (
              <Reveal key={item.title} delay={0.06 * i}>
                <div className="group flex h-full flex-col bg-paper p-7 transition-colors duration-500 hover:bg-navy">
                  <span className="font-display text-3xl font-semibold text-navy/15 transition-colors duration-500 group-hover:text-cream/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-cream/70">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
