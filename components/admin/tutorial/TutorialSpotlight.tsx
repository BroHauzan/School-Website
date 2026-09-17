"use client";

import { useEffect, useRef, useState } from "react";
import { useTutorial } from "./TutorialProvider";
import { getTutorial, type TutorialStep } from "./tutorials";

type Rect = { x: number; y: number; w: number; h: number };

type View = { key: string; rect: Rect | null; missing: boolean };

const PAD = 8;

export function TutorialSpotlight() {
  const { activeId, stepIndex, totalSteps, next, prev, exit } = useTutorial();
  const [view, setView] = useState<View>({ key: "", rect: null, missing: false });
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tutorial = activeId ? getTutorial(activeId) : undefined;
  const step = tutorial?.steps[stepIndex];
  const stepKey = step ? `${step.route}#${step.id}` : "";

  // Show success feedback ketika target berhasil diklik
  const showSuccessFeedback = (selector: string) => {
    const el = findVisibleTarget(selector);
    if (el) {
      // Add ripple effect
      const ripple = document.createElement("div");
      ripple.className = "tour-ripple";
      const host =
        el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "IMG"
          ? el.parentElement
          : el;
      if (host) {
        host.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1200);
      }

      // Success glow effect
      el.classList.add("tour-success");
      setTimeout(() => el.classList.remove("tour-success"), 1200);
    }
  };

  // Auto-advance logic: tutorial otomatis lanjut setelah user berhasil klik target
  useEffect(() => {
    if (!step?.autoAdvance || !view.rect) return;

    // Delay auto-advance untuk visual feedback
    const delay = step.advanceDelay || 800;
    const timer = setTimeout(() => {
      // Hanya auto-advance jika belum di step terakhir
      if (stepIndex < totalSteps - 1) {
        next();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [step?.id, next, step?.autoAdvance, view?.rect, stepIndex, totalSteps, step?.advanceDelay]);

  // Navigation guard - monitor klik di luar target area
  useEffect(() => {
    if (!step?.selector) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target || typeof target.closest !== "function") return;

      // If user clicked on target element - show success feedback
      try {
        if (target.closest(step.selector)) {
          showSuccessFeedback(step.selector);
          return;
        }
      } catch {
        // Fallback jika selector khusus/invalid
      }

      // If user clicked elsewhere - show guidance toast
      if (step?.autoAdvance) {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setShowToast(true);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);

        // Auto scroll back to current step
        setTimeout(() => {
          const currentEl = findVisibleTarget(step.selector);
          currentEl?.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 150);
      }
    };

    document.addEventListener("click", handleOutsideClick, true);
    return () => {
      document.removeEventListener("click", handleOutsideClick, true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [step?.selector, step?.autoAdvance]);

  // Dismiss toast on manual navigation
  const dismissToast = (action: 'click' | 'escape') => {
    if (action === 'click' || action === 'escape') {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setShowToast(false);
    }
  };

  useEffect(() => {
    if (!step) return;
    const key = `${step.route}#${step.id}`;
    let alive = true;
    let attempts = 0;

    function measure(): boolean {
      const el = findVisibleTarget(step!.waitFor ?? step!.selector);
      if (!el) return false;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      // Ukur ulang setelah scroll selesai, lalu tukar overlay lama ke posisi baru.
      window.setTimeout(() => {
        if (!alive) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        setView({ key, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, missing: false });
      }, 350);
      return true;
    }

    function poll() {
      if (!alive) return;
      attempts += 1;
      if (measure()) return;
      if (attempts >= 40 && !step!.waitFor) {
        setView({ key, rect: null, missing: true });
        return;
      }
      if (attempts >= 200 && step!.waitFor) {
        setView({ key, rect: null, missing: true });
        return;
      }
      // Langkah dengan waitFor (mis. menunggu blok dibuat user) dipoll
      // maks 200x (30 detik); overlay lama tetap tampil redup sampai target muncul.
      window.setTimeout(poll, 150);
    }
    poll();

    function onReposition() {
      const el = findVisibleTarget(step!.selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      setView({ key, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, missing: false });
    }
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") exit();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      alive = false;
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, exit]);

  if (!tutorial || !step) return null;

  const isLast = stepIndex === totalSteps - 1;
  // Selama target langkah baru belum ketemu, overlay lama tetap tampil
  // (agak redup) supaya layar tidak kedip terang.
  const transitioning = view.key !== stepKey;
  const rect = view.rect;
  const missing = !transitioning && view.missing;

  // Fallback aman: target tidak ketemu (UI berubah / data kosong).
  if (missing && !rect) {
    return (
      <div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/70 p-4 sm:items-center">
        <div className="w-full max-w-md rounded-xl bg-paper p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
            Langkah {stepIndex + 1} dari {totalSteps}
          </p>
          <h3 className="mt-2 font-display text-xl text-ink">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Bagian yang mau ditunjuk lagi tidak tampil di halaman ini. Kamu bisa lanjut ke langkah
            berikutnya atau keluar, data yang sedang diisi tetap aman.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              onClick={exit}
              className="rounded-full border border-navy/20 px-5 py-2 text-sm text-navy transition-colors hover:border-navy/50"
            >
              Keluar
            </button>
            <button
              onClick={next}
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-light"
            >
              {isLast ? "Selesai" : "Lewati langkah ini"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!rect) return null;

  const top = Math.max(0, rect.y - PAD);
  const left = Math.max(0, rect.x - PAD);
  const w = rect.w + PAD * 2;
  const h = rect.h + PAD * 2;

  // Tooltip: di bawah target kalau muat, kalau tidak di atas, kalau tidak menempel bawah layar.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const spaceBelow = vh - (top + h);
  const placeAbove = spaceBelow < 260 && top > 280;
  const tipTop = placeAbove ? undefined : top + h + 12;
  const tipBottom = placeAbove ? Math.max(12, vh - top + 12) : undefined;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200 ${transitioning ? "opacity-70" : "opacity-100"}`}
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
    >
      {/* 4 penutup gelap di sekeliling target */}
      <div className="absolute bg-navy/70" style={{ left: 0, top: 0, width: "100%", height: top }} />
      <div
        className="absolute bg-navy/70"
        style={{ left: 0, top: top + h, width: "100%", bottom: 0 }}
      />
      <div className="absolute bg-navy/70" style={{ left: 0, top, width: left, height: h }} />
      <div
        className="absolute bg-navy/70"
        style={{ left: left + w, top, right: 0, height: h }}
      />

      {/* Bingkai terang di sekeliling target (berdenyut saat langkah aksi) */}
      <div
        className={`absolute rounded-xl border-2 border-cream shadow-[0_0_0_4px_rgba(249,249,248,0.25),0_8px_32px_rgba(0,0,0,0.45)] ${step.requires ? "tour-pulse" : ""}`}
        style={{ left, top, width: w, height: h }}
      />

      {/* Tooltip (satu-satunya bagian yang bisa diklik di overlay) */}
      <div
        className="pointer-events-auto absolute left-1/2 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 sm:left-auto sm:translate-x-0"
        style={
          tipTop !== undefined
            ? { top: Math.max(8, Math.min(tipTop, vh - 240)), right: 16 }
            : { bottom: tipBottom, right: 16 }
        }
      >
        <div className="rounded-xl bg-paper p-5 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">
            Langkah {stepIndex + 1} dari {totalSteps}
          </p>
          <h3 className="mt-1 font-display text-xl text-ink">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={exit}
              className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
            >
              Keluar
            </button>
            <div className="flex gap-2">
              {stepIndex > 0 ? (
                <button
                  onClick={prev}
                  className="rounded-full border border-navy/20 px-5 py-2 text-sm text-navy transition-colors hover:border-navy/50"
                >
                  Sebelumnya
                </button>
              ) : null}
              <LanjutButton key={step.id} step={step} isLast={isLast} onNext={next} />
            </div>
          </div>
        </div>
      </div>

      {/* Toast navigation guidance */}
      {showToast && step?.autoAdvance ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[95]">
          <div className="rounded-full bg-navy text-cream px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="text-sm">Tutorial tetap fokus ke step ini</span>
            <button 
              onClick={() => dismissToast('click')}
              className="text-cream hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Tombol Lanjut yang terkunci sampai syarat langkah terpenuhi.
 * Tanpa requires: tombol langsung aktif seperti biasa.
 */
function LanjutButton({
  step,
  isLast,
  onNext,
}: {
  step: TutorialStep;
  isLast: boolean;
  onNext: () => void;
}) {
  const [ready, setReady] = useState(() =>
    step.requires && typeof document !== "undefined" ? !!findVisibleTarget(step.requires) : true,
  );

  useEffect(() => {
    if (!step.requires) return;
    const t = window.setInterval(() => {
      if (findVisibleTarget(step.requires!)) {
        setReady(true);
        window.clearInterval(t);
      }
    }, 300);
    return () => window.clearInterval(t);
  }, [step]);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {!ready && step.requiresHint ? (
        <span className="max-w-55 text-right text-xs leading-relaxed text-navy-muted">
          {step.requiresHint}
        </span>
      ) : null}
      <button
        onClick={onNext}
        disabled={!ready}
        className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy"
      >
        {isLast ? "Selesai" : "Lanjut"}
      </button>
    </span>
  );
}

function findVisibleTarget(selector: string): HTMLElement | null {
  if (!selector) return null;
  try {
    const els = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    // Pilih yang terlihat (lewati yang hidden responsif seperti tombol header di HP).
    return (
      els.find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }) ?? null
    );
  } catch {
    return null;
  }
}
