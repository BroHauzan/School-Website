import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

/**
 * // PLACEHOLDER: ganti src="..." di bawah dengan foto asli fasilitas
 * sekolah sebelum publikasi. Jangan gunakan foto stok.
 */
const FACILITIES = [
  {
    title: "Perpustakaan & zona baca",
    desc: "Ruang tenang untuk membaca dan bekerja kelompok.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Laboratorium IPA",
    desc: "Fisika, Kimia, Biologi dengan perangkat praktikum.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Laboratorium komputer",
    desc: "Penunjang pembelajaran TIK dan produksi konten.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Lapangan & aula",
    desc: "Upacara, olahraga, dan pentas seni dalam satu kampus.",
    src: "/placeholder-sekolah.svg",
  },
];

export function Facilities() {
  return (
    <section id="fasilitas" className="bg-paper py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Fasilitas"
          title={
            <>
              Ruang yang <i className="text-navy-muted">mendukung cara belajar</i>{" "}
              hari ini
            </>
          }
          description="Fasilitas terbaik bukan yang paling mewah, melainkan yang paling tepat guna. Semua foto berikut memakai dokumentasi asli sekolah."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {FACILITIES.map(({ title, desc, src }, i) => (
            <Reveal key={title} delay={(i % 2) * 0.1}>
              <figure className="group overflow-hidden rounded-lg border border-navy/10 bg-cream">
                {/* TODO: ganti dengan foto asli tiap fasilitas */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Fasilitas ${title.toLowerCase()} di SMAN 1 Lumajang — ganti dengan foto asli sekolah`}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <figcaption className="flex items-baseline justify-between px-6 py-5">
                  <span className="font-display text-lg text-ink">{title}</span>
                  <span className="text-sm text-muted">{desc}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}