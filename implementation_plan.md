# Implementation Plan — Tampilan Prestasi di HP: Hilangkan Geser Horizontal

## Overview
Menghilangkan overflow horizontal di `/prestasi` dan membuat seluruh isi daftar prestasi terlihat tanpa geser di HP dengan mengganti tabel 5 kolom menjadi daftar kartu di bawah breakpoint `lg`, plus merapikan baris `SiteHeader` pada layar sempit. Scope: 3 file kode + 1 dokumen desain. Tidak menyentuh data, API, skema, atau kartu share.

## Latar Belakang (terukur, bukan dugaan)

### Bug 1 — kanvas dokumen 792px, area kosong di kanan
`documentElement.scrollWidth` = 792px pada viewport 375px. Penyebabnya **bukan** tabel `min-w-[820px]`, melainkan `span.sr-only` di dalam `<th>` terakhir.

`.sr-only` = `position: absolute; width: 1px; height: 1px; overflow: hidden`. Karena semua ancestor-nya static, containing block-nya adalah *initial containing block* (`html`), **bukan** `div.overflow-x-auto`. Akibatnya span itu lolos dari clipping wrapper dan duduk di x=791–792.

Bukti eksperimen (headless, HTML hasil build + CSS asli):

| Eksperimen | `html.scrollWidth` |
|---|---|
| baseline (vw 375) | 792 |
| `span.sr-only` → `display:none` | **375** |
| wrapper `position: relative` | **375** |
| wrapper `contain: paint` | **375** |
| `caption.sr-only` → `display:none` | 792 (bukan penyebab) |
| `table` → `display:none` | 375 |
| `html { overflow-x: clip / hidden }` | 792 (tidak menolong) |
| `body { overflow-x: hidden }` | 792 |

`body { overflow-x: clip }` sudah ada di `app/globals.css` baris 47 tetapi tidak menolong karena containing block elemen pelarian ada di atas `body`. Sweep 22 halaman prerender (320–768px): hanya `/prestasi` yang `scrollWidth > clientWidth`.

### Bug 2 — tabel tidak bisa dipaksa muat di HP
Setelah `min-w-[820px]` dilepas, min-content tabel tetap **495px** (Tanggal 108 + Tingkat 114 + Prestasi 126 + Peraih 99 + Bagikan 48), sementara lebar wrapper hanya 257–327px di viewport 305–397px. Jadi tabel 5 kolom mustahil tampil utuh di HP; solusinya ganti bentuk, bukan kecilkan font.

### Bug 3 — tombol burger header menyusut di layar sempit
Pada vw=305, konten baris header butuh 329px, flexbox memencet tombol burger dari 40px jadi 20px dan tetap meluber (`row.scrollWidth = 309 > clientWidth = 305`).

## Types
- Import baru di `components/sections/Achievements.tsx`: `import type { PrestasiScope } from "@/lib/prestasi-schema";` — dipakai tipe prop `ScopeBadge`.
- Tidak ada tipe/interface/enum baru di `lib/`.

## Files

**1. `components/sections/Achievements.tsx`**
- Tambah import tipe `PrestasiScope`.
- Tambah komponen `ScopeBadge` (server component, tanpa hook) — memindahkan logika badge yang sebelumnya inline di dalam `<td>` supaya dipakai tabel **dan** kartu.
- Sisipkan `<ul>` daftar kartu sebelum wrapper tabel, kelas `mt-12 space-y-4 lg:hidden`.
- Wrapper tabel: `mt-16 overflow-x-auto` → `relative mt-16 hidden overflow-x-auto lg:block` (`relative` = containing block; `hidden lg:block` = hanya tampil ≥lg).
- `<th>` terakhir: buang `span.sr-only`, pindah label ke `aria-label="Bagikan"` pada `th`.
- `<td>` badge: pakai `<ScopeBadge scope={p.scope} />`, hapus variabel lokal `isInternational` / `isNational`.

**2. `components/ui/SiteHeader.tsx`**
- Baris 80: `gap-6 px-6` → `gap-4 px-4 sm:gap-6 sm:px-6`.
- Baris 97: `text-sm uppercase tracking-[0.18em]` → `text-xs uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]`.
- Baris 212: tombol burger tambah `shrink-0`.

**3. `app/globals.css`**
- Setelah blok `body`, tambah guard:
```css
/* Guard: satu elemen pelarian tidak boleh melebarkan dokumen. `body` saja
   tidak cukup — elemen `position:absolute` yang containing block-nya `html`
   melewati clip milik body. */
html {
  overflow-x: clip;
}
```
Catatan jujur: di chromium-headless-shell ini **tidak** menurunkan `scrollWidth` (tetap 792) dan `scrollTo(500,0)` tetap `scrollX=400`; di browser nyata `overflow-x: clip` pada root menghentikan pan. Ini jaring pengaman, bukan perbaikan utama.

**4. `DESIGN_SYSTEM.md`**
- Sub-bagian baru di §8: **"Tabel lebar: wajib punya fallback kartu di bawah `lg`"**.

Tidak diubah: `SharePrestasiButton.tsx`, `SharePrestasiCard.tsx`, `lib/share-card-fit.ts`, `lib/prestasi-*`, `firestore.rules`, `next.config.ts`.

## Functions
Baru:
- `ScopeBadge({ scope }: { scope: PrestasiScope })` — `components/sections/Achievements.tsx`. Render badge tingkat; satu sumber untuk tabel dan kartu.

Diubah:
- `Achievements()` — `components/sections/Achievements.tsx`: tambah daftar kartu `<ul>`; wrapper tabel dapat `relative hidden ... lg:block`; `<th>` terakhir pakai `aria-label`; sel badge pakai `ScopeBadge`; hapus variabel lokal `isInternational`/`isNational`.

Dihapus: tidak ada.

## Classes
Tidak ada class baru. `Achievements` tetap async server component; `ScopeBadge` server component tanpa hook. `SharePrestasiButton` (client) dipakai apa adanya di kartu.

## Dependencies
Tidak ada package baru. Harness verifikasi memakai yang sudah ada: `~/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell` + Python 3 stdlib (pola sama seperti `/tmp/h_verify.py`).

## Testing
Harness sekali pakai di `/tmp` (tidak di-commit). `npm run build` dulu supaya `.next/server/app/*.html` regen, lalu inline CSS + suntik probe, jalankan headless di `--window-size` 320x640, 360x740, 375x812, 390x844, 412x915, 640x900, 768x1024, 1024x900, 1280x900, 1440x900.

Gate:
1. Semua halaman & lebar: `documentElement.scrollWidth === clientWidth` (toleransi 1px) dan `scrollX === 0`.
2. `/prestasi` <1024px: wrapper tabel `display:none`, jumlah kartu === `items.length`, tiap kartu `scrollWidth === clientWidth`, tidak ada elemen `right > clientWidth + 1`.
3. `/prestasi` >=1024px: kartu `display:none`, tabel tampil, `wrap.scrollWidth === wrap.clientWidth`.
4. Header: `row.scrollWidth === row.clientWidth`, burger `width === 40`, `burger.right <= clientWidth`.
5. Harness share-card lama `/tmp/h_verify.py` → tetap `allOk = True` (12/12).
6. `npx tsc --noEmit`, `npx eslint .`, `npm run build` → 0 error.

Nilai ekspektasi (diukur pada HTML hasil build dengan fix disimulasikan):

| viewport | docScrollWidth sebelum | sesudah | tampilan |
|---|---|---|---|
| 305 | 792 | 305 | kartu, tanpa geser |
| 345 | 792 | 345 | kartu, tanpa geser |
| 375 | 792 | 375 | kartu, tanpa geser |
| 753 | 792 | 753 | kartu, tanpa geser |
| 1009 | 1009 | 1009 | tabel 961/961, tanpa geser |
| 1425 | 1425 | 1425 | tabel 1104/1104 |

Tinggi total daftar kartu (9 item, terukur): 2744px @305, 2598px @345, 2532px @375, 2450px @753. Semua kartu `overflow = 0`.

## Implementation Order
1. Tulis plan ini ke `implementation_plan.md`.
2. `Achievements.tsx` — import tipe + komponen `ScopeBadge`.
3. `Achievements.tsx` — sisipkan `<ul>` kartu `<lg`.
4. `Achievements.tsx` — wrapper tabel jadi `relative mt-16 hidden overflow-x-auto lg:block`.
5. `Achievements.tsx` — `th` pakai `aria-label`, buang `span.sr-only`.
6. `Achievements.tsx` — sel badge pakai `ScopeBadge`, hapus variabel lokal.
7. `SiteHeader.tsx` — baris 80 (gap/padding responsif).
8. `SiteHeader.tsx` — baris 97 (wordmark responsif).
9. `SiteHeader.tsx` — baris 212 (burger `shrink-0`).
10. `globals.css` — `html { overflow-x: clip; }` + komentar.
11. `npm run build`.
12. Jalankan harness overflow (gate 1–4) di 10 lebar.
13. Jalankan ulang `/tmp/h_verify.py` (gate 5).
14. `npx tsc --noEmit`, `npx eslint .`, `npm run build` (gate 6).
15. `DESIGN_SYSTEM.md` — sub-bagian aturan tabel lebar + cara verifikasi.

## Catatan
- Akar Bug 1: `.sr-only` memakai `position: absolute`; semua ancestor static sehingga containing block-nya `html`, bukan `div.overflow-x-auto`.
- Tabel `min-w-[820px]` bukan penyebab overflow; penyebabnya elemen pelarian di atas.
- `caption.sr-only` juga `absolute` dan juga lolos dari wrapper, tapi posisinya di kiri (x=23) sehingga tidak melebarkan dokumen; setelah wrapper `relative` ia otomatis ter-clip.
- Breakpoint `lg` dipilih karena di 768px tabel masih butuh 820px, sedangkan di 1024px tabel hanya 961px dan sudah muat.
- Kalau nanti item prestasi bertambah banyak, kartu bisa dilipat per-baris; itu perubahan terpisah, di luar scope ini.

## Hasil Verifikasi (setelah implementasi)
Harness `/tmp/overflow_check.py` — 22 halaman prerender × 10 lebar (320/360/375/390/412/640/768/1024/1280/1440) = **220 kombinasi: ALL PASS**.

Gate yang lolos di semua kombinasi:
- `documentElement.scrollWidth === clientWidth` (toleransi 1px) → tidak ada lagi area kosong di kanan.
- `window.scrollTo(600,0)` → `scrollX === 0` → halaman tidak bisa digeser horizontal.
- `header > div`: `scrollWidth === clientWidth`, burger tetap **40px** dan `right <= clientWidth`.

Detail `/prestasi` (terukur):

| viewport | docScrollWidth | tabel | kartu | tinggi daftar | luber kartu | header sw/cw | burger |
|---|---|---|---|---|---|---|---|
| 305 | 305 | `none`, `relative` | `block`, 9 | 2616px | 0 | 305/305 | 40px @289 |
| 345 | 345 | `none` | `block`, 9 | 2470px | 0 | 345/345 | 40px @329 |
| 360 | 360 | `none` | `block`, 9 | 2448px | 0 | 360/360 | 40px @344 |
| 375 | 375 | `none` | `block`, 9 | 2404px | 0 | 375/375 | 40px @359 |
| 397 | 397 | `none` | `block`, 9 | 2382px | 0 | 397/397 | 40px @381 |
| 753 | 753 | `none` | `block`, 9 | 2322px | 0 | 753/753 | 40px @729 |
| 1009 | 1009 | `block` 961/961 | `none` | — | — | 1009/1009 | tersembunyi |
| 1265 | 1265 | `block` 1104/1104 | `none` | — | — | 1152/1152 | tersembunyi |
| 1425 | 1425 | `block` 1104/1104 | `none` | — | — | 1152/1152 | tersembunyi |

Sebelum fix: `docScrollWidth` = **792px** di semua viewport HP. Sesudah: **sama persis dengan viewport**, jadi tidak ada area kosong dan tidak ada geser.

- Struktur HTML hasil build: `div.relative.mt-16.hidden.overflow-x-auto.lg:block` = 1, `ul.mt-12.space-y-4.lg:hidden` = 1 dengan 9 kartu, `<th aria-label="Bagikan">` = 1, `span.sr-only` di dalam tabel = **0**, `caption.sr-only` tetap 1 (aman, posisinya di kiri).
- `html { overflow-x: clip }` terkompilasi ke CSS (terverifikasi di `.next/static/chunks/*.css`).
- Harness share-card lama `/tmp/h_verify.py` → `allOk = True`, 12/12 kasus (tidak ada regresi).
- `npx tsc --noEmit` = 0 error, `npx eslint .` = 0 error/warning, `npm run build` sukses ("Compiled successfully").

## Catatan Tambahan Hasil Eksekusi
- Awalnya harness menandai `fasilitas`, `index`, `sejarah` sebagai gagal karena menghitung elemen yang memang keluar viewport **di dalam** container ber-`overflow` (kartu carousel non-aktif, SVG dekoratif). Gate diperbaiki: pelanggaran hanya dihitung bila **dokumen** ikut melebar. Ini bug di harness, bukan di kode.
- Deteksi breakpoint di harness harus pakai `matchMedia('(min-width: 1024px)')`, bukan `clientWidth >= 1024` — media query menghitung lebar window termasuk scrollbar. Ini juga bug harness.


## Temuan Saat Review Pasca-Implementasi
Tombol share memakai `opacity-0 group-hover:opacity-100 focus-visible:opacity-100` + `pointer-coarse:opacity-60`. Di tabel, ancestor `group` ada pada `<tr>`. Di kartu awalnya tidak ada, sehingga pada jendela sempit dengan pointer mouse (bukan sentuh) tombol Bagikan tidak pernah terlihat. Perbaikan: `<li>` kartu diberi class `group`, konsisten dengan `<tr>`.

Gate harness ditambah: jumlah kartu ber-`group` === jumlah kartu, dan tiap kartu punya tepat 1 `button[aria-label^="Bagikan prestasi"]`.

Hasil setelah perbaikan: `tsc` 0 error, `eslint` 0, `npm run build` sukses ("Compiled successfully in 15.0s"), harness 220/220 kombinasi ALL PASS termasuk gate `group` + tombol share per kartu, harness share-card lama tetap `allOk = True` 12/12.

- Angka `grep -c` ganda (18 = 9 DOM + 9 salinan payload RSC di `<script>self.__next_f>`); jumlah DOM yang benar diambil lewat harness.
