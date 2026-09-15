/**
 * Pengukuran judul kartu share dari DOM NYATA, bukan dari estimasi.
 *
 * KENAPA perlu: `fitTitle` di `SharePrestasiCard` menghitung jumlah baris pakai
 * `canvas.measureText`. Kalau font display belum termuat saat render pertama
 * (umum di laptop dengan cache kosong), canvas mengukur pakai font fallback —
 * metriknya beda, jadi hasil wrap di DOM bisa jadi 1 baris lebih banyak.
 *
 * Masalahnya `html-to-image` menyalin computed style (termasuk tinggi hasil
 * layout) ke `foreignObject` lalu merender ulang di sana
 * (`node_modules/html-to-image/es/clone-node.js` → `cloneCSSStyle`). Tinggi yang
 * sudah terkunci + `overflow: hidden` membuat baris ekstra terpotong DIAM-DIAM
 * di PNG, padahal DOM-nya terlihat benar. Gejalanya khas: hasil beda per
 * perangkat (HP aman, laptop terpotong).
 *
 * Karena itu sebelum capture: ukur tinggi natural judul di DOM, bandingkan
 * dengan ruang yang benar-benar tersedia, lalu turunkan font sampai muat.
 */

/** Atribut penanda node di dalam kartu — dipakai `SharePrestasiButton`. */
export const SHARE_TITLE_ATTR = "data-share-title";
export const SHARE_BODY_ATTR = "data-share-body";

/** Selektor siap pakai untuk `querySelector`. */
export const SHARE_TITLE_SELECTOR = `[${SHARE_TITLE_ATTR}]`;
export const SHARE_BODY_SELECTOR = `[${SHARE_BODY_ATTR}]`;

/**
 * Tangga ukuran judul dari terbesar ke terkecil. `titleSize()` cuma memilih
 * titik awal; `nextTitleStep` menuruninya satu per satu saat DOM membuktikan
 * judul masih kelebihan tinggi.
 */
export const TITLE_SIZE_LADDER = [
  84, 78, 72, 68, 64, 58, 54, 50, 46, 42, 38, 34,
] as const;

/** Ukuran judul terkecil — di bawah ini judul dipotong per kata + ellipsis. */
export const MIN_TITLE_SIZE = TITLE_SIZE_LADDER[TITLE_SIZE_LADDER.length - 1];

/** Toleransi pembulatan sub-piksel saat membandingkan tinggi, px. */
const EPSILON = 1;

/**
 * Nilai margin px yang BENAR-BENAR memakan ruang.
 *
 * `margin: auto` (kaki kartu memakainya untuk menempel ke bawah) dilaporkan
 * `getComputedStyle` sebagai px hasil distribusi flex (mis. "211.422px"),
 * bukan "auto". Kalau angka itu ikut dijumlahkan, ruang yang justru BEBAS
 * dianggap terpakai sehingga judul dikecilkan sia-sia.
 *
 * Deteksi: bandingkan nilai yang ditulis di style dengan nilai computed.
 * `auto` / persen menghasilkan computed yang berbeda dari tulisannya → hitung 0.
 */
function fixedMargin(el: HTMLElement, prop: "marginTop" | "marginBottom"): number {
  if (getComputedStyle(el).display === "none") return 0;
  const specified = el.style[prop]?.trim() ?? "";
  const computed = getComputedStyle(el)[prop];
  if (specified && specified !== computed) return 0;
  const value = Number.parseFloat(computed);
  return Number.isFinite(value) ? value : 0;
}

/** Tinggi kotak + margin yang benar-benar memakan ruang. */
function outerHeight(el: HTMLElement): number {
  if (getComputedStyle(el).display === "none") return 0;
  return (
    el.getBoundingClientRect().height +
    fixedMargin(el, "marginTop") +
    fixedMargin(el, "marginBottom")
  );
}

/** Ukuran font judul yang sedang terpakai di DOM, px. */
export function currentTitleSize(titleEl: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(titleEl).fontSize);
}

/**
 * Tinggi natural judul TANPA clamp & tanpa `overflow: hidden` — inilah tinggi
 * yang akan dipakai browser kalau tidak dipotong. Clamp & overflow dikembalikan
 * seperti semula sebelum fungsi selesai.
 */
export function measureNaturalTitleHeight(titleEl: HTMLElement): number {
  const prev = {
    display: titleEl.style.display,
    clamp: titleEl.style.webkitLineClamp,
    overflow: titleEl.style.overflow,
  };
  titleEl.style.display = "block";
  titleEl.style.webkitLineClamp = "none";
  titleEl.style.overflow = "visible";
  const height = titleEl.getBoundingClientRect().height;
  titleEl.style.display = prev.display;
  titleEl.style.webkitLineClamp = prev.clamp;
  titleEl.style.overflow = prev.overflow;
  return height;
}

/**
 * Tinggi yang boleh dipakai judul (termasuk margin atasnya), px — dihitung dari
 * tinggi nyata sibling di dalam kolom kartu.
 *
 * Memakai pengukuran sibling, bukan `clientHeight - tinggi judul sekarang`,
 * supaya angka ini tidak berubah-ubah mengikuti ukuran judul yang sedang aktif
 * (kalau tidak, hasilnya jadi sirkular dan turun fontnya bisa tak berujung).
 */
export function measureTitleBudget(
  bodyEl: HTMLElement,
  titleEl: HTMLElement,
): number {
  const cs = getComputedStyle(bodyEl);
  const padding =
    Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom);
  const contentH = bodyEl.getBoundingClientRect().height - padding;
  let others = 0;
  for (const child of Array.from(bodyEl.children) as HTMLElement[]) {
    if (child === titleEl || child.contains(titleEl)) continue;
    others += outerHeight(child);
  }
  return contentH - others;
}

/** Margin atas judul, px (dianggap 0 bila `auto` / nilai dinamis). */
export function titleMarginTop(titleEl: HTMLElement): number {
  return fixedMargin(titleEl, "marginTop");
}

/**
 * Apakah judul masih lebih tinggi daripada ruang yang tersedia?
 * `budget` = hasil `measureTitleBudget` (sudah termasuk jatah margin atas).
 */
export function titleOverflows(titleEl: HTMLElement, budget: number): boolean {
  const needed = measureNaturalTitleHeight(titleEl) + titleMarginTop(titleEl);
  return needed > budget + EPSILON;
}

/**
 * Langkah font berikutnya yang lebih kecil dari `size`, atau `null` kalau sudah
 * di dasar tangga (`MIN_TITLE_SIZE`) — artinya judul harus dipotong per kata.
 */
export function nextTitleStep(size: number): number | null {
  for (const step of TITLE_SIZE_LADDER) {
    if (step < size - 0.5) return step;
  }
  return null;
}

/**
 * Tunggu layout selesai: dua frame (satu commit React, satu layout).
 *
 * rAF di-race dengan timeout karena rAF TIDAK berjalan di tab background —
 * kalau tidak, tombol Bagikan bisa menggantung selamanya saat user pindah tab
 * di tengah proses capture.
 */
export function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const timer = setTimeout(finish, 64);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        clearTimeout(timer);
        finish();
      }),
    );
  });
}

/**
 * Apakah judul terpotong HORIZONTAL (satu kata lebih lebar dari kolom dan
 * browser tidak boleh memenggalnya)? Ini tidak terdeteksi oleh pengukuran
 * tinggi, jadi dicek terpisah.
 */
export function titleOverflowsX(titleEl: HTMLElement): boolean {
  return titleEl.scrollWidth > titleEl.clientWidth + 1;
}

/** Jumlah baris terlihat saat ini (dengan clamp aktif). */
export function visibleTitleLines(titleEl: HTMLElement): number {
  const lh = Number.parseFloat(getComputedStyle(titleEl).lineHeight);
  if (!Number.isFinite(lh) || lh <= 0) return 1;
  return Math.round(titleEl.getBoundingClientRect().height / lh);
}

/** Jumlah baris kalau tidak dipotong sama sekali. */
export function naturalTitleLines(titleEl: HTMLElement): number {
  const lh = Number.parseFloat(getComputedStyle(titleEl).lineHeight);
  if (!Number.isFinite(lh) || lh <= 0) return 1;
  return Math.round(measureNaturalTitleHeight(titleEl) / lh);
}

/** Penangan yang dipanggil loop saat perlu mengubah ukuran / perilaku wrap. */
export type FitTitleHandlers = {
  /** Minta render ulang judul pada ukuran font lebih kecil. */
  onShrink: (size: number) => void;
  /** Minta render ulang judul dengan izin memenggal kata (`overflow-wrap`). */
  onBreakWord: () => void;
};

/**
 * Turunkan ukuran judul sampai tinggi naturalnya benar-benar muat, dengan
 * mengukur DOM tiap iterasi. Mengembalikan `cap` terakhir (atau `null` bila
 * tidak ada perubahan ukuran) supaya pemanggil bisa menyimpannya sebagai state.
 *
 * Dua masalah yang ditangani:
 *  1. vertikal — judul lebih tinggi dari ruang tersedia (penyebab "NEIRA 3"
 *     hilang saat font display telat termuat);
 *  2. horizontal — satu kata lebih lebar dari kolom tanpa titik patah, yang
 *     membuat teks terpotong ke samping tanpa jejak. Sekali terdeteksi,
 *     `onBreakWord` dipanggil supaya CSS boleh memenggalnya.
 *
 * Loop dibatasi `maxPasses` agar tidak pernah menggantung.
 */
export async function fitTitleToDom(
  bodyEl: HTMLElement,
  titleEl: HTMLElement,
  handlers: FitTitleHandlers,
  maxPasses = 6,
): Promise<number | null> {
  let cap: number | null = null;
  let brokeWord = false;
  for (let pass = 0; pass < maxPasses; pass++) {
    if (!brokeWord && titleOverflowsX(titleEl)) {
      brokeWord = true;
      handlers.onBreakWord();
      await waitForLayout();
      continue;
    }
    const budget = measureTitleBudget(bodyEl, titleEl);
    if (!titleOverflows(titleEl, budget)) break;
    const next = nextTitleStep(currentTitleSize(titleEl));
    if (next === null) break;
    cap = next;
    handlers.onShrink(next);
    await waitForLayout();
  }
  return cap;
}
