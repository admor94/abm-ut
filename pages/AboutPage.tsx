import React from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface AboutPageProps {
  setActiveView: (view: AppView) => void;
}

const SocialLink: React.FC<{ href: string, icon: React.ReactNode, label: string }> = ({ href, icon, label }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-gray-300 hover:text-ut-blue-light transition-colors duration-300 bg-gray-800/50 px-4 py-2 rounded-lg"
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </a>
);


export const AboutPage: React.FC<AboutPageProps> = ({ setActiveView }) => {
  const parentView = PARENT_VIEW_MAP['Tentang Aplikasi'];

  return (
    <section id="Tentang-Aplikasi" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Tentang ABM-UT: Asisten Belajar Mahasiswa Universitas Terbuka</h1>
        </div>
        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
            <PageHeader
                parentView={parentView}
                setActiveView={setActiveView}
            />

            <div className="mt-8 max-w-4xl space-y-8 prose prose-invert prose-lg">
                <div>
                    <h3 className="text-ut-blue-light not-prose">Visi & Misi</h3>
                    <h4>Visi</h4>
                    <p>Menjadi pionir dalam pemanfaatan kecerdasan buatan untuk menciptakan pengalaman belajar yang personal, adaptif, dan inklusif bagi seluruh mahasiswa Universitas Terbuka.</p>
                    <h4>Misi</h4>
                    <p>Menyediakan alat bantu belajar berbasis kecerdasan buatan yang cerdas untuk membantu mahasiswa memahami materi, mengasah kemampuan berpikir kritis, dan meraih kesuksesan akademik secara mandiri.</p>
                </div>
                <div>
                    <h3 className="text-ut-blue-light not-prose">Fitur Unggulan</h3>
                    <ul>
                        <li><strong>Asisten Interaktif:</strong> Terlibat dalam dialog mendalam, debat, atau simulasi mengajar untuk mengasah pemahaman konseptual dan kemampuan argumentasi Anda.</li>
                        <li><strong>Alat Bantu Penulisan & Kreativitas:</strong> Dari membuat rangkuman dan sitasi hingga merancang argumen, alat-alat ini dirancang untuk meningkatkan kualitas tulisan akademis dan efisiensi belajar Anda.</li>
                        <li><strong>Simulasi & Riset:</strong> Terapkan teori pada studi kasus praktis, persiapkan diri untuk ujian akhir, dan dapatkan bimbingan terstruktur untuk karya ilmiah Anda.</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-ut-blue-light not-prose">Teknologi di Balik ABM-UT</h3>
                    <h4>Teknologi apa yang digunakan dalam aplikasi ini?</h4>
                    <p>
                        ABM-UT didukung oleh <strong>Gemini</strong>, keluarga model kecerdasan buatan (AI) canggih yang dikembangkan oleh Google. Gemini dirancang untuk menjadi multimodal, yang berarti ia dapat memahami, memproses, dan menggabungkan berbagai jenis informasi seperti teks, gambar, dan kode. Kemampuannya dalam penalaran tingkat lanjut dan pemahaman konteks akademis yang kompleks menjadikannya mesin yang ideal untuk menjalankan semua fitur cerdas di aplikasi ini. Aplikasi ini dibangun dan dikembangkan menggunakan <strong>Google AI Studio</strong>, sebuah platform berbasis web dari Google yang menyediakan akses langsung untuk bereksperimen dan mengintegrasikan model Gemini ke dalam aplikasi.
                    </p>
                </div>
                <div>
                    <h3 className="text-ut-blue-light not-prose">Untuk Siapa Aplikasi Ini?</h4>
                    <p>Aplikasi ini dirancang secara eksklusif untuk mahasiswa Universitas Terbuka di semua fakultas dan program studi. Kami berkomitmen untuk mendukung model pembelajaran jarak jauh yang fleksibel dengan menyediakan mitra belajar virtual yang selalu siap sedia.</p>
                </div>
                <div>
                    <h3 className="text-ut-blue-light not-prose">Pesan dari Tim Pengembang</h3>
                    <p>Terima kasih telah menggunakan ABM-UT sebagai bagian dari perjalanan akademis Anda. Kami bersemangat untuk terus berinovasi dan menyempurnakan asisten belajar ini agar dapat memberikan dampak positif yang lebih besar. Masukan Anda sangat berharga bagi kami dalam mewujudkan masa depan pendidikan yang lebih cerdas dan personal.</p>
                </div>
                <div>
                    <h3 className="text-ut-blue-light not-prose">Konsep & Kreator</h3>
                    <p>Konsep, ide, dan perancangan fitur dalam aplikasi ini dikembangkan oleh <strong>@radinallshare</strong>. Terhubung untuk diskusi, masukan, atau kolaborasi lebih lanjut melalui kanal berikut:</p>
                    <div className="not-prose flex flex-wrap gap-4 mt-4">
                        <SocialLink href="https://www.instagram.com/radinallshare" label="Instagram" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>} />
                        <SocialLink href="https://www.facebook.com/radinallshare" label="Facebook" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>} />
                        <SocialLink href="https://www.tiktok.com/@radinallshare" label="TikTok" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4v5h-2V4h-5v12a5 5 0 1 1-5-5V4h5"></path></svg>} />
                        <SocialLink href="https://www.threads.net/@radinallshare" label="Threads" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9a3 3 0 0 0-3 3 1 1 0 0 0 1 1h4a1 1 0 0 0 1-1 3 3 0 0 0-3-3zm0 14c-4 0-6-3-6-6V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10c0 3-2 6-6 6z"></path></svg>} />
                        <SocialLink href="https://www.youtube.com/@radinallshare" label="YouTube" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>} />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};