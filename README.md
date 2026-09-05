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
- `SITE_URL` dibaca dari `NEXT_PUBLIC_SITE_URL` (default `https://sman1lumajang.sch.id`)
  di `lib/school.ts` — dipakai metadata, canonical, sitemap, dan robots.
- Tidak ada secret di repo. Salin `.env.example` jadi `.env.local` untuk development.

## Keamanan admin (sekarang fail-closed)

- `ADMIN_EMAILS` **wajib diisi**. Kosong = login admin ditolak (500) dan semua sesi
  dianggap tidak valid. Sebelumnya kosong berarti "siapa pun user Auth boleh masuk".
- Cookie sesi: `__Host-smasa_admin_session` di produksi (`Secure`, `HttpOnly`,
  `SameSite=Strict`), umur **24 jam**. Logout memanggil `revokeRefreshTokens(uid)`.
- Semua endpoint tulis (`POST/PATCH/DELETE` di `/api/*`) memverifikasi header `Origin`
  (`assertSameOrigin` di `lib/auth-server.ts`) sebagai lapis kedua anti-CSRF.
- Upload gambar: hanya JPG/PNG/WebP, maks 5MB, **magic bytes** diverifikasi di server
  (GIF ditolak — rawan GIF-bomb).
- URL gambar yang disimpan ke Firestore dibatasi: path lokal (`/...`) atau
  `res.cloudinary.com` / `firebasestorage.googleapis.com` / `storage.googleapis.com`.
- Pesan error 5xx tidak lagi membocorkan `e.message` ke klien (`lib/api-error.ts`).
- Redirect setelah login hanya menerima path internal (`/...`), bukan URL eksternal.

**Masih perlu dilakukan di sisi layanan (bukan kode):**
1. Firebase Console → Authentication → **matikan sign-up email/password** atau batasi
   via App Check; rotasi `NEXT_PUBLIC_FIREBASE_API_KEY` bila repo pernah publik.
2. Cloudinary Console → Upload → kunci preset: folder `berita`/`galeri` saja,
   max 5MB, format jpg/png/webp.

## Variabel wajib di Vercel

Scope **Production, Preview, dan Development** untuk semuanya:
`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`, `NEXT_PUBLIC_CLOUDINARY_*`,
`ADMIN_EMAILS` (tipe **Config**, bukan Secret — kosong berarti admin terkunci total),
dan `NEXT_PUBLIC_SITE_URL`.
Simpan `FIREBASE_ADMIN_PRIVATE_KEY` dalam satu baris dengan `\n` literal, tanpa tanda kutip.

## Deploy

Siap di-deploy ke Vercel (project ini sudah menyertakan `.vercel` di `.gitignore`). Alternatif: `npm run build && npm start` di VPS, atau `output: 'export'` untuk static hosting karena semua halaman di-generate secara statis.
