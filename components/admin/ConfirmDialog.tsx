"use client";
import { useEffect, useRef, useState } from "react";
export function ConfirmDialog({ title, desc, confirm, onOk }: { title: string; desc: string; confirm?: string; onOk: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Fokus ke tombol aman saat dialog terbuka + tutup dengan Escape.
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-red-900/25 px-4 py-1.5 text-xs font-medium text-red-900 transition-colors hover:border-red-900/60">
        Hapus
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-6" onClick={() => !busy && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-sm rounded-lg bg-paper p-6" onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-title" className="font-display text-xl text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button ref={cancelRef} type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded-full border border-navy/20 px-5 py-2 text-sm text-navy disabled:opacity-50">Batal</button>
              <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await onOk(); } finally { setOpen(false); setBusy(false); } }} className="rounded-full bg-red-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "Menghapus…" : confirm ?? "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
