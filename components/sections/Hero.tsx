import {
  SCHOOL,
  accreditationLabel,
  displayPhone,
  operationalPermitLabel,
  telHref,
  yearsSince,
} from "@/lib/school";

/** Entrance murni CSS; animasi didefinisikan di globals.css (.hero-rise). */
const riseDelay = (i: number) => ({ animationDelay: `${i * 0.12}s` });

export function Hero() {
  const age = yearsSince(SCHOOL.established);

  return (
    <section
      id="beranda"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy text-cream"
    >
      {/* Latar: foto blur hybrid + motif dekoratif */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-school.webp"
          alt=""
          className="hero-blur-bg h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {/* Heavy navy overlay — foto jadi tekstur samar */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/50 to-navy/70" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-28">
        <div className="hero-rise flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/smasa.webp"
            alt="Logo SMA Negeri 1 Lumajang"
            className="size-16 rounded-full object-contain ring-1 ring-cream/20 sm:size-20"
            loading="eager"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream/70 sm:text-sm">
            {SCHOOL.location}
          </p>
        </div>

        <h1
          className="hero-rise mt-6 font-display leading-[0.95] tracking-[-0.02em]"
          style={riseDelay(1)}
        >
          <span className="block text-[10vw] font-semibold sm:text-6xl lg:text-[4.5rem]">
            SMA&nbsp;NEGERI&nbsp;1
          </span>
          <span className="block text-[10vw] font-medium italic text-cream/90 sm:text-6xl lg:text-[4.5rem]">
            Lumajang
          </span>
        </h1>

        <p
          className="hero-rise mt-6 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg"
          style={riseDelay(2)}
        >
          Sekolah yang melekat pada kebijaksanaan burung hantu — membaca dari
          kegelapan, terbang lebih dulu dari fajar.
        </p>

        {/* Strip identitas — data resmi, non-interaktif */}
        <dl
          className="hero-rise mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 border-t border-cream/15 pt-6 text-sm sm:grid-cols-3 sm:gap-y-0 sm:divide-x sm:divide-cream/15 sm:border-l-0 sm:pt-7"
          style={riseDelay(3)}
        >
          <div className="sm:pl-6">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/55">
              NPSN
            </dt>
            <dd className="mt-1 text-base tabular-nums leading-normal text-cream/95">
              {SCHOOL.npsn}
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/55">
              Berdiri
            </dt>
            <dd className="mt-1 text-base tabular-nums leading-normal text-cream/95">
              {SCHOOL.established} &middot; {age} tahun
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/55">
              Akreditasi
            </dt>
            <dd className="mt-1 text-base tabular-nums leading-normal text-cream/95">
              {accreditationLabel() ?? "—"}
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/55">
              Alamat
            </dt>
            <dd className="mt-1 text-base text-cream/95">
              {SCHOOL.address.street}
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/55">
              Telepon
            </dt>
            <dd className="mt-1 text-base tabular-nums leading-normal text-cream/95">
              <a href={telHref()} className="transition-colors hover:text-cream">
                {displayPhone()}
              </a>
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream/55">
              Email
            </dt>
            <dd className="mt-1 break-all text-base text-cream/95">
              <a
                href={`mailto:${SCHOOL.email}`}
                className="transition-colors hover:text-cream"
              >
                {SCHOOL.email}
              </a>
            </dd>
          </div>
        </dl>
        <p
          aria-label="Izin operasional dan akreditasi sekolah"
          className="hero-rise mt-3 text-[11px] tracking-[0.18em] text-cream/75"
          style={riseDelay(3)}
        >
          {operationalPermitLabel()} &middot; {accreditationLabel() ?? "Terakreditasi"}
        </p>
      </div>

      {/* CTA scroll ke bawah */}
      <a
        href="#berita"
        className="group absolute bottom-6 right-6 z-30 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-cream/70 transition-colors hover:text-cream"
      >
        Telusuri
        <span className="relative inline-flex size-9 items-center justify-center rounded-full border border-cream/25 transition-colors group-hover:border-cream/60">
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </span>
      </a>

      {/* Indikator scroll di kiri bawah, hanya desktop */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-6 hidden flex-col items-center gap-2 sm:flex"
      >
        <span className="h-10 w-px bg-gradient-to-b from-transparent via-cream/40 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-cream/60 [writing-mode:vertical-rl]">
          Gulir untuk menjelajah
        </span>
      </div>
    </section>
  );
}
