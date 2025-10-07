import React from 'react';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import DOMPurify from 'dompurify';

interface FaqPageProps {
  setActiveView: (view: AppView) => void;
  studentData: StudentData | null;
}

const categorizedFaqs = {
  "Umum & Dasar": [
    {
      question: "Apa itu ABM-UT?",
      answer: "ABM-UT adalah singkatan dari Asisten Belajar Mahasiswa - Universitas Terbuka. Ini adalah aplikasi berbasis kecerdasan buatan (AI) yang dirancang khusus sebagai mitra belajar bagi mahasiswa UT, membantu dalam perencanaan studi, pemahaman materi, penulisan, hingga persiapan ujian."
    },
    {
      question: "Apakah data profil saya aman?",
      answer: "Ya. Semua data profil yang Anda masukkan (nama, jurusan, dll.) disimpan secara lokal di browser Anda menggunakan `localStorage`. Data ini tidak dikirim atau disimpan di server eksternal, sehingga privasi Anda terjaga."
    },
    {
      question: "Apakah ABM-UT selalu memberikan jawaban yang 100% benar?",
      answer: "Tidak selalu. Meskipun sangat canggih, ABM-UT dapat membuat kesalahan atau memberikan informasi yang tidak akurat (dikenal sebagai 'halusinasi'). Sangat penting untuk selalu memverifikasi informasi krusial yang dihasilkan oleh ABM-UT dengan sumber-sumber akademis yang tepercaya. Anggap ABM-UT sebagai asisten untuk brainstorming dan draf awal, bukan sebagai sumber kebenaran mutlak."
    },
    {
      question: "Apa perbedaan antara 'Mode Uji Coba' dan 'Mode API Key'?",
      answer: "<strong>Mode Uji Coba (Kode Invite):</strong> Menggunakan kunci API bersama dengan batasan waktu. Riwayat belajar umumnya tidak disimpan permanen (kecuali untuk kode eksklusif seperti `ADMOR94`) dan akan hilang saat sesi berakhir. Cocok untuk mencoba fitur-fitur aplikasi. <br><strong>Mode API Key:</strong> Menggunakan kunci API Google Gemini pribadi Anda. Mode ini membuka semua fitur tanpa batas waktu dan menyimpan riwayat belajar Anda secara permanen di browser."
    },
  ],
  "Metode Belajar & Produktivitas": [
    {
        question: "Apa perbedaan 'Rencana Belajar' dan 'Rencana Belajar +Plus'?",
        answer: "<strong>Rencana Belajar</strong> berfokus pada pembagian materi menjadi sesi-sesi belajar yang terstruktur berdasarkan metode belajar pilihan (misalnya SQ3R). <br><strong>Rencana Belajar +Plus</strong> adalah versi yang lebih canggih; ABM-UT tidak hanya membuat rencana belajar, tetapi juga menganalisis dan merekomendasikan teknik manajemen waktu (seperti Pomodoro) yang paling cocok, mengintegrasikannya ke dalam jadwal, dan memberikan saran belajar personal di akhir."
    },
    {
        question: "Apa fungsi dari 'Flashcards' dan 'Kuis Pilihan Ganda'?",
        answer: "Keduanya adalah alat bantu untuk menguji pemahaman. Anda cukup mengunggah atau menempelkan materi, dan ABM-UT akan secara otomatis membuat kartu-kartu flash interaktif atau soal kuis pilihan ganda lengkap dengan penjelasan. Ini sangat efektif untuk mempersiapkan diri sebelum ujian."
    }
  ],
  "Asisten Interaktif": [
    {
      question: "Apa bedanya 'Diskusi', 'Konsultasi', 'Debat Cerdas', dan 'Teknik Feynman'?",
      answer: "Setiap fitur memiliki peran ABM-UT yang berbeda: <br><strong>Diskusi dengan ABM-UT:</strong> ABM-UT berperan sebagai teman sejawat yang cerdas. <br><strong>Konsultasi Belajar:</strong> ABM-UT berperan sebagai mentor atau dosen yang profesional. <br><strong>Debat Cerdas:</strong> ABM-UT menjadi lawan debat yang mengambil berbagai persona menantang (misal, Pengkritik Skeptis). <br><strong>Teknik Feynman:</strong> Anda 'mengajari' sebuah konsep kepada ABM-UT yang berperan sebagai murid awam."
    },
    {
      question: "Apa fungsi 'Ruang Kerja Kelompok Belajar'?",
      answer: "Fitur ini mensimulasikan sesi kerja kelompok. Anda memasukkan nama anggota tim, dan ABM-UT akan bertindak sebagai fasilitator sekaligus mensimulasikan anggota tim lainnya untuk brainstorming ide proyek atau memecahkan masalah bersama secara virtual."
    }
  ],
  "Alat Bantu Penulisan": [
    {
      question: "Bagaimana cara kerja 'Buat Rangkuman Materi'?",
      answer: "Anda dapat menempelkan teks atau mengunggah file. ABM-UT akan menganalisis konten dan membuat ringkasan sesuai jenis (paragraf, poin-poin, abstrak) dan panjang (singkat, sedang, panjang) yang Anda pilih."
    },
    {
      question: "Apa yang dilakukan 'Asisten Sitasi' dan 'Parafrasa & Gaya Bahasa'?",
      answer: "<strong>Asisten Sitasi</strong> membantu Anda membuat format kutipan dan daftar pustaka yang benar dalam gaya APA, MLA, atau Chicago. <br><strong>Parafrasa & Gaya Bahasa</strong> membantu Anda menulis ulang kalimat atau paragraf untuk menghindari plagiarisme dan memperbaiki gaya bahasa."
    },
     {
      question: "Bagaimana cara kerja 'Perancang Argumen'?",
      answer: "Ini bukan pembuat esai otomatis. Anda akan melalui sesi bimbingan interaktif di mana ABM-UT mengajukan pertanyaan-pertanyaan Sokratik (bertanya balik) untuk memandu Anda membangun kerangka argumen yang kuat—mulai dari tesis, bukti, sanggahan, hingga kesimpulan—berdasarkan pemikiran Anda sendiri."
    }
  ],
  "Simulasi & Riset": [
     {
      question: "Apa kegunaan 'Analisis Studi Kasus'?",
      answer: "Gunakan fitur ini untuk menerapkan kerangka kerja teoretis (seperti SWOT, PESTLE, atau Porter's Five Forces) pada sebuah skenario bisnis atau sosial. Anda cukup memberikan teks kasus dan memilih metode analisisnya."
    },
    {
      question: "Apa itu 'Workspace Karya Ilmiah' dan 'Sintesis Teori'?",
      answer: "<strong>Workspace Karya Ilmiah</strong> memberikan bimbingan terstruktur untuk tahapan awal penulisan akademis, seperti membantu merumuskan judul atau membuat draf abstrak. <br><strong>Sintesis Teori</strong> memungkinkan Anda menganalisis satu fenomena dari berbagai 'kacamata' teori yang berbeda, lalu membandingkan hasilnya."
    },
     {
        question: "Bagaimana 'Latihan Ujian Akhir' dan 'Prediksi Nilai UAS' membantu saya?",
        answer: "<strong>Latihan Ujian Akhir</strong> menghasilkan paket persiapan lengkap (ringkasan, poin kunci, soal latihan) dari semua materi yang Anda berikan untuk satu mata kuliah. <br><strong>Prediksi Nilai UAS</strong> adalah kalkulator untuk menghitung skor UAS minimum yang Anda butuhkan, lengkap dengan saran belajar personal dari ABM-UT."
    }
  ],
  "Tutorial Online (Tuton)": [
    {
        question: "Apa perbedaan 'Pemahaman Materi' dan 'Pemahaman Diskusi'?",
        answer: "<strong>Pemahaman Materi</strong> digunakan di awal sesi Tuton. Anda mengunggah semua materi (inisiasi, pengayaan, BMP), dan ABM-UT membuat satu ringkasan komprehensif. <br><strong>Pemahaman Diskusi</strong> digunakan untuk tugas diskusi. ABM-UT membuat draf jawaban awal, lalu memandu Anda melalui sesi tanya jawab untuk memperdalam pemahaman sebelum menghasilkan jawaban akhir yang disintesis."
    },
     {
        question: "Bagaimana cara menggunakan 'Asisten BMP'?",
        answer: "Fitur ini memungkinkan Anda untuk 'berbicara' langsung dengan Buku Materi Pokok (BMP) Anda. Unggah file BMP (PDF), dan Anda bisa bertanya apa pun tentang isinya. ABM-UT akan menjawab secara spesifik berdasarkan konten dari file yang Anda unggah."
    }
  ],
  "Pelacakan & Pengaturan": [
    {
      question: "Apa fungsi 'Riwayat Belajar' dan berbagai jenis 'Folder'?",
      answer: "<strong>Riwayat Belajar</strong> menyimpan semua sesi interaktif Anda agar bisa dilanjutkan atau diunduh. Halaman ini juga menampilkan <strong>visualisasi data</strong> aktivitas Anda. <br><strong>Folder Mata Kuliah</strong> secara otomatis mengelompokkan riwayat berdasarkan mata kuliah yang Anda lacak. <br><strong>Folder Pribadi</strong> memungkinkan Anda membuat kategori kustom untuk mengorganisir riwayat sesuai keinginan Anda."
    },
     {
      question: "Apa itu 'Instruksi Sistem' di Pengaturan Lanjutan?",
      answer: "Fitur ini memungkinkan Anda untuk memberikan instruksi permanen yang akan memengaruhi semua respons ABM-UT di seluruh aplikasi. Misalnya, Anda bisa menginstruksikannya untuk 'selalu menjawab dalam bahasa Inggris formal' atau 'bertindak sebagai seorang peneliti yang skeptis'. Ini adalah cara canggih untuk mengkustomisasi perilaku ABM-UT."
    },
    {
      question: "Apa fungsi 'Reset Aplikasi'?",
      answer: "Tindakan ini akan <strong>menghapus semua data Anda secara permanen</strong> dari browser, termasuk profil, riwayat belajar, dan status login. Gunakan dengan hati-hati, karena tindakan ini tidak dapat diurungkan."
    }
  ]
};

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  return (
    <details className="bg-gray-800/50 rounded-lg group transition-all duration-300 open:bg-gray-800/70 open:shadow-lg">
      <summary className="p-5 cursor-pointer flex justify-between items-center font-semibold text-lg text-ut-blue-light font-display list-none">
        {question}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-5 pt-0 text-gray-300 border-t border-gray-700/50">
        <p className="pt-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(answer) }}></p>
      </div>
    </details>
  );
};

export const FaqPage: React.FC<FaqPageProps> = ({ setActiveView, studentData }) => {
  const parentView = PARENT_VIEW_MAP['FAQ'];
  const studentName = studentData?.name || "Mahasiswa";

  return (
    <section id="FAQ" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-white font-display">FAQ (Frequently Asked Questions)</h1>
        <p className="mt-2 text-lg text-gray-300 max-w-4xl">Temukan jawaban atas pertanyaan yang sering diajukan tentang ABM-UT.</p>
      </div>
      
      <div className="w-full max-w-5xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
        <PageHeader
          parentView={parentView}
          setActiveView={setActiveView}
        />

        <div className="space-y-8">
            <div className="p-5 bg-gray-800/50 rounded-lg border-l-4 border-ut-blue-light text-center">
                <p className="text-lg text-gray-200">
                    Halo {studentName}, selamat datang di pusat bantuan ABM-UT!
                </p>
                <p className="mt-2 text-gray-400">
                    Mungkin Anda bertanya-tanya bagaimana cara memaksimalkan semua fitur canggih yang ada. Jangan khawatir, saya sudah siapkan panduan ini agar Anda tidak tersesat. Mari kita mulai!
                </p>
            </div>

            {Object.entries(categorizedFaqs).map(([category, faqs]) => (
                <div key={category}>
                    <h2 className="text-2xl font-semibold text-white font-display mb-4 border-b-2 border-gray-700 pb-2">{category}</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FaqItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};