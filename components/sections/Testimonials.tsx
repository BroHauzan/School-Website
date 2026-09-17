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
    quote: "SMASA membentuk karakter disiplin, wawasan berpikir kritis, dan persaudaraan yang tak ternilai bagi langkah masa depan saya.",
    name: "Arya Eka Maulidhani",
    role: "Alumni SMASA",
  },
  {
    quote: "Almamater kebanggaan dengan guru-guru yang berdedikasi tinggi dan lingkungan belajar yang senantiasa memotivasi untuk berprestasi.",
    name: "Awang Pramudya T.",
    role: "Alumni SMASA",
  },
  {
    quote: "Mencoba berpeluang sukses dan belajar dari kegagalan jauh lebih bermakna daripada tidak mencoba sama sekali.",
    name: "Novemas Heka Alfarizi",
    role: "Alumni SMASA",
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
