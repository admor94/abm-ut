import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChatInterface } from '../components/ChatInterface';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import type { StudentData, ChatMessage, AppView } from '../types';

interface GenericChatPageProps {
    id: AppView;
    studentData: StudentData;
    pageTitle: string;
    pageDescription: string;
    systemPrompt: string;
    onSessionComplete: (conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => void;
    setActiveView: (view: AppView) => void;
    initialConversation?: ChatMessage[];
    initialCourseName?: string;
}

export const GenericChatPage: React.FC<GenericChatPageProps> = ({ id, studentData, pageTitle, pageDescription, systemPrompt, onSessionComplete, setActiveView, initialConversation, initialCourseName }) => {
    const parentView = PARENT_VIEW_MAP[id];
    const [conversation, setConversation] = useState<ChatMessage[]>(initialConversation || []);
    
    const downloadableViews: AppView[] = ['Diskusi dengan ABM-UT', 'Konsultasi Belajar ABM-UT'];

    const handleSessionUpdate = (convo: ChatMessage[]) => {
        setConversation(convo);
        onSessionComplete(convo, id, pageTitle, systemPrompt, initialCourseName);
    };

    const downloadDiscussion = async (format: 'pdf' | 'word') => {
        const isDiscussion = id === 'Diskusi dengan ABM-UT';
        const sessionType = isDiscussion ? 'Diskusi' : 'Bimbingan';
        const headerTitle = isDiscussion ? 'CATATAN DISKUSI INTERAKTIF ABM-UT' : 'CATATAN BIMBINGAN BELAJAR ABM-UT';
        const docTitle = `${sessionType}_${pageTitle.replace(/\s/g, '_')}`;
        const topic = conversation.length > 0 ? conversation[0].text.substring(0, 150) + (conversation[0].text.length > 150 ? '...' : '') : 'Tidak ada topik';
        const date = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short'});

        let transcriptHtml = '';
        for (const msg of conversation) {
            const speaker = msg.role === 'model' ? 'ABM-UT' : studentData.name;
            const unsafeHtml = await Promise.resolve(marked.parse(msg.text));
            const msgHtml = DOMPurify.sanitize(unsafeHtml);
            transcriptHtml += `<p><strong>${speaker}:</strong></p>${msgHtml}`;
        }

        const headerHtml = `
            <div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">
                <h1>${headerTitle}</h1>
                <h2>PROFIL MAHASISWA</h2>
                <p>
                    <strong>Nama Mahasiswa:</strong> ${studentData.name}<br/>
                    <strong>Fakultas:</strong> ${studentData.faculty}<br/>
                    <strong>Jurusan:</strong> ${studentData.studyProgram}<br/>
                    <strong>Semester:</strong> ${studentData.semester}
                </p>
                <h2>DETAIL SESI</h2>
                <p>
                    <strong>Nama Sesi:</strong> ${pageTitle}<br/>
                    <strong>Topik Awal:</strong> ${topic}<br/>
                    <strong>Tanggal Sesi:</strong> ${date}
                </p>
                <hr/>
                <h2>TRANSKRIP LENGKAP SESI</h2>
            </div>
        `;

        if (format === 'pdf') {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${headerHtml}${transcriptHtml}</div>`;
            
            await pdf.html(styledHtml, {
                callback: (doc) => {
                    doc.save(`${docTitle}.pdf`);
                },
                margin: [15, 15, 15, 15],
                autoPaging: 'text',
                width: 180, // A4 width (210) - 2*margin
                windowWidth: 800,
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
    
    return (
        <section id={id.replace(/\s/g, '-')} className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
             <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">{pageTitle}</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">{pageDescription}</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />

                    <div>
                        {downloadableViews.includes(id) && conversation.length > 1 && (
                            <div className="flex justify-end gap-2 mb-4">
                                <button onClick={() => downloadDiscussion('word')} className="px-3 py-1.5 text-xs bg-ut-blue hover:bg-ut-blue-light rounded-md shadow-md">Unduh Word</button>
                                <button onClick={() => downloadDiscussion('pdf')} className="px-3 py-1.5 text-xs bg-ut-green hover:bg-green-500 rounded-md shadow-md">Unduh PDF</button>
                            </div>
                        )}
                        <ChatInterface
                            studentData={studentData}
                            systemPrompt={systemPrompt}
                            chatTitle={pageTitle}
                            onSessionComplete={handleSessionUpdate}
                            initialConversation={initialConversation}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
