import type { PrestasiPeraih, PrestasiScope } from "@/lib/prestasi-schema";
import { SITE_URL } from "@/lib/school";
import { CARD_COLORS, CARD_H, CARD_W, TIER_STYLE } from "./share-card-theme";
import { ShareCardBackground } from "./ShareCardBackground";

export type SharePrestasiCardProps = {
  title: string;
  scope: PrestasiScope;
  year: string;
  /** Label tanggal siap tampil, mis. "12 Agustus 2026". Kosong = pakai `year`. */
  dateLabel: string;
  peraih: PrestasiPeraih[];
};

/** Sisanya diringkas jadi "+N peraih lainnya" supaya kartu tidak kepanjangan. */
const MAX_PERAIH = 6;

/**
 * Judul panjang diturunkan bertahap supaya tetap muat tanpa terpotong.
 * Batas keras: `MAX_TITLE_LINES` baris — data di luar spec (validasi title
 * maks 160 karakter) dipotong, bukan merusak layout kartu.
 */
const MAX_TITLE_LINES = 5;

function titleSize(title: string): number {
  if (title.length > 150) return 50;
  if (title.length > 110) return 58;
  if (title.length > 75) return 68;
  return 84;
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
}: SharePrestasiCardProps) {
  const tier = TIER_STYLE[scope];
  const shown = peraih.slice(0, MAX_PERAIH);
  const rest = peraih.length - shown.length;
  const siteLabel = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const meta = dateLabel || year;

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
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          height: "100%",
          padding: 88,
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

        {/* Judul prestasi — font display sama dengan heading web */}
        <h2
          style={{
            margin: "44px 0 0",
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: titleSize(title),
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: CARD_COLORS.cream,
            // Batas keras tinggi judul: MAX_TITLE_LINES x line-height.
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: MAX_TITLE_LINES,
            overflow: "hidden",
          }}
        >
          {title}
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

        {/* Peraih — 2 kolom bila lebih dari satu orang */}
        {shown.length > 0 ? (
          <div style={{ marginTop: 56 }}>
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
                margin: "30px 0 0",
                padding: 0,
                listStyle: "none",
                display: "grid",
                gridTemplateColumns: shown.length > 1 ? "1fr 1fr" : "1fr",
                gap: "24px 40px",
                // Batas tinggi daftar peraih (3 baris x 2 kolom).
                maxHeight: 3 * 2 * 62,
                overflow: "hidden",
              }}
            >
              {shown.map((r, i) => (
                <li key={`${r.nama}-${i}`} style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 30,
                      fontWeight: 500,
                      lineHeight: 1.25,
                      color: CARD_COLORS.cream,
                    }}
                  >
                    {r.nama}
                  </p>
                  {r.kelas ? (
                    <p
                      style={{
                        margin: "6px 0 0",
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


