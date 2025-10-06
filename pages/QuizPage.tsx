import React, { useState, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import type { AppView, StudentData, QuizQuestion } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateQuiz } from '../services/geminiService';
import { CourseSearchInput } from '../components/CourseSearchInput';

interface QuizPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'difficulty' | 'generating' | 'quiz' | 'results';
type Difficulty = 'Mudah' | 'Sedang' | 'Bernalar' | 'Tingkat Lanjut';

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">{message}</p>
        <p className="text-slate-400 mt-2">ABM-UT sedang menganalisis materi dan menyusun soal...</p>
    </div>
);

export const QuizPage: React.FC<QuizPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Kuis Pilihan Ganda'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [courseName, setCourseName] = useState('');
    const [mainTopic, setMainTopic] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [materialText, setMaterialText] = useState('');
    
    // Difficulty state
    const [difficulty, setDifficulty] = useState<Difficulty>('Sedang');
    const [questionCount, setQuestionCount] = useState<number>(15);

    // Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
    
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
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setError(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };
    
    const handleProceedToDifficulty = () => {
        if (!courseName || !mainTopic || (!file && !materialText.trim())) {
            setError("Harap isi Nama Mata Kuliah, Topik Utama, dan berikan materi (via file atau teks).");
            return;
        }
        setError(null);
        setStep('difficulty');
    };

    const handleGenerateQuiz = async () => {
        setStep('generating');
        setError(null);
        try {
            const result = await generateQuiz(courseName, mainTopic, materialText, file ? [file] : [], difficulty, questionCount, studentData);
            setQuestions(shuffleArray(result));
            setUserAnswers(new Map());
            setCurrentQuestionIndex(0);
            setStep('quiz');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
            setStep('difficulty');
        }
    };

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        setUserAnswers(prev => new Map(prev).set(questionIndex, answerIndex));
    };

    const handleRetry = () => {
        setQuestions(shuffleArray(questions));
        setUserAnswers(new Map());
        setCurrentQuestionIndex(0);
        setStep('quiz');
    };

    const { score, answeredCount, isDownloadable } = useMemo(() => {
        const answered = userAnswers.size;
        let correct = 0;
        userAnswers.forEach((answerIndex, questionIndex) => {
            if (questions[questionIndex]?.correctAnswerIndex === answerIndex) {
                correct++;
            }
        });
        
        const requiredAnswered = Math.ceil(questions.length * 0.5);
        const requiredCorrect = Math.ceil(requiredAnswered * 0.3);

        const canDownload = answered >= requiredAnswered && correct >= requiredCorrect;
        
        return { score: correct, answeredCount: answered, isDownloadable: canDownload };
    }, [userAnswers, questions]);

    const downloadAs = (format: 'pdf' | 'word') => {
         const docTitle = `Kuis_${courseName.replace(/\s/g, '_')}_${mainTopic.replace(/\s/g, '_')}`;
        const studentInfo = `Nama: ${studentData.name}\nFakultas: ${studentData.faculty}\nProgram Studi: ${studentData.studyProgram}\nSemester: ${studentData.semester}`;
        const optionsPrefix = ['A', 'B', 'C', 'D'];

        if (format === 'pdf') {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;
            let y = margin;

            const checkPageBreak = (requiredHeight: number) => {
                if (y + requiredHeight > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }
            };
            
            pdf.setFontSize(18).setFont('helvetica', 'bold').text(`Kuis: ${courseName || ''}`, margin, y);
            y += 10;
            pdf.setFontSize(14).setFont('helvetica', 'normal').text(`Topik: ${mainTopic || ''}`, margin, y);
            y += 10;
            pdf.setFontSize(10);
            const studentInfoLines = pdf.splitTextToSize(studentInfo || '', contentWidth);
            pdf.text(studentInfoLines, margin, y);
            y += (studentInfoLines.length * 4) + 10;
            pdf.line(margin, y, pageWidth - margin, y);
            y += 10;

            questions.forEach((q, index) => {
                const questionText = `${index + 1}. ${q.question || ''}`;
                const questionLines = pdf.splitTextToSize(questionText, contentWidth);
                const optionsLinesHeight = (q.options || []).reduce((acc, opt) => acc + pdf.splitTextToSize(`${optionsPrefix[0]}. ${opt || ''}`, contentWidth - 5).length, 0);
                const explanationLines = pdf.splitTextToSize(`Penjelasan: ${q.explanation || ''}`, contentWidth - 5);
                
                const requiredHeight = (questionLines.length * 6) + (optionsLinesHeight * 5) + (explanationLines.length * 4) + 15;
                checkPageBreak(requiredHeight);

                pdf.setFontSize(12).setFont('helvetica', 'bold').text(questionLines, margin, y);
                y += questionLines.length * 6;

                pdf.setFontSize(10).setFont('helvetica', 'normal');
                (q.options || []).forEach((opt, i) => {
                    const optionText = `${optionsPrefix[i]}. ${opt || ''}`;
                    const isCorrect = i === q.correctAnswerIndex;
                    pdf.setFont('helvetica', isCorrect ? 'bold' : 'normal');
                    pdf.setTextColor(isCorrect ? 34 : 0, isCorrect ? 139 : 0, isCorrect ? 34 : 0); // Green for correct, black otherwise
                    const lines = pdf.splitTextToSize(optionText, contentWidth - 5);
                    pdf.text(lines, margin + 5, y);
                    y += lines.length * 5;
                });
                pdf.setTextColor(0, 0, 0);
                y += 3;
                
                pdf.setFont('helvetica', 'italic').setTextColor(80, 80, 80);
                pdf.text(explanationLines, margin + 5, y);
                y += explanationLines.length * 4 + 10;
                pdf.setTextColor(0, 0, 0);

                if (index < questions.length - 1) {
                    checkPageBreak(10);
                    pdf.setDrawColor(220, 220, 220).line(margin, y, pageWidth - margin, y);
                    y += 10;
                }
            });

            pdf.save(`${docTitle}.pdf`);

        } else { // Word
            let content = `
                <html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>
                <h1>Kuis: ${courseName || ''}</h1>
                <h2>Topik: ${mainTopic || ''}</h2>
                <p><strong>Nama:</strong> ${studentData.name}<br/>
                   <strong>Fakultas:</strong> ${studentData.faculty}<br/>
                   <strong>Program Studi:</strong> ${studentData.studyProgram}<br/>
                   <strong>Semester:</strong> ${studentData.semester}</p>
                <hr/>
            `;
            questions.forEach((q, index) => {
                content += `
                    <h3>${index + 1}. ${q.question || ''}</h3>
                    <ul>
                        ${(q.options || []).map((opt, i) => `<li style="${i === q.correctAnswerIndex ? 'font-weight:bold; color:green;' : ''}">${optionsPrefix[i]}. ${opt || ''}</li>`).join('')}
                    </ul>
                    <p><strong>Jawaban Benar:</strong> ${optionsPrefix[q.correctAnswerIndex]}. ${(q.options || [])[q.correctAnswerIndex] || ''}</p>
                    <p><em><strong>Penjelasan:</strong> ${q.explanation || ''}</em></p>
                    <br/>
                `;
            });
            content += '</body></html>';
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docTitle}.doc`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }


    const renderStep = () => {
        switch(step) {
            case 'input':
                return (
                    <div>
                         <div className="p-4 mb-6 bg-ut-yellow/20 border-l-4 border-ut-yellow text-yellow-200">
                            <p className="font-bold">Perhatian Penting!</p>
                            <p className="text-sm">Untuk dapat mengunduh soal, Anda harus mengerjakan minimal 50% dari total soal, dan jawaban benar setidaknya 30% dari yang Anda jawab. Jika syarat tidak terpenuhi, Anda bisa mengulang kuis.</p>
                        </div>
                        <p className="text-center text-lg text-slate-300 mb-6">Halo {studentData.name}, siap membuat kuis? Silahkan isi informasi berikut:</p>
                        <div className="space-y-4 max-w-2xl mx-auto">
                           <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label>
                                <CourseSearchInput
                                    value={courseName}
                                    onChange={setCourseName}
                                    placeholder="Cari kode atau nama mata kuliah..."
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label>
                                <input type="text" value={mainTopic} onChange={e => setMainTopic(e.target.value)} placeholder="Contoh: Interaksi Sosial dan Struktur Masyarakat" className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500 placeholder:italic" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Unggah File Materi (Opsional)</label>
                                 <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300">
                                    <div className="space-y-1 text-center">
                                         <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                        <div className="flex text-sm text-slate-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1">
                                                <span>Pilih File</span>
                                                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*,video/*,audio/*,text/*" />
                                            </label>
                                            <p className="pl-1">atau seret dan lepas</p>
                                        </div>
                                        {file ? <p className="text-xs text-ut-green">{file.name}</p> : <p className="text-xs text-slate-500">PDF, Gambar, Video, Audio, Teks</p>}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Catatan: Apabila sistem gagal membaca file, maka silahkan masukkan materi secara manual di bawah.</p>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Atau Masukkan Teks Materi</label>
                                <textarea rows={6} value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Tempelkan materi Anda di sini..." className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500 placeholder:italic"></textarea>
                            </div>
                            {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                            <button onClick={handleProceedToDifficulty} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Lanjut</button>
                        </div>
                    </div>
                );
            case 'difficulty':
                return (
                     <div className="space-y-6 max-w-2xl mx-auto text-center">
                         <h3 className="text-2xl font-bold text-white font-display">Atur Kuis Anda</h3>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 font-display mb-2">Tingkat Kesulitan</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(['Mudah', 'Sedang', 'Bernalar', 'Tingkat Lanjut'] as Difficulty[]).map(d => (
                                    <button key={d} onClick={() => setDifficulty(d)} className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 ${difficulty === d ? 'bg-ut-blue text-white scale-105 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>{d}</button>
                                ))}
                            </div>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-300 font-display mb-2">Jumlah Soal</label>
                             <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setQuestionCount(c => Math.max(15, c - 1))} className="px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600">-</button>
                                <input type="number" value={questionCount} readOnly className="w-20 text-center bg-slate-800 border-slate-600 rounded-md py-2" />
                                <button onClick={() => setQuestionCount(c => c + 1)} className="px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600">+</button>
                             </div>
                         </div>
                         {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                         <div className="flex gap-4">
                            <button onClick={() => setStep('input')} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg">Kembali</button>
                            <button onClick={handleGenerateQuiz} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Buat Kuis!</button>
                         </div>
                    </div>
                );
            case 'generating':
                return <LoadingState message="Mempersiapkan Kuis Anda..." />;
            case 'quiz':
                const currentQuestion = questions[currentQuestionIndex];
                const selectedAnswer = userAnswers.get(currentQuestionIndex);
                const isAnswered = selectedAnswer !== undefined;
                return (
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-4">
                             <div className="flex justify-between items-center mb-2">
                                <p className="text-lg font-semibold font-display text-white">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
                                <p className="text-sm font-medium text-slate-300">Terjawab: {answeredCount}/{questions.length}</p>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div className="bg-ut-blue h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-800/30 rounded-lg shadow-lg">
                            <p className="text-xl text-slate-200 mb-6 min-h-[60px]">{currentQuestion.question}</p>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => {
                                    let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-colors duration-200 ";
                                    if (isAnswered) {
                                        if (index === currentQuestion.correctAnswerIndex) {
                                            buttonClass += "bg-ut-green/20 border-ut-green text-white cursor-default"; // Correct answer
                                        } else if (index === selectedAnswer) {
                                            buttonClass += "bg-ut-red/20 border-ut-red text-white cursor-default"; // Incorrect selected answer
                                        } else {
                                            buttonClass += "bg-slate-700/50 border-slate-600 text-slate-400 cursor-default";
                                        }
                                    } else {
                                        buttonClass += "bg-slate-700/50 border-slate-600 hover:bg-ut-blue/20 hover:border-ut-blue";
                                    }
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                                            className={buttonClass}
                                            disabled={isAnswered}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            {isAnswered && (
                                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                                    <h4 className="font-bold text-ut-blue-light">Penjelasan</h4>
                                    <p className="mt-2 text-slate-300">{currentQuestion.explanation}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:opacity-50"
                            >
                                Sebelumnya
                            </button>
                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="px-6 py-2 bg-ut-blue hover:bg-ut-blue-light rounded-lg"
                                >
                                    Selanjutnya
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStep('results')}
                                    className="px-6 py-2 bg-ut-green hover:bg-green-600 rounded-lg"
                                >
                                    Lihat Hasil
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 'results':
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold text-white font-display">Hasil Kuis Anda</h3>
                        <div className="my-8 p-8 bg-slate-900/50 rounded-full aspect-square w-48 h-48 mx-auto flex flex-col justify-center items-center border-4 border-ut-blue">
                            <p className="text-5xl font-bold text-white">{score}</p>
                            <p className="text-lg text-slate-300">dari {questions.length} soal</p>
                        </div>
                        <p className="text-lg text-slate-300">Anda menjawab {answeredCount} soal dengan {score} jawaban benar.</p>
                        
                        {isDownloadable ? (
                            <div className="mt-6 p-4 bg-ut-green/20 border border-ut-green rounded-lg">
                                <p className="text-ut-green font-semibold">Selamat! Anda memenuhi syarat untuk mengunduh soal dan kunci jawaban.</p>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 bg-ut-yellow/20 border border-ut-yellow rounded-lg">
                                <p className="text-yellow-200 font-semibold">Anda belum memenuhi syarat untuk mengunduh.</p>
                                <p className="text-sm text-yellow-300">Syarat: kerjakan min. 50% soal & jawaban benar min. 30% dari yang dijawab.</p>
                            </div>
                        )}
                        
                        <div className="mt-8 flex flex-col md:flex-row gap-4">
                            <button onClick={handleRetry} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Ulangi Kuis</button>
                            <button onClick={() => setStep('input')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg">Buat Kuis Baru</button>
                            <button onClick={() => downloadAs('pdf')} disabled={!isDownloadable} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Unduh PDF</button>
                            <button onClick={() => downloadAs('word')} disabled={!isDownloadable} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Unduh Word</button>
                        </div>
                    </div>
                );
        }
    }
    
    return (
        <section id="Kuis-Pilihan-Ganda" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                 <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Kuis Pilihan Ganda</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Uji pemahaman Anda dengan membuat kuis pilihan ganda dari materi yang Anda pelajari.</p>
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