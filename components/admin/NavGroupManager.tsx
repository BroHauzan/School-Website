"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "./Field";
import { slugifyHalaman, type NavGroupsItem } from "@/lib/halaman-schema";

/** Buat kunci unik dari label (dipakai sebagai id grup, tak terlihat admin). */
function kunciUnik(label: string, taken: Set<string>): string {
  const base = slugifyHalaman(label) || "menu";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Kelola kelompok menu (menu induk) di navbar publik: tambah, ubah nama,
 * urutkan, dan hapus. Halaman tidak pernah ikut terhapus — halaman yang
 * memakai grup terhapus tetap tampil di navbar sebagai dropdown yatim
 * dengan label otomatis dari groupKey (lihat buildPublicNav).
 */
export function NavGroupManager({
  initial,
  usage,
}: {
  initial: NavGroupsItem[];
  /** groupKey → jumlah halaman yang memakainya. */
  usage: Record<string, number>;
}) {
  const router = useRouter();
  const [items, setItems] = useState<NavGroupsItem[]>(initial);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [hapusConfirm, setHapusConfirm] = useState<string | null>(null);

  const urut = useMemo(
    () => [...items].sort((a, b) => a.urutan - b.urutan || a.label.localeCompare(b.label)),
    [items],
  );

  /** Susun ulang urutan jadi 0,1,2,... sesuai urutan tampil saat ini. */
  function rapatkan(list: NavGroupsItem[]): NavGroupsItem[] {
    return [...list]
      .sort((a, b) => a.urutan - b.urutan || a.label.localeCompare(b.label))
      .map((g, i) => ({ ...g, urutan: i }));
  }

  async function simpan(next: NavGroupsItem[]): Promise<boolean> {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    const rapi = rapatkan(next);
    const prev = items;
    setItems(rapi);
    try {
      const res = await fetch("/api/nav-groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rapi }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan menu.");
      setNotice("Menu tersimpan dan langsung dipakai di website.");
      router.refresh();
      return true;
    } catch (e) {
      setItems(prev);
      const msg =
        e instanceof TypeError
          ? "Koneksi terputus — menu belum tersimpan. Periksa internet lalu coba lagi."
          : e instanceof Error
            ? e.message
            : "Gagal menyimpan menu.";
      setError(msg);
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function tambah() {
    if (busyRef.current) return;
    const label = newLabel.trim();
    if (label.length < 2) {
      setError("Nama menu minimal 2 karakter.");
      return;
    }
    if (items.some((g) => g.label.trim().toLowerCase() === label.toLowerCase())) {
      setError(`Menu “${label}” sudah ada. Pakai nama lain.`);
      return;
    }
    const taken = new Set(items.map((g) => g.groupKey));
    const groupKey = kunciUnik(label, taken);
    void simpan([...items, { groupKey, label, urutan: items.length }]).then((ok) => {
      if (ok) setNewLabel("");
    });
  }

  function geser(groupKey: string, arah: -1 | 1) {
    if (busyRef.current) return;
    const list = [...urut];
    const i = list.findIndex((g) => g.groupKey === groupKey);
    const j = i + arah;
    if (i < 0 || j < 0 || j >= list.length) return;
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
    void simpan(list.map((g, idx) => ({ ...g, urutan: idx })));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-navy/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Kelompok menu</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Kelompok menu dipakai untuk menggabungkan beberapa halaman di bawah satu menu di website, misalnya
          “Akademik” berisi “Kurikulum” dan “Ekstrakurikuler”. Urutan kecil tampil lebih dulu.
        </p>

        {error ? (
          <p role="alert" className="mt-4 rounded-lg border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="mt-4 rounded-lg border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </p>
        ) : null}

        {urut.length === 0 ? (
          <p className="mt-6 rounded-lg border border-navy/10 bg-cream px-4 py-6 text-center text-sm text-muted">
            Belum ada kelompok menu. Tambahkan satu di bawah ini, lalu pilih di halaman lewat “Menu induk”.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-navy/10 rounded-lg border border-navy/10">
            {urut.map((g, i) => {
              const dipakai = usage[g.groupKey] ?? 0;
              return (
                <li key={g.groupKey} className="flex flex-wrap items-center gap-3 px-4 py-4">
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      disabled={busy || i === 0}
                      onClick={() => geser(g.groupKey, -1)}
                      aria-label={`Naikkan urutan ${g.label}`}
                      className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy transition-colors hover:border-navy/50 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={busy || i === urut.length - 1}
                      onClick={() => geser(g.groupKey, 1)}
                      aria-label={`Turunkan urutan ${g.label}`}
                      className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy transition-colors hover:border-navy/50 disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="sr-only" htmlFor={`grup-${g.groupKey}`}>
                      Nama menu
                    </label>
                    <input
                      id={`grup-${g.groupKey}`}
                      defaultValue={g.label}
                      disabled={busy}
                      onBlur={(e) => {
                        const label = e.target.value.trim();
                        if (!label || label === g.label) {
                          e.target.value = g.label;
                          return;
                        }
                        void simpan(items.map((it) => (it.groupKey === g.groupKey ? { ...it, label } : it)));
                      }}
                      className={inputCls}
                    />
                    <p className="mt-2 text-xs text-muted">
                      Urutan #{g.urutan} · {dipakai > 0 ? `${dipakai} halaman memakainya` : "belum dipakai halaman"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {hapusConfirm === g.groupKey ? (
                      <div role="alert" className="max-w-60 rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                        <p className="font-semibold">
                          Hapus menu “{g.label}”?
                        </p>
                        <p className="mt-1">
                          {dipakai > 0
                            ? `${dipakai} halaman memakainya — halaman tetap tampil di navbar dengan nama otomatis, label khusus hilang.`
                            : "Menu ini belum dipakai halaman mana pun."}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setHapusConfirm(null);
                              void simpan(items.filter((it) => it.groupKey !== g.groupKey));
                            }}
                            className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Ya, hapus
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setHapusConfirm(null)}
                            className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy disabled:opacity-50"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setHapusConfirm(g.groupKey)}
                        className="rounded-full border border-red-900/25 px-4 py-1.5 text-xs font-medium text-red-900 transition-colors hover:border-red-900/60 disabled:opacity-40"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8 border-t border-navy/10 pt-6">
          <Field label="Tambah kelompok menu" htmlFor="grup-baru" hint="Contoh: Akademik, Profil, Kesiswaan.">
            <div className="flex flex-wrap gap-3">
              <input
                id="grup-baru"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    tambah();
                  }
                }}
                placeholder="Nama kelompok menu"
                className={`${inputCls} max-w-sm`}
              />
              <button
                type="button"
                disabled={busy}
                onClick={tambah}
                data-tour="menu-simpan-grup"
                className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-50"
              >
                {busy ? "Menyimpan…" : "Tambah menu"}
              </button>
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
