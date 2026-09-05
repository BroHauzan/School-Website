# Website SMAN 1 Lumajang

Landing page + section berita untuk website SMAN 1 Lumajang. Single-page landing dengan beberapa halaman rute terpisah.

## Stack

- **Next.js 16** — App Router, static generation
- **React 19**
- **Tailwind CSS v4** — design token di `app/globals.css`
- **framer-motion 13** — reveal & micro-interaction
- **TypeScript 5**, ESLint 9

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve hasil build
npm run lint     # eslint
```

## Rute

| Rute | Keterangan |
|---|---|
| `/` | Landing page (hero, about, berita, fasilitas, PPDB, kontak, dll.) |
| `/berita` | Arsip berita — featured card + grid |
| `/berita/[slug]` | Detail berita + berita terkait |
| `/visi-misi` | Visi & misi sekolah |
| `/sejarah` | Sejarah sekolah |
| `/struktur` | Struktur organisasi |
| `/fasilitas` | Fasilitas |
| `/eskul` | Ekstrakurikuler |
| `/prestasi` | Prestasi |
| Akademik | bukan rute terpisah — section `Academic` di `/` |
| `/ppdb` | PPDB + countdown |
| `/snbp-snbt` | Jalur penerimaan |
| `/kalender-pendidikan` | Kalender akademik |
| `/data-lulusan` | Data kelulusan |
| `/komite-sekolah` | Komite sekolah |
| `/bk` | Bimbingan konseling |
| `/jurnal-absensi` | Jurnal absensi |
| `/alumni` | Alumni |

## Struktur

```
app/                 # halaman (App Router)
app/berita/[slug]/   # detail berita, generateStaticParams
components/          # section & UI (SiteHeader, Footer, Berita, PageHero, SectionDivider, ...)
lib/                 # data & util (berita.ts, school.ts, utils.ts)
public/              # aset (smasa.webp, hero-school.webp, svg)
DESIGN_SYSTEM.md     # design token & aturan hierarki visual — wajib dibaca sebelum bikin komponen baru
```

## Status & catatan

- **Data berita masih placeholder** — 4 artikel dummy di `lib/berita.ts`, semua gambar masih memakai `/hero-school.webp`. Ganti dengan data asli / CMS / API sebelum produksi.
- Gambar galeri & fasilitas masih memakai `/placeholder-sekolah.svg`.
- `SITE_URL` di `app/layout.tsx` masih nilai default — sesuaikan saat deploy untuk metadata & Open Graph.
- Tidak ada `.env` atau secret di repo ini.

## Deploy

Siap di-deploy ke Vercel (project ini sudah menyertakan `.vercel` di `.gitignore`). Alternatif: `npm run build && npm start` di VPS, atau `output: 'export'` untuk static hosting karena semua halaman di-generate secara statis.
