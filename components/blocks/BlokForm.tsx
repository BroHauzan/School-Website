"use client";

import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Blok } from "@/lib/halaman-schema";
import { BLOK_VARIAN, MAX_ITEM_BLOK, MAX_TEKS_BLOK, SPACER_TINGGI_OPTIONS } from "./blok-meta";
import { BlockField, BlockInput, BlockSelect, BlockTextarea } from "./BlockField";
import { BlockItemList } from "./BlockItemList";

/** Opsi `varian` untuk tipe tertentu (kosong = tipe tanpa varian). */
export function VarianSelect({
  blok,
  onChange,
  id,
}: {
  blok: Blok;
  onChange: (patch: Partial<Blok>) => void;
  id: string;
}) {
  const opsi = BLOK_VARIAN[blok.tipe];
  if (opsi.length === 0) return null;
  return (
    <BlockField label="Tampilan" htmlFor={id} hint="Pilih gaya tampil yang paling cocok. Desainnya sudah disesuaikan otomatis.">
      <BlockSelect id={id} value={blok.varian ?? opsi[0].value} onChange={(e) => onChange({ varian: e.target.value })}>
        {opsi.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </BlockSelect>
    </BlockField>
  );
}

/**
 * Form field per tipe blok. Hanya menampilkan field yang relevan dengan
 * `blok.tipe` — admin tidak pernah melihat (apalagi menulis) HTML/CSS.
 */
export function BlokForm({
  blok,
  onChange,
  idPrefix,
}: {
  blok: Blok;
  onChange: (patch: Partial<Blok>) => void;
  idPrefix: string;
}) {
  const id = (nama: string) => `${idPrefix}-${nama}`;

  switch (blok.tipe) {
    case "paragraf":
      return (
        <BlockField label="Tulisan" htmlFor={id("teks")} hint="Tulis isi paragraf di sini.">
          <BlockTextarea
            id={id("teks")}
            rows={5}
            maxLength={MAX_TEKS_BLOK}
            value={blok.teks ?? ""}
            onChange={(e) => onChange({ teks: e.target.value })}
            placeholder="Tulis isi paragraf…"
          />
        </BlockField>
      );

    case "heading":
      return (
        <div className="grid gap-6 sm:grid-cols-[1fr_200px]">
          <BlockField label="Judul" htmlFor={id("teks")} hint="Judul singkat untuk membuka sebuah bagian.">
            <BlockInput
              id={id("teks")}
              maxLength={MAX_TEKS_BLOK}
              value={blok.teks ?? ""}
              onChange={(e) => onChange({ teks: e.target.value })}
              placeholder="Contoh: Kegiatan Siswa"
            />
          </BlockField>
          <BlockField label="Ukuran" htmlFor={id("level")} hint="Besar untuk judul utama.">
            <BlockSelect
              id={id("level")}
              value={String(blok.level ?? 2)}
              onChange={(e) => onChange({ level: Number(e.target.value) as 2 | 3 | 4 })}
            >
              <option value="2">Besar</option>
              <option value="3">Sedang</option>
              <option value="4">Kecil</option>
            </BlockSelect>
          </BlockField>
        </div>
      );

    case "gambar":
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <BlockField label="Keterangan foto" htmlFor={id("caption")} hint="Muncul kecil di bawah foto. Boleh dikosongkan.">
              <BlockInput
                id={id("caption")}
                value={blok.caption ?? ""}
                onChange={(e) => onChange({ caption: e.target.value })}
                placeholder="Contoh: Gedung utama sekolah"
              />
            </BlockField>
            <BlockField label="Tulisan pengganti" htmlFor={id("alt")} hint="Dibacakan untuk pembaca layar bila foto gagal tampil.">
              <BlockInput
                id={id("alt")}
                value={blok.alt ?? ""}
                onChange={(e) => onChange({ alt: e.target.value })}
                placeholder="Contoh: Siswa berbaris di lapangan"
              />
            </BlockField>
            <VarianSelect blok={blok} onChange={onChange} id={id("varian")} />
          </div>
          <div className="rounded-lg border border-navy/10 bg-cream p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-navy-muted">Foto</p>
            <ImageUploadField
              value={blok.src ?? ""}
              onChange={(url) => onChange({ src: url })}
              uploadUrl="/api/galeri/upload"
              previewAlt="Pratinjau foto blok"
            />
          </div>
        </div>
      );

    case "galeri":
      return (
        <div className="space-y-6">
          <VarianSelect blok={blok} onChange={onChange} id={id("varian")} />
          <BlockItemList
            mode="galeri"
            items={blok.items ?? []}
            onChange={(items) => onChange({ items })}
            max={MAX_ITEM_BLOK}
            label="Daftar foto"
          />
        </div>
      );

    case "tombol":
      return (
        <div className="grid gap-6 sm:grid-cols-2">
          <BlockField label="Tulisan tombol" htmlFor={id("teks")} hint="Singkat, mis. “Selengkapnya”.">
            <BlockInput
              id={id("teks")}
              value={blok.teks ?? ""}
              onChange={(e) => onChange({ teks: e.target.value })}
              placeholder="Selengkapnya"
            />
          </BlockField>
          <BlockField label="Tujuan tautan" htmlFor={id("href")} hint="Alamat halaman di situs ini (mulai dengan /) atau alamat lengkap yang dimulai https://">
            <BlockInput
              id={id("href")}
              value={blok.href ?? ""}
              onChange={(e) => onChange({ href: e.target.value })}
              placeholder="/ppdb atau https://…"
              className="font-mono text-xs"
            />
          </BlockField>
          <div className="sm:col-span-2">
            <VarianSelect blok={blok} onChange={onChange} id={id("varian")} />
          </div>
        </div>
      );

    case "video":
      return (
        <div className="space-y-6">
          <BlockField
            label="Alamat video"
            htmlFor={id("src")}
            hint="Tempel tautan dari YouTube atau Vimeo. Video lain belum didukung."
          >
            <BlockInput
              id={id("src")}
              value={blok.src ?? ""}
              onChange={(e) => onChange({ src: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=…"
              className="font-mono text-xs"
            />
          </BlockField>
          <BlockField label="Keterangan" htmlFor={id("caption")} hint="Muncul kecil di bawah video. Boleh dikosongkan.">
            <BlockInput
              id={id("caption")}
              value={blok.caption ?? ""}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Contoh: Profil sekolah 2026"
            />
          </BlockField>
        </div>
      );

    case "divider":
      return (
        <p className="rounded-lg border border-navy/10 bg-cream px-4 py-3 text-sm text-muted">
          Blok ini hanya menampilkan garis pemisah. Tidak ada yang perlu diatur.
        </p>
      );

    case "spacer":
      return (
        <BlockField label="Tinggi jarak" htmlFor={id("tinggi")} hint="Semakin besar, semakin longgar jarak antar bagian.">
          <BlockSelect
            id={id("tinggi")}
            value={blok.tinggi ?? "sedang"}
            onChange={(e) => onChange({ tinggi: e.target.value as Blok["tinggi"] })}
          >
            {SPACER_TINGGI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </BlockSelect>
        </BlockField>
      );

    case "kutipan":
      return (
        <BlockField label="Kutipan" htmlFor={id("teks")} hint="Kata-kata penting, ditampilkan miring.">
          <BlockTextarea
            id={id("teks")}
            rows={3}
            maxLength={MAX_TEKS_BLOK}
            value={blok.teks ?? ""}
            onChange={(e) => onChange({ teks: e.target.value })}
            placeholder="Tulis kutipan…"
          />
        </BlockField>
      );

    case "daftar":
      return (
        <BlockItemList
          mode="daftar"
          items={blok.items ?? []}
          onChange={(items) => onChange({ items })}
          max={MAX_ITEM_BLOK}
          label="Isi daftar"
        />
      );

    default:
      return null;
  }
}
