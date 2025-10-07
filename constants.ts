import type { AppView } from './types';
import { isApiKeyFeatureEnabled } from './featureFlags';

export const INVITE_CODES = [
  { code: 'ADMOR94', durationMinutes: 172800 }, // 120 days
  { code: 'UTHEBAT', durationMinutes: 20 },
  { code: 'UTMAJU', durationMinutes: 15 },
  { code: 'UTCOBA', durationMinutes: 10 },
  { code: 'GSAID25778', durationMinutes: 30 },
  { code: 'GSAID25779', durationMinutes: 30 },
  { code: 'GSAID25780', durationMinutes: 30 },
  { code: 'GSAID25781', durationMinutes: 30 },
  { code: 'GSAID25782', durationMinutes: 30 },
  { code: 'GSAID25783', durationMinutes: 30 },
  { code: 'GSAID25784', durationMinutes: 30 },
  { code: 'GSAID25785', durationMinutes: 30 },
  { code: 'GSAID25786', durationMinutes: 30 },
  { code: 'GSAID25787', durationMinutes: 30 },
  { code: 'RADINALLSHARE', durationMinutes: -1 }
];

export const FACULTIES = [
  "Fakultas Ekonomi dan Bisnis (FEB)",
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains dan Teknologi (FST)",
  "Fakultas Hukum Ilmu Sosial dan Ilmu Politik (FHISIP)",
  "Sekolah Pascasarjana (SPs)",
];

export const STUDY_PROGRAMS: { [key: string]: string[] } = {
  "Fakultas Ekonomi dan Bisnis (FEB)": ["Manajemen", "Ekonomi Pembangunan", "Ekonomi Syariah", "Akuntansi", "Akuntansi Keuangan Publik", "Pariwisata", "Kewirausahaan"],
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)": ["Pendidikan Bahasa dan Sastra Indonesia", "Pendidikan Bahasa Inggris", "Pendidikan Biologi", "Pendidikan Fisika", "Pendidikan Kimia", "Pendidikan Matematika", "Pendidikan Ekonomi", "Pendidikan Pancasila dan Kewarganegaraan", "Teknologi Pendidikan", "Pendidikan Guru Sekolah Dasar (PGSD)", "Pendidikan Guru Pendidikan Anak Usia Dini (PGPAUD)", "Program Pendidikan Profesi Guru (PPG)", "Pendidikan Agama Islam (PAI)"],
  "Fakultas Sains dan Teknologi (FST)": ["Statistika", "Matematika", "Biologi", "Teknologi Pangan", "Agribisnis", "Perencanaan Wilayah dan Kota", "Sistem Informasi", "Sains Data"],
  "Fakultas Hukum Ilmu Sosial dan Ilmu Politik (FHISIP)": ["Kearsipan (D4)", "Perpajakan (D3)", "Administrasi Negara (S1)", "Administrasi Bisnis (S1)", "Hukum (S1)", "Ilmu Pemerintahan (S1)", "Ilmu Komunikasi (S1)", "Ilmu Perpustakaan (S1)", "Sosiologi (S1)", "Sastra Inggris (S1)", "Perpajakan (S1)"],
  "Sekolah Pascasarjana (SPs)": [
    "Magister Studi Lingkungan (S2)",
    "Magister Manajemen Perikanan (S2)",
    "Magister Administrasi Publik (S2)",
    "Magister Manajemen (S2)",
    "Magister Pendidikan Dasar (S2)",
    "Magister Pendidikan Matematika (S2)",
    "Magister Pendidikan Bahasa Inggris (S2)",
    "Magister Pendidikan Anak Usia Dini (MPAD) (S2)",
    "Magister Hukum (S2)",
    "Doktor Ilmu Manajemen (S3)",
    "Doktor Administrasi Publik (S3)"
  ],
};

interface CardData {
  title: string;
  description: string;
  targetView: AppView;
}

interface SectionData {
  title: string;
  description: string;
  cards: CardData[];
}

export interface HubPageData {
  pageTitle: string;
  pageDescription: string;
  sections: SectionData[];
}

export const HUB_PAGES_DATA: Record<string, HubPageData> = {
  'Belajar & Latihan': {
    pageTitle: 'Belajar & Latihan',
    pageDescription: 'Tingkatkan pemahaman, asah kemampuan berpikir kritis, dan uji pengetahuan Anda di sini.',
    sections: [
      {
        title: 'Metode Belajar Terstruktur',
        description: 'Buat rencana belajar dan kuasai materi dengan metode yang telah teruji.',
        cards: [
          { title: 'Rencana Belajar', description: 'Buat rencana belajar terstruktur berdasarkan materi dan metode pilihan Anda.', targetView: 'Rencana Belajar' },
          { title: 'Rencana Belajar +Plus', description: 'Rencana belajar terstruktur dengan integrasi teknik manajemen waktu untuk efisiensi maksimal.', targetView: 'Rencana Belajar +Plus' },
          { title: 'Metode Membaca Intensif', description: 'Fokus pada pemahaman mendalam dan analisis detail dari materi bacaan yang kompleks.', targetView: 'Metode Membaca Intensif' },
          { title: 'Metode Membaca Ekstensif', description: 'Tingkatkan kecepatan membaca dan pemahaman umum dengan membaca banyak materi secara cepat.', targetView: 'Metode Membaca Ekstensif' },
          { title: 'Teknik Manajemen Waktu', description: 'Terapkan berbagai teknik manajemen waktu untuk memaksimalkan produktivitas Anda.', targetView: 'Teknik Manajemen Waktu' },
        ],
      },
      {
        title: 'Latihan Interaktif & Simulasi',
        description: 'Simulasikan berbagai peran untuk memperdalam pemahaman dan kemampuan argumentasi Anda.',
        cards: [
          { title: 'Diskusi dengan ABM-UT', description: 'Diskusikan topik atau materi apa pun secara mendalam dengan ABM-UT.', targetView: 'Diskusi dengan ABM-UT' },
          { title: 'Konsultasi Belajar ABM-UT', description: 'Dapatkan bimbingan dan wawasan dari ABM-UT yang berperan sebagai mentor berpengalaman.', targetView: 'Konsultasi Belajar ABM-UT' },
          { title: 'Debat Cerdas dengan ABM-UT', description: 'Asah kemampuan argumentasi Anda dengan berdebat melawan ABM-UT yang mengambil berbagai persona.', targetView: 'Debat Cerdas dengan ABM-UT' },
          { title: 'Teknik Feynman', description: 'Jelaskan sebuah konsep dengan bahasa sederhana seolah-olah Anda sedang mengajari orang lain.', targetView: 'Teknik Feynman' },
          { title: 'Ruang Kerja Kelompok Belajar', description: 'Simulasikan sesi kerja kelompok dengan ABM-UT sebagai fasilitator dan anggota tim virtual.', targetView: 'Ruang Kerja Kelompok Belajar' },
        ],
      },
       {
        title: 'Uji Pengetahuan',
        description: 'Uji pemahaman Anda dengan membuat kuis pilihan ganda dari materi yang Anda pelajari.',
        cards: [
          { title: 'Flashcards', description: 'Buat dan gunakan kartu flash interaktif untuk menghafal konsep-konsep kunci.', targetView: 'Flashcards' },
          { title: 'Kuis Pilihan Ganda', description: 'Uji pemahaman Anda dengan membuat kuis pilihan ganda dari materi yang Anda pelajari.', targetView: 'Kuis Pilihan Ganda' },
        ]
      }
    ],
  },
  'Produktivitas & Riset': {
    pageTitle: 'Produktivitas & Riset',
    pageDescription: 'Alat bantu untuk meningkatkan kualitas tulisan akademis, menganalisis ide, dan bersiap untuk ujian.',
     sections: [
      {
        title: 'Alat Bantu Penulisan',
        description: 'Tingkatkan efisiensi dan kualitas tulisan akademis Anda.',
        cards: [
          { title: 'Buat Rangkuman Materi', description: 'Unggah atau tempel materi kuliah, dan biarkan ABM-UT membuat ringkasan yang padat.', targetView: 'Buat Rangkuman Materi' },
          { title: 'Asisten Sitasi', description: 'Dapatkan bantuan untuk memformat kutipan dan daftar pustaka dalam berbagai gaya (APA, MLA, Chicago).', targetView: 'Asisten Sitasi' },
          { title: 'Parafrasa & Gaya Bahasa', description: 'Ubah kalimat untuk menghindari plagiarisme dan perbaiki gaya bahasa tulisan Anda.', targetView: 'Parafrasa & Gaya Bahasa' },
          { title: 'Perancang Argumen', description: 'Bangun argumen yang kuat dan terstruktur untuk esai atau karya ilmiah Anda.', targetView: 'Perancang Argumen' },
        ]
      },
      {
        title: 'Simulasi & Persiapan Ujian',
        description: 'Analisis informasi, sintesis ide-ide kompleks, dan bersiap untuk ujian.',
        cards: [
          { title: 'Analisis Studi Kasus', description: 'Dapatkan bantuan untuk membedah dan menganalisis studi kasus secara mendalam.', targetView: 'Analisis Studi Kasus' },
          { title: 'Workspace Karya Ilmiah', description: 'Ruang kerja terintegrasi untuk mengelola catatan, draf, dan referensi untuk Karya Ilmiah Anda.', targetView: 'Workspace Karya Ilmiah' },
          { title: 'Sintesis Teori', description: 'Bandingkan dan gabungkan berbagai teori atau literatur untuk menciptakan pemahaman baru.', targetView: 'Sintesis Teori' },
          { title: 'Latihan Ujian Akhir', description: 'Simulasikan kondisi Ujian Akhir Semester untuk menguji kesiapan dan pemahaman materi Anda.', targetView: 'Latihan Ujian Akhir' },
          { title: 'Prediksi Nilai UAS', description: 'Kalkulator untuk memprediksi skor UAS yang dibutuhkan & mendapatkan saran belajar yang dipersonalisasi.', targetView: 'Prediksi Nilai UAS' },
        ]
      }
    ]
  },
  'Tutorial Online': {
    pageTitle: 'Tutorial Online',
    pageDescription: 'Fitur untuk membantu Anda memahami materi dan mempersiapkan diri untuk diskusi tutorial online (Tuton).',
    sections: [{
      title: 'Persiapan Tuton',
      description: 'Analisis materi sesi Tuton untuk mendapatkan pemahaman komprehensif sebelum berdiskusi.',
      cards: [
        { title: 'Pemahaman Materi', description: 'Analisis mendalam materi per sesi Tuton, mulai dari pengantar, inisiasi, hingga pengayaan.', targetView: 'Pemahaman Materi' },
        { title: 'Pemahaman Diskusi', description: 'Analisis mendalam pertanyaan diskusi Tuton dan sintesis jawaban komprehensif bersama ABM-UT.', targetView: 'Pemahaman Diskusi' },
        { title: 'Asisten BMP', description: 'Unggah BMP Anda dan ajukan pertanyaan spesifik tentang isinya untuk mendapatkan penjelasan mendalam.', targetView: 'Asisten BMP' },
        { title: 'Eksperimental', description: 'Alur kerja terpandu untuk penyelesaian tugas komprehensif.', targetView: 'Eksperimental' },
      ],
    }]
  },
  'Riwayat & Pelacakan': {
    pageTitle: 'Riwayat & Pelacakan',
    pageDescription: 'Lacak riwayat belajar interaktif, kelola pengingat, dan organisir sesi Anda dalam folder.',
    sections: [{
      title: 'Manajemen & Pelacakan',
      description: 'Akses riwayat sesi, pengingat, dan organisir pekerjaan Anda.',
      cards: [
        { title: 'Riwayat Belajar Mahasiswa', description: 'Lihat kembali semua sesi interaksi Anda dengan ABM-UT.', targetView: 'Riwayat Belajar Mahasiswa' },
        { title: 'Lacak Pengingat', description: 'Lihat, kelola, dan hapus semua pengingat tenggat waktu yang pernah Anda buat.', targetView: 'Lacak Pengingat' },
        { title: 'Folder Mata Kuliah', description: 'Kelompokkan dan lihat riwayat belajar Anda berdasarkan mata kuliah tertentu.', targetView: 'Folder Mata Kuliah' },
        { title: 'Folder Pribadi', description: 'Buat folder kustom untuk mengorganisir riwayat belajar Anda.', targetView: 'Folder Pribadi' },
      ]
    }]
  },
  'Seputar UT': {
    pageTitle: 'Seputar Universitas Terbuka',
    pageDescription: 'Informasi penting dan sumber daya terkait kegiatan akademik di Universitas Terbuka.',
    sections: [{
      title: 'Informasi Akademik',
      description: 'Akses jadwal penting dan informasi lainnya seputar perkuliahan di UT.',
      cards: [
        { title: 'Panduan Lengkap UT', description: 'Jawaban komprehensif dari A-Z tentang sistem perkuliahan, biaya, dan pendaftaran di Universitas Terbuka.', targetView: 'Panduan Lengkap UT' },
        { title: 'Kalender Akademik', description: 'Lihat jadwal dan tanggal-tanggal penting untuk kegiatan akademik program Sarjana/Diploma.', targetView: 'Kalender Akademik' },
        { title: 'Informasi UT Daerah', description: 'Temukan alamat dan situs web resmi semua kantor Universitas Terbuka di seluruh Indonesia.', targetView: 'Informasi UT Daerah' },
        { title: 'Informasi & Layanan UT', description: 'Temukan informasi kontak dan berbagai layanan digital yang disediakan oleh Universitas Terbuka.', targetView: 'Informasi & Layanan UT' },
        { title: 'Referensi Akademik', description: 'Kumpulan situs web untuk mencari referensi makalah, buku, skripsi, tesis, dan disertasi.', targetView: 'Referensi Akademik' },
      ]
    }]
  },
  'Pengaturan & Bantuan': {
    pageTitle: 'Pengaturan & Bantuan',
    pageDescription: 'Atur preferensi aplikasi, kelola data, dan temukan bantuan yang Anda perlukan.',
    sections: [
      {
        title: 'Manajemen Aplikasi',
        description: 'Kelola data dan konektivitas aplikasi.',
        cards: [
          { title: 'Integrasi API', description: 'Aktifkan semua fitur PRO dengan menggunakan Kunci API Gemini Anda sendiri.', targetView: 'Integrasi API' },
          { title: 'Model & Instruksi Sistem', description: 'Kustomisasi model dan gaya respons AI sesuai preferensi Anda.', targetView: 'Pengaturan Lanjutan' },
          { title: 'Reset Aplikasi', description: 'Hapus semua data lokal (profil, riwayat, login) dan mulai dari awal.', targetView: 'Reset Aplikasi' },
        ]
      },
      {
        title: 'Informasi & Bantuan',
        description: 'Dapatkan jawaban, dan lihat pembaruan terbaru dari aplikasi.',
        cards: [
          { title: 'FAQ', description: 'Temukan jawaban atas pertanyaan yang sering diajukan tentang ABM-UT.', targetView: 'FAQ' },
          { title: 'Panduan Integrasi API', description: 'Langkah-langkah untuk mendapatkan dan menggunakan Kunci API Gemini Anda sendiri.', targetView: 'Panduan Integrasi API' },
          { title: 'Dokumentasi Pembaruan', description: 'Lihat catatan rilis dan pembaruan fitur terbaru dari aplikasi.', targetView: 'Dokumentasi Pembaruan' },
          { title: 'Tentang Aplikasi', description: 'Pelajari lebih lanjut tentang misi, fitur, dan tim di balik ABM-UT.', targetView: 'Tentang Aplikasi' },
        ]
      }
    ]
  }
};

if (!isApiKeyFeatureEnabled) {
  // Filter out API-related cards from Pengaturan
  const pengaturanCards = HUB_PAGES_DATA['Pengaturan & Bantuan'].sections[0].cards;
  HUB_PAGES_DATA['Pengaturan & Bantuan'].sections[0].cards = pengaturanCards.filter(
    card => card.targetView !== 'Integrasi API'
  );

  // Filter out API-related cards from Informasi
  const informasiCards = HUB_PAGES_DATA['Pengaturan & Bantuan'].sections[1].cards;
  HUB_PAGES_DATA['Pengaturan & Bantuan'].sections[1].cards = informasiCards.filter(
    card => card.targetView !== 'Panduan Integrasi API'
  );
}


export const PARENT_VIEW_MAP: Partial<Record<AppView, AppView>> = {
    // This entry is now redundant because it will be generated by the loop below, but it's harmless.
    'Eksperimental': 'Tutorial Online',
};
Object.keys(HUB_PAGES_DATA).forEach(parentViewStr => {
  const parentView = parentViewStr as AppView;
  const hubData = HUB_PAGES_DATA[parentView];
  hubData.sections.forEach(section => {
    section.cards.forEach(card => {
      PARENT_VIEW_MAP[card.targetView] = parentView;
    });
  });
});