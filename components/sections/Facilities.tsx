"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * // PLACEHOLDER: ganti src="..." di bawah dengan foto asli fasilitas
 * sekolah sebelum publikasi. Jangan gunakan foto stok.
 */
const FACILITIES = [
  {
    title: "Lab Komputer",
    desc: "PC modern, internet fiber, dan tools pengembangan.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Aula Indoor",
    desc: "Apel, seminar, dan pentas dalam satu ruang besar.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Lab Kimia",
    desc: "Praktikum aman dengan perangkat standar.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Lab Fisika",
    desc: "Eksperimen mekanika hingga kelistrikan.",
    src: "/placeholder-sekolah.svg",
  },
  {
    title: "Multimedia",
    desc: "Produksi konten Media Center sekolah.",
    src: "/placeholder-sekolah.svg",
  },
];

const AUTOPLAY_MS = 5000;
const SWIPE_MIN_PX = 40;

export function Facilities() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = FACILITIES.length;

  const goTo = useCallback(
    (i: number) => setActive(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(
    () => setActive((p) => (p + 1) % count),
    [count]
  );
  const prev = useCallback(
    () => setActive((p) => (p - 1 + count) % count),
    [count]
  );

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(
      () => setActive((p) => (p + 1) % count),
      AUTOPLAY_MS
    );
    return () => window.clearInterval(id);
  }, [reduce, paused, count]);

  function offsetOf(index: number): number {
    const raw = (((index - active) % count) + count) % count;
    return raw > count / 2 ? raw - count : raw;
  }

  return (
    <section id="fasilitas" className="overflow-x-clip bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          align="center"
          eyebrow="Fasilitas"
          title={
            <>
              Ruang yang <i className="text-navy-muted">mendukung</i> cara
              belajar
            </>
          }
          description="Lima ruang yang paling sering dipakai siswa — lab, aula, dan ruang kreatif. Geser untuk tur singkat kampus."
        />

        <Reveal delay={0.1} className="mt-16">
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Virtual tour fasilitas kampus"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") next();
              if (e.key === "ArrowLeft") prev();
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(e) => {
              touchX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
              if (dx <= -SWIPE_MIN_PX) next();
              else if (dx >= SWIPE_MIN_PX) prev();
              touchX.current = null;
            }}
            className="relative outline-none"
          >
            <div className="relative h-[480px] overflow-hidden [perspective:1400px] sm:h-[500px]">
              {FACILITIES.map((f, i) => {
                const offset = offsetOf(i);
                const abs = Math.abs(offset);
                const isActive = offset === 0;
                const scale = isActive ? 1 : abs === 1 ? 0.88 : 0.78;
                const opacity = isActive ? 1 : abs === 1 ? 0.85 : 0.5;
                const blurPx = reduce ? 0 : abs === 0 ? 0 : abs === 1 ? 1 : 2;
                const rot = reduce ? 0 : offset === 0 ? 0 : offset > 0 ? -10 : 10;
                return (
                  <article
                    key={f.title}
                    aria-hidden={!isActive}
                    onClick={() => {
                      if (!isActive) goTo(i);
                    }}
                    style={{
                      transform: `translateX(-50%) translateX(${offset * 104}%) scale(${scale}) rotateY(${rot}deg)`,
                      opacity,
                      zIndex: 30 - abs * 10,
                    }}
                    className={cn(
                      "absolute left-1/2 top-2 w-[82%] max-w-[440px] overflow-hidden rounded-lg border border-navy/10 bg-paper sm:w-[60%] lg:w-[44%]",
                      !reduce && "transition-all duration-500 ease-out",
                      !isActive && "cursor-pointer",
                      isActive &&
                        "shadow-[0_24px_60px_-30px_rgba(9,18,43,0.35)]"
                    )}
                  >
                    {/* TODO: ganti dengan foto asli tiap fasilitas */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.src}
                      alt={`Fasilitas ${f.title} di SMAN 1 Lumajang`}
                      style={blurPx > 0 ? { filter: `blur(${blurPx}px)` } : undefined}
                      className="aspect-[16/10] w-full bg-navy/5 object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-xl leading-snug text-ink">
                          {f.title}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="font-display text-3xl italic leading-none text-navy/10"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {f.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={prev}
              aria-label="Fasilitas sebelumnya"
              className="absolute left-0 top-1/2 z-40 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-paper text-navy transition-all hover:bg-navy hover:text-cream sm:left-2"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Fasilitas berikutnya"
              className="absolute right-0 top-1/2 z-40 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-paper text-navy transition-all hover:bg-navy hover:text-cream sm:right-2"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="mt-6 flex items-center justify-center gap-1">
              {FACILITIES.map((f, i) => (
                <button
                  key={f.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ke fasilitas ${i + 1}: ${f.title}`}
                  aria-current={i === active}
                  className="group flex size-9 items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === active
                        ? "w-6 bg-navy"
                        : "w-2 bg-navy/25 group-hover:bg-navy/50"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs uppercase tracking-[0.24em] text-muted">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}