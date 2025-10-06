import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import 'jspdf-autotable';
import { ChatInterface } from '../components/ChatInterface';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateGroupProjectSummary } from '../services/geminiService';
import type { StudentData, ChatMessage, AppView, LearningHistoryEntry, GroupProjectSummary } from '../types';
import { CourseSearchInput } from '../components/CourseSearchInput';

interface GroupStudyWorkspacePageProps {
    studentData: StudentData;
    onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
    setActiveView: (view: AppView) => void;
    initialData?: LearningHistoryEntry;
}

type PageStep = 'setup' | 'chat' | 'generatingSummary' | 'displaySummary';

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl font-display text-white">ABM-UT sedang menganalisis sesi diskusi dan menyusun rangkuman...</p>
    </div>
);

export const GroupStudyWorkspacePage: React.FC<GroupStudyWorkspacePageProps> = ({ studentData, onSessionComplete, setActiveView, initialData }) => {
    const id: AppView = 'Ruang Kerja Kelompok Belajar';
    const parentView = PARENT_VIEW_MAP[id];
    
    const [step, setStep] = useState<PageStep>(initialData ? 'chat' : 'setup');
    const [courseName, setCourseName] = useState(initialData?.courseName || '');
    const [projectTitle, setProjectTitle] = useState(initialData?.topic || '');
    const [projectGoal, setProjectGoal] = useState('');
    const [membersString, setMembersString] = useState('');
    const [userName, setUserName] = useState(studentData.name);
    
    const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || '');
    const [conversation, setConversation] = useState<ChatMessage[]>(initialData?.conversation || []);
    const [summary, setSummary] = useState<GroupProjectSummary | null>(null);
    const [error, setError] = useState('');

    const groupMembers = useMemo(() => membersString.split(',').map(name => name.trim()).filter(Boolean), [membersString]);

    useEffect(() => {
        if (initialData) {
            setConversation(initialData.conversation);
            const prompt = initialData.systemPrompt;
            const goalMatch = prompt.match(/- Tujuan Proyek: (.*)/);
            const membersMatch = prompt.match(/- Anggota Kelompok: (.*)/);
            if(goalMatch) setProjectGoal(goalMatch[1]);
            if(membersMatch) setMembersString(membersMatch[1]);
        }
    }, [initialData]);

    const handleStartSession = () => {
        if (!projectTitle.trim() || !projectGoal.trim() || !membersString.trim() || !userName.trim()) {
            setError('Semua kolom harus diisi.');
            return;
        }
        if (!groupMembers.includes(userName)) {
            setError(`Nama Anda (${userName}) harus ada dalam daftar anggota kelompok.`);
            return;
        }
        setError('');

        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang fasilitator cerdas untuk sesi kerja kelompok virtual. Anda juga akan mensimulasikan anggota kelompok lain yang tidak dikendalikan oleh pengguna.

[DATA SESI]
- Topik Proyek: ${projectTitle}
- Tujuan Proyek: ${projectGoal}
- Anggota Kelompok: ${membersString}
- Pengguna Saat Ini: ${userName}

[ATURAN SIMULASI & FASILITASI]
1.  **Peran Ganda**: Anda adalah fasilitator DAN juga mensimulasikan semua anggota kelompok KECUALI ${userName}.
2.  **Mulai Sesi**: Mulailah dengan menyapa semua anggota, menyatakan tujuan proyek, dan ajukan pertanyaan pembuka untuk memulai diskusi.
3.  **Simulasi Anggota**: Saat merespons, buat kontribusi yang masuk akal untuk anggota lain. Beri label yang jelas, contoh: "Andi (ABM-UT): Menurut saya...". Buat kepribadian mereka sedikit berbeda (misalnya, satu orang kreatif, satu orang detail-oriented).
4.  **Fasilitasi Aktif**: Jaga agar diskusi tetap di jalur. Jika buntu, ajukan pertanyaan. Rangkum poin-poin penting secara berkala. Ajak anggota yang pendiam untuk berbicara, termasuk ${userName}. Contoh: "Itu poin yang bagus, Budi. ${userName}, bagaimana pendapatmu tentang itu?".
5.  **Menuju Tujuan**: Arahkan diskusi untuk mencapai tujuan proyek. Bantu kelompok membuat keputusan dan merencanakan langkah selanjutnya.
6.  **Interaksi dengan Pengguna**: Tanggapi masukan dari ${userName} seolah-olah mereka adalah anggota kelompok nyata. Integrasikan ide-ide mereka ke dalam diskusi.

Mulai sesi SEKARANG dengan LANGKAH 2.
        `.trim();
        
        setSystemPrompt(prompt);
        setStep('chat');
    };

    const handleSessionUpdate = (convo: ChatMessage[]) => {
        setConversation(convo);
        onSessionComplete(convo, id, projectTitle, systemPrompt, courseName);
    };
    
    const handleGenerateSummary = async () => {
        if (conversation.length < 2) {
            setError("Diskusi terlalu singkat untuk dirangkum. Lakukan interaksi lebih lanjut.");
            return;
        }
        setError('');
        setStep('generatingSummary');
        try {
            const result = await generateGroupProjectSummary(conversation, studentData, projectTitle, groupMembers);
            setSummary(result);
            setStep('displaySummary');
        } catch(err: any) {
            setError(err.message || 'Gagal membuat rangkuman sesi kelompok. Silakan coba lagi.');
            setStep('chat');
        }
    };

    const downloadSummary = async (format: 'pdf' | 'word') => {
        if (!summary) return;
        const docTitle = `Rangkuman_Kelompok_${projectTitle.replace(/\s/g, '_')}`;
        
        const actionItemsHtml = summary.actionItems.map(item => `<li><strong>${item.member}:</strong> ${item.task}</li>`).join('');

        const contentHtml = `
            <h1>Rangkuman Sesi Kerja Kelompok</h1>
            <p><strong>Proyek:</strong> ${projectTitle}</p>
            <p><strong>Anggota:</strong> ${groupMembers.join(', ')}</p>
            <hr/>
            <h2>Ringkasan Diskusi</h2>
            <p>${summary.discussionSummary}</p>
            <h2>Keputusan Kunci</h2>
            <ul>${summary.keyDecisions.map(d => `<li>${d}</li>`).join('')}</ul>
            <h2>Tugas & Tindak Lanjut</h2>
            <ul>${actionItemsHtml}</ul>
        `;

        if (format === 'pdf') {
            const pdf = new jsPDF();
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${contentHtml}</div>`;
            await pdf.html(styledHtml, {
                callback: (doc) => doc.save(`${docTitle}.pdf`),
                margin: 15, autoPaging: 'text', width: 180, windowWidth: 800
            });
        } else { // Word
            const fullHtml = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${contentHtml}</body></html>`;
            const blob = new Blob([fullHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${docTitle}.doc`; a.click(); URL.revokeObjectURL(url);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 'setup':
                return (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <p className="text-center text-lg text-slate-300">Simulasikan sesi kerja kelompok dengan ABM-UT sebagai fasilitator dan anggota tim virtual.</p>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Mata Kuliah (Opsional)</label><CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Kaitkan dengan mata kuliah..."/></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Judul Proyek Kelompok</label><input type="text" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Contoh: Analisis Pasar untuk Produk Baru" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Tujuan Proyek</label><textarea rows={2} value={projectGoal} onChange={e => setProjectGoal(e.target.value)} placeholder="Contoh: Mengidentifikasi target pasar potensial dan strategi pemasaran awal." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"></textarea></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Anggota Kelompok (pisahkan dengan koma)</label><input type="text" value={membersString} onChange={e => setMembersString(e.target.value)} placeholder="Andi, Budi, Citra" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Nama Anda (sesuai daftar di atas)</label><input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Nama Anda" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={handleStartSession} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Mulai Sesi Kelompok</button>
                    </div>
                );
            case 'chat':
                return (
                    <div>
                        <div className="p-4 mb-4 bg-slate-900/60 rounded-lg border border-slate-700 text-center">
                            <p className="text-slate-300">Setelah diskusi selesai, klik tombol di bawah untuk mendapatkan rangkuman.</p>
                             {error && <p className="text-ut-red text-sm text-center mt-2">{error}</p>}
                            <button onClick={handleGenerateSummary} className="w-full mt-2 py-2 px-4 font-display font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg">Buat Rangkuman Sesi</button>
                        </div>
                        <ChatInterface studentData={{...studentData, name: userName}} systemPrompt={systemPrompt} chatTitle={`Kelompok: ${projectTitle}`} onSessionComplete={handleSessionUpdate} initialConversation={conversation} />
                    </div>
                );
            case 'generatingSummary':
                return <LoadingState />;
            case 'displaySummary':
                if (!summary) return null;
                return (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold font-display text-white">Rangkuman Sesi Kerja Kelompok</h3>
                            <p className="text-slate-400">Berikut adalah hasil notulensi otomatis dari diskusi Anda.</p>
                        </div>
                        <div className="space-y-4 p-6 bg-slate-900/50 rounded-lg shadow-inner">
                           <div className="prose prose-invert max-w-none">
                                <h4>Ringkasan Diskusi</h4>
                                <p>{summary.discussionSummary}</p>
                                <hr/>
                                <h4>Keputusan Kunci</h4>
                                <ul>{summary.keyDecisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                                <hr/>
                                <h4>Tugas & Tindak Lanjut</h4>
                                <ul>{summary.actionItems.map((item, i) => <li key={i}><strong>{item.member}:</strong> {item.task}</li>)}</ul>
                           </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep('chat')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg">Kembali ke Chat</button>
                            <button onClick={() => downloadSummary('pdf')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg">Unduh PDF</button>
                            <button onClick={() => downloadSummary('word')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Unduh Word</button>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <section id={id.replace(/\s+/g, '-')} className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Ruang Kerja Kelompok Belajar</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Simulasikan sesi kerja kelompok dengan ABM-UT sebagai fasilitator dan anggota tim virtual.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />
                    {renderStep()}
                </div>
            </div>
        </section>
    );
};