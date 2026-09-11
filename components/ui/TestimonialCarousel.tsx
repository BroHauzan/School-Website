"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TestimonialItem } from "@/components/sections/Testimonials";

const AUTOPLAY_MS = 5000;
const SWIPE_MIN_PX = 40;

/**
 * Kartu per-view responsif via matchMedia — pakai useSyncExternalStore supaya
 * tidak ada setState di dalam effect (aturan react-hooks/set-state-in-effect).
 * 1 kartu (hp), 2 (>=sm), 3 (>=lg) — sesuai breakpoint grid sebelumnya.
 */
function perViewSubscribe(onChange: () => void): () => void {
  const mq2 = window.matchMedia("(min-width: 640px)");
  const mq3 = window.matchMedia("(min-width: 1024px)");
  mq2.addEventListener("change", onChange);
  mq3.addEventListener("change", onChange);
  return () => {
    mq2.removeEventListener("change", onChange);
    mq3.removeEventListener("change", onChange);
  };
}
function perViewSnapshot(): number {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}
function usePerView(): number {
  return useSyncExternalStore(perViewSubscribe, perViewSnapshot, () => 1);
}

function Card({ t }: { t: TestimonialItem }) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-lg border border-navy/10 bg-paper p-8">
      <div>
        <span aria-hidden="true" className="block font-display text-5xl italic leading-none text-navy/15">
          &ldquo;
        </span>
        <blockquote className="mt-2 text-base leading-relaxed text-ink/85">
          {t.quote}
        </blockquote>
      </div>
      <figcaption className="mt-8 border-t border-navy/10 pt-5">
        <p className="font-medium text-ink">{t.name}</p>
        <p className="mt-1 text-sm text-muted">{t.role}</p>
      </figcaption>
    </figure>
  );
}

/**
 * Carousel testimoni: geser otomatis ke samping tiap 5 detik.
 * Pause saat hover/fokus, swipe sentuh, tombol panah, keyboard ArrowLeft/Right,
 * prefers-reduced-motion -> tanpa autoplay & transisi.
 */
export function TestimonialCarousel({ items }: { items: TestimonialItem[] }) {
  const reduce = useReducedMotion();
  const count = items.length;
  const perView = usePerView();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  // Jumlah langkah = kartu yang tersisa setelah perView pertama.
  const steps = Math.max(count - perView, 0);
  // Clamp derived (bukan setState-in-effect) saat viewport membesar.
  const pos = active > steps ? steps : active;

  const next = useCallback(
    () => setActive((p) => (steps === 0 ? 0 : ((p > steps ? steps : p) + 1) % (steps + 1))),
    [steps],
  );
  const prev = useCallback(
    () => setActive((p) => (steps === 0 ? 0 : ((p > steps ? steps : p) - 1 + steps + 1) % (steps + 1))),
    [steps],
  );

  useEffect(() => {
    if (reduce || paused || steps === 0) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused, steps, next]);

  const shift = steps === 0 ? 0 : (pos * 100) / perView;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimoni siswa dan alumni"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (dx <= -SWIPE_MIN_PX) next();
        else if (dx >= SWIPE_MIN_PX) prev();
        touchX.current = null;
      }}
      className="relative outline-none"
    >
      <div className="overflow-hidden">
        <div
          className={cn("flex", !reduce && "transition-transform duration-500 ease-out")}
          style={{ transform: `translateX(-${shift}%)` }}
        >
          {items.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              aria-hidden={i < pos || i >= pos + perView}
              className="shrink-0 grow-0 basis-full px-2.5 sm:basis-1/2 lg:basis-1/3"
            >
              <Card t={t} />
            </div>
          ))}
        </div>
      </div>

      {steps > 0 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Testimoni sebelumnya"
            className="flex size-10 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors hover:border-navy/50 hover:bg-navy/5"
          >
            &larr;
          </button>
          <div className="flex items-center gap-2" aria-label="Halaman testimoni">
            {Array.from({ length: steps + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === pos}
                aria-label={`Ke posisi ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === pos ? "w-6 bg-navy" : "w-2 bg-navy/25 hover:bg-navy/45",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Testimoni berikutnya"
            className="flex size-10 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors hover:border-navy/50 hover:bg-navy/5"
          >
            &rarr;
          </button>
        </div>
      ) : null}
    </div>
  );
}
