import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { LearningHistoryEntry, AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface LearningHistoryProps {
  history: LearningHistoryEntry[];
  studentData: StudentData | null;
  setActiveView: (view: AppView) => void;
  onDelete: (id: string) => void;
  onContinue: (entry: LearningHistoryEntry) => void;
}

const handleDownload = async (entry: LearningHistoryEntry, format: 'pdf' | 'word', studentData: StudentData) => {
    const docTitle = `Arsip_${entry.view.replace(/\s/g, '_')}_${entry.topic.replace(/\s/g, '_')}`;

    let transcriptHtml = '';
    for (const msg of entry.conversation) {
        const speaker = msg.role === 'model' ? 'ABM-UT' : studentData.name;
        const unsafeHtml = await Promise.resolve(marked.parse(msg.text));
        const msgHtml = DOMPurify.sanitize(unsafeHtml);
        transcriptHtml += `<p><strong>${speaker}:</strong></p>${msgHtml}`;
    }

    const headerHtml = `
        <div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">
            <h1>ARSIP RIWAYAT BELAJAR ABM-UT</h1>
            <h2>PROFIL MAHASISWA</h2>
            <p>
                <strong>Nama Mahasiswa:</strong> ${studentData.name}<br/>
                <strong>Fakultas/Jurusan:</strong> ${studentData.faculty} / ${studentData.studyProgram}
            </p>
            <h2>DETAIL SESI</h2>
            <p>
                <strong>Jenis Sesi:</strong> ${entry.view}<br/>
                <strong>Topik:</strong> ${entry.topic}<br/>
                <strong>Tanggal Sesi:</strong> ${entry.date}
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

const EntryActions: React.FC<{ entry: LearningHistoryEntry; studentData: StudentData; onContinue: () => void; onDelete: () => void }> = ({ entry, studentData, onContinue, onDelete }) => {
    const [showDownload, setShowDownload] = useState(false);
    return (
        <div className="flex items-center gap-2 relative">
            <button onClick={onContinue} className="px-3 py-1.5 bg-ut-blue text-white text-xs font-semibold rounded-md hover:bg-ut-blue-light transition-colors font-display">Lanjutkan</button>
            
            <button onClick={() => setShowDownload(s => !s)} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-500 transition-colors font-display">Unduh</button>
            {showDownload && (
                <div className="absolute top-full right-0 mt-2 w-28 bg-gray-700 rounded-md shadow-lg z-10 p-1">
                    <button onClick={() => { handleDownload(entry, 'pdf', studentData); setShowDownload(false); }} className="block w-full text-left px-3 py-1.5 text-xs text-white hover:bg-ut-blue-light rounded-sm">PDF</button>
                    <button onClick={() => { handleDownload(entry, 'word', studentData); setShowDownload(false); }} className="block w-full text-left px-3 py-1.5 text-xs text-white hover:bg-ut-blue-light rounded-sm">Word</button>
                </div>
            )}
            
            <button onClick={onDelete} className="p-2 bg-gray-600 text-white rounded-md hover:bg-ut-red transition-colors" aria-label="Hapus">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    );
};


export const LearningHistory: React.FC<LearningHistoryProps> = ({ history, studentData, setActiveView, onDelete, onContinue }) => {
  const parentView = PARENT_VIEW_MAP['Riwayat Belajar Mahasiswa'];

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat sesi ini?")) {
        onDelete(id);
    }
  }
  
  return (
    <section id="Riwayat-Belajar-Mahasiswa" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
       <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Riwayat Belajar Mahasiswa</h1>
            <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Semua interaksi Anda dengan ABM-UT tersimpan di sini untuk referensi di masa depan.</p>
          </div>

           <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
              <PageHeader 
                parentView={parentView}
                setActiveView={setActiveView}
              />

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 rounded-lg shadow-inner">
                    <p className="text-slate-400">Belum ada riwayat belajar. Mulai gunakan fitur ABM-UT untuk melihatnya di sini!</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="bg-slate-900/50 p-4 rounded-lg shadow-lg hover:shadow-ut-blue/20 border border-slate-700 hover:border-ut-blue/50 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ut-blue-light font-semibold font-display">{entry.view}</p>
                          <h3 className="font-semibold text-lg text-white font-display truncate" title={entry.topic}>{entry.topic}</h3>
                          <p className="text-xs text-slate-400 mt-1">{entry.date}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            {studentData && <EntryActions entry={entry} studentData={studentData} onContinue={() => onContinue(entry)} onDelete={() => handleDelete(entry.id)} />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
    </section>
  );
};
