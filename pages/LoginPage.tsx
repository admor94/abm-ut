import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { isApiKeyFeatureEnabled } from '../featureFlags';

interface LoginPageProps {
  onLoginSuccess: (method: 'invite' | 'apiKey', value: string, durationMs?: number, resetTimestamp?: number) => void;
  onShowInfo: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onShowInfo }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // API Key Login
    if (isApiKeyFeatureEnabled && apiKey.trim()) {
        if (apiKey.trim().startsWith('AIza') && apiKey.trim().length > 30) {
            setSuccessMessage('Berhasil');
            onLoginSuccess('apiKey', apiKey.trim());
        } else {
            setError('Kunci API Gemini sepertinya tidak valid. Harap periksa kembali.');
            setIsLoading(false);
        }
        return;
    }

    const trimmedCode = inviteCode.trim().toUpperCase();

    // Invite Code Login
    if (trimmedCode) {
        if (trimmedCode === 'RADINALLSHARE') {
            setSuccessMessage('Berhasil (Mode Pengembang)');
            onLoginSuccess('invite', trimmedCode, -1);
            return;
        }
        
        const validCodeFormatRegex = /^(?:[A-Z0-9]{5}|[A-Z0-9]{7}|[A-Z0-9]{9}|GSAID\d{5})$/;
        if (!validCodeFormatRegex.test(trimmedCode)) {
            setError('Format kode invite tidak valid atau salah.');
            setIsLoading(false);
            return;
        }

        // Generate or retrieve a unique user ID for per-user cooldown tracking
        let userId = localStorage.getItem('abmut_user_id');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('abmut_user_id', userId);
        }

        // Server-side validation with timeout
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000); // 7-second timeout

            const response = await fetch('/api/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: trimmedCode, userId: userId }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (response.ok && data.status) {
                 if (data.status === 'valid') {
                    setSuccessMessage('Berhasil');
                    onLoginSuccess('invite', trimmedCode, data.durationMs);
                } else if (data.status === 'reused') {
                    setSuccessMessage('Sesi uji coba dilanjutkan (terbatas)');
                    onLoginSuccess('invite', trimmedCode, 0, data.resetTimestamp);
                } else { // 'invalid' or other errors from backend
                    setError(data.error || 'Terjadi kesalahan validasi.');
                    setIsLoading(false);
                }
            } else {
                setError(data.error || 'Kode invite tidak ditemukan atau sudah digunakan.');
                setIsLoading(false);
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setError('Server validasi tidak merespons. Coba lagi atau periksa koneksi Anda.');
            } else {
                setError('Tidak dapat terhubung ke server validasi. Periksa koneksi internet Anda.');
            }
            setIsLoading(false);
        }
    } else {
        setError(isApiKeyFeatureEnabled ? 'Harap masukkan Kode Invite atau Kunci API Gemini.' : 'Harap masukkan Kode Invite.');
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fadeIn">
            <Logo className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display">ABM-UT</h1>
            <p className="mt-2 text-lg text-slate-300">Asisten Belajar Mahasiswa Universitas Terbuka</p>
        </div>
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="invite-code" className="block text-sm font-medium text-gray-300 font-display text-center">
                        Masuk dengan Kode Uji Coba
                    </label>
                    <input
                        type="text"
                        id="invite-code"
                        value={inviteCode}
                        onChange={(e) => { setInviteCode(e.target.value); setApiKey(''); }}
                        className="mt-2 block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ut-blue focus:border-ut-blue text-white placeholder:text-gray-500 text-center tracking-widest font-mono uppercase"
                        placeholder="KODE INVITE"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <p className="text-center text-xs text-slate-500 mt-2">Kode Uji Coba yang Anda gunakan memiliki durasi waktu. Perhatikan pengingat! Aktivitas Anda akan di reset setelah sesi berakhir.</p>
                </div>

                {isApiKeyFeatureEnabled && (
                    <>
                        <div className="flex items-center">
                            <div className="flex-grow border-t border-slate-600"></div>
                            <span className="flex-shrink mx-4 text-slate-400 font-display text-sm">ATAU</span>
                            <div className="flex-grow border-t border-slate-600"></div>
                        </div>

                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 font-display text-center">
                                Masuk dengan API KEY (Tingkat Lanjut)
                            </label>
                            <input
                                type="password"
                                id="api-key"
                                value={apiKey}
                                onChange={(e) => { setApiKey(e.target.value); setInviteCode(''); }}
                                className="mt-2 block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ut-blue focus:border-ut-blue text-white placeholder:text-gray-500 text-center"
                                placeholder="Masukkan Kunci API Gemini Anda"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <p className="text-center text-xs text-slate-500 mt-2">Kunci API Anda tidak disimpan dan hanya digunakan selama sesi Anda berlangsung. Semua Aktivitas Anda akan tersimpan otomatis di Menu Tracking.</p>
                        </div>
                    </>
                )}
                
                <div className="min-h-[20px] text-center">
                    {error && <p className="text-ut-red text-sm">{error}</p>}
                    {successMessage && <p className="text-ut-green text-sm font-bold">{successMessage}</p>}
                </div>

                <div>
                    <div className="text-center mb-4">
                        <button
                            type="button"
                            onClick={onShowInfo}
                            className="text-sm text-ut-yellow hover:text-yellow-300 transition-colors duration-200 inline-flex items-center gap-2 font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Informasi & Bantuan Aplikasi
                        </button>
                         {isApiKeyFeatureEnabled && <p className="text-xs text-slate-500 mt-2">(Termasuk panduan untuk Generate API Key)</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || (!inviteCode.trim() && !apiKey.trim())}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-ut-blue transition duration-300 ease-in-out font-display disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Memeriksa...' : 'Masuk'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};