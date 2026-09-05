"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/auth/session", { method: "DELETE" });
        } finally {
          router.push("/admin/login");
          router.refresh();
        }
      }}
      className="rounded-full border border-cream/25 px-4 py-2 text-cream/80 transition-colors hover:border-cream/60 hover:text-cream disabled:opacity-50"
    >
      {busy ? "Keluar…" : "Keluar"}
    </button>
  );
}
