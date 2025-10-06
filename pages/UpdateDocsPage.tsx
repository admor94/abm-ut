import React from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import DOMPurify from 'dompurify';

interface UpdateDocsPageProps {
  setActiveView: (view: AppView) => void;
}

interface UpdateChange {
  newFeatures?: string[];
  improvements?: string[];
  bugFixes?: string[];
}

interface Update {
  version: string;
  date: string;
  title: string;
  changes: UpdateChange;
}

const updates: Update[] = [
    {
        version: "v1.9.0",
        date: "06 Oktober 2025",
        title: "Kustomisasi AI & Keamanan",
        changes: {
            newFeatures: [
                "Meluncurkan halaman <strong>Pengaturan Lanjutan</strong> yang dapat diakses dari menu Pengaturan.",
                "Menambahkan fitur <strong>Instruksi Sistem Global</strong>, memungkinkan pengguna untuk mengkustomisasi perilaku dan gaya respons AI di seluruh aplikasi.",
                "Menambahkan templat instruksi siap pakai (Tutor Sokratik, Editor Profesional, dll.) untuk memulai."
            ],
            improvements: [
                "Mengimplementasikan sistem login baru dengan dua opsi: <strong>Kode Invite</strong> untuk uji coba terbatas dan <strong>Kunci API Gemini</strong> untuk akses penuh.",
                "Membangun backend proxy serverless untuk menangani permintaan dari pengguna mode uji coba secara aman, menyembunyikan kunci API utama dari sisi klien.",
                "Menambahkan file `.gitignore` untuk memastikan file-file sensitif seperti `node_modules` dan `.env` tidak terunggah ke repositori publik."
            ]
        }
    },
     {
        version: "v1.8.0",
        date: "04 Oktober 2025",
        title: "Revolusi Tutorial Online & Pelacakan",
        changes: {
            newFeatures: [
                "Memperkenalkan menu baru: <strong>Tutorial Online (Tuton)</strong>.",
                "Meluncurkan fitur <strong>Pemahaman Materi</strong> untuk membuat ringkasan komprehensif dari materi inisiasi dan pengayaan.",
                "Meluncurkan fitur <strong>Pemahaman Diskusi</strong> untuk menganalisis pertanyaan diskusi dan mensintesis draf jawaban.",
                "Meluncurkan fitur <strong>Asisten BMP</strong>, memungkinkan pengguna untuk mengunggah BMP dan bertanya langsung mengenai isinya.",
                "Menambahkan fitur <strong>Folder Mata Kuliah</strong> di menu Pelacakan untuk mengorganisir riwayat belajar."
            ],
            improvements: [
                'Desain ulang total antarmuka Riwayat Belajar dengan tampilan kartu yang modern dan menu aksi (Lanjutkan, Unduh, Hapus) yang intuitif.',
                "Memperkenalkan fitur revolusioner <strong>'Lanjutkan Sesi'</strong> pada Riwayat Belajar, memungkinkan mahasiswa untuk melanjutkan sesi interaktif (Debat, Feynman, dll.) tepat di mana mereka tinggalkan."
            ]
        }
    },
    {
        version: "v1.7.0",
        date: "02 Oktober 2025",
        title: "Ekspansi Fitur Simulasi & Analisis",
        changes: {
            newFeatures: [
                'Meluncurkan fitur <strong>Sintesis Teori</strong> untuk menganalisis studi kasus menggunakan berbagai "kacamata" teoretis.',
                'Menambahkan fitur <strong>Persiapan Ujian Akhir</strong>, alat "semua dalam satu" untuk menghasilkan paket belajar komprehensif dari materi satu semester.',
                "Menambahkan fitur <strong>Prediksi Nilai UAS</strong>, sebuah kalkulator untuk menghitung skor UAS minimum yang dibutuhkan, lengkap dengan saran belajar personal dari AI."
            ],
            improvements: [
                'Memperbarui halaman "Tentang Aplikasi" dengan penjelasan mendalam mengenai teknologi Google Gemini yang digunakan.'
            ]
        }
    },
    {
        version: "v1.6.0",
        date: "30 September 2025",
        title: "Peluncuran Menu Simulasi & Riset",
        changes: {
            newFeatures: [
                'Memperkenalkan Menu baru: <strong>Simulasi & Riset</strong>.',
                'Menambahkan fitur <strong>Analisis Studi Kasus</strong> dengan metode terstruktur seperti SWOT, PESTLE, dan Porter\'s Five Forces.',
                'Menambahkan <strong>Workspace Karya Ilmiah</strong> untuk mendapatkan bimbingan terstruktur dalam tahapan penulisan (pemilihan judul, draf abstrak, kerangka karil).'
            ],
        }
    },
    {
        version: "v1.5.0",
        date: "27 September 2025",
        title: "Peningkatan Alat Bantu Penulisan",
        changes: {
            newFeatures: [
                'Menambahkan fitur <strong>Parafrasa & Gaya Bahasa</strong> untuk membantu menyempurnakan tulisan dan menghindari plagiarisme.',
                'Memperkenalkan fitur <strong>Perancang Argumen</strong>, sebuah alat bantu interaktif berbasis metode Sokratik untuk membangun kerangka argumen yang kuat.'
            ],
            bugFixes: [
                'Memperbaiki masalah format pada fitur unduh PDF di beberapa sesi interaktif.'
            ]
        }
    },
     {
        version: "v1.4.0",
        date: "25 September 2025",
        title: "Peluncuran Menu Alat Bantu",
        changes: {
            newFeatures: [
                'Memperkenalkan Menu baru: <strong>Alat Bantu Penulisan</strong>.',
                'Menambahkan fitur <strong>Buat Rangkuman Materi</strong> dari input teks atau unggahan file.',
                'Menambahkan fitur <strong>Asisten Sitasi</strong> untuk memformat kutipan dalam gaya APA, MLA, dan Chicago.',
                'Menambahkan halaman <strong>Dokumentasi Pembaruan</strong> ini untuk melacak semua perubahan.'
            ],
        }
    },
    {
        version: "v1.3.0",
        date: "22 September 2025",
        title: "Ekspansi Fitur Interaktif",
        changes: {
            newFeatures: [
                'Menambahkan mode interaktif <strong>Debat Cerdas</strong>, di mana mahasiswa dapat berdebat melawan berbagai persona AI yang menantang.',
                'Menambahkan mode interaktif <strong>Teknik Feynman</strong>, di mana mahasiswa menyederhanakan konsep sulit dengan "mengajari" AI yang berperan sebagai murid awam.',
                'Menambahkan fitur <strong>Ruang Kerja Kelompok Belajar</strong> untuk mensimulasikan sesi diskusi kelompok dengan AI sebagai fasilitator.'
            ]
        }
    },
    {
        version: "v1.2.0",
        date: "20 September 2025",
        title: "Fitur Uji Pengetahuan",
        changes: {
            newFeatures: [
                'Memperkenalkan fitur <strong>Flashcards</strong> yang dapat dibuat secara otomatis dari materi yang diberikan.',
                'Menambahkan fitur <strong>Kuis Pilihan Ganda</strong> yang juga dibuat otomatis oleh AI dari materi perkuliahan.'
            ],
        }
    },
    {
        version: "v1.1.0",
        date: "17 September 2025",
        title: "Fondasi Belajar & Produktivitas",
        changes: {
            newFeatures: [
                'Memperkenalkan Menu <strong>Metode Belajar</strong>.',
                'Menambahkan fitur <strong>Rencana Belajar</strong> dan <strong>Rencana Belajar +Plus</strong> untuk pembuatan jadwal belajar terstruktur.',
                'Menambahkan panduan statis untuk <strong>Metode Membaca</strong> dan <strong>Teknik Manajemen Waktu</strong>.',
                'Meluncurkan fitur <strong>Riwayat Belajar</strong> untuk melacak semua sesi interaktif.'
            ],
             improvements: [
                'Waktu respons ABM-UT dalam mode "Diskusi" dan "Konsultasi" dipercepat hingga 30%.'
            ],
        }
    },
    {
        version: "v1.0.0",
        date: "15 September 2025",
        title: "Peluncuran Awal ABM-UT",
        changes: {
            newFeatures: [
                'Peluncuran ABM-UT dengan fungsionalitas inti.',
                'Sistem Profil Mahasiswa untuk personalisasi pengalaman belajar.',
                'Dashboard utama yang menampilkan ringkasan profil dan pelacak tenggat waktu.',
                'Menu <strong>Asisten Interaktif</strong> dengan mode awal: <strong>Diskusi dengan ABM-UT</strong> dan <strong>Konsultasi Belajar</strong>.',
                'Menu <strong>Informasi</strong> dengan halaman <strong>FAQ</strong> dan <strong>Tentang Aplikasi</strong>.'
            ]
        }
    }
];

const ChangeCategory: React.FC<{ icon: string; title: string; items?: string[] }> = ({ icon, title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mt-4">
            <h4 className="font-semibold text-lg text-white font-display">{icon} {title}</h4>
            <ul className="mt-2 space-y-2 list-disc list-inside text-gray-300 pl-2">
                {items.map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }}></li>
                ))}
            </ul>
        </div>
    );
};

export const UpdateDocsPage: React.FC<UpdateDocsPageProps> = ({ setActiveView }) => {
  const parentView = PARENT_VIEW_MAP['Dokumentasi Pembaruan'];

  return (
    <section id="Dokumentasi-Pembaruan" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Dokumentasi Pembaruan</h1>
            <p className="mt-2 text-lg text-gray-300 max-w-4xl">Lihat catatan rilis dan pembaruan fitur terbaru dari aplikasi ABM-UT.</p>
        </div>
        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
            <PageHeader
                parentView={parentView}
                setActiveView={setActiveView}
            />

            <div className="space-y-8">
            {updates.map((update) => (
                <div key={update.version} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 transition-all duration-300 hover:border-ut-blue/50 hover:shadow-xl">
                <div className="border-b border-gray-700 pb-3 mb-3">
                    <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-2xl text-ut-blue-light font-display">{update.title}</h3>
                    <span className="text-sm font-semibold text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">{update.version}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{update.date}</p>
                </div>

                <ChangeCategory icon="🚀" title="Fitur Baru" items={update.changes.newFeatures} />
                <ChangeCategory icon="✨" title="Peningkatan" items={update.changes.improvements} />
                <ChangeCategory icon="🐞" title="Perbaikan Bug" items={update.changes.bugFixes} />
                </div>
            ))}
            </div>
        </div>
    </section>
  );
};