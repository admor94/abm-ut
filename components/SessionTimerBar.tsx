import React, { useState, useEffect } from 'react';

interface SessionTimerBarProps {
  expiryTimestamp: number | null;
  resetTimestamp: number | null;
  inviteCode: string;
}

const formatTimeLeft = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const SessionTimerBar: React.FC<SessionTimerBarProps> = ({ expiryTimestamp, resetTimestamp, inviteCode }) => {
    const [timeLeft, setTimeLeft] = useState(expiryTimestamp ? expiryTimestamp - Date.now() : -1);

    useEffect(() => {
        const interval = setInterval(() => {
             if (expiryTimestamp) {
                setTimeLeft(expiryTimestamp - Date.now());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryTimestamp]);

    if (timeLeft > 0) {
        return (
            <div className="fixed bottom-20 md:bottom-0 left-0 md:left-64 right-0 bg-ut-red/90 text-white text-xs md:text-sm p-2 text-center z-40 backdrop-blur-sm shadow-lg">
                Sesi Uji Coba Anda dengan kode <strong>[{inviteCode}]</strong> akan berakhir dalam <strong className="font-mono text-base align-middle">[{formatTimeLeft(timeLeft)}]</strong>. Silahkan unduh semua materi Anda sebelum direset otomatis oleh sistem ketika sesi berakhir.
            </div>
        );
    }
    
    if (resetTimestamp && resetTimestamp > Date.now()) {
        const timeUntilReset = resetTimestamp - Date.now();
         return (
            <div className="fixed bottom-20 md:bottom-0 left-0 md:left-64 right-0 bg-slate-700/90 text-white text-xs md:text-sm p-2 text-center z-40 backdrop-blur-sm shadow-lg">
                Sesi Uji Coba Anda dengan kode <strong>[{inviteCode}]</strong> telah berakhir. Fitur PRO terkunci. Anda dapat menggunakan kode ini lagi dalam <strong className="font-mono text-base align-middle">[{formatTimeLeft(timeUntilReset)}]</strong>.
            </div>
        );
    }

    return null;
};
