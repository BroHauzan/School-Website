import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HalamanForm, type HalamanFormValue } from "@/components/admin/HalamanForm";
import { getHalamanById } from "@/lib/halaman-server";
import { getNavGroups } from "@/lib/nav-groups-server";

export const dynamic = "force-dynamic";

export default async function HalamanUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, groupsDoc] = await Promise.all([getHalamanById(id), getNavGroups()]);
  if (!item) notFound();

  const initial: HalamanFormValue = {
    judul: item.judul,
    slug: item.slug,
    navLabel: item.navLabel,
    groupKey: item.groupKey,
    urutan: item.urutan,
    showInNav: item.showInNav,
    collapsible: item.collapsible,
    published: item.published,
    heroTitle: item.heroTitle,
    heroDescription: item.heroDescription,
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    blok: item.blok,
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
          eyebrow={item.systemPath ? "Halaman bawaan" : "Ubah halaman"}
          title={
            <>
              Sunting <i className="text-navy-muted">{item.judul}</i>
            </>
          }
          description={
            item.systemPath
              ? `Halaman bawaan di alamat ${item.systemPath}. Isi dan kontennya bisa diubah, alamatnya tetap.`
              : "Ubah isi halaman, kelompok menu, dan pengaturan tampilnya."
          }
        />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <HalamanForm
            mode="edit"
            id={id}
            initial={initial}
            groups={groupsDoc.items}
            systemPath={item.systemPath}
            expectedUpdatedAt={item.updatedAt}
          />
        </div>
      </Reveal>
    </div>
  );
}
