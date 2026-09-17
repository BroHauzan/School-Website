import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TUTORIALS } from "@/components/admin/tutorial/tutorials";
import TutorialStartButton from "@/components/admin/tutorial/TutorialStartButton";

export const dynamic = "force-dynamic";

export default function AdminBantuanPage() {
  return (
    <div>
      <Link
        href="/admin"
        className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy"
      >
        ← Kembali
      </Link>
      <div className="mt-4">
        <SectionHeading
          eyebrow="Panel Admin"
          title={
            <>
              Panduan <i className="text-navy-muted">tutorial</i>
            </>
          }
          description="Pilih salah satu panduan di bawah. Panduan menunjuk langsung bagian layar yang dimaksud, langkah demi langkah. Keluar kapan saja, data yang sedang diisi tetap aman."
        />
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {TUTORIALS.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-navy/10 bg-paper p-6 transition-all hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_12px_32px_-16px_rgba(9,18,43,0.2)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
              {t.steps.length} langkah
            </p>
            <h2 className="mt-2 font-display text-2xl text-ink">{t.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.description}</p>
            <div className="mt-5">
              <TutorialStartButton tutorialId={t.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
