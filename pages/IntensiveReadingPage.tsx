import React, { useState } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface IntensiveReadingPageProps {
  setActiveView: (view: AppView) => void;
}

const readingMethods = [
    {
        id: 'sq3r',
        title: 'Metode SQ3R',
        subtitle: '(Survey, Question, Read, Recite, Review)',
        content: {
            definition: "Metode SQ3R adalah sebuah strategi studi komprehensif yang terdiri dari lima langkah terstruktur: Survey (Survei), Question (Bertanya), Read (Membaca), Recite (Menyebutkan Kembali), dan Review (Meninjau Ulang). Teknik ini dirancang secara sistematis untuk meningkatkan kemampuan pembaca dalam memahami dan mengingat informasi dari materi tekstual, khususnya dalam konteks akademik. Tujuannya adalah untuk mengubah proses membaca dari aktivitas pasif menjadi sebuah keterlibatan aktif yang mendalam dengan materi.",
            coreConcept: "Konsep fundamental dari SQ3R adalah pembelajaran aktif. Metode ini didasarkan pada premis bahwa pemahaman sejati tidak dicapai melalui penyerapan informasi secara pasif, melainkan melalui proses konstruksi makna yang aktif oleh pembelajar. Pembaca didorong untuk tidak hanya menghafal atau mengulang bacaan, tetapi untuk terlibat langsung dalam proses berpikir, memahami, dan menginternalisasi isi bacaan. Dengan demikian, SQ3R mengubah pembaca menjadi seorang partisipan yang kritis, yang secara aktif membangun pemahamannya sendiri dengan berdialog dengan teks. Proses ini bergantung pada pengetahuan sebelumnya yang dimiliki pembaca, di mana informasi baru diintegrasikan dengan skema kognitif yang sudah ada untuk membentuk pemahaman yang utuh dan bertahan lama.",
            history: "Metode SQ3R dikembangkan pada tahun 1941 oleh Francis P. Robinson, seorang guru besar psikologi pendidikan dari Ohio State University. Metode ini lahir dari kebutuhan praktis untuk membekali para mahasiswa dengan strategi belajar yang efektif dan sistematis guna menghadapi tuntutan materi akademik yang padat dan kompleks. Pada masa itu, banyak mahasiswa yang kesulitan dalam memahami dan mengingat isi buku teks mereka. Robinson merancang SQ3R sebagai sebuah kerangka kerja yang dapat diajarkan untuk meningkatkan efisiensi dan efektivitas belajar, yang kemudian menjadi salah satu metode studi yang paling dikenal dan banyak digunakan di seluruh dunia.",
            steps: [
                { title: "S - Survey (Survei)", description: "Langkah pertama adalah melakukan peninjauan singkat terhadap keseluruhan teks. Ini melibatkan membaca judul, subjudul, kata pengantar, ringkasan bab, serta memperhatikan gambar, grafik, atau istilah yang dicetak tebal. Tujuannya adalah untuk mendapatkan gambaran umum tentang struktur dan konten materi, yang berfungsi untuk membangun kerangka kerja mental (mental framework) sebelum membaca secara mendalam." },
                { title: "Q - Question (Bertanya)", description: "Pada tahap ini, pembaca secara aktif mengubah judul, subjudul, dan poin-poin utama yang ditemukan saat survei menjadi serangkaian pertanyaan. Langkah ini menciptakan tujuan yang jelas untuk membaca dan memfokuskan perhatian pada pencarian jawaban, sehingga meningkatkan rasa ingin tahu dan keterlibatan." },
                { title: "R - Read (Membaca)", description: "Langkah ketiga adalah membaca teks secara aktif dan saksama dengan tujuan utama untuk menemukan jawaban atas pertanyaan-pertanyaan yang telah dirumuskan sebelumnya. Pembaca tidak lagi membaca tanpa arah, melainkan dengan misi yang spesifik. Selama membaca, disarankan untuk menandai atau membuat catatan kecil pada bagian-bagian yang relevan dengan pertanyaan." },
                { title: "R - Recite (Menyebutkan Kembali)", description: "Setelah menyelesaikan satu bagian atau bab, pembaca berhenti sejenak dan mencoba menjawab pertanyaan yang relevan dengan bagian tersebut menggunakan kata-katanya sendiri, tanpa melihat kembali ke teks. Proses ini bisa dilakukan dengan lisan atau tulisan. Langkah Recite adalah ujian pemahaman awal yang krusial; jika pembaca tidak dapat meringkas atau menjawab pertanyaan, itu adalah indikasi bahwa mereka perlu membaca ulang bagian tersebut." },
                { title: "R - Review (Meninjau Ulang)", description: "Langkah terakhir adalah meninjau kembali keseluruhan materi. Ini melibatkan membaca ulang catatan, melihat kembali pertanyaan dan jawaban, serta memastikan pemahaman yang koheren atas seluruh bab atau artikel. Tinjauan ini berfungsi untuk mengkonsolidasikan informasi dalam memori jangka panjang dan melihat bagaimana setiap bagian saling terhubung untuk membentuk gambaran besar." }
            ],
            discussion: "Keefektifan metode SQ3R berakar kuat pada prinsip-prinsip fundamental ilmu kognitif tentang cara otak belajar dan mengingat. Secara spesifik, metode ini secara inheren mengoperasionalkan dua mekanisme pembelajaran yang sangat kuat: Generation Effect (Efek Generasi) dan Retrieval Practice (Latihan Mengingat Kembali).\n\nGeneration Effect: Langkah Question memaksa pembelajar untuk secara aktif menghasilkan kerangka kerja untuk pengetahuan yang akan datang. Informasi yang dihasilkan sendiri oleh individu akan diingat secara signifikan lebih baik daripada informasi yang hanya dibaca secara pasif.\n\nRetrieval Practice: Langkah Recite dan Review adalah bentuk eksplisit dari latihan menarik kembali informasi dari memori. Setiap kali informasi ditarik dari memori, jejak memori tersebut diperkuat, menjadikannya salah satu strategi paling ampuh untuk membangun memori jangka panjang yang kuat.",
            caseStudy: "Efektivitas metode SQ3R telah divalidasi melalui berbagai penelitian. Studi pada siswa sekolah dasar menunjukkan bahwa penerapan SQ3R berhasil meningkatkan keterampilan membaca pemahaman secara signifikan.",
            glossary: [
                { term: "Pembelajaran Aktif", definition: "Pendekatan di mana siswa terlibat aktif dalam proses pembelajaran, bukan hanya menerima informasi secara pasif." },
                { term: "Generation Effect", definition: "Fenomena memori di mana informasi lebih mungkin diingat jika dihasilkan dari pikiran sendiri daripada hanya dibaca." },
                { term: "Retrieval Practice", definition: "Strategi belajar yang berfokus pada penarikan kembali informasi dari memori secara aktif, juga dikenal sebagai testing effect." },
                { term: "Skema Kognitif", definition: "Struktur mental yang merepresentasikan beberapa aspek dunia, membantu mengorganisir dan menginterpretasikan informasi." }
            ]
        }
    },
    {
        id: 'sq4r',
        title: 'Metode SQ4R',
        subtitle: '(Survey, Question, Read, Reflect, Recite, Review)',
        content: {
            definition: "Metode SQ4R adalah sebuah strategi membaca dan belajar yang merupakan pengembangan dari metode SQ3R. Akronim ini terdiri dari enam langkah: Survey (Survei), Question (Bertanya), Read (Membaca), Reflect (Refleksi), Recite (Menyebutkan Kembali), dan Review (Meninjau Ulang). Penambahan langkah krusial Reflect bertujuan untuk mendorong pemrosesan informasi yang lebih dalam dan pemahaman yang lebih komprehensif.",
            history: "Metode SQ4R dikembangkan oleh Thomas dan Robinson pada tahun 1972. Metode ini lahir sebagai penyempurnaan dari metode SQ3R yang diperkenalkan oleh Francis P. Robinson pada tahun 1941. Pengenalan langkah Reflect didasarkan pada pemahaman bahwa pemahaman sejati tidak hanya melibatkan ekstraksi fakta, tetapi juga kemampuan untuk berpikir kritis, menghubungkannya dengan pengetahuan yang ada, dan memahami implikasinya.",
            steps: [
                { title: "Survey", description: "Peninjauan cepat materi untuk mendapatkan gambaran besar." },
                { title: "Question", description: "Mengubah judul dan subjudul menjadi pertanyaan untuk memberikan tujuan membaca." },
                { title: "Read", description: "Membaca materi secara aktif untuk menjawab pertanyaan yang telah dibuat." },
                { title: "Reflect (Refleksi)", description: "Berhenti sejenak untuk merenungkan apa yang baru dibaca. Ini melibatkan menghubungkan informasi baru dengan pengetahuan yang ada, mencari relevansi, dan mempertanyakan materi." },
                { title: "Recite", description: "Menyatakan kembali informasi utama dengan kata-kata sendiri tanpa melihat teks." },
                { title: "Review", description: "Meninjau kembali seluruh materi secara berkala untuk memperkuat ingatan." }
            ],
            discussion: "Penambahan langkah Reflect dalam SQ4R adalah intervensi kognitif yang ditargetkan untuk meningkatkan kedalaman pemrosesan informasi melalui proses elaborasi dan percepatan konsolidasi memori. Menurut Teori Tingkat Pemrosesan (Levels of Processing Theory), informasi yang diproses pada tingkat yang lebih dalam (semantik, elaboratif) akan diingat lebih baik. Langkah Reflect secara eksplisit mendorong pemrosesan elaboratif, yaitu proses memperluas jejak memori dengan menghubungkan informasi baru ke dalam jaringan pengetahuan yang sudah ada (skema kognitif).",
            caseStudy: "Penelitian menunjukkan bahwa metode SQ4R efektif dalam meningkatkan hasil belajar dan motivasi. Sebuah studi menemukan bahwa penerapan teknik SQ4R berhasil meningkatkan skor rata-rata siswa dari 62.39 menjadi 79.14. Studi lain menyoroti bahwa unsur reflect sangat berguna untuk memberikan contoh yang relevan dari bahan bacaan, yang membantu pemahaman materi abstrak.",
            glossary: [
                { term: "Elaborasi", definition: "Proses kognitif untuk menghubungkan informasi baru dengan pengetahuan yang sudah ada." },
                { term: "Konsolidasi Memori", definition: "Proses neurobiologis di mana jejak memori distabilkan dan diintegrasikan ke dalam memori jangka panjang." },
                { term: "Metakognisi", definition: "Kesadaran dan pemahaman tentang proses berpikir sendiri." }
            ]
        }
    },
    {
        id: 'pqrst',
        title: 'Metode PQRST',
        subtitle: '(Preview, Question, Read, Summarize, Test)',
        content: {
            definition: "Metode PQRST adalah sebuah strategi belajar lima tahap yang merupakan akronim dari Preview (Pratinjau), Question (Bertanya), Read (Membaca), Summarize (Meringkas), dan Test (Menguji). Ini adalah kerangka kerja terstruktur yang dirancang untuk memandu pembelajar dalam berinteraksi secara aktif dengan materi tekstual untuk meningkatkan pemahaman dan retensi.",
            coreConcept: "Keunikan PQRST terletak pada penekanan pada dua langkah terakhir: Summarize dan Test. Jika SQ3R menggabungkan aktivitas ini dalam langkah Recite, PQRST memecahnya menjadi dua tindakan kognitif berbeda: Summarize berfokus pada rekonstruksi informasi secara holistik, sementara Test berfokus pada evaluasi diri dan identifikasi kesenjangan pengetahuan.",
            steps: [
                { title: "P - Preview (Pratinjau)", description: "Melakukan peninjauan cepat terhadap materi (judul, subjudul, ringkasan) untuk membangun kerangka mental." },
                { title: "Q - Question (Bertanya)", description: "Mengubah judul dan subjudul menjadi pertanyaan untuk menciptakan tujuan membaca yang aktif." },
                { title: "R - Read (Membaca)", description: "Membaca materi secara mendalam untuk menemukan jawaban atas pertanyaan yang telah dirumuskan." },
                { title: "S - Summarize (Meringkas)", description: "Setelah membaca, meringkas poin-poin kunci dari ingatan dengan kata-kata sendiri." },
                { title: "T - Test (Menguji)", description: "Menguji pemahaman diri dengan mencoba menjawab pertanyaan yang dibuat pada tahap 'Question' dari ingatan." }
            ],
            discussion: "Pemisahan langkah Summarize dan Test secara eksplisit mengintegrasikan efek pengujian (testing effect) sebagai inti dari proses belajar.\n\nSummarize adalah bentuk dari free recall (pengingatan bebas), yang menuntut otak untuk merekonstruksi struktur logis dan hubungan antar konsep.\n\nTest adalah bentuk dari cued recall (pengingatan terbantu), yang memperkuat hubungan asosiatif antara petunjuk (pertanyaan) dan jawaban. Dengan melatih kedua jenis pengambilan memori ini, PQRST menciptakan jejak memori yang lebih kaya dan terorganisir.",
            caseStudy: "Metode PQRST terbukti efektif dalam berbagai konteks. Sebuah studi menunjukkan peningkatan signifikan dalam hasil belajar siswa TIK di SMA setelah penerapan model PQRST, dengan ketuntasan klasikal meningkat dari 38.46% menjadi 88.46%. Penerapan lain yang menarik adalah sebagai mnemonik PQRST untuk pengkajian nyeri pasien di pendidikan kedokteran dan keperawatan.",
            glossary: [
                { term: "Testing Effect", definition: "Prinsip bahwa pengujian memori jangka panjang lebih efektif jika sebagian waktu belajar dikhususkan untuk mengambil kembali informasi." },
                { term: "Free Recall", definition: "Proses mengingat kembali item dari daftar dalam urutan apa pun, tanpa petunjuk spesifik." },
                { term: "Cued Recall", definition: "Proses mengingat kembali item sebagai respons terhadap petunjuk atau isyarat." },
                { term: "Mnemonik", definition: "Teknik atau alat bantu memori." }
            ]
        }
    },
    {
        id: 'kwlh',
        title: 'Metode KWLH',
        subtitle: '(Know, Want, Learned, How)',
        content: {
            definition: "Metode KWLH (atau KWL) adalah sebuah graphic organizer dan strategi instruksional yang memandu siswa melalui proses membaca. Akronim ini mewakili empat kolom: K (What I already Know), W (What I Want to know), L (What I have Learned), dan H (How I can learn more). Strategi ini dirancang untuk mengaktifkan pengetahuan awal, menetapkan tujuan belajar, dan memonitor pemahaman.",
            coreConcept: "Konsep yang mendasari metode KWLH adalah teori belajar konstruktivis. Teori ini berpandangan bahwa belajar adalah proses aktif di mana individu membangun (construct) pengetahuan baru berdasarkan pengalaman dan pengetahuan yang telah mereka miliki sebelumnya.",
            steps: [
                { title: "K (Know)", description: "Sebelum membaca, siswa melakukan curah pendapat (brainstorming) tentang apa yang sudah mereka ketahui tentang topik tersebut." },
                { title: "W (Want to Know)", description: "Siswa merumuskan pertanyaan tentang apa yang ingin mereka pelajari dari teks." },
                { title: "L (Learned)", description: "Setelah membaca, siswa mencatat informasi baru yang telah mereka pelajari dan menjawab pertanyaan dari kolom 'W'." },
                { title: "H (How I Can Learn More)", description: "Siswa berpikir tentang langkah selanjutnya untuk belajar lebih lanjut, seperti sumber tambahan atau proyek." }
            ],
            discussion: "Metode KWLH adalah perwujudan praktis dari teori skema Piaget dan teori konstruktivisme sosial Vygotsky.\n\nLangkah 'K' (Know) adalah aplikasi langsung dari teori skema Piaget, yang mengaktifkan struktur mental yang relevan untuk menerima informasi baru.\n\nLangkah 'W' (Want to Know) mencerminkan konsep Zone of Proximal Development (ZPD) dari Vygotsky, di mana siswa mengidentifikasi batas pengetahuan mereka dan menetapkan tujuan belajar yang menantang namun dapat dicapai.\n\nLangkah 'L' (Learned) adalah inti dari proses konstruksi pengetahuan, di mana siswa secara aktif membandingkan, menjawab, dan merevisi skema mental mereka.",
            caseStudy: "Efektivitas KWLH telah didokumentasikan dalam berbagai penelitian. Sebuah studi oleh Riswanto (2014) mengungkapkan bahwa strategi KWL sangat efektif, dengan kontribusi terhadap peningkatan kemampuan membaca siswa mencapai 70.5%. Penelitian lain menunjukkan peningkatan nilai siswa yang signifikan di setiap siklus, dengan persentase kelulusan naik dari 45% menjadi 100%.",
            glossary: [
                { term: "Konstruktivisme", definition: "Teori belajar yang menyatakan bahwa pembelajar secara aktif membangun pengetahuan mereka sendiri." },
                { term: "Teori Skema", definition: "Teori kognitif tentang bagaimana otak menstrukturkan pengetahuan dalam unit-unit yang terorganisir." },
                { term: "Zone of Proximal Development (ZPD)", definition: "Konsep Vygotsky tentang perbedaan antara apa yang dapat dicapai pembelajar secara mandiri dan dengan bimbingan." }
            ]
        }
    },
];

const ContentSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-2xl font-bold text-ut-blue-light font-display mb-3 border-b-2 border-ut-blue/30 pb-2">{title}</h3>
        <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-4">
            {children}
        </div>
    </div>
);

export const IntensiveReadingPage: React.FC<IntensiveReadingPageProps> = ({ setActiveView }) => {
    const [activeMethodId, setActiveMethodId] = useState(readingMethods[0].id);
    const parentView = PARENT_VIEW_MAP['Metode Membaca Intensif'];
    const activeMethod = readingMethods.find(m => m.id === activeMethodId);

    return (
        <section id="Metode-Membaca-Intensif" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Metode Membaca Intensif</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Fokus pada pemahaman mendalam dan analisis detail dari materi bacaan yang kompleks.</p>
                </div>

                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader 
                        parentView={parentView}
                        setActiveView={setActiveView}
                    />

                    <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                            {readingMethods.map(method => (
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
                                <h2 className="text-3xl font-bold font-display text-white">{activeMethod.title} <span className="text-2xl text-slate-400">{activeMethod.subtitle}</span></h2>
                                <hr className="my-4 border-slate-700" />
                                
                                {activeMethod.content.definition && <ContentSection title="Definisi"><p>{activeMethod.content.definition}</p></ContentSection>}
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
                                {activeMethod.content.caseStudy && <ContentSection title="Studi Kasus dan Contoh Penerapan"><p>{activeMethod.content.caseStudy}</p></ContentSection>}
                                
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