/**
 * Helper error API terpusat.
 * - Status < 500 (400/401/403/404): pesan asli boleh ke klien (validasi, auth).
 * - Status >= 500: JANGAN bocorkan e.message (bisa berisi path, project ID,
 *   potongan private key error, dsb) — ganti pesan generik + log server.
 */
export function errMsg(
  e: unknown,
  fallback = "Terjadi kesalahan pada server."
): { message: string; status: number } {
  const raw = (e as { status?: number } | null)?.status;
  const status =
    typeof raw === "number" && Number.isInteger(raw) && raw >= 400 && raw <= 599
      ? raw
      : 500;
  if (status >= 500) {
    console.error("[api] internal error:", e);
    return { message: fallback, status };
  }
  const message = e instanceof Error && e.message ? e.message : fallback;
  return { message, status };
}
