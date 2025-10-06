import React, { useState } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface ApiIntegrationPageProps {
  setActiveView: (view: AppView) => void;
  onApiKeySubmit: (key: string) => void;
}

export const ApiIntegrationPage: React.FC<ApiIntegrationPageProps> = ({ setActiveView, onApiKeySubmit }) => {
  const parentView = PARENT_VIEW_MAP['Integrasi API'];
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!apiKey.trim().startsWith('AIza') || apiKey.trim().length < 30) {
        setError('Kunci API sepertinya tidak valid. Harap periksa kembali.');
        return;
    }
    setError('');
    onApiKeySubmit(apiKey.trim());
  };

  return (
    <section id="Integrasi-API" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Integrasi Kunci API Gemini</h1>
        <p className="mt-2 text-lg text-slate-300 max-w-4xl">Aktifkan semua fitur PRO dengan menggunakan Kunci API Gemini Anda sendiri.</p>
      </div>
      
      <div className="w-full max-w-3xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
        <PageHeader
          parentView={parentView}
          setActiveView={setActiveView}
        />

        <div className="space-y-6">
            <div className="prose prose-invert max-w-none text-slate-300">
                <h4>Mengapa Menggunakan Kunci API Sendiri?</h4>
                <p>Dengan menggunakan kunci API Anda sendiri, Anda membuka akses penuh ke semua fitur, termasuk yang memerlukan pemrosesan AI intensif. Ini memungkinkan Anda untuk bereksplorasi tanpa batas. Kunci API Anda tidak akan disimpan di server manapun dan hanya digunakan di browser Anda selama sesi ini.</p>
                <h4>Bagaimana Cara Mendapatkan Kunci API?</h4>
                <ol>
                    <li>Kunjungi <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</li>
                    <li>Masuk dengan akun Google Anda.</li>
                    <li>Klik tombol "Create API key in new project".</li>
                    <li>Salin kunci yang baru dibuat dan tempelkan di bawah ini.</li>
                </ol>
            </div>
            
            <div className="space-y-4">
                 <div>
                    <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 font-display">Kunci API Gemini Anda</label>
                    <input
                        type="password"
                        id="api-key-input"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-2 block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ut-blue focus:border-ut-blue text-white placeholder:text-gray-500"
                        required
                        placeholder="Tempelkan Kunci API Anda di sini (dimulai dengan AIza...)"
                        autoComplete="off"
                    />
                </div>
                {error && <p className="text-ut-red text-sm text-center">{error}</p>}
                <div>
                    <button
                        onClick={handleSubmit}
                        disabled={!apiKey.trim()}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-ut-blue transition duration-300 ease-in-out font-display disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Simpan & Aktifkan Mode PRO
                    </button>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};