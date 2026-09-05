export type GaleriDoc = {
  id: string;
  caption: string;
  src: string;
  wide: boolean;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export function validateGaleri(input: Record<string, unknown>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const str = (k: string) => String(input[k] ?? "").trim();
  if (str("caption").length < 3) errors.push("Caption minimal 3 karakter.");
  if (str("caption").length > 160) errors.push("Caption maksimal 160 karakter.");
  const src = str("src");
  if (!src) errors.push("Gambar wajib diisi.");
  else if (!/^\/(?!\/)/.test(src) && !/^https:\/\/(res\.cloudinary\.com|firebasestorage\.googleapis\.com|storage\.googleapis\.com)\//.test(src)) {
    errors.push("URL gambar harus path lokal atau https dari res.cloudinary.com / Firebase Storage.");
  }
  const order = Number(input.order);
  if (input.order !== undefined && (!Number.isFinite(order) || order < 0 || order > 9999)) {
    errors.push("Urutan harus angka 0–9999.");
  }
  return { ok: errors.length === 0, errors };
}

export function normalizeGaleriInput(
  input: Record<string, unknown>,
  existing?: Partial<GaleriDoc>,
): Omit<GaleriDoc, "id" | "createdAt" | "updatedAt"> {
  const orderRaw = input.order ?? existing?.order ?? 0;
  const orderNum = Number(orderRaw);
  return {
    caption: String(input.caption ?? existing?.caption ?? "").trim(),
    src: String(input.src ?? existing?.src ?? "").trim(),
    wide: Boolean(input.wide ?? existing?.wide ?? false),
    order: Number.isFinite(orderNum) ? Math.round(orderNum) : 0,
    published: input.published === undefined ? (existing?.published ?? true) : Boolean(input.published),
  };
}
