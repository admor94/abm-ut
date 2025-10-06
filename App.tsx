import React, { useState, useEffect, useCallback } from 'react';
import type { AppView, StudentData, ChatMessage, LearningHistoryEntry } from './types';
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
import { initializeAi } from './services/geminiService';
import { ApiIntegrationPage } from './pages/ApiIntegrationPage';
import { ResetAppPage } from './pages/ResetAppPage';
import { CourseFolderPage } from './pages/CourseFolderPage';
import { AsistenBmpPage } from './pages/AsistenBmpPage';
import { PrediksiNilaiPage } from './pages/PrediksiNilaiPage';
import { GroupStudyWorkspacePage } from './pages/GroupStudyWorkspacePage';
import { SessionTimerBar } from './components/SessionTimerBar';
import { ApiIntegrationGuidePage } from './pages/ApiIntegrationGuidePage';
import { PreLoginInfoPage } from './pages/PreLoginInfoPage';
import { PanduanUtPage } from './pages/PanduanUtPage';
import { AdvancedSettingsPage } from './pages/AdvancedSettingsPage';
import { isApiKeyFeatureEnabled } from './featureFlags';


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


const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showPreLoginInfo, setShowPreLoginInfo] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'invite' | 'apiKey' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [activeView, setActiveView] = useState<AppView>('Dashboard');
    const [learningHistory, setLearningHistory] = useState<LearningHistoryEntry[]>([]);
    const [studyEndTime, setStudyEndTime] = useState<number | null>(null);
    const [sessionToContinue, setSessionToContinue] = useState<LearningHistoryEntry | null>(null);
    const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
    const [usedInviteCode, setUsedInviteCode] = useState<string | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [sessionResetTimestamp, setSessionResetTimestamp] = useState<number | null>(null);

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
            // For invite mode, history is not persisted across reloads.
            if (savedLoginMethod === 'apiKey' || (savedLoginMethod === 'invite' && localStorage.getItem('usedInviteCode') === 'RADINALLSHARE')) {
                const savedHistory = localStorage.getItem('learningHistory');
                 if (savedHistory) {
                    setLearningHistory(JSON.parse(savedHistory));
                }
            }
            
            if (savedStudentData) {
                const parsedData = JSON.parse(savedStudentData);
                setStudentData(parsedData);
                if (parsedData.studyTimeStart && parsedData.studyTimeEnd) {
                    const [endH, endM] = parsedData.studyTimeEnd.split(':').map(Number);
                    const now = new Date();
                    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
                    if (end.getTime() > now.getTime()) {
                       setStudyEndTime(end.getTime());
                    }
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
                localStorage.removeItem('sessionExpiry');
                localStorage.removeItem('usedInviteCode');
                localStorage.removeItem('sessionResetTimestamp');
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
            // Only save history if in apiKey mode or dev mode
            if(loginMethod === 'apiKey' || (loginMethod === 'invite' && usedInviteCode === 'RADINALLSHARE')) {
                localStorage.setItem('learningHistory', JSON.stringify(learningHistory));
            }
        } catch (error) {
            console.error("Failed to save learning history to localStorage", error);
        }
    }, [learningHistory, loginMethod, usedInviteCode]);

    useEffect(() => { window.scrollTo(0, 0); }, [activeView]);

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
            
            if (upperCaseValue === 'RADINALLSHARE') {
                const devData: StudentData = {
                    name: 'ABM-UT Developer',
                    faculty: 'Fakultas Sains dan Teknologi (FST)',
                    studyProgram: 'Sistem Informasi',
                    semester: 8,
                    isWorking: true,
                    studySituation: 'Malam',
                    studyTimeStart: '19:00',
                    studyTimeEnd: '23:00',
                    studyDuration: 4 * 60 * 60 * 1000,
                };
                setStudentData(devData);
                setSessionExpiry(null); // Unlimited
                localStorage.removeItem('sessionExpiry');
                localStorage.removeItem('sessionResetTimestamp');
                setSessionResetTimestamp(null);
                setUsedInviteCode(upperCaseValue);
                localStorage.setItem('usedInviteCode', upperCaseValue);
                 // Persist history for dev
                const savedHistory = localStorage.getItem('learningHistory');
                if (savedHistory) {
                   setLearningHistory(JSON.parse(savedHistory));
                }

            } else {
                 if (durationMs === -1) { // Unlimited
                    setSessionExpiry(null);
                    localStorage.removeItem('sessionExpiry');
                    localStorage.removeItem('sessionResetTimestamp');
                    setSessionResetTimestamp(null);
                } else if (durationMs && durationMs > 0) { // Fresh, timed session
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
                
                setUsedInviteCode(upperCaseValue);
                localStorage.setItem('usedInviteCode', upperCaseValue);
                
                // Clear any previous history from PRO mode
                setLearningHistory([]);
                localStorage.removeItem('learningHistory');
            }
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
        const newEntry: LearningHistoryEntry = {
            id: `${new Date().toISOString()}-${topic}`,
            view, topic,
            date: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
            conversation, systemPrompt, courseName,
        };
        setLearningHistory(prev => {
            const existingIndex = prev.findIndex(e => e.id === newEntry.id);
            if (existingIndex !== -1) {
                const updatedHistory = [...prev];
                updatedHistory[existingIndex] = newEntry;
                return updatedHistory;
            }
            return [newEntry, ...prev];
        });
    }, []);
    
    const deleteHistoryEntry = useCallback((id: string) => {
        setLearningHistory(prev => prev.filter(entry => entry.id !== id));
    }, []);

    const handleContinueSession = (entry: LearningHistoryEntry) => {
        setSessionToContinue(entry);
        setActiveView(entry.view);
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
        const informationalViews: AppView[] = [ 'Informasi', 'FAQ', 'Dokumentasi Pembaruan', 'Tentang Aplikasi', 'Kalender Akademik', 'Informasi UT Daerah', 'Informasi & Layanan UT', 'Integrasi API', 'Panduan Integrasi API', 'Reset Aplikasi', 'Pengaturan', 'Panduan Lengkap UT', 'Pengaturan Lanjutan' ];
        const isInformationalView = informationalViews.includes(activeView);

        if (isLocked && !isInformationalView && activeView !== 'Dashboard' && activeView !== 'Tracking' && activeView !== 'Riwayat Belajar Mahasiswa' && activeView !== 'Lacak Pengingat') {
            setActiveView('Dashboard');
            return <Dashboard studentData={null} onProfileSubmit={handleProfileSubmit} setActiveView={setActiveView} studyEndTime={null} />;
        }
        
        const isProFeature = PRO_FEATURES.includes(activeView);
        const isTrialExpired = loginMethod === 'invite' && usedInviteCode !== 'ADMOR94' && usedInviteCode !== 'RADINALLSHARE' && sessionExpiry != null && Date.now() >= sessionExpiry;

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
                return <Dashboard studentData={studentData} onProfileSubmit={handleProfileSubmit} setActiveView={setActiveView} studyEndTime={studyEndTime} />;
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
            case 'Kalender Akademik':
                return <AcademicCalendarPage setActiveView={setActiveView} />;
            case 'Informasi UT Daerah':
                return <UtDaerahPage setActiveView={setActiveView} />;
            case 'Informasi & Layanan UT':
                return <InformasiLayananUtPage setActiveView={setActiveView} />;
            case 'Panduan Lengkap UT':
                return <PanduanUtPage setActiveView={setActiveView} />;
            case 'Riwayat Belajar Mahasiswa':
                 return <LearningHistory history={learningHistory} setActiveView={setActiveView} studentData={studentData} onDelete={deleteHistoryEntry} onContinue={handleContinueSession} />;
            case 'Lacak Pengingat':
                return <ReminderTrackerPage setActiveView={setActiveView} />;
            case 'Folder Mata Kuliah':
                 return <CourseFolderPage history={learningHistory} studentData={studentData} setActiveView={setActiveView} onContinue={handleContinueSession} onDelete={deleteHistoryEntry} />;
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
                    return (
                        <GenericChatPage
                            id={activeView}
                            studentData={studentData}
                            pageTitle={isContinuing ? initialSessionData.topic : activeView}
                            pageDescription={CHAT_SYSTEM_PROMPTS[activeView].description}
                            systemPrompt={isContinuing ? initialSessionData.systemPrompt : CHAT_SYSTEM_PROMPTS[activeView].prompt}
                            onSessionComplete={addLearningHistory}
                            setActiveView={setActiveView}
                            initialConversation={isContinuing ? initialSessionData.conversation : undefined}
                            initialCourseName={isContinuing ? initialSessionData.courseName : undefined}
                        />
                    );
                }
                return <Dashboard studentData={studentData} onProfileSubmit={handleProfileSubmit} setActiveView={setActiveView} studyEndTime={studyEndTime} />;
        }
    };

    return (
        <div className="bg-transparent text-white min-h-screen font-sans">
            <div id="scroll-progress-bar">
                <div id="scroll-progress-bar-indicator" style={{ width: `${scrollProgress}%` }}></div>
            </div>
            <div className="flex">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    isLocked={isLocked}
                />
                <main className="flex-1 md:ml-64 transition-all duration-300 w-full md:w-auto flex flex-col pb-36 md:pb-0">
                    <MobileHeader />
                    <div className="view-container flex-grow">
                       {renderView()}
                    </div>
                    <Footer />
                </main>
                {loginMethod === 'invite' && (sessionExpiry || sessionResetTimestamp) && usedInviteCode && usedInviteCode !== 'ADMOR94' && usedInviteCode !== 'RADINALLSHARE' && (
                    <SessionTimerBar expiryTimestamp={sessionExpiry} resetTimestamp={sessionResetTimestamp} inviteCode={usedInviteCode} />
                )}
                <BottomNav 
                    activeView={activeView}
                    setActiveView={setActiveView}
                    isLocked={isLocked}
                />
            </div>
        </div>
    );
};

export default App;