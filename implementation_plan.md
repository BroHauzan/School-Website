# Implementation Plan — Judul Kartu Share Tidak Boleh Terpotong Diam-diam

## Overview
Membuat ukuran dan pemotongan judul kartu share prestasi (`/prestasi` → tombol Bagikan) ditentukan dari **pengukuran DOM nyata setelah font siap**, bukan dari perkiraan `canvas.measureText` sebelum font termuat. Ini menutup kasus "di HP aman, di laptop kepotong" yang muncul karena `html-to-image` menyalin tinggi hasil layout ke clone, sehingga baris terakhir hilang tanpa ellipsis.

## Types
`components/prestasi/SharePrestasiCard.tsx`:
- `SharePrestasiCardProps.titleSizeCap?: number` — cap inklusif ukuran font judul (px), hasil pengukuran DOM.
- `SharePrestasiCardProps.titleBreakWord?: boolean` — paksa `overflow-wrap: anywhere` bila DOM menemukan kata lebih lebar dari kolom.

`lib/share-card-fit.ts` (baru):
- `SHARE_TITLE_ATTR` / `SHARE_BODY_ATTR` + selektor siap pakai.
- `TITLE_SIZE_LADDER: readonly number[]` (84…34), `MIN_TITLE_SIZE`.
- `FitTitleHandlers = { onShrink(size): void; onBreakWord(): void }`.

## Files
Baru:
- `lib/share-card-fit.ts` — seluruh pengukuran DOM + turun-ladder. Terpisah dari komponen supaya bisa diuji tanpa React.

Ubah:
- `components/prestasi/SharePrestasiCard.tsx` — terima `titleSizeCap` / `titleBreakWord`; `fitTitle` menerima `cap`; tambah atribut `data-share-body` / `data-share-title`; `lineHeight` judul jadi px; komentar diperbarui.
- `components/prestasi/SharePrestasiButton.tsx` — state `titleSizeCap` / `titleBreakWord`; jalankan `fitTitleToDom` setelah `ensureFonts` dan sebelum `toBlob`; reset saat modal ditutup; teruskan prop ke kartu.
- `DESIGN_SYSTEM.md` §8b — bagian "Judul: ukur DOM dulu, baru capture" + aturan yang wajib dipertahankan.

Tidak diubah: `share-card-theme.ts`, `ShareCardBackground.tsx`, skema data, API, `lib/prestasi-server.ts`.

## Functions
Baru di `lib/share-card-fit.ts`:
- `fixedMargin(el, prop): number` — margin px yang benar-benar memakan ruang; `auto`/persen → 0.
- `outerHeight(el): number` — tinggi + margin; `display:none` → 0.
- `currentTitleSize(el): number` — font-size judul terpakai.
- `measureNaturalTitleHeight(el): number` — tinggi judul tanpa clamp & overflow (dipulihkan setelahnya).
- `measureTitleBudget(bodyEl, titleEl): number` — ruang untuk judul, dihitung dari sibling saja (anti-sirkular).
- `titleMarginTop(el): number`.
- `titleOverflows(titleEl, budget): boolean`.
- `titleOverflowsX(titleEl): boolean` — deteksi overflow horizontal (kata lebih lebar dari kolom).
- `visibleTitleLines(el)` / `naturalTitleLines(el): number`.
- `nextTitleStep(size): number | null`.
- `waitForLayout(): Promise<void>` — rAF ×2 di-race timeout 64 ms (rAF mati di tab background).
- `fitTitleToDom(bodyEl, titleEl, handlers, maxPasses = 6): Promise<number | null>`.

Diubah:
- `SharePrestasiCard.fitTitle(raw, availH, cap?)` — `cap` membatasi `TITLE_LADDER`; bila `cap` di bawah semua isi tangga, nilainya dipakai langsung.

## Classes
Tidak ada — semua fungsi. Pengukuran hidup di `SharePrestasiButton` (sudah client component) sehingga `SharePrestasiCard` tetap presentational tanpa hook, sesuai komentarnya.

## Dependencies
Tidak ada package baru. Memakai DOM API (`getBoundingClientRect`, `getComputedStyle`, `requestAnimationFrame`) + `html-to-image` yang sudah ada.

## Testing
Harness headless (`chromium-headless-shell` + font woff2 asli dari `.next/dev/static/media`) yang memuat **kode sumber asli** yang di-strip tipenya, lalu mengukur DOM nyata:
1. Simulasi font telat termuat: paksa `font-size: 84px` seperti hasil `titleSize()` sebelum Playfair siap → `fitTitleToDom` harus menurunkannya sampai `overflows = false`.
2. Matriks 12 kasus (4 varian jumlah peraih × 3 judul, termasuk 160 karakter dan satu kata raksasa).
3. Gate tiap kasus: `overflows = false`, `colOverflow = false`, `naturalLines <= visibleLines` (tidak di-clamp), `titleOverflowsX = false`, `clonedHeight >= naturalHeight`.
4. Judul uji utama: `"GOLD, SILVER, BRONZE MEDAL, FAVORITE POSTER - NEIRA 3"` — teks harus utuh (atau berakhir `...`), tidak boleh hilang sebagian.
5. `npx tsc --noEmit`, `npx eslint`, `npm run build`.

## Implementation Order
1. `lib/share-card-fit.ts` — konstanta + helper pengukuran.
2. `fitTitleToDom` + `titleOverflowsX` + `waitForLayout` (dengan race timeout).
3. `SharePrestasiCard.tsx` — prop `titleSizeCap` / `titleBreakWord`, cap di `fitTitle`, atribut penanda, `lineHeight` px.
4. `SharePrestasiButton.tsx` — loop ukur → refit → capture, reset state saat tutup.
5. Harness verifikasi (gate 1–4 di atas).
6. `tsc` + `eslint` + `build`.
7. Update `DESIGN_SYSTEM.md`.

## Hasil Verifikasi
- Harness: 12/12 kasus lolos (`allOk = true`). Judul target dengan 6 peraih → `size 78`, 3 baris, teks utuh, `clamped = false`.
- Simulasi font telat: `84px` → terdeteksi `overflows = true` (butuh 420px, budget 351px) → turun ke `78px` → `overflows = false`, `clonedHeight == naturalHeight == 262`.
- `tsc` 0 error, `eslint` 0 error/warning, `next build` sukses.

## Catatan
- Akar masalah: `cloneCSSStyle` (`node_modules/html-to-image/es/clone-node.js`) menyalin computed style termasuk tinggi hasil layout; `overflow: hidden` + tinggi terkunci memotong baris ekstra tanpa `ellipsis`. Beda perangkat muncul karena metrik font fallback (`Playfair Display Fallback` = `local(Times New Roman)`, `size-adjust: 111.26%`) berbeda dari Playfair asli.
- `measureTitleBudget` wajib hanya menjumlahkan sibling — memakai `clientHeight − tinggi judul` membuat perhitungan sirkular.
- Margin `auto` dilaporkan `getComputedStyle` sebagai px hasil distribusi flex; `fixedMargin()` menghitungnya 0.
- `waitForLayout()` butuh race timeout karena rAF tidak berjalan di tab background.
