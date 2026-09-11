import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";
import { listTestimoni } from "@/lib/testimoni-server";

export type TestimonialItem = { quote: string; name: string; role: string };

/**
 * Fallback offline / Firestore kosong — data resmi yang sudah ada di repo
 * (testimoni siswa angkatan 64). Begitu admin menayangkan testimoni di
 * Firestore, daftar ini tidak terpakai.
 */
const FALLBACK: TestimonialItem[] = [
  {
    quote: "Temui aku di rasa sesalmu.",
    name: "Arya Eka Maulidhani",
    role: "Siswa, angkatan 64",
  },
  {
    quote: "Almamater yang pernah aku banggakan kala itu.",
    name: "Awang Pramudya T.",
    role: "Siswa, angkatan 64",
  },
  {
    quote: "Mencoba berpeluang sukses dan gagal daripada tidak mencoba sama sekali.",
    name: "Novemas Heka Alfarizi",
    role: "Siswa, angkatan 64",
  },
];

export async function Testimonials() {
  const docs = await listTestimoni();
  const items: TestimonialItem[] =
    docs.length > 0 ? docs.map((t) => ({ quote: t.quote, name: t.name, role: t.role })) : FALLBACK;

  return (
    <section id="testimoni" className="overflow-x-clip bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Testimoni"
          title={
            <>
              Kata mereka yang <i className="text-navy-muted">pernah duduk di sini</i>
            </>
          }
          description="Suara siswa, alumni, dan guru — apa adanya, tanpa skrip promosi."
        />

        <Reveal delay={0.1}>
          <div className="mt-16 -mx-2.5">
            <TestimonialCarousel items={items} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
