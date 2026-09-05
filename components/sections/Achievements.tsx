"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

/**
 * // PLACEHOLDER: ganti seluruh isi dengan data prestasi nyata dari
 * pihak sekolah — nama siswa/tim, tahun, tingkat lomba. Jangan
 * publikasikan angka/peristiwa yang belum diverifikasi.
 */
const ACHIEVEMENTS = [
  {
    year: "2024",
    scope: "Provinsi",
    title: "Juara 3 — Lomba Karya Tulis Ilmiah",
    who: "Tim Olimpiade Riset SMAN 1 Lumajang",
    note: "(nama dan detail menunggu konfirmasi sekolah)",
  },
  {
    year: "2024",
    scope: "Nasional",
    title: "Finalis — Festival Literasi Sekolah",
    who: "Media Center & Perpustakaan Sekolah",
    note: "(nama dan detail menunggu konfirmasi sekolah)",
  },
  {
    year: "2023",
    scope: "Kabupaten",
    title: "Juara Umum Pekan Olahraga Pelajar",
    who: "Kontingen atletik & bela diri",
    note: "(kategori dan detail menunggu konfirmasi sekolah)",
  },
];

const STATS = [
  { label: "Total Prestasi", value: "47+", sublabel: "Tercatat sejak 2020" },
  { label: "Tingkat Nasional", value: "12", sublabel: "Penghargaan & finalis" },
  { label: "Tingkat Provinsi", value: "18", sublabel: "Juara & medali" },
];

export function Achievements() {
  const reduce = useReducedMotion();
  return (
    <section id="prestasi" className="bg-navy py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          dark
          eyebrow="Prestasi"
          title={
            <>
              Bukti yang <i className="text-cream/70">kuat, tanpa digembar-gemborkan</i>
            </>
          }
          description="Tidak ada klaim kosong — setiap torehan tercatat dengan nama, tahun, dan tingkat lomba. Data berikut menunggu verifikasi resmi sekolah."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="rounded-lg border border-cream/15 bg-navy-light p-6 text-center">
                <p className="font-display text-4xl text-cream lg:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-cream/85">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-cream/50">{stat.sublabel}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-cream/20 text-xs uppercase tracking-[0.2em] text-cream/50">
                <th className="px-1 py-5 font-medium">Tahun</th>
                <th className="px-1 py-5 font-medium">Tingkat</th>
                <th className="px-1 py-5 font-medium">Prestasi</th>
                <th className="px-1 py-5 font-medium">Peraih</th>
              </tr>
            </thead>
            <tbody>
              {ACHIEVEMENTS.map(({ year, scope, title, who, note }, i) => {
                const isNational = scope === "Nasional";
                return (
                  <motion.tr
                    key={`${year}-${title}`}
                    className="group border-b border-cream/10 transition-colors hover:bg-white/[0.04]"
                    initial={{ opacity: 0, y: reduce ? 0 : 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
                    transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <td className="py-6 pr-4 font-display text-2xl text-cream/85">
                      {year}
                    </td>
                    <td className="py-6 pr-4">
                      <span
                        className={
                          isNational
                            ? "rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy"
                            : "rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/75"
                        }
                      >
                        {scope}
                      </span>
                    </td>
                    <td className="py-6 pr-4 font-medium text-cream">{title}</td>
                    <td className="py-6">
                      <p className="text-sm text-cream/75">{who}</p>
                      <p className="mt-1 text-xs italic text-cream/45">{note}</p>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
