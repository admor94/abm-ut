import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateSummary } from '../services/geminiService';

interface SummaryPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'generating' | 'display';
type SummaryType = 'Ringkasan Paragraf' | 'Poin-Poin Utama' | 'Abstrak Ilmiah';
type SummaryLength = 'Singkat' | 'Sedang' | 'Panjang';

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">ABM-UT sedang menganalisis dan merangkum materi...</p>
        <p className="text-gray-400 mt-2">Proses ini mungkin memakan waktu sejenak...</p>
    </div>
);

const optionStyle = "bg-gray-800 text-white";

export const SummaryPage: React.FC<SummaryPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Buat Rangkuman Materi'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [files, setFiles] = useState<File[]>([]);
    const [materialText, setMaterialText] = useState('');
    const [summaryType, setSummaryType] = useState<SummaryType | ''>('');
    const [summaryLength, setSummaryLength] = useState<SummaryLength | ''>('');

    // Result state
    const [summaryResult, setSummaryResult] = useState('');
    // FIX: Add state for rendered HTML to handle async parsing
    const [summaryHtml, setSummaryHtml] = useState('');
    
    const dropzoneRef = useRef<HTMLDivElement>(null);

    // FIX: Use useEffect to parse markdown when summaryResult changes
    useEffect(() => {
        if (summaryResult) {
            let isMounted = true;
            // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
            Promise.resolve(marked.parse(summaryResult)).then(html => {
                if (isMounted && html) {
                    setSummaryHtml(DOMPurify.sanitize(html));
                }
            });
            return () => { isMounted = false; };
        }
    }, [summaryResult]);

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

    const handleGenerateSummary = async () => {
        if (files.length === 0 && !materialText.trim()) {
            setError("Harap berikan materi (via file atau teks).");
            return;
        }
         if (!summaryType || !summaryLength) {
            setError("Harap pilih jenis dan panjang rangkuman.");
            return;
        }
        setStep('generating');
        setError(null);
        try {
            const result = await generateSummary(materialText, files, summaryType, summaryLength, studentData);
            setSummaryResult(result);
            setStep('display');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
            setStep('input');
        }
    };
    
    const downloadAs = async (format: 'pdf' | 'word') => {
        const docTitle = `Rangkuman_${summaryType.replace(/\s/g, '_')}`;
        // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
        const unsafeHtml = await Promise.resolve(marked.parse(summaryResult));
        const htmlContent = DOMPurify.sanitize(unsafeHtml);
        const headerHtml = `<h1>Rangkuman Materi</h1><h2>Jenis: ${summaryType} | Panjang: ${summaryLength}</h2><hr>`;

        if (format === 'pdf') {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${headerHtml}${htmlContent}</div>`;
            
            await pdf.html(styledHtml, {
                callback: (doc) => {
                    doc.save(`${docTitle}.pdf`);
                },
                margin: 15,
                autoPaging: 'text',
                width: 180,
                windowWidth: 800,
            });
        } else { // Word
            const content = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${headerHtml}${htmlContent}</body></html>`;
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
        switch(step) {
            case 'input':
                return (
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <p className="text-center text-lg text-gray-300">Unggah atau tempel materi kuliah, dan biarkan ABM-UT membuat ringkasan yang padat untuk Anda.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 font-display">Unggah File Materi</label>
                            <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md transition-colors duration-300">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                    <div className="flex text-sm text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*,video/*,audio/*,text/*" /><span>Pilih File</span></label>
                                        <p className="pl-1">atau seret dan lepas</p>
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
                        <div className="text-center text-gray-400 font-display">ATAU</div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 font-display">Masukkan Teks Materi</label>
                            <textarea rows={8} value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Tempelkan materi Anda di sini..." className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 font-display mb-2">Jenis Rangkuman</label>
                                <select value={summaryType} onChange={e => setSummaryType(e.target.value as SummaryType)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" required>
                                    <option value="" disabled className={optionStyle}>[Pilih Jenis Rangkuman]</option>
                                    <option value="Ringkasan Paragraf" className={optionStyle}>Ringkasan Paragraf</option>
                                    <option value="Poin-Poin Utama" className={optionStyle}>Poin-Poin Utama</option>
                                    <option value="Abstrak Ilmiah" className={optionStyle}>Abstrak Ilmiah</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 font-display mb-2">Panjang Rangkuman</label>
                                <select value={summaryLength} onChange={e => setSummaryLength(e.target.value as SummaryLength)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" required>
                                    <option value="" disabled className={optionStyle}>[Pilih Panjang Rangkuman]</option>
                                    <option value="Singkat" className={optionStyle}>Singkat</option>
                                    <option value="Sedang" className={optionStyle}>Sedang</option>
                                    <option value="Panjang" className={optionStyle}>Panjang</option>
                                </select>
                            </div>
                        </div>

                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={handleGenerateSummary} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Buat Rangkuman</button>
                    </div>
                );
            case 'generating':
                return <LoadingState />;
            case 'display':
                return (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h3 className="text-2xl font-bold text-white font-display">Hasil Rangkuman Anda</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => downloadAs('word')} className="px-4 py-2 text-sm bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md transition-colors">Unduh Word</button>
                                <button onClick={() => downloadAs('pdf')} className="px-4 py-2 text-sm bg-ut-green hover:bg-green-500 rounded-lg shadow-md transition-colors">Unduh PDF</button>
                                <button onClick={() => setStep('input')} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-lg shadow-md transition-colors">Buat Lagi</button>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-900/50 rounded-lg shadow-inner">
                           {/* FIX: Use the state variable `summaryHtml` to render the parsed markdown */}
                           <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                        </div>
                    </div>
                );
        }
    }

    return (
        <section id="Buat-Rangkuman-Materi" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Buat Rangkuman Materi</h1>
                <p className="mt-2 text-lg text-gray-300 max-w-4xl">Unggah atau tempel materi kuliah, dan biarkan ABM-UT membuat ringkasan yang padat.</p>
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