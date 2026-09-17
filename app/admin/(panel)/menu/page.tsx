import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NavGroupManager } from "@/components/admin/NavGroupManager";
import { listHalaman } from "@/lib/halaman-server";
import { getNavGroups } from "@/lib/nav-groups-server";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [groupsDoc, items] = await Promise.all([getNavGroups(), listHalaman({ includeDraft: true })]);

  const usage: Record<string, number> = {};
  for (const h of items) {
    // Hitung yang benar-benar tampil di navbar (published + showInNav),
    // supaya teks "N halaman memakainya" tidak melebih-lebihkan draft.
    if (!h.groupKey) continue;
    if (h.published === false || h.showInNav === false) continue;
    usage[h.groupKey] = (usage[h.groupKey] ?? 0) + 1;
  }

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
          eyebrow="Panel Admin"
          title={
            <>
              Atur <i className="text-navy-muted">menu</i>
            </>
          }
          description="Susun kelompok menu yang tampil di bagian atas website. Halaman dimasukkan ke kelompok ini lewat pilihan “Menu induk” di tiap halaman."
        />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <NavGroupManager initial={groupsDoc.items} usage={usage} />
        </div>
      </Reveal>
    </div>
  );
}
