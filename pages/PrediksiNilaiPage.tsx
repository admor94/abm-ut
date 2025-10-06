import React, { useState, useMemo, useEffect } from 'react';
import { marked } from 'marked';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { getAiResponse } from '../services/geminiService';
import { CourseSearchInput } from '../components/CourseSearchInput';
import DOMPurify from 'dompurify';


interface PrediksiNilaiPageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

const GRADE_TARGETS: Record<string, number> = { 'A': 85, 'B': 75, 'C': 65, 'D': 55 };

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg text-center">
        <svg className="animate-spin h-8 w-8 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="font-display text-white">ABM-UT sedang menganalisis & membuat saran...</p>
    </div>
);


export const PrediksiNilaiPage: React.FC<PrediksiNilaiPageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Prediksi Nilai UAS'];
    
    // Form state
    const [courseName, setCourseName] = useState('');
    const [weightTuton, setWeightTuton] = useState(30);
    const [scoreTuton, setScoreTuton] = useState(80);
    const [weightTugas, setWeightTugas] = useState(20);
    const [scoreTugas, setScoreTugas] = useState(80);
    const [targetGrade, setTargetGrade] = useState('B');

    // Result state
    const [isCalculated, setIsCalculated] = useState(false);
    const [aiAdvice, setAiAdvice] = useState('');
    const [aiAdviceHtml, setAiAdviceHtml] = useState('');
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

    const weightUas = useMemo(() => 100 - weightTuton - weightTugas, [weightTuton, weightTugas]);
    
    const { nilaiUasDibutuhkan, pesanHasil } = useMemo(() => {
        if (weightUas <= 0) {
            return { nilaiUasDibutuhkan: null, pesanHasil: "Bobot UAS harus lebih dari 0." };
        }
        const nilaiTarget = GRADE_TARGETS[targetGrade];
        const kontribusiSaatIni = (scoreTuton * weightTuton / 100) + (scoreTugas * weightTugas / 100);
        const uasNeeded = (nilaiTarget - kontribusiSaatIni) / (weightUas / 100);
        
        let pesan = '';
        if (uasNeeded > 100) {
            pesan = 'Target nilai Anda tidak mungkin tercapai, bahkan dengan nilai UAS 100. Pertimbangkan untuk merevisi target Anda.';
        } else if (uasNeeded <= 0) {
            pesan = 'Selamat! Anda sudah mencapai target nilai, bahkan sebelum UAS. Tetap pertahankan performa terbaik Anda di UAS!';
        }

        return { nilaiUasDibutuhkan: uasNeeded, pesanHasil: pesan };
    }, [scoreTuton, weightTuton, scoreTugas, weightTugas, targetGrade, weightUas]);
    
    useEffect(() => {
      if (aiAdvice) {
        let isMounted = true;
        Promise.resolve(marked.parse(aiAdvice)).then(html => {
          if (isMounted && html) {
            setAiAdviceHtml(DOMPurify.sanitize(html));
          }
        });
        return () => { isMounted = false; }
      }
    }, [aiAdvice]);

    const handleCalculate = () => {
        if (weightTuton + weightTugas >= 100) {
            alert('Total bobot Tuton dan Tugas tidak boleh 100% atau lebih.');
            return;
        }
        setIsCalculated(true);
        setAiAdvice(''); // Reset advice on new calculation
        setAiAdviceHtml('');
    };

    const handleGetAdvice = async () => {
        setIsLoadingAdvice(true);
        setAiAdvice('');
        setAiAdviceHtml('');
        
        const uasNeeded = nilaiUasDibutuhkan !== null ? Math.max(0, nilaiUasDibutuhkan).toFixed(2) : 'N/A';

        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang konsultan akademik yang suportif dan strategis.

[DATA MAHASISWA]
- Mata Kuliah: ${courseName}
- Nilai Tuton/Tuweb: ${scoreTuton} (Bobot ${weightTuton}%)
- Nilai Tugas Lainnya: ${scoreTugas} (Bobot ${weightTugas}%)
- Bobot UAS: ${weightUas}%
- Target Nilai Akhir: ${targetGrade} (Skor minimum ${GRADE_TARGETS[targetGrade]})
- Skor UAS Minimum yang Dibutuhkan: ${uasNeeded}

[TUGAS]
Berikan saran belajar yang konkret, personal, dan memotivasi untuk membantu mahasiswa mencapai target nilai UAS mereka. Format jawaban dalam Markdown.

[STRUKTUR SARAN]
1.  **Analisis Singkat**: Beri apresiasi atas nilai yang sudah didapat dan jelaskan situasi saat ini secara positif.
2.  **Strategi Belajar Kunci (3-4 Poin)**: Berikan saran yang spesifik dan dapat ditindaklanjuti. Contoh: "Fokus pada modul X dan Y", "Latih kembali soal-soal dari Tugas 2", "Gunakan metode Feynman untuk konsep Z".
3.  **Pesan Motivasi**: Akhiri dengan kalimat yang membangkitkan semangat.
`;

        try {
            const adviceText = await getAiResponse([], studentData, prompt);
            setAiAdvice(adviceText);
        } catch (error) {
            setAiAdvice("Maaf, terjadi kesalahan saat mencoba mendapatkan saran dari AI. Silakan coba lagi.");
        } finally {
            setIsLoadingAdvice(false);
        }
    };


    return (
        <section id="Prediksi-Nilai-UAS" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Prediksi Nilai UAS</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Hitung skor UAS yang dibutuhkan & dapatkan saran belajar personal dari ABM-UT.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Input Form */}
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-300 font-display">Mata Kuliah</label><CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Pilih mata kuliah..."/></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-300 font-display">Bobot Tuton/Tuweb (%)</label><input type="number" value={weightTuton} onChange={e => setWeightTuton(Number(e.target.value))} min="0" max="99" className="mt-1 w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                                <div><label className="block text-sm font-medium text-slate-300 font-display">Nilai Tuton/Tuweb</label><input type="number" value={scoreTuton} onChange={e => setScoreTuton(Number(e.target.value))} min="0" max="100" className="mt-1 w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-300 font-display">Bobot Tugas Lainnya (%)</label><input type="number" value={weightTugas} onChange={e => setWeightTugas(Number(e.target.value))} min="0" max="99" className="mt-1 w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                                <div><label className="block text-sm font-medium text-slate-300 font-display">Rata-rata Nilai Tugas</label><input type="number" value={scoreTugas} onChange={e => setScoreTugas(Number(e.target.value))} min="0" max="100" className="mt-1 w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg"/></div>
                            </div>
                            
                            <div><label className="block text-sm font-medium text-slate-300 font-display">Target Nilai Akhir</label><select value={targetGrade} onChange={e => setTargetGrade(e.target.value)} className="mt-1 block w-full p-2 bg-slate-800/50 border border-slate-600 rounded-lg"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div>

                            <button onClick={handleCalculate} className="w-full py-3 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg">Hitung</button>
                        </div>

                        {/* Result Display */}
                        <div className="flex flex-col">
                           <div className={`p-6 rounded-lg text-center flex-grow flex flex-col justify-center items-center transition-all duration-300 ${isCalculated ? 'bg-slate-900/50' : 'bg-slate-800/50'}`}>
                            {isCalculated ? (
                                <>
                                    <p className="text-slate-400 font-display">Bobot UAS: <span className="font-bold text-white">{weightUas}%</span></p>
                                    <p className="text-lg text-white font-display mt-4">Skor UAS Minimum yang Dibutuhkan:</p>
                                    <p className={`text-6xl font-bold my-2 ${nilaiUasDibutuhkan !== null && nilaiUasDibutuhkan > 100 ? 'text-ut-red' : 'text-ut-green'}`}>
                                        {nilaiUasDibutuhkan !== null && nilaiUasDibutuhkan > 0 ? nilaiUasDibutuhkan.toFixed(2) : '0'}
                                    </p>
                                    {pesanHasil && <p className="text-sm text-ut-yellow mt-2">{pesanHasil}</p>}
                                    <button onClick={handleGetAdvice} disabled={isLoadingAdvice} className="mt-6 px-4 py-2 text-sm bg-ut-green hover:bg-green-500 rounded-lg shadow-md disabled:bg-gray-500">
                                        {isLoadingAdvice ? 'Memuat Saran...' : 'Minta Saran Belajar ke AI'}
                                    </button>
                                </>
                            ) : (
                                <p className="text-slate-500">Hasil prediksi akan muncul di sini setelah Anda menekan tombol "Hitung".</p>
                            )}
                            </div>
                        </div>
                    </div>

                    {isCalculated && (aiAdvice || isLoadingAdvice) && (
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <h3 className="text-xl font-bold text-white font-display mb-4 text-center">Saran Belajar dari ABM-UT</h3>
                            {isLoadingAdvice ? <LoadingState /> : (
                                <div className="p-6 bg-slate-900/50 rounded-lg prose prose-invert max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: aiAdviceHtml }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
