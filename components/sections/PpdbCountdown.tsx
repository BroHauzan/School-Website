"use client";

import { useEffect, useState } from "react";
import { getPpdbStatus, type PpdbStatus, formatIsoDay } from "@/lib/school";

export function PpdbCountdown() {
  const [status, setStatus] = useState<PpdbStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getPpdbStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!status || status.state === "unverified") {
    return (
      <div className="rounded-lg border border-navy/10 bg-cream p-6 text-center text-sm text-muted">
        Jadwal PPDB 2026/2027 menunggu pengumuman resmi Dinas Pendidikan.
      </div>
    );
  }

  if (status.state === "closed") {
    return (
      <div className="rounded-lg border border-navy/10 bg-cream p-6 text-center text-sm text-muted">
        Pendaftaran PPDB telah ditutup.
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-navy/10 bg-cream p-6"
      aria-live="polite"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy/60">
          {status.state === "open" ? "Pendaftaran Sedang Berjalan" : "Pendaftaran Dibuka"}
        </p>
        <h3 className="mt-1 font-display text-lg text-navy">{status.label}</h3>
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-navy">
          {status.state === "open" ? status.days : status.days}
          <span className="ml-1 text-sm font-medium text-navy/60">hari</span>
        </p>
        <p className="mt-1 text-xs text-navy/60">
          {status.state === "open" ? "sampai ditutup" : "sampai dibuka"} &middot; {formatIsoDay(status.date)}
        </p>
      </div>
    </div>
  );
}
