import {
  CARD_COLORS,
  GLOW_CORE_STOP,
  GLOW_ORIGIN,
  GLOW_RADIUS,
  NOISE_SEED,
  NOISE_TILE_SIZE,
  SHARE_BG_DEFAULTS,
} from "./share-card-theme";

/**
 * SVG mata owl abstrak — dua lingkaran konsentris + pupil, stroke only.
 * Dipakai sebagai `background-image` data-URI (bukan elemen <svg>) supaya
 * html-to-image tidak perlu memprosesnya: `embedResources` melewati URL
 * `data:` (lihat isDataUrl di node_modules/html-to-image/lib/dataurl.js).
 */
function owlEyeSvg(stroke: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" stroke="${stroke}" stroke-width="1.5">
<circle cx="200" cy="200" r="196"/>
<circle cx="200" cy="200" r="150"/>
<circle cx="200" cy="200" r="104"/>
<circle cx="200" cy="200" r="58"/>
<circle cx="200" cy="200" r="18"/>
<path d="M4 200h392"/>
<path d="M200 4v392"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Lengkung dekoratif — sapuan sayap tipis dari pojok kanan atas menuju tengah,
 * mengisi ruang kosong di atas judul tanpa mengganggu keterbacaan.
 * Stroke only, tanpa fill.
 */
function wingArcSvg(stroke: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round">
<path d="M896 12C700 40 470 150 300 330"/>
<path d="M884 96C716 122 520 216 372 372"/>
<path d="M900 200C780 214 640 274 520 366"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * PRNG deterministik (mulberry32) — tekstur grain harus identik tiap render,
 * bukan berubah-ubah seperti `Math.random()`.
 */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Alpha puncak bintik grain pada tile, SEBELUM dikali multiplier `noise`.
 * Nilai kecil disengaja: pada kartu gelap, alpha ~0.05–0.13 menghasilkan
 * |Δ luminance| ~5/255 — butiran halus yang terlihat saat di-zoom tapi tidak
 * mengganggu keterbacaan. Alpha besar (mis. 0.5) membuat kartu seperti TV statik.
 */
const GRAIN_ALPHA_LIGHT = 0.055;
const GRAIN_ALPHA_DARK = 0.13;

/**
 * Tile grain PNG transparan dengan alpha ter-bake.
 *
 * KENAPA begini: `mix-blend-mode` TIDAK ikut ter-capture html-to-image
 * (tidak ada di lib-nya) dan `overlay` di atas backdrop gelap secara
 * matematis no-op (`2 x 0.04 x 0.5 = 0.04`). Jadi grain ditulis sebagai
 * piksel putih/hitam ber-alpha rendah, lalu di-composite biasa oleh browser —
 * hasilnya pasti ikut ke PNG.
 */
function makeNoiseTile(size: number, seed: number, intensity: number): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(size, size);
  const data = image.data;
  const rand = mulberry32(seed);
  for (let i = 0; i < size * size; i++) {
    const light = rand() < 0.5;
    const peak = light ? GRAIN_ALPHA_LIGHT : GRAIN_ALPHA_DARK;
    // Variasi 40–100% dari alpha puncak supaya tekstur tidak rata.
    const alpha = Math.round(intensity * peak * (0.4 + 0.6 * rand()) * 255);
    const o = i * 4;
    data[o] = light ? 255 : 0;
    data[o + 1] = light ? 255 : 0;
    data[o + 2] = light ? 255 : 0;
    data[o + 3] = alpha;
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Cache tile per intensitas — pembuatan canvas hanya sekali per nilai. */
const noiseTileCache = new Map<string, string>();

function noiseTileUrl(intensity: number): string {
  const key = `${NOISE_TILE_SIZE}|${NOISE_SEED}|${intensity.toFixed(3)}`;
  const cached = noiseTileCache.get(key);
  if (cached !== undefined) return cached;
  const url = makeNoiseTile(NOISE_TILE_SIZE, NOISE_SEED, intensity);
  noiseTileCache.set(key, url);
  return url;
}


export type ShareCardBackgroundProps = {
  /** Kekuatan glow radial di sekitar logo. 0 = mati. Default 1. */
  glow?: number;
  /** Opacity watermark mata owl. Default 0.05. */
  watermark?: number;
  /**
   * MULTIPLIER kekuatan grain (bukan opacity CSS) — di-bake ke kanal alpha
   * tile PNG. 0 = tanpa grain. Default 1 ≈ |Δ luminance| ~5/255.
   */
  noise?: number;
  /** Kekuatan vignette tepi. 0 = mati. Default 1. */
  vignette?: number;
  /** Opacity lengkung dekoratif kanan atas. 0 = mati. Default 0.1. */
  arc?: number;
  /** Warna stroke watermark mata owl. Default emas kartu. */
  watermarkColor?: string;
  /** Warna stroke lengkung dekoratif. Default emas kartu. */
  arcColor?: string;
};

/**
 * Layer background kartu share — dirender sebagai elemen absolut di belakang
 * konten. Semua layer memakai CSS statis (gradient + data-URI) supaya ikut
 * ter-capture html-to-image tanpa fetch/decoding tambahan.
 *
 * Urutan belakang -> depan:
 *   1. base + grain tile + radial glow dari logo (SATU elemen background-image)
 *   2. lengkung dekoratif kanan atas
 *   3. watermark mata owl (kanan bawah, sengaja overflow)
 *   4. vignette tepi
 *
 * CATATAN CAPTURE (jangan dilanggar):
 * - DILARANG `mix-blend-mode`: tidak ikut ter-capture html-to-image (tidak ada
 *   di lib-nya), dan `overlay` di atas backdrop gelap secara matematis no-op
 *   (`2 x 0.04 x 0.5 = 0.04`). Grain karena itu di-bake ke alpha tile PNG.
 * - DILARANG CSS `filter` — tidak konsisten saat dirasterisasi ke canvas.
 * - `opacity` per-layer hanya untuk elemen TERPISAH (watermark, arc, vignette).
 *   Grain menempel di elemen gradient, jadi kekuatannya lewat alpha tile.
 */
export function ShareCardBackground({
  glow = SHARE_BG_DEFAULTS.glow,
  watermark = SHARE_BG_DEFAULTS.watermark,
  noise = SHARE_BG_DEFAULTS.noise,
  vignette = SHARE_BG_DEFAULTS.vignette,
  arc = SHARE_BG_DEFAULTS.arc,
  watermarkColor = CARD_COLORS.eyeStroke,
  arcColor = CARD_COLORS.arcStroke,
}: ShareCardBackgroundProps) {
  const noiseUrl = noise > 0 ? noiseTileUrl(noise) : "";
  const glowLayer =
    glow > 0
      ? `radial-gradient(circle ${GLOW_RADIUS}px at ${GLOW_ORIGIN.x}px ${GLOW_ORIGIN.y}px, ${CARD_COLORS.glowCore} 0%, ${CARD_COLORS.baseDeep} ${GLOW_CORE_STOP}%)`
      : "";

  return (
    <>
      {/* 1. Base + grain + radial glow.
          Grain dan glow digabung dalam SATU `background-image` berlapis:
          lapisan pertama (tile grain, diulang) menimpa gradient di bawahnya.
          Dengan begitu keduanya ikut ter-capture sebagai background biasa. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: CARD_COLORS.baseDeep,
          backgroundImage: [noiseUrl && `url("${noiseUrl}")`, glowLayer]
            .filter(Boolean)
            .join(", "),
          backgroundRepeat: noiseUrl ? "repeat, no-repeat" : "no-repeat",
          backgroundSize: noiseUrl
            ? `${NOISE_TILE_SIZE}px ${NOISE_TILE_SIZE}px, auto`
            : "auto",
        }}
      />

      {/* 2. Lengkung dekoratif — mengisi ruang kosong kanan atas. */}
      {arc > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: arc,
            backgroundImage: `url("${wingArcSvg(arcColor)}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top right",
            backgroundSize: "900px 700px",
          }}
        />
      ) : null}

      {/* 3. Watermark mata owl — kanan bawah, terpotong tepi kartu. */}
      {watermark > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -300,
            bottom: -280,
            width: 900,
            height: 900,
            opacity: watermark,
            backgroundImage: `url("${owlEyeSvg(watermarkColor)}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      {/* 4. Vignette tepi — jaga fokus ke tengah.
          Radius sengaja lebih kecil dari kartu dan stop transparan di 55%,
          supaya area konten (padding 88px) sama sekali tidak ikut digelapkan
          dan efeknya hanya terasa di tepi + sudut. */}
      {vignette > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: vignette,
            background: `radial-gradient(78% 62% at 50% 46%, rgba(0,0,0,0) 55%, ${CARD_COLORS.vignetteEdge} 100%)`,
          }}
        />
      ) : null}
    </>
  );
}

