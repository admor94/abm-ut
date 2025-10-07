import React, { useState } from 'react';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateCitation } from '../services/geminiService';

interface CitationAssistantPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'selection' | 'form' | 'generating' | 'result';

type SourceType = 
    'Buku' | 
    'Jurnal dengan DOI' | 
    'Jurnal tanpa DOI' | 
    'Makalah, Skripsi, Tesis, Karil' | 
    'Sumber Daring (Web, Koran, Majalah)' | 
    'Sumber Multimedia (Video, PPT, dll)' | 
    'Perundang-undangan';

type CitationStyle = 'APA 7th Edition' | 'MLA 9th Edition' | 'Chicago 17th Edition';

interface Field {
    id: string;
    label: string;
    placeholder: string;
}

const SOURCE_CONFIG: Record<SourceType, { fields: Field[]; required: string[] }> = {
  'Buku': {
      fields: [
        { id: 'authors', label: 'Nama Penulis/Editor', placeholder: 'Doe, J. A.' },
        { id: 'year', label: 'Tahun Terbit', placeholder: '2022' },
        { id: 'title', label: 'Judul Buku', placeholder: 'Pengantar Ilmu Komunikasi' },
        { id: 'edition', label: 'Edisi (jika ada)', placeholder: 'Edisi ke-2'},
        { id: 'publisher', label: 'Penerbit', placeholder: 'Penerbit UT' },
        { id: 'city', label: 'Kota Penerbit', placeholder: 'Tangerang Selatan' },
      ],
      required: ['authors', 'year', 'title', 'publisher']
  },
  'Jurnal dengan DOI': {
    fields: [
      { id: 'authors', label: 'Nama Penulis', placeholder: 'Doe, J. A., & Smith, B. C.' },
      { id: 'year', label: 'Tahun Terbit', placeholder: '2023' },
      { id: 'title', label: 'Judul Artikel', placeholder: 'The Impact of AI on Learning' },
      { id: 'journalName', label: 'Nama Jurnal', placeholder: 'Journal of Academic Research' },
      { id: 'volume', label: 'Volume', placeholder: '15' },
      { id: 'issue', label: 'Nomor Isu (Opsional)', placeholder: '2' },
      { id: 'pages', label: 'Halaman', placeholder: '115-130' },
      { id: 'doi', label: 'DOI', placeholder: '10.1234/jar.2023.5678' },
    ],
    required: ['authors', 'year', 'title', 'journalName', 'volume', 'pages', 'doi']
  },
  'Jurnal tanpa DOI': {
    fields: [
      { id: 'authors', label: 'Nama Penulis', placeholder: 'Doe, J. A.' },
      { id: 'year', label: 'Tahun Terbit', placeholder: '2023' },
      { id: 'title', label: 'Judul Artikel', placeholder: 'Learning in the Digital Age' },
      { id: 'journalName', label: 'Nama Jurnal', placeholder: 'Journal of Online Education' },
      { id: 'volume', label: 'Volume', placeholder: '10' },
      { id: 'issue', label: 'Nomor Isu (Opsional)', placeholder: '3' },
      { id: 'pages', label: 'Halaman', placeholder: '45-58' },
      { id: 'url', label: 'URL (jika tersedia)', placeholder: 'https://journal.example.com/article/123' }
    ],
    required: ['authors', 'year', 'title', 'journalName', 'volume', 'pages']
  },
  'Makalah, Skripsi, Tesis, Karil': {
    fields: [
      { id: 'authors', label: 'Nama Penulis', placeholder: 'Doe, J. A.' },
      { id: 'year', label: 'Tahun', placeholder: '2023' },
      { id: 'title', label: 'Judul', placeholder: 'Analisis Kebijakan Pendidikan Jarak Jauh' },
      { id: 'type', label: 'Jenis Publikasi', placeholder: 'Skripsi (tidak dipublikasikan)' },
      { id: 'university', label: 'Institusi/Universitas', placeholder: 'Universitas Terbuka' },
      { id: 'location', label: 'Lokasi Institusi', placeholder: 'Tangerang Selatan' }
    ],
    required: ['authors', 'year', 'title', 'type', 'university']
  },
  'Sumber Daring (Web, Koran, Majalah)': {
    fields: [
      { id: 'authors', label: 'Nama Penulis/Organisasi', placeholder: 'Doe, J. A. atau BBC News' },
      { id: 'publicationDate', label: 'Tanggal Publikasi', placeholder: '2023, 15 Oktober' },
      { id: 'title', label: 'Judul Halaman/Artikel', placeholder: 'Revolusi Pembelajaran Online' },
      { id: 'siteName', label: 'Nama Situs Web/Sumber', placeholder: 'Kompas.com' },
      { id: 'url', label: 'URL', placeholder: 'https://www.kompas.com/artikel/...' },
      { id: 'accessDate', label: 'Tanggal Diakses (jika perlu)', placeholder: '2023, 20 Oktober' }
    ],
    required: ['authors', 'publicationDate', 'title', 'siteName', 'url']
  },
  'Sumber Multimedia (Video, PPT, dll)': {
    fields: [
      { id: 'creator', label: 'Nama Kreator/Channel', placeholder: 'Universitas Terbuka TV' },
      { id: 'publicationDate', label: 'Tanggal Publikasi', placeholder: '2023, 10 September' },
      { id: 'title', label: 'Judul Konten', placeholder: 'Strategi Belajar Efektif [Video]' },
      { id: 'source', label: 'Sumber/Platform', placeholder: 'YouTube' },
      { id: 'url', label: 'URL', placeholder: 'https://www.youtube.com/watch?v=...' }
    ],
    required: ['creator', 'publicationDate', 'title', 'source', 'url']
  },
  'Perundang-undangan': {
    fields: [
      { id: 'issuer', label: 'Badan yang Mengeluarkan', placeholder: 'Republik Indonesia' },
      { id: 'title', label: 'Nama Peraturan', placeholder: 'Undang-Undang' },
      { id: 'number', label: 'Nomor', placeholder: '20' },
      { id: 'year', label: 'Tahun', placeholder: '2003' },
      { id: 'about', label: 'Tentang', placeholder: 'Sistem Pendidikan Nasional' },
    ],
    required: ['issuer', 'title', 'number', 'year', 'about']
  }
};

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">ABM-UT sedang membuat sitasi untuk Anda...</p>
        <p className="text-gray-400 mt-2">Ini mungkin akan memakan waktu sejenak.</p>
    </div>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button 
            onClick={handleCopy} 
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            aria-label="Salin teks"
        >
            {copied ? 'Tersalin!' : 'Salin'}
        </button>
    );
};

const optionStyle = "bg-gray-800 text-white";

export const CitationAssistantPage: React.FC<CitationAssistantPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Asisten Sitasi'];
    const [step, setStep] = useState<PageStep>('selection');
    const [sourceType, setSourceType] = useState<SourceType | null>(null);
    const [citationStyle, setCitationStyle] = useState<CitationStyle>('APA 7th Edition');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ bibliography: string; parenthetical: string; narrative: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSourceSelect = (type: SourceType) => {
        setSourceType(type);
        setFormData({});
        setError(null);
        setStep('form');
    };

    const handleFormChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerate = async () => {
        if (!sourceType) return;
        
        const requiredFields = SOURCE_CONFIG[sourceType].required;
        const missingField = requiredFields.find(field => !formData[field]?.trim());
        if (missingField) {
            const fieldLabel = SOURCE_CONFIG[sourceType].fields.find(f => f.id === missingField)?.label || missingField;
            setError(`Harap isi kolom "${fieldLabel}".`);
            return;
        }

        setError(null);
        setStep('generating');
        try {
            const res = await generateCitation(sourceType, citationStyle, formData, studentData);
            setResult(res);
            setStep('result');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
            setStep('form');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'selection':
                return (
                    <div className="max-w-4xl mx-auto">
                        <p className="text-center text-lg text-gray-300 mb-6">Pilih jenis sumber yang ingin Anda sitasi:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.keys(SOURCE_CONFIG).map(type => (
                                <button 
                                    key={type} 
                                    onClick={() => handleSourceSelect(type as SourceType)}
                                    className="p-4 bg-gray-800/50 rounded-lg text-left hover:bg-ut-blue/20 hover:border-ut-blue border border-gray-700 transition-all duration-300"
                                >
                                    <span className="font-bold text-white font-display">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'form':
                if (!sourceType) return null;
                const { fields, required } = SOURCE_CONFIG[sourceType];
                return (
                    <div className="max-w-3xl mx-auto space-y-4">
                        <h3 className="text-xl font-bold text-white font-display text-center">Detail untuk: {sourceType}</h3>
                        <p className="text-center text-sm text-gray-400">Gaya Sitasi: {citationStyle}</p>
                        {fields.map(field => (
                            <div key={field.id}>
                                <label htmlFor={field.id} className="block text-sm font-medium text-gray-300 font-display">
                                    {field.label} {required.includes(field.id) && <span className="text-ut-red">*</span>}
                                </label>
                                <input
                                    type="text"
                                    id={field.id}
                                    value={formData[field.id] || ''}
                                    onChange={e => handleFormChange(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"
                                />
                            </div>
                        ))}
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep('selection')} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-lg shadow-lg">Kembali</button>
                            <button onClick={handleGenerate} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Buat Sitasi</button>
                        </div>
                    </div>
                );
            case 'generating':
                return <LoadingState />;
            case 'result':
                if (!result) return null;
                return (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h3 className="text-2xl font-bold text-white font-display text-center">Sitasi Anda Berhasil Dibuat!</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-ut-blue-light">Format Daftar Pustaka</h4>
                                    <CopyButton textToCopy={result.bibliography} />
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-lg text-gray-300 border border-gray-700">{result.bibliography}</div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-ut-blue-light">Kutipan dalam Teks (Parenthetical)</h4>
                                    <CopyButton textToCopy={result.parenthetical} />
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-lg text-gray-300 border border-gray-700">{result.parenthetical}</div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-ut-blue-light">Kutipan dalam Teks (Naratif)</h4>
                                    <CopyButton textToCopy={result.narrative} />
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-lg text-gray-300 border border-gray-700">{result.narrative}</div>
                            </div>
                        </div>
                         <p className="text-center text-sm text-yellow-300 bg-yellow-900/50 p-3 rounded-lg">Peringatan: Selalu periksa kembali sitasi yang dihasilkan ABM-UT untuk memastikan akurasi dan kesesuaian dengan panduan gaya terbaru.</p>
                        <button onClick={() => setStep('selection')} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Buat Sitasi Baru</button>
                    </div>
                );
        }
    };

    return (
        <section id="Asisten-Sitasi" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Asisten Sitasi</h1>
                <p className="mt-2 text-lg text-gray-300 max-w-4xl">Dapatkan bantuan untuk memformat kutipan dan daftar pustaka dalam berbagai gaya (APA, MLA, Chicago).</p>
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