import { GoogleGenAI, Type, GenerateContentResponse, Content, Part } from "@google/genai";
import type { GenerateContentParameters } from "@google/genai";
import type { ChatMessage, StudentData, Flashcard, QuizQuestion, ArgumentOutline, StudyPlanResponse, StudyStrategyResponse, GroupProjectSummary } from '../types';

let aiInstance: GoogleGenAI | null = null;
let loginMethod: 'apiKey' | 'invite' | null = null;

export function initializeAi(apiKey: string | null, method: 'apiKey' | 'invite') {
  loginMethod = method;
  if (method === 'apiKey' && apiKey) {
    aiInstance = new GoogleGenAI({ apiKey });
  } else {
    // In invite mode, client-side instance is not used for API calls
    aiInstance = null; 
  }
}

function getAi() {
  if (loginMethod === 'apiKey' && !aiInstance) {
    throw new Error("Kunci API Gemini belum diatur. Silakan masukkan kunci API Anda di halaman 'Integrasi API' untuk menggunakan fitur ini.");
  }
  // For 'invite' mode, this will return null, and direct calls will be prevented.
  return aiInstance;
}

// --- NEW PROXY AND HELPER FUNCTIONS ---

/**
 * A generic function to call our secure serverless proxy.
 * @param payload The entire GenerateContentParameters object.
 * @returns A promise that resolves to an object with a 'text' property, mimicking the SDK response.
 */
async function callProxy(payload: GenerateContentParameters): Promise<{ text: string }> {
    const response = await fetch('/api/proxy-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Gagal mem-parsing respons error dari server." }));
        throw new Error(errorData.error || 'Gagal menghubungi server proxy. Silakan coba lagi.');
    }
    return response.json();
}

/**
 * Converts a File object into a JSON-serializable object with base64 data.
 * This is necessary for sending file content to the proxy.
 */
const fileToJson = async (file: File): Promise<{ data: string; mimeType: string }> => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return { data: base64EncodedData, mimeType: file.type };
};

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const { data, mimeType } = await fileToJson(file);
  return {
    inlineData: { data, mimeType },
  };
};

const buildStudentContext = (studentData: StudentData): string => {
    return `
Konteks Mahasiswa:
- Nama: ${studentData.name}
- Fakultas: ${studentData.faculty}
- Program Studi: ${studentData.studyProgram}
- Semester: ${studentData.semester}
- Status Bekerja: ${studentData.isWorking ? 'Ya' : 'Tidak'}
- Waktu Belajar: ${studentData.studySituation} (${studentData.studyTimeStart} - ${studentData.studyTimeEnd})
Gunakan konteks ini untuk menyesuaikan gaya bahasa dan contoh agar relevan bagi mahasiswa.
    `.trim();
};

async function executeGeneration(payload: GenerateContentParameters): Promise<{ text: string }> {
    if (loginMethod === 'invite') {
        return callProxy(payload);
    } else {
        const ai = getAi()!;
        const response = await ai.models.generateContent(payload);
        return { text: response.text };
    }
}

// --- REFACTORED API FUNCTIONS ---

export const getAiResponse = async (
    conversation: ChatMessage[],
    studentData: StudentData,
    systemPrompt: string
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const globalSystemInstruction = localStorage.getItem('globalSystemInstruction') || '';
        
        const combinedSystemInstruction = [globalSystemInstruction, systemPrompt, studentContext].filter(Boolean).join('\n\n');

        const history: Content[] = await Promise.all(
            conversation.map(async (msg) => {
                const parts: Part[] = [];
                if (msg.text) parts.push({ text: msg.text });
                if (msg.files && msg.files.length > 0) {
                    const fileParts = await Promise.all(msg.files.map(f => fileToGenerativePart(f)));
                    parts.push(...fileParts);
                }
                if (parts.length === 0) parts.push({ text: '' });
                return { role: msg.role, parts };
            })
        );
        
        const payload: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: history,
            config: { systemInstruction: combinedSystemInstruction },
        };

        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Gagal mendapatkan respons dari ABM-UT. Silakan coba lagi.");
    }
};

export const generateFlashcards = async (
    courseName: string,
    mainTopic: string,
    materialText: string,
    files: File[],
    difficulty: string,
    cardCount: number,
    studentData: StudentData
): Promise<Flashcard[]> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const promptParts: Part[] = [];

        promptParts.push({text: `
Anda adalah ABM-UT pembuat flashcard akademik. Berdasarkan materi yang diberikan, buatlah ${cardCount} flashcard dengan tingkat kesulitan "${difficulty}".

Materi:
- Mata Kuliah: ${courseName}
- Topik Utama: ${mainTopic}
- Teks Materi: ${materialText || '(Gunakan file yang diunggah)'}

${studentContext}

Setiap flashcard harus memiliki:
1. question: Pertanyaan yang jelas dan ringkas.
2. answer: Jawaban yang akurat dan to-the-point.
3. explanation: Penjelasan komprehensif yang memberikan konteks dan detail lebih lanjut, dalam format Markdown yang rapi (gunakan poin-poin jika perlu).

Fokuslah pada konsep-konsep paling penting dari materi.
`});
        
        if (files.length > 0) {
            promptParts.push({ text: `\nBerikut adalah ${files.length} file materi yang diunggah:` });
            const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f)));
            promptParts.push(...fileParts);
        }
        
        const payload: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: { parts: promptParts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING, description: "Pertanyaan pada flashcard." },
                            answer: { type: Type.STRING, description: "Jawaban singkat untuk pertanyaan." },
                            explanation: { type: Type.STRING, description: "Penjelasan detail dalam format Markdown yang rapi." },
                        },
                        required: ['question', 'answer', 'explanation'],
                    },
                },
            },
        };

        const response = await executeGeneration(payload);
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as Flashcard[];
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Gagal membuat flashcards. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};


export const generateQuiz = async (
    courseName: string,
    mainTopic: string,
    materialText: string,
    files: File[],
    difficulty: string,
    questionCount: number,
    studentData: StudentData
): Promise<QuizQuestion[]> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const promptParts: Part[] = [];

        promptParts.push({ text: `
Anda adalah ABM-UT pembuat soal kuis pilihan ganda. Berdasarkan materi yang diberikan, buatlah ${questionCount} soal dengan tingkat kesulitan "${difficulty}".

Materi:
- Mata Kuliah: ${courseName}
- Topik Utama: ${mainTopic}
- Teks Materi: ${materialText || '(Gunakan file yang diunggah)'}

${studentContext}

Setiap soal harus memiliki:
1. question: Pertanyaan yang jelas dan tidak ambigu.
2. options: Array berisi 4 string pilihan jawaban. Salah satunya harus benar.
3. correctAnswerIndex: Index (0-3) dari jawaban yang benar di dalam array 'options'.
4. explanation: Penjelasan mengapa jawaban tersebut benar dan yang lain salah, dalam format Markdown yang rapi.

Pastikan pilihan jawaban masuk akal dan pengecohnya relevan.
`});
        
        if (files.length > 0) {
            promptParts.push({ text: `\nBerikut adalah ${files.length} file materi yang diunggah:` });
            const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f)));
            promptParts.push(...fileParts);
        }

        const payload: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: { parts: promptParts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING, description: "Penjelasan dalam format Markdown." },
                        },
                        required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
                    },
                },
            },
        };

        const response = await executeGeneration(payload);
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as QuizQuestion[];
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Gagal membuat kuis. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};

export const generateSummary = async (
    materialText: string,
    files: File[],
    summaryType: string,
    summaryLength: string,
    studentData: StudentData
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const promptParts: Part[] = [];
        
        promptParts.push({ text: `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang ahli rangkuman akademis. Tugas Anda adalah membuat rangkuman dari materi yang diberikan.

Spesifikasi Rangkuman:
- Jenis: ${summaryType}
- Panjang: ${summaryLength}

${studentContext}

Materi:
${materialText || '(Gunakan file yang diunggah)'}
`});

        if (files.length > 0) {
            promptParts.push({ text: `\nBerikut adalah ${files.length} file materi yang diunggah:` });
            const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f)));
            promptParts.push(...fileParts);
        }
        
        promptParts.push({text: "\nBuat rangkuman sekarang sesuai spesifikasi di atas. Format output dalam Markdown yang terstruktur dengan baik, gunakan heading, poin-poin, dan teks tebal untuk keterbacaan."});
        
        const payload: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: { parts: promptParts },
        };
        
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Gagal membuat rangkuman. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};

export const generateCitation = async (
    sourceType: string,
    citationStyle: string,
    formData: Record<string, string>,
    studentData: StudentData
): Promise<{ bibliography: string; parenthetical: string; narrative: string }> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const details = Object.entries(formData).filter(([, value]) => value).map(([key, value]) => `- ${key}: ${value}`).join('\n');
        const prompt = `
Anda adalah ABM-UT, seorang Pustakawan Akademik dan Ahli Sitasi.
Tugas Anda adalah membuat sitasi yang akurat berdasarkan data yang diberikan.

${studentContext}

Data Sumber:
- Jenis Sumber: ${sourceType}
- Gaya Sitasi: ${citationStyle}
- Detail:
${details}

Format sitasi tersebut ke dalam JSON.
`.trim();

        const payload: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bibliography: { type: Type.STRING, description: "Format sitasi lengkap untuk daftar pustaka/bibliografi." },
                        parenthetical: { type: Type.STRING, description: "Contoh kutipan dalam teks format parentetik, misal: (Doe, 2023)." },
                        narrative: { type: Type.STRING, description: "Contoh kutipan dalam teks format naratif, misal: Menurut Doe (2023)..." }
                    },
                    required: ['bibliography', 'parenthetical', 'narrative'],
                },
            },
        };
        
        const response = await executeGeneration(payload);
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as { bibliography: string; parenthetical: string; narrative: string };
    } catch (error) {
        console.error("Error generating citation:", error);
        throw new Error("Gagal membuat sitasi. Periksa kembali data yang Anda masukkan atau coba lagi.");
    }
};

export const generateParaphrase = async (
    originalText: string,
    instructions: string[],
    studentData: StudentData
): Promise<{ paraphrasedText: string, editorNotes: string[] }> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const instructionsText = instructions.length > 0 ? `Instruksi Tambahan: ${instructions.join(', ')}` : 'Tidak ada instruksi tambahan.';
        
        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang Editor Akademik dan Pakar Bahasa. Keahlian Anda adalah memahami makna inti dari sebuah teks dan menuliskannya kembali dengan gaya yang berbeda untuk meningkatkan kejelasan, alur, dan keaslian tulisan.

${studentContext}

[DATA INPUT]
- Teks Asli: "${originalText}"
- ${instructionsText}

[TUGAS]
1.  **Analisis & Parafrasa**: Baca [Teks Asli], pahami maknanya, lalu tulis ulang dengan struktur kalimat dan pilihan kata yang berbeda tanpa mengubah makna. Ikuti [Instruksi Tambahan] jika ada.
2.  **Buat Catatan Editor**: Berikan 3-4 catatan singkat dan bermanfaat yang menjelaskan perubahan kunci yang Anda buat (misalnya, "Struktur kalimat diubah untuk penekanan," atau "Istilah 'X' diganti dengan 'Y' agar lebih formal.").

[FORMAT OUTPUT]
Keluarkan hasilnya dalam format JSON.
`.trim();

        const payload: GenerateContentParameters = {
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        paraphrasedText: { type: Type.STRING, description: "Teks yang sudah diparafrasakan dan disunting." },
                        editorNotes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING, description: "Satu catatan editor yang menjelaskan perubahan." },
                            description: "Kumpulan catatan editor yang menjelaskan perubahan kunci."
                        }
                    },
                    required: ["paraphrasedText", "editorNotes"]
                }
            }
        };
        
        const response = await executeGeneration(payload);
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as { paraphrasedText: string, editorNotes: string[] };
    } catch (error) {
        console.error("Error generating paraphrase:", error);
        throw new Error("Gagal memparafrasakan teks. Silakan coba lagi.");
    }
};

// ... (The pattern repeats for all other functions)
// I will apply the same refactoring pattern to the remaining functions.

const createTextPayload = async (prompt: string, files: File[] = []): Promise<GenerateContentParameters> => {
    const promptParts: Part[] = [{ text: prompt }];
    if (files.length > 0) {
        const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f)));
        promptParts.push(...fileParts);
    }
    return {
        model: 'gemini-2.5-flash',
        contents: { parts: promptParts },
    };
};

const createJsonPayload = async (prompt: string, schema: any, files: File[] = []): Promise<GenerateContentParameters> => {
    const payload = await createTextPayload(prompt, files);
    payload.config = {
        responseMimeType: 'application/json',
        responseSchema: schema,
    };
    return payload;
};

// --- Now I'll refactor the remaining functions using these helpers ---

export const generateArgumentOutline = async (
    conversation: ChatMessage[],
    studentData: StudentData,
    topic: string
): Promise<ArgumentOutline> => {
    try {
        const transcript = conversation.map(msg => `${msg.role === 'user' ? studentData.name : 'ABM-UT'}: ${msg.text}`).join('\n');
        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang Analis Akademik yang bertugas menyusun kerangka argumen terstruktur berdasarkan transkrip sesi bimbingan.

[DATA INPUT]
- Profil Mahasiswa: Fakultas ${studentData.faculty}, Jurusan ${studentData.studyProgram}
- Topik Materi: ${topic}
- Transkrip Sesi Bimbingan:
---
${transcript}
---

[TUGAS ANDA]
Baca dan analisis seluruh transkrip. Ekstrak dan sintesis informasi kunci untuk menyusun "RANCANGAN KERANGKA ARGUMEN" yang lengkap.

[FORMAT OUTPUT]
Keluarkan hasilnya HANYA dalam format JSON yang valid.
`.trim();
        const schema = {
            type: Type.OBJECT,
            properties: {
                thesis: { type: Type.STRING, description: 'Pernyataan tesis utama.' },
                mainPoints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { claim: { type: Type.STRING }, evidence: { type: Type.STRING }, analysis: { type: Type.STRING } }, required: ['claim', 'evidence', 'analysis'] } },
                counterArgument: { type: Type.OBJECT, properties: { potential: { type: Type.STRING }, rebuttal: { type: Type.STRING } }, required: ['potential', 'rebuttal'] },
                conclusion: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, finalStatement: { type: Type.STRING } }, required: ['summary', 'finalStatement'] }
            },
            required: ['thesis', 'mainPoints', 'counterArgument', 'conclusion']
        };
        const payload = await createJsonPayload(prompt, schema);
        const response = await executeGeneration(payload);
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as ArgumentOutline;
    } catch (error) {
        console.error("Error generating argument outline:", error);
        throw new Error("Gagal membuat kerangka argumen. Silakan coba lagi.");
    }
};

export const generateCaseStudyAnalysis = async (
    caseStudyText: string,
    files: File[],
    analysisMethod: string,
    studentData: StudentData
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang Analis Strategis. Tugas Anda adalah membedah studi kasus secara sistematis menggunakan metode ${analysisMethod}.

[DATA INPUT]
${studentContext}
- Metode Analisis: ${analysisMethod}
- Teks Studi Kasus: ${caseStudyText || '(Gunakan file yang diunggah)'}

[PROSES]
Sajikan temuan secara terstruktur. Untuk setiap poin, berikan penjelasan singkat dan kutip bukti dari teks jika memungkinkan. Tambahkan ringkasan eksekutif di awal.

[FORMAT OUTPUT]
Gunakan format Markdown yang sangat rapi dan terstruktur. Mulai laporan sekarang.
        `.trim();
        const payload = await createTextPayload(prompt, files);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating case study analysis:", error);
        throw new Error("Gagal menganalisis studi kasus. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};


export const generateKarilGuidance = async (
    studentData: StudentData,
    jenisKaril: string,
    topik: string,
    materiPendukungText: string,
    materiPendukungFiles: File[],
    tahapanBantuan: string
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, Pembimbing Akademik. Pandu mahasiswa secara terstruktur sesuai permintaan mereka.

[DATA INPUT PENGGUNA]
${studentContext}
- Jenis Karil: ${jenisKaril}
- Topik atau Ide: ${topik}
- Materi Pendukung Teks: ${materiPendukungText || '(Tidak ada)'}
- Tahapan Bantuan Diminta: ${tahapanBantuan}

[PROSES]
Eksekusi tugas bimbingan (${tahapanBantuan}) berdasarkan data yang ada. Sajikan output dalam format Markdown yang rapi. Tambahkan "Saran Langkah Selanjutnya" di akhir.
Mulai sekarang.
        `.trim();
        const payload = await createTextPayload(prompt, materiPendukungFiles);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating Karil guidance:", error);
        throw new Error("Gagal memberikan bimbingan. Periksa kembali data yang Anda berikan atau coba lagi.");
    }
};

export const generateTheorySynthesis = async (
    studentData: StudentData,
    caseStudyText: string,
    caseStudyFiles: File[],
    theoryList: string
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, seorang Teoretikus Akademik.

[DATA INPUT PENGGUNA]
${studentContext}
- Studi Kasus Teks: ${caseStudyText || '(Gunakan file yang diunggah)'}
- Daftar Teori: ${theoryList}

[PROSES]
1. Analisis kasus menggunakan kacamata setiap teori secara terpisah.
2. Buat bagian sintesis yang membandingkan interpretasi dari berbagai teori tersebut.

[FORMAT OUTPUT]
Gunakan format Markdown terstruktur: Laporan, Analisis per Teori, dan Sintesis/Perbandingan.
Mulai sekarang.
        `.trim();
        const payload = await createTextPayload(prompt, caseStudyFiles);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating theory synthesis:", error);
        throw new Error("Gagal membuat sintesis teori. Periksa kembali data yang Anda berikan atau coba lagi.");
    }
};

export const generateExamPrepPackage = async (
    studentData: StudentData,
    courseName: string,
    courseMaterialText: string,
    courseMaterialFiles: File[],
    questionType: string
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `
[PERAN DAN KONTEKS]
Anda adalah ABM-UT, Perancang Ujian.

[DATA INPUT PENGGUNA]
${studentContext}
- Nama Mata Kuliah: ${courseName}
- Seluruh Materi Kuliah: ${courseMaterialText || '(Gunakan file yang diunggah)'}
- Jenis Soal yang Diinginkan: ${questionType}

[PROSES]
1. Analisis materi, identifikasi konsep kunci.
2. Buat "Ringkasan Komprehensif" dan "Daftar Poin-Poin Penting".
3. Buat soal latihan sesuai jenis yang diminta (jika Pilihan Ganda, sertakan kunci jawaban & pembahasan di akhir).

[FORMAT OUTPUT]
Gunakan format Markdown terstruktur dengan heading: PAKET PERSIAPAN, BAGIAN 1, BAGIAN 2, BAGIAN 3.
Mulai sekarang.
        `.trim();
        const payload = await createTextPayload(prompt, courseMaterialFiles);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating exam prep package:", error);
        throw new Error("Gagal membuat paket persiapan ujian. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};

const studyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        initialAnalysis: { type: Type.STRING },
        methodExplanation: { type: Type.STRING },
        synergyAnalysis: { type: Type.STRING, description: "Hanya untuk Rencana Belajar +Plus." },
        // FIX: The API might return null for recommendation, so it needs to be nullable.
        recommendation: { 
            type: Type.OBJECT, 
            nullable: true,
            properties: { 
                recommendedMethod: { type: Type.STRING }, 
                reasoning: { type: Type.STRING } 
            },
            required: ["recommendedMethod", "reasoning"]
        },
        detailedPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { session: { type: Type.STRING }, action: { type: Type.STRING }, description: { type: Type.STRING }, expectedOutcome: { type: Type.STRING } }, required: ["session", "action", "description", "expectedOutcome"] } },
        materialSummary: { type: Type.STRING }
    },
    required: ["initialAnalysis", "methodExplanation", "detailedPlan", "materialSummary"]
};

export const generateStudyPlan = async (
    studentData: StudentData, courseName: string, mainTopic: string, materialText: string, files: File[], sessionCount: number, learningType: string, selectedMethod: string
): Promise<StudyPlanResponse> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Mentor Akademik Ahli Perancangan Strategi Belajar. [TUGAS] Buat rencana belajar detail. [DATA] ${studentContext}, Mata Kuliah: ${courseName}, Topik: ${mainTopic}, Sesi: ${sessionCount}, Tipe: ${learningType}, Metode: ${selectedMethod}, Materi Teks: ${materialText || '(Gunakan file)'}. [PROSES] Analisis materi, evaluasi metode, bagi sesi, rancang rencana detail, buat rangkuman. [FORMAT] JSON sesuai skema.`;
        const payload = await createJsonPayload(prompt, studyPlanSchema, files);
        const response = await executeGeneration(payload);
        return JSON.parse(response.text.trim()) as StudyPlanResponse;
    } catch (error) {
        console.error("Error generating study plan:", error);
        throw new Error("Gagal membuat rencana belajar. Periksa kembali materi Anda atau coba lagi.");
    }
};

export const getStudyStrategyRecommendation = async (
    studentData: StudentData, courseName: string, mainTopic: string, materialText: string, files: File[], sessionCount: number, learningType: string, selectedMethod: string
): Promise<StudyStrategyResponse> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Mentor Akademik. [TUGAS] Berikan analisis & rekomendasi strategi belajar. [DATA] ${studentContext}, MK: ${courseName}, Topik: ${mainTopic}, Sesi: ${sessionCount}, Tipe: ${learningType}, Metode: ${selectedMethod}, Materi: ${materialText || '(Gunakan file)'}. [PROSES & OUTPUT JSON] Buat 'initialAnalysis', 'methodExplanation', 'recommendedTimeTechnique' (pilih satu dari: 'Teknik Pomodoro', 'Eat That Frog', 'Two Minute Rule', 'Matriks Eisenhower', 'Metode Time Blocking'), 'timeTechniqueReasoning', dan 'synergyAnalysis'.`;
        const schema = {
            type: Type.OBJECT,
            properties: { initialAnalysis: { type: Type.STRING }, methodExplanation: { type: Type.STRING }, recommendedTimeTechnique: { type: Type.STRING }, timeTechniqueReasoning: { type: Type.STRING }, synergyAnalysis: { type: Type.STRING } },
            required: ["initialAnalysis", "methodExplanation", "recommendedTimeTechnique", "timeTechniqueReasoning", "synergyAnalysis"]
        };
        const payload = await createJsonPayload(prompt, schema, files);
        const response = await executeGeneration(payload);
        return JSON.parse(response.text.trim()) as StudyStrategyResponse;
    } catch (error) {
        console.error("Error getting study strategy recommendation:", error);
        throw new Error("Gagal mendapatkan rekomendasi strategi. Silakan coba lagi.");
    }
};

export const generateStudyPlanPlus = async (
    studentData: StudentData, courseName: string, mainTopic: string, materialText: string, files: File[], sessionCount: number, learningType: string, selectedMethod: string, timeTechnique: string
): Promise<StudyPlanResponse> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Mentor Akademik. [TUGAS] Buat Rencana Belajar +Plus yang mengintegrasikan teknik manajemen waktu. [DATA] ${studentContext}, MK: ${courseName}, Topik: ${mainTopic}, Sesi: ${sessionCount}, Tipe: ${learningType}, Metode: ${selectedMethod}, Teknik Waktu: ${timeTechnique}, Materi: ${materialText || '(Gunakan file)'}. [PROSES] Analisis materi, siapkan 'initialAnalysis', 'methodExplanation', 'synergyAnalysis'. Bagi sesi & integrasikan teknik waktu ke rencana detail. Buat rangkuman. [FORMAT] JSON sesuai skema.`;
        const payload = await createJsonPayload(prompt, studyPlanSchema, files);
        const response = await executeGeneration(payload);
        return JSON.parse(response.text.trim()) as StudyPlanResponse;
    } catch (error) {
        console.error("Error generating study plan plus:", error);
        throw new Error("Gagal membuat Rencana Belajar +Plus. Periksa kembali materi Anda atau coba lagi.");
    }
};

export const generateTutonAnalysis = async (
    studentData: StudentData, courseName: string, mainTopic: string, session: string, sessionIntro: string, enrichmentText: string, enrichmentFiles: File[], initiationFiles: File[], bmpFiles: File[]
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const files = [...enrichmentFiles, ...initiationFiles, ...bmpFiles];
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Tutor Akademik Ahli Sintesis Tuton. [TUGAS] Analisis SEMUA materi sesi Tuton dan hasilkan penjelasan komprehensif. [DATA] ${studentContext}, MK: ${courseName}, Topik: ${mainTopic}, Sesi: ${session}, Pengantar Tutor: ${sessionIntro || '(Tidak ada)'}, Materi Teks: ${enrichmentText || '(Tidak ada)'}. [PROSES] Analisis holistik, sintesis info, strukturkan output. [FORMAT] Markdown yang sangat terstruktur. Mulai sekarang.`;
        const payload = await createTextPayload(prompt, files);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating Tuton analysis:", error);
        throw new Error("Gagal menganalisis materi Tuton. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};

export const generateTutonDiscussionAnalysis = async (
    studentData: StudentData, courseName: string, mainTopic: string, session: string, tutorTerms: string, discussionMaterial: string, bmpFiles: File[]
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Tutor Akademik. [TUGAS] Buat DRAF JAWABAN untuk diskusi Tuton. [DATA] ${studentContext}, MK: ${courseName}, Topik: ${mainTopic}, Sesi: ${session}, Syarat Tutor: ${tutorTerms || '(Tidak ada)'}, Materi Diskusi: ${discussionMaterial}. [PROSES] Analisis pertanyaan, sintesis info dari BMP (jika ada), strukturkan jawaban. [FORMAT] Markdown. Mulai sekarang.`;
        const payload = await createTextPayload(prompt, bmpFiles);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error generating Tuton discussion analysis:", error);
        throw new Error("Gagal menganalisis materi diskusi. Periksa kembali materi yang Anda berikan atau coba lagi.");
    }
};

export const synthesizeTutonDiscussion = async (
    studentData: StudentData, initialAnalysis: string, chatConversation: ChatMessage[]
): Promise<string> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const transcript = chatConversation.map(msg => `${msg.role === 'user' ? studentData.name : 'ABM-UT'}: ${msg.text}`).join('\n');
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Editor Akademik. [TUGAS] Sintesiskan JAWABAN FINAL dari draf awal dan transkrip diskusi. [DATA] ${studentContext}, Draf Awal: ${initialAnalysis}, Transkrip: ${transcript}. [PROSES] Review draf, analisis diskusi, integrasikan wawasan baru, tulis jawaban akhir. [FORMAT] Markdown. Mulai sekarang.`;
        const payload = await createTextPayload(prompt);
        const response = await executeGeneration(payload);
        return response.text;
    } catch (error) {
        console.error("Error synthesizing Tuton discussion:", error);
        throw new Error("Gagal mensintesis jawaban akhir. Silakan coba lagi.");
    }
};

export const generateGroupProjectSummary = async (
    conversation: ChatMessage[], studentData: StudentData, projectTitle: string, groupMembers: string[]
): Promise<GroupProjectSummary> => {
    try {
        const studentContext = buildStudentContext(studentData);
        const transcript = conversation.map(msg => msg.role === 'user' ? `${studentData.name}: ${msg.text}` : msg.text).join('\n');
        const prompt = `[PERAN] Anda adalah ABM-UT, seorang Notulis Rapat. [TUGAS] Ekstrak info penting dari transkrip diskusi kelompok. [DATA] ${studentContext}, Judul Proyek: ${projectTitle}, Anggota: ${groupMembers.join(', ')}, Transkrip: ${transcript}. [OUTPUT JSON] Buat rangkuman: 'discussionSummary', 'keyDecisions' (array of strings), dan 'actionItems' (array of {member, task}).`;
        const schema = {
            type: Type.OBJECT,
            properties: {
                discussionSummary: { type: Type.STRING },
                keyDecisions: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { member: { type: Type.STRING }, task: { type: Type.STRING } }, required: ['member', 'task'] } }
            },
            required: ['discussionSummary', 'keyDecisions', 'actionItems']
        };
        const payload = await createJsonPayload(prompt, schema);
        const response = await executeGeneration(payload);
        return JSON.parse(response.text.trim()) as GroupProjectSummary;
    } catch (error) {
        console.error("Error generating group project summary:", error);
        throw new Error("Gagal membuat rangkuman sesi kelompok. Silakan coba lagi.");
    }
};