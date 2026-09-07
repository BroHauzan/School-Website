import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — SMAN 1 Lumajang",
  description: "Panel admin berita SMAN 1 Lumajang.",
  robots: { index: false, follow: false },
};

// Layout minimal. Penegakan auth ada di app/admin/(panel)/layout.tsx + proxy.
// /admin/login sengaja di luar grup panel agar tidak kena redirect loop.
//
// WARNING: JANGAN redirect di root layout ini — tidak bisa bedakan /admin/login
// dari rute panel secara andal, redirect di sini = loop di /login.
// Aturan untuk dev: rute baru di bawah /admin WAJIB masuk grup (panel) agar kena guard.
// force-dynamic agar tidak ada caching statis yang membocorkan shell admin.
export const dynamic = "force-dynamic";
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
