import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { AppView, StudentData, Flashcard } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateFlashcards } from '../services/geminiService';
import { CourseSearchInput } from '../components/CourseSearchInput';

// --- Notification Helper Functions ---
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return "denied";
    }
    return await Notification.requestPermission();
};

const scheduleNotification = (title: string, body: string, timestamp: number): boolean => {
    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted.');
        alert('Gagal mengatur pengingat. Harap izinkan notifikasi terlebih dahulu.');
        return false;
    }

    const delay = timestamp - Date.now();
    if (delay <= 0) {
        alert('Gagal mengatur pengingat. Waktu yang dipilih sudah lewat.');
        return false;
    }

    setTimeout(() => {
        new Notification(title, {
            body,
            icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='50' fill='%23346BF1'/%3e%3ctext x='50' y='55' font-size='30' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif' font-weight='bold'%3eABM%3c/text%3e%3c/svg%3e"
        });
    }, delay);
    
    return true;
};
// --- End Notification Helper Functions ---

interface FlashcardsPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'difficulty' | 'generating' | 'display';
type Difficulty = 'Mudah' | 'Sedang' | 'Bernalar' | 'Tingkat Lanjut';

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">{message}</p>
        <p className="text-slate-400 mt-2">Proses ini mungkin memakan waktu sejenak...</p>
    </div>
);

// FIX: Create an inner component to handle asynchronous markdown parsing for explanations.
const ExplanationDisplay: React.FC<{ markdown: string }> = ({ markdown }) => {
    const [html, setHtml] = useState('');

    useEffect(() => {
        let isMounted = true;
        // FIX: Wrap marked.parse in Promise.resolve to handle both sync and async return types.
        Promise.resolve(marked.parse(markdown)).then(parsedHtml => {
            if (isMounted && parsedHtml) {
                setHtml(DOMPurify.sanitize(parsedHtml));
            }
        });
        return () => { isMounted = false; };
    }, [markdown]);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Flashcards'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [courseName, setCourseName] = useState('');
    const [mainTopic, setMainTopic] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [materialText, setMaterialText] = useState('');
    
    // Difficulty state
    const [difficulty, setDifficulty] = useState<Difficulty>('Sedang');
    const [cardCount, setCardCount] = useState<number>(5);

    // Result state
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
    const [learnedCards, setLearnedCards] = useState<Set<number>>(new Set());
    const [reminderDateTime, setReminderDateTime] = useState('');
    
    const dropzoneRef = useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneRef.current?.classList.add('border-ut-blue', 'bg-ut-blue/10');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
    
    const handleProceedToDifficulty = () => {
        if (!courseName || !mainTopic || (files.length === 0 && !materialText.trim())) {
            setError("Harap isi Nama Mata Kuliah, Topik Utama, dan berikan materi (via file atau teks).");
            return;
        }
        setError(null);
        setStep('difficulty');
    };

    const handleGenerateFlashcards = async () => {
        setStep('generating');
        setError(null);
        try {
            const result = await generateFlashcards(courseName, mainTopic, materialText, files, difficulty, cardCount, studentData);
            setFlashcards(result);
            setFlippedCards(new Set());
            setLearnedCards(new Set());
            setStep('display');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
            setStep('difficulty'); // Go back to let user try again
        }
    };

    const toggleFlip = (index: number) => {
        setFlippedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    
    const toggleLearned = (index: number) => {
        setLearnedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleSetFlashcardReminder = () => {
        if (!reminderDateTime) {
            alert("Harap pilih tanggal dan waktu untuk pengingat.");
            return;
        }
        const timestamp = new Date(reminderDateTime).getTime();
        requestNotificationPermission().then(permission => {
            if (permission === 'granted') {
                const success = scheduleNotification(
                    `Review Flashcards: ${courseName}`,
                    `Waktunya untuk mereview flashcards tentang "${mainTopic}"`,
                    timestamp
                );
                if(success) alert('Pengingat berhasil diatur!');
            }
        });
    };

    const downloadAs = async (format: 'pdf' | 'word') => {
        const docTitle = `Flashcards_${courseName.replace(/\s/g, '_')}_${mainTopic.replace(/\s/g, '_')}`;
        
        let contentHtml = `
            <h1>Flashcards: ${courseName}</h1>
            <h2>Topik: ${mainTopic}</h2>
            <p><strong>Nama:</strong> ${studentData.name}<br/>
               <strong>Fakultas:</strong> ${studentData.faculty}<br/>
               <strong>Program Studi:</strong> ${studentData.studyProgram}<br/>
               <strong>Semester:</strong> ${studentData.semester}</p>
            <hr/>
        `;

        for (const [index, card] of flashcards.entries()) {
            // FIX: Use Promise.resolve and await to handle async markdown parsing.
            const unsafeAnswerHtml = await Promise.resolve(marked.parse(card.answer));
            const unsafeExplanationHtml = await Promise.resolve(marked.parse(card.explanation));
            const answerHtml = DOMPurify.sanitize(unsafeAnswerHtml as string);
            const explanationHtml = DOMPurify.sanitize(unsafeExplanationHtml as string);
            contentHtml += `
                <div style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #dddddd; padding: 15px; border-radius: 8px;">
                    <h3>Flashcard ${index + 1}</h3>
                    <p><strong>Pertanyaan:</strong> ${card.question}</p>
                    <div><strong>Jawaban:</strong> ${answerHtml}</div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;" />
                    <div><strong>Penjelasan:</strong> ${explanationHtml}</div>
                </div>
            `;
        }

        if (format === 'pdf') {
            const pdf = new jsPDF();
            const styledHtml = `<div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">${contentHtml}</div>`;
            await pdf.html(styledHtml, {
                callback: (doc) => doc.save(`${docTitle}.pdf`),
                margin: 15,
                autoPaging: 'text',
                width: 180,
                windowWidth: 800
            });
        } else { // Word
            const fullHtml = `<html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>${contentHtml}</body></html>`;
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
        switch (step) {
            case 'input':
                return (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <p className="text-center text-lg text-slate-300 mb-6">Halo {studentData.name}, mari kita buat flashcards. Silahkan isi informasi berikut:</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label>
                            <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Cari kode atau nama mata kuliah..."/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label>
                            <input type="text" value={mainTopic} onChange={e => setMainTopic(e.target.value)} placeholder="Contoh: Teori Komunikasi Massa" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500 placeholder:italic" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 font-display">Unggah File Materi (Opsional)</label>
                            <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                    <div className="flex text-sm text-slate-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1">
                                            <span>Pilih File</span>
                                            <input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*,video/*,audio/*,text/*" />
                                        </label>
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
                            <label className="block text-sm font-medium text-slate-300 font-display">Atau Masukkan Teks Materi</label>
                            <textarea rows={6} value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Tempelkan materi Anda di sini..." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500 placeholder:italic"></textarea>
                        </div>
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={handleProceedToDifficulty} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Lanjut</button>
                    </div>
                );
            case 'difficulty':
                return (
                    <div className="space-y-6 max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl font-semibold text-white font-display">Atur Flashcards Anda</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 font-display mb-2">Tingkat Kesulitan</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(['Mudah', 'Sedang', 'Bernalar', 'Tingkat Lanjut'] as Difficulty[]).map(d => (
                                    <button key={d} onClick={() => setDifficulty(d)} className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 ${difficulty === d ? 'bg-ut-blue text-white scale-105 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>{d}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="cardCount" className="block text-sm font-medium text-slate-300 font-display mb-2">Jumlah Kartu: {cardCount}</label>
                            <input id="cardCount" type="range" min="3" max="20" value={cardCount} onChange={e => setCardCount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-ut-blue" />
                        </div>
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <div className="flex gap-4">
                            <button onClick={() => setStep('input')} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg">Kembali</button>
                            <button onClick={handleGenerateFlashcards} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-ut-green hover:bg-green-500 rounded-lg shadow-lg">Buat Flashcards!</button>
                        </div>
                    </div>
                );
            case 'generating':
                return <LoadingState message="ABM-UT sedang mempersiapkan Flashcards Anda..." />;
            case 'display':
                return (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-2xl font-semibold text-white font-display">Sesi Latihan Flashcards</h3>
                                <p className="text-slate-400">Sudah Dipelajari: {learnedCards.size} / {flashcards.length}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => downloadAs('word')} className="px-4 py-2 text-sm bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">Unduh Word</button>
                                <button onClick={() => downloadAs('pdf')} className="px-4 py-2 text-sm bg-ut-green hover:bg-green-500 rounded-lg shadow-md">Unduh PDF</button>
                                <button onClick={() => setStep('input')} className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg shadow-md">Mulai Lagi</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {flashcards.map((card, index) => {
                                const isFlipped = flippedCards.has(index);
                                const isLearned = learnedCards.has(index);
                                return (
                                    <div key={index} className={`flashcard-container ${isLearned ? 'opacity-50' : ''}`}>
                                        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                                            {/* Front */}
                                            <div className="flashcard-front bg-slate-800">
                                                <p className="text-lg font-semibold text-white">{card.question}</p>
                                                <button onClick={() => toggleFlip(index)} className="absolute bottom-4 text-xs text-ut-yellow hover:underline">Lihat Jawaban</button>
                                            </div>
                                            {/* Back */}
                                            <div className="flashcard-back bg-slate-700">
                                                <div className="prose prose-sm prose-invert max-w-none">
                                                    <p className="font-semibold">{card.answer}</p>
                                                    <hr />
                                                    {/* FIX: Replaced direct call to `marked.parseSync` with the async-safe component. */}
                                                    <ExplanationDisplay markdown={card.explanation} />
                                                </div>
                                                <button onClick={() => toggleFlip(index)} className="absolute bottom-4 text-xs text-ut-yellow hover:underline">Lihat Pertanyaan</button>
                                            </div>
                                        </div>
                                        <button onClick={() => toggleLearned(index)} className={`w-full mt-2 py-2 text-sm font-semibold rounded-lg transition-colors ${isLearned ? 'bg-ut-green text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            {isLearned ? 'Sudah Dipelajari' : 'Tandai Dipelajari'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                         <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <h4 className="font-semibold text-lg text-ut-blue-light font-display text-center mb-3">Atur Pengingat untuk Review</h4>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <input 
                                    type="datetime-local"
                                    value={reminderDateTime}
                                    onChange={e => setReminderDateTime(e.target.value)}
                                    className="block w-full sm:w-auto px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"
                                />
                                <button onClick={handleSetFlashcardReminder} className="w-full sm:w-auto py-3 px-6 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">Setel Pengingat</button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <section id="Flashcards" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-semibold text-white font-display">Flashcards</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Buat dan gunakan kartu flash interaktif untuk menghafal konsep-konsep kunci.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />
                    {renderStep()}
                </div>
            </div>
        </section>
    );
};