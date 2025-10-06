import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChatInterface } from '../components/ChatInterface';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import type { StudentData, ChatMessage, AppView, LearningHistoryEntry } from '../types';
import { CourseSearchInput } from '../components/CourseSearchInput';

interface DebatePageProps {
    studentData: StudentData;
    onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
    setActiveView: (view: AppView) => void;
    initialData?: LearningHistoryEntry;
}

type DebateStep = 'setup' | 'debate';

// Helper to read file as text
const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const DebatePage: React.FC<DebatePageProps> = ({ studentData, onSessionComplete, setActiveView, initialData }) => {
    const id: AppView = 'Debat Cerdas dengan ABM-UT';
    const parentView = PARENT_VIEW_MAP[id];
    
    const [step, setStep] = useState<DebateStep>(initialData ? 'debate' : 'setup');
    const [courseName, setCourseName] = useState(initialData?.courseName || '');
    const [moduleTopic, setModuleTopic] = useState(initialData?.topic || '');
    const [thesis, setThesis] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [persona, setPersona] = useState('');
    const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
    const [conversation, setConversation] = useState<ChatMessage[]>(initialData?.conversation || []);
    const [error, setError] = useState('');

    const dropzoneRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if(initialData) {
            setConversation(initialData.conversation);
            const personaMatch = initialData.systemPrompt.match(/Adopsi Penuh peran sebagai "([^"]+)"/);
            if (personaMatch && personaMatch[1]) {
                setPersona(personaMatch[1]);
            }
        }
    }, [initialData]);

    const personas = [
        "Pengkritik Skeptis",
        "Pendukung Optimis",
        "Analis Data Netral",
        "Filsuf Etis"
    ];

    const getPersonaRules = (selectedPersona: string): string => {
        switch (selectedPersona) {
            case "Pengkritik Skeptis":
                return "Jika Pengkritik Skeptis: Cari potensi kelemahan, asumsi yang tidak terbukti, dan kontradiksi dalam argumen mahasiswa. Siapkan argumen sanggahan.";
            case "Pendukung Optimis":
                return "Jika Pendukung Optimis: Terima argumen mahasiswa dan pikirkan cara untuk memperluasnya ke implikasi yang paling positif dan visioner. Siapkan pertanyaan yang mendorong eksplorasi potensi.";
            case "Analis Data Netral":
                return "Jika Analis Data Netral: Abaikan emosi dan spekulasi. Fokus pada data, fakta, dan validitas logis dari argumen mahasiswa. Cari celah dalam data atau penalaran.";
            case "Filsuf Etis":
                return "Jika Filsuf Etis: Evaluasi argumen mahasiswa dari sudut pandang moral, etika, dan dampaknya terhadap nilai-nilai kemanusiaan dan sosial.";
            default:
                return "";
        }
    };

    const handleStartDebate = async () => {
        if (!moduleTopic.trim() || !persona.trim() || (!thesis.trim() && files.length === 0)) {
            setError('Topik, Tesis/File, dan Persona ABM-UT harus diisi.');
            return;
        }
        setError('');

        let filesContent = '';
        if (files.length > 0) {
            try {
                const contents = await Promise.all(files.map(f => readFileAsText(f)));
                filesContent = contents.map((content, i) => `--- FILE ${i + 1}: ${files[i].name} ---\n${content}`).join('\n\n');
            } catch (e) {
                setError('Gagal membaca satu atau lebih file. Silakan coba lagi.');
                return;
            }
        }

        const personaRules = getPersonaRules(persona);

        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, berperan sebagai lawan debat yang cerdas. Anda akan menganalisis tesis atau argumen yang diajukan oleh mahasiswa.

[DATA INPUT PENGGUNA]
- Modul/Topik Utama: ${moduleTopic}
- Tesis Mahasiswa: ${thesis || '(Gunakan konten file)'}
- Konten File: ${filesContent ? `\n${filesContent}` : '(Tidak ada file)'}

[TUGAS ANDA]
Analisis [modul_atau_topik_utama] dan [tesis_mahasiswa / file diupload].
Adopsi Penuh peran sebagai "${persona}". Segera internalisasi cara berpikir, prioritas, dan gaya bicara dari persona yang dipilih.
Mahasiswa akan memberikan argumen pembuka. Tanggapi dengan argumen balasan yang kuat berdasarkan persona Anda. Jangan pernah setuju dengan mudah, tantang mahasiswa untuk berpikir lebih dalam.

[ATURAN PERAN SPESIFIK]
${personaRules}
        `.trim();

        setSystemPrompt(prompt);
        setStep('debate');
    };
    
    // Drag and drop handlers
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

    const handleSessionUpdate = (convo: ChatMessage[]) => {
        setConversation(convo);
        onSessionComplete(convo, id, moduleTopic, systemPrompt, courseName);
    };

    const downloadTranscript = async (format: 'pdf' | 'word') => {
        const docTitle = `Transkrip_Debat_${moduleTopic.replace(/\s/g, '_')}`;
        
        let transcriptHtml = '';
        for (const msg of conversation) {
            const speaker = msg.role === 'model' ? 'ABM-UT' : studentData.name;
            const unsafeHtml = await marked.parse(msg.text);
            const msgHtml = DOMPurify.sanitize(unsafeHtml);
            transcriptHtml += `<p><strong>${speaker}:</strong></p>${msgHtml}`;
        }
        
        const headerHtml = `<h1>Transkrip Debat</h1><p><strong>Topik:</strong> ${moduleTopic}</p><p><strong>Persona ABM-UT:</strong> ${persona}</p><hr/>`;
        
        if (format === 'pdf') {
            const pdf = new jsPDF();
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${headerHtml}${transcriptHtml}</div>`;
            await pdf.html(styledHtml, {
                callback: (doc) => doc.save(`${docTitle}.pdf`),
                margin: 15,
                autoPaging: 'text',
                width: 180,
                windowWidth: 800
            });
        } else { // Word
            const fullHtml = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${headerHtml}${transcriptHtml}</body></html>`;
            const blob = new Blob([fullHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docTitle}.doc`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };


    const renderSetup = () => (
        <div className="max-w-5xl mx-auto space-y-6">
            <p className="text-center text-lg text-slate-300">Siapkan argumen Anda. ABM-UT akan menganalisisnya dari sudut pandang yang Anda pilih.</p>
            <div>
                <label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah (Opsional)</label>
                <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Kaitkan sesi ini dengan mata kuliah..."/>
            </div>
            <div>
                <label htmlFor="moduleTopic" className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label>
                <input 
                    id="moduleTopic"
                    type="text" 
                    value={moduleTopic} 
                    onChange={e => setModuleTopic(e.target.value)} 
                    placeholder="Contoh: Etika dalam Kecerdasan Buatan"
                    className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500 placeholder:italic"
                />
            </div>
             <div>
                <label htmlFor="thesis" className="block text-sm font-medium text-slate-300 font-display">Tesis / Argumen Utama Anda</label>
                <textarea 
                    id="thesis"
                    rows={4}
                    value={thesis} 
                    onChange={e => setThesis(e.target.value)} 
                    placeholder="Tuliskan argumen utama Anda di sini..."
                    className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500 placeholder:italic"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 font-display">Atau Unggah File Argumen</label>
                 <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <div className="flex text-sm text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*,video/*,audio/*,text/*" /><span>Pilih File</span></label>
                            <p className="pl-1">atau seret dan lepas</p>
                        </div>
                        <p className="text-xs text-slate-500">PDF, Gambar, Video, Audio, Teks (Maks. 4 file)</p>
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
                <label className="block text-sm font-medium text-slate-300 font-display mb-2">Pilih Persona Lawan Debat (ABM-UT)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {personas.map(p => (
                        <button 
                            key={p} 
                            onClick={() => setPersona(p)}
                            className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 text-center ${persona === p ? 'bg-ut-blue text-white scale-105 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            {error && <p className="text-ut-red text-sm text-center">{error}</p>}
            <button onClick={handleStartDebate} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Mulai Debat</button>
        </div>
    );
    
    return (
        <section id={id.replace(/\s+/g, '-')} className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
             <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Debat Cerdas dengan ABM-UT</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Asah kemampuan argumentasi Anda dengan berdebat melawan ABM-UT yang mengambil berbagai persona.</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />

                    <div>
                        {step === 'debate' ? (
                            <div>
                                <div className="p-4 mb-4 bg-slate-900/60 rounded-lg border border-slate-700 text-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                        <div>
                                            {courseName && <p><strong className="text-ut-blue-light font-display">Mata Kuliah:</strong> {courseName}</p>}
                                            <p><strong className="text-ut-blue-light font-display">Topik:</strong> {moduleTopic}</p>
                                            <p><strong className="text-ut-blue-light font-display">Persona ABM-UT:</strong> {persona}</p>
                                        </div>
                                        {conversation.length > 1 && (
                                             <div className="flex items-center gap-2 flex-shrink-0">
                                                <button onClick={() => downloadTranscript('word')} className="px-3 py-1.5 text-xs bg-ut-blue hover:bg-ut-blue-light rounded-md shadow-md transition-colors">Unduh Word</button>
                                                <button onClick={() => downloadTranscript('pdf')} className="px-3 py-1.5 text-xs bg-ut-green hover:bg-green-500 rounded-md shadow-md transition-colors">Unduh PDF</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChatInterface
                                    studentData={studentData}
                                    systemPrompt={systemPrompt}
                                    chatTitle={`Debat: ${moduleTopic}`}
                                    onSessionComplete={handleSessionUpdate}
                                    initialConversation={initialData?.conversation}
                                />
                            </div>

                        ) : (
                            renderSetup()
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};