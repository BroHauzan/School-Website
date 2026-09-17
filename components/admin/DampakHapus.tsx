"use client";

import { useEffect, useState } from "react";
import type { PeringatanHalaman } from "@/lib/dampak-navigasi";

/**
 * Panel dampak di dalam dialog konfirmasi hapus halaman.
 *
 * Menampilkan apa yang akan rusak di website publik: tombol di halaman lain
 * yang menunjuk ke sini, dan menu induk yang kehilangan seluruh isinya.
 * Sengaja ditulis sebagai peringatan biasa (bukan penghalang) supaya admin
 * awam paham dan bisa memutuskan sendiri. (QA 2.1, 2.3)
 */
export function DampakHapus({ id }: { id: string }) {
  // Data disimpan bersama id pemiliknya; komponen hanya menampilkan hasil yang
  // cocok dengan `id` sekarang, jadi tidak perlu reset state di effect.
  const [hasil, setHasil] = useState<{ id: string; data: PeringatanHalaman } | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let batal = false;
    fetch(`/api/halaman/${id}/dampak`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("gagal"))))
      .then((json: { data?: PeringatanHalaman }) => {
        if (!batal) setHasil({ id, data: json.data ?? { menu: null, ditautOleh: [] } });
      })
      .catch(() => {
        // Peringatan bersifat informatif — kalau gagal dimuat, jangan halangi admin.
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
  }, [id]);

  if (gagal)
    return (
      <p role="alert" className="mt-4 rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-xs text-red-900">
        Dampak ke menu &amp; tautan tidak bisa diperiksa (koneksi gagal). Lanjutkan hati-hati — tombol di
        halaman lain bisa jadi tautan mati.
      </p>
    );

  const data = hasil?.id === id ? hasil.data : null;
  if (!data) {
    return <p className="mt-4 text-xs text-muted">Memeriksa dampak ke menu &amp; tautan…</p>;
  }

  // Kumpulkan temuan per halaman — satu halaman bisa punya beberapa tombol.
  const perHalaman = new Map<string, { judul: string; label: string[] }>();
  for (const t of data.ditautOleh) {
    const cur = perHalaman.get(t.id);
    if (cur) cur.label.push(t.label);
    else perHalaman.set(t.id, { judul: t.judul, label: [t.label] });
  }

  if (perHalaman.size === 0 && !data.menu?.menuHilang) return null;

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {perHalaman.size > 0 ? (
        <div>
          <p className="font-semibold">Tautan di halaman lain akan mati</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-relaxed">
            {[...perHalaman.values()].map((h) => (
              <li key={h.judul}>
                Halaman <span className="font-medium">“{h.judul}”</span> — tombol{" "}
                {h.label.map((l) => `“${l}”`).join(", ")}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">
            Buka halaman tersebut dan ubah/hapus tombolnya dulu agar pengunjung tidak
            menemui alamat kosong.
          </p>
        </div>
      ) : null}

      {data.menu?.menuHilang ? (
        <div>
          <p className="font-semibold">Menu “{data.menu.label}” akan hilang dari navbar</p>
          <p className="mt-1 text-xs leading-relaxed">
            Halaman ini satu-satunya isi menu tersebut, jadi menunya tidak akan tampil lagi
            di website. Pindahkan halaman lain ke menu ini, atau biarkan kalau memang
            menunya sudah tidak dipakai.
          </p>
        </div>
      ) : null}

      {data.menu && !data.menu.menuHilang && perHalaman.size === 0 ? null : (
        <p className="text-xs text-amber-800">
          Website publik akan berubah setelah Anda menekan tombol di bawah.
        </p>
      )}
    </div>
  );
}
