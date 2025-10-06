import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import 'jspdf-autotable';
import type { AppView, StudentData, LearningHistoryEntry, ChatMessage } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateTutonDiscussionAnalysis, synthesizeTutonDiscussion } from '../services/geminiService';
import { CourseSearchInput } from '../components/CourseSearchInput';
import { ChatInterface } from '../components/ChatInterface';
import DOMPurify from 'dompurify';

interface PemahamanDiskusiPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
  onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
  initialData?: LearningHistoryEntry;
}

type PageStep = 'input' | 'generatingAnalysis' | 'chat' | 'generatingFinal' | 'display';

const LoadingState: React.FC<{message: string}> = ({message}) => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl font-display text-white">{message}</p>
        <p className="text-slate-400 mt-2">Ini mungkin akan memakan waktu sejenak, tergantung pada kompleksitas materi.</p>
    </div>
);

const FileUploadZone: React.FC<{
    files: File[]; onFilesChanged: (files: File[]) => void; maxFiles: number;
    title: string; description: string; accept?: string; id: string;
}> = ({ files, onFilesChanged, maxFiles, title, description, accept, id }) => {
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const [localError, setLocalError] = useState('');

    const handleFileUpload = (incomingFiles: FileList | null) => {
        if (!incomingFiles) return;
        const combined = [...files, ...Array.from(incomingFiles)];
        if (combined.length > maxFiles) {
            setLocalError(`Maksimal ${maxFiles} file untuk bagian ini.`);
            onFilesChanged(combined.slice(0, maxFiles));
        } else { setLocalError(''); onFilesChanged(combined); }
    };
    const removeFile = (indexToRemove: number) => { onFilesChanged(files.filter((_, index) => index !== indexToRemove)); };
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
                    <div className="flex text-sm text-slate-400"><label htmlFor={id} className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id={id} type="file" multiple className="sr-only" onChange={handleFileChange} accept={accept} /><span>Pilih File</span></label><p className="pl-1">atau seret dan lepas</p></div>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            {localError && <p className="text-ut-red text-xs mt-1">{localError}</p>}
            {files.length > 0 && <div className="mt-2 space-y-1">{files.map((f, i) => (<div key={i} className="flex items-center justify-between bg-slate-900/50 p-1.5 rounded-md text-sm"><span className="text-slate-300 truncate pr-2 text-xs">{f.name}</span><button onClick={() => removeFile(i)} className="text-ut-red hover:text-red-400 font-bold text-lg flex-shrink-0" aria-label={`Hapus file ${f.name}`}>&times;</button></div>))}</div>}
        </div>
    );
}


export const PemahamanDiskusiPage: React.FC<PemahamanDiskusiPageProps> = ({ studentData, setActiveView, onSessionComplete, initialData }) => {
    const parentView = PARENT_VIEW_MAP['Pemahaman Diskusi'];
    const [step, setStep] = useState<PageStep>(initialData ? 'chat' : 'input');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [courseName, setCourseName] = useState(initialData?.courseName || '');
    const [mainTopic, setMainTopic] = useState(initialData?.topic.replace('Diskusi: ', '') || '');
    const [session, setSession] = useState(1);
    const [tutorTerms, setTutorTerms] = useState('');
    const [discussionMaterial, setDiscussionMaterial] = useState('');
    const [bmpFiles, setBmpFiles] = useState<File[]>([]);
    
    // Intermediate & Final State
    const [initialAnalysis, setInitialAnalysis] = useState('');
    const [chatSystemPrompt, setChatSystemPrompt] = useState(initialData?.systemPrompt || '');
    const [chatConversation, setChatConversation] = useState<ChatMessage[]>(initialData?.conversation || []);
    const [finalReport, setFinalReport] = useState('');
    const [finalReportHtml, setFinalReportHtml] = useState('');
    
    useEffect(() => {
        if(initialData) {
            const prompt = initialData.systemPrompt;
            const sessionMatch = prompt.match(/Sesi ke-\s*(\d+)/);
            if(sessionMatch) setSession(Number(sessionMatch[1]));
            
            const initialAnalysisContext = prompt.substring(prompt.indexOf('--- Draf Jawaban Awal ---') + 26, prompt.indexOf('--- AKHIR DRAF ---'));
            setInitialAnalysis(initialAnalysisContext);
        }
    }, [initialData]);

    useEffect(() => {
        if (finalReport) {
            let isMounted = true;
            Promise.resolve(marked.parse(finalReport)).then(html => {
                if (isMounted && html) {
                    setFinalReportHtml(DOMPurify.sanitize(html));
                }
            });
            return () => { isMounted = false; };
        }
    }, [finalReport]);

    const handleGenerateAnalysis = async () => {
        if (!courseName || !mainTopic || !discussionMaterial) {
            setError("Harap isi Nama Mata Kuliah, Topik Utama, dan Materi Diskusi.");
            return;
        }
        setStep('generatingAnalysis');
        setError(null);
        try {
            const analysisResult = await generateTutonDiscussionAnalysis(studentData, courseName, mainTopic, `Sesi ke-${session}`, tutorTerms, discussionMaterial, bmpFiles);
            setInitialAnalysis(analysisResult);
            
            const socraticPrompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang fasilitator diskusi Sokratik. Anda sudah menganalisis materi diskusi dan menyiapkan draf jawaban yang komprehensif, TAPI ANDA TIDAK AKAN MENUNJUKKANNYA SECARA LANGSUNG.

[TUJUAN UTAMA]
Tujuan Anda adalah memancing pemahaman mahasiswa (${studentData.name}) dengan mengajukan pertanyaan yang merangsang pemikiran kritis, BUKAN memberikan jawaban. Anda ingin memastikan mahasiswa terlibat aktif dalam proses berpikir.

[KONTEKS MATERI - JANGAN DITUNJUKKAN KE MAHASISWA]
--- Draf Jawaban Awal ---
${analysisResult}
--- AKHIR DRAF ---

[PROSES DISKUSI]
1. **Sapaan Awal & Pancingan**: Mulai dengan menyapa mahasiswa. Tunjukkan ringkasan SANGAT singkat dari draf jawaban Anda (satu atau dua kalimat), lalu langsung ajukan pertanyaan terbuka untuk memulai. Contoh: "Halo kak ${studentData.name}, saya sudah lihat materi diskusinya. Intinya sepertinya kita membahas tentang [inti topik]. Menurut kakak, apa poin paling penting yang harus kita bahas pertama kali?"
2. **Bertanya, Jangan Menjawab**: Berdasarkan draf jawaban Anda, ajukan pertanyaan yang mengarah ke poin-poin penting. Jika mahasiswa bertanya, JANGAN jawab langsung. Balas dengan pertanyaan lain. Contoh: "Itu pertanyaan bagus. Sebelum saya jawab, menurut kakak sendiri bagaimana? Apa yang membuat kakak berpikir ke arah sana?".
3. **Gali Lebih Dalam**: Gunakan pertanyaan "Kenapa?", "Bisa berikan contoh?", "Apa dampaknya jika begitu?".
4. **Jaga Alur**: Pastikan diskusi tetap relevan dengan materi diskusi awal dan draf jawaban Anda.

Mulai sesi SEKARANG dengan LANGKAH 1.
            `.trim();

            setChatSystemPrompt(socraticPrompt);
            setStep('chat');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
            setStep('input');
        }
    };

    const handleGenerateFinalReport = async () => {
        if (!initialAnalysis || chatConversation.length === 0) {
            setError("Diskusi belum cukup untuk menghasilkan laporan akhir.");
            return;
        }
        setStep('generatingFinal');
        setError(null);
        try {
            const finalResult = await synthesizeTutonDiscussion(studentData, initialAnalysis, chatConversation);
            setFinalReport(finalResult);
            setStep('display');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat finalisasi.");
            setStep('chat');
        }
    };

    const handleSessionUpdate = (convo: ChatMessage[]) => {
        setChatConversation(convo);
        onSessionComplete(convo, 'Pemahaman Diskusi', `Diskusi: ${mainTopic}`, chatSystemPrompt, courseName);
    };

    const downloadAs = async (format: 'pdf' | 'word') => {
        const docTitle = `Diskusi_Tuton_${mainTopic.replace(/\s/g, '_')}`;
        const unsafeHtml = await Promise.resolve(marked.parse(finalReport));
        const htmlContent = DOMPurify.sanitize(unsafeHtml);
        const headerHtml = `<h1>Jawaban Diskusi Tuton: ${courseName}</h1><h2>Topik: ${mainTopic} (Sesi ${session})</h2><hr>`;
        if (format === 'pdf') {
            const pdf = new jsPDF();
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${headerHtml}${htmlContent}</div>`;
            await pdf.html(styledHtml, { callback: (doc) => doc.save(`${docTitle}.pdf`), margin: 15, autoPaging: 'text', width: 180, windowWidth: 800 });
        } else {
            const content = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${headerHtml}${htmlContent}</body></html>`;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${docTitle}.doc`; a.click(); URL.revokeObjectURL(url);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'input': return (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label><CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Cari atau ketik mata kuliah..."/></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label><input type="text" value={mainTopic} onChange={e => setMainTopic(e.target.value)} placeholder="Topik utama sesi ini" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-300 font-display">Sesi ke-</label><select value={session} onChange={e => setSession(Number(e.target.value))} className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg">{Array.from({length: 8}, (_, i) => i + 1).map(s => <option key={s} value={s}>Sesi ke - {s}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-300 font-display">Syarat & Ketentuan dari Tutor</label><textarea rows={3} value={tutorTerms} onChange={e => setTutorTerms(e.target.value)} placeholder="Contoh: panjang kalimat, sitasi, larangan plagiarisme, dll." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"></textarea></div>
                    <div><label className="block text-sm font-medium text-slate-300 font-display">Materi Diskusi</label><textarea rows={5} value={discussionMaterial} onChange={e => setDiscussionMaterial(e.target.value)} placeholder="Masukkan daftar pertanyaan atau studi kasus dari tutor." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"></textarea></div>
                    <FileUploadZone files={bmpFiles} onFilesChanged={setBmpFiles} maxFiles={2} title="Unggah BMP (Opsional)" description="Unggah file PDF (maks. 2)" accept="application/pdf" id="bmp-upload-diskusi" />
                    {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                    <button onClick={handleGenerateAnalysis} className="w-full mt-6 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Mulai Analisis & Diskusi</button>
                </div>
            );
            case 'generatingAnalysis': return <LoadingState message="Menganalisis Materi & Menyiapkan Diskusi..." />;
            case 'chat': return (
                <div>
                    <div className="p-4 mb-4 bg-slate-900/60 rounded-lg border border-slate-700 text-center">
                        <p className="text-slate-300">Diskusikan topik ini dengan ABM-UT untuk memperdalam pemahaman Anda. Setelah Anda merasa siap, proses jawaban akhir.</p>
                         {error && <p className="text-ut-red text-sm text-center mt-2">{error}</p>}
                        <button onClick={handleGenerateFinalReport} className="w-full mt-2 py-2 px-4 font-display font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg transition duration-300">Proses Jawaban Akhir Diskusi</button>
                    </div>
                    <ChatInterface studentData={studentData} systemPrompt={chatSystemPrompt} chatTitle={`Diskusi Tuton: ${mainTopic}`} onSessionComplete={handleSessionUpdate} initialConversation={chatConversation} />
                </div>
            );
            case 'generatingFinal': return <LoadingState message="Mensintesis Diskusi & Finalisasi Jawaban..." />;
            case 'display': return (
                 <div>
                    <div className="p-4 mb-6 bg-ut-yellow/20 border-l-4 border-ut-yellow text-yellow-200"><p className="font-bold">Peringatan Etika Akademik!</p><p className="text-sm">Selalu verifikasi informasi yang dihasilkan. Pahami materinya, jangan hanya menyalin. Gunakan ini sebagai draf awal untuk jawaban Anda sendiri.</p></div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"><h3 className="text-2xl font-bold text-white font-display">Hasil Akhir Jawaban Diskusi</h3><div className="flex items-center gap-3"><button onClick={() => downloadAs('word')} className="px-4 py-2 text-sm bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">Unduh Word</button><button onClick={() => downloadAs('pdf')} className="px-4 py-2 text-sm bg-ut-green hover:bg-green-500 rounded-lg shadow-md">Unduh PDF</button><button onClick={() => setStep('input')} className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg shadow-md">Buat Baru</button></div></div>
                    <div className="p-6 bg-slate-900/50 rounded-lg shadow-inner"><div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: finalReportHtml }} /></div>
                </div>
            );
        }
    };
    
    return (
        <section id="Pemahaman-Diskusi" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                 <div className="text-center mb-8"><h1 className="text-4xl md:text-5xl font-bold text-white font-display">Pemahaman Diskusi Tuton</h1><p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Analisis mendalam pertanyaan diskusi Tuton dan sintesis jawaban komprehensif bersama ABM-UT.</p></div>
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />
                    {renderStep()}
                </div>
            </div>
        </section>
    );
};
