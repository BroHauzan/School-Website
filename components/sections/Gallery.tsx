import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { listGaleri } from "@/lib/galeri-server";

/**
 * Galeri dibaca dari Firestore koleksi `galeri` (kelola via /admin/galeri).
 * Kalau koleksi masih kosong, tampilkan placeholder agar layout tidak rusak
 * sebelum admin mengunggah foto asli.
 */
const FALLBACK = [
  { caption: "Suasana kelas di siang hari", src: "/placeholder-sekolah.svg", wide: false },
  { caption: "Praktikum di laboratorium IPA", src: "/placeholder-sekolah.svg", wide: false },
  { caption: "Produksi konten Media Center", src: "/placeholder-sekolah.svg", wide: true },
  { caption: "Latihan tari di aula", src: "/placeholder-sekolah.svg", wide: false },
  { caption: "Diskusi kelompok di perpustakaan", src: "/placeholder-sekolah.svg", wide: false },
  { caption: "Momen upacara bendera", src: "/placeholder-sekolah.svg", wide: true },
  { caption: "Praktikum biologi", src: "/placeholder-sekolah.svg", wide: false },
];

export async function Gallery() {
  const docs = await listGaleri();
  const items = docs.length > 0 ? docs.map((d) => ({ caption: d.caption, src: d.src, wide: d.wide })) : FALLBACK;
  const isPlaceholder = docs.length === 0;
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

        <div className="mt-16 columns-2 gap-5 sm:columns-2 lg:columns-3">
          {items.map(({ caption, src, wide }, i) => (
            <Reveal key={`${caption}-${i}`} delay={(i % 3) * 0.08} className="mb-5 break-inside-avoid">
              <figure
                className={`group relative overflow-hidden rounded-lg bg-navy-light ${
                  wide ? "aspect-[4/3]" : "aspect-[3/4]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={isPlaceholder ? `${caption} — ganti dengan foto asli siswa SMAN 1 Lumajang` : caption}
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