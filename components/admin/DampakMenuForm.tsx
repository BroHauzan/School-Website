"use client";

import { useEffect, useState } from "react";
import type { PeringatanHalaman } from "@/lib/dampak-navigasi";

type Saran = { judul: string; alamat: string };

/**
 * Peringatan di form halaman saat halaman ini berhenti tayang di menu
 * (di-unpublish / "Tampil di menu" dimatikan). Menjelaskan menu mana yang
 * kehilangan halaman ini, dengan tautan langsung ke halaman lain di menu yang
 * sama untuk memindahkan fokus menu. (QA 2.3)
 *
 * `aktif` = perubahan yang belum disimpan membuat halaman ini keluar dari
 * navbar. Server tetap jadi penentu akhir; komponen ini murni informasi.
 */
export function DampakMenuForm({
  id,
  aktif,
  alamatSekarang,
}: {
  /** Kosong saat halaman baru — dampak belum bisa dihitung. */
  id?: string;
  aktif: boolean;
  /** Alamat halaman ini, untuk dicocokkan saat mencari halaman penaut. */
  alamatSekarang: string;
}) {
  // Menyertakan `aktif` dalam kunci membuat data usang hilang sendiri saat
  // kondisi berubah — tanpa perlu reset state di dalam effect.
  const kunci = !aktif || !id ? null : `${id}|${alamatSekarang}`;
  const [hasil, setHasil] = useState<{ kunci: string; data: PeringatanHalaman } | null>(null);

  useEffect(() => {
    if (!kunci) return;
    let batal = false;
    const [dokId] = kunci.split("|");
    fetch(`/api/halaman/${dokId}/dampak`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("gagal"))))
      .then((json: { data?: PeringatanHalaman }) => {
        // Peringatan bersifat informatif — jangan halangi admin kalau gagal.
        if (!batal) setHasil({ kunci, data: json.data ?? { menu: null, ditautOleh: [] } });
      })
      .catch(() => {
        if (!batal) setHasil(null);
      });
    return () => {
      batal = true;
    };
  }, [kunci]);

  const data = hasil && hasil.kunci === kunci ? hasil.data : null;
  if (!kunci || !data) return null;

  const menu = data.menu;
  const penaut = data.ditautOleh;
  if (!menu && penaut.length === 0) return null;

  const labelPenaut = [
    ...new Set(penaut.map((t) => `${t.judul} (tombol “${t.label}”)`)),
  ];

  const saran: Saran[] = data.ditautOleh.map((t) => ({
    judul: t.judul,
    alamat: `/admin/halaman/${t.id}/ubah`,
  }));

  return (
    <div
      role="status"
      className="mt-3 space-y-2 rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"
    >
      {menu ? (
        <p>
          <span className="font-semibold">Halaman ini tidak akan tampil di menu “{menu.label}”.</span>{" "}
          {menu.menuHilang
            ? "Karena ini satu-satunya isi menu tersebut, menunya akan hilang dari navbar website."
            : `Menu “${menu.label}” tetap ada dengan ${menu.sisaAnggota} halaman lain.`}
        </p>
      ) : null}

      {labelPenaut.length > 0 ? (
        <p>
          <span className="font-semibold">Tautan yang menunjuk halaman ini akan mati:</span>{" "}
          {labelPenaut.join(", ")}.
          {saran.length > 0 ? (
            <>
              {" "}
              Buka{" "}
              {saran.map((s, i) => (
                <span key={s.alamat}>
                  {i > 0 ? ", " : ""}
                  <a className="underline" href={s.alamat}>
                    {s.judul}
                  </a>
                </span>
              ))}{" "}
              untuk menyesuaikan tombolnya.
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
