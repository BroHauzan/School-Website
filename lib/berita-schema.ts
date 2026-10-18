export type BeritaDoc = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  image: string;
  body: string[];
  featured?: boolean;
  published?: boolean;
  status?: "draft" | "published" | string;
  dateISO: string;
  dateLabel: string;
  createdAt: string;
  updatedAt: string;
};

export const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 80) || "berita";
}

export function formatTanggalID(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Tanggal ISO hari ini menurut jam dinding WIB (bukan UTC). */
export function todayISO(): string {
  const now = new Date();
  const wib = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60_000);
  const m = String(wib.getMonth() + 1).padStart(2, "0");
  const d = String(wib.getDate()).padStart(2, "0");
  return `${wib.getFullYear()}-${m}-${d}`;
}

export function validateBerita(input: Record<string, unknown>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const str = (k: string) => String(input[k] ?? "").trim();
  if (str("title").length < 8) errors.push("Judul minimal 8 karakter.");
  if (str("title").length > 160) errors.push("Judul maksimal 160 karakter.");
  if (str("excerpt").length < 20) errors.push("Ringkasan minimal 20 karakter.");
  if (str("excerpt").length > 300) errors.push("Ringkasan maksimal 300 karakter.");
  if (!str("tag")) errors.push("Tag wajib diisi.");
  const body = input.body;
  const paras = Array.isArray(body)
    ? body.map((p) => String(p).trim()).filter(Boolean)
    : typeof body === "string" && body.trim()
    ? body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];
  if (paras.length === 0) errors.push("Isi berita minimal 1 paragraf.");
  const iso = str("dateISO") || str("date");
  if (iso && isNaN(new Date(iso).getTime())) errors.push("Tanggal tidak valid.");
  const img = str("image");
  if (img && !/^\/(?!\/)/.test(img) && !/^https:\/\/(res\.cloudinary\.com|firebasestorage\.googleapis\.com|storage\.googleapis\.com)\//.test(img)) {
    errors.push("URL gambar harus path lokal atau https dari res.cloudinary.com / Firebase Storage.");
  }
  if (/[<>]/.test(str("title") + str("excerpt") + str("tag"))) errors.push("Judul, ringkasan, dan tag tidak boleh mengandung karakter < atau >.");
  const bodyRaw = Array.isArray(body)
    ? body.map((p) => String(p)).join(" ")
    : typeof body === "string"
    ? body
    : "";
  if (/[<>]/.test(bodyRaw)) errors.push("Isi berita tidak boleh mengandung karakter < atau >.");
  return { ok: errors.length === 0, errors };
}

export function normalizeBeritaInput(input: Record<string, unknown>, existing?: Partial<BeritaDoc>): Omit<BeritaDoc, "id" | "createdAt" | "updatedAt"> & { dateISO: string } {
  const title = String(input.title ?? existing?.title ?? "").trim();
  const slugRaw = String(input.slug ?? existing?.slug ?? "").trim();
  const slug = slugify(slugRaw || title);
  const dateISO = String(input.dateISO ?? input.date ?? existing?.dateISO ?? todayISO()).slice(0, 10);
  const body = Array.isArray(input.body)
    ? (input.body as unknown[]).map((p) => String(p).trim()).filter(Boolean)
    : typeof input.body === "string" && input.body.trim()
    ? input.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : (existing?.body ?? []);

  let published: boolean;
  if (input.published !== undefined) {
    published = Boolean(input.published);
  } else if (input.status !== undefined) {
    published = String(input.status).toLowerCase() === "published";
  } else if (existing?.published !== undefined) {
    published = existing.published;
  } else {
    published = true;
  }

  const status = input.status !== undefined
    ? String(input.status)
    : (published ? "published" : "draft");

  return {
    slug,
    title,
    excerpt: String(input.excerpt ?? existing?.excerpt ?? "").trim(),
    tag: String(input.tag ?? existing?.tag ?? "").trim(),
    image: String(input.image ?? existing?.image ?? "/hero-school.webp").trim() || "/hero-school.webp",
    body,
    featured: Boolean(input.featured ?? existing?.featured ?? false),
    published,
    status,
    dateISO,
    dateLabel: formatTanggalID(dateISO),
  };
}

export type BeritaInputSchemaResult =
  | { success: true; ok: true; data: Record<string, unknown>; errors?: never; error?: never }
  | { success: false; ok: false; error: { message: string; errors: string[] }; errors: string[]; data?: never };

export function beritaInputSchema(input: unknown) {
  return validateBerita(input as Record<string, unknown>);
}

beritaInputSchema.validate = validateBerita;
beritaInputSchema.safeParse = (input: unknown): BeritaInputSchemaResult => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const errors = ["Body payload harus berupa objek JSON."];
    return {
      success: false,
      ok: false,
      error: { message: errors[0], errors },
      errors,
    };
  }
  const check = validateBerita(input as Record<string, unknown>);
  if (!check.ok) {
    return {
      success: false,
      ok: false,
      error: {
        message: check.errors.join("; "),
        errors: check.errors,
      },
      errors: check.errors,
    };
  }
  return {
    success: true,
    ok: true,
    data: input as Record<string, unknown>,
  };
};

beritaInputSchema.parse = (input: unknown): Record<string, unknown> => {
  const res = beritaInputSchema.safeParse(input);
  if (!res.success) {
    const err = new Error(res.error.message);
    (err as unknown as { errors: string[] }).errors = res.error.errors;
    throw err;
  }
  return res.data;
};
