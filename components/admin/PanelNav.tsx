"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

const MENUS = [
  { href: "/admin", label: "Berita", active: (p: string) => p === "/admin" || p.startsWith("/admin/berita") },
  { href: "/admin/galeri", label: "Galeri", active: (p: string) => p.startsWith("/admin/galeri") },
  { href: "/admin/prestasi", label: "Prestasi", active: (p: string) => p.startsWith("/admin/prestasi") },
];

/**
 * Nav panel admin dengan feedback klik: item aktif ter-highlight (aria-current),
 * item yang baru diklik langsung dim (animate-pulse) selama navigasi berlangsung —
 * jadi jelas sudah kepencet atau belum tanpa harus menunggu halaman Firestore.
 * Pending dianggap selesai otomatis saat pathname sudah sama dengan href yang diklik.
 */
export function PanelNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Menu panel admin">
      {MENUS.map((m) => {
        const isActive = m.active(pathname);
        const isPending = pendingHref === m.href && m.href !== pathname;
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setPendingHref(m.href)}
            className={cn(
              "rounded-full px-4 py-2 transition-colors",
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
        href="/admin/berita/baru"
        className="hidden rounded-full bg-cream px-4 py-2 font-medium text-navy transition-colors hover:bg-white sm:block"
      >
        + Tulis berita
      </Link>
      <Link
        href="/berita"
        target="_blank"
        className="hidden rounded-full border border-cream/25 px-4 py-2 text-cream/80 transition-colors hover:border-cream/60 hover:text-cream sm:block"
      >
        Lihat situs
      </Link>
      <LogoutButton />
    </nav>
  );
}
