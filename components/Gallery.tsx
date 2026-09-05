import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * // PLACEHOLDER: ganti src="..." di bawah dengan foto-foto asli dari
 * kehidupan siswa SMAN 1 Lumajang (kegiatan kelas, ekstrakurikuler,
 * momen akrab, pentas). Tidak ada foto stok.
 */
const MOMENTS = [
  {
    caption: "Suasana kelas di siang hari",
    src: "/placeholder-sekolah.svg",
    wide: false,
  },
  {
    caption: "Praktikum di laboratorium IPA",
    src: "/placeholder-sekolah.svg",
    wide: false,
  },
  {
    caption: "Produksi konten Media Center",
    src: "/placeholder-sekolah.svg",
    wide: true,
  },
  {
    caption: "Latihan tari di aula",
    src: "/placeholder-sekolah.svg",
    wide: false,
  },
  {
    caption: "Diskusi kelompok di perpustakaan",
    src: "/placeholder-sekolah.svg",
    wide: false,
  },
  {
    caption: "Momen upacara bendera",
    src: "/placeholder-sekolah.svg",
    wide: true,
  },
  {
    caption: "Praktikum biologi",
    src: "/placeholder-sekolah.svg",
    wide: false,
  },
];

export function Gallery() {
  return (
    <section id="galeri" className="bg-navy py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          dark
          eyebrow="Kehidupan Siswa"
          title={
            <>
              Momen sehari-hari yang <i className="text-cream/70">jarang difoto</i>{" "}
              — dan itulah yang kami simpan
            </>
          }
          description="Bukan galeri promosi yang dipoles, tapi potongan jujur dari hari-hari di kampus. Semua foto di bawah adalah dokumentasi asli."
        />

        <div className="mt-16 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {MOMENTS.map(({ caption, src, wide }, i) => (
            <Reveal key={caption} delay={(i % 3) * 0.08} className="mb-5 break-inside-avoid">
              <figure
                className={`group relative overflow-hidden rounded-lg bg-navy-light ${
                  wide ? "aspect-[4/3]" : "aspect-[3/4]"
                }`}
              >
                {/* TODO: ganti dengan foto asli kehidupan siswa */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${caption} — ganti dengan foto asli siswa SMAN 1 Lumajang`}
                  className="h-full w-full object-cover opacity-80 transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:opacity-100"
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-5 text-sm text-cream/90">
                  {caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}