# Website SMAN 1 Lumajang

Situs resmi SMA Negeri 1 Lumajang (SMASA). Landing page + 14 halaman profil/akademik/layanan + arsip berita, galeri, dan panel admin CMS untuk humas sekolah.

## Stack

| Dependency | Versi | Catatan |
|---|---|---|
| Next.js | 16.3.4 | App Router, ISR (`revalidate`), `proxy.ts` menggantikan `middleware.ts` |
| React / React DOM | 19.2.8 | |
| TypeScript | ^5 | strict, path alias `@/*` |
| Tailwind CSS | v4 | design token di `app/globals.css`, plugin PostCSS |
| framer-motion | ^13.2 | `Reveal` + animasi header/carousel |
| firebase | ^12.18 | client Auth (login admin) |
| firebase-admin | ^13.5.0 | server: session cookie, Firestore, Storage. **Sengaja 13.x** — v14 pakai ESM `jose` yang bermasalah di Vercel |
| Node | >=22 | `engines` di `package.json` + `.nvmrc` |

## Menjalankan

```bash
cp .env.example .env.local   # isi nilai project Firebase/Cloudinary sendiri
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve hasil build
npm run lint     # eslint
```

Tanpa env, situs tetap jalan: halaman berita/galeri tampil kosong atau fallback placeholder, panel admin menampilkan banner env yang kurang. Tidak ada secret yang ikut ter-commit (`.env*` di-ignore, `.env.example` di-include sebagai template).

## Rute publik

| Rute | Keterangan |
|---|---|
| `/` | Hero, Berita (maks. 5 terbaru), Academic, Gallery, Testimonials, Contact |
| `/berita` | Arsip berita — 1 kartu sorotan + grid; empty state bila Firestore kosong |
| `/berita/[slug]` | Detail berita + 3 "Berita Lainnya" |
| `/visi-misi` | Visi & misi sekolah |
| `/sejarah` | Sejarah sekolah (section About dipindah ke sini) |
| `/struktur` | Struktur organisasi |
| `/alumni` | Alumni |
| `/komite-sekolah` | Komite sekolah |
| `/kalender-pendidikan` | Kalender akademik |
| `/jurnal-absensi` | Jurnal absensi |
| `/data-lulusan` | Data kelulusan |
| `/snbp-snbt` | Jalur penerimaan |
| `/bk` | Bimbingan konseling |
| `/prestasi` | Prestasi |
| `/fasilitas` | Fasilitas — coverflow slider (autoplay 5s, keyboard ←/→, swipe) |
| `/eskul` | Ekstrakurikuler |
| `/ppdb` | PPDB + countdown |

Akademik **bukan** rute terpisah — dirender sebagai section `Academic` di `/`.

## Rute admin & API

| Rute | Keterangan |
|---|---|
| `/admin/login` | Login Firebase Auth (di luar guard panel agar tidak redirect loop) |
| `/admin` | Dashboard + tabel berita (total / tayang / draft) |
| `/admin/berita/baru` | Tulis berita |
| `/admin/berita/[id]/ubah` | Ubah berita |
| `/admin/galeri` | Dashboard + tabel foto galeri |
| `/admin/galeri/baru` | Tambah foto |
| `/admin/galeri/[id]/ubah` | Ubah foto |
| `/api/berita` | `GET` daftar, `POST` buat |
| `/api/berita/[id]` | `PATCH` ubah, `DELETE` hapus |
| `/api/berita/upload` | `POST` gambar → Cloudinary folder `berita` |
| `/api/galeri`, `/api/galeri/[id]`, `/api/galeri/upload` | Sama seperti berita, folder `galeri` |
| `/api/auth/session` | `POST` mint session cookie, `DELETE` logout + revokasi token |
| `/api/health` | Probe tanpa dependency — pemisah error platform vs error library |

Semua halaman admin dan seluruh API route `force-dynamic`. Setiap tulis data memanggil `revalidatePath` (`/berita`, `/berita/[slug]`, dan layout `/`) supaya konten baru tayang tanpa rebuild.

## Struktur folder

```
app/                     # halaman (App Router) + layout, error, not-found
app/berita/[slug]/       # detail berita, generateStaticParams
app/admin/login/         # halaman login (di luar grup panel)
app/admin/(panel)/       # guard server + shell panel: berita & galeri CRUD
app/api/                 # route handler: berita, galeri, auth/session, health
app/sitemap.ts           # 16 rute statis + entri berita dari Firestore
app/robots.ts            # allow /, disallow /admin dan /api
components/sections/     # 19 section homepage & halaman (Hero, Berita, Gallery, …)
components/ui/           # SiteHeader, Footer, PageHero, SectionHeading, Reveal,
                         # SectionDivider, BackToTop, ScrollToHash, OwlMotif
components/admin/        # BeritaForm/Table, GaleriForm/Table, ImageUploadField,
                         # LoginForm, LogoutButton, ConfirmDialog, Field
lib/                     # lihat tabel modul di bawah
public/                  # smasa.webp/.png, hero-school.webp, placeholder-sekolah.svg, owl-*.svg
proxy.ts                 # Next 16: pengganti middleware.ts, guard /admin/:path*
next.config.ts           # security headers (CSP, HSTS, …) + images.remotePatterns
firebase.json            # menunjuk firestore.rules, firestore.indexes.json, storage.rules
firestore.rules          # baca publik berita+galeri, tulis ditolak
firestore.indexes.json   # 2 composite index (berita, galeri)
storage.rules            # baca publik berita/*, sisanya ditolak
DESIGN_SYSTEM.md         # token & hierarki visual — WAJIB dibaca sebelum komponen baru
FIREBASE_SETUP.md        # setup console: service account, Auth, rules, index
.env.example             # template env (placeholder, bukan nilai asli)
```

| Modul `lib/` | Isi |
|---|---|
| `school.ts` | Satu sumber kebenaran data resmi sekolah: profil, NPSN, akreditasi, kontak, `MAPS`, `SOCIALS`, program akademik, ekskul, struktur, komite. Field `null` = belum diverifikasi → tampil `UNVERIFIED_LABEL` |
| `berita-server.ts` / `berita-schema.ts` | CRUD Firestore `berita`, validasi + normalisasi, slug unik, fallback saat composite index belum Ready |
| `galeri-server.ts` / `galeri-schema.ts` | CRUD Firestore `galeri`, urut `order` |
| `auth-server.ts` | `mintSessionCookie`, `verifyAdminSession`, `requireAdmin`, `sessionCookieOptions`, `assertSameOrigin` |
| `auth-cookie.ts` | Nama cookie + umur sesi (edge-safe, tanpa `server-only`, dipakai `proxy.ts`) |
| `firebase.ts` / `firebase-admin.ts` | Init client SDK / Admin SDK, guard `adminConfigured()` |
| `env.ts` / `env-server.ts` | Env publik (`NEXT_PUBLIC_*`) vs env server-only (`server-only` guard, normalisasi private key, `missingEnvReport`) |
| `cloudinary.ts` | Upload unsigned ke Cloudinary, folder configurable |
| `upload-validate.ts` | Validasi file: MIME, 5MB, magic bytes |
| `image-url.ts` | Allowlist host URL gambar yang boleh disimpan ke Firestore |
| `api-error.ts` | `errMsg()` — status 5xx jadi pesan generik, tidak bocorkan `e.message` |
| `utils.ts` | `cn()` (clsx + tailwind-merge) |

## Sumber data

- **Berita** hanya dari koleksi Firestore `berita`. Tidak ada artikel dummy/seed di repo (`lib/berita.ts` sudah dihapus). Field: `slug`, `title`, `excerpt`, `tag`, `image`, `body[]`, `featured`, `published`, `dateISO`, `dateLabel`, `createdAt`, `updatedAt`.
  Firestore kosong → `/berita` tampil empty state dan section Berita di homepage tidak dirender.
- **Galeri** dari koleksi `galeri`: `caption`, `src`, `wide`, `order`, `published`. Urut naik lewat `order`. Kosong → 7 kartu placeholder agar layout masonry tidak rusak (deskripsi section otomatis berubah jadi "masih placeholder").
- **Homepage** menampilkan maksimal 5 berita terbaru (`HOMEPAGE_LIMIT` di `components/sections/Berita.tsx`); halaman `/berita` menampilkan sampai 100.
- **Fasilitas** masih data statis di `components/sections/Facilities.tsx` dengan `src="/placeholder-sekolah.svg"` — perlu diganti foto asli sebelum publikasi.
- Label `tag` sengaja tidak ditampilkan di kartu berita (homepage, arsip, berita terkait); tag tetap ada di halaman detail, breadcrumb, dan form admin.

## Rendering, caching & SEO

| Bagian | Mode |
|---|---|
| `/`, `/berita`, `/berita/[slug]` | ISR, `revalidate = 300` (5 menit) |
| `sitemap.xml` | `revalidate = 3600`, entri berita ikut dibaca dari Firestore |
| `/admin/*`, `/api/*` | `force-dynamic` (tidak pernah cache) |
| Halaman profil/akademik lainnya | prerender statis |

- `SITE_URL` dibaca dari `NEXT_PUBLIC_SITE_URL` (default `https://sman1lumajang.sch.id`) di `lib/school.ts` — dipakai metadata, canonical, Open Graph, sitemap, robots, dan JSON-LD.
- JSON-LD `@type: School` dirender di root layout (nama, alamat, geo, telepon, `sameAs` sosial media), di-escape agar kontennya tidak bisa menutup tag `<script>`.
- Canonical per halaman (`/berita`, `/berita/[slug]`); seluruh halaman admin di-set `robots: index:false`.
- `next.config.ts` memasang header keamanan di semua rute: CSP, HSTS 2 tahun, `X-Frame-Options SAMEORIGIN`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Aksesibilitas: skip link "Lewati ke konten utama", gaya `:focus-visible` (cream di atas latar gelap), dropdown & dialog bisa diakses keyboard, `prefers-reduced-motion` dihormati `Reveal` dan carousel fasilitas.

## Keamanan admin (fail-closed)

- `ADMIN_EMAILS` **wajib diisi**. Kosong = login ditolak (500) dan semua sesi dianggap tidak valid.
- Cookie sesi: `__Host-smasa_admin_session` di produksi (`Secure`, `HttpOnly`, `SameSite=Strict`, tanpa `Domain`), `smasa_admin_session` di dev supaya tetap tersimpan di `http://localhost`. Umur **24 jam**. Logout memanggil `revokeRefreshTokens(uid)`.
- `proxy.ts` hanya mengecek **keberadaan** cookie (murah, jalan di edge). Verifikasi kriptografis terjadi di `app/admin/(panel)/layout.tsx` dan `requireAdmin()` di tiap API route — jangan dipindah ke proxy.
- Semua endpoint tulis (`POST`/`PATCH`/`DELETE`) memanggil `assertSameOrigin()` sebagai lapis kedua anti-CSRF di atas `SameSite=Strict`.
- Upload gambar: hanya JPG/PNG/WebP, maks 5MB, **magic bytes** diverifikasi di server. GIF ditolak (rawan GIF-bomb).
- URL gambar yang disimpan ke Firestore harus path lokal (`/...`) atau `res.cloudinary.com` / `firebasestorage.googleapis.com` / `storage.googleapis.com` — mencegah host arbitrer dimuat browser pengunjung.
- Pesan error 5xx digeneralisasi lewat `lib/api-error.ts`; redirect setelah login hanya menerima path internal (`/...`).
- Firestore & Storage rules menutup semua tulis dari klien: tulis **hanya** lewat Admin SDK di server.

**Masih perlu dilakukan di sisi layanan (bukan kode):**
1. Firebase Console → Authentication → matikan sign-up email/password atau batasi via App Check; rotasi `NEXT_PUBLIC_FIREBASE_API_KEY` bila repo pernah publik.
2. Cloudinary Console → Upload → kunci preset: folder `berita`/`galeri` saja, maks 5MB, format jpg/png/webp. Preset terbuka = siapa pun bisa mengisi storage-mu.

## Environment

Salin dari `.env.example`. Set scope **Production, Preview, dan Development** di Vercel untuk semuanya — `NEXT_PUBLIC_*` di-inline saat build, jadi preview tanpa env akan build dengan konfigurasi Firebase kosong.

| Variabel | Sisi | Catatan |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID` | client | boleh publik, batasi via Firebase Console |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | server | private key satu baris, `\n` literal, tanpa tanda kutip |
| `FIREBASE_STORAGE_BUCKET` | server | opsional, default ikut `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `ADMIN_EMAILS` | server | **tipe Config, bukan Secret** — allowlist email, pisahkan koma |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | client+server | kosong = UI upload dinonaktifkan |
| `NEXT_PUBLIC_SITE_URL` | client+server | domain resmi untuk metadata/canonical/sitemap/robots |

### Composite index Firestore (wajib)

`listBerita()` dan `listGaleri()` menggabungkan `where("published")` + `orderBy`, jadi butuh composite index:

| Koleksi | Field |
|---|---|
| `berita` | `published` ASC + `dateISO` DESC |
| `galeri` | `published` ASC + `order` ASC |

Deploy lewat CLI `npx firebase-tools deploy --only firestore:indexes --project <id>` (definisi di `firestore.indexes.json`) atau buat manual di Console. Sampai index berstatus `Ready`, query jatuh ke jalur cadangan: ambil tanpa `orderBy` (maks 500 dokumen) lalu urutkan di memori — itu pengaman, bukan pengganti index.

## Deploy

Siap ke Vercel (Node 22; `.vercel` sudah di-ignore). Alternatif: `npm run build && npm start` di VPS.

> **Jangan** pakai `output: 'export'`. Panel admin, API route, session cookie, dan baca Firestore di server butuh runtime Node — ekspor statis akan mematikan seluruh CMS.

Bila API tiba-tiba 500, cek `/api/health` lebih dulu: health 200 tapi rute lain 500 = masalah dependency server (mis. `firebase-admin`); health ikut 500 = semua route handler rusak di level platform.

## Dokumen terkait

- `DESIGN_SYSTEM.md` — token warna, tipografi Playfair Display/Geist, pola card, anatomi halaman baru, checklist.
- `FIREBASE_SETUP.md` — langkah setup console: service account, Auth, rules, index.




