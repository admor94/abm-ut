import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateCaseStudyAnalysis } from '../services/geminiService';

interface CaseStudyAnalysisPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'generating' | 'display';
type AnalysisMethod = 'SWOT' | 'PESTLE' | "Porter's Five Forces";

const ANALYSIS_METHODS: AnalysisMethod[] = ['SWOT', 'PESTLE', "Porter's Five Forces"];

interface MethodExplanation {
  title: string;
  definition: string;
  background: string;
  purpose: string;
  components: {
    title: string;
    description: string;
  }[];
  application: string;
}

const ANALYSIS_EXPLANATIONS: Record<AnalysisMethod, MethodExplanation> = {
  'SWOT': {
    title: 'Analisis SWOT',
    definition: 'Analisis SWOT adalah kerangka kerja perencanaan strategis yang digunakan untuk mengevaluasi faktor-faktor internal dan eksternal yang mempengaruhi suatu organisasi, proyek, atau bisnis. Akronim ini merupakan singkatan dari Strengths (Kekuatan), Weaknesses (Kelemahan), Opportunities (Peluang), dan Threats (Ancaman).',
    background: 'Metode ini dikembangkan oleh Albert Humphrey di Stanford Research Institute selama proyek riset pada tahun 1960-an. Tujuannya adalah untuk mengidentifikasi mengapa perencanaan perusahaan secara konsisten gagal. Model ini lahir dari kebutuhan akan pendekatan yang lebih terstruktur dan objektif dalam perencanaan strategis.',
    purpose: 'Tujuan utama Analisis SWOT adalah untuk membantu organisasi mengembangkan kesadaran penuh terhadap semua faktor yang terlibat dalam pengambilan keputusan bisnis. Ini memungkinkan perumusan strategi yang memaksimalkan kekuatan dan peluang sambil meminimalkan kelemahan dan ancaman.',
    components: [
      { title: 'Strengths (Kekuatan)', description: 'Atribut internal dan sumber daya positif yang mendukung keberhasilan. Contoh: Merek yang kuat, basis pelanggan setia, neraca keuangan yang sehat, teknologi unik.' },
      { title: 'Weaknesses (Kelemahan)', description: 'Atribut internal negatif yang menghambat kinerja. Contoh: Utang tinggi, rantai pasokan yang tidak efisien, kurangnya modal, merek yang lemah.' },
      { title: 'Opportunities (Peluang)', description: 'Faktor eksternal yang dapat dimanfaatkan oleh organisasi untuk keuntungan. Contoh: Pasar baru yang sedang berkembang, sedikitnya pesaing, liputan pers yang positif, perubahan regulasi yang menguntungkan.' },
      { title: 'Threats (Ancaman)', description: 'Faktor eksternal yang dapat membahayakan organisasi. Contoh: Munculnya pesaing baru, perubahan selera konsumen, regulasi baru yang merugikan, kondisi ekonomi yang memburuk.' }
    ],
    application: 'SWOT sangat serbaguna dan dapat diterapkan dalam berbagai konteks, mulai dari perencanaan bisnis perusahaan besar, analisis kompetitif, pengembangan produk, hingga perencanaan karir pribadi. Ini adalah langkah fundamental dalam audit strategis.'
  },
  'PESTLE': {
    title: 'Analisis PESTLE',
    definition: 'Analisis PESTLE adalah kerangka kerja atau alat yang digunakan untuk menganalisis dan memantau faktor-faktor makro-lingkungan eksternal yang dapat berdampak pada kinerja organisasi. Akronim ini merupakan singkatan dari Political (Politik), Economic (Ekonomi), Social (Sosial), Technological (Teknologi), Legal (Hukum), dan Environmental (Lingkungan).',
    background: 'PESTLE merupakan evolusi dari analisis PEST yang lebih sederhana, yang dikembangkan oleh profesor Harvard, Francis Aguilar, pada tahun 1967. Penambahan faktor Legal dan Environmental mencerminkan meningkatnya kompleksitas lingkungan bisnis modern dan pentingnya kepatuhan hukum serta keberlanjutan.',
    purpose: 'Tujuannya adalah untuk memberikan pemahaman holistik tentang "gambaran besar" lingkungan tempat organisasi beroperasi. Ini membantu dalam mengidentifikasi potensi peluang dan ancaman, mengantisipasi tren masa depan, dan membuat keputusan strategis yang lebih terinformasi.',
    components: [
      { title: 'Political (Politik)', description: 'Faktor yang berkaitan dengan intervensi pemerintah dalam ekonomi. Contoh: Kebijakan pajak, stabilitas politik, kebijakan perdagangan luar negeri, hukum ketenagakerjaan.' },
      { title: 'Economic (Ekonomi)', description: 'Faktor ekonomi yang memengaruhi daya beli konsumen dan biaya modal. Contoh: Pertumbuhan ekonomi, suku bunga, nilai tukar, tingkat inflasi, tingkat pengangguran.' },
      { title: 'Social (Sosial)', description: 'Faktor yang berkaitan dengan tren demografis, norma, dan nilai-nilai budaya masyarakat. Contoh: Pertumbuhan populasi, distribusi usia, kesadaran kesehatan, tren gaya hidup.' },
      { title: 'Technological (Teknologi)', description: 'Faktor yang berkaitan dengan inovasi dalam teknologi yang dapat memengaruhi operasi industri dan pasar. Contoh: Otomatisasi, aktivitas riset dan pengembangan (R&D), kesadaran teknologi.' },
      { title: 'Legal (Hukum)', description: 'Faktor yang berkaitan dengan hukum dan peraturan yang harus dipatuhi oleh organisasi. Contoh: Undang-undang perlindungan konsumen, hukum hak cipta dan paten, peraturan kesehatan dan keselamatan kerja.' },
      { title: 'Environmental (Lingkungan)', description: 'Faktor yang berkaitan dengan aspek ekologis dan lingkungan. Contoh: Perubahan iklim, cuaca, hukum lingkungan, tekanan dari LSM terkait keberlanjutan.' }
    ],
    application: 'PESTLE sangat penting untuk perencanaan strategis, manajemen risiko, analisis pasar, dan pengembangan bisnis. Ini sering digunakan bersamaan dengan kerangka lain seperti SWOT dan Porter\'s Five Forces untuk analisis yang komprehensif.'
  },
  "Porter's Five Forces": {
    title: "Porter's Five Forces",
    definition: "Porter's Five Forces adalah model analisis yang mengidentifikasi dan menganalisis lima kekuatan kompetitif yang membentuk setiap industri, dan membantu menentukan kelemahan dan kekuatan industri tersebut.",
    background: 'Model ini diperkenalkan oleh Michael E. Porter, seorang profesor dari Harvard Business School, dalam artikelnya di Harvard Business Review pada tahun 1979. Teori ini didasarkan pada gagasan bahwa sifat persaingan dalam industri tidak hanya ditentukan oleh pesaing yang ada, tetapi juga oleh kekuatan struktural lainnya.',
    purpose: 'Tujuan utamanya adalah untuk menentukan intensitas persaingan dan, akibatnya, daya tarik (profitabilitas) suatu industri atau pasar. Dengan memahami di mana letak kekuatan, perusahaan dapat mengembangkan strategi untuk meningkatkan posisi kompetitifnya.',
    components: [
      { title: 'Threat of New Entrants (Ancaman Pendatang Baru)', description: 'Seberapa mudah atau sulit bagi pesaing baru untuk memasuki pasar. Ancaman ini rendah jika terdapat hambatan masuk yang tinggi, seperti modal besar, paten, atau loyalitas merek yang kuat.' },
      { title: 'Bargaining Power of Buyers (Daya Tawar Pembeli)', description: 'Kemampuan pelanggan untuk menekan harga. Daya tawar pembeli tinggi jika mereka membeli dalam volume besar, produk tidak terdiferensiasi, atau mereka dapat dengan mudah beralih ke pesaing.' },
      { title: 'Bargaining Power of Suppliers (Daya Tawar Pemasok)', description: 'Kemampuan pemasok untuk menaikkan harga input (tenaga kerja, bahan baku). Daya tawar pemasok tinggi jika jumlah pemasok sedikit, produk mereka unik, atau biaya untuk beralih pemasok tinggi.' },
      { title: 'Threat of Substitute Products or Services (Ancaman Produk/Jasa Pengganti)', description: 'Kemungkinan pelanggan menemukan cara yang berbeda untuk memenuhi kebutuhan mereka. Ancaman ini tinggi jika ada banyak alternatif pengganti yang tersedia dengan harga kompetitif.' },
      { title: 'Rivalry Among Existing Competitors (Persaingan di Antara Pesaing yang Ada)', description: 'Intensitas persaingan di antara pemain yang sudah ada di industri. Persaingan tinggi jika ada banyak pesaing, pertumbuhan industri lambat, atau produk tidak memiliki banyak diferensiasi.' }
    ],
    application: 'Model ini sangat fundamental dalam analisis industri, pengembangan strategi kompetitif, dan pengambilan keputusan investasi. Ini membantu perusahaan memahami struktur industri mereka dan bagaimana memposisikan diri untuk mendapatkan keunggulan kompetitif.'
  }
};


const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">ABM-UT sedang menganalisis studi kasus Anda...</p>
        <p className="text-gray-400 mt-2">Ini mungkin akan memakan waktu sejenak.</p>
    </div>
);

const optionStyle = "bg-gray-800 text-white";

export const CaseStudyAnalysisPage: React.FC<CaseStudyAnalysisPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Analisis Studi Kasus'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    const [caseStudyText, setCaseStudyText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod | ''>('');
    
    const [report, setReport] = useState('');
    // FIX: Add state for rendered HTML to handle async parsing
    const [reportHtml, setReportHtml] = useState('');
    
    const dropzoneRef = useRef<HTMLDivElement>(null);

    // FIX: Use useEffect to parse markdown when report changes
    useEffect(() => {
        if (report) {
            let isMounted = true;
            // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
            Promise.resolve(marked.parse(report)).then(html => {
                if (isMounted && html) {
                    setReportHtml(DOMPurify.sanitize(html));
                }
            });
            return () => { isMounted = false; };
        }
    }, [report]);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dropzoneRef.current?.classList.add('border-ut-blue', 'bg-ut-blue/10'); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dropzoneRef.current?.classList.remove('border-ut-blue', 'bg-ut-blue/10'); };
    const handleDrop = (e: React.DragEvent) => { handleDragLeave(e); handleFileUpload(e.dataTransfer.files); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { handleFileUpload(e.target.files); };

    const handleFileUpload = (incomingFiles: FileList | null) => {
        const MAX_FILES = 4;
        if (!incomingFiles) return;
        
        setFiles(prevFiles => {
            const combined = [...prevFiles, ...Array.from(incomingFiles)];
            if (combined.length > MAX_FILES) {
                setError(`Anda hanya dapat mengunggah maksimal ${MAX_FILES} file.`);
                return combined.slice(0, MAX_FILES);
            }
            setError(null);
            return combined;
        });
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleGenerate = async () => {
        if (!caseStudyText.trim() && files.length === 0) {
            setError("Harap sediakan teks atau file studi kasus.");
            return;
        }
        if (!analysisMethod) {
            setError("Harap pilih metode analisis.");
            return;
        }
        setStep('generating');
        setError(null);
        try {
            const result = await generateCaseStudyAnalysis(caseStudyText, files, analysisMethod, studentData);
            setReport(result);
            setStep('display');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
            setStep('input');
        }
    };

    const downloadAs = async (format: 'pdf' | 'word') => {
        const docTitle = `Analisis_${analysisMethod}_${new Date().toISOString().slice(0,10)}`;
        // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
        const unsafeHtml = await Promise.resolve(marked.parse(report));
        const htmlContent = DOMPurify.sanitize(unsafeHtml);

        if (format === 'pdf') {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${htmlContent}</div>`;
            
            await pdf.html(styledHtml, {
                callback: (doc) => {
                    doc.save(`${docTitle}.pdf`);
                },
                margin: 15,
                autoPaging: 'text',
                width: 180,
                windowWidth: 800,
            });
        } else { 
            const content = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${htmlContent}</body></html>`;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docTitle}.doc`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'input':
                return (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className="text-center text-lg text-gray-300">Sediakan studi kasus dan pilih kerangka kerja untuk mendapatkan analisis mendalam.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 font-display">Teks Studi Kasus</label>
                            <textarea rows={8} value={caseStudyText} onChange={e => setCaseStudyText(e.target.value)} placeholder="Tempelkan teks studi kasus di sini..." className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"></textarea>
                        </div>
                        <div className="text-center text-gray-400 font-display text-sm">ATAU</div>
                        <div>
                             <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md transition-colors duration-300">
                                <div className="space-y-1 text-center">
                                    <div className="flex text-sm text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*,video/*,audio/*,text/*" /><span>Unggah File Studi Kasus</span></label>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, Gambar, Video, Audio, Teks (Maks. 4 file)</p>
                                </div>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm font-medium text-slate-300">File yang diunggah:</p>
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md text-sm">
                                            <span className="text-slate-300 truncate pr-2">{f.name}</span>
                                            <button onClick={() => removeFile(i)} className="text-ut-red hover:text-red-400 font-bold text-lg flex-shrink-0" aria-label={`Hapus file ${f.name}`}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 font-display">Metode Analisis</label>
                            <select value={analysisMethod} onChange={e => setAnalysisMethod(e.target.value as AnalysisMethod)} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" required>
                                <option value="" disabled className={optionStyle}>[Pilih Metode Analisis]</option>
                                {ANALYSIS_METHODS.map(method => <option key={method} value={method} className={optionStyle}>{method}</option>)}
                            </select>
                            {analysisMethod && (
                                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg text-sm">
                                    <h4 className="font-bold text-ut-blue-light">{ANALYSIS_EXPLANATIONS[analysisMethod].title}</h4>
                                    <p className="text-gray-300 mt-2">{ANALYSIS_EXPLANATIONS[analysisMethod].purpose}</p>
                                </div>
                            )}
                        </div>

                        {error && <p className="text-ut-red text-sm text-center mt-4">{error}</p>}
                        <button onClick={handleGenerate} className="w-full mt-6 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Analisis Sekarang</button>
                    </div>
                );
            case 'generating':
                return <LoadingState />;
            case 'display':
                return (
                     <div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h3 className="text-2xl font-bold text-white font-display">Laporan Analisis Anda</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => downloadAs('word')} className="px-4 py-2 text-sm bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">Unduh Word</button>
                                <button onClick={() => downloadAs('pdf')} className="px-4 py-2 text-sm bg-ut-green hover:bg-green-500 rounded-lg shadow-md">Unduh PDF</button>
                                <button onClick={() => setStep('input')} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-lg shadow-md">Mulai Lagi</button>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-800/50 rounded-lg shadow-inner">
                           {/* FIX: Use the state variable `reportHtml` to render the parsed markdown */}
                           <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: reportHtml }} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <section id="Analisis-Studi-Kasus" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Analisis Studi Kasus</h1>
                <p className="mt-2 text-lg text-gray-300 max-w-4xl">Dapatkan bantuan untuk membedah dan menganalisis studi kasus secara mendalam.</p>
            </div>
            <div className="w-full max-w-5xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
                <PageHeader
                    parentView={parentView}
                    setActiveView={setActiveView}
                />
                {renderStep()}
            </div>
        </section>
    );
};