# PRD: Flexible Page Builder untuk Admin Panel Website SMAN 1 Lumajang

## 1. Latar Belakang

Website sekolah SMAN 1 Lumajang saat ini punya admin panel yang menangani konten spesifik (prestasi, galeri, berita). Setelah developer awal (siswa) lulus, akan ada admin baru dari pihak sekolah yang **tidak bisa coding**. Jika sekolah ingin menambah halaman baru di masa depan, admin awam harus bisa melakukannya sendiri tanpa bantuan developer.

**Masalah:** Struktur halaman publik saat ini di-hardcode di kode. Non-developer tidak bisa menambah, mengubah, atau menghapus halaman.

**Tujuan:** Admin panel harus punya kemampuan setara CMS seperti WordPress — semua yang tampil di sisi publik website harus bisa dikelola (dibuat, diedit, dihapus, dikelompokkan) langsung dari admin, tanpa sentuh kode.

## 2. Target Pengguna

- **Admin awam (non-coder):** staf/guru yang ditunjuk sekolah setelah developer asli lulus. Ini adalah pengguna utama yang harus dilayani oleh desain ini.
- **Admin teknis (saat ini):** developer siswa yang membangun sistem, butuh fondasi yang aman dan tidak mudah rusak di tangan pengguna awam.

## 3. Ruang Lingkup (Scope)

### 3.1 Fitur Inti — Page Management (CRUD Halaman)
- Admin bisa **membuat halaman baru** dari admin panel (judul, slug/URL, konten).
- Admin bisa **mengedit** halaman yang sudah ada, termasuk halaman "bawaan" (Beranda, Tentang, Prestasi, Galeri, Berita, dll.) — bukan cuma halaman tambahan.
- Admin bisa **menghapus** halaman.
- Admin bisa **publish / unpublish (draft)** halaman tanpa menghapusnya.
- Setiap perubahan halaman publik ter-refleksi otomatis di sisi publik tanpa deploy ulang kode.

### 3.2 Struktur & Navigasi Halaman
- Halaman bisa **dikelompokkan (grouping)** — misalnya beberapa halaman digabung di bawah satu menu/parent (contoh: "Akademik" berisi sub-halaman "Kurikulum", "Ekstrakurikuler").
- Halaman bisa berdiri **independen** (tidak tergabung grup mana pun).
- Admin bisa mengatur halaman jadi **collapsible/expand** di navigasi (dropdown menu bisa dibuka-tutup).
- Admin bisa mengatur **urutan tampil** halaman/menu (reorder, misal drag-and-drop atau input angka urutan).
- Perubahan struktur navigasi (menambah/menghapus/mengelompokkan menu) otomatis update di header/navbar publik.

### 3.3 Editor Konten
- Editor konten harus **WYSIWYG / block-based** yang ramah non-coder (mirip block editor WordPress, Notion, atau rich text editor) — bukan editor kode/HTML mentah.
- Mendukung blok konten umum minimal: teks/paragraf, heading, gambar, galeri gambar, tombol/link, video (embed), spacer/divider.
- (Opsional, prioritas rendah) Blok custom yang meniru komponen desain khas web sekolah ini (misal hero section, card, dsb.) agar tetap konsisten dengan estetika Apple-style yang sudah dibangun — sehingga admin awam tidak bisa merusak desain walau bebas mengedit.

### 3.4 Preservasi Desain
- Karena desain publik sudah dirancang dengan estetika premium (Apple-style, navy+putih), sistem harus **membatasi kebebasan styling bebas** dari admin awam (tidak ada input CSS/HTML bebas) agar desain tetap konsisten — kebebasan ada di level *konten dan struktur*, bukan di level *visual/tema*.

## 4. Di Luar Ruang Lingkup (Out of Scope)
- Multi-user roles/permission granular (kalau belum dibutuhkan sekolah, bisa jadi fase 2).
- Theme switcher atau kustomisasi visual bebas (warna, font) oleh admin awam.
- Multi-bahasa (i18n) — kecuali memang sudah jadi requirement sebelumnya.

## 5. Kebutuhan Non-Fungsional
- **Aman dari human error:** ada konfirmasi sebelum hapus halaman, idealnya ada draft/preview sebelum publish, dan idealnya ada riwayat versi (undo) minimal sederhana.
- **Tidak butuh pengetahuan teknis apa pun** — semua istilah di UI admin harus dalam bahasa awam (bukan istilah developer seperti "slug", "route", "component").
- Tetap konsisten dengan arsitektur & stack yang sudah dipakai di project ini saat ini (perlu dikonfirmasi ulang oleh developer yang melanjutkan: framework, database/backend penyimpanan konten).

## 6. Pertanyaan Terbuka untuk PA yang Melanjutkan
1. Apakah butuh sistem role/permission (misal: admin biasa vs super admin) atau cukup 1 level akses admin?
2. Apakah dibutuhkan fitur preview sebelum publish?
3. Apakah dibutuhkan version history / rollback halaman?
4. Bagaimana menangani SEO dasar per halaman (meta title/description) — apakah perlu bisa diedit juga dari admin?

## 7. Kriteria Sukses (Definition of Done)
- Admin awam (simulasi: tanpa bantuan developer) berhasil menambah 1 halaman baru, mengelompokkannya ke dalam menu, dan mempublikasikannya — semuanya tanpa menyentuh kode.
- Semua halaman publik yang ada sekarang (Beranda, Prestasi, Galeri, Berita, dll.) bisa diedit kontennya dari admin panel baru ini.
- Tidak ada breaking change pada desain visual saat konten diedit lewat editor.
