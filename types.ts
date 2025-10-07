
export interface StudentData {
  name: string;
  faculty: string;
  studyProgram: string;
  semester: number;
  isWorking: boolean;
  studySituation: 'Pagi' | 'Siang' | 'Malam';
  studyTimeStart: string;
  studyTimeEnd: string;
  studyDuration: number; // in milliseconds
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  files?: File[];
}

export interface LearningHistoryEntry {
  id: string;
  view: AppView;
  topic: string;
  date: string;
  conversation: ChatMessage[];
  systemPrompt: string;
  courseName?: string;
  folderId?: string;
}

export interface PersonalFolder {
  id: string;
  name: string;
}

export interface DeadlineTask {
    id: string;
    courseName: string;
    taskType: string;
    customTaskName: string;
    startTime: number;
    endTime: number;
    reminderDays: number;
    reminderTime: string; // "HH:MM"
}

export interface Flashcard {
  question: string;
  answer: string;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ArgumentPoint {
    claim: string;
    evidence: string;
    analysis: string;
}

export interface ArgumentOutline {
    thesis: string;
    mainPoints: ArgumentPoint[];
    counterArgument: {
        potential: string;
        rebuttal: string;
    };
    conclusion: {
        summary: string;
        finalStatement: string;
    };
}

export interface AcademicEvent {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  title: string;
  category: 'Pendaftaran' | 'Pembayaran' | 'Akademik' | 'Ujian' | 'Lainnya';
}

export interface StudyPlanSession {
  session: number | string;
  action: string;
  description: string;
  expectedOutcome: string;
}

export interface StudyPlanResponse {
  initialAnalysis: string;
  methodExplanation: string;
  synergyAnalysis?: string;
  recommendation: {
    recommendedMethod: string;
    reasoning: string;
  } | null;
  detailedPlan: StudyPlanSession[];
  materialSummary: string;
}

export interface StudyStrategyResponse {
  initialAnalysis: string;
  methodExplanation: string;
  recommendedTimeTechnique: string;
  timeTechniqueReasoning: string;
  synergyAnalysis: string;
}

export interface GroupProjectSummary {
    discussionSummary: string;
    keyDecisions: string[];
    actionItems: {
        member: string;
        task: string;
    }[];
}


export type AppView =
  | 'Dashboard'
  // FIX: Add hub page parent views to resolve type errors
  | 'Belajar & Latihan'
  | 'Produktivitas & Riset'
  | 'Riwayat & Pelacakan'
  | 'Pengaturan & Bantuan'
  | 'Kreativitas'
  | 'Interaktif'
  | 'Alat Bantu'
  | 'Simulasi'
  | 'Tutorial Online'
  | 'Tracking'
  | 'Seputar UT'
  | 'Pengaturan'
  | 'Informasi'
  // Kreativitas
  | 'Rencana Belajar'
  | 'Rencana Belajar +Plus'
  | 'Metode Membaca Intensif'
  | 'Metode Membaca Ekstensif'
  | 'Teknik Manajemen Waktu'
  | 'Flashcards'
  | 'Kuis Pilihan Ganda'
  // Interaktif
  | 'Diskusi dengan ABM-UT'
  | 'Konsultasi Belajar ABM-UT'
  | 'Debat Cerdas dengan ABM-UT'
  | 'Teknik Feynman'
  | 'Ruang Kerja Kelompok Belajar'
  // Alat Bantu
  | 'Buat Rangkuman Materi'
  | 'Asisten Sitasi'
  | 'Parafrasa & Gaya Bahasa'
  | 'Perancang Argumen'
  | 'Prediksi Nilai UAS'
  // Simulasi
  | 'Analisis Studi Kasus'
  | 'Workspace Karya Ilmiah'
  | 'Sintesis Teori'
  | 'Latihan Ujian Akhir'
  // Tutorial Online
  | 'Pemahaman Materi'
  | 'Pemahaman Diskusi'
  | 'Asisten BMP'
  | 'Eksperimental'
  // Seputar UT
  | 'Kalender Akademik'
  | 'Informasi UT Daerah'
  | 'Informasi & Layanan UT'
  | 'Panduan Lengkap UT'
  | 'Referensi Akademik'
  // Tracking & Informasi
  | 'Riwayat Belajar Mahasiswa'
  | 'Lacak Pengingat'
  | 'Folder Mata Kuliah'
  | 'Folder Pribadi'
  | 'FAQ'
  | 'Integrasi API'
  | 'Panduan Integrasi API'
  | 'Dokumentasi Pembaruan'
  | 'Tentang Aplikasi'
  | 'Reset Aplikasi'
  | 'Pengaturan Lanjutan'
  | 'Lainnya';