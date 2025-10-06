import React, { useState, useRef } from 'react';
import type { AppView, StudentData, ChatMessage, LearningHistoryEntry } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { CourseSearchInput } from '../components/CourseSearchInput';
import { ChatInterface } from '../components/ChatInterface';

interface AsistenBmpPageProps {
    studentData: StudentData;
    setActiveView: (view: AppView) => void;
    onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
    initialData?: LearningHistoryEntry;
}

type PageStep = 'setup' | 'chat';

export const AsistenBmpPage: React.FC<AsistenBmpPageProps> = ({ studentData, setActiveView, onSessionComplete, initialData }) => {
    const id: AppView = 'Asisten BMP';
    const parentView = PARENT_VIEW_MAP[id];
    
    const [step, setStep] = useState<PageStep>(initialData ? 'chat' : 'setup');
    const [courseName, setCourseName] = useState(initialData?.courseName || '');
    const [files, setFiles] = useState<File[]>([]);
    const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
    const [conversation, setConversation] = useState<ChatMessage[]>(initialData?.conversation || []);
    const [error, setError] = useState('');

    const dropzoneRef = useRef<HTMLDivElement>(null);

    const handleStartSession = () => {
        if (!courseName.trim() || files.length === 0) {
            setError('Nama Mata Kuliah dan minimal satu file BMP harus diisi.');
            return;
        }
        setError('');

        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang Asisten Ahli untuk Buku Materi Pokok (BMP) mata kuliah "${courseName}". Anda memiliki akses penuh dan pemahaman mendalam HANYA pada dokumen BMP yang diunggah oleh mahasiswa. Anda TIDAK BOLEH menggunakan pengetahuan eksternal di luar file yang diberikan.

[TUJUAN UTAMA]
Tujuan Anda adalah membantu mahasiswa, ${studentData.name}, memahami isi BMP secara efisien. Jawab pertanyaan, buat ringkasan, atau generate soal latihan HANYA berdasarkan konten dari file-file yang diunggah.

[ATURAN INTERAKSI]
1.  **Berbasis Dokumen**: Selalu dasarkan jawaban Anda pada informasi yang ada di dalam file BMP. Jika informasi tidak ada, katakan dengan jujur, "Informasi tersebut tidak ditemukan dalam BMP yang Anda berikan."
2.  **Spesifik & Kontekstual**: Jika memungkinkan, sebutkan dari modul atau halaman mana Anda mengambil informasi. Contoh: "Berdasarkan penjelasan di Modul 3, Bagian 2, konsep tersebut adalah..."
3.  **Proaktif**: Setelah menjawab, tawarkan langkah selanjutnya. Contoh: "Apakah ada bagian lain dari topik ini yang ingin Anda diskusikan?", "Apakah Anda ingin saya buatkan beberapa soal latihan dari bab ini?".
4.  **Sapaan Awal**: Mulai sesi dengan menyapa mahasiswa dan konfirmasi bahwa Anda siap membantu.

Mulai sesi dengan menyapa dan mempersilakan mahasiswa bertanya.
        `.trim();

        setSystemPrompt(prompt);
        // Start with a greeting message from the model
        const initialModelMessage: ChatMessage = {
            role: 'model',
            text: `Halo ${studentData.name.split(' ')[0]}! Saya adalah Asisten Ahli untuk BMP mata kuliah **${courseName}**. Saya telah mempelajari file yang Anda unggah. Apa yang bisa saya bantu jelaskan dari materi tersebut?`
        };
        setConversation([initialModelMessage]);
        setStep('chat');
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
                setError(`Anda hanya dapat mengunggah maksimal ${MAX_FILES} file BMP.`);
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
        onSessionComplete(convo, id, `Asisten BMP: ${courseName}`, systemPrompt, courseName);
    };

    const renderSetup = () => (
        <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-center text-lg text-slate-300">Unggah BMP Anda dalam format PDF, lalu mulailah berdiskusi dengan AI yang fokus pada materi tersebut.</p>
            <div>
                <label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label>
                <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Pilih mata kuliah yang sesuai dengan BMP..."/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 font-display">Unggah File BMP (Buku Materi Pokok)</label>
                <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <div className="flex text-sm text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="application/pdf" /><span>Pilih File</span></label>
                            <p className="pl-1">atau seret dan lepas (Maks. 4 file)</p>
                        </div>
                    </div>
                </div>
                 {files.length > 0 && (
                    <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium text-slate-300">File BMP yang diunggah:</p>
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md text-sm">
                                <span className="text-slate-300 truncate pr-2">{f.name}</span>
                                <button onClick={() => removeFile(i)} className="text-ut-red hover:text-red-400 font-bold text-lg flex-shrink-0" aria-label={`Hapus file ${f.name}`}>&times;</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="text-ut-red text-sm text-center">{error}</p>}
            <button onClick={handleStartSession} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Mulai Sesi Tanya Jawab</button>
        </div>
    );
    
    return (
        <section id={id.replace(/\s+/g, '-')} className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
             <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Asisten BMP</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Unggah BMP Anda dan berinteraksi dengan AI yang bertindak sebagai ahli materi khusus untuk mata kuliah tersebut.</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />
                    <div>
                        {step === 'chat' ? (
                            <div>
                                <div className="p-4 mb-4 bg-slate-900/60 rounded-lg border border-slate-700 text-sm">
                                    <p><strong className="text-ut-blue-light font-display">Mata Kuliah:</strong> {courseName}</p>
                                    <p><strong className="text-ut-blue-light font-display">File BMP Aktif:</strong> {files.map(f => f.name).join(', ')}</p>
                                </div>
                                <ChatInterface
                                    studentData={studentData}
                                    systemPrompt={systemPrompt}
                                    chatTitle={`Asisten BMP: ${courseName}`}
                                    onSessionComplete={handleSessionUpdate}
                                    initialConversation={conversation}
                                    filesToAttach={files}
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
