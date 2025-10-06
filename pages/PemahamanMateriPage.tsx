import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import 'jspdf-autotable';
import type { AppView, StudentData, LearningHistoryEntry } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateTutonAnalysis } from '../services/geminiService';
import { CourseSearchInput } from '../components/CourseSearchInput';
import DOMPurify from 'dompurify';

interface PemahamanMateriPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
  onContinueToDiscussion: (entry: LearningHistoryEntry) => void;
}

type PageStep = 'input' | 'generating' | 'display';

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl font-display text-white">ABM-UT sedang menganalisis materi Tuton Anda...</p>
        <p className="text-slate-400 mt-2">Ini mungkin akan memakan waktu sejenak, tergantung pada kompleksitas materi.</p>
    </div>
);

const FileUploadZone: React.FC<{
    files: File[];
    onFilesChanged: (files: File[]) => void;
    maxFiles: number;
    title: string;
    description: string;
    accept?: string;
    id: string;
}> = ({ files, onFilesChanged, maxFiles, title, description, accept, id }) => {
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const [localError, setLocalError] = useState('');

    const handleFileUpload = (incomingFiles: FileList | null) => {
        if (!incomingFiles) return;
        
        const combined = [...files, ...Array.from(incomingFiles)];
        if (combined.length > maxFiles) {
            setLocalError(`Maksimal ${maxFiles} file untuk bagian ini.`);
            onFilesChanged(combined.slice(0, maxFiles));
        } else {
            setLocalError('');
            onFilesChanged(combined);
        }
    };
    
    const removeFile = (indexToRemove: number) => {
        onFilesChanged(files.filter((_, index) => index !== indexToRemove));
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dropzoneRef.current?.classList.add('border-ut-blue', 'bg-ut-blue/10'); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dropzoneRef.current?.classList.remove('border-ut-blue', 'bg-ut-blue/10'); };
    const handleDrop = (e: React.DragEvent) => { handleDragLeave(e); handleFileUpload(e.dataTransfer.files); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { handleFileUpload(e.target.files); };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 font-display">{title}</label>
            <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    <div className="flex text-sm text-slate-400">
                        <label htmlFor={id} className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id={id} type="file" multiple className="sr-only" onChange={handleFileChange} accept={accept} /><span>Pilih File</span></label>
                        <p className="pl-1">atau seret dan lepas</p>
                    </div>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            {localError && <p className="text-ut-red text-xs mt-1">{localError}</p>}
            {files.length > 0 && (
                <div className="mt-2 space-y-1">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-900/50 p-1.5 rounded-md text-sm">
                            <span className="text-slate-300 truncate pr-2 text-xs">{f.name}</span>
                            <button onClick={() => removeFile(i)} className="text-ut-red hover:text-red-400 font-bold text-lg flex-shrink-0" aria-label={`Hapus file ${f.name}`}>&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export const PemahamanMateriPage: React.FC<PemahamanMateriPageProps> = ({ studentData, setActiveView, onContinueToDiscussion }) => {
    const parentView = PARENT_VIEW_MAP['Pemahaman Materi'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [courseName, setCourseName] = useState('');
    const [mainTopic, setMainTopic] = useState('');
    const [session, setSession] = useState(1);
    const [sessionIntro, setSessionIntro] = useState('');
    const [enrichmentText, setEnrichmentText] = useState('');
    const [enrichmentFiles, setEnrichmentFiles] = useState<File[]>([]);
    const [initiationFiles, setInitiationFiles] = useState<File[]>([]);
    const [bmpFiles, setBmpFiles] = useState<File[]>([]);

    // Result state
    const [report, setReport] = useState('');
    const [reportHtml, setReportHtml] = useState('');

    useEffect(() => {
        if (report) {
            let isMounted = true;
            Promise.resolve(marked.parse(report)).then(html => {
                if (isMounted && html) {
                    setReportHtml(DOMPurify.sanitize(html));
                }
            });
            return () => { isMounted = false; };
        }
    }, [report]);

    const handleGenerate = async () => {
        if (!courseName || !mainTopic) {
            setError("Harap isi Nama Mata Kuliah dan Topik Utama.");
            return;
        }
        setStep('generating');
        setError(null);
        try {
            const result = await generateTutonAnalysis(studentData, courseName, mainTopic, `Sesi ke-${session}`, sessionIntro, enrichmentText, enrichmentFiles, initiationFiles, bmpFiles);
            setReport(result);
            setStep('display');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
            setStep('input');
        }
    };
    
    const handleContinueToDiscussion = () => {
        if (!report || !mainTopic) return;

        const discussionSystemPrompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang partner diskusi yang cerdas dan suportif. Mahasiswa, ${studentData.name}, baru saja selesai mempelajari materi yang telah Anda analisis.

[TUJUAN UTAMA]
Tujuan Anda adalah memperdalam pemahaman mahasiswa melalui diskusi. JANGAN mengulang penjelasan yang sudah ada. Sebaliknya, ajukan pertanyaan-pertanyaan yang merangsang pemikiran kritis, minta contoh, atau tanyakan bagian mana dari materi yang masih membingungkan bagi mereka.

[KONTEKS MATERI YANG BARU DIPELAJARI]
Berikut adalah ringkasan pemahaman materi yang telah diterima mahasiswa. Gunakan ini sebagai dasar diskusi Anda:
---
${report}
---

[PROSES DISKUSI]
1.  **Sapaan Awal**: Mulailah dengan menyapa mahasiswa dan tanyakan kesan pertama mereka tentang materi yang baru dipelajari. Contoh: "Halo kak ${studentData.name}, kita sudah melihat ringkasan materinya. Bagaimana menurut kakak? Ada bagian tertentu yang ingin kita diskusikan lebih dalam atau yang mungkin masih terasa sulit?".
2.  **Diskusi Sokratik**: Berdasarkan respons mahasiswa, ajukan pertanyaan lanjutan. Jika mereka diam, Anda bisa proaktif memulai dengan pertanyaan tentang salah satu konsep kunci dari ringkasan. Contoh: "Dalam ringkasan tadi disebutkan tentang [konsep kunci]. Menurut kakak, bagaimana contoh penerapannya dalam kehidupan sehari-hari?".
3.  **Jaga Alur**: Jaga agar diskusi tetap fokus pada topik ${mainTopic}, tapi biarkan mahasiswa memimpin arah pembicaraan. Peran Anda adalah sebagai fasilitator yang memancing pemikiran.

Mulai sesi SEKARANG dengan LANGKAH 1: Sapaan Awal.
        `.trim();

        const entry: LearningHistoryEntry = {
            id: `pemahaman-diskusi-${new Date().toISOString()}`,
            view: 'Pemahaman Diskusi',
            topic: `Diskusi: ${mainTopic}`,
            date: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
            conversation: [],
            systemPrompt: discussionSystemPrompt,
            courseName: courseName,
        };
        onContinueToDiscussion(entry);
    };

    const downloadAs = async (format: 'pdf' | 'word') => {
        const docTitle = `Pemahaman_Materi_${mainTopic.replace(/\s/g, '_')}`;
        const unsafeHtml = await Promise.resolve(marked.parse(report));
        const htmlContent = DOMPurify.sanitize(unsafeHtml);
        const headerHtml = `<h1>Pemahaman Materi: ${courseName}</h1><h2>Topik: ${mainTopic} (Sesi ${session})</h2><hr>`;

        if (format === 'pdf') {
            const pdf = new jsPDF();
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${headerHtml}${htmlContent}</div>`;
            await pdf.html(styledHtml, {
                callback: (doc) => doc.save(`${docTitle}.pdf`),
                margin: 15, autoPaging: 'text', width: 180, windowWidth: 800,
            });
        } else {
            const content = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${headerHtml}${htmlContent}</body></html>`;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${docTitle}.doc`; a.click(); URL.revokeObjectURL(url);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'input':
                return (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label><CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Cari atau ketik mata kuliah..."/></div>
                            <div><label className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label><input type="text" value={mainTopic} onChange={e => setMainTopic(e.target.value)} placeholder="Topik utama sesi ini" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Sesi ke-</label><select value={session} onChange={e => setSession(Number(e.target.value))} className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white">{Array.from({length: 8}, (_, i) => i + 1).map(s => <option key={s} value={s}>Sesi ke - {s}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Pengantar Sesi dari Tutor</label><textarea rows={3} value={sessionIntro} onChange={e => setSessionIntro(e.target.value)} placeholder="Masukkan pengantar sesi dari tutor Anda di e-learning." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"></textarea></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Teks Materi Pengayaan</label><textarea rows={3} value={enrichmentText} onChange={e => setEnrichmentText(e.target.value)} placeholder="Masukkan materi pengayaan (jika ada)." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"></textarea></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FileUploadZone files={enrichmentFiles} onFilesChanged={setEnrichmentFiles} maxFiles={2} title="File Materi Pengayaan" description="PDF, Gambar, Video, dll. (maks 2)" id="enrichment-upload" accept="application/pdf,image/*,video/*,audio/*,text/*" />
                            <FileUploadZone files={initiationFiles} onFilesChanged={setInitiationFiles} maxFiles={2} title="File Materi Inisiasi" description="PDF, Gambar, Video, dll. (maks 2)" id="initiation-upload" accept="application/pdf,image/*,video/*,audio/*,text/*" />
                            <FileUploadZone files={bmpFiles} onFilesChanged={setBmpFiles} maxFiles={2} title="File BMP (Opsional)" description="Unggah file PDF (maks. 2)" accept="application/pdf" id="bmp-upload" />
                        </div>
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={handleGenerate} className="w-full mt-6 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Analisis Materi</button>
                    </div>
                );
            case 'generating':
                return <LoadingState />;
            case 'display':
                return (
                    <div>
                        <div className="p-4 mb-6 bg-ut-yellow/20 border-l-4 border-ut-yellow text-yellow-200"><p className="font-bold">Peringatan Etika Akademik!</p><p className="text-sm">Selalu verifikasi informasi yang dihasilkan AI. Pahami materinya, jangan hanya menyalin. Gunakan ini sebagai alat bantu belajar, bukan pengganti proses berpikir kritis Anda.</p></div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"><h3 className="text-2xl font-bold text-white font-display">Pemahaman Komprehensif Materi</h3><div className="flex items-center gap-3"><button onClick={() => downloadAs('word')} className="px-4 py-2 text-sm bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">Unduh Word</button><button onClick={() => downloadAs('pdf')} className="px-4 py-2 text-sm bg-ut-green hover:bg-green-500 rounded-lg shadow-md">Unduh PDF</button><button onClick={() => setStep('input')} className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg shadow-md">Buat Baru</button></div></div>
                        <div className="p-6 bg-slate-900/50 rounded-lg shadow-inner"><div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: reportHtml }} /></div>
                        <div className="mt-8 text-center p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                            <h4 className="text-xl font-bold text-white font-display">Siap untuk Diskusi?</h4>
                            <p className="text-slate-300 mt-2 mb-4">Perdalam pemahaman Anda dengan mendiskusikan materi ini bersama Asisten AI.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button onClick={handleContinueToDiscussion} className="px-8 py-3 font-display font-medium text-white bg-ut-green hover:bg-green-500 rounded-lg shadow-lg">Ya, Lanjutkan ke Diskusi</button>
                                <button onClick={() => setActiveView('Dashboard')} className="px-8 py-3 font-display font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg">Tidak, Kembali ke Dashboard</button>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <section id="Pemahaman-Materi" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                 <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Pemahaman Materi Tuton</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Dapatkan analisis mendalam dari materi sesi Tuton Anda.</p>
                </div>
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />
                    {renderStep()}
                </div>
            </div>
        </section>
    );
};
