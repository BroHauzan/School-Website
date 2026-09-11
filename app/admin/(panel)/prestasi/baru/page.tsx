import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrestasiForm } from "@/components/admin/PrestasiForm";
import { todayISO } from "@/lib/berita-schema";

export const dynamic = "force-dynamic";

export default function PrestasiBaruPage() {
  return (
    <div>
      <Link href="/admin/prestasi" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua prestasi</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Prestasi baru" title={<>Tambah <i className="text-navy-muted">prestasi</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <PrestasiForm
            mode="create"
            initial={{
              year: String(new Date().getFullYear()),
              scope: "Kabupaten",
              title: "",
              peraih: [{ nama: "", kelas: "" }],
              dateISO: todayISO(),
              published: true,
            }}
          />
        </div>
      </Reveal>
    </div>
  );
}
