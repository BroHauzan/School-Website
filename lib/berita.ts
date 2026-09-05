export type BeritaItem = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  tag: string;
  image: string;
  featured?: boolean;
  body: string[];
};

/**
 * Data berita — satu sumber untuk section homepage, arsip /berita,
 * dan halaman detail /berita/[slug].
 * // TODO: ganti dengan data dinamis (API/headless CMS) sebelum publikasi.
 */
export const BERITA: BeritaItem[] = [
  {
    slug: "kelas-tahfidz-gelar-uji-tasmi",
    date: "26 Januari 2025",
    title: "Kelas Tahfidz Gelar Uji Tasmi'",
    excerpt:
      "Siswa kelas tahfidz SMASA mempresentasikan hafalannya dalam uji tasmi' — momen penguatan karakter religius di luar jam akademik.",
    tag: "Kesiswaan",
    image: "/hero-school.webp",
    featured: true,
    body: [
      "Siswa kelas tahfidz SMAN 1 Lumajang mempresentasikan hafalan Al-Qurannya dalam kegiatan uji tasmi' yang digelar di lingkungan sekolah. Kegiatan ini menjadi ajang evaluasi sekaligus penguatan mental bagi para penghafal sebelum melanjutkan ke target hafalan berikutnya.",
      "Uji tasmi' dilaksanakan di luar jam akademik agar tidak mengganggu kegiatan belajar mengajar. Setiap peserta menyetorkan hafalannya di hadapan penguji dan disaksikan oleh teman sekelas, sehingga melatih keberanian, ketelitian, dan keistiqamahan.",
      "Melalui program tahfidz, sekolah berharap tumbuh karakter religius yang kuat pada diri siswa — jujur, disiplin, dan bertanggung jawab terhadap amanah hafalannya. Program ini juga menjadi bagian dari pembinaan akhlak yang berjalan beriringan dengan prestasi akademik.",
      "Ke depan, kegiatan serupa akan digelar secara berkala setiap semester. Sekolah mengapresiasi seluruh peserta, pembimbing, dan orang tua yang terus mendukung keberlangsungan kelas tahfidz.",
    ],
  },
  {
    slug: "gencar-meningkatkan-karakter-judista-dan-gcb",
    date: "26 Januari 2025",
    title: "Gencar Meningkatkan Karakter JUDISTA dan GCB",
    excerpt:
      "Kampanye Jujur–Disiplin–Tanggung Jawab bersama Gerakan Cinta Bumi digencarkan ke seluruh warga sekolah sebagai budaya harian.",
    tag: "Karakter",
    image: "/hero-school.webp",
    body: [
      "SMAN 1 Lumajang menggencarkan penguatan karakter JUDISTA — Jujur, Disiplin, dan Tanggung Jawab — ke seluruh warga sekolah. Kampanye ini dijalankan sebagai budaya harian, bukan sekadar slogan yang ditempel di dinding kelas.",
      "Bersamaan dengan itu, Gerakan Cinta Bumi (GCB) kembali digaungkan melalui aksi nyata: memilah sampah, mengurangi plastik sekali pakai, dan merawat lingkungan sekolah. Setiap kelas diajak bertanggung jawab atas kebersihan dan kehijauan areanya masing-masing.",
      "Penguatan karakter dilakukan lewat pembiasaan pagi, keteladanan guru dan karyawan, serta apresiasi bagi siswa yang menunjukkan perilaku terpuji. Sekolah meyakini karakter baik tumbuh dari hal kecil yang dilakukan konsisten setiap hari.",
      "Dengan JUDISTA dan GCB, SMASA menargetkan lulusan yang tidak hanya unggul secara akademik, tetapi juga berintegritas dan peduli terhadap lingkungan sekitarnya.",
    ],
  },
  {
    slug: "upacara-bendera-pertama-2025-smasa-ukir-prestasi",
    date: "25 Januari 2025",
    title: "Upacara Bendera Pertama di Tahun 2025, SMASA Ukir Prestasi",
    excerpt:
      "Upacara awal semester menjadi panggung apresiasi: siswa dan guru menerima penghargaan atas capaian prestasi sepanjang semester lalu.",
    tag: "Prestasi",
    image: "/hero-school.webp",
    body: [
      "Upacara bendera pertama di tahun 2025 menjadi momen istimewa bagi keluarga besar SMAN 1 Lumajang. Selain menandai dimulainya semester baru, upacara ini juga menjadi panggung apresiasi bagi siswa dan guru berprestasi.",
      "Penghargaan diberikan atas capaian sepanjang semester lalu — mulai dari prestasi akademik, lomba karya tulis, hingga kejuaraan olahraga dan seni di tingkat kabupaten sampai nasional. Nama-nama penerima dibacakan di hadapan seluruh peserta upacara.",
      "Kepala sekolah dalam amanatnya menegaskan bahwa prestasi lahir dari proses panjang: disiplin belajar, keberanian mencoba, dan kemauan untuk gagal lalu bangkit lagi. Sekolah berkomitmen memfasilitasi setiap potensi siswa melalui pembinaan dan pendampingan.",
      "Semangat awal tahun ini diharapkan menjadi bahan bakar bagi seluruh warga sekolah untuk mengukir capaian yang lebih tinggi di semester berjalan.",
    ],
  },
  {
    slug: "peringatan-hari-santri-nasional-2024",
    date: "22 Oktober 2024",
    title: "Peringatan Hari Santri Nasional 2024",
    excerpt:
      "Hari Santri diperingati setiap 22 Oktober sejak ditetapkan Presiden Joko Widodo pada 2015, tertuang dalam Keputusan Presiden.",
    tag: "Peringatan",
    image: "/hero-school.webp",
    body: [
      "SMAN 1 Lumajang turut memperingati Hari Santri Nasional yang jatuh setiap tanggal 22 Oktober. Peringatan ini merujuk pada penetapan Presiden Joko Widodo pada tahun 2015 melalui Keputusan Presiden sebagai bentuk pengakuan atas peran santri dalam sejarah bangsa.",
      "Tanggal 22 Oktober dipilih merujuk pada seruan Resolusi Jihad yang dikobarkan para ulama dan santri dalam mempertahankan kemerdekaan Indonesia. Semangat juang tersebut menjadi teladan bagi generasi muda masa kini.",
      "Melalui peringatan ini, siswa diajak meneladani nilai-nilai kesantrian: keikhlasan dalam belajar, hormat kepada guru, cinta tanah air, dan kemandirian. Nilai-nilai tersebut sejalan dengan karakter yang terus ditanamkan di lingkungan SMASA.",
      "Sekolah berharap momentum Hari Santri memperkuat persatuan dan toleransi di tengah keberagaman warga sekolah, sekaligus menumbuhkan kebanggaan atas khazanah keislaman nusantara.",
    ],
  },
];

export function getBerita(slug: string): BeritaItem | undefined {
  return BERITA.find((item) => item.slug === slug);
}

export function getBeritaLain(slug: string, count = 3): BeritaItem[] {
  const others = BERITA.filter((item) => item.slug !== slug);
  return others.slice(0, count);
}
