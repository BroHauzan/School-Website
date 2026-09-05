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
  dateISO: string;
  dateLabel: string;
  createdAt: string;
  updatedAt: string;
};

const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 80) || "berita";
}

export function formatTanggalID(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
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
  const paras = Array.isArray(body) ? body.map((p) => String(p).trim()).filter(Boolean) : [];
  if (paras.length === 0) errors.push("Isi berita minimal 1 paragraf.");
  const iso = str("dateISO") || str("date");
  if (iso && isNaN(new Date(iso).getTime())) errors.push("Tanggal tidak valid.");
  const img = str("image");
  if (img && !/^(\/|https?:\/\/)/.test(img)) errors.push("URL gambar tidak valid.");
  return { ok: errors.length === 0, errors };
}

export function normalizeBeritaInput(input: Record<string, unknown>, existing?: Partial<BeritaDoc>): Omit<BeritaDoc, "id" | "createdAt" | "updatedAt"> & { dateISO: string } {
  const title = String(input.title ?? existing?.title ?? "").trim();
  const slugRaw = String(input.slug ?? existing?.slug ?? "").trim();
  const slug = slugify(slugRaw || title);
  const dateISO = String(input.dateISO ?? input.date ?? existing?.dateISO ?? todayISO()).slice(0, 10);
  const body = Array.isArray(input.body)
    ? (input.body as unknown[]).map((p) => String(p).trim()).filter(Boolean)
    : (existing?.body ?? []);
  return {
    slug,
    title,
    excerpt: String(input.excerpt ?? existing?.excerpt ?? "").trim(),
    tag: String(input.tag ?? existing?.tag ?? "").trim(),
    image: String(input.image ?? existing?.image ?? "/hero-school.webp").trim() || "/hero-school.webp",
    body,
    featured: Boolean(input.featured ?? existing?.featured ?? false),
    published: input.published === undefined ? (existing?.published ?? true) : Boolean(input.published),
    dateISO,
    dateLabel: formatTanggalID(dateISO),
  };
}
