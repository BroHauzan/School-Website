import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { KEPALA_SEKOLAH } from "@/lib/school";

const VISI =
  "Menjadi lembaga pendidikan yang unggul dalam prestasi, berkarakter religius, dan berwawasan global.";

const MISI = [
  "Menyelenggarakan pendidikan berkualitas berbasis kompetensi dan karakter.",
  "Mengembangkan potensi siswa melalui pembelajaran inovatif dan kreatif.",
  "Mewujudkan budaya sekolah yang religius, disiplin, dan berprestasi.",
  "Membangun jejaring dengan institusi pendidikan dan industri dalam dan luar negeri.",
  "Menyediakan sarana dan prasarana pendidikan yang memadai dan modern.",
];

/* Kutipan & nama kepala sekolah: nama bersumber dari lib/school.ts. */
const QUOTE = {
  text: "Pendidikan bukan hanya tentang nilai akademik, tetapi membentuk karakter yang siap menghadapi tantangan masa depan dengan integritas dan kebijaksanaan.",
  author: KEPALA_SEKOLAH.nama,
  role: KEPALA_SEKOLAH.jabatan,
};

export function VisiMisi() {
  return (
    <section className="bg-navy py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          dark
          eyebrow="Visi & Misi"
          title={
            <>
              Arah yang <i className="text-cream/60">jelas</i>, langkah yang terukur
            </>
          }
          description="Visi dan misi yang menjadi pedoman dalam mewujudkan pendidikan berkualitas dan berkarakter."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-lg border border-cream/15 bg-navy-light p-8 lg:p-9">
              <h3 className="font-display text-2xl text-cream">Visi</h3>
              <p className="mt-4 leading-relaxed text-cream/75">{VISI}</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-lg border border-cream/15 bg-navy-light p-8 lg:p-9">
              <h3 className="font-display text-2xl text-cream">Misi</h3>
              <ol className="mt-4 space-y-4">
                {MISI.map((item, i) => (
                  <li key={i} className="relative flex gap-4 leading-relaxed text-cream/75">
                    <span className="absolute -left-2 font-display text-4xl italic leading-none text-cream/10">
                      0{i + 1}
                    </span>
                    <span className="relative z-10 pl-10">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12" delay={0.2}>
          <div className="flex flex-col gap-6 rounded-lg border border-cream/10 bg-navy-muted p-8 md:flex-row md:items-center md:gap-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/smasa.webp"
              alt={QUOTE.author}
              className="size-20 shrink-0 rounded-full object-cover ring-2 ring-cream/20"
              loading="lazy"
            />
            <div className="flex-1">
              <p className="font-display text-lg italic leading-relaxed text-cream/85">
                &ldquo;{QUOTE.text}&rdquo;
              </p>
              <div className="mt-3 text-sm">
                <p className="font-medium text-cream">{QUOTE.author}</p>
                <p className="text-cream/60">{QUOTE.role}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
