import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const MONTHS = [
  { key: "Jul", name: "Juli", events: ["Awal masuk siswa baru", "MPLS"] },
  { key: "Agt", name: "Agustus", events: ["HUT RI Ke-81"] },
  { key: "Sep", name: "September", events: ["PTS Ganjil"] },
  { key: "Okt", name: "Oktober", events: [] },
  { key: "Nov", name: "November", events: [] },
  { key: "Des", name: "Desember", events: ["PAS Ganjil", "Libur semester"] },
  { key: "Jan", name: "Januari", events: ["Awal semester genap"] },
  { key: "Feb", name: "Februari", events: [] },
  { key: "Mar", name: "Maret", events: ["PTS Genap"] },
  { key: "Apr", name: "April", events: [] },
  { key: "Mei", name: "Mei", events: ["Ujian Akhir Sekolah"] },
  { key: "Jun", name: "Juni", events: ["PAS Genap", "Pembagian rapor"] },
];

export function KalenderPendidikan() {
  return (
    <section className="bg-cream py-28 text-navy lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Kalender Pendidikan"
          title={
            <>
              Jadwal <i className="text-navy-muted">terstruktur</i> sepanjang tahun
            </>
          }
          description="Kalender akademik dan kegiatan sekolah yang tersusun rapi untuk memastikan pembelajaran berjalan efektif."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MONTHS.map((month, i) => (
            <Reveal key={month.key} delay={i * 0.04}>
              <div className="group rounded-lg border border-navy/10 bg-paper p-5 transition-all hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl text-navy">{month.name}</h3>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted">
                    {month.key}
                  </span>
                </div>
                {month.events.length > 0 ? (
                  <ul className="mt-3 space-y-1.5">
                    {month.events.map((ev, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-navy/75"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-navy/40" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs italic text-muted">Tidak ada acara khusus</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12" delay={0.5}>
          <div className="rounded-lg border border-navy/10 bg-navy/5 p-7">
            <p className="text-sm text-muted">
              Kalender lengkap dengan detail kegiatan tersedia di portal siswa. Hubungi bagian kurikulum untuk informasi lebih lanjut.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

