import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { MAPS, SCHOOL, SITE_URL, SOCIALS } from "@/lib/school";
import { ScrollToHash } from "@/components/ui/ScrollToHash";
import { BackToTop } from "@/components/ui/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

/** Domain resmi — lihat SITE_URL di lib/school.ts. */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SMAN 1 Lumajang — Kebijaksanaan untuk Masa Depan",
  description:
    "Situs resmi SMAN 1 Lumajang. Sekolah menengah atas unggulan di Lumajang, Jawa Timur, dengan identitas burung hantu sebagai simbol kebijaksanaan, ketajaman visi, dan semangat belajar tanpa batas.",
  alternates: { canonical: undefined },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SCHOOL.name,
    title: "SMAN 1 Lumajang — Kebijaksanaan untuk Masa Depan",
    description:
      "NPSN 20520821 · Berdiri 1960 · Jl. Jend. A. Yani No. 7, Lumajang, Jawa Timur.",
    locale: "id_ID",
    images: [{ url: "/hero-school.webp", width: 1200, height: 630 }],
  },
};

/** Structured data untuk mesin pencari — satu sumber: lib/school.ts. */
const schoolJsonLd = {
  "@context": "https://schema.org",
  "@type": "School",
  "@id": `${SITE_URL}/#school`,
  name: SCHOOL.name,
  alternateName: [SCHOOL.shortName, SCHOOL.nickname],
  url: SITE_URL,
  logo: `${SITE_URL}/smasa.webp`,
  image: `${SITE_URL}/hero-school.webp`,
  motto: SCHOOL.motto,
  foundingDate: String(SCHOOL.established),
  telephone: SCHOOL.phone
    ? `+62${SCHOOL.phone.replace(/^0/, "")}`
    : undefined,
  email: SCHOOL.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SCHOOL.address.street,
    addressLocality: SCHOOL.address.city,
    addressRegion: SCHOOL.address.province,
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: MAPS.geo.latitude,
    longitude: MAPS.geo.longitude,
  },
  hasMap: MAPS.short,
  sameAs: SOCIALS.map(({ url }) => url),
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${playfair.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream"
        >
          Lewati ke konten utama
        </a>
        {children}
        <ScrollToHash />
        <BackToTop />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schoolJsonLd) }}
        />
      </body>
    </html>
  );
}
