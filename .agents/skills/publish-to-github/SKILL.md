---
name: publish-to-github
description: >-
  Gunakan skill ini setiap kali hendak melakukan git commit, git push, atau mempublikasikan kode ke repository GitHub.
  Skill ini memastikan verifikasi pra-publish (build check & security), peninjauan git diff, pembaruan README.md, pembuatan commit message terstruktur, dan proses push yang aman.
---

# Skill: Publish to GitHub (Workflow Standar Rilis & Push)

Gunakan panduan ini sebagai checklist wajib sebelum melakukan publish/push ke repository GitHub.

---

## 1. Verifikasi Pra-Publish (Sanity & Quality Check)

Pastikan kode dalam kondisi prima dan tidak merusak build:

1. **Jalankan Verifikasi Build & Tipe:**
   ```bash
   npm run build
   ```
   - Pastikan exit code adalah `0` dan tidak ada error TypeScript atau Next.js build issue.
   - Jika ada error atau peringatan krusial, selesaikan terlebih dahulu sebelum melanjutkan.

2. **Periksa File Sensitif:**
   - Pastikan file konfigurasi lokal rahasia tidak masuk ke staging (misal `.env.local`, file kredensial service account Firebase privat, dsb.).
   - Pastikan file tersebut sudah ada dalam `.gitignore`.

---

## 2. Review Git Status & Diff (Cek Kesesuaian)

1. **Lihat Status Repository:**
   ```bash
   git status
   ```
2. **Review Perubahan per File:**
   ```bash
   git diff
   ```
3. **Pemeriksaan:**
   - Apakah semua file yang diubah relevan dengan fitur/perbaikan yang baru saja dikerjakan?
   - Apakah ada file temporer, file uji coba (scratch), atau log yang tertinggal? Jika ada, bersihkan terlebih dahulu.

---

## 3. Sinkronisasi & Penyesuaian `README.md`

Sebelum commit, selalu periksa apakah ada dokumentasi yang perlu diperbarui:

1. **Baca Bagian Terkait di `README.md`:**
   - Apakah ada penambahan fitur baru? (Misal: perbaikan form admin, tutorial spotlight, perbaikan navigation).
   - Apakah ada perubahan instruksi setup / environment variable baru?
   - Apakah daftar rute / struktur halaman berubah?
2. **Perbarui `README.md`:**
   - Tambahkan catatan perubahan, pembaruan fitur, atau update checklist pada `README.md` sesuai dengan perubahan riil yang baru saja selesai diimplementasikan.

---

## 4. Staging & Pembuatan Git Commit

1. **Stage File yang Relevan:**
   - Hindari `git add .` secara membabi-buta jika ada file untracked yang tidak diinginkan.
   - Stage file secara spesifik atau periksa kembali dengan `git status` setelah add.
2. **Tulis Pesan Commit yang Jelas (Conventional Commits):**
   - Format: `<type>(<scope>): <deskripsi singkat>`
   - Contoh tipe:
     - `feat:` penambahan fitur baru
     - `fix:` perbaikan bug / error
     - `docs:` pembaruan dokumentasi / README
     - `refactor:` perapian kode tanpa mengubah fungsi
     - `ui:` perbaikan tampilan antarmuka
3. **Eksekusi Commit:**
   ```bash
   git commit -m "tipe: deskripsi perubahan yang jelas"
   ```

---

## 5. Push ke GitHub

1. **Cek Branch Aktif:**
   ```bash
   git branch --show-current
   ```
2. **Kirim Perubahan ke Remote Repository:**
   ```bash
   git push origin <branch>
   ```
3. **Konfirmasi:**
   - Pastikan output terminal menunjukkan proses push berhasil tanpa conflict atau error.
   - Laporkan ringkasan perubahan dan commit hash kepada pengguna.
