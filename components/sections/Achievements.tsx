import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { listPrestasi } from "@/lib/prestasi-server";

/**
 * Prestasi siswa dari koleksi Firestore `prestasi` — diinput lewat panel admin.
 * Bila koleksi masih kosong, tampilkan blok coming soon sebagai fallback.
 */
export async function Achievements() {
  const items = await listPrestasi();

  return (
    <section id="prestasi" className="bg-navy pb-28 pt-0 text-cream lg:pb-40 lg:pt-0">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          dark
          eyebrow="Prestasi"
          title={
            <>
              Karya dan <i className="text-cream/70">juara</i> SMASA
            </>
          }
          description={
            items.length > 0
              ? "Catatan prestasi siswa — nama, tahun, dan tingkat lomba — dikelola dan diverifikasi pihak sekolah."
              : "Halaman ini akan menampilkan catatan prestasi siswa — nama, tahun, dan tingkat lomba — setelah data selesai diverifikasi."
          }
        />

        {items.length === 0 ? (
          <Reveal delay={0.1}>
            <div className="mt-16 flex flex-col items-center gap-5 rounded-lg border border-cream/15 bg-navy-light px-8 py-16 text-center sm:py-24">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cream/55">
                Coming Soon
              </p>
              <h3 className="max-w-xl font-display text-3xl leading-tight text-balance text-cream sm:text-4xl">
                Data prestasi sedang disiapkan
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-cream/65 sm:text-base">
                Daftar prestasi siswa SMAN 1 Lumajang masih dalam proses input
                dan verifikasi oleh pihak sekolah. Nantikan catatan
                lengkapnya di halaman ini.
              </p>
            </div>
          </Reveal>
        ) : (
          <>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[
                { value: String(items.length), label: "Total prestasi tercatat" },
                { value: String(items.filter((p) => p.scope === "Nasional").length), label: "Tingkat nasional" },
                { value: String(items.filter((p) => p.scope === "Provinsi").length), label: "Tingkat provinsi" },
              ].map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.08}>
                  <div className="rounded-lg border border-cream/15 bg-navy-light p-6 text-center">
                    <p className="font-display text-4xl text-cream lg:text-5xl">{stat.value}</p>
                    <p className="mt-2 text-sm font-medium uppercase tracking-wider text-cream/85">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-16 overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel daftar prestasi">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <caption className="sr-only">
                  Daftar prestasi sekolah beserta tahun, tingkat, dan peraih.
                </caption>
                <thead>
                  <tr className="border-b border-cream/20 text-xs uppercase tracking-[0.2em] text-cream/70">
                    <th scope="col" className="px-1 py-5 font-medium">Tanggal diraih</th>
                    <th scope="col" className="px-1 py-5 font-medium">Tingkat</th>
                    <th scope="col" className="px-1 py-5 font-medium">Prestasi</th>
                    <th scope="col" className="px-1 py-5 font-medium">Peraih</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => {
                    const isNational = p.scope === "Nasional";
                    return (
                      <tr key={p.id} className="border-b border-cream/10 transition-colors hover:bg-white/[0.04]">
                        <td className="py-6 pr-4">
                          <p className="font-display text-2xl text-cream/85">{p.year}</p>
                          {p.dateLabel ? (
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cream/50">
                              {p.dateLabel}
                            </p>
                          ) : null}
                        </td>
                        <td className="py-6 pr-4">
                          <span
                            className={
                              isNational
                                ? "rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy"
                                : "rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/75"
                            }
                          >
                            {p.scope}
                          </span>
                        </td>
                        <td className="py-6 pr-4 font-medium text-cream">{p.title}</td>
                        <td className="py-6">
                          <ul className="space-y-1">
                            {p.peraih.map((r, ri) => (
                              <li key={ri} className="text-sm text-cream/75">
                                {r.nama}
                                {r.kelas ? (
                                  <span className="ml-2 text-xs uppercase tracking-[0.14em] text-cream/45">
                                    {r.kelas}
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

