import React, { useState } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface TimeManagementPageProps {
  setActiveView: (view: AppView) => void;
}

const timeManagementTechniques = [
    {
        id: 'pomodoro',
        title: 'Teknik Pomodoro',
        content: {
            definition: "Teknik Pomodoro adalah metode manajemen waktu yang memecah pekerjaan menjadi interval terfokus, biasanya 25 menit (\"pomodoro\"), diikuti oleh istirahat singkat 5 menit. Setelah empat siklus, diambil istirahat yang lebih panjang (15-30 menit).",
            coreConcept: "Konsepnya adalah fokus merupakan sumber daya terbatas. Dengan bekerja dalam sprint singkat dan intens diselingi istirahat, individu dapat mempertahankan konsentrasi tinggi, mengelola energi mental, dan membuat tugas besar terasa lebih mudah dikelola.",
            history: "Teknik ini dikembangkan pada akhir 1980-an oleh Francesco Cirillo saat masih mahasiswa. Ia menggunakan pengatur waktu dapur berbentuk tomat (\"pomodoro\" dalam bahasa Italia) untuk menantang dirinya sendiri agar fokus, yang kemudian menjadi dasar dari sistem ini.",
            steps: [
                { title: "Pilih Tugas", description: "Tentukan satu tugas spesifik." },
                { title: "Atur Timer", description: "Atur pengatur waktu selama 25 menit." },
                { title: "Bekerja pada Tugas", description: "Bekerja tanpa gangguan hingga timer berbunyi." },
                { title: "Ambil Istirahat Singkat", description: "Setelah 25 menit, istirahat selama 5 menit." },
                { title: "Ambil Istirahat Panjang", description: "Setelah empat pomodoro, istirahat selama 15-30 menit." }
            ],
            discussion: "Keefektifan Pomodoro berakar pada kemampuannya untuk memanipulasi dua mode berpikir otak: mode fokus dan mode difus.\n\nMode Fokus: Sesi kerja 25 menit mengaktifkan mode ini, di mana korteks prefrontal aktif untuk pekerjaan yang mendetail.\nMode Difus: Istirahat memungkinkan otak beralih ke mode ini, yang penting untuk kreativitas, melihat gambaran besar, dan konsolidasi memori.\n\nTeknik ini juga selaras dengan ritme ultradian tubuh (siklus aktivitas dan istirahat alami), yang membantu mencegah kelelahan mental.",
            caseStudy: "Mahasiswa Menulis Esai: Memecah tugas penulisan esai menjadi beberapa pomodoro: Pomodoro 1-2 untuk riset, Pomodoro 3 untuk kerangka, dan seterusnya.\nPengembang Perangkat Lunak: Menggunakan satu pomodoro untuk menulis satu fungsi kode, pomodoro berikutnya untuk debugging.",
            glossary: [
                { term: "Mode Fokus", definition: "Keadaan mental konsentrasi tinggi." },
                { term: "Mode Difus", definition: "Keadaan mental rileks untuk koneksi kreatif." },
                { term: "Ritme Ultradian", definition: "Siklus biologis alami yang berulang sepanjang hari." }
            ]
        }
    },
    {
        id: 'eat-that-frog',
        title: 'Eat That Frog',
        content: {
            definition: "\"Eat That Frog\" adalah metode prioritas yang menganjurkan untuk mengidentifikasi dan menyelesaikan satu tugas yang paling penting dan menantang (\"katak\") sebagai hal pertama di pagi hari.",
            coreConcept: "Konsepnya adalah mengatasi prokrastinasi dengan menyelesaikan tugas yang paling membebani pikiran di awal hari. Ini membangun momentum positif dan membuat sisa hari terasa lebih ringan.",
            history: "Metode ini dipopulerkan oleh Brian Tracy dalam bukunya \"Eat That Frog!: 21 Great Ways to Stop Procrastinating and Get More Done in Less Time\" (2001). Ia mengadaptasi kutipan Mark Twain menjadi sistem praktis untuk fokus pada tugas berdampak tinggi.",
            steps: [
                { title: "Identifikasi \"Katak\" Anda", description: "Tentukan tugas yang paling penting dan paling mungkin Anda tunda." },
                { title: "Makan yang Paling Besar Dulu", description: "Jika ada lebih dari satu \"katak\", kerjakan yang paling menantang terlebih dahulu." },
                { title: "Kerjakan di Pagi Hari", description: "Manfaatkan energi dan kemauan puncak di pagi hari." },
                { title: "Persiapkan Malam Sebelumnya", description: "Tentukan \"katak\" untuk esok hari pada malam sebelumnya untuk menghilangkan hambatan." },
                { title: "Pecah Tugas Jika Perlu", description: "Jika \"katak\" terlalu besar, pecah menjadi langkah-langkah yang lebih kecil." }
            ],
            discussion: "Metode ini efektif karena memanfaatkan pemahaman tentang keterbatasan sumber daya kognitif, khususnya tenaga tekad (willpower) dan kelelahan keputusan (decision fatigue).\n\nTenaga tekad dan fungsi eksekutif otak berada pada puncaknya di pagi hari setelah istirahat. Dengan mengerjakan tugas tersulit (\"katak\") saat sumber daya mental terbaik tersedia, Anda menghindari decision fatigue yang terjadi di kemudian hari. Menyelesaikan tugas besar di awal hari menciptakan rasa pencapaian yang signifikan, memicu pelepasan dopamin dan membangun momentum positif.",
            caseStudy: "Mahasiswa Mengerjakan Skripsi: \"Katak\"-nya adalah menulis bagian \"Tinjauan Pustaka\". Ia mendedikasikan 90 menit pertama setiap pagi untuk tugas ini sebelum melakukan hal lain.\nManajer Proyek: \"Katak\"-nya adalah menyusun laporan triwulanan yang kompleks. Ia memblokir jadwalnya dari jam 8-10 pagi untuk fokus sepenuhnya pada tugas ini.",
            glossary: [
                { term: "Decision Fatigue", definition: "Penurunan kualitas keputusan setelah sesi pengambilan keputusan yang panjang." },
                { term: "Willpower (Tenaga Tekad)", definition: "Kemampuan mengendalikan diri untuk mencapai tujuan jangka panjang." },
                { term: "Momentum Perilaku", definition: "Prinsip bahwa setelah memulai suatu tindakan, kemungkinan untuk melanjutkannya meningkat." }
            ]
        }
    },
    {
        id: 'two-minute-rule',
        title: 'Two Minute Rule',
        content: {
            definition: "Aturan Dua Menit adalah taktik produktivitas dari David Allen dengan dua variasi:\n1. Untuk Tugas Kecil: \"Jika suatu tindakan akan memakan waktu kurang dari dua menit, lakukan saat itu juga\".\n2. Untuk Memulai Kebiasaan: \"Ketika Anda memulai kebiasaan baru, itu harus memakan waktu kurang dari dua menit untuk dilakukan\".",
            coreConcept: "Konsepnya adalah mengatasi inersia dan prokrastinasi dengan menurunkan \"energi aktivasi\" yang dibutuhkan untuk memulai suatu tindakan. Dengan membuat langkah pertama sangat kecil, aturan ini menipu otak untuk memulai, yang seringkali merupakan bagian tersulit.",
            history: "Aturan ini diperkenalkan oleh David Allen dalam bukunya \"Getting Things Done\" (2001). Logikanya adalah seringkali dibutuhkan waktu lebih lama untuk melacak tugas kecil daripada langsung menyelesaikannya. Konsep ini diperluas oleh James Clear dalam \"Atomic Habits\" sebagai cara membangun kebiasaan baru.",
            steps: [
                { title: "Varian 1 (Tugas Cepat)", description: "Saat tugas baru muncul, tanyakan: \"Apakah ini bisa selesai dalam dua menit?\". Jika ya, selesaikan segera." },
                { title: "Varian 2 (Memulai Tugas Besar)", description: "Pecah tujuan besar menjadi versi dua menit yang sangat sederhana. Contoh: \"Menulis skripsi\" menjadi \"Menulis satu kalimat\"." }
            ],
            discussion: "Aturan ini adalah peretasan perilaku (behavioral hack) yang memanfaatkan prinsip psikologi untuk mengatasi inersia prokrastinasi.\n\nAturan ini membingkai ulang tugas besar yang mengintimidasi menjadi langkah kecil yang tidak menakutkan, mengurangi beban kognitif yang dirasakan. Ini memanfaatkan Hukum Inersia Newton: sebuah objek yang bergerak cenderung tetap bergerak. Aturan ini memberikan \"dorongan\" awal untuk mengatasi inersia. Setelah dimulai, terciptalah momentum perilaku, membuatnya lebih mudah untuk melanjutkan. Menyelesaikan tugas kecil segera juga mengurangi kekacauan kognitif dengan menutup \"loop terbuka\" di memori kerja.",
            caseStudy: "Mengatasi Tumpukan Email: Segera membalas, mengarsipkan, atau menghapus setiap email yang dapat ditangani dalam waktu kurang dari dua menit.\nMembangun Kebiasaan Berolahraga: Tujuannya bukan \"berlari 5 km\", melainkan hanya \"memakai sepatu lari dan keluar dari pintu\".\nMengerjakan Tugas Kuliah: Memulai makalah dengan berkata, \"Saya hanya akan membuka dokumen dan menulis judulnya\".",
            glossary: [
                { term: "Inersia Prokrastinasi", definition: "Kecenderungan untuk tetap dalam keadaan tidak bertindak." },
                { term: "Momentum Perilaku", definition: "Prinsip bahwa kemungkinan suatu perilaku akan terjadi meningkat setelah tindakan awal." },
                { term: "Getting Things Done (GTD)", definition: "Metodologi produktivitas oleh David Allen." }
            ]
        }
    },
    {
        id: 'eisenhower-matrix',
        title: 'Matriks Eisenhower',
        content: {
            definition: "Matriks Eisenhower (Matriks Mendesak-Penting) adalah alat manajemen tugas yang mengkategorikan pekerjaan berdasarkan dua dimensi: urgensi dan kepentingan, menghasilkan empat kuadran tindakan: Do (Kerjakan), Schedule (Jadwalkan), Delegate (Delegasikan), dan Delete (Hapus).",
            coreConcept: "Konsepnya adalah membedakan secara kritis antara apa yang mendesak (memerlukan perhatian segera) dan apa yang penting (berkontribusi pada tujuan jangka panjang). Metode ini membantu individu untuk tidak terjebak mengerjakan tugas mendesak yang tidak penting, dan fokus pada apa yang benar-benar bernilai.",
            history: "Metode ini dinamai menurut Dwight D. Eisenhower, yang membedakan masalahnya menjadi \"mendesak\" dan \"penting\". Prinsip ini kemudian dipopulerkan oleh Stephen R. Covey dalam bukunya \"The 7 Habits of Highly Effective People\".",
            steps: [
                { title: "Kuadran 1: Mendesak & Penting (Do)", description: "Krisis, masalah mendesak, tenggat waktu dekat. Kerjakan segera." },
                { title: "Kuadran 2: Tidak Mendesak & Penting (Schedule)", description: "Perencanaan, pengembangan diri, membangun hubungan. Ini adalah kuadran efektivitas; jadwalkan waktu untuk tugas-tugas ini." },
                { title: "Kuadran 3: Mendesak & Tidak Penting (Delegate)", description: "Interupsi, beberapa rapat, email. Delegasikan jika memungkinkan." },
                { title: "Kuadran 4: Tidak Mendesak & Tidak Penting (Delete)", description: "Aktivitas sepele, pembuang waktu. Hindari atau hapus." }
            ],
            discussion: "Matriks ini adalah alat metakognitif untuk melawan \"Mere Urgency Effect\" atau \"Urgency Trap\"—bias kognitif di mana manusia cenderung memprioritaskan tugas mendesak meskipun imbalannya lebih kecil, daripada tugas penting dengan imbalan jangka panjang yang lebih besar. Matriks ini memaksa jeda sadar untuk mengevaluasi setiap tugas terhadap tujuan jangka panjang (kriteria 'Penting') sebelum sistem reaktif otak mengambil alih karena 'Urgensi'-nya.",
            caseStudy: "Seorang mahasiswa pascasarjana menggunakan matriks ini untuk merencanakan minggunya:\nKuadran 1: Menyelesaikan revisi bab dengan tenggat waktu Jumat.\nKuadran 2: Memblokir waktu untuk menulis bab baru dan membaca jurnal.\nKuadran 3: Meminta asisten riset memformat daftar pustaka.\nKuadran 4: Menghindari media sosial selama jam kerja.",
            glossary: [
                { term: "Urgensi", definition: "Sifat tugas yang menuntut perhatian segera." },
                { term: "Kepentingan", definition: "Sifat tugas yang berkontribusi pada tujuan jangka panjang." },
                { term: "Mere Urgency Effect", definition: "Bias kognitif yang memprioritaskan urgensi di atas kepentingan." }
            ]
        }
    },
    {
        id: 'time-blocking',
        title: 'Metode Time Blocking',
        content: {
            definition: "Time Blocking adalah metode manajemen waktu di mana setiap periode waktu dalam hari direncanakan dan didedikasikan untuk tugas atau kelompok tugas tertentu, biasanya menggunakan kalender.",
            coreConcept: "Konsepnya didasarkan pada Hukum Parkinson: \"pekerjaan akan mengembang untuk mengisi waktu yang tersedia\". Dengan memberikan batasan waktu yang jelas, metode ini mendorong fokus mendalam dan mencegah penundaan. Tujuannya adalah untuk menjadi proaktif tentang bagaimana waktu dihabiskan.",
            history: "Metode ini dipopulerkan oleh tokoh-tokoh seperti Cal Newport, penulis \"Deep Work\", yang berpendapat bahwa individu paling produktif secara cermat merancang jadwal mereka untuk melindungi waktu untuk pekerjaan yang paling penting.",
            steps: [
                { title: "Identifikasi Tugas", description: "Buat daftar semua tugas yang perlu diselesaikan." },
                { title: "Perkirakan Waktu", description: "Estimasi waktu yang realistis untuk setiap tugas." },
                { title: "Alokasikan Blok di Kalender", description: "Jadwalkan blok waktu untuk setiap tugas di kalender Anda, mulai dari komitmen yang tidak fleksibel." },
                { title: "Sertakan Waktu Penyangga (Buffer Time)", description: "Jadwalkan blok kosong singkat di antara tugas utama untuk transisi atau istirahat." },
                { title: "Tinjau dan Sesuaikan", description: "Jadwal bersifat fleksibel; sesuaikan jika ada gangguan dan tinjau di akhir hari." }
            ],
            discussion: "Time blocking efektif karena mengatasi beban kognitif dan kelelahan keputusan (decision fatigue). Dengan merencanakan jadwal di muka, sumber daya mental dibebaskan dari tugas merencanakan dan dapat didedikasikan sepenuhnya untuk melakukan pekerjaan. Metode ini juga mendukung fungsi eksekutif otak dengan mengurangi hambatan untuk memulai tugas (task initiation) dan meminimalkan context switching yang tidak efisien.",
            caseStudy: "Mahasiswa Menjelang Ujian: Menggunakan time blocking untuk menyusun jadwal revisi mingguan, mengalokasikan blok waktu spesifik untuk setiap mata pelajaran.\nPekerja Lepas (Freelancer): Menggunakan varian day theming, di mana setiap hari didedikasikan untuk klien atau jenis pekerjaan tertentu untuk memaksimalkan fokus.",
            glossary: [
                { term: "Hukum Parkinson", definition: "Adagium bahwa pekerjaan mengembang untuk mengisi waktu yang tersedia." },
                { term: "Deep Work", definition: "Aktivitas profesional yang dilakukan dalam keadaan konsentrasi bebas gangguan." },
                { term: "Context Switching", definition: "Proses memuat ulang konteks mental saat beralih antar tugas, yang mengakibatkan hilangnya efisiensi." }
            ]
        }
    }
];

const ContentSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-2xl font-bold text-ut-blue-light font-display mb-3 border-b-2 border-ut-blue/30 pb-2">{title}</h3>
        <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-4">
            {children}
        </div>
    </div>
);

export const TimeManagementPage: React.FC<TimeManagementPageProps> = ({ setActiveView }) => {
    const [activeMethodId, setActiveMethodId] = useState(timeManagementTechniques[0].id);
    const parentView = PARENT_VIEW_MAP['Teknik Manajemen Waktu'];
    const activeMethod = timeManagementTechniques.find(m => m.id === activeMethodId);

    return (
        <section id="Teknik-Manajemen-Waktu" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Teknik Manajemen Waktu</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Terapkan berbagai teknik manajemen waktu untuk memaksimalkan produktivitas Anda.</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />

                    <div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                            {timeManagementTechniques.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setActiveMethodId(method.id)}
                                    className={`p-4 rounded-lg text-center transition-all duration-300 font-display font-semibold ${
                                        activeMethodId === method.id 
                                        ? 'bg-ut-blue text-white shadow-lg -translate-y-1' 
                                        : 'bg-slate-700/50 hover:bg-slate-700'
                                    }`}
                                >
                                    {method.title}
                                </button>
                            ))}
                        </div>

                        {activeMethod && (
                            <div className="p-4 bg-slate-900/30 rounded-lg">
                                <h2 className="text-3xl font-bold font-display text-white">{activeMethod.title}</h2>
                                <hr className="my-4 border-slate-700" />
                                
                                {activeMethod.content.definition && <ContentSection title="Definisi"><p className="whitespace-pre-wrap">{activeMethod.content.definition}</p></ContentSection>}
                                {activeMethod.content.coreConcept && <ContentSection title="Konsep Inti"><p>{activeMethod.content.coreConcept}</p></ContentSection>}
                                {activeMethod.content.history && <ContentSection title="Sejarah dan Latar Belakang"><p>{activeMethod.content.history}</p></ContentSection>}
                                
                                {activeMethod.content.steps && (
                                    <ContentSection title="Alur dan Elemen">
                                        <ul className="space-y-4">
                                            {activeMethod.content.steps.map(step => (
                                                <li key={step.title} className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-ut-blue">
                                                    <strong className="font-bold text-white font-display block">{step.title}</strong>
                                                    <p className="mt-1 text-slate-300">{step.description}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </ContentSection>
                                )}
                                
                                {activeMethod.content.discussion && <ContentSection title="Pembahasan Mendalam dan Ilmiah"><p className="whitespace-pre-wrap">{activeMethod.content.discussion}</p></ContentSection>}
                                {activeMethod.content.caseStudy && <ContentSection title="Studi Kasus dan Contoh Penerapan"><p className="whitespace-pre-wrap">{activeMethod.content.caseStudy}</p></ContentSection>}
                                
                                {activeMethod.content.glossary && (
                                    <ContentSection title="Glosarium">
                                        <dl className="space-y-3">
                                            {activeMethod.content.glossary.map(item => (
                                                <div key={item.term} className="p-3 bg-slate-900/50 rounded-md">
                                                    <dt className="font-semibold text-white font-display">{item.term}</dt>
                                                    <dd className="text-slate-400">{item.definition}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </ContentSection>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};