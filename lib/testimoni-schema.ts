export type TestimoniDoc = {
  id: string;
  /** Isi kutipan, 10-500 karakter. */
  quote: string;
  /** Nama lengkap siswa/alumni/guru. */
  name: string;
  /** Peran, mis. "Siswa, angkatan 64" atau "Alumni 2012". */
  role: string;
  /** Urutan tampil di carousel (kecil = lebih depan). */
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TestimoniFormValue = Omit<TestimoniDoc, "id" | "createdAt" | "updatedAt">;

export function validateTestimoni(
  input: Record<string, unknown>,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const str = (k: string) => String(input[k] ?? "").trim();
  const quote = str("quote");
  const name = str("name");
  const role = str("role");
  if (quote.length < 10) errors.push("Kutipan minimal 10 karakter.");
  if (quote.length > 500) errors.push("Kutipan maksimal 500 karakter.");
  if (name.length < 3) errors.push("Nama minimal 3 karakter.");
  if (name.length > 100) errors.push("Nama maksimal 100 karakter.");
  if (role.length < 2) errors.push("Peran minimal 2 karakter, mis. \"Siswa, angkatan 64\".");
  if (role.length > 60) errors.push("Peran maksimal 60 karakter.");
  const order = Number(input.order);
  if (!Number.isFinite(order) || order < 0 || order > 9999 || !Number.isInteger(order))
    errors.push("Urutan harus angka bulat 0\u20139999.");
  if (/[<>]/.test(quote + name + role))
    errors.push("Kutipan, nama, dan peran tidak boleh mengandung karakter < atau >.");
  return { ok: errors.length === 0, errors };
}

export function normalizeTestimoniInput(
  input: Record<string, unknown>,
  existing?: Partial<TestimoniDoc>,
): Omit<TestimoniDoc, "id" | "createdAt" | "updatedAt"> {
  const orderRaw = Number(input.order ?? existing?.order ?? 0);
  return {
    quote: String(input.quote ?? existing?.quote ?? "").trim(),
    name: String(input.name ?? existing?.name ?? "").trim(),
    role: String(input.role ?? existing?.role ?? "").trim(),
    order: Number.isFinite(orderRaw) && orderRaw >= 0 ? Math.min(Math.trunc(orderRaw), 9999) : 0,
    published:
      input.published === undefined
        ? (existing?.published ?? true)
        : Boolean(input.published),
  };
}
