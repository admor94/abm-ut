import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChatInterface } from '../components/ChatInterface';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateArgumentOutline } from '../services/geminiService';
import type { StudentData, ChatMessage, AppView, LearningHistoryEntry, ArgumentOutline } from '../types';
import { CourseSearchInput } from '../components/CourseSearchInput';

interface ArgumentDesignerPageProps {
    studentData: StudentData;
    onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
    setActiveView: (view: AppView) => void;
    initialData?: LearningHistoryEntry;
}

type PageStep = 'setup' | 'chat' | 'generatingOutline' | 'displayOutline';

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">ABM-UT sedang menganalisis sesi bimbingan dan menyusun kerangka argumen...</p>
        <p className="text-gray-400 mt-2">Ini mungkin akan memakan waktu sejenak.</p>
    </div>
);

const MarkdownDisplay: React.FC<{ markdown: string }> = ({ markdown }) => {
    const [html, setHtml] = useState('');
    useEffect(() => {
        let isMounted = true;
        Promise.resolve(marked.parse(markdown)).then(parsedHtml => {
            if (isMounted && parsedHtml) {
                setHtml(DOMPurify.sanitize(parsedHtml));
            }
        });
        return () => { isMounted = false; };
    }, [markdown]);
    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

export const ArgumentDesignerPage: React.FC<ArgumentDesignerPageProps> = ({ studentData, onSessionComplete, setActiveView, initialData }) => {
    const id: AppView = 'Perancang Argumen';
    const parentView = PARENT_VIEW_MAP[id];
    
    const [step, setStep] = useState<PageStep>(initialData ? 'chat' : 'setup');
    const [courseName, setCourseName] = useState(initialData?.courseName || '');
    const [topic, setTopic] = useState(initialData?.topic || '');
    const [thesis, setThesis] = useState('');
    const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
    const [conversation, setConversation] = useState<ChatMessage[]>(initialData?.conversation || []);
    const [outline, setOutline] = useState<ArgumentOutline | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setConversation(initialData.conversation);
        }
    }, [initialData]);

    const handleStartChat = () => {
        if (!topic.trim()) {
            setError('Topik atau Materi Utama harus diisi.');
            return;
        }
        if (!thesis.trim()) {
            setError('Harap isi Tesis Awal untuk memulai sesi bimbingan.');
            return;
        }

        setError('');

        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang Mentor Akademik yang ahli dalam metode Sokratik. Tugas Anda adalah memandu mahasiswa, bukan memberi jawaban.

[TUJUAN UTAMA]
Membantu mahasiswa membangun kerangka argumen yang kuat dan terstruktur dari awal hingga akhir dengan mengajukan pertanyaan-pertanyaan yang merangsang pemikiran kritis.

[DATA INPUT PENGGUNA]
- Topik: ${topic}
- Tesis Awal: ${thesis || 'Belum ada, bantu mahasiswa merumuskannya.'}

[PROSES BIMBINGAN]
1.  **Mulai dari Tesis**: Jika ada [tesis_awal], evaluasi. Jika tidak, bantu merumuskan. Ajukan pertanyaan untuk mempertajamnya. Contoh: "Tesis itu menarik. Apa asumsi utama di baliknya?", "Bisakah kita buat itu lebih spesifik?".
2.  **Kembangkan Poin Utama**: Setelah tesis kuat, gali poin-poin pendukung. Contoh: "Apa tiga argumen utama yang akan Anda gunakan untuk mendukung tesis ini?", "Untuk argumen pertama, bukti apa yang Anda miliki?".
3.  **Pertimbangkan Sanggahan**: Dorong mahasiswa untuk berpikir kritis tentang argumen mereka. Contoh: "Apa argumen terkuat yang bisa menentang posisi Anda?", "Bagaimana Anda akan menjawab kritik tersebut?".
4.  **Simpulkan**: Bantu mahasiswa merangkum argumen dan merumuskan kesimpulan yang berdampak. Contoh: "Bagaimana kita bisa menyatukan semua ini? Apa implikasi yang lebih luas dari argumen Anda?".

[GAYA BICARA]
Suportif, Mendorong, dan Bertanya, bukan Menggurui. Selalu panggil mahasiswa dengan nama mereka (${studentData.name}).

Mulai sesi dengan menyapa dan menanyakan tentang tesis awal mereka berdasarkan topik yang diberikan.
        `.trim();
        
        setSystemPrompt(prompt);
        setStep('chat');
    };

    const handleSessionUpdate = (convo: ChatMessage[]) => {
        setConversation(convo);
        onSessionComplete(convo, id, topic, systemPrompt, courseName);
    };
    
    const handleGenerateOutline = async () => {
        if (conversation.length < 2) { // Need at least one user and one model message
            setError("Sesi bimbingan terlalu singkat untuk menghasilkan kerangka. Lakukan diskusi lebih lanjut.");
            return;
        }
        setError('');
        setStep('generatingOutline');
        try {
            const result = await generateArgumentOutline(conversation, studentData, topic);
            setOutline(result);
            setStep('displayOutline');
        } catch(err: any) {
            setError(err.message || 'Gagal membuat kerangka.');
            setStep('chat');
        }
    };
    
    const downloadOutline = async (format: 'pdf' | 'word') => {
        if (!outline) return;
        const docTitle = `Kerangka_Argumen_${topic.replace(/\s/g, '_')}`;
        
        const thesisHtml = await Promise.resolve(marked.parse(outline.thesis));
        const mainPointsHtml = (await Promise.all(outline.mainPoints.map(async (p, i) => {
            const claimHtml = await Promise.resolve(marked.parse(p.claim));
            const evidenceHtml = await Promise.resolve(marked.parse(p.evidence));
            const analysisHtml = await Promise.resolve(marked.parse(p.analysis));
            return `<h4>Poin ${i + 1}</h4>
                    <div><strong>Klaim:</strong> ${claimHtml}</div>
                    <div><strong>Bukti:</strong> ${evidenceHtml}</div>
                    <div><strong>Analisis:</strong> ${analysisHtml}</div>`;
        }))).join('<br/>');
        const counterHtml = await Promise.resolve(marked.parse(outline.counterArgument.potential));
        const rebuttalHtml = await Promise.resolve(marked.parse(outline.counterArgument.rebuttal));
        const summaryHtml = await Promise.resolve(marked.parse(outline.conclusion.summary));
        const finalStatementHtml = await Promise.resolve(marked.parse(outline.conclusion.finalStatement));

        const contentHtml = `
            <h1>Rancangan Kerangka Argumen</h1>
            <p><strong>Topik:</strong> ${topic}</p>
            <hr/>
            <h2>1. Pernyataan Tesis</h2>
            <div>${thesisHtml}</div>
            <h2>2. Poin-Poin Argumen Utama</h2>
            ${mainPointsHtml}
            <h2>3. Argumen Sanggahan & Bantahan</h2>
            <div><strong>Potensi Sanggahan:</strong> ${counterHtml}</div>
            <div><strong>Bantahan:</strong> ${rebuttalHtml}</div>
            <h2>4. Kesimpulan</h2>
            <div><strong>Ringkasan Argumen:</strong> ${summaryHtml}</div>
            <div><strong>Pernyataan Penutup:</strong> ${finalStatementHtml}</div>
        `;

        const sanitizedHtml = DOMPurify.sanitize(contentHtml);

        if (format === 'pdf') {
            const pdf = new jsPDF();
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${sanitizedHtml}</div>`;
            await pdf.html(styledHtml, {
                callback: (doc) => doc.save(`${docTitle}.pdf`),
                margin: 15,
                autoPaging: 'text',
                width: 180,
                windowWidth: 800
            });
        } else { // Word
            const fullHtml = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${sanitizedHtml}</body></html>`;
            const blob = new Blob([fullHtml], { type: 'application/msword' });
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
            case 'setup':
                return (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <p className="text-center text-lg text-gray-300">ABM-UT akan memandu Anda melalui sesi tanya jawab untuk membangun argumen yang kokoh.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 font-display">Nama Mata Kuliah (Opsional)</label>
                            <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Kaitkan sesi ini dengan mata kuliah..."/>
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-300 font-display">Topik atau Materi Utama</label>
                            <input id="topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Contoh: Dampak Regulasi AI terhadap Inovasi" className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic" />
                        </div>
                         <div>
                            <label htmlFor="thesis" className="block text-sm font-medium text-gray-300 font-display">Tesis Awal</label>
                            <textarea id="thesis" rows={3} value={thesis} onChange={e => setThesis(e.target.value)} placeholder="Tuliskan draf tesis Anda jika sudah ada..." className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"></textarea>
                        </div>
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={handleStartChat} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Mulai Sesi Bimbingan</button>
                    </div>
                );
            case 'chat':
                return (
                    <div>
                         <div className="p-4 mb-4 bg-gray-800/60 rounded-lg border border-gray-700 text-sm">
                            <p className="text-center">Setelah sesi bimbingan selesai, klik tombol di bawah untuk membuat kerangka argumen.</p>
                             {error && <p className="text-ut-red text-sm text-center mt-2">{error}</p>}
                            <button onClick={handleGenerateOutline} className="w-full mt-2 py-2 px-4 font-display font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg transition duration-300">Buat Kerangka Argumen</button>
                        </div>
                        <ChatInterface
                            studentData={studentData}
                            systemPrompt={systemPrompt}
                            chatTitle={`Merancang Argumen: ${topic}`}
                            onSessionComplete={handleSessionUpdate}
                            initialConversation={conversation}
                        />
                    </div>
                );
            case 'generatingOutline':
                return <LoadingState />;
            case 'displayOutline':
                if (!outline) return <div>Gagal memuat kerangka.</div>;
                return (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="text-center">
                             <h3 className="text-2xl font-bold font-display text-white">Rancangan Kerangka Argumen Anda</h3>
                             <p className="text-gray-400">Berikut adalah hasil sintesis dari sesi bimbingan Anda.</p>
                        </div>
                        <div className="space-y-4 p-6 bg-gray-800/50 rounded-lg shadow-inner">
                           <MarkdownDisplay markdown={`**Tesis:** ${outline.thesis}`} />
                           <hr className="border-gray-700"/>
                           {outline.mainPoints.map((p, i) => (
                               <div key={i}>
                                   <MarkdownDisplay markdown={`**Poin ${i+1}:** ${p.claim}\n\n*   **Bukti:** ${p.evidence}\n*   **Analisis:** ${p.analysis}`} />
                               </div>
                           ))}
                           <hr className="border-gray-700"/>
                           <MarkdownDisplay markdown={`**Sanggahan:** ${outline.counterArgument.potential}\n\n**Bantahan:** ${outline.counterArgument.rebuttal}`} />
                           <hr className="border-gray-700"/>
                           <MarkdownDisplay markdown={`**Kesimpulan:** ${outline.conclusion.summary} ${outline.conclusion.finalStatement}`} />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep('chat')} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-lg shadow-lg">Kembali ke Chat</button>
                            <button onClick={() => downloadOutline('pdf')} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg">Unduh PDF</button>
                            <button onClick={() => downloadOutline('word')} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Unduh Word</button>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <section id={id.replace(/\s+/g, '-')} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Perancang Argumen</h1>
                <p className="mt-2 text-lg text-gray-300 max-w-4xl">Bangun argumen yang kuat dan terstruktur untuk esai atau karya ilmiah Anda.</p>
            </div>
            <div className="w-full max-w-5xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                <PageHeader
                    parentView={parentView}
                    setActiveView={setActiveView}
                />
                {renderStep()}
            </div>
        </section>
    );
};
