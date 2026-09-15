# DESIGN SYSTEM — SMAN 1 Lumajang

Visual hierarchy & component patterns untuk konsistensi UI. **Wajib dibaca** sebelum bikin page/component baru.

---

## 1. Design Tokens

Dari `app/globals.css`:

| Token | Hex | Pakai untuk |
|---|---|---|
| `navy` | `#09122b` | Section gelap, text utama, button primary |
| `navy-light` | `#12274d` | Card di atas navy bg |
| `navy-muted` | `#1e3a66` | Accent italic, decorative text |
| `cream` | `#f9f9f8` | Section terang, text di navy bg |
| `paper` | `#ffffff` | Card di atas cream bg |
| `ink` | `#09122b` | Body text (alias navy) |
| `muted` | `#5f6b7f` | Body text sekunder |
| `line` | `rgba(9,18,43,0.1)` | Border tipis |

---

## 2. Typography

**Fonts:**
- `font-display` → **Playfair Display** (heading, italic accent, decorative number)
- `font-sans` → **Geist Sans** (body, UI text)

**Hierarchy:**

| Level | Class | Contoh |
|---|---|---|
| **Page title** (PageHero) | `font-display text-4xl sm:text-5xl lg:text-6xl` | Visi & _Misi_ |
| **Section title** | `font-display text-4xl sm:text-5xl` + 1 kata `<i>` accent | Arah yang _jelas_ |
| **Eyebrow** | `text-xs uppercase tracking-[0.28em]` | VISI & MISI |
| **Card title** | `font-display text-xl–2xl` | — |
| **Body** | `text-sm/base leading-relaxed` | Paragraf utama |
| **Body muted** | `text-muted` atau `text-cream/65-75` | Keterangan sekunder |
| **Decorative number** | `font-display text-3xl/4xl italic text-navy/10` | 01, 02, ... |

**Italic accent:** 1 kata di setiap title dibungkus `<i className="text-navy-muted">` (light bg) atau `<i className="text-cream/60">` (dark bg).

---

## 3. Layout Rules

**Section spacing:**
- `py-28 lg:py-40` (default section padding)
- Container: `mx-auto max-w-6xl px-6`

**Background alternation:**
Hindari 2 section sama berturut. Pattern umum:
```
PageHero (navy) → Section 1 (cream) → Section 2 (paper/navy) → Footer (navy)
```

**Grid:**
- Gap: `gap-5` (tight) hingga `gap-8` (breathing)
- Breakpoints: `sm:grid-cols-2 lg:grid-cols-3/4`
- Margin top: `mt-16` (setelah SectionHeading)

---

## 4. Card Pattern

**Light background (cream/paper):**
```tsx
className="rounded-lg border border-navy/10 bg-paper p-7-8 
           transition-all hover:-translate-y-0.5 
           hover:border-navy/30 
           hover:shadow-[0_12px_32px_-16px_rgba(9,18,43,0.2)]"
```

**Dark background (navy):**
```tsx
className="rounded-lg border border-cream/15 bg-navy-light p-7-9
           transition-all hover:-translate-y-0.5 hover:border-cream/30"
```

**Radius:**
- Card: `rounded-lg`
- Badge/Button: `rounded-full`

---

## 5. Animation

**Reveal stagger:**
Semua block konten dibungkus `<Reveal delay={i * 0.06}>` atau `0.08–0.1`.

**Prefers-reduced-motion:**
Sudah built-in di `Reveal.tsx` + `globals.css`. Jangan override.

**Hover transitions:**
`transition-all duration-300` atau `duration-400` (card).

---

## 6. Button Styles

| Variant | Class |
|---|---|
| **Primary (light bg)** | `rounded-full bg-navy px-6 py-2.5 text-sm text-cream hover:bg-navy-light` |
| **Primary (dark bg)** | `rounded-full bg-cream px-6 py-2.5 text-sm text-navy hover:bg-white` |
| **Outline (dark bg)** | `rounded-full border border-cream/40 px-6 py-2.5 text-sm text-cream hover:bg-cream hover:text-navy` |

---

## 7. Page Anatomy (wajib untuk page baru)

```tsx
import { SiteHeader } from "@/components/ui/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Footer } from "@/components/ui/Footer";

export default function NamaPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/path", label: "Label" },
        ]}
        title={<>Judul <i className="text-cream/70">Accent</i></>}
        description="..."
      />
      <main>
        <NamaComponent />
      </main>
      <Footer />
    </>
  );
}
```

**Konten di component terpisah** (`components/NamaComponent.tsx`), bukan inline di page.tsx.

Minimal structure component:
- `<SectionHeading>` + content grid + optional CTA/info card

---

## 8. Badge Styles

**Scope badge (Prestasi):**
- Internasional: `rounded-full bg-[#f5c542] px-3 py-1 text-xs font-medium text-navy`
- Nasional: `rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy`
- Provinsi/Kabupaten: `rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/75`

**General badge:**
`rounded-full bg-navy/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy/60`

---

## 8b. Share Card (Prestasi)

Kartu gambar 1080×1350 (4:5) untuk dibagikan ke sosial media — `components/prestasi/`.

- **Ukuran & warna:** `share-card-theme.ts` — `CARD_W`, `CARD_H`, `TIER_STYLE` (badge per tingkat), `CARD_COLORS`.
- **Aturan wajib:** kartu memakai **style inline literal hex/rgba**, TIDAK boleh utility opacity Tailwind (`text-cream/70`). Tailwind v4 mengompilasinya jadi `color-mix(in oklab, ...)`; html-to-image menyalin computed style ke SVG `<foreignObject>` yang gagal dirender Safari.
- **Font:** di-load lewat computed style (`next/font` memakai nama internal `__Playfair_Display_xxx`, bukan `"Playfair Display"`), setelah `document.fonts.ready`.
- **Batas aman:** judul di-clamp 5 baris, **diukur dari DOM nyata sebelum capture** (lihat bagian di bawah); peraih maks 6 baris / 2 kolom + “+N peraih lainnya”.
- **Badge warna:** Internasional `#f5c542` (emas), Nasional cream, Provinsi/Kabupaten outline.
- **Tombol Bagikan (tabel publik):** icon-only ghost, kotak `size-10` (target tap 40px), `opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-60` + `transition-opacity duration-150`. `<tr>` wajib punya class `group`. Kolomnya lebar tetap `w-14` di `<th>` dan `<td>` supaya semua tombol sejajar vertikal.

### Layer background kartu (`ShareCardBackground`)

Urutan belakang → depan:

| # | Layer | Teknik |
|---|---|---|
| 1 | Base + grain + radial glow (SATU elemen) | `backgroundImage: url(grainTile), radial-gradient(circle 560px at 136px 136px, #2e4474, #0a1428 55%)` + `backgroundRepeat: repeat, no-repeat` |
| 2 | Lengkung dekoratif kanan atas | SVG data-URI, stroke-only, `stroke-width: 2.5`, `opacity: 0.22` |
| 3 | Watermark mata owl (kanan bawah, overflow) | SVG data-URI, 5 lingkaran konsentris + garis silang, stroke-only, `opacity: 0.05` |
| 4 | Vignette tepi | `radial-gradient(78% 62% at 50% 46%, transparent 55%, rgba(2,5,14,0.62))` |

Intensitas tiap layer bisa di-override lewat props `glow` / `watermark` / `noise` / `vignette` / `arc`; default di `SHARE_BG_DEFAULTS` (`share-card-theme.ts`). Origin & radius glow di `GLOW_ORIGIN` / `GLOW_RADIUS` (pusat logo = padding 88 + 96/2 = 136px).

**Aturan capture (jangan dilanggar):**

- **DILARANG `mix-blend-mode`.** Tidak ikut ter-capture `html-to-image` (tidak ada di lib-nya sama sekali) — grain sebelumnya hilang total karena ini. Selain itu `overlay` di atas backdrop gelap (`#0a1428` ≈ 0.04) secara matematis no-op: `2 × 0.04 × 0.5 = 0.04`, jadi hasilnya identik dengan backdrop.
- **DILARANG CSS `filter`** — tidak konsisten saat dirasterisasi ke canvas.
- Noise/watermark/arc HARUS SVG atau PNG **data-URI** di `background-image`. `html-to-image` melewatkan URL `data:` (`isDataUrl` di `lib/dataurl.js`), jadi tidak ada fetch/decode yang bisa gagal.
- **Grain**: di-bake ke kanal alpha tile PNG (dibuat runtime via canvas + seeded PRNG `mulberry32`, di-cache per intensitas). Alpha puncak `0.055` (terang) / `0.13` (gelap) → `|Δ luminance| ≈ 5/255`. Karena menempel di elemen gradient yang sama, `opacity` per-layer TIDAK tersedia untuk grain — atur lewat prop `noise`.
- **`opacity` per-layer** hanya untuk elemen terpisah (watermark, arc, vignette).
- Konten wajib `zIndex: 1` agar berada di atas semua layer background.

**Cara verifikasi (jangan cuma lihat preview modal):** unduh PNG-nya, lalu ukur di file hasilnya — `|Δ luminance|` antar piksel bertetangga di region gelap rata harus ≥ 3 (bukan ~0.5 yang berarti gradient polos).

### Judul: ukur DOM dulu, baru capture (`lib/share-card-fit.ts`)

`html-to-image` menyalin **computed style** node ke `foreignObject` lalu merender ulang di sana (`cloneCSSStyle` di `node_modules/html-to-image/es/clone-node.js`) — termasuk **tinggi hasil layout**. Kalau di render ulang itu teks wrap jadi satu baris lebih banyak (font display belum termuat saat React menghitung, metrik fallback beda, subset font beda per perangkat), tinggi yang sudah terkunci + `overflow: hidden` membuat baris terakhir **terpotong tanpa ellipsis**. Gejala khasnya: hasil PNG beda per perangkat — HP aman, laptop kepotong.

Karena itu `SharePrestasiButton` menjalankan urutan berikut **sebelum** `toBlob`:

1. `ensureFonts(node)` — font siap dulu.
2. `fitTitleToDom(bodyEl, titleEl, handlers)` — ukur DOM nyata:
   - `titleOverflowsX` → ada kata lebih lebar dari kolom? panggil `onBreakWord` (set `overflow-wrap: anywhere`), lalu ulangi;
   - `measureTitleBudget` vs `measureNaturalTitleHeight` + `titleMarginTop` → judul terlalu tinggi? turunkan satu langkah `TITLE_SIZE_LADDER` via `onShrink`, tunggu `waitForLayout()`, ulangi.
   - maksimum 6 pass, jadi tidak pernah menggantung.
3. Hasilnya disimpan sebagai `titleSizeCap` / `titleBreakWord` (state `SharePrestasiButton`) dan diteruskan sebagai prop ke `SharePrestasiCard`, yang membatasinya di `fitTitle`.
4. Capture baru dijalankan setelah state itu ter-commit.

Aturan yang wajib dipertahankan:

- `measureTitleBudget` **hanya** menjumlahkan sibling, bukan `clientHeight − tinggi judul` — kalau tidak, perhitungannya sirkular dan font bisa turun tanpa henti.
- Margin `auto` (dipakai kaki kartu) dilaporkan `getComputedStyle` sebagai px hasil distribusi flex. `fixedMargin()` membandingkan nilai *specified* vs *computed* dan menghitungnya `0` — kalau ikut dijumlahkan, ruang yang justru bebas dianggap terpakai dan judul dikecilkan sia-sia.
- `lineHeight` judul ditulis dalam **px** (`size × 1.12`), supaya tinggi hasil clone bisa direproduksi persis.
- `h2` wajib `flexShrink: 0`; kalau tidak, kolom flex akan memencetnya jadi terpotong diam-diam.
- `waitForLayout()` di-race dengan timeout 64 ms karena `requestAnimationFrame` **tidak berjalan di tab background** — tanpa itu tombol Bagikan bisa menggantung saat user pindah tab.

---

## 9. Checklist Page Baru

- [ ] PageHero dengan breadcrumbs + title italic accent
- [ ] Section bg alternating (jangan 2 sama berturut)
- [ ] SectionHeading dengan eyebrow + title + description
- [ ] Semua content block dibungkus `<Reveal>`
- [ ] Card hover effect (translate-y + shadow/border)
- [ ] Button rounded-full + proper contrast
- [ ] Spacing: py-28 lg:py-40, mt-16 after heading
- [ ] Metadata title + description
- [ ] Build & visual check

---

## 10. File References

- **Tokens:** `app/globals.css` (line 3–14)
- **Components:** `components/ui/SiteHeader.tsx`, `components/ui/PageHero.tsx`,
  `components/ui/Footer.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/Reveal.tsx`
- **Examples:** `components/sections/VisiMisi.tsx`, `components/sections/KalenderPendidikan.tsx`,
  `components/sections/Achievements.tsx`
- **Fonts:** `app/layout.tsx` (Geist + Playfair Display)

---

**Update terakhir:** 2026-01-09  
**Maintainer:** Development Team
