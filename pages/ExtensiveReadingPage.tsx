import React, { useState } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface ExtensiveReadingPageProps {
  setActiveView: (view: AppView) => void;
}

const readingMethods = [
    {
        id: 'paradigm',
        title: 'Paradigma Modern',
        content: {
            definition: [
                { title: 'Membaca Mendalam (Deep Reading)', description: 'Mode membaca tradisional yang melibatkan keterlibatan penuh konsentrasi, reflektif, dan kritis dengan sebuah teks untuk memahami nuansa dan menganalisis argumen secara mendalam.' },
                { title: 'Membaca Dangkal (Shallow Reading)', description: 'Mode membaca yang dominan di era digital, ditandai dengan proses cepat, non-linear, dan sering terdistraksi, seperti skimming dan scanning untuk ekstraksi informasi cepat.' }
            ],
            coreConcept: 'Konsep utamanya adalah dampak lingkungan digital terhadap arsitektur kognitif manusia. Internet, dengan volume informasi yang tak terbatas dan sifat hipertautannya, mendorong dan melatih otak untuk memprioritaskan kecepatan daripada kedalaman. Ada kekhawatiran bahwa ketergantungan pada shallow reading dapat melemahkan sirkuit saraf yang bertanggung jawab untuk deep reading.',
            discussion: "Perdebatan ini berpusat pada neuroplastisitas—kemampuan otak untuk mereorganisasi dirinya sebagai respons terhadap pengalaman. Studi neurosains menunjukkan bahwa deep processing (pemrosesan mendalam) mengaktifkan korteks prefrontal dan temporal, yang terlibat dalam pemikiran tingkat tinggi dan memori, menghasilkan ingatan yang lebih baik. Sebaliknya, shallow processing (pemrosesan dangkal) yang berfokus pada fitur fisik menunjukkan pola aktivasi yang berbeda. Kebiasaan membaca digital memperkuat jalur saraf untuk pemrosesan cepat dan terfragmentasi, sementara deep reading memperkuat sirkuit untuk perhatian berkelanjutan, penalaran linear, dan analisis kritis. Prinsip \"use it or lose it\" berlaku: semakin sering sirkuit shallow reading digunakan, sirkuit untuk deep reading menjadi kurang terlatih dan membutuhkan lebih banyak usaha kognitif untuk diaktifkan.",
            implications: [
                'Sadar akan Mode Membaca: Mengenali kapan harus beralih antara shallow dan deep reading.',
                'Menciptakan Lingkungan Kondusif: Mengalokasikan waktu dan ruang bebas gangguan untuk deep reading.',
                'Melatih Perhatian: Mempraktikkan aktivitas yang memperkuat perhatian berkelanjutan.',
            ],
            glossary: [
                { term: 'Neuroplastisitas', definition: 'Kemampuan otak untuk berubah dan beradaptasi sebagai hasil dari pengalaman.' },
                { term: 'Deep Reading', definition: 'Proses membaca yang imersif, terkonsentrasi, dan analitis.' },
                { term: 'Shallow Reading', definition: 'Proses membaca yang cepat, terfragmentasi, dan berorientasi pada ekstraksi informasi permukaan.' }
            ]
        }
    },
    {
        id: 'skimming',
        title: 'Skimming',
        content: {
            definition: 'Teknik membaca sangat cepat untuk mendapatkan gambaran umum atau ide pokok dari sebuah teks tanpa memperhatikan detail.',
            coreConcept: 'Tujuan Skimming adalah efisiensi. Digunakan untuk memahami inti bahasan dengan cepat, menentukan relevansi teks, dan sebagai pratinjau sebelum membaca intensif.',
            steps: [
                'Baca judul dan subjudul.',
                'Baca paragraf pembuka dan penutup secara keseluruhan.',
                'Untuk paragraf tengah, baca hanya kalimat pertama dan terakhir.',
                'Perhatikan kata kunci atau frasa yang dicetak tebal/miring.'
            ],
            discussion: 'Dari perspektif ilmu kognitif, skimming adalah strategi adaptif untuk mengelola beban informasi (information overload). Ini berfungsi sebagai filter kognitif yang disengaja untuk mengalokasikan sumber daya kognitif yang terbatas (memori kerja dan perhatian) secara efisien. Menurut Teori Beban Kognitif, memori kerja kita memiliki kapasitas terbatas. Skimming bertindak sebagai filter tingkat pertama untuk menilai relevansi tanpa membebani memori kerja.',
            caseStudy: 'Seorang peneliti melakukan skimming pada abstrak 20 jurnal untuk memilih 3-4 yang paling relevan untuk dibaca secara mendalam.',
            glossary: [
                { term: 'Information Overload', definition: 'Keadaan memiliki terlalu banyak informasi untuk diproses.' },
                { term: 'Cognitive Filter', definition: 'Proses mental yang menyaring informasi yang masuk untuk fokus pada yang relevan.' },
                { term: 'Selective Attention', definition: 'Kemampuan untuk fokus pada satu stimulus sambil mengabaikan yang lain.' }
            ]
        }
    },
    {
        id: 'scanning',
        title: 'Scanning',
        content: {
            definition: 'Teknik membaca cepat untuk menemukan informasi spesifik seperti nama, tanggal, atau kata kunci, dengan mengabaikan sisa teks.',
            coreConcept: 'Tujuan Scanning adalah kecepatan dan ketepatan. Digunakan untuk menemukan data spesifik secepat mungkin dan menghemat waktu.',
            steps: [
                'Tentukan kata kunci yang dicari.',
                'Gerakkan mata dengan cepat ke seluruh halaman (pola zig-zag atau vertikal).',
                'Fokus hanya pada kata kunci atau format informasi yang dicari.',
                'Gunakan jari atau pena sebagai penunjuk untuk memandu mata.'
            ],
            discussion: 'Scanning, seperti skimming, adalah filter kognitif. Namun, ia adalah filter yang jauh lebih terfokus. Alih-alih mendapatkan gambaran umum, scanning adalah proses pencocokan pola (pattern matching) yang sangat spesifik, yang memungkinkan otak untuk mengabaikan hampir semua informasi lain untuk mengekstrak data yang tepat tanpa membebani memori kerja dengan detail yang tidak relevan.',
            caseStudy: 'Seorang siswa membaca pertanyaan ujian terlebih dahulu, lalu melakukan scanning pada teks hanya untuk mencari jawaban spesifik (misalnya, tahun atau nama).',
            glossary: [
                { term: 'Information Overload', definition: 'Keadaan memiliki terlalu banyak informasi untuk diproses.' },
                { term: 'Cognitive Filter', definition: 'Proses mental yang menyaring informasi yang masuk untuk fokus pada yang relevan.' },
                { term: 'Selective Attention', definition: 'Kemampuan untuk fokus pada satu stimulus sambil mengabaikan yang lain.' }
            ]
        }
    }
];


const ContentSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-2xl font-bold text-ut-blue-light font-display mb-3 border-b-2 border-ut-blue/30 pb-2">{title}</h3>
        <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-4">
            {children}
        </div>
    </div>
);

export const ExtensiveReadingPage: React.FC<ExtensiveReadingPageProps> = ({ setActiveView }) => {
    const [activeMethodId, setActiveMethodId] = useState(readingMethods[0].id);
    const parentView = PARENT_VIEW_MAP['Metode Membaca Ekstensif'];
    const activeMethod = readingMethods.find(m => m.id === activeMethodId);

    return (
        <section id="Metode-Membaca-Ekstensif" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Metode Membaca Ekstensif</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Tingkatkan kecepatan membaca dan pemahaman umum dengan membaca banyak materi secara cepat.</p>
                </div>

                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />

                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                            {readingMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setActiveMethodId(method.id)}
                                    className={`p-4 rounded-lg text-center transition-all duration-300 font-display font-semibold ${
                                        activeMethodId === method.id 
                                        ? 'bg-ut-blue text-white shadow-lg -translate-y-1' 
                                        : 'bg-slate-700/50 hover:bg-slate-700'
                                    }`}
                                >
                                    {method.title}
                                </button>
                            ))}
                        </div>

                        {activeMethod && (
                            <div className="p-4 bg-slate-900/30 rounded-lg">
                                 {/* Special handling for Paradigm definition */}
                                {activeMethod.id === 'paradigm' && Array.isArray(activeMethod.content.definition) && (
                                    <ContentSection title="Definisi">
                                        <dl className="space-y-3">
                                            {activeMethod.content.definition.map(item => (
                                                <div key={item.title} className="p-3 bg-slate-900/50 rounded-md">
                                                    <dt className="font-semibold text-white font-display">{item.title}</dt>
                                                    <dd className="text-slate-400">{item.description}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </ContentSection>
                                )}
                                {activeMethod.id !== 'paradigm' && typeof activeMethod.content.definition === 'string' && (
                                    <ContentSection title="Definisi"><p>{activeMethod.content.definition}</p></ContentSection>
                                )}
                                
                                {activeMethod.content.coreConcept && <ContentSection title="Konsep dan Tujuan"><p>{activeMethod.content.coreConcept}</p></ContentSection>}
                                
                                {activeMethod.id === 'paradigm' && activeMethod.content.implications && (
                                    <ContentSection title="Implikasi bagi Pembelajar">
                                        <ul className="list-disc list-inside space-y-2">
                                            {activeMethod.content.implications.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </ContentSection>
                                )}
                                {activeMethod.id !== 'paradigm' && activeMethod.content.steps && (
                                    <ContentSection title="Alur Penerapan">
                                        <ul className="space-y-3">
                                            {activeMethod.content.steps.map((step, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="bg-ut-blue text-white font-bold text-sm rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">{index + 1}</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </ContentSection>
                                )}

                                {activeMethod.content.discussion && <ContentSection title="Pembahasan Mendalam dan Ilmiah"><p className="whitespace-pre-wrap">{activeMethod.content.discussion}</p></ContentSection>}
                                {activeMethod.content.caseStudy && <ContentSection title="Contoh Penerapan"><p>{activeMethod.content.caseStudy}</p></ContentSection>}
                                
                                {activeMethod.content.glossary && (
                                    <ContentSection title="Glosarium">
                                        <dl className="space-y-3">
                                            {activeMethod.content.glossary.map(item => (
                                                <div key={item.term} className="p-3 bg-slate-900/50 rounded-md">
                                                    <dt className="font-semibold text-white font-display">{item.term}</dt>
                                                    <dd className="text-slate-400">{item.definition}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </ContentSection>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};