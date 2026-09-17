# PRD: Tutorial Interaktif (Spotlight Guide) di Admin Panel

## 1. Latar Belakang

Admin panel website sekolah punya banyak fitur (Berita, Halaman, Menu, Galeri, Prestasi, Testimoni, Block Editor, dst). Target pengguna akhir adalah admin awam (non-coder) yang mungkin belum pernah pakai sistem serupa. Dibutuhkan cara untuk **memandu pengguna langsung di dalam interface**, bukan lewat dokumen terpisah yang harus dibaca duluan.

## 2. Tujuan
Menyediakan tutorial interaktif berbasis **spotlight** (highlight elemen di layar) yang menuntun admin step-by-step untuk menyelesaikan sebuah tugas (misal: menulis berita baru), langsung di tempat kejadian — bukan berupa video atau dokumen PDF terpisah.

## 3. Konsep Utama

### 3.1 Visual: Spotlight Overlay
- Saat tutorial aktif, seluruh halaman ditutupi **overlay gelap semi-transparan**.
- Ada satu area **lingkaran/bulat terang** (spotlight) yang mengelilingi elemen target (misal tombol "+ Tulis Berita") — elemen di dalam spotlight terlihat jelas, sisanya digelapkan.
- Muncul **tooltip/keterangan** di dekat spotlight yang menjelaskan apa yang harus dilakukan pada langkah itu (contoh: "Klik tombol ini untuk mulai menulis berita baru").
- Ada tombol navigasi tutorial: **Lanjut**, **Sebelumnya** (jika ada step sebelumnya), dan **Keluar/Lewati** untuk berhenti kapan saja.
- Spotlight otomatis berpindah ke elemen berikutnya saat admin klik "Lanjut", termasuk kalau elemennya ada di halaman yang berbeda (tutorial bisa berpindah halaman secara otomatis mengikuti alur).

### 3.2 Sifat: Opsional, Bukan Dipaksakan
- Tutorial **tidak otomatis muncul** saat admin membuka halaman.
- Admin memicu tutorial secara sadar, misal lewat tombol "❓ Bantuan" atau "🎓 Tutorial" yang selalu ada di pojok/navbar admin.
- Admin bisa keluar dari tutorial kapan saja tanpa kehilangan progres kerja (tutorial tidak boleh mengubah/menghapus data asli yang sedang diedit).

### 3.3 Cakupan: Tutorial per Task, Bukan Satu Tutorial Raksasa
Tutorial dipecah per topik/tugas spesifik, bukan satu tutorial umum yang membahas semua sekaligus. Daftar awal yang perlu dicakup (bisa berkembang seiring fitur baru):

| Topik Tutorial | Alur yang Dipandu |
|---|---|
| Menulis berita baru | Klik "+ Tulis Berita" → isi judul/tag/konten → publish |
| Menambah halaman baru | Klik "+ Halaman baru" → isi judul & alamat → atur menu induk → publish |
| Mengatur menu/grouping | Buka "Menu" → tambah kelompok menu → set menu induk di halaman |
| Menambah galeri | Buka "Galeri" → upload gambar → isi keterangan |
| Menambah prestasi | Buka "Prestasi" → isi form prestasi baru |
| Menambah testimoni | Buka "Testimoni" → isi kutipan & nama |
| Menggunakan Block Editor | Tambah blok → isi konten blok → reorder/sisip/duplikat blok → preview → publish |

Setiap topik di atas = satu tutorial terpisah yang bisa dipilih admin sesuai kebutuhannya saat itu (bukan harus urut dari topik pertama).

### 3.4 Titik Masuk Tutorial
- **Menu bantuan terpusat:** halaman/panel berisi daftar semua tutorial yang tersedia, admin pilih sendiri mau belajar yang mana.
- **(Opsional, fase lanjut) Tombol bantuan kontekstual:** ikon "?" kecil di tiap halaman admin yang langsung menjalankan tutorial relevan dengan halaman itu.

## 4. Batasan (Guardrails)
- Tutorial adalah lapisan UI (overlay) di atas admin panel yang sudah ada — **tidak boleh mengubah logika atau data** admin panel yang sebenarnya.
- Tutorial tidak boleh memblokir admin yang sudah paham dan tidak ingin memakainya (default: tidak aktif).
- Konten teks tutorial harus pakai bahasa awam, konsisten dengan gaya bahasa di form-form admin yang sudah ada (misal: hindari istilah teknis seperti "slug", "route", "component").
- Kalau elemen target tutorial tidak ditemukan di halaman (misal karena data kosong atau UI berubah), tutorial harus fallback dengan aman (skip step atau tampilkan pesan, bukan error/crash).

## 5. Keputusan atas Pertanyaan Terbuka
1. **Responsif di mobile vs desktop:** ya, spotlight wajib menyesuaikan ukuran/posisi otomatis mengikuti layout di tiap ukuran layar.
2. **Progres tutorial:** tidak disimpan — setiap tutorial dipanggil, selalu mulai dari step pertama (tidak ada resume/lanjutan dari progres sebelumnya).
3. **Indikator progres:** dibutuhkan — tooltip harus menampilkan posisi step, misal "Langkah 2 dari 5".
4. **Pengelolaan konten tutorial ke depan:** sengaja **di-hardcode di kode**, bukan dibuat data-driven/CMS-able. Kalau ada fitur admin baru di masa depan, developer (Hauzann) yang akan menambahkan tutorial barunya langsung lewat kode — bukan tugas admin sekolah untuk mengelola konten tutorial.

## 6. Kriteria Sukses
- Admin bisa memicu tutorial "Menulis berita baru" dari menu bantuan, diarahkan step-by-step dengan spotlight yang jelas menunjuk tombol/field yang relevan, sampai berhasil publish berita — tanpa bantuan developer.
- Admin bisa keluar dari tutorial kapan saja tanpa data yang sedang dikerjakan hilang atau rusak.
- Semua topik utama admin panel (berita, halaman, menu, galeri, prestasi, testimoni, block editor) punya tutorial masing-masing.
