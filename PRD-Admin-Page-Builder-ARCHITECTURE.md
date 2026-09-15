# ARCHITECTURE — Flexible Page Builder (Frozen Contract)

> Dokumen ini adalah **kontrak beku** untuk 4 sub-agent paralel. Jangan ubah bentuk
> tipe/field/route di sini tanpa menyelaraskan keempatnya. Semua nama field, tipe,
> path module, dan signature fungsi WAJIB persis seperti tertulis.

Stack nyata project: **Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4 +
Firebase Admin (Firestore) + Cloudinary**. Auth: session cookie + allowlist email (`ADMIN_EMAILS`).
Semua akses Firestore LEWAT API route (`requireAdmin()`), bukan client SDK. Guard halaman admin ada
di `app/admin/(panel)/layout.tsx`.

---

## 0. Keputusan desain (menjawab Pertanyaan Terbuka PRD)

| # | Pertanyaan PRD | Keputusan | Alasan |
|---|---|---|---|
| 1 | Role/permission | **1 level admin** (allowlist yang ada). Tidak ada role baru. | Sesuai `ADMIN_EMAILS`; fase 2 bila perlu. |
| 2 | Preview sebelum publish | **Ya, preview aman**. `/pratinjau/[slug]?token=...` — bukan route publik, `robots: noindex`. | Non-fungsional PRD butuh draft/preview. |
| 3 | Version history | **Ya, sederhana**: maks 10 revisi terakhir per halaman, 1-klik pulihkan. | "Idealnya ada riwayat versi (undo) minimal sederhana". |
| 4 | SEO per halaman | **Ya**: `metaTitle` + `metaDescription` dapat diedit dari admin. | Kriteria sukses + SEO dasar. |

**Kelompok konten**: Halaman dokumentasi dikelompokkan via **`navGroups`** (koleksi kecil) + kunci
`groupKey` di halaman. Halaman dengan `groupKey === null` = independen.

**Preservasi desain (3.4)**: editor TIDAK menerima HTML/CSS bebas. Blok = tipe terbatas; renderer
memakai token design system (navy/cream/paper, `font-display`, `rounded-lg`, `Reveal`). Admin
memilih **varian** enum, bukan nilai CSS.

**Istilah ramah non-coder (5)**: UI memakai "Alamat halaman" (bukan slug), "Menu induk"
(bukan parent/group), "Urutan" (bukan order), "Pratinjau", "Riwayat".

---

## 1. Model Data Firestore

Koleksi baru: **`halaman`**. (Tidak ada koleksi `halaman_versi` terpisah — versi disimpan sebagai
sub-array agar 1 read. Batas 10 revisi × konten kecil tetap jauh di bawah limit 1MiB Firestore.)

```ts
// lib/halaman-schema.ts  (TIDAK ada "server-only" — dipakai client form & server)
export type BlokTipe =
  | "paragraf" | "heading" | "gambar" | "galeri" | "tombol"
  | "video" | "divider" | "spacer" | "kutipan" | "daftar";

export type BlokVarian =
  | "normal" | "small" | "large" | "wide" | "full" | "narrow"
  | "left" | "center" | "right"
  | "primary" | "outline" | "soft"
  | "grid2" | "grid3" | "carousel";

export type Blok = {
  id: string;              // nanoid-ish, unik dalam satu halaman
  tipe: BlokTipe;
  // field opsional — hanya yang relevan untuk tipe tertentu
  teks?: string;           // paragraf, heading, kutipan, tombol(label)
  level?: 2 | 3 | 4;       // heading
  src?: string;            // gambar (URL tervalidasi), video (URL embed), tombol(href)
  alt?: string;            // gambar
  caption?: string;        // gambar, video
  href?: string;           // tombol, item daftar(link opsional)
  items?: string[];        // galeri(src[]) , daftar(item teks), tombol? tidak
  varian?: BlokVarian;     // lihat matriks di §4
  tinggi?: "kecil" | "sedang" | "besar"; // spacer
};

// Versi revisi ringkas (snapshot). Maks 10 disimpan, terbaru duluan.
export type HalamanVersi = {
  savedAt: string;                       // ISO
  judul: string;
  blok: Blok[];
  metaTitle: string;
  metaDescription: string;
};

export type HalamanDoc = {
  id: string;
  slug: string;                 // URL publik, unik
  judul: string;                // judul halaman (h1)
  judulAccent: string;          // 1 kata yang di-italic (boleh "")
  deskripsiHero: string;        // subjudul di PageHero (boleh "")
  status: "published" | "draft";
  groupKey: string | null;      // null = independen
  urutan: number;               // kecil tampil duluan
  metaTitle: string;            // <title> publik
  metaDescription: string;      // <meta name=description>
  linkedPath: string | null;    // path halaman SISTEM (mis. "/visi-misi") atau null = halaman baru
  blok: Blok[];
  riwayat: HalamanVersi[];      // maks 10
  createdAt: string;
  updatedAt: string;
};

// Koleksi navigasi: urutan & label menu induk.
export type NavGroupsDoc = {
  id: string;
  items: { groupKey: string; label: string; urutan: number }[];
  updatedAt: string;
};
export const NAV_GROUPS_DOC_ID = "navigasi";
```

**Aturan penting**
- `slug` hanya `a-z0-9-` (slugify). Tidak boleh bertabrakan dengan path publik yang sudah ada.
- `linkedPath` **read-only setelah dibuat**. Halaman sistem = dokumen yang `linkedPath` != null.
- Halaman baru (`linkedPath === null`) dirender di **`/halaman/[slug]`**.
- Halaman sistem (`linkedPath != null`) dirender oleh file route aslinya (kode tetap), memakai
  konten dari dokumen ini. Kode halaman TIDAK dihapus.

---

## 2. Registry halaman sistem

`lib/page-registry.ts` — sumber tunggal path publik. `SLUG_RESERVED` = semua path ini (tanpa `/`).

```ts
export type SystemPage = {
  path: string;        // "/visi-misi"
  label: string;       // "Visi & Misi"
  description: string; // dipakai sebagai seed deskripsiHero
  managed: boolean;    // true = konten dapat diedit admin via builder
};

export const SYSTEM_PAGES: SystemPage[] = [ /* 17 entri di bawah */ ];
export const SLUG_RESERVED: string[];     // dari SYSTEM_PAGES.path
export const MANAGED_SYSTEM_PAGES: SystemPage[];
export function isReservedSlug(slug: string): boolean;
export function systemPageBySlug(slug: string): SystemPage | undefined;
export function systemPageByPath(path: string): SystemPage | undefined;
```

Seed 17 entri (path → label):
`/` Beranda · `/visi-misi` Visi & Misi · `/sejarah` Sejarah · `/struktur` Struktur Organisasi ·
`/alumni` Alumni · `/komite-sekolah` Komite Sekolah · `/kalender-pendidikan` Kalender Pendidikan ·
`/jurnal-absensi` Jurnal & Absensi · `/data-lulusan` Data Lulusan · `/snbp-snbt` SNBP & SNBT ·
`/bk` Bimbingan Konseling · `/berita` Berita · `/prestasi` Prestasi · `/fasilitas` Fasilitas ·
`/eskul` Ekstrakurikuler · `/ppdb` PPDB · `/berita/[slug]` Detail Berita *(managed:false)*.

`managed:false` hanya untuk Beranda, Berita, Detail Berita (halaman terkurasi/khusus).

---

## 3. Kontrak API (semua: `runtime="nodejs"`, `dynamic="force-dynamic"`)

Pola WAJIB sama seperti `app/api/galeri/route.ts`: `assertSameOrigin` + `requireAdmin` + `errMsg`.

| Method | Route | Body/Query | Sukses |
|---|---|---|---|
| GET | `/api/halaman` | `?includeDraft=1` | `{ data: HalamanDoc[] }` |
| POST | `/api/halaman` | `HalamanCreateInput` | `201 { data: HalamanDoc }` |
| GET | `/api/halaman/[id]` | — | `{ data: HalamanDoc }` |
| PATCH | `/api/halaman/[id]` | `HalamanUpdateInput` | `{ data: HalamanDoc }` |
| DELETE | `/api/halaman/[id]` | — | `{ ok: true }` |
| GET | `/api/halaman/[id]/riwayat` | — | `{ data: HalamanVersi[] }` |
| POST | `/api/halaman/[id]/riwayat` | `{ savedAt: string }` | `{ data: HalamanDoc }` (pulihkan) |
| GET | `/api/nav-groups` | — | `{ data: NavGroupsDoc }` |
| PUT | `/api/nav-groups` | `{ items: NavGroupsDoc["items"] }` | `{ data: NavGroupsDoc }` |
| POST | `/api/page-upload` | `multipart: file, folder?` | `201 { url, public_id }` |

```ts
export type HalamanCreateInput = {
  judul: string; slug?: string; judulAccent?: string; deskripsiHero?: string;
  status?: "published" | "draft"; groupKey?: string | null; urutan?: number;
  metaTitle?: string; metaDescription?: string;
  linkedPath?: string | null;      // HANYA boleh diisi bila halaman sistem belum punya doc
  blok?: Blok[];
};
export type HalamanUpdateInput = Partial<Omit<HalamanCreateInput, "linkedPath">> & {
  expectedUpdatedAt?: string;      // optimistic concurrency; mismatch → 409
};
```

Setiap PATCH/POST/DELETE memanggil `revalidatePath("/", "layout")` seperti route galeri.
`status === "draft"` → TIDAK disertakan di listing publik.

---

## 4. Modul & Pembagian Kerja (bebas konflik file)

### AGENT 1 — Fondasi Data + API
Buat:
- `lib/halaman-schema.ts` — tipe §1 + `slugify` (reuse dari `berita-schema` boleh re-export), `validateHalaman`, `normalizeHalamanInput`, `BLOCK_MATRIX`, `emptyBlok(tipe)`, `MAX_BLOK=80`, `MAX_RIWAYAT=10`, `MAX_URL_LEN=2000`.
- `lib/page-registry.ts` — §2.
- `lib/halaman-server.ts` — `listHalaman`, `listHalamanPublished`, `getHalamanById`, `getHalamanBySlug`, `getHalamanByLinkedPath`, `createHalaman`, `updateHalaman`, `deleteHalaman`, `restoreHalaman(id, savedAt)`. Pola persis `lib/galeri-server.ts` (import "server-only", `adminConfigured()` guard, `snapToDoc` defensif + `clampStr`/`fallbackStr`, fallback index-missing in-memory sort).
- `lib/nav-groups-server.ts` — `getNavGroups`, `saveNavGroups`.
- `lib/halaman-seed.ts` — **seed idempotent** 15 halaman sistem managed → dokumen `halaman` dengan `linkedPath`, blok kosong/default ringkas, `groupKey`+`urutan` dari NAV yang ada di `SiteHeader`. **JANGAN jalankan** (butuh kredensial); cukup ekspor fungsi `seedSystemPages()` yang dipanggil dari route `POST /api/halaman/seed` (skip bila doc sudah ada; kembalikan ringkasan).
- `app/api/halaman/route.ts`, `app/api/halaman/[id]/route.ts`, `app/api/halaman/[id]/riwayat/route.ts`, `app/api/halaman/seed/route.ts`, `app/api/nav-groups/route.ts`, `app/api/page-upload/route.ts`.
- `firestore.indexes.json` — tambah index `halaman`: (`status` ASC, `urutan` ASC) dan (`groupKey` ASC, `urutan` ASC).
- `firestore.rules` — tambah `match /halaman/{id}` dan `match /nav_groups/{id}`: `allow read: if true; allow write: if false;` (konsisten dengan koleksi lain — tulis hanya lewat Admin SDK).

### AGENT 2 — Block Editor (komponen bersama)
Buat (folder `components/blocks/`):
- `types.ts` — re-export `Blok`/`BlokTipe`/`BlokVarian` dari `@/lib/halaman-schema` (jangan duplikasi definisi).
- `BlockRenderer.tsx` — **murni presentasional** (server-safe, tanpa "use client"), `export function BlockRenderer({ blok }: { blok: Blok[] })`.
- `BlockEditor.tsx` — `"use client"`; `export function BlockEditor({ value, onChange }: { value: Blok[]; onChange: (b: Blok[]) => void })`. Tambah / hapus / pindah atas-bawah satu blok, pilih tipe, isi field per tipe. Tombol naik/turun + hapus (bukan DnD — andal di HP).
- `BlockToolbar.tsx`, `BlockField.tsx` (dipakai `BlockEditor`), `BlockItemList.tsx` (galeri & daftar), `block-meta.ts` (`BLOCK_LABELS`, `BLOCK_ICONS`).

**Matriks render (BlockRenderer) — WAJIB konsisten dengan `BLOCK_MATRIX` Agent 1:**

| tipe | field dipakai | render |
|---|---|---|
| paragraf | `teks` | `<p className="text-base leading-relaxed text-muted">` |
| heading | `teks`,`level` | h2/h3/h4 `font-display tracking-tight text-ink`; `level` default 2 |
| gambar | `src`,`alt`,`caption`,`varian` | `rounded-lg`, `varian:"high"`→aspect 21:9, `"wide"`→16:9, default 4:3; caption `text-xs text-muted` |
| galeri | `items[]`,`varian` | grid: `grid2`/`grid3`/`carousel`; tiap item `rounded-lg overflow-hidden` |
| tombol | `teks`,`href`,`varian` | `primary`=bg-navy text-cream; `outline`=border-navy/40; `soft`=bg-navy/5 — semua `rounded-full px-6 py-2.5 text-sm` |
| video | `src`,`caption` | iframe embed responsif `aspect-video rounded-lg` (hanya allow youtube/vimeo host) |
| divider | — | `<hr className="border-navy/10">` |
| spacer | `tinggi` | kecil=h-8, sedang=h-16, besar=h-28 |
| kutipan | `teks` | `border-l-2 border-navy/20 pl-6 font-display italic text-xl text-navy-muted` |
| daftar | `items[]` | `<ul className="list-disc pl-6 space-y-2 text-muted">` |

Konten blok dibungkus `<Reveal>` bertahap (delay `i*0.05`). Validasi URL gambar dengan `isValidImageUrl` (`lib/image-url.ts`); href tombol hanya `/...` atau `https://...`.

### AGENT 3 — Admin UI
Buat:
- `components/admin/HalamanForm.tsx` (`"use client"`) — judul, alamat halaman (auto dari judul, dapat diedit, preview `/…`), judul accent, deskripsi hero, menu induk (select `NavGroupsDoc.items` + "Tanpa menu"), urutan, status, metaTitle, metaDescription, `<BlockEditor>`; tombol **Pratinjau**, **Simpan**, pilih status. Kirim `expectedUpdatedAt` untuk optimistic concurrency.
- `components/admin/HalamanTable.tsx` — daftar + filter status, badge "Halaman bawaan"/"Draft", Ubah, Pratinjau, Riwayat, `ConfirmDialog` hapus (warning tegas bila halaman sistem: hanya konten yang direset, route tetap ada).
- `components/admin/HalamanRiwayatDialog.tsx` — daftar ≤10 revisi, tombol Pulihkan → `POST /api/halaman/[id]/riwayat`.
- `components/admin/NavGroupManager.tsx` — tambah/hapus/urutkan menu induk, simpan ke `PUT /api/nav-groups`.
- Route: `app/admin/(panel)/halaman/page.tsx` (list + jumlah), `app/admin/(panel)/halaman/baru/page.tsx`, `app/admin/(panel)/halaman/[id]/ubah/page.tsx`, `app/admin/(panel)/halaman/tambah/…` tidak perlu, `app/admin/(panel)/halaman/riwayat/[id]/page.tsx` opsional (boleh dialog saja), `app/admin/(panel)/menu/page.tsx`.
- `components/admin/PanelNav.tsx` — tambah menu **"Halaman"** → `/admin/halaman` dan **"Menu"** → `/admin/menu` (edit file ini).
- `components/preview/PagePreview.tsx` — komponen preview bersama (dipakai halaman pratinjau Agent 4). Signature: `export function PagePreview({ hero, blok }: { hero: { judul: string; judulAccent: string; deskripsi: string }; blok: Blok[] })`. Pakai `PageHero` + `BlockRenderer` + `Reveal`.

> Agent 3 & 2 **berbagi folder berbeda**, tidak ada file bentrok. `PanelNav.tsx` hanya Agent 3.

### AGENT 4 — Render Publik + Navigasi + SEO
Buat:
- `app/halaman/[slug]/page.tsx` — halaman builder publik; `notFound()` bila tak ada/draft; `generateMetadata` dari metaTitle/metaDescription + canonical; `export const revalidate = 300`.
- `components/public/HalamanRenderer.tsx` — `<SiteHeader solidOnTop/>` + `PageHero` (breadcrumb Beranda › judul; judul = judul + accent italic) + `<main id="konten-utama" className="bg-cream">` berisi `<BlockRenderer>` di dalam section `mx-auto max-w-4xl px-6 py-24 lg:py-32` + `<Footer/>`. Bila `blok` kosong → tampil kartu "Halaman ini belum memiliki konten".
- `app/pratinjau/[slug]/page.tsx` — pratinjau admin; `?token=` divalidasi; `robots: noindex`; banner "Mode pratinjau". Boleh `searchParams` Promise.
- `components/ui/SiteHeader.tsx` — **ubah** navigasi: terima prop opsional
  `items?: NavItemPublic[]` (bentuk: `{ label, href?, children?: {href,label}[] }`). Bila `items` tidak diberikan, fallback ke `NAV` statis existing (agar tidak breaking). Server memanggil `/` layout? **Tidak** — cukup berikan prop dari halaman yang punya data; halaman statis lama tetap tanpa prop (fallback). Tambah dukungan accordion mobile untuk children (sudah ada) — hanya sumber data yang berubah.
- `lib/nav-public.ts` (server-safe) — `buildPublicNav(): Promise<NavItemPublic[]>`: gabung `listHalamanPublished()` + `getNavGroups()`, urutkan `groupKey`/`urutan`, buang halaman draft, hasilkan struktur `NavItemPublic[]`. Dipakai halaman builder & (opsional) root-ish pages.
- Update `app/sitemap.ts` — tambah entri dari `listHalamanPublished()` (skip yang `linkedPath` sudah ada, hindari duplikat).

### Integrasi kode halaman sistem (dikerjakan Agent 4, SETELAH Agent 1)
Ubah 12 file halaman sistem managed (`visi-misi`, `sejarah`, `struktur`, `alumni`, `komite-sekolah`, `kalender-pendidikan`, `jurnal-absensi`, `data-lulusan`, `snbp-snbt`, `bk`, `eskil`→`eskul`, `fasilitas`, `ppdb`) agar:
1. Ambil `getHalamanByLinkedPath("/path")` (server).
2. Jika ada dan `status==="published"` **dan** `blok.length>0` → render hero dinamis + `BlockRenderer` (konten dari admin).
3. Selain itu → **jalankan perilaku existing apa adanya** (kode lama tetap utuh sebagai fallback).

Pola yang diminta (contoh `/visi-misi`):
```tsx
const doc = await getHalamanByLinkedPath("/visi-misi");
if (doc && doc.status === "published" && doc.blok.length > 0) {
  return <HalamanRenderer doc={doc} />;
}
// fallback: JSX existing, tidak diubah
```
Halaman Beranda `/` dan Berita **tidak diubah** (managed:false) kecuali Beranda boleh ikut memakai `buildPublicNav` bila mudah — **opsional, jangan risiko**. Prioritaskan tidak ada breaking change.

---

## 5. Definisi "selesai" untuk tiap agent
- `npx tsc --noEmit` bersih untuk file yang disentuh (jalankan `npx tsc --noEmit`).
- `npm run lint` tidak menambah error baru.
- Jangan commit. Jangan `git push`.
- Jangan menyentuh file milik agent lain. Jangan edit `PRD-*.md` atau `DESIGN_SYSTEM.md`.
- Laporkan: file dibuat/diubah, cara verifikasi, dan blocker.
