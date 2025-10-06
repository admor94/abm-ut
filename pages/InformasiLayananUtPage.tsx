import React from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface InformasiLayananUtPageProps {
  setActiveView: (view: AppView) => void;
}

const contactInfo = {
    title: "Kontak Perpustakaan",
    description: "Hubungi melalui email atau hubungi Telepon:",
    details: [
        { label: "Bantuan Informasi Umum & Kesekretariatan", value: "pustaka@ecampus.ut.ac.id", type: "email" },
        { label: "Bagian Sirkulasi", value: "(021) 7490941 ext. 2204", type: "phone" },
        { label: "Layanan Contact Center UT", value: "Hallo UT", type: "text" },
        { label: "FAQ Perpustakaan", value: "https://pustaka.ut.ac.id/lib/faq/", type: "link" }
    ]
};

const services = [
    { title: 'WiFi.ID', description: 'Layanan wifi.id dapat diakses secara gratis oleh mahasiswa UT kapan saja dan dimana saja disetiap titik hotspot wifi.id corner seluruh Indonesia.', website: 'https://www.ut.ac.id/wifi-id/' },
    { title: 'E-learning', description: 'Layanan aplikasi belajar mengajar daring yang dapat diakses kapan saja dan dimana saja melalui berbagai platform oleh mahasiswa dan tutor.', website: 'https://elearning.ut.ac.id/' },
    { title: 'Perpustakaan Digital', description: 'Layanan perpustakaan digital sekaligus layanan ruang baca virtual (RBV) yang dapat diakses secara daring kapanpun dan dimanapun oleh mahasiswa dan umum.', website: 'https://pustaka.ut.ac.id/lib/ruangbaca/' },
    { title: 'SALUT', description: 'Sentra Layanan UT (SALUT) adalah kepanjangan tangan teknis operasional dari UT Daerah untuk mendekatkan layanan kepada mahasiswa.', website: 'https://www.ut.ac.id/salut-ut/' },
    { title: 'E-Resources', description: 'Berbagai bahan perpustakaan digital online (e-Resources) seperti jurnal, e-book, dan karya-karya referensi online lainnya.', website: 'https://pustaka.ut.ac.id/lib/e-resources/' },
    { title: 'Katalog E-Book Internasional', description: 'Akses ke katalog e-book internasional yang dilanggan oleh perpustakaan UT.', website: 'https://pustaka.ut.ac.id/lib/catalog-e-book/' },
    { title: 'Perpustakaan UT (UT OneSearch)', description: 'Pusat pencarian terintegrasi untuk semua koleksi perpustakaan Universitas Terbuka.', website: 'https://pustaka.ut.ac.id/lib/ut-onesearch/' },
    { title: 'Daftar Koleksi PJJ Corner', description: 'Koleksi khusus yang berfokus pada Pendidikan Jarak Jauh (PJJ).', website: 'https://pustaka.ut.ac.id/lib/pjj-corner/' },
    { title: 'Daftar Referensi', description: 'Akses ke berbagai sumber referensi yang mendukung kegiatan akademik.', website: 'https://pustaka.ut.ac.id/lib/referensi/' },
    { title: 'Blog Universitas Terbuka', description: 'Kumpulan tulisan dan artikel dari staf dan civitas akademika UT.', website: 'https://staff.ut.ac.id/' },
    { title: 'BMP Audio Universitas Terbuka', description: 'Bahan Materi Pokok (BMP) dalam format audio untuk mendukung pembelajaran.', website: 'https://pustaka.ut.ac.id/lib/bmp-audio/' },
    { title: 'Universitas Terbuka TV', description: 'Kanal resmi UT di YouTube yang berisi berbagai konten edukatif dan informatif.', website: 'https://www.youtube.com/universitasterbukatv' },
    { title: 'Kurikulum Baru Universitas Terbuka', description: 'Informasi mengenai perubahan kurikulum untuk meningkatkan efektivitas dan efisiensi proses pembelajaran.', website: 'https://www.ut.ac.id/kurikulum-baru/' },
];

const ServiceCard: React.FC<{ title: string; description: string; website: string; }> = ({ title, description, website }) => (
    <div className="bg-slate-900/50 rounded-lg p-6 flex flex-col border border-slate-700 hover:border-ut-blue transition-colors">
        <h3 className="font-bold text-xl text-white font-display mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow mb-4">{description}</p>
        <a href={website} target="_blank" rel="noopener noreferrer" className="mt-auto inline-block text-center bg-ut-blue hover:bg-ut-blue-light text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            Kunjungi Situs
        </a>
    </div>
);

export const InformasiLayananUtPage: React.FC<InformasiLayananUtPageProps> = ({ setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Informasi & Layanan UT'];

    return (
        <section id="Informasi-Layanan-UT" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Informasi & Layanan UT</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Temukan informasi kontak dan berbagai layanan digital yang disediakan oleh Universitas Terbuka.</p>
                </div>
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    {/* Contact Info */}
                    <div className="bg-slate-900/50 rounded-lg p-6 mb-8 border border-slate-700">
                        <h2 className="text-2xl font-bold text-ut-blue-light font-display mb-3">{contactInfo.title}</h2>
                        <p className="text-slate-300 mb-4">{contactInfo.description}</p>
                        <ul className="space-y-2">
                            {contactInfo.details.map(item => (
                                <li key={item.label} className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                                    <span className="font-semibold text-slate-400 sm:w-64 sm:text-right flex-shrink-0">{item.label}:</span>
                                    {item.type === 'email' && <a href={`mailto:${item.value}`} className="text-ut-blue-light hover:underline break-all">{item.value}</a>}
                                    {item.type === 'phone' && <span className="text-slate-200">{item.value}</span>}
                                    {item.type === 'text' && <span className="text-slate-200 font-bold">{item.value}</span>}
                                    {item.type === 'link' && <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-ut-blue-light hover:underline break-all">{item.value}</a>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <ServiceCard key={service.title} {...service} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};