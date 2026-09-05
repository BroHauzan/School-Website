"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

type NavItem =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

const NAV: NavItem[] = [
  {
    label: "Profil",
    children: [
      { href: "/sejarah", label: "Sejarah" },
      { href: "/visi-misi", label: "Visi Misi" },
      { href: "/struktur", label: "Struktur" },
    ],
  },
  {
    label: "Akademik",
    children: [
      { href: "/kalender-pendidikan", label: "Kalender" },
      { href: "/jurnal-absensi", label: "Jurnal" },
      { href: "/data-lulusan", label: "Lulusan" },
      { href: "/snbp-snbt", label: "SNBP/SNBT" },
    ],
  },
  {
    label: "Layanan",
    children: [
      { href: "/bk", label: "BK" },
      { href: "/alumni", label: "Alumni" },
      { href: "/komite-sekolah", label: "Komite" },
    ],
  },
  { href: "/berita", label: "Berita" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/prestasi", label: "Prestasi" },
  { href: "/#kontak", label: "Kontak" },
];

export function SiteHeader({ solidOnTop = false }: { solidOnTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || solidOnTop;
  const overDark = !solid;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-navy/10 bg-cream/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6 lg:h-[72px] lg:justify-center xl:gap-8">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-3 font-semibold tracking-[0.02em] transition-colors",
            overDark ? "text-cream" : "text-ink"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/smasa.webp"
            alt="Logo SMA Negeri 1 Lumajang"
            className={cn(
              "size-9 rounded-full object-contain transition-all",
              overDark ? "ring-1 ring-cream/25" : "ring-1 ring-navy/15"
            )}
          />
          <span className="whitespace-nowrap text-sm uppercase tracking-[0.18em]">
            SMAN&thinsp;1 &middot; Lumajang
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-6" aria-label="Navigasi utama">
          {NAV.map((item) => {
            if ("children" in item) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 whitespace-nowrap text-[13px] tracking-wide transition-colors hover:opacity-70 xl:text-sm",
                      overDark ? "text-cream/85" : "text-ink/80"
                    )}
                  >
                    {item.label}
                    <svg
                      className={cn(
                        "size-3 transition-transform",
                        activeDropdown === item.label && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 top-full pt-2"
                      >
                        <div className="min-w-[180px] rounded-lg border border-navy/10 bg-cream/95 py-2 shadow-xl backdrop-blur-md">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2 text-[13px] text-ink/80 transition-colors hover:bg-navy/5 hover:text-ink xl:text-sm"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap text-[13px] tracking-wide transition-colors hover:opacity-70 xl:text-sm",
                  overDark ? "text-cream/85" : "text-ink/80"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/ppdb"
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-all xl:px-5 xl:text-sm",
              overDark
                ? "border-cream/40 text-cream hover:bg-cream hover:text-navy"
                : "border-navy/25 text-navy hover:bg-navy hover:text-cream"
            )}
          >
            PPDB
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex size-10 items-center justify-center lg:hidden",
            overDark ? "text-cream" : "text-ink"
          )}
        >
          <div className="relative h-3.5 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300",
                open && "top-1/2 -translate-y-1/2 rotate-45"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1/2 h-px w-full bg-current transition-opacity duration-300",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300",
                open && "bottom-1/2 translate-y-1/2 -rotate-45"
              )}
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Navigasi mobile"
            className="border-t border-navy/10 bg-cream/95 backdrop-blur-md lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 py-4">
              {NAV.map((item) => {
                if ("children" in item) {
                  const isOpen = openMobileAccordion === item.label;
                  return (
                    <div key={item.label} className="border-b border-navy/5">
                      <button
                        onClick={() => setOpenMobileAccordion(isOpen ? null : item.label)}
                        className="flex w-full items-center justify-between py-3 text-left text-base font-medium text-ink/85"
                      >
                        {item.label}
                        <svg
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-2 pl-4">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => {
                                    setOpen(false);
                                    setOpenMobileAccordion(null);
                                  }}
                                  className="block py-2 text-sm text-ink/70 hover:text-ink"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-navy/5 py-3 text-base font-medium text-ink/85"
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/ppdb"
                onClick={() => setOpen(false)}
                className="block border-b border-navy/5 py-3 text-base font-medium text-ink/85"
              >
                PPDB
              </Link>
              <Link
                href="/#galeri"
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-ink/85"
              >
                Galeri
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
