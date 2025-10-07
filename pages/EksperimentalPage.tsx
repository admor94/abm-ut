import React, { useState, useRef } from 'react';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { getAiResponse } from '../services/geminiService';
import { ChatInterface } from '../components/ChatInterface';
import { CourseSearchInput } from '../components/CourseSearchInput';

interface EksperimentalPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'step1_context' | 'step2_problem' | 'step3_draft' | 'step4_chat' | 'step5_final';

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl font-display text-white">{message}</p>
    </div>
);

export const EksperimentalPage: React.FC<EksperimentalPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Eksperimental'];
    
    const [step, setStep] = useState<PageStep>('step1_context');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1 State
    const [manualMaterial, setManualMaterial] = useState('');
    const [refFiles, setRefFiles] = useState<File[]>([]);
    const [mainFile, setMainFile] = useState<File | null>(null);
    const [urls, setUrls] = useState(['', '', '', '']);
    const [videoUrl, setVideoUrl] = useState('');
    const [step1Response, setStep1Response] = useState('');
    // FIX: Add courseName state to store the course name from user input.
    const [courseName, setCourseName] = useState('');

    // Step 2 State
    const [caseStudy, setCaseStudy] = useState('');
    const [tutorGuidelines, setTutorGuidelines] = useState('');
    const [step2Response, setStep2Response] = useState('');
    
    // Step 3 State
    const [draftAnswer, setDraftAnswer] = useState('');
    
    // Step 4 State
    const [chatConversation, setChatConversation] = useState([]);
    const [chatSystemPrompt, setChatSystemPrompt] = useState('');
    
    // Step 5 State
    const [finalAnswer, setFinalAnswer] = useState('');

    const handleStep1 = async () => {
        // This is a dummy step in the UI as per the prompt. 
        // In a real scenario, we'd process files/urls here.
        // For now, we just simulate the AI's fixed response.
        setIsLoading(true);
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep1Response("Semua sumber materi dan referensi sudah diproses dan dipahami. Sekarang, masukkan pertanyaan atau studi kasus yang akan kita pecahkan.");
        setIsLoading(false);
        setStep('step2_problem');
    };
    
    const handleStep2 = async () => {
        if (!caseStudy.trim() && !tutorGuidelines.trim()) {
            setError("Harap isi studi kasus/pertanyaan atau panduan dosen.");
            return;
        }
        setIsLoading(true);
        // A real implementation would send all context from step 1.
        // For this UI flow, we'll just use the new inputs.
        const prompt = `
            PERAN: Anda adalah seorang Asisten Akademik yang cermat.
            KONTEKS: Anda telah memahami semua materi dan referensi yang diberikan di tahap sebelumnya.
            INPUT BARU:
            1. Studi Kasus/Pertanyaan: ${caseStudy}
            2. Panduan & Ketentuan Dosen: ${tutorGuidelines}
            TUGAS: Analisis input baru. Sintesiskan permintaan utama. Sajikan pemahaman Anda dalam bentuk kalimat konfirmasi yang jelas dan ringkas.
            CONTOH OUTPUT: "Baik, saya mengerti. Tugas ini meminta kita untuk menganalisis [inti studi kasus/pertanyaan] dengan menerapkan [konsep utama dari materi], sambil memastikan formatnya sesuai dengan [ketentuan paling penting dari dosen]. Apakah pemahaman ini sudah akurat?"
        `;
        try {
            const res = await getAiResponse([], studentData, prompt);
            setStep2Response(res);
            setStep('step3_draft');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStep3 = async () => {
         setIsLoading(true);
         const prompt = `
            PERAN UTAMA: Anda adalah seorang mahasiswa dari Fakultas ${studentData.faculty}, Program Studi ${studentData.studyProgram}. Anda cerdas, analitis, dan memahami semua materi yang diberikan.
            TUGAS: Buat draf jawaban berdasarkan analisis tugas ("${step2Response}") dan semua materi yang ada.
            ATURAN WAJIB:
            1. Gunakan Sudut Pandang Orang Pertama ("Menurut pendapat saya...", "Saya berpandangan bahwa..."). HINDARI BERTINDAK SEBAGAI ASISTEN AI UMUM, PERAN ANDA ADALAH MAHASISWA.
            2. Tunjukkan alur berpikir, jangan langsung sempurna.
            3. Gunakan data HANYA dari sumber yang diberikan (disimulasikan).
            OUTPUT: Hasilkan hanya teks draf jawaban.
         `;
         try {
            const res = await getAiResponse([{role: 'user', text: 'Buatkan draf jawaban'}], studentData, prompt);
            setDraftAnswer(res);
            setStep('step4_chat');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStep4 = async () => {
        // This step is now implicitly handled by the ChatInterface.
        // We'll prepare the system prompt for it.
        const prompt = `
            PERAN: Anda adalah ABM-UT yang bertindak sebagai teman diskusi kritis (Socratic Partner) untuk mahasiswa.
            KONTEKS: Draf jawaban ini sudah dibuat: "${draftAnswer}". Mahasiswa (${studentData.name}) sekarang siap berdiskusi.
            TUJUAN UTAMA: BUKAN untuk memberi jawaban, tetapi untuk MEMANCING pemikiran, opini, dan analisis orisinal dari mahasiswa berdasarkan draf yang ada.
            ATURAN INTERAKSI:
            1. Mulai Percakapan dengan pertanyaan terbuka tentang draf. Contoh: "Hai ${studentData.name}, coba kita lihat draf ini bersama. Menurut kamu, bagian mana dari argumen ini yang paling bisa kamu kembangkan dengan kata-katamu sendiri?"
            2. Ajukan Pertanyaan Terbuka: "Mengapa...", "Bagaimana...", "Coba jelaskan...".
            3. Gali Lebih Dalam jika jawaban singkat.
            4. Menilai Kecukupan: Setelah diskusi cukup, tutup dengan: "Diskusi yang sangat baik. Saya rasa kita sudah punya semua yang dibutuhkan untuk menyempurnakan jawaban ini. Silakan klik tombol 'Selesaikan'."
        `;
        setChatSystemPrompt(prompt);
        // We need an initial message from the AI.
        setIsLoading(true);
        try {
            const firstMessage = await getAiResponse([], studentData, prompt);
            setChatConversation([{role: 'model', text: firstMessage}] as any);
        } catch(e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStep5 = async () => {
        setIsLoading(true);
        const transcript = chatConversation.map((msg: any) => `${msg.role === 'user' ? studentData.name : 'ABM-UT'}: ${msg.text}`).join('\n');
        const prompt = `
            PERAN: Anda adalah Asisten Penulis Akademik. Persona output adalah sebagai mahasiswa ${studentData.name}.
            INPUT:
            1. Draf Awal: "${draftAnswer}"
            2. Transkrip Diskusi: "${transcript}"
            TUGAS:
            1. Sintesiskan: Ambil draf awal, perbaiki dan personalisasikan dengan ide orisinal dari ${studentData.name} yang ada di transkrip.
            2. Format Sesuai Aturan WAJIB:
            [Nama Saya] | NIM: [NIM Saya] | UPBJJ [UPBJJ Saya]
            Tanggapan Diskusi [Sesi Saya] - [Mata Kuliah]
            ---
            [Isi jawaban yang telah disintesiskan]
            ---
            Sumber Referensi:
            [Daftar semua sumber referensi (simulasikan dari konteks)]
            "Demikian tanggapan yang dapat saya sampaikan. Untuk memperkaya dan menyempurnakan pemahaman saya, masukan, koreksi, maupun arahan lebih lanjut dari Tutor dan rekan-rekan mahasiswa sangat saya harapkan, terimakasih."
        `.replace('[Nama Saya]', studentData.name)
         .replace('[NIM Saya]', '123456789') // Placeholder
         .replace('[UPBJJ Saya]', 'Jakarta') // Placeholder
         .replace('[Sesi Saya]', '3') // Placeholder
         .replace('[Mata Kuliah]', courseName);

        try {
            const res = await getAiResponse([], studentData, prompt);
            setFinalAnswer(res);
            setStep('step5_final');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderCurrentStep = () => {
        if (isLoading) return <LoadingState message="Memproses..." />;
        
        switch (step) {
            case 'step1_context':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Langkah 1: Pengumpulan Konteks & Materi</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 font-display">Mata Kuliah</label>
                            <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Pilih mata kuliah..." />
                        </div>
                        <textarea value={manualMaterial} onChange={e => setManualMaterial(e.target.value)} placeholder="Materi Manual..." rows={3} className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg" />
                        <div><label className="text-sm">Referensi (Maks 4)</label><input type="file" multiple onChange={e => setRefFiles(Array.from(e.target.files || []))} className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-ut-blue file:text-white" /></div>
                        <div><label className="text-sm">File Utama (Maks 1)</label><input type="file" onChange={e => setMainFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-ut-blue file:text-white" /></div>
                        <button onClick={handleStep1} className="w-full py-2 bg-ut-blue rounded-lg">Periksa Sumber</button>
                    </div>
                );
            case 'step2_problem':
                 return (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-900/50 border border-ut-green rounded-lg"><p className="text-ut-green">{step1Response}</p></div>
                        <h3 className="text-xl font-semibold text-white">Langkah 2: Definisi Masalah</h3>
                        <textarea value={caseStudy} onChange={e => setCaseStudy(e.target.value)} placeholder="Studi Kasus / Pertanyaan..." rows={4} className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg" />
                        <textarea value={tutorGuidelines} onChange={e => setTutorGuidelines(e.target.value)} placeholder="Panduan Dosen..." rows={2} className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg" />
                        <button onClick={handleStep2} className="w-full py-2 bg-ut-blue rounded-lg">Analisa dan Identifikasi</button>
                    </div>
                );
            case 'step3_draft':
                return (
                    <div className="space-y-4">
                         <div className="p-4 bg-green-900/50 border border-ut-green rounded-lg"><p className="text-ut-green">{step2Response}</p></div>
                         <h3 className="text-xl font-semibold text-white">Langkah 3: Pembuatan Draf Awal</h3>
                         <button onClick={handleStep3} className="w-full py-2 bg-ut-blue rounded-lg">Proses Jawaban</button>
                    </div>
                );
            case 'step4_chat':
                return (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Langkah 4: Diskusi & Kolaborasi</h3>
                        <div className="p-4 bg-slate-800/50 rounded-lg max-h-48 overflow-y-auto"><p className="text-sm italic text-slate-400 whitespace-pre-wrap">{draftAnswer}</p></div>
                        <button onClick={handleStep4} disabled={!!chatSystemPrompt} className="w-full py-2 bg-ut-yellow text-black rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Diskusikan</button>
                        {chatSystemPrompt && <ChatInterface studentData={studentData} systemPrompt={chatSystemPrompt} chatTitle="Diskusi Draf" onSessionComplete={(c: any) => setChatConversation(c)} initialConversation={chatConversation as any} />}
                        <button onClick={handleStep5} className="w-full py-2 bg-ut-green rounded-lg mt-4">Selesaikan</button>
                    </div>
                );
            case 'step5_final':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Langkah 5: Jawaban Final</h3>
                        <div className="p-4 bg-slate-900/50 rounded-lg max-h-96 overflow-y-auto border border-ut-green">
                            <pre className="text-sm text-white whitespace-pre-wrap font-sans">{finalAnswer}</pre>
                        </div>
                        <button onClick={() => setStep('step1_context')} className="w-full py-2 bg-slate-600 rounded-lg">Mulai Lagi</button>
                    </div>
                 );
        }
    }

    return (
        <section id="Eksperimental" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Fitur Eksperimental</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Alur kerja terpandu untuk penyelesaian tugas komprehensif.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />
                    {error && <p className="text-ut-red text-center mb-4">{error}</p>}
                    {renderCurrentStep()}
                </div>
            </div>
        </section>
    );
};