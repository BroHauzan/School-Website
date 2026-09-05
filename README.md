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
| `/berita` | Arsip berita — featured card + grid (empty state bila belum ada artikel) |
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
| `/admin` | Panel admin CMS berita (login Firebase) |
| `/admin/berita/baru` | Tulis berita baru |
| `/admin/berita/[id]/ubah` | Ubah berita |

## Struktur

```
app/                 # halaman (App Router)
app/berita/[slug]/   # detail berita, generateStaticParams
components/          # section & UI (SiteHeader, Footer, Berita, PageHero, SectionDivider, ...)
lib/                 # data & util (berita-server.ts, berita-schema.ts, school.ts, utils.ts)
app/admin/           # panel admin CMS berita
app/api/berita/      # route handler CRUD berita
public/              # aset (smasa.webp, hero-school.webp, svg)
DESIGN_SYSTEM.md     # design token & aturan hierarki visual — wajib dibaca sebelum bikin komponen baru
```

## Status & catatan

- **Berita hanya bersumber dari Firestore** — koleksi `berita`, dikelola lewat `/admin`.
  Tidak ada lagi artikel dummy/seed di repo (`lib/berita.ts` sudah dihapus). Bila Firestore
  kosong, `/berita` menampilkan empty state dan section Berita di homepage tidak dirender.
- Gambar berita diunggah ke Cloudinary (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` +
  `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`).
- Gambar galeri & fasilitas masih memakai `/placeholder-sekolah.svg`.
- `SITE_URL` di `app/layout.tsx` masih nilai default — sesuaikan saat deploy untuk metadata & Open Graph.
- Tidak ada secret di repo. Salin `.env.example` jadi `.env.local` untuk development.
- Variabel wajib di Vercel (scope **Production, Preview, dan Development**):
  `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`, `NEXT_PUBLIC_CLOUDINARY_*`, dan
  `ADMIN_EMAILS` (daftar email admin, pisahkan dengan koma — tipe **Config**, bukan Secret).
  Tanpa `ADMIN_EMAILS`, guard allowlist admin di `lib/auth-server.ts` tidak menegakkan apa pun.
  Simpan `FIREBASE_ADMIN_PRIVATE_KEY` dalam satu baris dengan `\n` literal, tanpa tanda kutip.

## Deploy

Siap di-deploy ke Vercel (project ini sudah menyertakan `.vercel` di `.gitignore`). Alternatif: `npm run build && npm start` di VPS, atau `output: 'export'` untuk static hosting karena semua halaman di-generate secara statis.
