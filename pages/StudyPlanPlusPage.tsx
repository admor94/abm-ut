import React, { useState, useRef, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';
import type { AppView, StudentData, StudyPlanResponse, StudyStrategyResponse, StudyPlanSession } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateStudyPlanPlus, getStudyStrategyRecommendation, getStudyAdvice } from '../services/geminiService';
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
        return false;
    }

    const delay = timestamp - Date.now();
    if (delay <= 0) {
        console.warn('Cannot schedule notification in the past.');
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

interface UploadedFile {
    id: string;
    file: File;
}

interface StudyPlanPlusPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'generatingRecommendation' | 'recommendation' | 'generatingPlan' | 'report';
type LearningType = 'Intensif' | 'Ekstensif';
type Method = 'SQ3R' | 'SQ4R' | 'KWLH' | 'PQRST' | 'Active Recall' | 'Spaced Repetition' | 'Deep Learning' | 'Shallow Learning' | 'Scanning' | 'Skimming';
type TimeTechnique = 'Teknik Pomodoro' | 'Eat That Frog' | 'Two Minute Rule' | 'Matriks Eisenhower' | 'Metode Time Blocking';

const METHODS: Record<LearningType, Method[]> = {
    'Intensif': ['SQ3R', 'SQ4R', 'KWLH', 'PQRST', 'Active Recall', 'Spaced Repetition'],
    'Ekstensif': ['Deep Learning', 'Shallow Learning', 'Scanning', 'Skimming']
};

const TIME_TECHNIQUES: TimeTechnique[] = ['Teknik Pomodoro', 'Eat That Frog', 'Two Minute Rule', 'Matriks Eisenhower', 'Metode Time Blocking'];

const LoadingState: React.FC<{message: string}> = ({message}) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl font-display text-white">{message}</p>
        <p className="text-gray-400 mt-2">Ini mungkin akan memakan waktu sejenak, tergantung pada kompleksitas materi.</p>
    </div>
);

const optionStyle = "bg-gray-800 text-white";

export const StudyPlanPlusPage: React.FC<StudyPlanPlusPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Rencana Belajar +Plus'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Input state
    const [courseName, setCourseName] = useState('');
    const [mainTopic, setMainTopic] = useState('');
    const [materialText, setMaterialText] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [sessionCount, setSessionCount] = useState(3);
    const [learningType, setLearningType] = useState<LearningType | ''>('');
    const [selectedMethod, setSelectedMethod] = useState<Method | ''>('');
    const [startDate, setStartDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    
    // Recommendation state
    const [strategyResponse, setStrategyResponse] = useState<StudyStrategyResponse | null>(null);
    const [finalTimeTechnique, setFinalTimeTechnique] = useState<TimeTechnique | ''>('');

    // Final plan state
    const [planResponse, setPlanResponse] = useState<StudyPlanResponse | null>(null);
    const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

    // New states for automated advice
    const [aiAdvice, setAiAdvice] = useState('');
    const [aiAdviceHtml, setAiAdviceHtml] = useState('');
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

    // FIX: Add state for rendered HTML to handle async parsing of final report
    const [synergyAnalysisHtml, setSynergyAnalysisHtml] = useState('');
    const [materialSummaryHtml, setMaterialSummaryHtml] = useState('');
    
    // FIX: Add useEffects to handle asynchronous parsing of markdown for the final report.
    useEffect(() => {
        if (planResponse?.synergyAnalysis) {
            Promise.resolve(marked.parse(planResponse.synergyAnalysis)).then(html => html && setSynergyAnalysisHtml(DOMPurify.sanitize(html as string)));
        }
    }, [planResponse?.synergyAnalysis]);
    useEffect(() => {
        if (planResponse?.materialSummary) {
            Promise.resolve(marked.parse(planResponse.materialSummary)).then(html => html && setMaterialSummaryHtml(DOMPurify.sanitize(html as string)));
        }
    }, [planResponse?.materialSummary]);

    // UseEffect for parsing AI advice markdown
    useEffect(() => {
        if (aiAdvice) {
            Promise.resolve(marked.parse(aiAdvice)).then(html => html && setAiAdviceHtml(DOMPurify.sanitize(html as string)));
        }
    }, [aiAdvice]);

    const groupedPlan = useMemo(() => {
        if (!planResponse) return [];
        const groups = new Map<string, StudyPlanSession[]>();
        planResponse.detailedPlan.forEach(item => {
            const sessionKey = String(item.session);
            if (!groups.has(sessionKey)) {
                groups.set(sessionKey, []);
            }
            groups.get(sessionKey)!.push(item);
        });
        return Array.from(groups.entries());
    }, [planResponse]);
    
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dropzoneRef.current?.classList.add('border-ut-blue', 'bg-ut-blue/10'); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dropzoneRef.current?.classList.remove('border-ut-blue', 'bg-ut-blue/10'); };
    const handleDrop = (e: React.DragEvent) => { handleDragLeave(e); handleFileUpload(e.dataTransfer.files); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { handleFileUpload(e.target.files); };

    const handleFileUpload = (incomingFiles: FileList | null) => {
        const MAX_FILES = 4;
        if (!incomingFiles) return;

        const newFiles = Array.from(incomingFiles).map(file => ({ id: uuidv4(), file }));
        
        setFiles(prevFiles => {
            const combined = [...prevFiles, ...newFiles];
            if (combined.length > MAX_FILES) {
                setError(`Anda hanya dapat mengunggah maksimal ${MAX_FILES} file.`);
                return combined.slice(0, MAX_FILES);
            }
            setError(null);
            return combined;
        });
    };

    const removeFile = (idToRemove: string) => {
        setFiles(prevFiles => prevFiles.filter((f) => f.id !== idToRemove));
    };

    useEffect(() => {
        if (strategyResponse?.recommendedTimeTechnique) {
            setFinalTimeTechnique(strategyResponse.recommendedTimeTechnique as TimeTechnique);
        }
    }, [strategyResponse]);

    const handleGetRecommendation = async () => {
        if (!courseName || !mainTopic || (!materialText && files.length === 0) || !learningType || !selectedMethod) {
            setError("Harap lengkapi semua kolom yang diperlukan.");
            return;
        }
        setStep('generatingRecommendation');
        setError(null);
        try {
            const fileList = files.map(f => f.file);
            const result = await getStudyStrategyRecommendation(studentData, courseName, mainTopic, materialText, fileList, sessionCount, learningType, selectedMethod);
            setStrategyResponse(result);
            setStep('recommendation');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
            setStep('input');
        }
    };

    const handleGenerateFinalPlan = async () => {
        if (!finalTimeTechnique || !selectedMethod || !learningType) {
            setError("Harap pilih teknik manajemen waktu.");
            return;
        }
        setStep('generatingPlan');
        setError(null);
        try {
            const fileList = files.map(f => f.file);
            const result = await generateStudyPlanPlus(studentData, courseName, mainTopic, materialText, fileList, sessionCount, learningType, selectedMethod, finalTimeTechnique);
            setPlanResponse(result);
            setCurrentSessionIndex(0); // Reset for new plan
            setStep('report');
            
            // Immediately fetch advice after plan generation
            setIsLoadingAdvice(true);
            try {
                const advice = await getStudyAdvice(studentData, result, courseName, learningType, selectedMethod, finalTimeTechnique);
                setAiAdvice(advice);
            } catch (adviceError) {
                console.error("Failed to get study advice:", adviceError);
                setAiAdvice("Gagal memuat saran belajar. Anda dapat melanjutkan tanpa saran ini.");
            } finally {
                setIsLoadingAdvice(false);
            }

        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
            setStep('input');
        }
    };
    
    const handleSetReminders = () => {
        if (!startDate || !reminderTime) {
            alert("Harap pilih tanggal mulai dan waktu pengingat.");
            return;
        }
        requestNotificationPermission().then(permission => {
            if (permission === 'granted') {
                let scheduledCount = 0;
                for (let i = 0; i < sessionCount; i++) {
                    const sessionDate = new Date(startDate);
                    sessionDate.setDate(sessionDate.getDate() + i);
                    const [hours, minutes] = reminderTime.split(':');
                    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    const success = scheduleNotification(
                        `Rencana Belajar+ : ${courseName}`,
                        `Waktunya untuk sesi belajar ke-${i+1} tentang "${mainTopic}"!`,
                        sessionDate.getTime()
                    );
                    if (success) scheduledCount++;
                }
                if (scheduledCount > 0) {
                    alert(`${scheduledCount} pengingat berhasil diatur!`);
                } else {
                     alert('Gagal mengatur pengingat. Pastikan waktu yang dipilih belum lewat.');
                }
            } else {
                 alert('Gagal mengatur pengingat. Harap izinkan notifikasi terlebih dahulu.');
            }
        });
    };

    const downloadAs = async (format: 'pdf' | 'word' | 'excel') => {
        if (!planResponse) return;
        const docTitle = `Rencana_Belajar_Plus_${mainTopic.replace(/\s/g, '_')}`;

        const studentInfoHtml = `
            <div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">
                <p><strong>Nama Mahasiswa:</strong> ${studentData.name}</p>
                <p><strong>Fakultas:</strong> ${studentData.faculty} | <strong>Program Studi:</strong> ${studentData.studyProgram} | <strong>Semester:</strong> ${studentData.semester}</p>
                <p><strong>Mata Kuliah:</strong> ${courseName} | <strong>Topik Utama:</strong> ${mainTopic}</p>
                <p><strong>Tipe Belajar:</strong> ${learningType} | <strong>Metode:</strong> ${selectedMethod}</p>
                <p><strong>Teknik Manajemen Waktu:</strong> ${finalTimeTechnique}</p>
            </div>
        `;

        if (format === 'excel') {
            const headers = ['Sesi', 'Tindakan', 'Uraian', 'Hasil Akhir'];
            const data = planResponse.detailedPlan.map(p => [
                p.session,
                p.action,
                p.description,
                p.expectedOutcome
            ]);

            const csvContent = [
                headers.join(','),
                ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${docTitle}_Rencana.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        if (format === 'pdf') {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            let y = 15;
            
            pdf.setFontSize(18).text('Laporan Rencana Belajar +Plus', 15, y);
            y += 10;
            
            await pdf.html(studentInfoHtml, { x: 15, y, width: 180, windowWidth: 800, autoPaging: 'text' });
            y = (pdf as any).y;

            if(planResponse.synergyAnalysis) {
                pdf.setFontSize(16).text('Analisis Sinergi Strategi', 15, y += 10);
                const unsafeSynergyHtml = await Promise.resolve(marked.parse(planResponse.synergyAnalysis));
                const synergyHtml = DOMPurify.sanitize(unsafeSynergyHtml as string);
                await pdf.html(synergyHtml, { x: 15, y: y += 5, width: 180, windowWidth: 800, autoPaging: 'text' });
                y = (pdf as any).y;
            }
            
            pdf.setFontSize(16).text('Rangkuman Materi', 15, y += 10);
            const unsafeMaterialSummaryHtml = await Promise.resolve(marked.parse(planResponse.materialSummary));
            const materialSummaryHtml = DOMPurify.sanitize(unsafeMaterialSummaryHtml as string);
            await pdf.html(materialSummaryHtml, { x: 15, y: y += 5, width: 180, windowWidth: 800, autoPaging: 'text' });
            y = (pdf as any).y;

            pdf.setFontSize(16).text('Tabel Rencana Belajar', 15, y += 10);
            (pdf as any).autoTable({
                startY: y += 5,
                head: [['Sesi', 'Tindakan', 'Uraian', 'Hasil Akhir']],
                body: planResponse.detailedPlan.map((p: StudyPlanSession) => [p.session, p.action, p.description, p.expectedOutcome]),
                theme: 'grid',
                headStyles: { fillColor: [52, 107, 241] },
                styles: { cellPadding: 2, fontSize: 8 },
            });
            
            pdf.save(`${docTitle}.pdf`);
        } else { // Word
            const tableHtml = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead><tr style="background-color: #f2f2f2;"><th>Sesi</th><th>Tindakan</th><th>Uraian</th><th>Hasil Akhir</th></tr></thead>
                    <tbody>${planResponse.detailedPlan.map(p => `<tr><td style="padding: 5px;">${p.session}</td><td style="padding: 5px;">${p.action}</td><td style="padding: 5px;">${p.description}</td><td style="padding: 5px;">${p.expectedOutcome}</td></tr>`).join('')}</tbody>
                </table>
            `;
            const unsafeSynergyHtml = planResponse.synergyAnalysis ? await Promise.resolve(marked.parse(planResponse.synergyAnalysis)) : '';
            const unsafeMaterialSummaryHtml = await Promise.resolve(marked.parse(planResponse.materialSummary));
            const synergyAnalysisHtml = DOMPurify.sanitize(unsafeSynergyHtml as string);
            const materialSummaryHtml = DOMPurify.sanitize(unsafeMaterialSummaryHtml as string);

            const content = `
                <html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>
                <h1>Laporan Rencana Belajar +Plus</h1>${studentInfoHtml}<hr/>
                ${planResponse.synergyAnalysis ? `<h2>Analisis Sinergi Strategi</h2>${synergyAnalysisHtml}<hr/>` : ''}
                <h2>Rangkuman Materi</h2>${materialSummaryHtml}<hr/>
                <h2>Tabel Rencana Belajar</h2>${tableHtml}
                </body></html>
            `;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${docTitle}.doc`; a.click(); URL.revokeObjectURL(url);
        }
    };
    
    // States for rendered HTML from strategyResponse
    const [strategyInitialAnalysisHtml, setStrategyInitialAnalysisHtml] = useState('');
    const [strategyMethodExplanationHtml, setStrategyMethodExplanationHtml] = useState('');
    const [strategySynergyAnalysisHtml, setStrategySynergyAnalysisHtml] = useState('');
    const [strategyTimeTechniqueReasoningHtml, setStrategyTimeTechniqueReasoningHtml] = useState('');

    useEffect(() => {
        if(strategyResponse) {
            // FIX: Wrap marked.parse in Promise.resolve to handle both sync and async return types.
            Promise.resolve(marked.parse(strategyResponse.initialAnalysis)).then(html => html && setStrategyInitialAnalysisHtml(DOMPurify.sanitize(html as string)));
            Promise.resolve(marked.parse(strategyResponse.methodExplanation)).then(html => html && setStrategyMethodExplanationHtml(DOMPurify.sanitize(html as string)));
            Promise.resolve(marked.parse(strategyResponse.synergyAnalysis)).then(html => html && setStrategySynergyAnalysisHtml(DOMPurify.sanitize(html as string)));
            Promise.resolve(marked.parse(strategyResponse.timeTechniqueReasoning)).then(html => html && setStrategyTimeTechniqueReasoningHtml(DOMPurify.sanitize(html as string)));
        }
    }, [strategyResponse]);
    
    const renderStep = () => {
        switch(step) {
            case 'input': return (
                <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-center text-lg text-slate-300">Buat rencana belajar canggih dengan integrasi teknik manajemen waktu.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label><CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Cari atau ketik mata kuliah..."/></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label><input type="text" value={mainTopic} onChange={e => setMainTopic(e.target.value)} placeholder="Contoh: Perilaku Hedonisme Masyarakat" className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg"/></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-300 font-display">Masukkan Materi</label><textarea rows={8} value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Tempelkan materi Anda di sini..." className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg"></textarea></div>
                    <div className="text-center text-gray-400 font-display text-sm">ATAU</div>
                    <div>
                        <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md"><div className="space-y-1 text-center"><div className="flex text-sm text-gray-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} /><span>Unggah File</span></label></div><p className="text-xs text-gray-500">PDF, Word, Excel, PPT, TXT, Gambar, MP4 (Maks. 4 file)</p></div></div>
                        {files.length > 0 && <div className="mt-2 space-y-2">{files.map((f) => (<div key={f.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md text-sm"><span className="text-slate-300 truncate pr-2">{f.file.name}</span><button onClick={() => removeFile(f.id)} className="text-ut-red hover:text-red-400 font-bold text-lg flex-shrink-0" aria-label={`Hapus file ${f.file.name}`}>&times;</button></div>))}</div>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Tipe Belajar</label><select value={learningType} onChange={e => { setLearningType(e.target.value as LearningType); setSelectedMethod(''); }} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg" required><option value="" disabled className={optionStyle}>[Pilih Tipe]</option><option value="Intensif" className={optionStyle}>Intensif</option><option value="Ekstensif" className={optionStyle}>Ekstensif</option></select></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Metode Pilihan</label><select value={selectedMethod} onChange={e => setSelectedMethod(e.target.value as Method)} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg" disabled={!learningType} required><option value="" disabled className={optionStyle}>[Pilih Metode]</option>{learningType && METHODS[learningType].map(m => <option key={m} value={m} className={optionStyle}>{m}</option>)}</select></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 font-display">Tanggal Mulai Belajar</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg" /></div>
                        <div><label className="block text-sm font-medium text-slate-300 font-display text-center mb-2">Jumlah Sesi Belajar (Hari)</label><div className="flex items-center justify-center gap-4"><button onClick={() => setSessionCount(c => Math.max(1, c - 1))} className="px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600">-</button><input type="number" value={sessionCount} readOnly className="w-20 text-center bg-slate-800 border-slate-600 rounded-md py-2" /><button onClick={() => setSessionCount(c => c + 1)} className="px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600">+</button></div></div>
                     </div>
                    {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                    <button onClick={handleGetRecommendation} className="w-full mt-6 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Lanjutkan: Dapatkan Rekomendasi</button>
                </div>
            );
            case 'generatingRecommendation': return <LoadingState message="Menganalisis & Mencari Strategi Terbaik..." />;
            case 'recommendation': if (!strategyResponse) return null; return (
                <div className="space-y-6">
                    <div className="text-center"><h3 className="text-3xl font-bold font-display text-white">Analisis & Rekomendasi Strategi</h3><p className="text-slate-400 mt-2">ABM-UT telah menganalisis materi Anda dan merekomendasikan strategi berikut.</p></div>
                    <div className="bg-slate-900/50 p-6 rounded-lg"><h4 className="text-xl font-bold text-white font-display mb-3">Analisis Awal</h4><div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: strategyInitialAnalysisHtml }}></div></div>
                    <div className="bg-slate-900/50 p-6 rounded-lg"><h4 className="text-xl font-bold text-white font-display mb-3">Analisis Metode Belajar Pilihan</h4><div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: strategyMethodExplanationHtml }}></div></div>
                    <div className="bg-ut-yellow/20 p-6 rounded-lg border-2 border-ut-yellow"><h4 className="text-2xl font-bold text-ut-yellow font-display mb-3 text-center">Rekomendasi Teknik Manajemen Waktu</h4><p className="text-xl font-semibold text-white text-center mb-2">{strategyResponse.recommendedTimeTechnique}</p><div className="prose prose-sm prose-invert max-w-none text-yellow-200" dangerouslySetInnerHTML={{ __html: strategyTimeTechniqueReasoningHtml }}></div></div>
                    <div className="bg-slate-900/50 p-6 rounded-lg"><h4 className="text-xl font-bold text-white font-display mb-3">Analisis Sinergi Strategi</h4><div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: strategySynergyAnalysisHtml }}></div></div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 font-display mb-2">Pilih Teknik Manajemen Waktu Final</label>
                        <select value={finalTimeTechnique} onChange={e => setFinalTimeTechnique(e.target.value as TimeTechnique)} className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg">{TIME_TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                    <div className="flex gap-4"><button onClick={() => setStep('input')} className="flex-1 py-3 px-4 font-display text-lg font-medium bg-slate-600 rounded-lg">Kembali</button><button onClick={handleGenerateFinalPlan} className="flex-1 py-3 px-4 font-display text-lg font-medium text-white bg-ut-green hover:bg-green-500 rounded-lg">Buat Rencana Belajar +Plus</button></div>
                </div>
            );
            case 'generatingPlan': return <LoadingState message="Mengintegrasikan Strategi & Membuat Rencana Akhir..." />;
            case 'report': if (!planResponse) return null; return(
                <div className="space-y-6">
                    <div className="text-center"><h3 className="text-3xl font-bold font-display text-white">Laporan Rencana Belajar +Plus Lengkap</h3></div>
                    <div className="bg-slate-900/50 p-6 rounded-lg text-sm space-y-1"><p><strong>Mata Kuliah:</strong> {courseName} | <strong>Topik Utama:</strong> {mainTopic}</p><p><strong>Tipe Belajar:</strong> ${learningType} | <strong>Metode:</strong> ${selectedMethod}</p><p><strong>Teknik Waktu:</strong> ${finalTimeTechnique}</p></div>
                    {/* FIX: Use state variable for HTML instead of parseSync */}
                    {planResponse.synergyAnalysis && <div className="bg-slate-900/50 p-6 rounded-lg"><h4 className="text-xl font-bold text-white font-display mb-3">Analisis Sinergi</h4><div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: synergyAnalysisHtml }} /></div>}
                    {/* FIX: Use state variable for HTML instead of parseSync */}
                    <div className="bg-slate-900/50 p-6 rounded-lg"><h4 className="text-xl font-bold text-white font-display mb-3">Rangkuman Materi</h4><div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: materialSummaryHtml }} /></div>
                    
                    {/* New AI Advice Section */}
                    <div className="bg-slate-900/50 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-white font-display mb-3">Saran Belajar dari ABM-UT</h4>
                        {isLoadingAdvice ? (
                            <div className="flex items-center justify-center p-4"><div className="animate-spin h-6 w-6 text-ut-blue-light"></div><p className="ml-3">Memuat saran...</p></div>
                        ) : (
                            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiAdviceHtml }} />
                        )}
                    </div>

                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700"><h4 className="font-bold text-lg text-ut-blue-light font-display text-center mb-3">Atur Pengingat Sesi Belajar Harian</h4><div className="flex flex-col sm:flex-row items-center justify-center gap-4"><input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="block w-full sm:w-auto px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg" /><button onClick={handleSetReminders} className="w-full sm:w-auto py-3 px-6 font-display font-medium text-white bg-ut-blue rounded-lg" disabled={!startDate}>Setel Pengingat</button></div>{!startDate && <p className="text-xs text-ut-yellow text-center mt-2">Atur "Tanggal Mulai Belajar" di halaman awal untuk mengaktifkan pengingat.</p>}</div>
                    <div className="flex flex-col md:flex-row gap-4"><button onClick={() => downloadAs('pdf')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-green rounded-lg">Unduh PDF</button><button onClick={() => downloadAs('word')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-blue rounded-lg">Unduh Word</button><button onClick={() => downloadAs('excel')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-yellow-600 rounded-lg">Unduh Excel</button><button onClick={() => setStep('input')} className="flex-1 py-3 px-4 font-display font-medium bg-gray-600 rounded-lg">Buat Baru</button></div>
                </div>
            );
        }
    }
    
    return (
        <section id="Rencana-Belajar-Plus" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                 <div className="text-center mb-8"><h1 className="text-4xl md:text-5xl font-bold text-white font-display">Rencana Belajar +Plus</h1><p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Rencana belajar terstruktur dengan integrasi teknik manajemen waktu untuk efisiensi maksimal.</p></div>
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />
                    {renderStep()}
                </div>
            </div>
        </section>
    );
};