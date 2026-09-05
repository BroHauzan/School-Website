import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — SMAN 1 Lumajang",
  description: "Panel admin berita SMAN 1 Lumajang.",
  robots: { index: false, follow: false },
};

// Layout minimal. Guard + shell ada di app/admin/(panel)/layout.tsx.
// /admin/login sengaja di luar grup panel agar tidak kena redirect loop.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
