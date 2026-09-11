# Implementation Plan — Admin Prestasi, Nav Feedback, Filter Bulan Berita

## Overview
Tiga fitur: (1) CRUD prestasi di panel admin → tampil di `/prestasi` publik, (2) feedback navigasi admin (active state + skeleton), (3) filter berita per bulan di `/berita`.

## Types
`lib/prestasi-schema.ts`: `PrestasiScope` (Kabupaten/Provinsi/Nasional), `PRESTASI_SCOPES`, `PrestasiDoc { id, year, scope, title, who, published, createdAt, updatedAt }`, `isPrestasiScope`, `validatePrestasi` (tahun `^\d{4}$`, scope whitelist, title 8–160, who 3–160, larang `<`/`>`), `normalizePrestasiInput`. `PrestasiFormValue` di form. `lib/berita-schema.ts`: export `ID_MONTHS` untuk label chip bulan.

## Files
Baru: `lib/prestasi-schema.ts`, `lib/prestasi-server.ts` (CRUD koleksi `prestasi` + fallback index), `app/api/prestasi/route.ts` (GET/POST), `app/api/prestasi/[id]/route.ts` (GET/PATCH/DELETE), `components/admin/PrestasiForm.tsx`, `PrestasiTable.tsx`, `PanelNav.tsx`, `app/admin/(panel)/prestasi/page.tsx`, `prestasi/baru/page.tsx`, `prestasi/[id]/ubah/page.tsx`, `app/admin/(panel)/loading.tsx` (skeleton).
Ubah: `app/admin/(panel)/layout.tsx` (pasang PanelNav), `components/sections/Achievements.tsx` (data Firestore + fallback coming soon), `app/prestasi/page.tsx` (copy + revalidate), `app/berita/page.tsx` (searchParams bulan + chip filter), `firestore.indexes.json` (index prestasi), `README.md`.

## Functions
`listPrestasi/getPrestasiById/createPrestasi/updatePrestasi/deletePrestasi` (pola galeri-server), `PanelNav` (usePathname + pendingHref), `Achievements` jadi async server component.

## Dependencies
Tidak ada package baru.

## Testing
`npm run lint` → `npm run build` → curl `/prestasi`, `/berita?bulan=YYYY-MM`, `/berita?bulan=bogus` → manual CRUD + nav.

## Implementation Order
1 schema → 2 server → 3 indexes → 4 API → 5 form/table → 6 halaman admin → 7 PanelNav+loading → 8 layout → 9 Achievements → 10 prestasi page → 11 berita filter → 12 README → 13 validasi.

## Catatan
Form prestasi teks saja (keputusan user). Rute baru di bawah /admin otomatis kena guard (grup `(panel)`). Coming soon dipertahankan sebagai fallback saat koleksi kosong.
