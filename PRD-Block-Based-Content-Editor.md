# PRD: Block-Based Content Editor (Bukan Freeform Canvas)

## 1. Latar Belakang

Muncul ide agar editor halaman di admin panel bisa drag-and-drop bebas seperti Google Sites (elemen ditaruh di mana saja di kanvas). Ide ini **ditolak** untuk project ini, dengan alasan:

- Website sekolah punya desain premium yang konsisten (Apple-style, navy + putih). Kanvas bebas berisiko tinggi merusak hierarki visual dan spacing di tangan admin awam.
- Membangun canvas builder bebas (snapping, responsive per breakpoint, positioning) adalah effort setara membangun website builder engine sendiri — jauh di luar kebutuhan aktual.
- Admin panel saat ini sudah mengarah ke pendekatan yang tepat: form terstruktur dengan slot-slot konten (judul hero, deskripsi hero, dst.) yang mengisi template yang sudah didesain rapi.

**Keputusan arah:** tetap beri admin rasa "menyusun sendiri" konten, tapi lewat **blok konten yang bisa ditambah/dihapus/diurutkan (reorder vertikal)**, bukan lewat penempatan bebas di kanvas.

## 2. Tujuan
Memberi admin awam fleksibilitas menyusun konten sebuah halaman (tambah section, atur urutan) tanpa membuka risiko merusak desain atau butuh effort membangun canvas builder penuh.

## 3. Konsep Utama

### 3.1 Blok, bukan Kanvas
- Halaman terdiri dari susunan **blok/section vertikal** (mirip Notion blocks / WordPress Gutenberg).
- Setiap blok adalah komponen desain yang sudah jadi (fixed styling sesuai design system website), admin hanya mengisi kontennya — tidak ada input CSS/HTML bebas, tidak ada penempatan bebas X-Y.
- Urutan blok bisa diubah lewat **drag handle** untuk reorder vertikal (drag ke atas/bawah), bukan drag ke posisi bebas.

### 3.2 Jenis Blok yang Didukung (minimal)
- Hero (judul besar + deskripsi, seperti yang sudah ada)
- Teks/paragraf
- Gambar tunggal
- Galeri gambar
- Tombol/CTA (call-to-action)
- Video (embed)
- Testimoni/kutipan
- Spacer/divider
- (Opsional, fase lanjut) Blok kalender/jadwal, blok daftar/list terstruktur — relevan untuk halaman seperti "Kalender Pendidikan" di contoh yang sudah ada

### 3.3 Interaksi Admin
- Tombol "+ Tambah Blok" untuk menyisipkan blok baru di posisi tertentu dalam urutan.
- Setiap blok punya opsi: edit konten, hapus blok, duplikat blok (opsional), dan drag handle untuk reorder.
- Preview tetap tersedia untuk melihat hasil sebelum publish (selaras dengan fitur "Pratinjau" yang sudah ada di admin panel saat ini).

## 4. Batasan yang Tetap Dipertahankan (Guardrails)
- Tidak ada canvas bebas / drag ke posisi X-Y manapun.
- Tidak ada input styling bebas (warna, font, ukuran) oleh admin awam — styling mengikuti desain yang sudah dibakukan per jenis blok.
- Struktur ini melengkapi, bukan menggantikan, PRD sebelumnya soal page management (create/edit/delete/grouping halaman) — PRD ini fokus khusus ke **isi/konten di dalam satu halaman**.

## 5. Kriteria Sukses
- Admin awam bisa menambah blok baru ke sebuah halaman, mengisi kontennya, dan mengubah urutannya lewat drag — tanpa menyentuh kode dan tanpa merusak tampilan desain.
- Tidak ada cara bagi admin untuk menempatkan elemen di luar susunan vertikal blok yang sudah disediakan.
