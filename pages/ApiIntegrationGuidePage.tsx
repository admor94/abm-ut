import React, { useState } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface ApiIntegrationGuidePageProps {
  setActiveView: (view: AppView) => void;
  onApiKeySubmit: (key: string) => void;
}

export const ApiIntegrationGuidePage: React.FC<ApiIntegrationGuidePageProps> = ({ setActiveView, onApiKeySubmit }) => {
  const parentView = PARENT_VIEW_MAP['Panduan Integrasi API'];
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
    <section id="Panduan-Integrasi-API" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Panduan Integrasi Kunci API</h1>
        <p className="mt-2 text-lg text-slate-300 max-w-4xl mx-auto">Langkah demi langkah untuk mendapatkan dan mengaktifkan Kunci API Google Gemini Anda.</p>
      </div>
      
      <div className="w-full max-w-4xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
        <PageHeader
          parentView={parentView}
          setActiveView={setActiveView}
        />

        <div className="mt-8 prose prose-invert prose-lg max-w-none text-slate-300 space-y-8">
            <div>
                <h3 className="text-ut-blue-light not-prose">Mengapa Menggunakan Kunci API Sendiri?</h3>
                <p>Dengan menggunakan kunci API pribadi Anda, Anda mendapatkan beberapa keuntungan:</p>
                <ul>
                    <li><strong>Akses Tanpa Batas:</strong> Gunakan semua fitur PRO tanpa batasan waktu sesi.</li>
                    <li><strong>Riwayat Belajar Tersimpan:</strong> Semua riwayat interaksi Anda akan disimpan secara otomatis di browser, tidak akan hilang setelah sesi berakhir.</li>
                    <li><strong>Privasi Penuh:</strong> Kunci API Anda hanya disimpan di browser Anda dan tidak pernah dikirim ke server kami, memastikan keamanan dan privasi.</li>
                </ul>
            </div>
            <div>
                <h3 className="text-ut-blue-light not-prose">Langkah-langkah Mendapatkan Kunci API</h3>
                <div className="not-prose my-6">
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 py-3 px-6 font-display font-medium text-white bg-ut-green hover:bg-green-500 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Buka Google AI Studio & Buat Kunci API
                    </a>
                </div>
                <ol>
                    <li>
                        <strong>Buka Google AI Studio:</strong> Kunjungi situs resmi <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio untuk Kunci API</a>. Anda akan diminta untuk masuk dengan Akun Google Anda jika belum.
                    </li>
                    <li>
                        <strong>Buat Kunci API Baru:</strong> Klik tombol yang bertuliskan <strong className="text-ut-yellow">"Create API key"</strong>. Anda mungkin akan diminta untuk menyetujui syarat dan ketentuan jika ini adalah pertama kalinya Anda.
                    </li>
                    <li>
                        <strong>Salin Kunci API:</strong> Setelah kunci dibuat, sebuah string karakter yang panjang akan muncul (biasanya diawali dengan <code>AIza...</code>). Klik ikon salin di sebelahnya untuk menyalin seluruh kunci ke clipboard Anda.
                    </li>
                    <li>
                        <strong>Kembali ke ABM-UT:</strong> Buka aplikasi ABM-UT, navigasi ke menu <strong>"Pengaturan"</strong> &gt; <strong>"Integrasi API"</strong>.
                    </li>
                    <li>
                        <strong>Tempel dan Simpan:</strong> Tempelkan kunci yang sudah Anda salin ke dalam kolom input yang tersedia dan klik tombol <strong>"Simpan & Aktifkan Mode PRO"</strong>.
                    </li>
                </ol>
                <p>Selesai! Aplikasi akan memverifikasi kunci Anda dan secara otomatis membuka semua fitur PRO dengan akses tanpa batas waktu.</p>
            </div>

            <div className="not-prose space-y-6 p-6 bg-slate-900/50 rounded-lg border border-ut-blue">
                <div>
                    <h3 className="text-xl font-bold text-white font-display text-center">Sudah Punya Kunci API?</h3>
                    <p className="text-center text-slate-300 mt-2">Masukkan Kunci API Gemini Anda di bawah ini untuk langsung mengaktifkan Mode PRO.</p>
                </div>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="api-key-input-guide" className="block text-sm font-medium text-gray-300 font-display">Kunci API Gemini Anda</label>
                        <input
                            type="password"
                            id="api-key-input-guide"
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

             <div className="p-4 bg-ut-yellow/20 border-l-4 border-ut-yellow text-yellow-200 not-prose rounded-md">
                <p className="font-bold">Penting:</p>
                <p className="text-sm">Jaga kerahasiaan Kunci API Anda. Jangan pernah membagikannya secara publik atau menyimpannya di kode yang dapat diakses umum.</p>
            </div>
        </div>
      </div>
    </section>
  );
};
