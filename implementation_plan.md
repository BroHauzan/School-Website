# Implementation Plan — Perbaikan Background Kartu Share Prestasi

## Overview
Memperbaiki tiga cacat pada background kartu share prestasi (`/prestasi` → tombol Bagikan) yang membuat hasil PNG terasa flat: (1) grain/noise tidak pernah sampai ke file PNG, (2) radial glow terlalu uniform sehingga terbaca seperti gradient linear, (3) dead space kosong di pojok kanan atas. Semua perbaikan diverifikasi dengan men-decode PNG hasil unduhan, bukan sekadar melihat preview modal.

## Types
`components/prestasi/share-card-theme.ts`:
- `GLOW_ORIGIN = { x: 136, y: 136 }` — pusat logo (padding 88 + logo 96/2).
- `GLOW_RADIUS = 560` — radius glow px.
- `GLOW_CORE_STOP = 55` — persen radius tempat glow habis.
- `NOISE_TILE_SIZE = 200`, `NOISE_SEED = 20260914`.
- `CARD_COLORS.glowCore` diubah `#1a2744` → `#2e4474`; tambah `arcStroke`.
- `SHARE_BG_DEFAULTS`: `noise` jadi multiplier (default 1), tambah `arc: 0.22`.
- `ShareCardBackgroundProps`: `noise` berubah makna (alpha multiplier, bukan opacity), tambah `arc?`, `arcColor?`.

## Files
Ubah:
- `components/prestasi/ShareCardBackground.tsx` — hapus `noiseSvg()` (feTurbulence); tambah `mulberry32()`, `makeNoiseTile()`, `noiseTileUrl()` (memo), `wingArcSvg()`; layer 1 digabung (grain + glow dalam SATU `background-image`); layer arc baru; layer noise terpisah dihapus.
- `components/prestasi/SharePrestasiCard.tsx` — hapus `isolation: "isolate"` (tidak perlu lagi, blend mode sudah tidak dipakai).
- `components/prestasi/share-card-theme.ts` — konstanta baru seperti di Types.
- `DESIGN_SYSTEM.md` §8b — tabel layer + aturan capture diperbarui.
- `README.md` — deskripsi layer background kartu.

## Functions
Baru (semua di `ShareCardBackground.tsx`):
- `mulberry32(seed: number): () => number` — PRNG deterministik.
- `makeNoiseTile(size, seed, intensity): string` — canvas → PNG data URL, alpha ter-bake.
- `noiseTileUrl(intensity): string` — wrapper dengan cache `Map`.
- `wingArcSvg(stroke): string` — SVG data-URI lengkung stroke-only.

Diubah: `ShareCardBackground(props)` — layer 1 jadi satu elemen `backgroundImage` berlapis, tambah layer arc.
Dihapus: `noiseSvg()`.

## Classes
Tidak ada (semua komponen fungsi).

## Dependencies
Tidak ada package baru. Memakai Canvas 2D + `toDataURL` (API platform).

## Testing
1. `npx tsc --noEmit`, `npx eslint .`, `npm run build`.
2. CDP + chrome-headless-shell: klik Bagikan → klik Unduh PNG → simpan file.
3. Decode PNG (Node + zlib) dan ukur:
   - grain: `|Δ luminance|` antar piksel bertetangga di region gelap rata ≥ 3.0 (sebelumnya 0.5–0.7 = tidak ada grain).
   - glow: falloff ≥ 55% dari jarak 107px ke 898px dari pusat logo; simetri radial beda arah ≤ 15%.
   - arc: tint emas di band kanan-atas > kiri-atas (Δ > 1.0).
   - watermark & vignette tetap utuh (regression guard).
   - dimensi tetap 1080×1350.
4. Crop region gelap diperbesar ×7 → cek visual butiran halus.
5. Cek visual kartu penuh.

## Implementation Order
1. `share-card-theme.ts` — konstanta baru + `glowCore` + `arc`.
2. `ShareCardBackground.tsx` — helper baru (`mulberry32`, `makeNoiseTile`, `noiseTileUrl`, `wingArcSvg`).
3. `ShareCardBackground.tsx` — layer 1 digabung, layer arc, hapus layer noise lama.
4. `SharePrestasiCard.tsx` — hapus `isolation`.
5. `tsc` + `eslint`.
6. Kalibrasi intensitas (`GRAIN_ALPHA_LIGHT/DARK`, `GLOW_RADIUS`, `glowCore`, `arc`) sampai semua gate numerik lolos.
7. Verifikasi visual (crop grain + kartu penuh).
8. `npm run build`.
9. Update `DESIGN_SYSTEM.md`, `README.md`.

## Catatan
- Root cause grain hilang: `mix-blend-mode` tidak ada sama sekali di `node_modules/html-to-image/lib/` (tidak di-copy), dan `overlay` di atas backdrop gelap secara matematis no-op (`2 × 0.04 × 0.5 = 0.04`).
- Solusi: grain di-bake ke kanal alpha tile PNG (putih/hitam ber-alpha rendah) lalu di-composite biasa — pasti ikut ke PNG.
- Konsekuensi: `opacity` per-layer tidak tersedia untuk grain karena menyatu dengan gradient di satu elemen; kekuatan diatur lewat prop `noise` (regenerasi tile, di-cache).
- `isolation: isolate` dihapus karena satu-satunya alasannya adalah membatasi blend mode yang kini sudah tidak dipakai.
