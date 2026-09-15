import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HalamanForm, type HalamanFormValue } from "@/components/admin/HalamanForm";
import { listHalaman } from "@/lib/halaman-server";
import { getNavGroups } from "@/lib/nav-groups-server";

export const dynamic = "force-dynamic";

export default async function HalamanBaruPage() {
  const [items, groupsDoc] = await Promise.all([
    listHalaman({ includeDraft: true }),
    getNavGroups(),
  ]);
  // Urutan awal: paling belakang, supaya halaman lama tidak bergeser.
  const urutan = items.reduce((max, h) => Math.max(max, h.urutan), -1) + 1;
  const initial: HalamanFormValue = {
    judul: "",
    slug: "",
    navLabel: "",
    groupKey: null,
    urutan,
    showInNav: true,
    collapsible: false,
    published: true,
    heroTitle: "",
    heroDescription: "",
    metaTitle: "",
    metaDescription: "",
    blok: [],
  };

  return (
    <div>
      <Link
        href="/admin/halaman"
        className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy"
      >
        ← Semua halaman
      </Link>
      <div className="mt-4">
        <SectionHeading
          eyebrow="Halaman baru"
          title={
            <>
              Buat <i className="text-navy-muted">halaman</i>
            </>
          }
          description="Isi judul, pilih menu induk kalau perlu, lalu susun kontennya dari blok. Alamat halaman terisi otomatis dari judul."
        />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <HalamanForm mode="create" initial={initial} groups={groupsDoc.items} />
        </div>
      </Reveal>
    </div>
  );
}
