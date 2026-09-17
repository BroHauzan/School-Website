# QA Checklist: Chaos Testing Admin Panel Sebelum Handoff

Tujuan: memastikan admin panel tahan dari kesalahan pemakaian oleh admin awam (non-coder) sebelum diserahkan ke sekolah. Checklist ini dijalankan **sebelum** handoff, idealnya oleh developer + 1 orang yang belum pernah lihat sistemnya sama sekali.

Cara pakai: centang tiap item, isi kolom **Hasil** (Lolos / Gagal / Perlu Perbaikan), catat detail di **Catatan** kalau ada bug.

Hasil di bawah ini dari audit kode 4 sub-agent + perbaikan langsung (16 Sep 2026).

---

## 1. Menu & Grouping

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 1.1 | Hapus kelompok menu yang masih dipakai beberapa halaman (misal "Profil" dengan 5 halaman) — cek apakah halamannya ilang dari navbar, jadi 404, atau otomatis fallback ke "berdiri sendiri" | Perlu Perbaikan → Diperbaiki | Semula: hapus 1 klik tanpa konfirmasi (`NavGroupManager.tsx:181`), halaman jadi yatim (dropdown label otomatis, bukan standalone). Sudah diperbaiki: konfirmasi 2 langkah tampilkan `usage`, komentar diluruskan, `usage` kini hitung yang tayang saja (`menu/page.tsx`). |
| 1.2 | Buat 2 kelompok menu dengan angka urutan yang sama — cek urutan tampil di navbar konsisten atau acak | Lolos | `rapatkan()` + `normalizeItems` sort `urutan + label` deterministik. Ditambah tiebreak yang sama di `nav-public.ts` agar tidak bergantung stabilitas sort. |
| 1.3 | Ganti nama kelompok menu yang sedang dipakai banyak halaman, sambil tab lain juga membuka halaman edit yang terkait — cek ada konflik data atau tidak | Lolos | Rename hanya ubah `label` (relasi via `groupKey`), form halaman punya optimistic lock `expectedUpdatedAt`. Catatan: PUT nav-groups tetap last-write-wins (diterima, risiko rendah). |
| 1.4 | Buat kelompok menu kosong (0 halaman) — cek apakah tetap muncul di navbar publik sebagai menu kosong yang bisa diklik | Lolos | Grup kosong di-skip `nav-public.ts:83-84`, tidak muncul di navbar. Tambahan fix: `[]` yang disengaja kini dihormati (dulu bangkit jadi default). |

## 2. Page CRUD

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 2.1 | Hapus halaman yang jadi target link dari blok Tombol/CTA di halaman lain — cek link jadi broken atau ada penanganan (warning/redirect) | Gagal → Diperbaiki | Akar: `alamatPublik()` hitung `/slug` padahal URL real `/halaman/slug`, proteksi 409 mati total. Diperbaiki: `alamatPublik`/`hrefOf` sadar `systemPath`, tambah `normalisasiHref` (strip query/hash/trailing slash). `DampakHapus` gagal fetch kini tampilkan warning, bukan hilang diam-diam. |
| 2.2 | Buat 2 halaman dengan alamat/slug yang sama atau mirip banget — cek sistem mencegah bentrok atau malah menimpa | Perlu Perbaikan → Diperbaiki | Tidak menimpa (auto-suffix), tapi suffix diam-diam. Diperbaiki: toast/banner tampilkan URL final eksplisit ("sudah dipakai, disimpan sebagai /halaman/X"). |
| 2.3 | Unpublish (draft) halaman yang masih jadi bagian menu induk aktif — cek apakah tetap muncul di navbar tapi 404 saat diklik | Perlu Perbaikan → Diperbaiki | Perilaku benar (hilang dari navbar + 404), tapi warning non-blocking. Diperbaiki: wajib centang "Saya paham halaman ini akan hilang dari menu" bila `keluarDariNavbar` sebelum simpan. |
| 2.4 | Coba hapus halaman "bawaan" (yang alamatnya tidak bisa diganti) — pastikan tombol hapus benar-benar ter-disable, bukan cuma disembunyikan | Gagal → Diperbaiki | Semula tombol Hapus aktif dan me-wipe isi. Diperbaiki: tombol Hapus `disabled` + tooltip, aksi dipisah jadi "Kosongkan isi" (amber, bukan merah) dengan riwayat tetap tersimpan. |

## 3. Block Editor

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 3.1 | Sisip/edit blok tanpa save, lalu refresh atau tekan tombol back browser — cek data hilang atau ter-recover sebagai draft | Perlu Perbaikan → Diperbaiki | Semula cuma `beforeunload` (bocor untuk navigasi SPA). Diperbaiki: autosave draft ke `localStorage` + banner "Pulihkan draft?", tombol Batal konfirmasi bila `dirty`. |
| 3.2 | Buat halaman dengan 50+ blok — cek reorder dan insert masih responsif, tidak lag | Perlu Perbaikan → Diperbaiki | Semula render all tanpa memo. Diperbaiki: kartu blok `memo`, ada nomor blok, tombol "Ciut", kolom "Ke" untuk lompat posisi 1→50, hint saat ≥20 blok. |
| 3.3 | Kosongkan field wajib di sebuah blok (misal blok gambar tanpa upload) lalu coba publish — cek validasi mencegah publish atau blok rusak tetap tayang ke publik | Perlu Perbaikan → Diperbaiki | Gambar/galeri sudah divalidasi; tombol/paragraf/video/daftar kosong lolos lalu hilang diam-diam. Diperbaiki: validasi wajib isi (tombol teks+href, teks blok, ≥1 poin daftar, src video), validasi klien + highlight kartu blok error inline. Default `href: "/"` diubah `""` agar ketahuan. |
| 3.4 | Duplikat blok berisi gambar/galeri besar berkali-kali — cek performa render dan tidak ada pemborosan storage berlebihan | Perlu Perbaikan → Diperbaiki | Storage hemat (copy URL, bukan re-upload). Diperbaiki: konfirmasi bila duplikat galeri >10 foto, warning bila isi >800 KB (mendekati limit Firestore 1 MB), `loading=lazy` tetap, delay Reveal dibatasi 0.3s. |

## 4. Human-Error Simulation

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 4.1 | Minta orang yang belum pernah melihat sistem ini mencoba: buat halaman baru → kelompokkan ke menu → publish, tanpa diberi arahan sama sekali. Catat di titik mana dia bingung/nyasar | Perlu Perbaikan → Diperbaiki | 5 titik bingung diperbaiki: (1) dashboard tambah shortcut Kelola/Halaman baru, (2) field "Menu induk"→"Menu" + link "Buka Atur menu ↗", (3) tombol jadi "Simpan & tayangkan" / "Simpan sebagai draft", (4) header "Status tayang" + toast sukses berisi URL final, (5) copy pratinjau diluruskan. |
| 4.2 | Klik berkali-kali secara cepat pada tombol "Hapus" atau "Tambah" (double-submit) — cek ada entry duplikat atau error yang muncul | Perlu Perbaikan → Diperbaiki | Form utama sudah ada guard; `NavGroupManager` belum. Diperbaiki: `busyRef` sinkron di `simpan/tambah/geser`, tolak label duplikat case-insensitive, `ConfirmDialog` pakai `submittingRef` + trigger kustom. |

---

## Ringkasan Temuan
*(Sudah diperbaiki semua — verifikasi ulang dengan `npx tsc --noEmit` lolos, eslint 0 error)*

1. [P0] Proteksi CTA mati total karena salah alamat builder — diperbaiki (`dampak-navigasi.ts`, `nav-public.ts`).
2. [P0] Hapus halaman bawaan me-wipe isi di balik label Hapus — diperbaiki (disabled + "Kosongkan isi").
3. [P0] Hapus grup tanpa konfirmasi + hapus-semua bangkit jadi default — diperbaiki (konfirmasi usage + hormati `[]`).
4. [P1] Unpublish ber-grup non-blocking — diperbaiki (checkbox paham dampak).
5. [P1] Slug bentrok suffix diam-diam — diperbaiki (URL final eksplisit + toast).
6. [P1] Draft hilang saat refresh/navigasi SPA — diperbaiki (localStorage recovery + confirm Batal).
7. [P1] 50+ blok lag + reorder 49-klik — diperbaiki (memo + Ciut + lompat Ke).
8. [P1] Blok kosong lolos lalu hilang diam-diam — diperbaiki (validasi + highlight).
9. [P1] Double-submit menu — diperbaiki (busyRef + tolak duplikat + submittingRef).

## Status Akhir
- [x] Semua item "Gagal" sudah diperbaiki dan diuji ulang (static + `tsc` + `eslint`)
- [x] Siap untuk handoff ke admin sekolah (disarankan 1x uji manual cepat alur buat→menu→tayang)
