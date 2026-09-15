# PLAN — Flexible Page Builder (Kontrak Beku untuk 4 Sub-Agent)

Repo: `/home/hauzann/Documents/School Website Project` · Branch: `feat/admin-page-builder`
Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Firebase Admin (Firestore) · Cloudinary

Baca juga: `PRD-Admin-Page-Builder.md` (kebutuhan) dan `DESIGN_SYSTEM.md` (token visual).

> **ATURAN PARALEL.** Empat agent bekerja di SATU working tree. Setiap agent HANYA boleh
> membuat/mengubah file yang tercantum di bagiannya. JANGAN menyentuh file agent lain,
> `DESIGN_SYSTEM.md`, `globals.css`, `components/sections/*`, atau `lib/*-server.ts` yang sudah ada.
> JANGAN `git commit`, `git push`, `git checkout`, atau `git stash`. JANGAN `npm install`.
> Jika modul milik Agent 1 belum ada, tetap tulis `import` ke sana — JANGAN membuat stub/modul tiruan.

---

## 1. Keputusan desain (menutup Pertanyaan Terbuka PRD)

1. **Role**: tetap 1 level admin (`ADMIN_EMAILS`). Tidak ada role baru.
2. **Preview**: admin punya `/pratinjau/[id]` (wajib login, `noindex`) — mencerminkan halaman persis.
3. **Riwayat versi**: maksimum 10 snapshot terakhir per halaman, tombol "Pulihkan".
4. **SEO**: `metaTitle` + `metaDescription` dapat diedit dari admin.
5. **Grouping menu**: koleksi kecil `nav_groups` (1 dokumen) menyimpan daftar grup + urutannya;
   tiap halaman punya `groupKey` (`null` = menu utama / independen).
6. **Urutan**: angka `urutan` + tombol naik/turun (tanpa drag-and-drop agar andal di HP).
7. **Preservasi desain**: editor TIDAK menerima HTML/CSS bebas. Blok bertipe tetap, dan renderer
   memakai token design system. Admin memilih varian enum, bukan CSS.
8. **Istilah UI ramah non-coder**: "Alamat halaman" (slug), "Menu induk" (group), "Urutan",
   "Pratinjau", "Riwayat", "Tayangkan/Draft".

---

## 2. Model data Firestore

### Koleksi `halaman`
```ts
export type HalamanDoc = {
  id: string;
  slug: string;              // "" untuk beranda, selain itu "sejarah" (tanpa slash)
  judul: string;             // h1 halaman
  navLabel: string;          // label di navbar (fallback = judul)
  groupKey: string | null;   // id grup menu; null = independen
  urutan: number;            // urutan antar-sibling (kecil dulu)
  showInNav: boolean;        // tampil di navbar publik?
  collapsible: boolean;      // grup dapat dibuka-tutup (dropdown) di navbar
  published: boolean;        // false = draft (404 publik)
  systemPath: string | null; // path halaman bawaan, mis. "/visi-misi"; null = halaman builder
  heroTitle: string;         // judul besar di PageHero
  heroDescription: string;
  blok: Blok[];              // konten tambahan (setelah konten bawaan bila halaman sistem)
  metaTitle: string;
  metaDescription: string;
  riwayat: HalamanVersi[];   // maks MAX_RIWAYAT, terbaru di depan
  createdAt: string;
  updatedAt: string;
};

export type HalamanVersi = {
  savedAt: string;
  judul: string;
  blok: Blok[];
  metaTitle: string;
  metaDescription: string;
};
```

### Koleksi `nav_groups`
```ts
export const NAV_GROUPS_COLLECTION = "nav_groups";
export const NAV_GROUPS_DOC_ID = "navigasi";
export type NavGroupsItem = { groupKey: string; label: string; urutan: number };
export type NavGroupsDoc = { items: NavGroupsItem[]; updatedAt: string };
```

### Aturan
- `slug` hanya `a-z0-9-`, tanpa dash di ujung. `isReservedSlug` menolak slug yang bertabrakan
  dengan path halaman bawaan; `slug` juga wajib unik antar dokumen `halaman`.
- `systemPath` read-only setelah dokumen dibuat (tidak boleh diubah lewat PATCH).
- Halaman builder (`systemPath === null`) dirender publik di `/halaman/[slug]`.

---

## 3. Blok konten (`lib/halaman-schema.ts`)

```ts
export type BlokTipe =
  | "paragraf" | "heading" | "gambar" | "galeri" | "tombol"
  | "video" | "divider" | "spacer" | "kutipan" | "daftar";

export type Blok = {
  id: string;
  tipe: BlokTipe;
  teks?: string;                        // paragraf, heading, kutipan, tombol(label)
  level?: 2 | 3 | 4;                    // heading
  src?: string;                         // gambar & video (URL), tombol tidak
  alt?: string;                         // gambar
  caption?: string;                     // gambar, video
  href?: string;                        // tombol
  items?: string[];                     // galeri(src[]) & daftar(teks[])
  varian?: string;                      // lihat §5
  tinggi?: "kecil" | "sedang" | "besar"; // spacer
};
```

Batas: `MAX_BLOK = 80`, `MAX_RIWAYAT = 10`, teks maks 5000/field, `items` maks 40.

---

## 4. Kontrak modul Agent 1 (frozen)

### `lib/halaman-schema.ts` (TANPA `server-only`)
```ts
export type BlokTipe, Blok, HalamanVersi, HalamanDoc, NavGroupsItem, NavGroupsDoc;
export type NavItemPublic =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

export const HALAMAN_COLLECTION: string;    // "halaman"
export const NAV_GROUPS_COLLECTION: string; // "nav_groups"
export const NAV_GROUPS_DOC_ID: string;     // "navigasi"
export const MAX_BLOK: number;              // 80
export const MAX_RIWAYAT: number;           // 10
export const BLOK_LABEL: Record<BlokTipe, string>;
export const BLOK_TIPE_ORDER: BlokTipe[];

export function slugifyHalaman(input: string): string;
export function newBlokId(): string;
export function emptyBlok(tipe: BlokTipe): Blok;
export function sanitizeBlok(raw: unknown): Blok[];
export function validateHalaman(input: Record<string, unknown>): { ok: boolean; errors: string[] };
export function normalizeHalamanInput(
  input: Record<string, unknown>,
  existing?: Partial<HalamanDoc>,
): Omit<HalamanDoc, "id" | "createdAt" | "updatedAt">;
```
`validateHalaman` menolak: `judul` < 3 atau > 160 char; `heroDescription` > 400;
`metaTitle` > 70; `metaDescription` > 160; `blok` > `MAX_BLOK`; `urutan` di luar 0..9999;
karakter `<`/`>` di teks blok; `href` bukan `/...` atau `https://...`.
URL gambar divalidasi dengan `isValidImageUrl` (`lib/image-url.ts`) di server, bukan di schema.

### `lib/page-registry.ts`
```ts
export type SystemPageDef = {
  path: string;        // "/visi-misi" (beranda = "/")
  slug: string;        // "" untuk beranda, "visi-misi" untuk sisanya
  label: string;
  description: string;
  groupKey: string | null;
  urutan: number;
  hero: boolean;       // render PageHero? (beranda = false)
  solidHeader: boolean;// SiteHeader solidOnTop? (beranda = false)
  managed: boolean;    // konten dapat diedit admin? (berita/[slug] = false)
  systemKey: string;   // kunci unik, mis. "visi-misi", "beranda"
};
export const SYSTEM_PAGES: SystemPageDef[];
export const MANAGED_SYSTEM_PAGES: SystemPageDef[];
export const RESERVED_SLUGS: string[];
export const DEFAULT_NAV_ITEMS: NavItemPublic[];  // fallback navbar (= NAV lama)
export function isReservedSlug(slug: string): boolean;
export function systemPageByPath(path: string): SystemPageDef | undefined;
export function systemPageBySlug(slug: string): SystemPageDef | undefined;
export function systemPageByKey(key: string): SystemPageDef | undefined;
```
`SYSTEM_PAGES` = 17 entri (lihat §7). `RESERVED_SLUGS` = slug non-kosong + "berita/*" turunan.

### `lib/halaman-server.ts` (`import "server-only"`)
```ts
export async function listHalaman(opts?: { includeDraft?: boolean }): Promise<HalamanDoc[]>;
export async function getHalamanById(id: string): Promise<HalamanDoc | null>;
export async function getHalamanBySlug(slug: string): Promise<HalamanDoc | null>;
export async function getHalamanByPath(path: string): Promise<HalamanDoc | null>;
export async function createHalaman(input: Record<string, unknown>): Promise<HalamanDoc>;
export async function updateHalaman(id: string, input: Record<string, unknown>): Promise<HalamanDoc>;
export async function deleteHalaman(id: string): Promise<HalamanDoc | null>;
export async function restoreHalaman(id: string, savedAt: string): Promise<HalamanDoc>;
export async function seedSystemPages(): Promise<{ created: string[]; skipped: string[] }>;
export async function getNavSource(): Promise<{ halaman: HalamanDoc[]; groups: NavGroupsDoc }>;
```
Wajib meniru `lib/galeri-server.ts`: guard `adminConfigured()`, `snapToDoc()` defensif dengan
`clampStr`/`fallbackStr`, dan fallback in-memory bila composite index belum ada
(`FAILED_PRECONDITION|requires an index`). `updateHalaman` menyimpan snapshot ke `riwayat`
sebelum menimpa (maks `MAX_RIWAYAT`), dan menghormati `expectedUpdatedAt` → 409 bila beda.

### `lib/nav-groups-server.ts` (`import "server-only"`)
```ts
export async function getNavGroups(): Promise<NavGroupsDoc>;   // default { items: [], updatedAt: "" }
export async function saveNavGroups(items: NavGroupsItem[]): Promise<NavGroupsDoc>;
```

---

## 5. Matriks render blok (WAJIB dipakai Agent 2, 3, 4)

| tipe | field | varian | render |
|---|---|---|---|
| paragraf | `teks` | — | `<p className="text-base leading-relaxed text-muted">` |
| heading | `teks`, `level` (default 2) | — | h2/h3/h4 `font-display tracking-tight text-ink` |
| gambar | `src`,`alt`,`caption` | `normal`(4:3), `wide`(16:9), `full`(21:9) | `rounded-lg` + caption `text-xs text-muted` |
| galeri | `items[]` (src) | `grid2`, `grid3`, `carousel` | grid `gap-4`, item `rounded-lg overflow-hidden` |
| tombol | `teks`,`href` | `primary`, `outline`, `soft` | `rounded-full px-6 py-2.5 text-sm`; primary=`bg-navy text-cream`, outline=`border border-navy/30 text-navy`, soft=`bg-navy/5 text-navy` |
| video | `src`,`caption` | — | `<iframe>` responsif `aspect-video rounded-lg`; host hanya youtube/vimeo |
| divider | — | — | `<hr className="border-navy/10">` |
| spacer | `tinggi` | `kecil`(h-8), `sedang`(h-16), `besar`(h-28) | `<div aria-hidden>` |
| kutipan | `teks` | — | `border-l-2 border-navy/20 pl-6 font-display text-xl italic text-navy-muted` |
| daftar | `items[]` (teks) | — | `<ul className="list-disc space-y-2 pl-6 text-muted">` |

Semua blok dibungkus `<Reveal delay={i * 0.05}>` dari `@/components/ui/Reveal` (kecuali `divider`
dan `spacer`). Kontainer blok: `space-y-8`.

---

## 6. Kontrak modul bersama (frozen)

```tsx
// components/blocks/BlockRenderer.tsx  — TANPA "use client" (server-safe)
export function BlockRenderer({ blok, className }: { blok: Blok[]; className?: string }): React.ReactElement;

// components/blocks/BlockEditor.tsx
"use client";
export function BlockEditor({ value, onChange }: { value: Blok[]; onChange: (b: Blok[]) => void }): React.ReactElement;
```

---

## 7. Pembagian kerja (file ownership — tidak ada yang bentrok)

### AGENT 1 — Fondasi data + API
Buat:
- `lib/halaman-schema.ts` (§3 + §4)
- `lib/page-registry.ts` (§4)
- `lib/halaman-server.ts` (§4)
- `lib/nav-groups-server.ts` (§4)
- `app/api/halaman/route.ts` — `GET` (list, `?includeDraft=1`), `POST` (create)
- `app/api/halaman/[id]/route.ts` — `GET`, `PATCH`, `DELETE`
- `app/api/halaman/[id]/riwayat/route.ts` — `GET` (list riwayat), `POST { savedAt }` (pulihkan)
- `app/api/halaman/seed/route.ts` — `POST` → `seedSystemPages()`
- `app/api/nav-groups/route.ts` — `GET`, `PUT`
- `firestore.indexes.json` (tambah index `halaman`: `published ASC, urutan ASC` dan `groupKey ASC, urutan ASC`)
- `firestore.rules` (tambah `halaman` & `nav_groups`: `allow read: if true; allow write: if false;`)

Semua route wajib `runtime="nodejs"`, `dynamic="force-dynamic"`, `assertSameOrigin` + `requireAdmin`
untuk mutasi, `errMsg` untuk error, dan `revalidatePath("/", "layout")` setelah mutasi sukses.
Pola persis: `app/api/galeri/route.ts` dan `app/api/galeri/[id]/route.ts`.

`seedSystemPages()` membuat dokumen untuk **16 halaman bawaan yang `managed:true`**
(`/berita/[slug]` dikecualikan): idempotent (skip bila `systemPath` sudah ada), isi `slug`,
`judul`, `navLabel`, `groupKey`, `urutan` dari registry, `published: true`, `blok: []`, `heroTitle`.

### AGENT 2 — Renderer & editor blok
Buat:
- `components/blocks/BlockRenderer.tsx` (server-safe, §5 + §6)
- `components/blocks/BlockEditor.tsx` (`"use client"`, §6)
- `components/blocks/blok-meta.ts` (`BLOK_LABEL` re-export, ikon/emoji, daftar varian per tipe)
- `components/blocks/BlockField.tsx` (label+hint+input; import `inputCls` dari `@/components/admin/Field` — JANGAN ubah file itu)
- `components/blocks/BlockItemList.tsx` (editor array `items` untuk galeri & daftar)
- `components/blocks/BlokForm.tsx` (form field per tipe, dipakai `BlockEditor`)

UX editor: tombol **+ Tambah blok** (menu pilih tipe), tiap blok punya header (nama tipe + tombol
naik/turun/hapus), field di bawahnya. Tanpa drag-and-drop. Tanpa input HTML/CSS.

### AGENT 3 — UI admin + pratinjau
Buat:
- `components/admin/HalamanTable.tsx` — daftar halaman (judul, alamat, menu induk, badge
  "Bawaan"/"Draft", jumlah blok) + Ubah/Pratinjau/Riwayat/`ConfirmDialog` hapus.
- `components/admin/HalamanForm.tsx` — `"use client"`; field: Judul, Alamat halaman (auto dari judul,
  bisa diedit, hanya untuk halaman builder — untuk halaman bawaan ditampilkan read-only + catatan),
  Label menu, Menu induk (select dari `NavGroupsDoc.items` + "Tanpa menu"), Urutan, Tampil di menu,
  Grup dapat dibuka-tutup, Tayangkan/Draft, Judul hero, Deskripsi hero, Meta title, Meta description,
  dan `<BlockEditor>`. Kirim `expectedUpdatedAt` agar bentrok terdeteksi (409).
- `components/admin/HalamanRiwayatDialog.tsx` — daftar ≤10 revisi + tombol Pulihkan.
- `components/admin/NavGroupManager.tsx` — CRUD + urutkan grup menu (`PUT /api/nav-groups`).
- `components/admin/PagePreview.tsx` — render `PageHero` + `BlockRenderer` untuk pratinjau.
- `app/admin/(panel)/halaman/page.tsx` — daftar + ringkasan (total/tayang/draft) + tombol "Halaman baru".
- `app/admin/(panel)/halaman/baru/page.tsx`
- `app/admin/(panel)/halaman/[id]/ubah/page.tsx`
- `app/admin/(panel)/menu/page.tsx`
- `app/pratinjau/[id]/page.tsx` — wajib `verifyAdminSession()`, `robots: { index: false }`, banner "Mode pratinjau".
- **Edit** `components/admin/PanelNav.tsx` — tambah menu "Halaman" (`/admin/halaman`) dan "Menu" (`/admin/menu`).

Gunakan upload gambar yang SUDAH ADA: `<ImageUploadField uploadUrl="/api/galeri/upload" ... />`
dari `components/admin/ImageUploadField.tsx` — jangan buat route upload baru.
Gunakan `ConfirmDialog`, `Field`, `inputCls`, `SectionHeading`, `Reveal` yang sudah ada.

### AGENT 4 — Render publik + navigasi dinamis + sitemap
Buat:
- `lib/nav-public.ts` — `export function buildPublicNav(halaman: HalamanDoc[], groups: NavGroupsDoc): NavItemPublic[]`
  (pure; urutkan pakai `groups.items[].urutan` lalu `halaman.urutan`; buang `published:false` atau
  `showInNav:false`; `collapsible` menentukan dropdown).
- `components/public/SystemPageBody.tsx` — `export function SystemPageBody({ systemKey }: { systemKey: string })`;
  tabel kunci → komposisi section yang SUDAH ADA. Ini mempertahankan desain halaman bawaan:
  - `beranda` → `Hero`, `Berita`, `SectionDivider`, `Academic`, `Gallery`, `Testimonials`, `Contact`
  - `sejarah` → `About`, `Sejarah` · `visi-misi` → `VisiMisi` · `struktur` → `Struktur`
  - `alumni` → `Alumni` · `komite-sekolah` → `KomiteSekolah` · `kalender-pendidikan` → `KalenderPendidikan`
  - `jurnal-absensi` → konten inline lama (pindahkan JSX-nya ke sini) · `data-lulusan` → idem
  - `snbp-snbt` → idem · `bk` → `BK` · `eskul` → `Extracurricular` · `fasilitas` → `Facilities`
  - `ppdb` → `PPDB` · `prestasi` → `Achievements` · `berita` → konten inline lama `app/berita/page.tsx`
    (pindahkan JSX-nya ke sini apa adanya)
- `components/public/HalamanSistemPage.tsx` — `export async function HalamanSistemPage({ systemKey }: { systemKey: string })`:
  ambil `systemPageByKey`, `getHalamanByPath(path)`; bila dokumen ada & `published:false` → `notFound()`;
  `hero` dari registry (`heroTitle`/`heroDescription` dokumen menimpa deskripsi bila diisi);
  render `<SiteHeader solidOnTop={def.solidHeader} />` + `PageHero` (bila `def.hero`) +
  `<main id="konten-utama">` + `<SystemPageBody/>` + blok tambahan (`<BlockRenderer blok={doc.blok}/>`
  dibungkus section `mx-auto max-w-6xl px-6 py-16`) + `<Footer/>`.
- `components/public/HalamanBuilderPage.tsx` + `app/halaman/[slug]/page.tsx` — halaman builder baru:
  `notFound()` bila draft/tidak ada; `generateMetadata` dari `metaTitle`/`metaDescription` + canonical;
  `export const revalidate = 300`.
- **Edit** `components/ui/SiteHeader.tsx` → pecah menjadi:
  - `components/ui/SiteHeaderClient.tsx` — salinan `"use client"` dari implementasi sekarang, tapi
    `NAV` diganti prop `items: NavItemPublic[]`.
  - `components/ui/SiteHeader.tsx` — `export async function SiteHeader({ solidOnTop })` (server):
    ambil `getNavSource()` + `buildPublicNav()`, dibungkus `cache()` React; bila kosong/gagal →
    `DEFAULT_NAV_ITEMS`. Lalu `return <SiteHeaderClient items={items} solidOnTop={solidOnTop} />`.
  **Pertahankan markup, className, dan aksesibilitas persis** (perubahan hanya sumber data).
  Jangan sentuh halaman pemanggil `<SiteHeader ... />` di app/** (signature tidak berubah).
- **Edit** 16 file halaman bawaan menjadi tipis, contoh `app/visi-misi/page.tsx`:
  ```tsx
  import type { Metadata } from "next";
  import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";
  export const metadata: Metadata = { /* PERTAHANKAN metadata existing apa adanya */ };
  export default function VisiMisiPage() {
    return <HalamanSistemPage systemKey="visi-misi" />;
  }
  ```
  File: `app/page.tsx` (beranda), `app/visi-misi`, `app/sejarah`, `app/struktur`, `app/alumni`,
  `app/komite-sekolah`, `app/kalender-pendidikan`, `app/jurnal-absensi`, `app/data-lulusan`,
  `app/snbp-snbt`, `app/bk`, `app/eskul`, `app/fasilitas`, `app/ppdb`, `app/prestasi`, `app/berita`.
  **Pertahankan `export const revalidate = 300` dan `export const metadata`** tiap file.
  `app/berita/[slug]/page.tsx` JANGAN disentuh.
- **Edit** `app/sitemap.ts` — tambah entri dari `listHalaman({ includeDraft:false })` yang
  `systemPath === null` (halaman builder), hindari duplikat.

---

## 8. Definisi selesai per agent
- `npx tsc --noEmit` dijalankan; laporkan error yang tersisa (error import ke modul Agent 1 yang
  belum ada DAPAT diterima saat lapor, jangan diperbaiki dengan membuat file tiruan).
- `npm run lint` tidak menambah error baru.
- JANGAN `git commit` / `git push`.
- Lapor: daftar file dibuat/diubah, hasil `tsc`/`lint`, keputusan menyimpang, blocker.
