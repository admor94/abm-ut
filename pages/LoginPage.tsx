import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { isApiKeyFeatureEnabled } from '../featureFlags';
import { INVITE_CODES } from '../constants';

interface LoginPageProps {
  onLoginSuccess: (method: 'invite' | 'apiKey', value: string, durationMs?: number, resetTimestamp?: number) => void;
  onShowInfo: () => void;
}

// Client-side validation to handle re-logins and cooldowns without a server call.
const validateInviteCode = async (code: string, userId: string): Promise<{ status: 'valid' | 'reused' | 'invalid', durationMs?: number, resetTimestamp?: number, error?: string }> => {
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // --- LOGIC FOR RE-LOGGING INTO AN ACTIVE SESSION ---
    // This allows users to log out and log back in without losing time.
    const lastExpiryRaw = localStorage.getItem('sessionExpiry');
    const lastCode = localStorage.getItem('usedInviteCode');
    if (lastCode && lastCode === code.toUpperCase() && lastExpiryRaw) {
        const lastExpiry = parseInt(lastExpiryRaw, 10);
        if (lastExpiry > Date.now()) {
            // Found an active, unexpired session for this code. Allow re-login.
            return { status: 'valid', durationMs: lastExpiry - Date.now() };
        }
    }

    // Special case for developer/unlimited codes
    const codeDetails = INVITE_CODES.find(c => c.code === code.toUpperCase());
    if (codeDetails && codeDetails.durationMinutes === -1) {
        return { status: 'valid', durationMs: -1 };
    }
    
    if (!codeDetails) {
        return { status: 'invalid', error: 'Kode invite tidak valid atau sudah digunakan.' };
    }

    // --- LOGIC FOR FRESH LOGINS & COOLDOWNS ---
    const oneDayInMs = 24 * 60 * 60 * 1000;
    try {
        const usedCodesRaw = localStorage.getItem('abmut_used_codes');
        const usedCodes = usedCodesRaw ? JSON.parse(usedCodesRaw) : {};
        
        const lastUsedTimestamp = usedCodes[code.toUpperCase()]?.[userId];

        if (lastUsedTimestamp && (Date.now() - lastUsedTimestamp < oneDayInMs)) {
            // Code has been used by this user within the last 24 hours.
            return {
                status: 'reused',
                resetTimestamp: lastUsedTimestamp + oneDayInMs
            };
        }

        // It's a fresh use or the 24-hour cooldown has expired.
        if (!usedCodes[code.toUpperCase()]) {
            usedCodes[code.toUpperCase()] = {};
        }
        usedCodes[code.toUpperCase()][userId] = Date.now();
        localStorage.setItem('abmut_used_codes', JSON.stringify(usedCodes));
        
        const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes grace period for UX
        const durationMs = (codeDetails.durationMinutes * 60 * 1000) + GRACE_PERIOD_MS;

        return {
            status: 'valid',
            durationMs: durationMs,
        };

    } catch (e) {
        console.error("Error processing used codes from localStorage", e);
        return { status: 'invalid', error: 'Terjadi kesalahan internal saat validasi kode.' };
    }
};


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
        // Generate or retrieve a unique user ID for per-user cooldown tracking
        let userId = localStorage.getItem('abmut_user_id');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('abmut_user_id', userId);
        }

        try {
            const data = await validateInviteCode(trimmedCode, userId);

            if (data.status === 'valid') {
                setSuccessMessage('Berhasil Masuk!');
                onLoginSuccess('invite', trimmedCode, data.durationMs);
            } else if (data.status === 'reused') {
                setError('Kode sudah digunakan. Coba lagi setelah masa tunggu berakhir.');
                // Trigger login but with an expired session to show the timer.
                onLoginSuccess('invite', trimmedCode, 0, data.resetTimestamp);
            } else { // 'invalid'
                setError(data.error || 'Terjadi kesalahan validasi.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Terjadi kesalahan tak terduga. Silakan coba lagi.');
            setIsLoading(false);
        }
    } else {
        setError(isApiKeyFeatureEnabled ? 'Harap masukkan Kode Uji Coba atau Kunci API Gemini.' : 'Harap masukkan Kode Uji Coba.');
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
                    <p className="text-center text-xs text-slate-500 mt-2">Kode Uji Coba memiliki durasi waktu terbatas. Aktivitas Anda tidak disimpan setelah sesi berakhir.</p>
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
                                Masuk dengan API KEY (Akses Penuh)
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
                            <p className="text-center text-xs text-slate-500 mt-2">Akses tanpa batas dan semua aktivitas Anda akan tersimpan otomatis di browser.</p>
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
