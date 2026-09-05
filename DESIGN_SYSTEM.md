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
import { SiteHeader } from "@/components/SiteHeader";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";

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
- Nasional: `rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy`
- Provinsi/Kabupaten: `rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/75`

**General badge:**
`rounded-full bg-navy/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy/60`

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
- **Components:** `components/SectionHeading.tsx`, `components/Reveal.tsx`, `components/PageHero.tsx`
- **Examples:** `components/VisiMisi.tsx`, `components/KalenderPendidikan.tsx`, `components/Achievements.tsx`
- **Fonts:** `app/layout.tsx` (Geist + Playfair Display)

---

**Update terakhir:** 2026-01-09  
**Maintainer:** Development Team
