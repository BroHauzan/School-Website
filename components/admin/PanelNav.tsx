"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

const MENUS = [
  { href: "/admin", label: "Berita", active: (p: string) => p === "/admin" || p.startsWith("/admin/berita") },
  { href: "/admin/halaman", label: "Halaman", active: (p: string) => p.startsWith("/admin/halaman") },
  { href: "/admin/menu", label: "Menu", active: (p: string) => p.startsWith("/admin/menu") },
  { href: "/admin/galeri", label: "Galeri", active: (p: string) => p.startsWith("/admin/galeri") },
  { href: "/admin/prestasi", label: "Prestasi", active: (p: string) => p.startsWith("/admin/prestasi") },
  { href: "/admin/testimoni", label: "Testimoni", active: (p: string) => p.startsWith("/admin/testimoni") },
];

/**
 * Tujuan tombol "Lihat situs": halaman publik yang sejajar dengan
 * halaman admin yang sedang dibuka.
 */
function publicHref(p: string): string {
  if (p.startsWith("/admin/berita")) return "/berita";
  if (p.startsWith("/admin/galeri")) return "/#galeri";
  if (p.startsWith("/admin/prestasi")) return "/prestasi";
  if (p.startsWith("/admin/testimoni")) return "/#testimoni";
  if (p === "/admin") return "/berita";
  return "/";
}

/**
 * Nav panel admin dengan feedback klik: item aktif ter-highlight (aria-current),
 * item yang baru diklik langsung dim (animate-pulse) selama navigasi berlangsung —
 * jadi jelas sudah kepencet atau belum tanpa harus menunggu halaman Firestore.
 * Pending dianggap selesai otomatis saat pathname sudah sama dengan href yang diklik.
 * Baris nav bisa scroll horizontal di layar sempit supaya header tidak membesar
 * dan label tombol tidak terpotong jadi dua baris.
 */
export function PanelNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  return (
    <nav
      className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
      aria-label="Menu panel admin"
    >
      {MENUS.map((m, idx) => {
        const isActive = m.active(pathname);
        const isPending = pendingHref === m.href && m.href !== pathname;
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setPendingHref(m.href)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-3 py-2 transition-colors sm:px-4",
              idx === 0 && "ml-auto",
              isActive
                ? "bg-cream/15 font-medium text-cream"
                : "text-cream/80 hover:bg-cream/10 hover:text-cream",
              isPending && "animate-pulse opacity-70",
            )}
          >
            {m.label}
          </Link>
        );
      })}
      <Link
        href="/admin/bantuan"
        className={cn(
          "shrink-0 whitespace-nowrap rounded-full border border-cream/25 px-4 py-2 text-cream/80 transition-colors hover:border-cream/60 hover:text-cream",
          pathname.startsWith("/admin/bantuan") && "border-cream/60 bg-cream/15 font-medium text-cream"
        )}
      >
        Bantuan
      </Link>
      <Link
        href="/admin/berita/baru"
        data-tour="berita-tulis"
        className="hidden shrink-0 whitespace-nowrap rounded-full bg-cream px-4 py-2 font-medium text-navy transition-colors hover:bg-white sm:block"
      >
        + Tulis berita
      </Link>
      <Link
        href={publicHref(pathname)}
        target="_blank"
        className="hidden shrink-0 whitespace-nowrap rounded-full border border-cream/25 px-4 py-2 text-cream/80 transition-colors hover:border-cream/60 hover:text-cream lg:block"
      >
        Lihat situs
      </Link>
      <LogoutButton />
    </nav>
  );
}
