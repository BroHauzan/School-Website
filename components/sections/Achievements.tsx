import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SharePrestasiButton } from "@/components/prestasi/SharePrestasiButton";
import { listPrestasi } from "@/lib/prestasi-server";
import type { PrestasiScope } from "@/lib/prestasi-schema";

/**
 * Badge tingkat — satu sumber untuk tabel (≥lg) dan kartu (<lg).
 * Tingkat tinggi solid: internasional pakai emas, nasional cream.
 */
function ScopeBadge({ scope }: { scope: PrestasiScope }) {
  const isInternational = scope === "Internasional";
  const isNational = scope === "Nasional";
  return (
    <span
      className={
        isInternational
          ? "rounded-full bg-[#f5c542] px-3 py-1 text-xs font-medium text-navy"
          : isNational
            ? "rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy"
            : "rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/75"
      }
    >
      {scope}
    </span>
  );
}

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
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: String(items.length), label: "Total prestasi tercatat" },
                { value: String(items.filter((p) => p.scope === "Internasional").length), label: "Tingkat internasional" },
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

            {/*
              Tabel 5 kolom punya lebar min-content ~495px (Tanggal 108 +
              Tingkat 114 + Prestasi 126 + Peraih 99 + Bagikan 48), sedangkan
              viewport HP hanya 305–397px. Tabel TIDAK bisa dipaksa muat di HP
              tanpa mengecilkan font sampai tidak terbaca, jadi di bawah `lg`
              isi ditampilkan sebagai kartu — semua informasi langsung terlihat
              tanpa perlu geser horizontal.
            */}
            <ul className="mt-12 space-y-4 lg:hidden">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="group rounded-lg border border-cream/15 bg-navy-light p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <ScopeBadge scope={p.scope} />
                        <span className="font-display text-xl text-cream/85">
                          {p.year}
                        </span>
                      </div>
                      {p.dateLabel ? (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cream/50">
                          {p.dateLabel}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0">
                      <SharePrestasiButton prestasi={p} dark />
                    </div>
                  </div>

                  <p className="mt-4 font-medium leading-snug text-cream">
                    {p.title}
                  </p>

                  <div className="mt-4 border-t border-cream/10 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/45">
                      Peraih
                    </p>
                    <ul className="mt-2 space-y-1">
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
                  </div>
                </li>
              ))}
            </ul>

            {/*
              `relative` WAJIB: menjadikan wrapper containing block supaya
              `.sr-only` (position:absolute) di dalam tabel tidak lolos dari
              clipping `overflow-x-auto` — kalau lolos, containing block-nya
              jadi `html` dan dokumen melebar ~792px (area kosong di kanan).
            */}
            <div className="relative mt-16 hidden overflow-x-auto lg:block" tabIndex={0} role="region" aria-label="Tabel daftar prestasi">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <caption className="sr-only">
                  Daftar prestasi sekolah beserta tahun, tingkat, dan peraih.
                </caption>
                <thead>
                  <tr className="border-b border-cream/20 text-xs uppercase tracking-[0.2em] text-cream/70">
                    <th scope="col" className="px-1 py-5 font-medium">Tanggal diraih</th>
                    <th scope="col" className="px-1 py-5 font-medium">Tingkat</th>
                    <th scope="col" className="px-1 py-5 font-medium">Prestasi</th>
                    <th scope="col" className="px-1 py-5 font-medium">Peraih</th>
                    <th scope="col" className="w-14 px-1 py-5 font-medium" aria-label="Bagikan" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="group border-b border-cream/10 transition-colors hover:bg-white/[0.04]">
                      <td className="py-6 pr-4">
                        <p className="font-display text-2xl text-cream/85">{p.year}</p>
                        {p.dateLabel ? (
                          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cream/50">
                            {p.dateLabel}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-6 pr-4">
                        <ScopeBadge scope={p.scope} />
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
                      <td className="w-14 py-6 pl-2">
                        <SharePrestasiButton prestasi={p} dark />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

