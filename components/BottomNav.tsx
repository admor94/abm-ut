import React, { useState } from 'react';
import type { AppView } from '../types';

interface BottomNavProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isLocked: boolean;
}

const parentViewMap: Partial<Record<AppView, AppView>> = {
    'Rencana Belajar': 'Kreativitas',
    'Rencana Belajar +Plus': 'Kreativitas',
    'Metode Membaca Intensif': 'Kreativitas',
    'Metode Membaca Ekstensif': 'Kreativitas',
    'Teknik Manajemen Waktu': 'Kreativitas',
    'Flashcards': 'Alat Bantu',
    'Kuis Pilihan Ganda': 'Alat Bantu',
    'Diskusi dengan ABM-UT': 'Interaktif',
    'Konsultasi Belajar ABM-UT': 'Interaktif',
    'Debat Cerdas dengan ABM-UT': 'Interaktif',
    'Teknik Feynman': 'Interaktif',
    'Ruang Kerja Kelompok Belajar': 'Interaktif',
    'Buat Rangkuman Materi': 'Alat Bantu',
    'Asisten Sitasi': 'Alat Bantu',
    'Parafrasa & Gaya Bahasa': 'Alat Bantu',
    'Perancang Argumen': 'Alat Bantu',
    'Prediksi Nilai UAS': 'Simulasi',
    'Analisis Studi Kasus': 'Simulasi',
    'Workspace Karya Ilmiah': 'Simulasi',
    'Sintesis Teori': 'Simulasi',
    'Latihan Ujian Akhir': 'Simulasi',
    'Pemahaman Materi': 'Tutorial Online',
    'Pemahaman Diskusi': 'Tutorial Online',
    'Asisten BMP': 'Tutorial Online',
    'Kalender Akademik': 'Seputar UT',
    'Informasi UT Daerah': 'Seputar UT',
    'Informasi & Layanan UT': 'Seputar UT',
    'Riwayat Belajar Mahasiswa': 'Tracking',
    'Lacak Pengingat': 'Tracking',
    'Folder Mata Kuliah': 'Tracking',
    'Integrasi API': 'Pengaturan',
    'Reset Aplikasi': 'Pengaturan',
    'FAQ': 'Informasi',
    'Panduan Integrasi API': 'Informasi',
    'Dokumentasi Pembaruan': 'Informasi',
    'Tentang Aplikasi': 'Informasi',
};


const BottomNavItem: React.FC<{
    view: AppView;
    title: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    isDisabled: boolean;
}> = ({ view, title, icon, isActive, onClick, isDisabled }) => {
    
    const colorClassMap: Partial<Record<AppView, string>> = {
      'Dashboard': 'text-ut-blue-light',
      'Kreativitas': 'text-ut-green',
      'Interaktif': 'text-ut-yellow',
      'Alat Bantu': 'text-ut-red',
      'Lainnya': 'text-slate-400',
    };

    let activeColor = colorClassMap[view as keyof typeof colorClassMap] || 'text-ut-blue-light';

    if (isActive && view === 'Lainnya') {
        activeColor = 'text-ut-blue-light';
    }

    return (
        <button
            onClick={() => !isDisabled && onClick()}
            disabled={isDisabled}
            className={`flex flex-col items-center justify-center w-1/5 h-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? activeColor : 'text-slate-400 hover:text-white'}`}
            aria-label={title}
        >
            <div className="w-6 h-6">{icon}</div>
            <span className="text-[10px] font-medium mt-1">{title}</span>
        </button>
    );
}

const OtherMenuPopup: React.FC<{
    onClose: () => void;
    setActiveView: (view: AppView) => void;
    isLocked: boolean;
}> = ({ onClose, setActiveView, isLocked }) => {
    
    const handleSelect = (view: AppView) => {
        setActiveView(view);
        onClose();
    };

    const simIsDisabled = isLocked;
    const tutonIsDisabled = isLocked;
    const trackingIsDisabled = isLocked;
    const seputarUTIsDisabled = false; // Always accessible
    const pengaturanIsDisabled = false; // Always accessible
    const infoIsDisabled = false; // Always accessible

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true"></div>
            <div className="fixed bottom-20 left-4 right-4 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-lg z-50 p-2 border border-slate-700 animate-slide-up">
                <ul className="space-y-1">
                    <li>
                        <button 
                            onClick={() => !simIsDisabled && handleSelect('Simulasi')}
                            disabled={simIsDisabled}
                            className="w-full flex items-center gap-3 p-3 text-left rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <div className="w-6 h-6 flex-shrink-0 text-ut-green"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></div>
                           <span className="font-display font-semibold">Simulasi & Riset</span>
                        </button>
                    </li>
                     <li>
                        <button 
                            onClick={() => !tutonIsDisabled && handleSelect('Tutorial Online')}
                            disabled={tutonIsDisabled}
                            className="w-full flex items-center gap-3 p-3 text-left rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <div className="w-6 h-6 flex-shrink-0 text-ut-yellow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg></div>
                           <span className="font-display font-semibold">Tutorial Online</span>
                        </button>
                    </li>
                     <li>
                        <button 
                            onClick={() => !trackingIsDisabled && handleSelect('Tracking')}
                            disabled={trackingIsDisabled}
                            className="w-full flex items-center gap-3 p-3 text-left rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <div className="w-6 h-6 flex-shrink-0 text-ut-blue-light"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.091 12a3.091 3.091 0 10-6.182 0 3.091 3.091 0 006.182 0z" /></svg></div>
                           <span className="font-display font-semibold">Pelacakan</span>
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={() => !seputarUTIsDisabled && handleSelect('Seputar UT')}
                            disabled={seputarUTIsDisabled}
                            className="w-full flex items-center gap-3 p-3 text-left rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <div className="w-6 h-6 flex-shrink-0 text-ut-blue-light"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg></div>
                           <span className="font-display font-semibold">Seputar UT</span>
                        </button>
                    </li>
                     <li>
                        <button 
                            onClick={() => !pengaturanIsDisabled && handleSelect('Pengaturan')}
                            disabled={pengaturanIsDisabled}
                            className="w-full flex items-center gap-3 p-3 text-left rounded-lg text-white hover:bg-slate-700 disabled:opacity-50"
                        >
                           <div className="w-6 h-6 flex-shrink-0 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg></div>
                           <span className="font-display font-semibold">Pengaturan</span>
                        </button>
                    </li>
                     <li>
                        <button 
                            onClick={() => !infoIsDisabled && handleSelect('Informasi')}
                            disabled={infoIsDisabled}
                            className="w-full flex items-center gap-3 p-3 text-left rounded-lg text-white hover:bg-slate-700 disabled:opacity-50"
                        >
                           <div className="w-6 h-6 flex-shrink-0 text-ut-yellow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg></div>
                           <span className="font-display font-semibold">Informasi & Bantuan</span>
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, isLocked }) => {
    const [isOtherMenuOpen, setIsOtherMenuOpen] = useState(false);
    
    const activeParent = parentViewMap[activeView] || activeView;

    const navItems: { view: AppView, title: string, icon: React.ReactNode }[] = [
        { view: 'Kreativitas', title: 'Metode', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-7.5 0C4.508 19.64 2.25 15.223 2.25 10.5c0-1.09.117-2.155.33-3.182m19.14 3.182c.213 1.027.33 2.092.33 3.182 0 4.723-2.258 9.14-5.649 11.642M12 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
        { view: 'Interaktif', title: 'Interaktif', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
        { view: 'Dashboard', title: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
        { view: 'Alat Bantu', title: 'Alat Bantu', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 01-1.622 3.385m-5.043-.025a15.998 15.998 0 00-3.388-1.62m7.869 5.043A15.998 15.998 0 0119.5 12a15.998 15.998 0 01-3.388-1.62m-7.869-5.043A15.998 15.998 0 0012 4.5c-2.446 0-4.728.666-6.612 1.834m13.224 0A15.998 15.998 0 0112 19.5c-2.446 0-4.728-.666-6.612-1.834m-13.224 0c-1.168-.667-2.254-1.518-3.186-2.521m16.392 2.521c-.932 1.003-2.018 1.854-3.186 2.521m0 0A15.998 15.998 0 0112 4.5c2.446 0 4.728.666 6.612 1.834m-13.224 0c-1.168-.667-2.254-1.518-3.186-2.521m16.392 2.521c-.932 1.003-2.018 1.854-3.186 2.521" /></svg> },
        { view: 'Lainnya', title: 'Lainnya', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg> },
    ];
    
    const isLainnyaActive = ['Simulasi', 'Tutorial Online', 'Tracking', 'Seputar UT', 'Pengaturan', 'Informasi'].includes(activeParent);

    return (
        <div>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-sm z-40 flex justify-around items-center border-t border-slate-700/50">
                {navItems.map(item => (
                    <BottomNavItem
                        key={item.view}
                        {...item}
                        isActive={activeParent === item.view || (item.view === 'Lainnya' && (isOtherMenuOpen || isLainnyaActive))}
                        onClick={() => {
                            if (item.view === 'Lainnya') {
                                setIsOtherMenuOpen(true);
                            } else {
                                setActiveView(item.view);
                            }
                        }}
                        isDisabled={isLocked && item.view !== 'Dashboard' && item.view !== 'Lainnya'}
                    />
                ))}
            </nav>
            {isOtherMenuOpen && <OtherMenuPopup onClose={() => setIsOtherMenuOpen(false)} setActiveView={setActiveView} isLocked={isLocked} />}
        </div>
    );
};
