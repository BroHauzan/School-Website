import Link from "next/link";
import {
  SCHOOL,
  SOCIALS,
  displayPhone,
  fullAddress,
  telHref,
} from "@/lib/school";

const FOOTER_SECTIONS = {
  profil: [
    { href: "/sejarah", label: "Sejarah" },
    { href: "/visi-misi", label: "Visi & Misi" },
    { href: "/struktur", label: "Struktur Organisasi" },
    { href: "/berita", label: "Berita" },
    { href: "/#tentang", label: "Tentang" },
  ],
  akademik: [
    { href: "/jurnal-absensi", label: "Jurnal & Absensi" },
    { href: "/kalender-pendidikan", label: "Kalender Pendidikan" },
    { href: "/prestasi", label: "Prestasi" },
    { href: "/eskul", label: "Ekstrakurikuler" },
    { href: "/fasilitas", label: "Fasilitas" },
  ],
  kesiswaan: [
    { href: "/ppdb", label: "PPDB" },
    { href: "/data-lulusan", label: "Data Lulusan" },
    { href: "/snbp-snbt", label: "SNBP & SNBT" },
    { href: "/bk", label: "Konseling" },
    { href: "/alumni", label: "Alumni" },
    { href: "/komite-sekolah", label: "Komite Sekolah" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-cream">
      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 text-left">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start">
            <div className="flex items-center justify-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/smasa.webp"
                alt="Logo SMAN 1 Lumajang"
                className="size-10 shrink-0 rounded-full bg-cream object-cover"
                loading="lazy"
              />
              <span className="font-display text-lg tracking-wide">
                SMAN&thinsp;1&ensp;Lumajang
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-cream/60">
              Kebijaksanaan untuk masa depan. Sekolah di kaki dataran tinggi
              Lumajang yang terus menjelajah peluang baru sejak 1960.
            </p>
          </div>

          <nav aria-label="Profil" className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/70">
              Profil
            </p>
            <ul className="mt-4 flex flex-col items-start gap-3">
              {FOOTER_SECTIONS.profil.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-cream/75 transition-colors hover:text-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Akademik" className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/70">
              Akademik
            </p>
            <ul className="mt-4 flex flex-col items-start gap-3">
              {FOOTER_SECTIONS.akademik.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-cream/75 transition-colors hover:text-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Kesiswaan" className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/70">
              Kesiswaan
            </p>
            <ul className="mt-4 flex flex-col items-start gap-3">
              {FOOTER_SECTIONS.kesiswaan.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-cream/75 transition-colors hover:text-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/70">
              Informasi
            </p>
            <ul className="mt-4 space-y-3 text-left text-sm text-cream/60">
              <li>{fullAddress()}</li>
              <li>
                <a
                  href={telHref()}
                  className="transition-colors hover:text-cream"
                >
                  {displayPhone()}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SCHOOL.email}`}
                  className="break-all transition-colors hover:text-cream"
                >
                  {SCHOOL.email}
                </a>
              </li>
              <li>NPSN {SCHOOL.npsn}</li>
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/70">
              Akun Resmi
            </p>
            <ul className="mt-4 flex flex-col items-start gap-3 text-sm text-cream/60">
              {SOCIALS.map(({ label, handle, url }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-cream"
                  >
                    {label}
                    <span className="text-cream/70"> &middot; {handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-left md:flex-row md:items-center">
          <p className="text-xs text-cream/70">
            &copy; {new Date().getFullYear()} SMAN 1 Lumajang. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
