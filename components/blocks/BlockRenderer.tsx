/**
 * BlockRenderer — server-safe, TANPA "use client".
 *
 * Merender `Blok[]` sesuai matriks §5 `docs/PLAN-Admin-Page-Builder.md`.
 * Semua nilai field dijaga defensif supaya dokumen rusak tidak pernah
 * membuat halaman publik gagal render (fallback: blok dilewati).
 */
import type { Blok } from "@/lib/halaman-schema";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/** Satu field string yang sudah dipangkas; "" bila kosong/bukan string. */
function teks(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Hanya terima src gambar yang aman dimuat: path lokal atau https. */
function srcGambar(v: unknown): string {
  const s = teks(v);
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return /^https:\/\//i.test(s) ? s : "";
}

function daftarItem(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => teks(x)).filter(Boolean) : [];
}

/**
 * Hanya youtube / youtube-nocookie / vimeo. Selain itu TIDAK dirender
 * (mencegah admin menyematkan halaman pihak ketiga yang tak terduga).
 */
function srcVideoEmbed(v: unknown): string {
  const s = teks(v);
  if (!s) return "";
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return "";
  }
  if (url.protocol !== "https:") return "";
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") return s;
  if (host === "youtu.be") return s;
  if (host === "vimeo.com" || host === "player.vimeo.com") return s;
  return "";
}

/** Judul kecil di bawah gambar/video. */
function Caption({ text }: { text: string }) {
  return <p className="mt-2 text-xs text-muted">{text}</p>;
}

function Paragraf({ teks: t }: { teks: string }) {
  if (!t) return null;
  return <p className="text-base leading-relaxed text-muted">{t}</p>;
}

function Heading({ blok }: { blok: Blok }) {
  const t = teks(blok.teks);
  if (!t) return null;
  const cls = "font-display tracking-tight text-ink";
  const level = blok.level === 3 || blok.level === 4 ? blok.level : 2;
  if (level === 3) return <h3 className={cn(cls, "text-2xl sm:text-3xl")}>{t}</h3>;
  if (level === 4) return <h4 className={cn(cls, "text-xl sm:text-2xl")}>{t}</h4>;
  return <h2 className={cn(cls, "text-3xl sm:text-4xl")}>{t}</h2>;
}

const RASIO_GAMBAR: Record<string, string> = {
  normal: "aspect-[4/3]",
  wide: "aspect-video",
  full: "aspect-[21/9]",
};

function Gambar({ blok }: { blok: Blok }) {
  const src = srcGambar(blok.src);
  if (!src) return null;
  const caption = teks(blok.caption);
  const rasio = RASIO_GAMBAR[teks(blok.varian)] ?? RASIO_GAMBAR.normal;
  const wide = teks(blok.varian) !== "normal";
  return (
    <figure className={cn(wide && "sm:mx-auto")}>
      <div className="overflow-hidden rounded-lg border border-navy/10 bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={teks(blok.alt)} loading="lazy" className={cn("w-full object-cover", rasio)} />
      </div>
      {caption ? <Caption text={caption} /> : null}
    </figure>
  );
}

function Galeri({ blok }: { blok: Blok }) {
  const items = daftarItem(blok.items);
  if (items.length === 0) return null;
  const varian = teks(blok.varian) || "grid3";

  if (varian === "carousel") {
    return (
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {items.map((src, i) => (
          <li key={`${src}-${i}`} className="w-[78%] shrink-0 snap-start sm:w-[52%] lg:w-[38%]">
            <div className="overflow-hidden rounded-lg border border-navy/10 bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto galeri ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const kolom = varian === "grid2" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={cn("grid grid-cols-1 gap-4", kolom)}>
      {items.map((src, i) => (
        <li key={`${src}-${i}`} className="overflow-hidden rounded-lg border border-navy/10 bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Foto galeri ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </li>
      ))}
    </ul>
  );
}

const TOMBOL_VARIAN: Record<string, string> = {
  primary: "bg-navy text-cream hover:bg-navy-light",
  outline: "border border-navy/30 text-navy hover:border-navy/60",
  soft: "bg-navy/5 text-navy hover:bg-navy/10",
};

/** Hanya terima tautan internal atau https — sama seperti validasi server. */
function hrefAman(v: unknown): string {
  const s = teks(v);
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return /^https:\/\//i.test(s) ? s : "";
}

function Tombol({ blok }: { blok: Blok }) {
  const label = teks(blok.teks);
  const href = hrefAman(blok.href);
  if (!label || !href) return null;
  const varian = teks(blok.varian) || "primary";
  const cls = cn(
    "inline-flex rounded-full px-6 py-2.5 text-sm transition-colors",
    TOMBOL_VARIAN[varian] ?? TOMBOL_VARIAN.primary,
  );
  const luar = /^https:\/\//i.test(href);
  return (
    <p>
      <a
        href={href}
        className={cls}
        {...(luar ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    </p>
  );
}

function Video({ blok }: { blok: Blok }) {
  const src = srcVideoEmbed(blok.src);
  if (!src) return null;
  const caption = teks(blok.caption);
  return (
    <figure>
      <div className="overflow-hidden rounded-lg border border-navy/10 bg-navy">
        <iframe
          src={src}
          title={caption || "Video yang disematkan"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full"
        />
      </div>
      {caption ? <Caption text={caption} /> : null}
    </figure>
  );
}

const SPACER_TINGGI: Record<string, string> = {
  kecil: "h-8",
  sedang: "h-16",
  besar: "h-28",
};

function Spacer({ blok }: { blok: Blok }) {
  const tinggi = SPACER_TINGGI[teks(blok.tinggi)] ?? SPACER_TINGGI.sedang;
  return <div aria-hidden className={tinggi} />;
}

function Kutipan({ teks: t }: { teks: string }) {
  if (!t) return null;
  return (
    <blockquote className="border-l-2 border-navy/20 pl-6 font-display text-xl italic text-navy-muted">
      {t}
    </blockquote>
  );
}

function Daftar({ blok }: { blok: Blok }) {
  const items = daftarItem(blok.items);
  if (items.length === 0) return null;
  return (
    <ul className="list-disc space-y-2 pl-6 text-muted">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Render isi satu blok. Blok tak dikenal / kosong → null (dilewati). */
function BlokIsi({ blok }: { blok: Blok }) {
  switch (blok.tipe) {
    case "paragraf":
      return <Paragraf teks={teks(blok.teks)} />;
    case "heading":
      return <Heading blok={blok} />;
    case "gambar":
      return <Gambar blok={blok} />;
    case "galeri":
      return <Galeri blok={blok} />;
    case "tombol":
      return <Tombol blok={blok} />;
    case "video":
      return <Video blok={blok} />;
    case "divider":
      return <hr className="border-navy/10" />;
    case "spacer":
      return <Spacer blok={blok} />;
    case "kutipan":
      return <Kutipan teks={teks(blok.teks)} />;
    case "daftar":
      return <Daftar blok={blok} />;
    default:
      return null;
  }
}

function kunciBlok(blok: Blok, i: number): string {
  return typeof blok.id === "string" && blok.id ? blok.id : `blok-${i}`;
}

/**
 * Blok yang tidak punya isi valid tidak dirender sama sekali — supaya
 * dokumen rusak/kosong tidak meninggalkan celah `space-y-8` di halaman.
 */
function blokTerisi(b: Blok): boolean {
  switch (b.tipe) {
    case "paragraf":
    case "heading":
    case "kutipan":
      return teks(b.teks).length > 0;
    case "tombol":
      return teks(b.teks).length > 0 && hrefAman(b.href).length > 0;
    case "gambar":
      return srcGambar(b.src).length > 0;
    case "galeri":
    case "daftar":
      return daftarItem(b.items).length > 0;
    case "video":
      return srcVideoEmbed(b.src).length > 0;
    case "divider":
    case "spacer":
      return true;
    default:
      return false;
  }
}

export function BlockRenderer({ blok, className }: { blok: Blok[]; className?: string }) {
  const daftar = (Array.isArray(blok) ? blok : []).filter(
    (b): b is Blok => Boolean(b) && typeof b.tipe === "string" && blokTerisi(b),
  );
  if (daftar.length === 0) return null;

  return (
    <div className={cn("space-y-8", className)}>
      {daftar.map((b, i) => {
        const isi = <BlokIsi blok={b} />;
        // divider & spacer tidak dibungkus Reveal — tidak ada yang perlu di-reveal.
        if (b.tipe === "divider" || b.tipe === "spacer") {
          return <div key={kunciBlok(b, i)}>{isi}</div>;
        }
        return (
          <Reveal key={kunciBlok(b, i)} delay={i * 0.05}>
            {isi}
          </Reveal>
        );
      })}
    </div>
  );
}
