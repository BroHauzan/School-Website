export type TutorialStep = {
  id: string;
  /** Rute tempat elemen target berada. Provider akan pindah halaman otomatis saat Lanjut. */
  route: string;
  /** Selector CSS elemen yang di spotlight. */
  selector: string;
  /**
   * Kalau diisi, tutorial otomatis lanjut ke step berikutnya setelah user
   * berhasil klik target. Berguna untuk tutorial yang linear dan jelas.
   * Default: false (pakai tombol Lanjut manual).
   */
  autoAdvance?: boolean;
  /**
   * Jeda milidetik sebelum auto-advance. Kalau tidak diisi,
   * pakai 1500ms (1.5 detik) default.
   */
  advanceDelay?: number;
  /**
   * Kalau diisi, tutorial menunggu sampai target muncul (polling tanpa batas)
   * alih-alih menampilkan fallback. Dipakai untuk langkah yang mengharapkan
   * hasil aksi user di langkah sebelumnya (mis. blok baru setelah diklik).
   * Default: selector itu sendiri.
   */
  waitFor?: string;
  /**
   * Kalau diisi, tombol Lanjut terkunci sampai selector ini sudah ada di
   * halaman. Dipakai untuk langkah "lakukan X dulu" supaya user tidak bisa
   * Lanjut sebelum aksinya benar-benar dilakukan.
   */
  requires?: string;
  /** Pesan yang tampil di tooltip selagi tombol Lanjut terkunci. */
  requiresHint?: string;
  title: string;
  body: string;
};

export type Tutorial = {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
};

export const TUTORIALS: Tutorial[] = [
  {
    id: "berita-baru",
    title: "Menulis berita baru",
    description:
      "Dari dashboard sampai berita tayang: buka form, isi judul dan isi, lalu terbitkan.",
    steps: [
      {
        id: "buka-form",
        route: "/admin",
        selector: '[data-tour="berita-tulis"]',
        title: "Langkah 1: buka form berita",
        body: "Klik tombol Lanjut di panduan ini (atau tombol + Tulis berita ini) untuk membuka halaman tulis berita. Panduan ikut pindah halaman otomatis.",
      },
      {
        id: "isi-judul",
        route: "/admin/berita/baru",
        selector: "#f-title",
        title: "Langkah 2: isi judul",
        body: "Tulis judul yang singkat dan jelas, misal: Juara 1 Lomba Cerdas Cermat. Ini yang tampil paling besar di halaman berita.",
      },
      {
        id: "isi-ringkas",
        route: "/admin/berita/baru",
        selector: "#f-excerpt",
        title: "Langkah 3: isi ringkasan",
        body: "Tulis 1 sampai 2 kalimat pembuka. Ringkasan ini tampil di kartu daftar berita.",
      },
      {
        id: "isi-berita",
        route: "/admin/berita/baru",
        selector: "#f-body",
        title: "Langkah 4: tulis isi berita",
        body: "Tulis isi lengkap di sini. Pisahkan tiap paragraf dengan satu baris kosong.",
      },
      {
        id: "gambar",
        route: "/admin/berita/baru",
        selector: '[data-tour="berita-gambar"]',
        title: "Langkah 5: pasang gambar (opsional)",
        body: "Klik area gambar untuk mengunggah foto. Kalau dilewati, foto bawaan sekolah yang dipakai.",
      },
      {
        id: "terbit",
        route: "/admin/berita/baru",
        selector: '[data-tour="berita-publish"]',
        title: "Langkah 6: terbitkan",
        body: "Pastikan pilihan Tayangkan menyala, lalu klik Terbitkan berita. Selesai, berita langsung tampil di situs.",
      },
    ],
  },
  {
    id: "halaman-baru",
    title: "Membuat halaman baru",
    description:
      "Dari daftar halaman sampai halaman tampil di situs: buka form, isi judul, pilih menu, lalu simpan.",
    steps: [
      {
        id: "buka-form-halaman",
        route: "/admin/halaman",
        selector: '[data-tour="halaman-baru"]',
        title: "Langkah 1: buka form halaman baru",
        body: "Klik tombol Lanjut di panduan ini (atau tombol + Halaman baru ini) untuk membuka form halaman baru. Panduan ikut pindah halaman otomatis.",
      },
      {
        id: "isi-judul-halaman",
        route: "/admin/halaman/baru",
        selector: "#h-judul",
        title: "Langkah 2: isi judul halaman",
        body: "Tulis nama halaman di sini, misalnya: Visi dan Misi. Judul ini tampil besar di bagian atas halaman.",
      },
      {
        id: "pilih-menu-halaman",
        route: "/admin/halaman/baru",
        selector: "#h-menu",
        title: "Langkah 3: pilih menu halaman",
        body: "Pilih kelompok menu tempat halaman ini tampil di situs, misalnya: Profil atau Akademik. Kalau kelompoknya belum ada, buat dulu di halaman Atur menu.",
      },
      {
        id: "simpan-halaman",
        route: "/admin/halaman/baru",
        selector: '[data-tour="halaman-publish"]',
        title: "Langkah 4: simpan halaman",
        body: "Pastikan pilihan Tayangkan menyala, lalu klik tombol Simpan. Selesai, halaman langsung tampil di situs.",
      },
    ],
  },
  {
    id: "menu-grup",
    title: "Membuat kelompok menu baru",
    description:
      "Bikin kelompok menu baru, lalu masukkan halaman ke dalamnya supaya rapi di situs.",
    steps: [
      {
        id: "tulis-nama-grup",
        route: "/admin/menu",
        selector: "#grup-baru",
        title: "Langkah 1: tulis nama kelompok baru",
        body: "Ketik nama kelompok menu baru di kolom ini, misalnya: Akademik atau Kesiswaan.",
      },
      {
        id: "simpan-grup",
        route: "/admin/menu",
        selector: '[data-tour="menu-simpan-grup"]',
        title: "Langkah 2: simpan kelompok baru",
        body: "Klik tombol Tambah menu untuk menyimpan. Kelompok baru langsung muncul di daftar atas.",
      },
      {
        id: "masukkan-halaman-ke-grup",
        route: "/admin/halaman/baru",
        selector: "#h-menu",
        title: "Langkah 3: masukkan halaman ke kelompok",
        body: "Panduan pindah ke form halaman baru. Pilih kelompok yang baru dibuat pada pilihan Menu ini, supaya halaman masuk ke kelompok yang benar.",
      },
      {
        id: "selesai-grup",
        route: "/admin/halaman/baru",
        selector: '[data-tour="halaman-publish"]',
        title: "Langkah 4: selesai, simpan halaman",
        body: "Isi judul halaman, lalu klik tombol Simpan. Halaman baru tampil di situs dalam kelompok menu yang dipilih. Selamat!",
      },
    ],
  },
  {
    id: "galeri-baru",
    title: "Menambah foto galeri",
    description:
      "Dari daftar galeri sampai foto tayang: buka form, unggah foto, tulis keterangan, lalu simpan.",
    steps: [
      {
        id: "buka-form",
        route: "/admin/galeri",
        selector: '[data-tour="galeri-baru"]',
        title: "Langkah 1: buka form tambah foto",
        body: "Klik tombol Lanjut di panduan ini (atau tombol + Tambah foto ini) untuk membuka halaman tambah foto. Panduan ikut pindah halaman otomatis.",
      },
      {
        id: "unggah-foto",
        route: "/admin/galeri/baru",
        selector: '[data-tour="galeri-foto"]',
        title: "Langkah 2: unggah foto",
        body: "Klik area foto ini untuk memilih dan mengunggah gambar dari perangkat. Tunggu sampai pratinjau fotonya muncul sebelum lanjut.",
      },
      {
        id: "isi-caption",
        route: "/admin/galeri/baru",
        selector: "#g-caption",
        title: "Langkah 3: tulis keterangan foto",
        body: "Tulis keterangan singkat untuk foto, misalnya: Upacara bendera hari Senin. Keterangan ini tampil di bawah foto.",
      },
      {
        id: "atur-urutan",
        route: "/admin/galeri/baru",
        selector: "#g-order",
        title: "Langkah 4: atur urutan tampil",
        body: "Isi dengan angka untuk mengatur posisi foto. Angka kecil tampil lebih dulu, misalnya 1 untuk foto paling depan.",
      },
      {
        id: "terbit",
        route: "/admin/galeri/baru",
        selector: '[data-tour="galeri-publish"]',
        title: "Langkah 5: simpan dan tayangkan",
        body: "Pastikan pilihan Tayangkan menyala bila foto sudah boleh dilihat semua orang, lalu klik Tambah foto. Selesai, foto langsung tampil di halaman galeri.",
      },
    ],
  },
  {
    id: "prestasi-baru",
    title: "Menambah prestasi baru",
    description:
      "Dari daftar prestasi sampai tayang: buka form, isi nama dan tingkat, lalu simpan.",
    steps: [
      {
        id: "buka-form",
        route: "/admin/prestasi",
        selector: '[data-tour="prestasi-baru"]',
        title: "Langkah 1: buka form tambah prestasi",
        body: "Klik tombol Lanjut di panduan ini (atau tombol + Tambah prestasi ini) untuk membuka halaman tambah prestasi. Panduan ikut pindah halaman otomatis.",
      },
      {
        id: "isi-nama",
        route: "/admin/prestasi/baru",
        selector: "#p-title",
        title: "Langkah 2: tulis nama prestasi",
        body: "Tulis nama prestasinya dengan jelas, misalnya: Juara 1 Lomba Pidato Bahasa Indonesia. Ini yang tampil paling besar di halaman prestasi.",
      },
      {
        id: "isi-tahun",
        route: "/admin/prestasi/baru",
        selector: "#p-year",
        title: "Langkah 3: isi tahun perolehan",
        body: "Tulis tahun prestasi diraih dengan 4 angka, misalnya 2026.",
      },
      {
        id: "pilih-tingkat",
        route: "/admin/prestasi/baru",
        selector: "#p-scope",
        title: "Langkah 4: pilih tingkat lomba",
        body: "Pilih seberapa luas lombanya, misalnya tingkat kota, provinsi, atau nasional. Sesuaikan dengan piagam atau pengumumannya.",
      },
      {
        id: "terbit",
        route: "/admin/prestasi/baru",
        selector: '[data-tour="prestasi-publish"]',
        title: "Langkah 5: simpan dan tayangkan",
        body: "Jangan lupa isi nama peraihnya, pastikan pilihan Tayangkan menyala, lalu klik Tambah prestasi. Selesai, prestasi langsung tampil di situs.",
      },
    ],
  },
  {
    id: "testimoni-baru",
    title: "Menambah testimoni baru",
    description:
      "Dari daftar testimoni sampai tayang: buka form, tulis kutipan dan nama, lalu simpan.",
    steps: [
      {
        id: "buka-form",
        route: "/admin/testimoni",
        selector: '[data-tour="testimoni-baru"]',
        title: "Langkah 1: buka form tambah testimoni",
        body: "Klik tombol Lanjut di panduan ini (atau tombol + Tambah testimoni ini) untuk membuka halaman tambah testimoni. Panduan ikut pindah halaman otomatis.",
      },
      {
        id: "isi-kutipan",
        route: "/admin/testimoni/baru",
        selector: "#t-quote",
        title: "Langkah 2: tulis kutipan",
        body: "Tulis persis apa yang mereka sampaikan tentang sekolah, misalnya: Guru-gurunya ramah dan pelajaran mudah dipahami. Kutipan ini tampil di bagian penilaian pengunjung.",
      },
      {
        id: "isi-nama",
        route: "/admin/testimoni/baru",
        selector: "#t-name",
        title: "Langkah 3: tulis nama pemberi testimoni",
        body: "Tulis nama lengkap orang yang memberi penilaian, misalnya: Siti Rahma.",
      },
      {
        id: "isi-peran",
        route: "/admin/testimoni/baru",
        selector: "#t-role",
        title: "Langkah 4: tulis peran atau asal",
        body: "Tulis siapa mereka, misalnya: Siswa angkatan 64 atau Alumni 2012. Ini tampil di bawah nama sebagai keterangan.",
      },
      {
        id: "terbit",
        route: "/admin/testimoni/baru",
        selector: '[data-tour="testimoni-publish"]',
        title: "Langkah 5: simpan dan tayangkan",
        body: "Pastikan pilihan Tayangkan menyala, lalu klik Tambah testimoni. Selesai, testimoni langsung tampil bergantian di situs.",
      },
    ],
  },
  {
    id: "blok-editor",
    title: "Menyusun halaman dengan bagian isi",
    description:
      "Dari halaman kosong sampai tayang: tambah bagian isi, tulis, gandakan, susun urutan, cek tampilan, lalu terbitkan.",
    steps: [
      {
        id: "tambah-bagian",
        route: "/admin/halaman/baru",
        selector: '[data-tour="blok-tambah"]',
        requires: '[data-tour="blok-pilih"]',
        requiresHint: "Klik tombol + Tambah blok di akhir yang berdenyut dulu, tombol Lanjut aktif sendiri setelah daftar pilihan muncul.",
        autoAdvance: true,
        advanceDelay: 2500,
        title: "Langkah 1: buka daftar pilihan",
        body: "Klik tombol + Tambah blok di akhir yang sedang berdenyut (layar bisa diklik). Daftar jenis bagian langsung muncul di bawahnya dan tutorial otomatis lanjut.",
      },
      {
        id: "pilih-jenis",
        route: "/admin/halaman/baru",
        selector: '[data-tipe="paragraf"]',
        requires: '[data-tour="blok-duplikat"]',
        requiresHint: "Klik opsi Paragraf yang berdenyut dulu, tombol Lanjut aktif sendiri setelah bagian muncul.",
        autoAdvance: true,
        advanceDelay: 2000,
        title: "Langkah 2: pilih Paragraf",
        body: "Klik opsi Paragraf yang sedang disorot. Bagian tulisan langsung muncul di halaman dan tutorial otomatis lanjut.",
      },
      {
        id: "isi-tulisan",
        route: "/admin/halaman/baru",
        selector: 'textarea[placeholder="Tulis isi paragraf…"]',
        waitFor: 'textarea[placeholder="Tulis isi paragraf…"]',
        title: "Langkah 3: tulis isi bagian pertama",
        body: "Klik kolom tulisan yang disorot lalu ketik isinya, misalnya sambutan singkat sekolah. Hasilnya langsung terlihat di panel tampilan samping. Kalau panduan belum pindah ke sini, berarti blok teksnya belum dibuat, pencet Sebelumnya lalu ulangi langkah 1.",
      },
      {
        id: "gandakan",
        route: "/admin/halaman/baru",
        selector: '[data-tour="blok-duplikat"]',
        title: "Langkah 4: gandakan bagian",
        body: "Klik tombol Duplikat untuk menyalin bagian ini. Cocok kalau mau membuat bagian mirip tanpa mengetik ulang, lalu ubah sedikit isinya.",
      },
      {
        id: "susun-urutan",
        route: "/admin/halaman/baru",
        selector: '[data-tour="blok-pindah"]',
        title: "Langkah 5: atur urutan bagian",
        body: "Pakai tombol panah atas dan bawah untuk menggeser bagian. Urutan di sini sama persis dengan urutan yang dilihat pengunjung.",
      },
      {
        id: "cek-tampilan",
        route: "/admin/halaman/baru",
        selector: '[data-tour="halaman-preview"]',
        title: "Langkah 6: cek tampilan",
        body: "Lihat panel tampilan langsung di samping untuk memastikan susunan dan tulisan sudah rapi sebelum diterbitkan.",
      },
      {
        id: "terbit",
        route: "/admin/halaman/baru",
        selector: '[data-tour="halaman-publish"]',
        title: "Langkah 7: terbitkan halaman",
        body: "Pastikan pilihan Tayangkan ke website menyala, lalu klik Simpan dan tayangkan. Selesai, halaman langsung tampil di situs.",
      },
    ],
  },
];

export function getTutorial(id: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.id === id);
}
