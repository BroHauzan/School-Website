# QA Checklist: Chaos Testing Admin Panel Sebelum Handoff

Tujuan: memastikan admin panel tahan dari kesalahan pemakaian oleh admin awam (non-coder) sebelum diserahkan ke sekolah. Checklist ini dijalankan **sebelum** handoff, idealnya oleh developer + 1 orang yang belum pernah lihat sistemnya sama sekali.

Cara pakai: centang tiap item, isi kolom **Hasil** (Lolos / Gagal / Perlu Perbaikan), catat detail di **Catatan** kalau ada bug.

---

## 1. Menu & Grouping

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 1.1 | Hapus kelompok menu yang masih dipakai beberapa halaman (misal "Profil" dengan 5 halaman) — cek apakah halamannya ilang dari navbar, jadi 404, atau otomatis fallback ke "berdiri sendiri" | | |
| 1.2 | Buat 2 kelompok menu dengan angka urutan yang sama — cek urutan tampil di navbar konsisten atau acak | | |
| 1.3 | Ganti nama kelompok menu yang sedang dipakai banyak halaman, sambil tab lain juga membuka halaman edit yang terkait — cek ada konflik data atau tidak | | |
| 1.4 | Buat kelompok menu kosong (0 halaman) — cek apakah tetap muncul di navbar publik sebagai menu kosong yang bisa diklik | | |

## 2. Page CRUD

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 2.1 | Hapus halaman yang jadi target link dari blok Tombol/CTA di halaman lain — cek link jadi broken atau ada penanganan (warning/redirect) | | |
| 2.2 | Buat 2 halaman dengan alamat/slug yang sama atau mirip banget — cek sistem mencegah bentrok atau malah menimpa | | |
| 2.3 | Unpublish (draft) halaman yang masih jadi bagian menu induk aktif — cek apakah tetap muncul di navbar tapi 404 saat diklik | | |
| 2.4 | Coba hapus halaman "bawaan" (yang alamatnya tidak bisa diganti) — pastikan tombol hapus benar-benar ter-disable, bukan cuma disembunyikan | | |

## 3. Block Editor

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 3.1 | Sisip/edit blok tanpa save, lalu refresh atau tekan tombol back browser — cek data hilang atau ter-recover sebagai draft | | |
| 3.2 | Buat halaman dengan 50+ blok — cek reorder dan insert masih responsif, tidak lag | | |
| 3.3 | Kosongkan field wajib di sebuah blok (misal blok gambar tanpa upload) lalu coba publish — cek validasi mencegah publish atau blok rusak tetap tayang ke publik | | |
| 3.4 | Duplikat blok berisi gambar/galeri besar berkali-kali — cek performa render dan tidak ada pemborosan storage berlebihan | | |

## 4. Human-Error Simulation

| # | Skenario | Hasil | Catatan |
|---|----------|-------|---------|
| 4.1 | Minta orang yang belum pernah melihat sistem ini mencoba: buat halaman baru → kelompokkan ke menu → publish, tanpa diberi arahan sama sekali. Catat di titik mana dia bingung/nyasar | | |
| 4.2 | Klik berkali-kali secara cepat pada tombol "Hapus" atau "Tambah" (double-submit) — cek ada entry duplikat atau error yang muncul | | |

---

## Ringkasan Temuan
*(Isi setelah semua item dites — daftar bug/perbaikan prioritas tinggi yang harus dibereskan sebelum handoff ke sekolah)*

1.
2.
3.

## Status Akhir
- [ ] Semua item "Gagal" sudah diperbaiki dan diuji ulang
- [ ] Siap untuk handoff ke admin sekolah
