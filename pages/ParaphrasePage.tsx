import React, { useState } from 'react';
import type { AppView, StudentData } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { generateParaphrase } from '../services/geminiService';

interface ParaphrasePageProps {
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
}

type PageStep = 'input' | 'generating' | 'display';
type Instruction = "Buat lebih formal" | "Sederhanakan kalimat" | "Perbaiki alur paragraf";

const INSTRUCTION_OPTIONS: Instruction[] = [
    "Buat lebih formal",
    "Sederhanakan kalimat",
    "Perbaiki alur paragraf",
];

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-ut-blue-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-display text-white">AI sedang menganalisis dan menulis ulang teks Anda...</p>
        <p className="text-gray-400 mt-2">Ini mungkin akan memakan waktu sejenak.</p>
    </div>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button 
            onClick={handleCopy} 
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            aria-label="Salin teks"
        >
            {copied ? 'Tersalin!' : 'Salin'}
        </button>
    );
};

export const ParaphrasePage: React.FC<ParaphrasePageProps> = ({ studentData, setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Parafrasa & Gaya Bahasa'];
    const [step, setStep] = useState<PageStep>('input');
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [originalText, setOriginalText] = useState('');
    const [instructions, setInstructions] = useState<Set<Instruction>>(new Set());
    
    // Result state
    const [result, setResult] = useState<{ paraphrasedText: string; editorNotes: string[] } | null>(null);
    
    const handleInstructionToggle = (instruction: Instruction) => {
        setInstructions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(instruction)) {
                newSet.delete(instruction);
            } else {
                newSet.add(instruction);
            }
            return newSet;
        });
    };

    const handleGenerate = async () => {
        if (!originalText.trim()) {
            setError("Teks asli tidak boleh kosong.");
            return;
        }
        setError(null);
        setStep('generating');
        try {
            const res = await generateParaphrase(originalText, Array.from(instructions), studentData);
            setResult(res);
            setStep('display');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
            setStep('input');
        }
    };

    const handleReset = () => {
        setStep('input');
        setOriginalText('');
        setInstructions(new Set());
        setResult(null);
        setError(null);
    };

    const renderStep = () => {
        switch (step) {
            case 'input':
                return (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <p className="text-center text-lg text-gray-300">Tempelkan teks Anda di bawah, pilih instruksi perbaikan, dan biarkan AI membantu menyempurnakannya.</p>
                        <div>
                            <label htmlFor="originalText" className="block text-sm font-medium text-gray-300 font-display">Teks Asli</label>
                            <textarea 
                                id="originalText"
                                rows={10}
                                value={originalText} 
                                onChange={e => setOriginalText(e.target.value)} 
                                placeholder="Masukkan teks yang ingin Anda parafrasakan di sini..." 
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-gray-500 placeholder:italic"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 font-display mb-2">Instruksi Tambahan (Opsional)</label>
                            <div className="flex flex-wrap gap-3">
                                {INSTRUCTION_OPTIONS.map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => handleInstructionToggle(opt)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${instructions.has(opt) ? 'bg-ut-blue text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                        <button onClick={handleGenerate} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Proses Teks</button>
                    </div>
                );
            case 'generating':
                return <LoadingState />;
            case 'display':
                return (
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold font-display text-white mb-4">Perbandingan Teks</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-400 mb-2">Teks Asli</h4>
                                    <div className="p-4 bg-gray-800/40 rounded-lg text-gray-300 text-sm h-64 overflow-y-auto border border-gray-700">{originalText}</div>
                                </div>
                                <div>
                                     <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-ut-blue-light">Teks Hasil Perbaikan</h4>
                                        <CopyButton textToCopy={result?.paraphrasedText || ''} />
                                     </div>
                                    <div className="p-4 bg-gray-800/80 rounded-lg text-white text-sm h-64 overflow-y-auto border border-ut-blue/50">{result?.paraphrasedText}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold font-display text-white mb-4">Catatan Editor</h3>
                            <div className="space-y-3">
                                {result?.editorNotes.map((note, index) => (
                                    <div key={index} className="flex items-start p-3 bg-ut-blue/10 rounded-lg border-l-4 border-ut-blue">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ut-blue-light mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        <p className="text-sm text-gray-300">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleReset} className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300">Mulai Lagi</button>
                    </div>
                );
        }
    };

    return (
        <section id="Parafrasa-Gaya-Bahasa" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Parafrasa & Gaya Bahasa</h1>
                <p className="mt-2 text-lg text-gray-300 max-w-4xl">Ubah kalimat untuk menghindari plagiarisme dan perbaiki gaya bahasa tulisan Anda.</p>
            </div>
            <div className="w-full max-w-6xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
                <PageHeader 
                    parentView={parentView}
                    setActiveView={setActiveView}
                />
                {renderStep()}
            </div>
        </section>
    );
};