import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppView, StudentData, ChatMessage, LearningHistoryEntry, PersonalFolder } from './types';
import { HUB_PAGES_DATA } from './constants';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { HubPage } from './pages/HubPage';
import { GenericChatPage } from './pages/GenericChatPage';
import { LearningHistory } from './pages/LearningHistory';
import { ReminderTrackerPage } from './pages/ReminderTrackerPage';
import { IntensiveReadingPage } from './pages/IntensiveReadingPage';
import { ExtensiveReadingPage } from './pages/ExtensiveReadingPage';
import { TimeManagementPage } from './pages/TimeManagementPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { QuizPage } from './pages/QuizPage';
import { DebatePage } from './pages/DebatePage';
import { FeynmanPage } from './pages/FeynmanPage';
import { SummaryPage } from './pages/SummaryPage';
import { CitationAssistantPage } from './pages/CitationAssistantPage';
import { ParaphrasePage } from './pages/ParaphrasePage';
import { ArgumentDesignerPage } from './pages/ArgumentDesignerPage';
import { CaseStudyAnalysisPage } from './pages/CaseStudyAnalysisPage';
import { WorkspaceKarilPage } from './pages/WorkspaceKarilPage';
import { TheorySynthesisPage } from './pages/TheorySynthesisPage';
import { ExamPrepPage } from './pages/ExamPrepPage';
import { FaqPage } from './pages/FaqPage';
import { UpdateDocsPage } from './pages/UpdateDocsPage';
import { AboutPage } from './pages/AboutPage';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { AcademicCalendarPage } from './pages/AcademicCalendarPage';
import { UtDaerahPage } from './pages/UtDaerahPage';
import { InformasiLayananUtPage } from './pages/InformasiLayananUtPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { StudyPlanPlusPage } from './pages/StudyPlanPlusPage';
import { LoginPage } from './pages/LoginPage';
import { PemahamanMateriPage } from './pages/PemahamanMateriPage';
import { PemahamanDiskusiPage } from './pages/PemahamanDiskusiPage';
import { initializeAi, createPeranPrompt } from './services/geminiService';
import { ApiIntegrationPage } from './pages/ApiIntegrationPage';
import { ResetAppPage } from './pages/ResetAppPage';
import { CourseFolderPage } from './pages/CourseFolderPage';
import { PersonalFolderPage } from './pages/PersonalFolderPage';
import { AsistenBmpPage } from './pages/AsistenBmpPage';
import { PrediksiNilaiPage } from './pages/PrediksiNilaiPage';
import { GroupStudyWorkspacePage } from './pages/GroupStudyWorkspacePage';
import { SessionStatusIcon } from './components/SessionTimerBar';
import { ApiIntegrationGuidePage } from './pages/ApiIntegrationGuidePage';
import { PreLoginInfoPage } from './pages/PreLoginInfoPage';
import { PanduanUtPage } from './pages/PanduanUtPage';
import { AdvancedSettingsPage } from './pages/AdvancedSettingsPage';
import { EksperimentalPage } from './pages/EksperimentalPage';
import { isApiKeyFeatureEnabled } from './featureFlags';
import { ReferensiAkademikPage } from './pages/ReferensiAkademikPage';


const CHAT_SYSTEM_PROMPTS: Record<string, { description: string; prompt: string }> = {
    'Diskusi dengan ABM-UT': {
        description: 'Diskusikan topik atau materi apa pun secara mendalam dengan ABM-UT.',
        prompt: "Anda adalah ABM-UT, asisten diskusi yang santai. Sapa mahasiswa dengan ramah dan tanyakan apa yang ingin mereka diskusikan hari ini. Jadilah teman bicara yang cerdas dan penuh rasa ingin tahu. Sajikan jawaban yang sangat terstruktur, jelas, dan mudah dibaca menggunakan Markdown. Gunakan heading, sub-heading, poin-poin (bullet points), dan teks tebal (**teks tebal**) untuk menyoroti konsep-konsep kunci. Pastikan ada spasi yang cukup antar paragraf untuk keterbacaan maksimal."
    },
    'Konsultasi Belajar ABM-UT': {
        description: 'Dapatkan bimbingan dan wawasan dari ABM-UT yang berperan sebagai mentor berpengalaman di bidang studi Anda.',
        prompt: 'Anda adalah ABM-UT, berperan sebagai mentor/konsultan belajar akademik. Fokuslah secara spesifik pada mata kuliah, kesulitan belajar, dan strategi studi. Berikan saran, strategi belajar, dan wawasan berdasarkan kesulitan atau pertanyaan mahasiswa. Posisikan diri Anda sebagai kakak tingkat atau dosen yang suportif dan profesional. Sajikan jawaban yang sangat terstruktur, jelas, dan mudah dibaca menggunakan Markdown. Gunakan heading, sub-heading, poin-poin (bullet points), dan teks tebal (**teks tebal**) untuk menyoroti konsep-konsep kunci. Pastikan ada spasi yang cukup antar paragraf untuk keterbacaan maksimal.'
    },
    'Pemahaman Diskusi': {
        description: 'Lanjutkan pemahaman materi dengan sesi diskusi interaktif bersama ABM-UT.',
        prompt: 'Anda adalah ABM-UT, seorang partner diskusi. Mulai percakapan berdasarkan materi yang telah dianalisis.' // This is a placeholder; the actual prompt is generated dynamically.
    }
};

const PRO_FEATURES: AppView[] = [
    'Rencana Belajar',
    'Rencana Belajar +Plus',
    'Flashcards',
    'Kuis Pilihan Ganda',
    'Buat Rangkuman Materi',
    'Analisis Studi Kasus',
    'Workspace Karya Ilmiah',
    'Sintesis Teori',
    'Latihan Ujian Akhir',
    'Pemahaman Materi',
    'Pemahaman Diskusi',
    'Asisten BMP',
    'Prediksi Nilai UAS',
    'Ruang Kerja Kelompok Belajar',
    'Debat Cerdas dengan ABM-UT',
    'Teknik Feynman',
    'Parafrasa & Gaya Bahasa',
    'Perancang Argumen',
    'Asisten Sitasi',
    'Eksperimental',
];

const FeatureLockPrompt: React.FC<{ setActiveView: (view: AppView) => void }> = ({ setActiveView }) => {
    return (
         <section className="min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center">
                <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-ut-red/50">
                    <h2 className="text-3xl font-bold text-white font-display mb-4">Sesi Uji Coba Berakhir</h2>
                    <p className="text-slate-300 mb-6">
                        Sesi uji coba Anda telah berakhir. Fitur ini dan fitur PRO lainnya sekarang terkunci. Untuk melanjutkan akses tanpa batas, silakan gunakan Kunci API Gemini Anda sendiri.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => setActiveView('Integrasi API')}
                            className="px-6 py-3 bg-ut-blue hover:bg-ut-blue-light rounded-lg font-semibold transition-colors"
                        >
                            Ke Halaman Integrasi API
                        </button>
                        <button
                            onClick={() => setActiveView('Dashboard')}
                            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ExclusiveFeaturePrompt: React.FC<{ setActiveView: (view: AppView) => void; featureName: string; }> = ({ setActiveView, featureName }) => (
    <section className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
            <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-ut-yellow/50">
                <h2 className="text-3xl font-bold text-white font-display mb-4">Fitur Eksklusif</h2>
                <p className="text-slate-300 mb-6">
                    Fitur "{featureName}" hanya tersedia untuk pengguna dengan akses khusus (Developer & Pengguna Eksklusif).
                </p>
                <button
                    onClick={() => setActiveView('Dashboard')}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    </section>
);


const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showPreLoginInfo, setShowPreLoginInfo] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'invite' | 'apiKey' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [activeView, setActiveView] = useState<AppView>('Dashboard');
    const [learningHistory, setLearningHistory] = useState<LearningHistoryEntry[]>([]);
    const [personalFolders, setPersonalFolders] = useState<PersonalFolder[]>([]);
    const [studyEndTime, setStudyEndTime] = useState<number | null>(null);
    const [sessionToContinue, setSessionToContinue] = useState<LearningHistoryEntry | null>(null);
    const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
    const [usedInviteCode, setUsedInviteCode] = useState<string | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [sessionResetTimestamp, setSessionResetTimestamp] = useState<number | null>(null);

    // New states for session end warning
    const [showSessionEndWarning, setShowSessionEndWarning] = useState(false);
    const warningTimerRef = useRef<number | null>(null);
    const logoutTimerRef = useRef<number | null>(null);


    // Scroll progress bar logic
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (windowHeight > 0) {
                const scroll = (totalScroll / windowHeight) * 100;
                setScrollProgress(scroll);
            } else {
                setScrollProgress(0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const loggedInStatus = localStorage.getItem('isLoggedIn');
            const savedLoginMethod = localStorage.getItem('loginMethod') as 'invite' | 'apiKey' | null;
            
            if (loggedInStatus === 'true' && savedLoginMethod) {
                setIsLoggedIn(true);
                setLoginMethod(savedLoginMethod);
                
                if (savedLoginMethod === 'apiKey' && isApiKeyFeatureEnabled) {
                    const savedApiKey = localStorage.getItem('geminiApiKey');
                    if (savedApiKey) {
                        initializeAi(savedApiKey, 'apiKey');
                    }
                } else { // 'invite' method
                    initializeAi(null, 'invite');
                    const savedExpiry = localStorage.getItem('sessionExpiry');
                    const savedInviteCode = localStorage.getItem('usedInviteCode');
                    const savedResetTimestamp = localStorage.getItem('sessionResetTimestamp');

                    if (savedExpiry && savedInviteCode) {
                        const expiryTime = Number(savedExpiry);
                        setSessionExpiry(expiryTime);
                        setUsedInviteCode(savedInviteCode);
                    }
                    if (savedResetTimestamp) {
                        setSessionResetTimestamp(Number(savedResetTimestamp));
                    }
                }
            }

            const savedStudentData = localStorage.getItem('studentData');
            const savedInviteCodeOnLoad = localStorage.getItem('usedInviteCode');
            const isProInviteUser = savedInviteCodeOnLoad === 'RADINALLSHARE' || savedInviteCodeOnLoad === 'ADMOR94';

            // For invite mode, history is not persisted across reloads, unless it's a pro user.
            if (savedLoginMethod === 'apiKey' || (savedLoginMethod === 'invite' && isProInviteUser)) {
                const savedHistory = localStorage.getItem('learningHistory');
                 if (savedHistory) {
                    setLearningHistory(JSON.parse(savedHistory));
                }
                const savedFolders = localStorage.getItem('personalFolders');
                if (savedFolders) {
                    setPersonalFolders(JSON.parse(savedFolders));
                }
            }
            
            if (savedStudentData) {
                const parsedData = JSON.parse(savedStudentData);
                setStudentData(parsedData);
                if (parsedData.studyTimeStart && parsedData.studyTimeEnd) {
                    const [endH, endM] = parsedData.studyTimeEnd.split(':').map(Number);
                    const now = new Date();
                    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
                    if (end.getTime() < now.getTime()) {
                       end.setDate(end.getDate() + 1);
                    }
                    setStudyEndTime(end.getTime());
                }
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            if (isLoggedIn) {
                localStorage.setItem('isLoggedIn', 'true');
                if(loginMethod) localStorage.setItem('loginMethod', loginMethod);
            } else {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loginMethod');
                localStorage.removeItem('geminiApiKey');
                // Do NOT remove sessionExpiry, usedInviteCode, or sessionResetTimestamp on logout
                // so the user can log back in.
            }
            if (studentData) {
                localStorage.setItem('studentData', JSON.stringify(studentData));
            } else {
                localStorage.removeItem('studentData');
            }
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [isLoggedIn, loginMethod, studentData]);

    useEffect(() => {
        try {
            const isProInviteUser = usedInviteCode === 'RADINALLSHARE' || usedInviteCode === 'ADMOR94';
            // Only save history if in apiKey mode or pro invite mode
            if(loginMethod === 'apiKey' || (loginMethod === 'invite' && isProInviteUser)) {
                localStorage.setItem('learningHistory', JSON.stringify(learningHistory));
                localStorage.setItem('personalFolders', JSON.stringify(personalFolders));
            }
        } catch (error) {
            console.error("Failed to save learning history/folders to localStorage", error);
        }
    }, [learningHistory, personalFolders, loginMethod, usedInviteCode]);

    useEffect(() => { window.scrollTo(0, 0); }, [activeView]);
    
    // Auto-logout without confirmation
    const handleForceLogout = useCallback(() => {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
    }, []);

    const handleLogout = useCallback(() => {
        // Per user request, the confirmation dialog is removed for immediate logout.
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        handleForceLogout();
    }, [handleForceLogout]);

    // Timer setup effect for session end warning
    useEffect(() => {
        // Always clear previous timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        if (isLoggedIn && studentData && studyEndTime) {
            const now = Date.now();
            const twoMinutesInMs = 2 * 60 * 1000;
            const warningTimestamp = studyEndTime - twoMinutesInMs;
            
            // Schedule the warning modal
            if (warningTimestamp > now) {
                warningTimerRef.current = setTimeout(() => {
                    setShowSessionEndWarning(true);
                }, warningTimestamp - now) as unknown as number;
            }

            // Schedule the final auto-logout
            if (studyEndTime > now) {
                logoutTimerRef.current = setTimeout(() => {
                    handleForceLogout();
                }, studyEndTime - now) as unknown as number;
            }
        }

        // Cleanup on unmount
        return () => {
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, [isLoggedIn, studentData, studyEndTime, handleForceLogout]);

    const handleExtendSession = (minutes: number) => {
        const newEndTime = (studyEndTime || Date.now()) + minutes * 60 * 1000;
        setStudyEndTime(newEndTime);
        setShowSessionEndWarning(false);
        // The useEffect will automatically clear old timers and set new ones.
    };

    const handleLoginSuccess = (method: 'invite' | 'apiKey', value: string, durationMs?: number, resetTimestamp?: number) => {
        if (method === 'apiKey' && value && isApiKeyFeatureEnabled) {
            localStorage.setItem('geminiApiKey', value);
            initializeAi(value, 'apiKey');
            setLoginMethod('apiKey');
            setSessionExpiry(null);
            setUsedInviteCode(null);
            localStorage.removeItem('sessionExpiry');
            localStorage.removeItem('usedInviteCode');
            localStorage.removeItem('sessionResetTimestamp');
            setSessionResetTimestamp(null);
        } else if (method === 'invite' && value) {
            const upperCaseValue = value.toUpperCase();
            localStorage.removeItem('geminiApiKey');
            initializeAi(null, 'invite');
            setLoginMethod('invite');

            const isProInviteUser = upperCaseValue === 'RADINALLSHARE' || upperCaseValue === 'ADMOR94';
            
            if (upperCaseValue === 'RADINALLSHARE') {
                const radinalData: StudentData = {
                    name: 'Radinal Simamora',
                    faculty: 'Fakultas Hukum Ilmu Sosial dan Ilmu Politik (FHISIP)',
                    studyProgram: 'Sosiologi',
                    semester: 8,
                    isWorking: false,
                    studySituation: 'Malam',
                    studyTimeStart: '23:00',
                    studyTimeEnd: '03:00',
                    studyDuration: 4 * 60 * 60 * 1000,
                };
                setStudentData(radinalData);
                
                // Also set study end time
                const [endH, endM] = radinalData.studyTimeEnd.split(':').map(Number);
                const now = new Date();
                let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
                if (end < now) { end.setDate(end.getDate() + 1); } // Handle next day
                setStudyEndTime(end.getTime());
            }

            if (isProInviteUser) {
                 // Logic for all pro invite users (RADINALLSHARE, ADMOR94)
                 if (durationMs === -1) { // Unlimited
                    setSessionExpiry(null);
                    localStorage.removeItem('sessionExpiry');
                } else if (durationMs) { // Timed Pro (ADMOR94)
                    const expiryTime = Date.now() + durationMs;
                    setSessionExpiry(expiryTime);
                    localStorage.setItem('sessionExpiry', String(expiryTime));
                }
                localStorage.removeItem('sessionResetTimestamp');
                setSessionResetTimestamp(null);
                
                // Persist/load history for pro invite users
                const savedHistory = localStorage.getItem('learningHistory');
                if (savedHistory) {
                   setLearningHistory(JSON.parse(savedHistory));
                }
                 const savedFolders = localStorage.getItem('personalFolders');
                if (savedFolders) {
                    setPersonalFolders(JSON.parse(savedFolders));
                }

            } else {
                 // Logic for regular, timed invite codes
                 if (durationMs && durationMs > 0) { // Fresh, timed session
                    const expiryTime = Date.now() + durationMs;
                    setSessionExpiry(expiryTime);
                    localStorage.setItem('sessionExpiry', String(expiryTime));
                    localStorage.removeItem('sessionResetTimestamp');
                    setSessionResetTimestamp(null);
                } else { // Reused code, durationMs is 0 or undefined
                    setSessionExpiry(Date.now() - 1); // Immediately expired
                    localStorage.setItem('sessionExpiry', String(Date.now() - 1));
                    if (resetTimestamp) {
                        setSessionResetTimestamp(resetTimestamp);
                        localStorage.setItem('sessionResetTimestamp', String(resetTimestamp));
                    }
                }
                
                // Clear any previous history from PRO mode
                setLearningHistory([]);
                localStorage.removeItem('learningHistory');
                setPersonalFolders([]);
                localStorage.removeItem('personalFolders');
            }

            setUsedInviteCode(upperCaseValue);
            localStorage.setItem('usedInviteCode', upperCaseValue);
        }
        setIsLoggedIn(true);
    };
    
    const handleApiKeySubmit = (key: string) => {
        if (!isApiKeyFeatureEnabled) {
            alert('Fitur Kunci API sedang dinonaktifkan.');
            return;
        }
        localStorage.setItem('geminiApiKey', key); // Persist the key
        initializeAi(key, 'apiKey');
        setLoginMethod('apiKey');
        alert('Kunci API berhasil diaktifkan! Semua fitur PRO sekarang terbuka.');
        setActiveView('Dashboard');
    };

    const handleProfileSubmit = (data: StudentData) => {
        setStudentData(data);
        const [endH, endM] = data.studyTimeEnd.split(':').map(Number);
        const now = new Date();
        let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
        if (end < now) { end.setDate(end.getDate() + 1); }
        setStudyEndTime(end.getTime());
    };

    const addLearningHistory = useCallback((conversation: ChatMessage[], view: AppView, topic: string, systemPrompt: string, courseName?: string) => {
        if (conversation.length === 0) return;

        // Check if an entry with a similar ID already exists to get its folderId
        const potentialId = `${new Date().toISOString()}-${topic}`;
        const existingEntry = learningHistory.find(e => e.id.endsWith(topic));

        const newEntry: LearningHistoryEntry = {
            id: potentialId,
            view, topic,
            date: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
            conversation, systemPrompt, courseName,
            folderId: existingEntry?.folderId, // Preserve folderId on update
        };
        setLearningHistory(prev => {
            const existingIndex = prev.findIndex(e => e.id === newEntry.id || e.topic === newEntry.topic && e.view === newEntry.view);
            if (existingIndex !== -1) {
                const updatedHistory = [...prev];
                updatedHistory[existingIndex] = { ...updatedHistory[existingIndex], ...newEntry };
                return updatedHistory;
            }
            return [newEntry, ...prev];
        });
    }, [learningHistory]);
    
    const deleteHistoryEntry = useCallback((id: string) => {
        setLearningHistory(prev => prev.filter(entry => entry.id !== id));
    }, []);

    const handleContinueSession = (entry: LearningHistoryEntry) => {
        setSessionToContinue(entry);
        setActiveView(entry.view);
    };
    
    const handleAddFolder = (name: string) => {
        if (name.trim() === '') return;
        const newFolder: PersonalFolder = { id: uuidv4(), name: name.trim() };
        setPersonalFolders(prev => [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleDeleteFolder = (id: string) => {
        if (window.confirm("Menghapus folder ini juga akan mengeluarkan semua riwayat di dalamnya. Lanjutkan?")) {
            setPersonalFolders(prev => prev.filter(f => f.id !== id));
            // Also remove folderId from any history items
            setLearningHistory(prev => prev.map(h => h.folderId === id ? { ...h, folderId: undefined } : h));
        }
    };

    const handleAssignHistoryToFolder = (historyId: string, folderId: string | null) => {
        setLearningHistory(prev => prev.map(h => {
            if (h.id === historyId) {
                return { ...h, folderId: folderId ?? undefined };
            }
            return h;
        }));
    };


    if (isLoading) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">Memuat Aplikasi...</div>;
    }

    if (!isLoggedIn) {
        if (showPreLoginInfo) {
            return <PreLoginInfoPage onBackToLogin={() => setShowPreLoginInfo(false)} onLoginSuccess={handleLoginSuccess}/>;
        }
        return <LoginPage onLoginSuccess={handleLoginSuccess} onShowInfo={() => setShowPreLoginInfo(true)} />;
    }

    const isLocked = !studentData;
    const hubPageKeys = Object.keys(HUB_PAGES_DATA) as AppView[];

    const renderView = () => {
        const informationalViews: AppView[] = [ 'Pengaturan & Bantuan', 'FAQ', 'Dokumentasi Pembaruan', 'Tentang Aplikasi', 'Kalender Akademik', 'Informasi UT Daerah', 'Informasi & Layanan UT', 'Referensi Akademik', 'Integrasi API', 'Panduan Integrasi API', 'Reset Aplikasi', 'Pengaturan', 'Panduan Lengkap UT', 'Pengaturan Lanjutan' ];
        const isInformationalView = informationalViews.includes(activeView);

        if (isLocked && !isInformationalView && activeView !== 'Dashboard' && activeView !== 'Riwayat & Pelacakan' && activeView !== 'Riwayat Belajar Mahasiswa' && activeView !== 'Lacak Pengingat') {
            setActiveView('Dashboard');
            return <Dashboard studentData={null} onProfileSubmit={handleProfileSubmit} setActiveView={setActiveView} studyEndTime={null} onLogout={handleLogout} />;
        }
        
        const isProFeature = PRO_FEATURES.includes(activeView);
        const isTrialExpired = loginMethod === 'invite' && usedInviteCode !== 'RADINALLSHARE' && usedInviteCode !== 'ADMOR94' && sessionExpiry != null && Date.now() >= sessionExpiry;

        if (isProFeature && isTrialExpired) {
            return <FeatureLockPrompt setActiveView={setActiveView} />;
        }
        
        if (hubPageKeys.includes(activeView)) {
          const hubData = HUB_PAGES_DATA[activeView as keyof typeof HUB_PAGES_DATA];
          return <HubPage id={activeView} {...hubData} setActiveView={setActiveView} />;
        }

        const initialSessionData = sessionToContinue;
        if(initialSessionData && initialSessionData.view !== activeView){
            setSessionToContinue(null);
        }

        switch (activeView) {
            case 'Dashboard':
                return <Dashboard studentData={studentData} onProfileSubmit={handleProfileSubmit} setActiveView={setActiveView} studyEndTime={studyEndTime} onLogout={handleLogout} />;
            case 'Rencana Belajar':
                return <StudyPlanPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Rencana Belajar +Plus':
                return <StudyPlanPlusPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Metode Membaca Intensif':
                return <IntensiveReadingPage setActiveView={setActiveView} />;
            case 'Metode Membaca Ekstensif':
                return <ExtensiveReadingPage setActiveView={setActiveView} />;
            case 'Teknik Manajemen Waktu':
                return <TimeManagementPage setActiveView={setActiveView} />;
            case 'Flashcards':
                return <FlashcardsPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Kuis Pilihan Ganda':
                return <QuizPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Debat Cerdas dengan ABM-UT':
                return <DebatePage studentData={studentData} onSessionComplete={addLearningHistory} setActiveView={setActiveView} initialData={initialSessionData?.view === activeView ? initialSessionData : undefined} />;
            case 'Teknik Feynman':
                return <FeynmanPage studentData={studentData} onSessionComplete={addLearningHistory} setActiveView={setActiveView} initialData={initialSessionData?.view === activeView ? initialSessionData : undefined}/>;
            case 'Ruang Kerja Kelompok Belajar':
                 return <GroupStudyWorkspacePage studentData={studentData} onSessionComplete={addLearningHistory} setActiveView={setActiveView} initialData={initialSessionData?.view === activeView ? initialSessionData : undefined}/>;
            case 'Buat Rangkuman Materi':
                 return <SummaryPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Asisten Sitasi':
                 return <CitationAssistantPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Parafrasa & Gaya Bahasa':
                 return <ParaphrasePage studentData={studentData} setActiveView={setActiveView} />;
            case 'Perancang Argumen':
                 return <ArgumentDesignerPage studentData={studentData} onSessionComplete={addLearningHistory} setActiveView={setActiveView} initialData={initialSessionData?.view === activeView ? initialSessionData : undefined}/>;
            case 'Prediksi Nilai UAS':
                return <PrediksiNilaiPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Analisis Studi Kasus':
                return <CaseStudyAnalysisPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Workspace Karya Ilmiah':
                return <WorkspaceKarilPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Sintesis Teori':
                return <TheorySynthesisPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Latihan Ujian Akhir':
                return <ExamPrepPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Pemahaman Materi':
                return <PemahamanMateriPage studentData={studentData} setActiveView={setActiveView} onContinueToDiscussion={handleContinueSession} />;
            case 'Pemahaman Diskusi':
                return <PemahamanDiskusiPage studentData={studentData} setActiveView={setActiveView} onSessionComplete={addLearningHistory} initialData={initialSessionData?.view === activeView ? initialSessionData : undefined} />;
            case 'Asisten BMP':
                return <AsistenBmpPage studentData={studentData} setActiveView={setActiveView} onSessionComplete={addLearningHistory} initialData={initialSessionData?.view === activeView ? initialSessionData : undefined} />;
            case 'Eksperimental':
                const isAllowedExperimental = usedInviteCode === 'RADINALLSHARE' || usedInviteCode === 'ADMOR94';
                if (!isAllowedExperimental) {
                    return <ExclusiveFeaturePrompt setActiveView={setActiveView} featureName="Eksperimental" />;
                }
                return <EksperimentalPage studentData={studentData} setActiveView={setActiveView} />;
            case 'Kalender Akademik':
                return <AcademicCalendarPage setActiveView={setActiveView} />;
            case 'Informasi UT Daerah':
                return <UtDaerahPage setActiveView={setActiveView} />;
            case 'Informasi & Layanan UT':
                return <InformasiLayananUtPage setActiveView={setActiveView} />;
            case 'Panduan Lengkap UT':
                return <PanduanUtPage setActiveView={setActiveView} />;
            case 'Referensi Akademik':
                return <ReferensiAkademikPage setActiveView={setActiveView} />;
            case 'Riwayat Belajar Mahasiswa':
                 return <LearningHistory history={learningHistory} setActiveView={setActiveView} studentData={studentData} onDelete={deleteHistoryEntry} onContinue={handleContinueSession} folders={personalFolders} onAssignHistoryToFolder={handleAssignHistoryToFolder} />;
            case 'Lacak Pengingat':
                return <ReminderTrackerPage setActiveView={setActiveView} />;
            case 'Folder Mata Kuliah':
                 return <CourseFolderPage history={learningHistory} studentData={studentData} setActiveView={setActiveView} onContinue={handleContinueSession} onDelete={deleteHistoryEntry} folders={personalFolders} onAssignHistoryToFolder={handleAssignHistoryToFolder} />;
            case 'Folder Pribadi':
                return <PersonalFolderPage folders={personalFolders} history={learningHistory} studentData={studentData!} onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} onAssignHistoryToFolder={handleAssignHistoryToFolder} setActiveView={setActiveView} onContinue={handleContinueSession} onDeleteHistory={deleteHistoryEntry} />;
            case 'FAQ':
                return <FaqPage setActiveView={setActiveView} studentData={studentData} />;
            case 'Integrasi API':
                if (!isApiKeyFeatureEnabled) {
                    setActiveView('Dashboard');
                    return null;
                }
                return <ApiIntegrationPage setActiveView={setActiveView} onApiKeySubmit={handleApiKeySubmit} />;
            case 'Panduan Integrasi API':
                 if (!isApiKeyFeatureEnabled) {
                    setActiveView('Dashboard');
                    return null;
                }
                return <ApiIntegrationGuidePage setActiveView={setActiveView} onApiKeySubmit={handleApiKeySubmit} />;
            case 'Pengaturan Lanjutan':
                return <AdvancedSettingsPage setActiveView={setActiveView} />;
            case 'Dokumentasi Pembaruan':
                return <UpdateDocsPage setActiveView={setActiveView} />;
            case 'Tentang Aplikasi':
                return <AboutPage setActiveView={setActiveView} />;
            case 'Reset Aplikasi':
                return <ResetAppPage setActiveView={setActiveView} />;
            default:
                if (CHAT_SYSTEM_PROMPTS[activeView]) {
                    const isContinuing = initialSessionData?.view === activeView;
                    let systemPromptToUse: string;

                    if (!isContinuing && studentData && (activeView === 'Diskusi dengan ABM-UT' || activeView === 'Konsultasi Belajar ABM-UT')) {
                        const specificTask = `
                        Sapa mahasiswa (${studentData.name}) dengan ramah dan tanyakan apa yang ingin mereka diskusikan atau konsultasikan hari ini.
                        Untuk 'Diskusi dengan ABM-UT', posisikan diri sebagai teman bicara yang cerdas.
                        Untuk 'Konsultasi Belajar ABM-UT', posisikan diri sebagai mentor yang lebih profesional dan fokus pada strategi belajar.
                        `;
                        systemPromptToUse = createPeranPrompt(studentData, undefined, specificTask);
                    } else {
                        systemPromptToUse = isContinuing ? initialSessionData.systemPrompt : CHAT_SYSTEM_PROMPTS[activeView].prompt;
                    }

                    return (
                        <GenericChatPage
                            id={activeView}
                            studentData={studentData}
                            pageTitle={isContinuing ? initialSessionData.topic : activeView}
                            pageDescription={CHAT_SYSTEM_PROMPTS[activeView].description}
                            systemPrompt={systemPromptToUse}
                            onSessionComplete={addLearningHistory}
                            setActiveView={setActiveView}
                            initialConversation={isContinuing ? initialSessionData.conversation : undefined}
                            initialCourseName={isContinuing ? initialSessionData.courseName : undefined}
                        />
                    );
                }
                return <Dashboard studentData={studentData} onProfileSubmit={handleProfileSubmit} setActiveView={setActiveView} studyEndTime={studyEndTime} onLogout={handleLogout} />;
        }
    };

    return (
        <div className="bg-transparent text-white min-h-screen font-sans">
             {showSessionEndWarning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]" role="dialog" aria-modal="true">
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-lg w-full border border-ut-red/50 text-center">
                        <h3 className="text-2xl font-bold font-display text-ut-yellow mb-4">Waktu Sesi Belajar Akan Berakhir</h3>
                        <p className="text-slate-300 mb-6">Waktu estimasi belajar Anda akan berakhir dalam 2 menit. Apakah Anda ingin menambah durasi sesi?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => handleExtendSession(30)}
                                className="px-6 py-3 bg-ut-green hover:bg-green-500 rounded-lg font-semibold transition-colors"
                            >
                                Tambah 30 Menit
                            </button>
                            <button
                                onClick={handleForceLogout}
                                className="px-6 py-3 bg-ut-red hover:bg-red-700 rounded-lg font-semibold transition-colors"
                            >
                                Selesaikan & Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div id="scroll-progress-bar">
                <div id="scroll-progress-bar-indicator" style={{ width: `${scrollProgress}%` }}></div>
            </div>
            <div className="flex">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    isLocked={isLocked}
                    usedInviteCode={usedInviteCode}
                />
                <main className="flex-1 md:ml-64 transition-all duration-300 w-full md:w-auto flex flex-col pb-36 md:pb-0">
                    <MobileHeader />
                     {isLoggedIn && studentData && (
                        <SessionStatusIcon
                            loginMethod={loginMethod}
                            expiryTimestamp={sessionExpiry}
                            resetTimestamp={sessionResetTimestamp}
                            inviteCode={usedInviteCode}
                        />
                    )}
                    <div className="view-container flex-grow">
                       {renderView()}
                    </div>
                    <Footer />
                </main>
                <BottomNav 
                    activeView={activeView}
                    setActiveView={setActiveView}
                    isLocked={isLocked}
                    usedInviteCode={usedInviteCode}
                />
            </div>
        </div>
    );
};

export default App;