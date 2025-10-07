import React, { useState, useEffect } from 'react';

interface SessionStatusIconProps {
  loginMethod: 'invite' | 'apiKey' | null;
  expiryTimestamp: number | null;
  resetTimestamp: number | null;
  inviteCode: string | null;
}

const formatTimeLeft = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const SessionStatusIcon: React.FC<SessionStatusIconProps> = ({ loginMethod, expiryTimestamp, resetTimestamp, inviteCode }) => {
    const [timeLeft, setTimeLeft] = useState(expiryTimestamp ? expiryTimestamp - Date.now() : -1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (loginMethod !== 'invite' || !expiryTimestamp) return;

        const interval = setInterval(() => {
            setTimeLeft(expiryTimestamp - Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryTimestamp, loginMethod]);

    const minutesLeft = timeLeft / (1000 * 60);
    
    // Determine Icon Style and Modal Content
    let icon: React.ReactNode;
    let iconColorClass = 'text-slate-400 hover:text-white';
    let animationClass = '';
    let modalTitle = 'Status Sesi';
    let modalContent = '';

    if (loginMethod === 'apiKey') {
        icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        iconColorClass = 'text-ut-green';
        modalTitle = "Mode PRO Aktif (API Key)";
        modalContent = `<p>Anda menggunakan Kunci API pribadi Anda.</p><p class="my-4">Anda memiliki <strong>akses penuh tanpa batas waktu</strong>, dan semua riwayat belajar akan disimpan secara otomatis di browser ini.</p>`;
    } else if (loginMethod === 'invite') {
        if (inviteCode === 'RADINALLSHARE') {
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
            iconColorClass = 'text-ut-yellow';
            modalTitle = "Mode Pengembang Aktif";
            modalContent = `<p>Anda menggunakan kode akses pengembang.</p><p class="my-4">Anda memiliki <strong>akses penuh tanpa batas waktu</strong>. Riwayat belajar Anda disimpan di browser untuk sesi ini.</p>`;
        } else {
            // Standard invite code logic
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
            if (timeLeft > 0) {
                 if (minutesLeft < 5) {
                    iconColorClass = 'text-ut-red';
                    animationClass = 'animate-bounce';
                } else if (minutesLeft < 15) {
                    iconColorClass = 'text-ut-yellow';
                }
                modalTitle = "Sesi Uji Coba Aktif";
                modalContent = `<p>Anda menggunakan kode <strong>[${inviteCode}]</strong>.</p><p class="my-4">Sisa waktu sesi Anda: <strong class="font-mono text-xl text-white">${formatTimeLeft(timeLeft)}</strong></p><p class="text-sm text-yellow-300">Penting: Harap unduh semua materi yang Anda butuhkan sebelum sesi berakhir. Aktivitas tidak disimpan dalam mode uji coba.</p>`;
            } else if (resetTimestamp && resetTimestamp > Date.now()) {
                const timeUntilReset = resetTimestamp - Date.now();
                iconColorClass = 'text-ut-red';
                modalTitle = "Sesi Uji Coba Berakhir";
                modalContent = `<p>Sesi Anda dengan kode <strong>[${inviteCode}]</strong> telah berakhir.</p><p class="my-4">Fitur PRO sekarang terkunci. Anda dapat menggunakan kembali kode ini dalam: <strong class="font-mono text-xl text-white">${formatTimeLeft(timeUntilReset)}</strong></p><p class="text-sm text-slate-400">Untuk akses tanpa batas, pertimbangkan menggunakan Kunci API Gemini pribadi Anda.</p>`;
            }
        }
    }

    if (!modalContent) return null;

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`fixed top-16 md:top-4 right-4 z-[60] p-2 rounded-full bg-slate-800/50 backdrop-blur-sm transition-colors duration-300 ${iconColorClass}`}
                aria-label="Tampilkan status sesi"
            >
                <div className={animationClass}>{icon}</div>
            </button>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4" role="dialog" aria-modal="true" aria-labelledby="session-status-title">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-slate-700 relative">
                        <h3 id="session-status-title" className="text-xl font-semibold font-display text-white mb-4">{modalTitle}</h3>
                        
                        <div className="text-slate-300 space-y-2" dangerouslySetInnerHTML={{ __html: modalContent }} />
                        
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-white"
                            aria-label="Tutup"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
