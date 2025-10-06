import React, { useState, useRef, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';
import type { AppView, StudentData, StudyPlanResponse, StudyPlanSession } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateStudyPlan } from '../services/geminiService';
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

interface StudyPlanPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'generating' | 'analysis' | 'report';
type LearningType = 'Intensif' | 'Ekstensif';
type Method = 'SQ3R' | 'SQ4R' | 'KWLH' | 'PQRST' | 'Active Recall' | 'Spaced Repetition' | 'Deep Learning' | 'Shallow Learning' | 'Scanning' | 'Skimming';

const METHODS: Record<LearningType, Method[]> = {
    'Intensif': ['SQ3R', 'SQ4R', 'KWLH', 'PQRST', 'Active Recall', 'Spaced Repetition'],
    'Ekstensif': ['Deep Learning', 'Shallow Learning', 'Scanning', 'Skimming']
};

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl font-display text-white">ABM-UT sedang merancang rencana belajar Anda...</p>
        <p className="text-gray-400 mt-2">Ini mungkin akan memakan waktu sejenak, tergantung pada kompleksitas materi.</p>
    </div>
);

const optionStyle = "bg-gray-800 text-white";

export const StudyPlanPage: React.FC<StudyPlanPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Rencana Belajar'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    const [courseName, setCourseName] = useState('');
    const [mainTopic, setMainTopic] = useState('');
    const [materialText, setMaterialText] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [sessionCount, setSessionCount] = useState(3);
    const [learningType, setLearningType] = useState<LearningType | ''>('');
    const [selectedMethod, setSelectedMethod] = useState<Method | ''>('');
    const [startDate, setStartDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');

    const [planResponse, setPlanResponse] = useState<StudyPlanResponse | null>(null);
    const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

    // FIX: Add state for rendered HTML to handle async parsing
    const [initialAnalysisHtml, setInitialAnalysisHtml] = useState('');
    const [methodExplanationHtml, setMethodExplanationHtml] = useState('');
    const [materialSummaryHtml, setMaterialSummaryHtml] = useState('');

    // FIX: Use useEffects to parse markdown when data is available
    useEffect(() => {
        if (planResponse?.initialAnalysis) {
            // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
            Promise.resolve(marked.parse(planResponse.initialAnalysis)).then(html => html && setInitialAnalysisHtml(DOMPurify.sanitize(html)));
        }
    }, [planResponse?.initialAnalysis]);

    useEffect(() => {
        if (planResponse?.methodExplanation) {
            // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
            Promise.resolve(marked.parse(planResponse.methodExplanation)).then(html => html && setMethodExplanationHtml(DOMPurify.sanitize(html)));
        }
    }, [planResponse?.methodExplanation]);

    useEffect(() => {
        if (planResponse?.materialSummary) {
            // FIX: marked.parse can be sync or async. Wrap in Promise.resolve to handle both.
            Promise.resolve(marked.parse(planResponse.materialSummary)).then(html => html && setMaterialSummaryHtml(DOMPurify.sanitize(html)));
        }
    }, [planResponse?.materialSummary]);

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

    const handleGeneratePlan = async (methodOverride?: string) => {
        const methodToUse = methodOverride || selectedMethod;
        if (!courseName || !mainTopic || (!materialText && files.length === 0) || !learningType || !methodToUse) {
            setError("Harap lengkapi semua kolom yang diperlukan.");
            return;
        }
        setStep('generating');
        setError(null);
        try {
            const fileList = files.map(f => f.file);
            const result = await generateStudyPlan(studentData, courseName, mainTopic, materialText, fileList, sessionCount, learningType, methodToUse as string);
            setPlanResponse(result);
            setCurrentSessionIndex(0); // Reset session index for new plan
            setStep('analysis');
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
                        `Rencana Belajar: ${courseName}`,
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
        const docTitle = `Rencana_Belajar_${mainTopic.replace(/\s/g, '_')}`;
        
        const studentInfoHtml = `
            <div style="font-family: helvetica; color: black; font-size: 10pt; line-height: 1.5;">
                <p><strong>Nama Mahasiswa:</strong> ${studentData.name}</p>
                <p><strong>Fakultas:</strong> ${studentData.faculty} | <strong>Program Studi:</strong> ${studentData.studyProgram} | <strong>Semester:</strong> ${studentData.semester}</p>
                <p><strong>Mata Kuliah:</strong> ${courseName} | <strong>Topik Utama:</strong> ${mainTopic}</p>
                <p><strong>Tipe Belajar:</strong> ${learningType} | <strong>Metode:</strong> ${selectedMethod}</p>
                <p><strong>Rentang Belajar:</strong> ${studentData.studyTimeStart} - ${studentData.studyTimeEnd} | <strong>Durasi:</strong> ${Math.floor(studentData.studyDuration / (1000 * 60 * 60))} Jam ${Math.floor((studentData.studyDuration % (1000 * 60 * 60)) / (1000 * 60))} Menit | <strong>Situasi:</strong> ${studentData.studySituation}</p>
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
            
            pdf.setFontSize(18).text('Laporan Rencana Belajar', 15, y);
            y += 10;
            
            await pdf.html(studentInfoHtml, { x: 15, y, width: 180, windowWidth: 800, autoPaging: 'text' });
            y = (pdf as any).y;
            
            pdf.setFontSize(16).text('Rangkuman Materi', 15, y += 10);
            const unsafeMaterialHtml = await Promise.resolve(marked.parse(planResponse.materialSummary));
            const materialHtml = DOMPurify.sanitize(unsafeMaterialHtml);
            await pdf.html(materialHtml, { x: 15, y: y += 5, width: 180, windowWidth: 800, autoPaging: 'text' });
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
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th>Sesi</th><th>Tindakan</th><th>Uraian</th><th>Hasil Akhir</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${planResponse.detailedPlan.map(p => `
                            <tr>
                                <td style="padding: 5px;">${p.session}</td>
                                <td style="padding: 5px;">${p.action}</td>
                                <td style="padding: 5px;">${p.description}</td>
                                <td style="padding: 5px;">${p.expectedOutcome}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            const unsafeMaterialSummaryHtml = await Promise.resolve(marked.parse(planResponse.materialSummary));
            const materialSummaryHtml = DOMPurify.sanitize(unsafeMaterialSummaryHtml);
            const content = `
                <html><head><meta charset='utf-8'><title>${docTitle}</title></head><body>
                <h1>Laporan Rencana Belajar</h1>${studentInfoHtml}<hr/>
                <h2>Rangkuman Materi</h2>${materialSummaryHtml}<hr/>
                <h2>Tabel Rencana Belajar</h2>${tableHtml}
                <br/><p><em>Semangat belajar, ${studentData.name.split(' ')[0]}! Rencana ini adalah panduan, jangan ragu untuk menyesuaikannya. Kunci utamanya adalah konsistensi dan pemahaman mendalam.</em></p>
                </body></html>
            `;
            const blob = new Blob([content], { type: 'application/msword' });
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
                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className="text-center text-lg text-slate-300">Halo {studentData.name}, mari kita buat rencana belajar yang efektif. Silakan isi informasi berikut:</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Nama Mata Kuliah</label>
                                <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Cari kode atau nama mata kuliah..."/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Modul / Topik Utama</label>
                                <input type="text" value={mainTopic} onChange={e => setMainTopic(e.target.value)} placeholder="Contoh: Perilaku Hedonisme Masyarakat" className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 font-display">Masukkan Materi</label>
                            <textarea rows={8} value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Tempelkan materi Anda di sini..." className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"></textarea>
                        </div>
                        <div className="text-center text-gray-400 font-display text-sm">ATAU</div>
                        <div>
                            <div ref={dropzoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md transition-colors duration-300">
                                <div className="space-y-1 text-center"><div className="flex text-sm text-gray-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-ut-blue-light hover:text-ut-blue px-1"><input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} /><span>Unggah File</span></label></div><p className="text-xs text-gray-500">PDF, Word, Excel, PPT, TXT, Gambar, MP4 (Maks. 4 file)</p></div>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm font-medium text-slate-300">File yang diunggah:</p>
                                    {files.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md text-sm">
                                            <span className="text-slate-300 truncate pr-2">{f.file.name}</span>
                                            <button onClick={() => removeFile(f.id)} className="text-ut-red hover:text-red-400 font-bold text-lg flex-shrink-0" aria-label={`Hapus file ${f.file.name}`}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Tipe Belajar</label>
                                <select value={learningType} onChange={e => { setLearningType(e.target.value as LearningType); setSelectedMethod(''); }} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" required>
                                    <option value="" disabled className={optionStyle}>[Pilih Tipe]</option>
                                    <option value="Intensif" className={optionStyle}>Intensif</option>
                                    <option value="Ekstensif" className={optionStyle}>Ekstensif</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Metode Pilihan</label>
                                <select value={selectedMethod} onChange={e => setSelectedMethod(e.target.value as Method)} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" disabled={!learningType} required>
                                    <option value="" disabled className={optionStyle}>[Pilih Metode]</option>
                                    {learningType && METHODS[learningType].map(m => <option key={m} value={m} className={optionStyle}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-300 font-display">Tanggal Mulai Belajar</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 font-display text-center mb-2">Jumlah Sesi Belajar (Hari)</label>
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={() => setSessionCount(c => Math.max(1, c - 1))} className="px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600">-</button>
                                    <input type="number" value={sessionCount} readOnly className="w-20 text-center bg-slate-800 border-slate-600 rounded-md py-2" />
                                    <button onClick={() => setSessionCount(c => c + 1)} className="px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600">+</button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center">Jika tidak yakin, baca kembali tentang tipe dan metode di <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('Metode Membaca Intensif')}} className="text-ut-blue-light hover:underline">Metode Membaca Intensif</a> atau <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('Metode Membaca Ekstensif')}} className="text-ut-blue-light hover:underline">Ekstensif</a>.</p>

                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={() => handleGeneratePlan()} className="w-full mt-6 py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Proses Rencana Belajar</button>
                    </div>
                );
            case 'generating':
                return <LoadingState />;
            case 'analysis':
                if (!planResponse || groupedPlan.length === 0) return null;
                const [sessionTitle, sessionActions] = groupedPlan[currentSessionIndex];

                return (
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 p-6 rounded-lg">
                            <h3 className="text-2xl font-bold text-white font-display mb-3">Analisis Awal Materi</h3>
                            {/* FIX: Use state variable for HTML */}
                            <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: initialAnalysisHtml }} />
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-lg">
                            <h3 className="text-2xl font-bold text-white font-display mb-3">Analisis Metode Belajar</h3>
                            {/* FIX: Use state variable for HTML */}
                            <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: methodExplanationHtml }} />
                            {planResponse.recommendation && (
                                <div className="mt-4 p-4 bg-ut-yellow/20 border-l-4 border-ut-yellow text-yellow-200">
                                    <p className="font-bold">Rekomendasi Metode Alternatif: {planResponse.recommendation.recommendedMethod}</p>
                                    <p className="text-sm mt-1">{planResponse.recommendation.reasoning}</p>
                                    <button onClick={() => handleGeneratePlan(planResponse.recommendation?.recommendedMethod)} className="mt-3 px-4 py-2 text-sm bg-ut-yellow text-black font-semibold rounded-lg hover:bg-yellow-400">Gunakan Metode Rekomendasi</button>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-slate-900/50 p-6 rounded-lg">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-bold text-white font-display">Rencana Belajar: {sessionTitle}</h4>
                                <span className="text-sm text-slate-400 font-mono">Sesi {currentSessionIndex + 1} / {groupedPlan.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left table-auto border-collapse">
                                    <thead className="bg-slate-900/70"><tr className="border-b-2 border-slate-700">
                                        <th className="py-3 px-4 text-sm font-semibold text-ut-blue-light uppercase tracking-wider">Tindakan</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-ut-blue-light uppercase tracking-wider">Uraian</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-ut-blue-light uppercase tracking-wider">Hasil Akhir</th>
                                    </tr></thead>
                                    <tbody>
                                        {sessionActions.map((p, i) => (
                                            <tr key={i} className="border-t border-slate-700">
                                                <td className="py-3 px-4 text-slate-300 align-top font-semibold">{p.action}</td>
                                                <td className="py-3 px-4 text-slate-300 align-top text-sm">{p.description}</td>
                                                <td className="py-3 px-4 text-slate-300 align-top text-sm">{p.expectedOutcome}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                             <div className="flex justify-between items-center mt-6">
                                <button onClick={() => setCurrentSessionIndex(prev => Math.max(0, prev - 1))} disabled={currentSessionIndex === 0} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:opacity-50 font-display">Sesi Sebelumnya</button>
                                {currentSessionIndex < groupedPlan.length - 1 ? (
                                    <button onClick={() => setCurrentSessionIndex(prev => Math.min(groupedPlan.length - 1, prev + 1))} className="px-6 py-2 bg-ut-blue hover:bg-ut-blue-light rounded-lg font-display">Sesi Berikutnya</button>
                                ) : (
                                    <button onClick={() => setStep('report')} className="px-6 py-2 bg-ut-green hover:bg-green-600 rounded-lg font-display">Lanjutkan ke Laporan Akhir</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'report':
                if (!planResponse) return null;
                 return (
                    <div className="space-y-6">
                        <div className="text-center">
                             <h3 className="text-3xl font-bold font-display text-white">Laporan Rencana Belajar Lengkap</h3>
                        </div>

                         <div className="bg-slate-900/50 p-6 rounded-lg text-sm space-y-1">
                            <p><strong>Nama Mahasiswa:</strong> {studentData.name}</p>
                            <p><strong>Fakultas:</strong> {studentData.faculty} | <strong>Program Studi:</strong> {studentData.studyProgram} | <strong>Semester:</strong> {studentData.semester}</p>
                            <p><strong>Mata Kuliah:</strong> {courseName} | <strong>Topik Utama:</strong> {mainTopic}</p>
                            <p><strong>Tipe Belajar:</strong> {learningType} | <strong>Metode:</strong> {selectedMethod}</p>
                            <p><strong>Rentang Belajar:</strong> {studentData.studyTimeStart} - ${studentData.studyTimeEnd} | <strong>Durasi:</strong> ${Math.floor(studentData.studyDuration / (1000 * 60 * 60))} Jam ${Math.floor((studentData.studyDuration % (1000 * 60 * 60)) / (1000 * 60))} Menit | <strong>Situasi:</strong> ${studentData.studySituation}</p>
                         </div>
                        
                        <div className="bg-slate-900/50 p-6 rounded-lg">
                            <h4 className="text-xl font-bold text-white font-display mb-3">Rangkuman Materi</h4>
                            {/* FIX: Use state variable for HTML */}
                            <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: materialSummaryHtml }} />
                        </div>
                        
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-lg text-ut-blue-light font-display text-center mb-3">Atur Pengingat Sesi Belajar Harian</h4>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="block w-full sm:w-auto px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"/>
                                <button onClick={handleSetReminders} className="w-full sm:w-auto py-3 px-6 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md" disabled={!startDate}>Setel Pengingat Harian</button>
                            </div>
                            {!startDate && <p className="text-xs text-ut-yellow text-center mt-2">Anda harus mengatur "Tanggal Mulai Belajar" di halaman input untuk mengaktifkan pengingat.</p>}
                        </div>

                        <p className="text-center text-slate-300 italic p-4 bg-slate-900/50 rounded-lg">Semangat belajar, {studentData.name.split(' ')[0]}! Rencana ini adalah panduan, jangan ragu untuk menyesuaikannya. Kunci utamanya adalah konsistensi dan pemahaman mendalam.</p>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button onClick={() => downloadAs('pdf')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-green hover:bg-green-600 rounded-lg shadow-lg">Unduh PDF</button>
                            <button onClick={() => downloadAs('word')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Unduh Word</button>
                            <button onClick={() => downloadAs('excel')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-lg shadow-lg">Unduh Excel</button>
                            <button onClick={() => setStep('input')} className="flex-1 py-3 px-4 font-display font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-lg shadow-lg">Buat Rencana Baru</button>
                        </div>
                    </div>
                 );
        }
    };
    
    return (
        <section id="Rencana-Belajar" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                 <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Rencana Belajar</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Buat rencana belajar terstruktur berdasarkan materi dan metode pilihan Anda.</p>
                </div>
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
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