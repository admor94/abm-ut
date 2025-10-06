import React, { useState, useEffect } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface AdvancedSettingsPageProps {
  setActiveView: (view: AppView) => void;
}

const templates: Record<string, { text: string; description: string }> = {
    'standar': {
        text: '',
        description: "Menghapus semua instruksi dan mengembalikan ABM-UT ke perilaku standar yang ramah dan membantu."
    },
    'sokratik': {
        text: "Anda adalah seorang tutor yang menggunakan metode Sokratik. Jangan pernah memberikan jawaban langsung. Sebaliknya, balas setiap pertanyaan mahasiswa dengan pertanyaan lain yang merangsang pemikiran kritis dan membantu mereka menemukan jawaban sendiri. Tujuannya adalah untuk memandu, bukan memberi tahu.",
        description: "Mengubah ABM-UT menjadi tutor yang selalu bertanya balik untuk merangsang pemikiran kritis. Cocok untuk sesi pemecahan masalah."
    },
    'editor': {
        text: "Anda adalah seorang editor akademik profesional. Fokus utama Anda adalah pada kejelasan, keringkasan, dan formalitas bahasa. Berikan umpan balik yang konstruktif dan perbaikan langsung pada teks. Gunakan gaya bahasa yang formal dan terstruktur. Hindari bahasa gaul atau informal.",
        description: "Mengubah ABM-UT menjadi editor yang fokus pada tata bahasa, gaya penulisan formal, dan struktur. Ideal untuk mereview draf tulisan."
    },
    'diskusi': {
        text: "Anda adalah seorang teman atau partner diskusi yang cerdas dan santai. Gunakan gaya bahasa yang lebih informal dan kolaboratif. Jangan ragu untuk berbagi 'pendapat' atau ide-ide spekulatif untuk memancing brainstorming. Tujuannya adalah untuk menjadi teman bertukar pikiran.",
        description: "Mengubah ABM-UT menjadi teman diskusi yang lebih santai dan informal. Cocok untuk sesi brainstorming dan eksplorasi ide."
    }
};

export const AdvancedSettingsPage: React.FC<AdvancedSettingsPageProps> = ({ setActiveView }) => {
  const parentView = PARENT_VIEW_MAP['Pengaturan Lanjutan'];
  const [systemInstruction, setSystemInstruction] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const savedInstruction = localStorage.getItem('globalSystemInstruction') || '';
    setSystemInstruction(savedInstruction);
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value;
    setSelectedTemplate(templateKey);
    if (templateKey && templates[templateKey]) {
        setSystemInstruction(templates[templateKey].text);
    }
  };

  const handleSave = () => {
    try {
        localStorage.setItem('globalSystemInstruction', systemInstruction);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };
  
  const handleClear = () => {
    setSystemInstruction('');
    setSelectedTemplate('');
    localStorage.removeItem('globalSystemInstruction');
  };

  return (
    <section id="Pengaturan-Lanjutan" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Pengaturan Lanjutan</h1>
        <p className="mt-2 text-lg text-slate-300 max-w-4xl mx-auto">Kustomisasi model dan gaya respons AI sesuai preferensi Anda.</p>
      </div>
      
      <div className="w-full max-w-3xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
        <PageHeader
          parentView={parentView}
          setActiveView={setActiveView}
        />

        <div className="space-y-8">
            {/* Model Section */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-xl text-white font-display">Gemini 2.5 Flash</h3>
                <p className="text-sm text-slate-400">gemini-2.5-flash</p>
                <p className="mt-2 text-slate-300">Model terkini yang digunakan saat ini.</p>
            </div>

            {/* System Instruction Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="font-bold text-xl text-white font-display">Instruksi Sistem</h3>
                    <p className="text-sm text-slate-400">Tambahkan instruksi khusus untuk mengontrol gaya, menambahkan pengetahuan khusus, dan banyak lagi.</p>
                    <textarea 
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        rows={6}
                        className="mt-4 w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500"
                        placeholder="Contoh: Selalu balas dalam bahasa Inggris dengan gaya formal."
                    />
                </div>
                <div>
                    <label htmlFor="template-select" className="block text-sm font-medium text-slate-300 font-display">Templat Instruksi Sistem</label>
                    <select
                        id="template-select"
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                        className="mt-2 block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"
                    >
                        <option value="">Pilih sebuah templat...</option>
                        <option value="standar">Asisten Belajar Standar (Default)</option>
                        <option value="sokratik">Tutor Sokratik</option>
                        <option value="editor">Editor Akademik Profesional</option>
                        <option value="diskusi">Partner Diskusi Santai</option>
                    </select>
                    {selectedTemplate && templates[selectedTemplate] && (
                        <p className="mt-2 text-sm text-slate-400 bg-slate-900/40 p-3 rounded-md">
                            {templates[selectedTemplate].description}
                        </p>
                    )}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-slate-700">
                <button
                    onClick={handleSave}
                    className="w-full sm:w-auto flex-grow py-3 px-6 font-display text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-lg transition duration-300"
                >
                    {saveStatus === 'success' ? 'Berhasil Disimpan!' : 'Simpan Pengaturan'}
                </button>
                 <button
                    onClick={handleClear}
                    className="w-full sm:w-auto py-3 px-6 font-display text-lg font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-lg shadow-lg transition duration-300"
                >
                    Hapus Instruksi
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};