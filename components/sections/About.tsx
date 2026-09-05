import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OwlMotif } from "@/components/ui/OwlMotif";
import { SCHOOL } from "@/lib/school";

export function About() {
  return (
    <section id="tentang" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Tentang Sekolah"
          title={
            <>
              Mengapa<i className="text-navy-muted">&nbsp;burung hantu?</i>
            </>
          }
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <div className="space-y-7 text-lg leading-[1.85] text-ink/85">
              <p>
                Hampir setiap budaya menaruh burung hantu di tempat yang istimewa:
                penjaga pengetahuan, pembaca malam, pengamat yang tak banyak bicara
                tetapi melihat lebih jauh daripada yang lain. Identitas itu yang kami
                pilih — bukan sekadar lambang, melainkan cara kami mendidik.
              </p>
              <p>
                Berdiri sejak 1960 di kaki dataran tinggi yang diapit Gunung Semeru,
                SMA Negeri 1 Lumajang tumbuh bersama generasi demi generasi. Kami
                percaya ilmu adalah cahaya, dan ketajaman visi adalah sayapnya —
                kemampuan melihat peluang bahkan ketika sekitar masih gelap.
              </p>
              <p className="text-ink/70">
                Di sinilah kami melatih tiga hal: berpikir kritis seperti tatapan
                burung hantu di malam hari, bertindak tenang seperti penerbangannya
                yang tanpa suara, serta memakai ilmu untuk kebaikan yang lebih luas
                dari diri sendiri.
              </p>
            </div>
          </Reveal>

          <div className="relative">
            <Reveal delay={0.1} className="relative z-10">
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-school.webp"
                  alt="Gerbang depan SMA Negeri 1 Lumajang"
                  className="aspect-[4/5] w-full rounded-lg object-cover"
                  loading="lazy"
                />
                <figcaption className="mt-3 text-sm text-muted">
                  Gerbang {SCHOOL.name}, {SCHOOL.address.street}
                </figcaption>
              </figure>
            </Reveal>

            {/* Bingkai dekoratif motif sayap */}
            <OwlMotif
              variant="wing"
              className="absolute -left-10 -top-10 z-0 h-44 w-44 text-navy/10"
            />

            <Reveal delay={0.2} className="relative z-20 -mt-10 ml-auto w-fit max-w-[260px]">
              <div className="rounded-lg border border-navy/10 bg-paper p-6 shadow-[0_24px_60px_-24px_rgba(9,18,43,0.25)]">
                <p className="font-display text-5xl font-semibold tracking-tight text-navy">
                  {SCHOOL.established}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Tahun berdiri; lebih dari empat dekade melahirkan lulusan yang
                  melanjutkan studinya ke seluruh penjuru negeri.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}