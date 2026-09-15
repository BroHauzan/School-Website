import type { PrestasiPeraih, PrestasiScope } from "@/lib/prestasi-schema";
import { SITE_URL } from "@/lib/school";
import { CARD_COLORS, CARD_H, CARD_W, TIER_STYLE } from "./share-card-theme";
import { ShareCardBackground } from "./ShareCardBackground";
import { SHARE_BODY_ATTR, SHARE_TITLE_ATTR } from "@/lib/share-card-fit";

export type SharePrestasiCardProps = {
  title: string;
  scope: PrestasiScope;
  year: string;
  /** Label tanggal siap tampil, mis. "12 Agustus 2026". Kosong = pakai `year`. */
  dateLabel: string;
  peraih: PrestasiPeraih[];
  /**
   * Cap inklusif ukuran font judul (px). Diisi `SharePrestasiButton` setelah
   * mengukur DOM nyata, untuk kasus font display telat termuat sehingga hasil
   * wrap beda dari perhitungan. Kosong = pakai `titleSize()` apa adanya.
   */
  titleSizeCap?: number;
  /**
   * Paksa izinkan pemenggalan kata (`overflow-wrap: anywhere`). Diisi bila
   * pengukuran DOM menemukan kata yang lebih lebar dari kolom — tanpa ini kata
   * tersebut terpotong ke samping tanpa jejak.
   */
  titleBreakWord?: boolean;
};

/** Sisanya diringkas jadi "+N peraih lainnya" supaya kartu tidak kepanjangan. */
const MAX_PERAIH = 6;

/** Padding kartu (px) — satu sumber untuk layout dan lebar area judul. */
const CARD_PAD = 88;

/** Tinggi area konten kartu = tinggi kartu dikurangi padding atas-bawah. */
const CARD_CONTENT_H = CARD_H - CARD_PAD * 2;

/**
 * Batas keras tinggi judul dalam baris. Judul TIDAK dipotong selama masih ada
 * ukuran font yang membuatnya muat; lihat `fitTitle`.
 */
const MAX_TITLE_LINES = 5;

/** Metrik judul — harus sama dengan style `h2` di bawah. */
const TITLE_FONT_STACK = '"Playfair Display", Georgia, serif';
const TITLE_LINE_HEIGHT = 1.12;
const TITLE_LETTER_SPACING_EM = -0.02;
const TITLE_MARGIN_TOP = 44;

/** Lebar area judul: lebar kartu dikurangi padding kiri-kanan. */
const TITLE_BOX_W = CARD_W - CARD_PAD * 2;

/** Ukuran font terkecil. Di bawah ini judul dipotong per kata + ellipsis. */
const MIN_TITLE_SIZE = 34;

/** Tangga ukuran judul dari terbesar. `titleSize()` cuma memilih titik awal. */
const TITLE_LADDER = [84, 78, 72, 68, 64, 58, 54, 50, 46, 42, 38, MIN_TITLE_SIZE];

/** Penanda judul terpotong — wajib terlihat supaya tidak seperti error. */
const ELLIPSIS = "...";

/**
 * Tinggi blok NON-judul yang selalu ada, px (diukur dari render nyata):
 * kop 96 + divider 44+1 + badge 64+66 + meta 32+34 + kaki 114 (termasuk
 * padding atasnya). Angka ini yang dulu diabaikan, sehingga judul dikira masih
 * punya ruang 5 baris padahal sisa ruangnya cuma ~3 baris.
 */
const FIXED_BLOCK_H = 451;

/** Metrik blok peraih — harus sama dengan style daftar peraih di bawah. */
const PERAIH_MARGIN_TOP = 56;
const PERAIH_LABEL_H = 28;
const PERAIH_LIST_MARGIN_TOP = 30;
const PERAIH_COL_GAP = 40;
const PERAIH_ROW_GAP = 24;
const PERAIH_NAME_SIZE = 30;
const PERAIH_NAME_LH = PERAIH_NAME_SIZE * 1.25;
const PERAIH_KELAS_GAP = 6;
const PERAIH_KELAS_H = 27;
const PERAIH_MORE_H = 55;
/** Batas tinggi daftar peraih — sama dengan `maxHeight` di style `ul`. */
const PERAIH_LIST_MAX_H = 3 * 2 * 62;

/** Sisa aman supaya pembulatan sub-piksel tidak membuat judul baris terakhir terpotong. */
const TITLE_SAFETY_PX = 12;

/** Font teks kartu (non-judul) — sama dengan font kartu di bawah. */
const BODY_FONT_STACK = '"Geist", ui-sans-serif, system-ui, sans-serif';

/**
 * Estimasi lebar rata-rata glyph (em) — hanya dipakai bila canvas tidak
 * tersedia (SSR), supaya perhitungan tetap deterministik.
 * Sengaja konservatif (0.72, bukan 0.62): CJK/emoji selebar ~1em, jadi
 * under-estimate berarti judul dikira muat padahal overflow diam-diam.
 */
const FALLBACK_CHAR_EM = 0.72;

function titleSize(title: string): number {
  if (title.length > 150) return 50;
  if (title.length > 110) return 58;
  if (title.length > 75) return 68;
  return 84;
}

/**
 * Cache lebar teks per `size|kata` — pengukuran diulang tiap render dan tiap
 * kandidat ukuran, jadi hasilnya disimpan.
 */
const wordWidthCache = new Map<string, number>();
let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Canvas 2D sekali pakai untuk mengukur lebar teks. `null` = tidak tersedia. */
function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtx === undefined) {
    measureCtx =
      typeof document === "undefined"
        ? null
        : document.createElement("canvas").getContext("2d");
  }
  return measureCtx;
}

/**
 * Canvas 2D lama tidak menerapkan `letterSpacing` (properti tidak ada di
 * runtime walau ada di typing) — deteksi runtime supaya track negatif tetap
 * diperhitungkan manual di browser tersebut.
 */
function supportsLetterSpacing(ctx: CanvasRenderingContext2D): boolean {
  return (ctx as Partial<CanvasRenderingContext2D>).letterSpacing !== undefined;
}

/** Lebar satu potong teks, px. */
function measureText(
  text: string,
  size: number,
  weight: number,
  stack: string,
): number {
  const key = `${weight}|${size}|${stack}|${text}`;
  const cached = wordWidthCache.get(key);
  if (cached !== undefined) return cached;

  const ctx = getMeasureCtx();
  let width: number;
  if (ctx) {
    ctx.font = `${weight} ${size}px ${stack}`;
    // Track judul negatif (-0.02em) hanya berlaku untuk heading; teks lain 0.
    const track = stack === TITLE_FONT_STACK ? TITLE_LETTER_SPACING_EM * size : 0;
    if (track && supportsLetterSpacing(ctx)) {
      ctx.letterSpacing = `${track}px`;
      width = ctx.measureText(text).width;
    } else {
      width = ctx.measureText(text).width + track * text.length;
    }
    // Margin aman 4%: pengukuran canvas tidak selalu identik dengan layout
    // akhir (sub-piksel + kerning), lebih baik baris dihitung sedikit lebar.
    width *= 1.04;
  } else {
    // Tanpa canvas (SSR) hanya bisa diperkirakan — pakai lebar rata-rata glyph.
    width = text.length * size * FALLBACK_CHAR_EM;
  }

  wordWidthCache.set(key, width);
  return width;
}

/**
 * Pecah satu kata kelewat lebar jadi potongan yang muat di `maxW`
 * (hard-break per karakter). Render memakai `overflow-wrap: anywhere`,
 * jadi estimasi harus mencerminkan perilaku itu — bukan `return null`.
 */
function splitLongWord(
  word: string,
  size: number,
  maxW: number,
  weight: number,
  stack: string,
): string[] {
  const chars = Array.from(word);
  const parts: string[] = [];
  let cur = "";
  for (const ch of chars) {
    const cand = cur + ch;
    if (cur && measureText(cand, size, weight, stack) > maxW) {
      parts.push(cur);
      cur = ch;
    } else {
      cur = cand;
    }
  }
  if (cur) parts.push(cur);
  return parts.length > 0 ? parts : [word];
}

/**
 * Greedy word-wrap pada lebar `maxW`. TIDAK PERNAH return null: kata tunggal
 * yang lebih lebar dari area dipecah paksa (lihat `splitLongWord`), supaya
 * estimasi tinggi tidak under-estimate dan data tidak hilang diam-diam.
 */
function wrapWords(
  text: string,
  size: number,
  maxW: number,
  weight: number,
  stack: string,
): string[] {
  const words = text.split(" ").filter(Boolean);
  const spaceW = measureText(" ", size, weight, stack);
  const lines: string[] = [];
  let line = "";
  const pushLine = (l: string) => {
    if (l) lines.push(l);
  };
  for (const word of words) {
    const pieces =
      measureText(word, size, weight, stack) > maxW
        ? splitLongWord(word, size, maxW, weight, stack)
        : [word];
    for (const piece of pieces) {
      if (line) {
        const w = measureText(line, size, weight, stack);
        if (w + spaceW + measureText(piece, size, weight, stack) <= maxW) {
          line = `${line} ${piece}`;
          continue;
        }
        pushLine(line);
      }
      line = piece;
    }
  }
  pushLine(line);
  return lines;
}

/** Jumlah baris judul pada ukuran font tertentu. */
function wrapTitle(title: string, size: number, maxW: number): string[] {
  return wrapWords(title, size, maxW, 700, TITLE_FONT_STACK);
}

/**
 * Tinggi satu item peraih, px — nama bisa 1–2 baris di kolomnya.
 * Dipakai untuk menghitung sisa ruang judul, bukan mengira-ngira.
 */
function peraihItemH(nama: string, kelas: string, colW: number): number {
  const nameLines = Math.min(
    wrapWords(nama, PERAIH_NAME_SIZE, colW, 500, BODY_FONT_STACK).length,
    2,
  );
  return (
    Math.max(nameLines, 1) * PERAIH_NAME_LH +
    (kelas ? PERAIH_KELAS_GAP + PERAIH_KELAS_H : 0)
  );
}

/** Tinggi blok peraih, px — termasuk batas `maxHeight` daftar dan catatan sisa. */
function peraihBlockH(shown: PrestasiPeraih[], rest: number): number {
  if (shown.length === 0) return 0;
  const cols = shown.length > 1 ? 2 : 1;
  const colW = (TITLE_BOX_W - (cols - 1) * PERAIH_COL_GAP) / cols;
  const heights = shown.map((r) => peraihItemH(r.nama, r.kelas, colW));
  let rows = 0;
  for (let i = 0; i < heights.length; i += cols) {
    rows += Math.max(...heights.slice(i, i + cols));
  }
  const gaps = Math.max(0, Math.ceil(shown.length / cols) - 1) * PERAIH_ROW_GAP;
  const listH = Math.min(rows + gaps, PERAIH_LIST_MAX_H);
  const moreH = rest > 0 ? PERAIH_MORE_H : 0;
  return PERAIH_MARGIN_TOP + PERAIH_LABEL_H + PERAIH_LIST_MARGIN_TOP + listH + moreH;
}

/**
 * Sisa tinggi yang boleh dipakai judul (di luar margin atasnya), px.
 * Inilah angka yang dulu tidak pernah dihitung: judul dikira masih punya ruang
 * `MAX_TITLE_LINES` baris padahal blok lain sudah menghabiskannya.
 */
function titleAvailableH(shown: PrestasiPeraih[], rest: number): number {
  const avail =
    CARD_CONTENT_H - FIXED_BLOCK_H - peraihBlockH(shown, rest) - TITLE_MARGIN_TOP;
  return Math.max(avail, MIN_TITLE_SIZE * TITLE_LINE_HEIGHT);
}

/** Jumlah baris judul yang benar-benar muat pada ukuran font tertentu. */
function linesThatFit(size: number, availH: number): number {
  const byHeight = Math.floor(availH / (size * TITLE_LINE_HEIGHT));
  return Math.max(1, Math.min(MAX_TITLE_LINES, byHeight));
}

/**
 * Tentukan ukuran font + teks judul yang PASTI muat.
 *
 * `availH` = tinggi nyata yang boleh dipakai judul (lihat `titleAvailableH`),
 * jadi batas barisnya ikut mengecil saat blok peraih makin tinggi.
 *
 * Urutan keputusan:
 *  1. turunkan font-size mengikuti `TITLE_LADDER` (mulai dari `titleSize()`)
 *     sampai jumlah baris hasil wrap <= batas baris pada ukuran itu — judul
 *     utuh, hanya fontnya yang mengecil;
 *  2. kalau di `MIN_TITLE_SIZE` masih kelebihan, buang kata dari ujung
 *     (per-kata utuh, tidak pernah di tengah kata) sampai muat lalu tempel
 *     `...` sebagai penanda terpotong.
 *
 * Tanpa langkah 1, judul panjang hanya mengandalkan `line-clamp`/flex — itu
 * yang dulu memotong "NEIRA 3" tanpa jejak.
 */
function fitTitle(
  raw: string,
  availH: number,
  cap?: number,
): { text: string; size: number; breakWord: boolean } {
  const title = raw.trim().replace(/\s+/g, " ");
  const start = titleSize(title);
  // `cap` dari pengukuran DOM: batasi ukuran maksimum supaya judul tidak
  // kembali ke ukuran yang sudah terbukti kelebihan tinggi.
  const top = cap === undefined ? start : Math.min(start, cap);
  const ladder = TITLE_LADDER.filter((size) => size <= top);
  const budget = Math.max(availH - TITLE_SAFETY_PX, MIN_TITLE_SIZE * TITLE_LINE_HEIGHT);
  if (!title) return { text: "", size: top, breakWord: false };
  // `cap` bisa lebih kecil dari semua isi tangga (mis. hasil pengukuran DOM
  // memberi 30px) — pakai nilainya langsung supaya tidak balik membesar.
  if (ladder.length === 0) ladder.push(top);

  for (const size of ladder) {
    const lines = wrapTitle(title, size, TITLE_BOX_W);
    if (lines.length <= linesThatFit(size, budget)) {
      return { text: title, size, breakWord: false };
    }
  }

  const size = ladder[ladder.length - 1] ?? MIN_TITLE_SIZE;
  const maxLines = linesThatFit(size, budget);
  // Buang kata dari ujung (per-kata utuh, tidak pernah di tengah kata)
  // sampai muat, lalu tempel `...` sebagai penanda terpotong.
  const words = title.split(" ").filter(Boolean);
  let kept = words;
  while (kept.length > 0) {
    const candidate = `${kept.join(" ")}${ELLIPSIS}`;
    const lines = wrapTitle(candidate, size, TITLE_BOX_W);
    if (lines.length <= maxLines) {
      return { text: candidate, size, breakWord: kept.length < words.length };
    }
    kept = kept.slice(0, -1);
  }

  // Kata pertama sendiri lebih lebar dari area judul — tidak ada batas kata
  // yang bisa dipertahankan. Kata itu tetap ditampilkan (dengan `breakWord`
  // supaya CSS boleh memenggalnya) + ellipsis, bukan hilang tanpa jejak.
  return { text: `${words[0]}${ELLIPSIS}`, size, breakWord: true };
}

/**
 * Kartu share prestasi ukuran tetap 1080x1350 — dirender off-screen lalu
 * di-capture `SharePrestasiButton`. Murni presentational (tanpa hook) dan
 * memakai style inline literal supaya hasil PNG konsisten di semua browser.
 */
export function SharePrestasiCard({
  title,
  scope,
  year,
  dateLabel,
  peraih,
  titleSizeCap,
  titleBreakWord,
}: SharePrestasiCardProps) {
  // Data korup (mis. scope "Kecamatan") tidak boleh crash generate PNG.
  const tier = TIER_STYLE[scope] ?? TIER_STYLE.Kabupaten;
  const shown = peraih.slice(0, MAX_PERAIH);
  const rest = peraih.length - shown.length;
  const siteLabel = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const meta = dateLabel || year;
  // Tinggi yang benar-benar tersisa untuk judul — dihitung dari blok nyata,
  // bukan diasumsikan selalu `MAX_TITLE_LINES` baris.
  const fitted = fitTitle(title, titleAvailableH(shown, rest), titleSizeCap);

  return (
    <div
      style={{
        position: "relative",
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        overflow: "hidden",
        background: CARD_COLORS.navy,
        color: CARD_COLORS.cream,
        fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <ShareCardBackground />

      <div
        {...{ [SHARE_BODY_ATTR]: "" }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          height: "100%",
          padding: CARD_PAD,
          zIndex: 1,
        }}
      >

        {/* Kop: logo + nama sekolah */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/smasa.png"
            alt=""
            width={96}
            height={96}
            style={{ width: 96, height: 96, objectFit: "contain", flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: CARD_COLORS.cream,
              }}
            >
              SMAN 1 Lumajang
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 22,
                letterSpacing: "0.06em",
                color: CARD_COLORS.creamFaint,
              }}
            >
              Lumajang, Jawa Timur
            </p>
          </div>
        </div>

        <div style={{ marginTop: 44, height: 1, background: CARD_COLORS.divider }} />

        {/* Badge tingkat lomba */}
        <span
          style={{
            alignSelf: "flex-start",
            marginTop: 64,
            padding: "16px 34px",
            borderRadius: 999,
            background: tier.bg,
            border: tier.border,
            color: tier.fg,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {scope}
        </span>

        {/* Judul prestasi — font display sama dengan heading web.
            Ukuran font sudah dihitung `fitTitle` supaya judul muat utuh;
            `flexShrink: 0` mencegah kolom flex memencet judul jadi terpotong
            diam-diam. `lineHeight` dalam px supaya tingginya bisa direproduksi
            persis oleh clone `html-to-image`. Clamp + ellipsis jaring pengaman.
            `SHARE_TITLE_ATTR` = titik ukur `SharePrestasiButton` sebelum capture. */}
        <h2
          {...{ [SHARE_TITLE_ATTR]: "" }}
          style={{
            margin: `${TITLE_MARGIN_TOP}px 0 0`,
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: fitted.size,
            fontWeight: 700,
            lineHeight: `${Math.round(fitted.size * TITLE_LINE_HEIGHT * 100) / 100}px`,
            letterSpacing: `${TITLE_LETTER_SPACING_EM}em`,
            color: CARD_COLORS.cream,
            flexShrink: 0,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: MAX_TITLE_LINES,
            textOverflow: "ellipsis",
            // Kata tunggal yang lebih lebar dari kartu tetap harus terbaca —
            // baik karena perhitungan (`breakWord`) maupun temuan DOM.
            overflowWrap: fitted.breakWord || titleBreakWord ? "anywhere" : "normal",
            overflow: "hidden",
          }}
        >
          {fitted.text}
        </h2>

        {meta ? (
          <p
            style={{
              margin: "32px 0 0",
              fontSize: 26,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: CARD_COLORS.creamMuted,
            }}
          >
            {meta}
          </p>
        ) : null}

        {/* Peraih — 2 kolom bila lebih dari satu orang. Tingginya sudah
            diperhitungkan `peraihBlockH`, jadi tidak perlu ikut menyusut. */}
        {shown.length > 0 ? (
          <div style={{ marginTop: PERAIH_MARGIN_TOP, flexShrink: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: CARD_COLORS.creamFaint,
              }}
            >
              Peraih
            </p>
            <ul
              style={{
                margin: `${PERAIH_LIST_MARGIN_TOP}px 0 0`,
                padding: 0,
                listStyle: "none",
                display: "grid",
                gridTemplateColumns: shown.length > 1 ? "1fr 1fr" : "1fr",
                gap: `${PERAIH_ROW_GAP}px ${PERAIH_COL_GAP}px`,
                // Batas tinggi daftar peraih (3 baris x 2 kolom).
                maxHeight: PERAIH_LIST_MAX_H,
                overflow: "hidden",
              }}
            >
              {shown.map((r, i) => (
                <li key={`${r.nama}-${i}`} style={{ minWidth: 0 }}>
                  <p
                    title={r.nama}
                    style={{
                      margin: 0,
                      fontSize: PERAIH_NAME_SIZE,
                      fontWeight: 500,
                      lineHeight: 1.25,
                      color: CARD_COLORS.cream,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {r.nama}
                  </p>
                  {r.kelas ? (
                    <p
                      style={{
                        margin: `${PERAIH_KELAS_GAP}px 0 0`,
                        fontSize: 21,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: CARD_COLORS.creamFaint,
                      }}
                    >
                      {r.kelas}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {rest > 0 ? (
              <p style={{ margin: "26px 0 0", fontSize: 24, color: CARD_COLORS.creamMuted }}>
                +{rest} peraih lainnya
              </p>
            ) : null}
          </div>
        ) : null}
        {/* Kaki: sumber gambar */}
        <div style={{ marginTop: "auto", paddingTop: 48 }}>
          <div style={{ height: 1, background: CARD_COLORS.divider }} />
          <div
            style={{
              marginTop: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: CARD_COLORS.creamMuted,
              }}
            >
              Prestasi Siswa
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                letterSpacing: "0.06em",
                color: CARD_COLORS.creamFaint,
              }}
            >
              {siteLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


