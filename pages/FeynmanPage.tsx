import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChatInterface } from '../components/ChatInterface';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import type { StudentData, ChatMessage, AppView, LearningHistoryEntry } from '../types';
import { CourseSearchInput } from '../components/CourseSearchInput';

interface FeynmanPageProps {
    studentData: StudentData;
    onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
    setActiveView: (view: AppView) => void;
    initialData?: LearningHistoryEntry;
}

type FeynmanStep = 'setup' | 'chat';

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const FeynmanPage: React.FC<FeynmanPageProps> = ({ studentData, onSessionComplete, setActiveView, initialData }) => {
    const id: AppView = 'Teknik Feynman';
    const parentView = PARENT_VIEW_MAP[id];
    
    const [step, setStep] = useState<FeynmanStep>(initialData ? 'chat' : 'setup');
    const [courseName, setCourseName] = useState(initialData?.courseName || '');
    const [difficultConcept, setDifficultConcept] = useState(initialData?.topic || '');
    const [files, setFiles] = useState<File[]>([]);
    const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
    const [error, setError] = useState('');
    const [conversation, setConversation] = useState<ChatMessage[]>(initialData?.conversation || []);

    const dropzoneRef = useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        dropzoneRef.current?.classList.add('border-ut-blue', 'bg-ut-blue/10');
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        dropzoneRef.current?.classList.remove('border-ut-blue', 'bg-ut-blue/10');
    };
    const handleDrop = (e: React.DragEvent) => {
        handleDragLeave(e);
        handleFileUpload(e.dataTransfer.files);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e.target.files);
    };

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

    const handleStartFeynman = async () => {
        if (!courseName.trim() || !difficultConcept.trim()) {
            setError('Nama Mata Kuliah dan Konsep yang Sulit harus diisi.');
            return;
        }
        setError('');
        
        let filesContent = '';
        if (files.length > 0) {
            try {
                const contents = await Promise.all(files.map(f => readFileAsText(f)));
                filesContent = contents.map((content, i) => `--- FILE ${i + 1}: ${files[i].name} ---\n${content}`).join('\n\n');
            } catch (e) {
                setError('Gagal membaca satu atau lebih file. Silakan coba lagi atau lanjutkan tanpa file.');
                return;
            }
        }

        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT (Asisten Belajar Mahasiswa - Universitas Terbuka), berperan sebagai murid awam yang cerdas dan penasaran. Posisi Anda adalah seolah-olah Anda tidak tahu apa-apa tentang topik yang akan dijelaskan oleh mahasiswa. Anda harus bersikap seperti anak kecil atau orang awam yang terus bertanya "kenapa?" dan "itu apa?" sampai penjelasannya menjadi sangat sederhana dan mudah dipahami.

[TUJUAN UTAMA]
Tujuan utama Anda adalah memandu mahasiswa melalui empat langkah Teknik Feynman untuk menguasai sebuah konsep. Anda melakukan ini dengan memaksa mereka untuk menyederhanakan, mengidentifikasi celah dalam pemahaman mereka sendiri, dan menggunakan analogi yang efektif melalui pertanyaan-pertanyaan dasar Anda.

[DATA INPUT PENGGUNA]
- nama_mahasiswa: ${studentData.name}
- fakultas: ${studentData.faculty}
- jurusan: ${studentData.studyProgram}
- semester: ${studentData.semester}
- nama_mata_kuliah: ${courseName}
- konsep_sulit: ${difficultConcept}
${filesContent ? `- konten_file_materi: \n---\n${filesContent}\n---` : ''}

[PROSES LANGKAH-DEMI-LANGKAH]
LANGKAH 1: Sapaan dan Pengaturan Panggung
Mulailah dengan sapaan yang ramah dan sederhana. Jelaskan peran Anda dengan jelas: Anda adalah murid yang siap belajar. Minta mahasiswa untuk mulai mengajarkan "${difficultConcept}" kepada Anda seolah-olah Anda tidak tahu apa-apa.
Template Sapaan: "Halo kak ${studentData.name}! Aku dengar kakak mau mengajariku tentang ${difficultConcept}. Aku siap belajar! Coba jelaskan kepadaku, ya. Anggap saja aku belum pernah dengar istilah itu sama sekali."

LANGKAH 2: Mendengarkan dan Mengidentifikasi Celah (Inti Proses)
Dengarkan dengan saksama penjelasan pertama dari mahasiswa. Tugas utama Anda adalah mendeteksi jargon, istilah teknis, atau penjelasan yang terlalu rumit. Begitu Anda menemukannya, langsung potong dan tanyakan dengan polos.
Template Pertanyaan: "Maaf, kak. Tadi kakak bilang '...' itu apa ya? Aku belum ngerti.", "Hmm... kenapa bisa begitu ya?", "Bisa kasih contoh yang gampang nggak, kak?".

LANGKAH 3: Mendorong Analogi dan Penyederhanaan
Jika mahasiswa masih kesulitan, dorong mereka untuk membuat analogi.
Template Pertanyaan: "Coba bayangkan kakak lagi jelasin ini ke anak SD, gimana caranya?", "Ini mirip seperti apa ya dalam kehidupan sehari-hari?".

LANGKAH 4: Meninjau dan Mengkonfirmasi Pemahaman
Setelah mahasiswa berhasil menyederhanakan, ulangi penjelasan mereka dengan kata-kata Anda sendiri untuk memastikan Anda (dan mereka) benar-benar paham.
Template Konfirmasi: "Oh, jadi maksudnya ... itu seperti ... ya, kak? Benar nggak?".

[GAYA BICARA]
Gaya bicara Anda harus selalu ramah, sopan, sedikit polos, dan penuh rasa ingin tahu. Jangan pernah terdengar menggurui atau menguji. Posisi Anda adalah murid yang benar-benar ingin belajar. Panggil mahasiswa dengan nama mereka ("kak ${studentData.name}").

Mulai sesi SEKARANG dengan LANGKAH 1: Sapaan dan Pengaturan Panggung. Jangan berikan respons lain, langsung mulai dengan template sapaan.
        `.trim();

        setSystemPrompt(prompt);
        setStep('chat');
    };

    const handleSessionUpdate = (convo: ChatMessage[]) => {
        setConversation(convo);
        onSessionComplete(convo, id, difficultConcept, systemPrompt, courseName);
    };

    const downloadTranscript = async (format: 'pdf' | 'word') => {
        const docTitle = `Transkrip_Feynman_${difficultConcept.replace(/\s/g, '_')}`;
        
        let transcriptHtml = '';
        for (const msg of conversation) {
            const speaker = msg.role === 'model' ? 'ABM-UT (Murid)' : `${studentData.name} (Pengajar)`;
            const unsafeHtml = await Promise.resolve(marked.parse(msg.text));
            const msgHtml = DOMPurify.sanitize(unsafeHtml);
            transcriptHtml += `<p><strong>${speaker}:</strong></p>${msgHtml}`;
        }
        
        const headerHtml = `<h1>Transkrip Sesi Teknik Feynman</h1><p><strong>Konsep yang Dijelaskan:</strong> ${difficultConcept}</p><hr/>`;
        
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
        <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-center text-lg text-gray-300">Jelaskan sebuah konsep dengan bahasa sederhana seolah-olah Anda sedang mengajari orang awam. ABM-UT akan berperan sebagai murid Anda.</p>
            <div>
                <label className="block text-sm font-medium text-gray-300 font-display">Nama Mata Kuliah</label>
                <CourseSearchInput
                    value={courseName}
                    onChange={setCourseName}
                    placeholder="Contoh: Fisika Dasar"
                />
            </div>
            <div>
                <label htmlFor="difficultConcept" className="block text-sm font-medium text-gray-300 font-display">Konsep yang Sulit Dipahami</label>
                <input
                    id="difficultConcept"
                    type="text"
                    value={difficultConcept}
                    onChange={e => setDifficultConcept(e.target.value)}
                    placeholder="Contoh: Hukum Termodinamika"
                    className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 font-display">Unggah File Materi Tambahan (Opsional)</label>
                <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <div className="flex text-sm text-slate-400">
                            <label htmlFor="file-upload-feynman" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload-feynman" type="file" multiple className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*,video/*,audio/*,text/*" /><span>Pilih File</span></label>
                            <p className="pl-1">atau seret dan lepas (Maks. 4 file)</p>
                        </div>
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
            {error && <p className="text-ut-red text-sm text-center">{error}</p>}
            <button onClick={handleStartFeynman} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Mulai Sesi Feynman</button>
        </div>
    );
    
    return (
        <section id={id.replace(/\s+/g, '-')} className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
             <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">{id}</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Jelaskan sebuah konsep dengan bahasa sederhana seolah-olah Anda sedang mengajari orang lain.</p>
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
                                    <p><strong className="text-ut-blue-light font-display">Konsep yang dijelaskan:</strong> {difficultConcept}</p>
                                    {conversation.length > 1 && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => downloadTranscript('word')} className="px-3 py-1.5 text-xs bg-ut-blue hover:bg-ut-blue-light rounded-md shadow-md">Unduh Word</button>
                                            <button onClick={() => downloadTranscript('pdf')} className="px-3 py-1.5 text-xs bg-ut-green hover:bg-green-500 rounded-md shadow-md">Unduh PDF</button>
                                        </div>
                                    )}
                                </div>
                                <ChatInterface
                                    studentData={studentData}
                                    systemPrompt={systemPrompt}
                                    chatTitle={`Feynman: ${difficultConcept}`}
                                    onSessionComplete={handleSessionUpdate}
                                    initialConversation={conversation}
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
