export interface FaqItem {
  question: string;
  answer: string; // HTML content
}

export interface FaqCategory {
  id: string;
  title: string;
  faqs: FaqItem[];
}

export const panduanUtData: FaqCategory[] = [
  {
    id: "pengenalan",
    title: "I. Pengenalan",
    faqs: [
      {
        question: "Apa itu Universitas Terbuka (UT) dan statusnya sebagai Perguruan Tinggi Negeri (PTN)?",
        answer: `<p>Universitas Terbuka (UT) adalah Perguruan Tinggi Negeri (PTN) ke-45 di Indonesia yang diresmikan pada tahun 1984. UT memiliki status otonomi tertinggi sebagai Perguruan Tinggi Negeri Berbadan Hukum (PTN-BH), yang memberikannya fleksibilitas lebih dalam pengelolaan akademik dan non-akademik. Sesuai dengan misinya, "Making Higher Education Open to All," UT dirancang untuk menyediakan akses pendidikan tinggi yang berkualitas bagi seluruh lapisan masyarakat Indonesia, tanpa terkendala oleh batasan usia, lokasi geografis, atau waktu. Dengan model operasional yang unik, UT telah dipercaya oleh lebih dari 750.000 mahasiswa aktif di seluruh Indonesia dan mancanegara, menjadikannya salah satu universitas dengan jumlah mahasiswa terbesar.</p>`
      },
      {
        question: "Apa keunggulan utama berkuliah di UT?",
        answer: `<p>UT menawarkan beberapa keunggulan utama yang menjadikannya pilihan menarik bagi banyak kalangan, terutama bagi mereka yang sudah bekerja atau memiliki komitmen lain:</p>
                 <ul>
                    <li><strong>Fleksibilitas Tinggi:</strong> Mahasiswa dapat mengatur jadwal dan ritme belajar mereka sendiri. Konsep "Sesuai Gayamu!" memungkinkan perkuliahan dijalankan tanpa harus meninggalkan pekerjaan atau mengganggu aktivitas harian lainnya.</li>
                    <li><strong>Keterjangkauan Biaya:</strong> Biaya pendidikan di UT dirancang agar terjangkau. Terdapat berbagai skema pembayaran, termasuk sistem paket semester (SIPAS) dengan biaya mulai dari Rp 1,3 juta per semester, yang sudah mencakup biaya SKS, bahan ajar, dan layanan akademik dasar.</li>
                    <li><strong>Aksesibilitas Luas:</strong> Dengan sistem pembelajaran yang dominan daring (online), mahasiswa dapat mengikuti perkuliahan dari mana saja, baik dari seluruh penjuru Indonesia maupun dari luar negeri.</li>
                    <li><strong>Kualitas Terjamin:</strong> Sebagai PTN-BH, kualitas akademik UT tidak perlu diragukan. UT telah meraih akreditasi institusi "A" dari Badan Akreditasi Nasional Perguruan Tinggi (BAN-PT), dan sebagian besar program studinya juga telah terakreditasi A, B, atau Unggul.</li>
                 </ul>`
      },
      {
        question: "Apa yang dimaksud dengan sistem Pendidikan Terbuka dan Jarak Jauh (PTJJ) yang dianut UT?",
        answer: `<p>Sistem Pendidikan Terbuka dan Jarak Jauh (PTJJ) adalah model pembelajaran yang menjadi landasan operasional UT. Dalam sistem ini, tidak ada keharusan bagi mahasiswa dan dosen untuk bertemu secara fisik di ruang kelas pada waktu yang bersamaan. Proses belajar mengajar berpusat pada kemandirian mahasiswa (student-centered learning), di mana mahasiswa belajar secara mandiri menggunakan bahan ajar yang dirancang khusus, seperti modul cetak dan digital.</p>
                 <p>Untuk mendukung proses belajar mandiri tersebut, UT tidak membiarkan mahasiswanya belajar sendiri sepenuhnya. UT menyediakan serangkaian layanan bantuan belajar yang dapat dipilih oleh mahasiswa sesuai kebutuhan. Layanan ini meliputi Tutorial Online (TUTON) yang bersifat asinkron, Tutorial Tatap Muka (TTM) dan Tutorial Webinar (Tuweb) yang bersifat sinkron, serta Tugas Mata Kuliah (TMK) bagi mahasiswa yang belajar sepenuhnya mandiri.</p>
                 <p>Model ini secara fundamental membedakan UT dari universitas konvensional. Fokus investasi UT bukanlah pada pembangunan gedung perkuliahan fisik, melainkan pada pengembangan infrastruktur digital yang canggih (seperti Learning Management System dan Sistem Informasi Akademik), produksi bahan ajar berkualitas tinggi, dan pemeliharaan jaringan layanan yang luas melalui Unit Program Belajar Jarak Jauh (UPBJJ) di seluruh Indonesia. Pendekatan ini memungkinkan UT mencapai skalabilitas masif, yang terlihat dari targetnya untuk melayani hingga satu juta mahasiswa aktif, sebuah angka yang mustahil dicapai dengan model kampus tradisional.</p>`
      },
      {
        question: "Bagaimana cara menghubungi UT atau mendapatkan informasi resmi?",
        answer: `<p>Untuk mendapatkan informasi yang akurat dan resmi, calon mahasiswa dan mahasiswa dapat menghubungi UT melalui berbagai kanal berikut:</p>
                 <ul>
                    <li><strong>Situs Web Resmi:</strong> <a href="https://www.ut.ac.id/" target="_blank" rel="noopener noreferrer">https://www.ut.ac.id/</a></li>
                    <li><strong>Contact Center Hallo UT:</strong> 1500024 (jika dari luar negeri, gunakan kode +6221)</li>
                    <li><strong>WhatsApp:</strong> 0811 4150 0024</li>
                    <li><strong>Email:</strong> hallo-ut@ecampus.ut.ac.id</li>
                    <li><strong>Alamat Kantor Pusat:</strong> Jalan Cabe Raya, Pondok Cabe, Pamulang, Tangerang Selatan 15437, Banten, Indonesia</li>
                    <li><strong>Media Sosial:</strong>
                        <ul>
                            <li>Facebook: <a href="https://facebook.com/univterbuka" target="_blank" rel="noopener noreferrer">facebook.com/univterbuka</a></li>
                            <li>X (Twitter): <a href="https://twitter.com/univterbuka" target="_blank" rel="noopener noreferrer">@univterbuka</a></li>
                            <li>Instagram: <a href="https://instagram.com/univterbuka" target="_blank" rel="noopener noreferrer">@univterbuka</a></li>
                            <li>LinkedIn: <a href="https://linkedin.com/school/universitas-terbuka" target="_blank" rel="noopener noreferrer">linkedin.com/school/universitas-terbuka</a></li>
                            <li>Tiktok: <a href="https://tiktok.com/@univterbuka" target="_blank" rel="noopener noreferrer">@univterbuka</a></li>
                        </ul>
                    </li>
                 </ul>`
      }
    ]
  },
  {
    id: "pendaftaran",
    title: "II. Pendaftaran",
    faqs: [
        {
            question: "Bagaimana alur pendaftaran mahasiswa baru secara online melalui situs admisi-sia.ut.ac.id?",
            answer: `<p>Proses pendaftaran mahasiswa baru di UT sepenuhnya dilakukan secara online melalui Sistem Informasi Akademik (SIA). Alur pendaftarannya terstruktur sebagai berikut:</p>
                     <ol>
                        <li><strong>Kunjungi Situs Admisi:</strong> Akses laman pendaftaran resmi di <a href="https://admisi-sia.ut.ac.id" target="_blank" rel="noopener noreferrer">https://admisi-sia.ut.ac.id</a>.</li>
                        <li><strong>Buat Akun Pendaftaran:</strong> Pilih menu untuk mendaftar sebagai pengguna baru. Calon mahasiswa harus memasukkan data diri awal yang valid, seperti Nomor Induk Kependudukan (NIK), nama lengkap sesuai KTP, alamat email aktif, dan nomor ponsel.</li>
                        <li><strong>Lengkapi Data Pribadi:</strong> Setelah akun berhasil dibuat, login kembali ke sistem dan lengkapi formulir admisi dengan data yang lebih rinci, mencakup riwayat pendidikan sebelumnya, pilihan program studi yang diminati, serta memilih lokasi UPBJJ terdekat sebagai pusat layanan administrasi.</li>
                        <li><strong>Unggah Dokumen Persyaratan:</strong> Siapkan dan unggah semua dokumen yang disyaratkan dalam format digital (biasanya PDF atau JPG). Pastikan setiap dokumen hasil pindaian (scan) jelas dan dapat dibaca.</li>
                        <li><strong>Cetak dan Bayar LIP Admisi:</strong> Setelah semua data dan dokumen terunggah, sistem akan menerbitkan Lembar Informasi Pembayaran (LIP) untuk biaya pendaftaran. Lakukan pembayaran sesuai nominal dan instruksi yang tertera melalui kanal pembayaran yang tersedia (bank, e-commerce, atau gerai ritel).</li>
                        <li><strong>Tunggu Proses Verifikasi:</strong> Pihak UT akan memverifikasi kebenaran data dan keabsahan dokumen yang diunggah. Proses ini biasanya memakan waktu antara 1 hingga 5 hari kerja.</li>
                        <li><strong>Dapatkan Nomor Induk Mahasiswa (NIM):</strong> Jika verifikasi berhasil, calon mahasiswa akan secara resmi diterima dan akan mendapatkan Nomor Induk Mahasiswa (NIM) serta akun email resmi UT (@ecampus.ut.ac.id).</li>
                        <li><strong>Registrasi Mata Kuliah:</strong> Gunakan NIM yang telah diterima untuk login ke portal mahasiswa di myut.ut.ac.id. Di portal ini, mahasiswa baru harus melakukan registrasi mata kuliah untuk semester pertama.</li>
                        <li><strong>Bayar Uang Kuliah:</strong> Setelah registrasi mata kuliah, sistem akan kembali menerbitkan LIP untuk pembayaran uang kuliah. Lakukan pembayaran sebelum batas waktu yang ditentukan untuk mengaktifkan status sebagai mahasiswa pada semester berjalan.</li>
                     </ol>
                     <p>Proses yang sepenuhnya terdigitalisasi ini menempatkan tanggung jawab yang besar pada ketelitian calon mahasiswa. Kesalahan administratif kecil, seperti kualitas pindaian dokumen yang buruk, format file yang salah, atau ketidakkonsistenan data (misalnya, tanda tangan yang berbeda pada dua formulir), dapat menghambat atau bahkan menggagalkan proses pendaftaran. Oleh karena itu, sangat penting untuk membaca panduan dengan saksama dan menyiapkan semua dokumen dengan benar.</p>`
        },
        {
            question: "Apa saja jalur pendaftaran yang tersedia (Non-RPL dan RPL) dan apa perbedaannya?",
            answer: `<p>UT menyediakan dua jalur pendaftaran utama bagi calon mahasiswa program diploma dan sarjana:</p>
                     <ul>
                        <li><strong>Jalur Non-RPL (Umum):</strong> Jalur ini ditujukan bagi calon mahasiswa yang berasal dari lulusan SMA/SMK/sederajat dan akan memulai perkuliahan dari semester pertama tanpa adanya pengakuan SKS dari pendidikan sebelumnya. Biaya pendaftaran untuk jalur ini adalah Rp 100.000.</li>
                        <li><strong>Jalur RPL (Rekognisi Pembelajaran Lampau) / Alih Kredit:</strong> Jalur ini diperuntukkan bagi calon mahasiswa yang telah memiliki pengalaman pendidikan formal sebelumnya di perguruan tinggi lain (baik lulus diploma/S1 maupun tidak menyelesaikan studi) dan ingin mengajukan pengakuan (transfer) SKS untuk mata kuliah yang relevan. Proses ini memerlukan asesmen oleh UT untuk menentukan mata kuliah mana saja yang dapat dialihkreditkan. Biaya pendaftaran untuk jalur RPL lebih tinggi, yaitu Rp 400.000, karena mencakup biaya proses asesmen. Jalur ini menunjukkan pengakuan UT terhadap konsep pembelajaran seumur hidup, namun menuntut ketelitian ekstra dari pendaftar dalam menyiapkan dokumen transkrip dan deskripsi mata kuliah dari perguruan tinggi asal.</li>
                     </ul>`
        },
        {
            question: "Dokumen apa saja yang diperlukan untuk pendaftaran?",
            answer: `<p>Persyaratan dokumen bervariasi tergantung pada jalur pendaftaran dan program studi yang dipilih. Berikut adalah rinciannya:</p>
                     <h5>Dokumen Wajib untuk Semua Jalur (Program Non-Pendidikan):</h5>
                     <ul>
                        <li>Pindaian (scan) KTP atau Kartu Keluarga (KK) asli yang masih berlaku dan jelas terbaca.</li>
                        <li>Pas foto formal berwarna terbaru (biasanya dengan latar belakang biru atau merah).</li>
                        <li>Pindaian ijazah SLTA/sederajat yang telah dilegalisir.</li>
                        <li>Formulir Isian Pas Foto dan Tanda Tangan Mahasiswa (dapat diunduh dari situs UT).</li>
                        <li>Surat Pernyataan Keabsahan Dokumen yang ditandatangani di atas meterai Rp 10.000.</li>
                     </ul>
                     <h5>Dokumen Tambahan untuk Jalur RPL (Alih Kredit):</h5>
                     <ul>
                        <li>Pindaian ijazah jenjang Diploma atau Sarjana (jika sudah lulus).</li>
                        <li>Pindaian transkrip nilai resmi dari perguruan tinggi asal.</li>
                        <li>Tangkapan layar (screenshot) status mahasiswa dari laman PDDikti Kemdikbudristek yang menunjukkan status "Lulus", "Mengundurkan Diri", atau "Non-Aktif".</li>
                     </ul>
                     <h5>Dokumen Tambahan untuk Program Fakultas Keguruan dan Ilmu Pendidikan (FKIP):</h5>
                     <ul>
                        <li>Surat Keterangan Mengajar (SKM) dengan pengalaman minimal 1 tahun (khusus untuk jalur In-Service atau Dalam Jabatan).</li>
                        <li>Pindaian SK Pengangkatan sebagai CPNS/PNS atau SK dari yayasan tempat mengajar.</li>
                     </ul>`
        },
        {
            question: "Kapan periode pendaftaran mahasiswa baru dibuka?",
            answer: `<p>UT membuka pendaftaran mahasiswa baru dua kali dalam setahun, yaitu untuk semester Ganjil (dimulai sekitar September/Oktober) dan semester Genap (dimulai sekitar Maret/April). Jadwal pendaftaran memiliki rentang waktu yang cukup panjang. Sebagai contoh, jadwal untuk semester Ganjil 2025 adalah sebagai berikut:</p>
                     <ul>
                        <li><strong>Jalur Non-RPL (Umum):</strong> 5 Mei – 5 Agustus 2025</li>
                        <li><strong>Jalur RPL (Alih Kredit):</strong> 19 Mei – 22 Juli 2025</li>
                     </ul>
                     <p>Jadwal ini dapat berubah setiap tahunnya. Calon mahasiswa sangat disarankan untuk selalu memeriksa pengumuman dan kalender akademik terbaru yang dirilis di situs web resmi UT.</p>`
        }
    ]
  },
  {
    id: "prodi",
    title: "III. Program Studi",
    faqs: [
        {
            question: "Fakultas dan Program Studi apa saja yang ditawarkan di Universitas Terbuka?",
            answer: `<p>Universitas Terbuka menawarkan portofolio program studi yang sangat luas dan berorientasi pada kebutuhan profesional di berbagai bidang. Berikut adalah daftar lengkap fakultas beserta program studi yang ditawarkan:</p>
            <div class="faq-answer">
            <table class="w-full text-left table-auto">
                <thead>
                    <tr><th>Fakultas/Sekolah</th><th>Jenjang</th><th>Program Studi</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Fakultas Ekonomi dan Bisnis (FEB)</strong></td><td>S1</td><td>Manajemen</td></tr>
                    <tr><td></td><td>S1</td><td>Ekonomi Pembangunan</td></tr>
                    <tr><td></td><td>S1</td><td>Ekonomi Syariah</td></tr>
                    <tr><td></td><td>S1</td><td>Akuntansi</td></tr>
                    <tr><td></td><td>S1</td><td>Akuntansi Keuangan Publik</td></tr>
                    <tr><td></td><td>S1</td><td>Pariwisata</td></tr>
                    <tr><td></td><td>S1</td><td>Kewirausahaan</td></tr>
                    <tr><td><strong>Fakultas Hukum, Ilmu Sosial, & Ilmu Politik (FHISIP)</strong></td><td>D3</td><td>Perpajakan</td></tr>
                    <tr><td></td><td>D4</td><td>Kearsipan</td></tr>
                    <tr><td></td><td>S1</td><td>Ilmu Administrasi Negara</td></tr>
                    <tr><td></td><td>S1</td><td>Ilmu Administrasi Bisnis</td></tr>
                    <tr><td></td><td>S1</td><td>Ilmu Hukum</td></tr>
                    <tr><td></td><td>S1</td><td>Ilmu Pemerintahan</td></tr>
                    <tr><td></td><td>S1</td><td>Ilmu Komunikasi</td></tr>
                    <tr><td></td><td>S1</td><td>Ilmu Perpustakaan</td></tr>
                    <tr><td></td><td>S1</td><td>Sosiologi</td></tr>
                    <tr><td></td><td>S1</td><td>Sastra Inggris (Bidang Minat Penerjemahan)</td></tr>
                    <tr><td></td><td>S1</td><td>Perpajakan</td></tr>
                    <tr><td><strong>Fakultas Keguruan dan Ilmu Pendidikan (FKIP)</strong></td><td>S1</td><td>Pendidikan Bahasa dan Sastra Indonesia</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Bahasa Inggris</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Biologi</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Fisika</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Kimia</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Matematika</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Ekonomi</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Pancasila dan Kewarganegaraan</td></tr>
                    <tr><td></td><td>S1</td><td>Teknologi Pendidikan</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Guru Sekolah Dasar (PGSD)</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Guru Pendidikan Anak Usia Dini (PGPAUD)</td></tr>
                    <tr><td></td><td>S1</td><td>Pendidikan Agama Islam (PAI)</td></tr>
                    <tr><td></td><td>Profesi</td><td>Program Pendidikan Profesi Guru (PPG)</td></tr>
                    <tr><td><strong>Fakultas Sains dan Teknologi (FST)</strong></td><td>S1</td><td>Statistika</td></tr>
                    <tr><td></td><td>S1</td><td>Matematika</td></tr>
                    <tr><td></td><td>S1</td><td>Biologi</td></tr>
                    <tr><td></td><td>S1</td><td>Teknologi Pangan</td></tr>
                    <tr><td></td><td>S1</td><td>Agribisnis</td></tr>
                    <tr><td></td><td>S1</td><td>Perencanaan Wilayah dan Kota</td></tr>
                    <tr><td></td><td>S1</td><td>Sistem Informasi</td></tr>
                    <tr><td></td><td>S1</td><td>Sains Data</td></tr>
                    <tr><td><strong>Sekolah Pascasarjana (SPs)</strong></td><td>S2</td><td>Magister Studi Lingkungan</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Manajemen Perikanan</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Administrasi Publik</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Manajemen</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Pendidikan Dasar</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Pendidikan Matematika</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Pendidikan Bahasa Inggris</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Pendidikan Anak Usia Dini (MPAD)</td></tr>
                    <tr><td></td><td>S2</td><td>Magister Hukum</td></tr>
                    <tr><td></td><td>S3</td><td>Doktor Ilmu Manajemen</td></tr>
                    <tr><td></td><td>S3</td><td>Doktor Administrasi Publik</td></tr>
                </tbody>
            </table>
            </div>`
        }
    ]
  },
  {
    id: 'perkuliahan',
    title: 'IV. Perkuliahan',
    faqs: [
        {
            question: "Apa itu Tutorial Online (TUTON)?",
            answer: `<p>Tutorial Online (TUTON) adalah layanan bantuan belajar yang paling populer di UT. Proses ini berlangsung sepenuhnya secara daring melalui platform Learning Management System (LMS) resmi UT di elearning.ut.ac.id. Dalam TUTON, mahasiswa berinteraksi dengan tutor dan rekan-rekan sekelasnya secara asinkron, artinya tidak ada jadwal tatap muka virtual yang mengikat. Mahasiswa dapat mengakses materi, berdiskusi, dan mengumpulkan tugas kapan saja dalam rentang waktu yang ditentukan (biasanya satu minggu per sesi). Fleksibilitas ini menjadikan TUTON pilihan ideal bagi mahasiswa yang memiliki jadwal kerja tidak menentu.</p>`
        },
        {
            question: "Bagaimana panduan aktivasi dan registrasi TUTON?",
            answer: `<p>Untuk dapat mengikuti TUTON, mahasiswa wajib melakukan aktivasi dan registrasi setiap semester. Berikut langkah-langkahnya:</p>
                    <h5>Aktivasi Akun E-Learning (Hanya untuk Mahasiswa Baru):</h5>
                    <ol>
                        <li>Kunjungi <a href="https://elearning.ut.ac.id" target="_blank" rel="noopener noreferrer">elearning.ut.ac.id</a> dan klik menu "Aktivasi".</li>
                        <li>Isi formulir aktivasi dengan NIM, tanggal lahir, dan alamat email yang aktif (disarankan untuk tidak menggunakan email Yahoo).</li>
                        <li>Buka email Anda dan klik tautan verifikasi yang dikirimkan oleh sistem UT.</li>
                        <li>Anda akan menerima username (NIM Anda) dan password untuk login ke e-learning.</li>
                    </ol>
                    <h5>Mengisi Formulir Kesediaan Mengikuti TUTON (Wajib Setiap Semester):</h5>
                    <ol>
                        <li>Login ke elearning.ut.ac.id menggunakan akun Anda.</li>
                        <li>Pada halaman dashboard, cari dan klik menu "FORM KESEDIAAN MENGIKUTI TUTON".</li>
                        <li>Pilih opsi "Ya, Saya Setuju" dan simpan pilihan Anda.</li>
                    </ol>
                    <p>Langkah ini harus diulang pada setiap awal semester saat periode registrasi mata kuliah. Jika tidak, mata kuliah yang Anda ambil tidak akan muncul di dashboard e-learning Anda.</p>`
        },
        {
            question: "Bagaimana struktur kelas dan kegiatan dalam TUTON?",
            answer: `<p>Kelas TUTON berlangsung selama delapan minggu (8 sesi). Setiap sesi memiliki struktur kegiatan yang harus diikuti mahasiswa:</p>
                    <h5>Sesi 1-8:</h5>
                    <ul>
                        <li><strong>Kehadiran:</strong> Wajib mengisi daftar hadir pada setiap sesi.</li>
                        <li><strong>Materi Inisiasi:</strong> Tutor memberikan materi pengayaan atau ringkasan modul.</li>
                        <li><strong>Diskusi:</strong> Berpartisipasi aktif dalam forum diskusi.</li>
                        <li><strong>Tugas Wajib:</strong> Tiga tugas utama pada Sesi 3, Sesi 5, dan Sesi 7.</li>
                        <li><strong>Kuis:</strong> Kuis formatif untuk menguji pemahaman.</li>
                    </ul>`
        },
        {
            question: "Bagaimana kontribusi nilai TUTON terhadap nilai akhir?",
            answer: `<p>Nilai TUTON memberikan kontribusi yang signifikan terhadap Nilai Akhir Mata Kuliah (NAMK). Ketentuannya adalah sebagai berikut:</p>
                    <ul>
                        <li>Nilai TUTON berkontribusi sebesar <strong>30%</strong> terhadap nilai akhir.</li>
                        <li>Syarat agar nilai TUTON dapat berkontribusi adalah mahasiswa harus memperoleh nilai UAS minimal <strong>30</strong> (dari skala 100).</li>
                        <li>Jika nilai UAS kurang dari 30, maka nilai TUTON tidak akan diperhitungkan sama sekali.</li>
                    </ul>
                    <p>Formula perhitungannya adalah: <code>NAMK = (70% × Nilai UAS) + (30% × Nilai TUTON)</code></p>`
        },
        {
            question: "Apa saja bentuk bantuan belajar lainnya selain TUTON?",
            answer: `<h5>Tutorial Tatap Muka (TTM) dan Tutorial Webinar (Tuweb)</h5>
                    <p>Layanan tutorial yang diselenggarakan secara sinkron (real-time), baik luring (TTM) maupun daring (Tuweb). Kontribusi nilainya adalah yang terbesar, yaitu <strong>50%</strong> terhadap nilai akhir, dengan syarat nilai UAS minimal 30.</p>
                    <h5>Tugas Mata Kuliah (TMK)</h5>
                    <p>Layanan evaluasi yang otomatis diberikan kepada mahasiswa yang tidak terdaftar dalam layanan tutorial manapun. Terdiri dari 3 tugas yang diunduh dan diunggah melalui tmk.ut.ac.id. Kontribusi nilainya adalah yang paling kecil, yaitu <strong>20%</strong> terhadap nilai akhir, dengan syarat nilai UAS minimal 30.</p>
                    <p><strong>Penting:</strong> Jika seorang mahasiswa lupa melakukan aktivasi TUTON, sistem akan otomatis mengalihkannya ke skema TMK, mengurangi potensi bantuan nilai dari 30% menjadi 20%.</p>`
        },
        {
            question: "Bagaimana dengan kegiatan akademik seperti Praktik dan OSMB?",
            answer: `<h5>Praktik dan Praktikum</h5>
                    <p>Untuk program studi tertentu, terdapat mata kuliah yang mewajibkan praktik atau praktikum yang dikoordinasikan oleh UPBJJ dan laporannya diunggah melalui praktik.ut.ac.id.</p>
                    <h5>OSMB dan PKBJJ</h5>
                    <p>Khusus untuk mahasiswa baru, UT menyelenggarakan serangkaian kegiatan orientasi untuk memastikan kesiapan mereka:</p>
                    <ul>
                        <li><strong>OSMB (Orientasi Studi Mahasiswa Baru):</strong> Pengenalan umum mengenai sistem akademik dan administrasi.</li>
                        <li><strong>PKBJJ (Pelatihan Keterampilan Belajar Jarak Jauh):</strong> Pelatihan intensif mengenai strategi belajar mandiri yang efektif.</li>
                    </ul>`
        }
    ]
  },
  {
    id: 'biaya',
    title: 'V. Biaya Pendidikan',
    faqs: [
        {
            question: "Apa saja skema pembayaran uang kuliah di UT (SIPAS dan Non-SIPAS)?",
            answer: `<p>UT menawarkan dua skema utama pembayaran uang kuliah:</p>
                     <ul>
                        <li><strong>SIPAS (Sistem Paket Semester):</strong> Mahasiswa membayar biaya paket tetap setiap semester yang sudah mencakup uang kuliah, bahan ajar, dan layanan bantuan belajar tertentu. Mirip sistem UKT di PTN konvensional.</li>
                        <li><strong>Non-SIPAS:</strong> Mahasiswa membayar berdasarkan jumlah SKS yang diregistrasikan. Biaya bahan ajar dan layanan bantuan belajar dibayar terpisah. Skema ini memberikan fleksibilitas maksimal.</li>
                     </ul>`
        },
        {
            question: "Bagaimana rincian biaya pendidikan di UT?",
            answer: `<p>Berikut adalah rincian biaya kuliah per program studi untuk skema SIPAS Non-TTM dan Non-SIPAS, serta biaya layanan akademik lainnya.</p>
            <div class="faq-answer">
            <h5 class="font-bold my-2">Bagian 1: Uang Kuliah per Program Studi (Diploma & Sarjana)</h5>
            <table class="w-full text-left table-auto">
                <thead><tr><th>No.</th><th>Program Studi</th><th>Fakultas</th><th>Biaya SIPAS Non-TTM (per Semester)</th><th>Biaya Non-SIPAS (per SKS)</th></tr></thead>
                <tbody>
                    <tr><td>1</td><td>D3 Perpajakan</td><td>FHISIP</td><td>Rp 1.150.000</td><td>Rp 35.000</td></tr>
                    <tr><td>2</td><td>D4 Kearsipan</td><td>FHISIP</td><td>Rp 1.150.000</td><td>Rp 38.000</td></tr>
                    <tr><td>3</td><td>S1 Akuntansi</td><td>FEB</td><td>Rp 1.300.000</td><td>Rp 38.000</td></tr>
                    <tr><td>4</td><td>S1 Akuntansi Keuangan Publik</td><td>FEB</td><td>Rp 1.300.000</td><td>Rp 40.000</td></tr>
                    <tr><td>5</td><td>S1 Ekonomi Pembangunan</td><td>FEB</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>6</td><td>S1 Ekonomi Syariah</td><td>FEB</td><td>Rp 1.300.000</td><td>Rp 51.000</td></tr>
                    <tr><td>7</td><td>S1 Manajemen</td><td>FEB</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>8</td><td>S1 Pariwisata</td><td>FEB</td><td>Rp 1.900.000</td><td>Rp 80.000</td></tr>
                    <tr><td>9</td><td>S1 Ilmu Administrasi Bisnis</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>10</td><td>S1 Ilmu Administrasi Negara</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>11</td><td>S1 Ilmu Hukum</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 40.000</td></tr>
                    <tr><td>12</td><td>S1 Ilmu Komunikasi</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>13</td><td>S1 Ilmu Pemerintahan</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>14</td><td>S1 Ilmu Perpustakaan</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 38.000</td></tr>
                    <tr><td>15</td><td>S1 Perpajakan</td><td>FHISIP</td><td>Rp 1.800.000</td><td>Rp 75.000</td></tr>
                    <tr><td>16</td><td>S1 Sastra Inggris</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 41.000</td></tr>
                    <tr><td>17</td><td>S1 Sosiologi</td><td>FHISIP</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                    <tr><td>18</td><td>S1 Pendidikan Biologi</td><td>FKIP</td><td>Rp 1.300.000</td><td>Rp 55.000</td></tr>
                    <tr><td>19</td><td>S1 Pendidikan Matematika</td><td>FKIP</td><td>Rp 1.300.000</td><td>Rp 41.000</td></tr>
                    <tr><td>20</td><td>S1 Pendidikan Agama Islam</td><td>FKIP</td><td>Rp 1.500.000</td><td>Rp 70.000</td></tr>
                    <tr><td>21</td><td>S1 PGSD (In-Service)</td><td>FKIP</td><td>Rp 1.600.000</td><td>Rp 75.000</td></tr>
                    <tr><td>22</td><td>S1 PGPAUD (In-Service)</td><td>FKIP</td><td>Rp 2.000.000</td><td>Rp 75.000</td></tr>
                    <tr><td>23</td><td>S1 Agribisnis</td><td>FST</td><td>Rp 1.300.000</td><td>Rp 50.000</td></tr>
                    <tr><td>24</td><td>S1 Biologi</td><td>FST</td><td>Rp 1.300.000</td><td>Rp 50.000</td></tr>
                    <tr><td>25</td><td>S1 Perencanaan Wilayah & Kota</td><td>FST</td><td>Rp 1.750.000</td><td>Rp 54.000</td></tr>
                    <tr><td>26</td><td>S1 Sistem Informasi</td><td>FST</td><td>Rp 1.800.000</td><td>Rp 78.000</td></tr>
                    <tr><td>27</td><td>S1 Sains Data</td><td>FST</td><td>Rp 1.900.000</td><td>Rp 85.000</td></tr>
                    <tr><td>28</td><td>S1 Statistika</td><td>FST</td><td>Rp 1.300.000</td><td>Rp 36.000</td></tr>
                </tbody>
            </table>
            <p class="text-xs italic mt-2">Daftar ini tidak mencakup semua prodi dan dapat berubah. Untuk rincian lengkap, silakan merujuk ke situs resmi UT.</p>

            <h5 class="font-bold my-2">Bagian 2: Biaya Layanan Akademik Lainnya</h5>
            <table class="w-full text-left table-auto">
                <thead><tr><th>Jenis Layanan</th><th>Tarif</th><th>Keterangan</th></tr></thead>
                <tbody>
                    <tr><td>Pendaftaran Mahasiswa Baru (Non-RPL)</td><td>Rp 100.000</td><td>Per pendaftaran</td></tr>
                    <tr><td>Pendaftaran Mahasiswa Baru (RPL)</td><td>Rp 400.000</td><td>Per pendaftaran</td></tr>
                    <tr><td>Penggantian Kartu Mahasiswa</td><td>Rp 50.000</td><td>Per kartu</td></tr>
                    <tr><td>TTM Atas Permintaan (Atpem)</td><td>Rp 150.000</td><td>Per mata kuliah</td></tr>
                    <tr><td>Registrasi Ulang Tugas Akhir Program (TAP)</td><td>Sesuai SKS</td><td>Tergantung prodi (mulai Rp 41.000/SKS)</td></tr>
                    <tr><td>Registrasi Ulang Karya Ilmiah</td><td>Rp 200.000</td><td>Per mata kuliah</td></tr>
                    <tr><td>Wisuda (di UT Pusat/Daerah)</td><td>Rp 750.000</td><td>Per mahasiswa</td></tr>
                </tbody>
            </table>
            </div>`
        }
    ]
  },
  {
    id: 'kalender',
    title: 'VI. Kalender Akademik',
    faqs: [
        {
            question: "Di mana saya bisa menemukan kalender akademik resmi UT?",
            answer: `<p>Kalender akademik resmi dan terperinci dapat diakses melalui beberapa sumber:</p>
                    <ul>
                        <li><strong>Situs Web UT Pusat:</strong> Pada menu "Katalog" atau melalui tautan langsung <a href="https://ut.ac.id/kalender" target="_blank" rel="noopener noreferrer">ut.ac.id/kalender</a>.</li>
                        <li><strong>Situs Web UPBJJ:</strong> Setiap kantor UPBJJ (misalnya <a href="https://banjarmasin.ut.ac.id/kalender/" target="_blank" rel="noopener noreferrer">banjarmasin.ut.ac.id/kalender/</a>) biasanya juga menampilkan kalender akademik yang relevan.</li>
                        <li><strong>Katalog Sistem Penyelenggaraan:</strong> Dokumen ini memuat kalender akademik lengkap dan dapat diunduh dari situs UT.</li>
                    </ul>`
        },
        {
            question: "Contoh Jadwal Kegiatan Akademik (Semester Ganjil 2025/2026)",
            answer: `<p>Tabel berikut menyajikan contoh linimasa kegiatan akademik penting dalam satu semester. Tanggal-tanggal ini bersifat perkiraan dan harus selalu diverifikasi dengan kalender resmi.</p>
            <div class="faq-answer">
            <table class="w-full text-left table-auto">
                <thead><tr><th>Kegiatan</th><th>Jenjang</th><th>Perkiraan Periode</th></tr></thead>
                <tbody>
                    <tr><td>Pendaftaran Mahasiswa Baru (Jalur RPL)</td><td>Diploma/Sarjana</td><td>September – Desember 2025</td></tr>
                    <tr><td>Pendaftaran Mahasiswa Baru (Jalur Umum)</td><td>Diploma/Sarjana</td><td>Oktober 2025 – Januari 2026</td></tr>
                    <tr><td>Registrasi Mata Kuliah & Pembayaran Uang Kuliah</td><td>Semua Jenjang</td><td>Oktober 2025 – Februari 2026</td></tr>
                    <tr><td><strong>Aktivasi Tutorial Online (TUTON)</strong></td><td>Diploma/Sarjana</td><td><strong>2 Oktober 2025 – 9 Maret 2026</strong></td></tr>
                    <tr><td><strong>Pelaksanaan TUTON (8 Sesi)</strong></td><td>Diploma/Sarjana</td><td><strong>6 Oktober 2025 – 7 Desember 2025</strong></td></tr>
                    <tr><td>Pelaksanaan TTM/Tuweb</td><td>Semua Jenjang</td><td>September – Desember 2025</td></tr>
                    <tr><td>Pencetakan Kartu Tanda Peserta Ujian (KTPU)</td><td>Semua Jenjang</td><td>November 2025 – Januari 2026</td></tr>
                    <tr><td>Ujian Akhir Semester (UAS)</td><td>Semua Jenjang</td><td>Desember 2025 – Januari 2026</td></tr>
                    <tr><td>Batas Akhir Unggah Laporan Praktik/Praktikum</td><td>Diploma/Sarjana</td><td>21 Desember 2025</td></tr>
                    <tr><td>Pengumuman Nilai Mata Kuliah</td><td>Semua Jenjang</td><td>Mulai 27 Januari 2026</td></tr>
                </tbody>
            </table>
            </div>
            <p>Poin krusial: Meskipun periode aktivasi TUTON dibuka sangat lama (hingga Maret 2026), pelaksanaan tutorialnya sendiri hanya berlangsung dari Oktober hingga Desember 2025. Menunda aktivasi akan menyebabkan kehilangan sesi awal beserta nilainya.</p>`
        }
    ]
  },
  {
    id: 'kemahasiswaan',
    title: 'VII. Kemahasiswaan',
    faqs: [
        {
            question: "Apa saja organisasi kemahasiswaan (ORMAWA) yang ada di UT?",
            answer: `<p>Organisasi Kemahasiswaan (ORMAWA) di UT umumnya berbasis di tingkat regional atau UPBJJ. Organisasi ini menjadi wadah bagi mahasiswa di suatu wilayah untuk bersosialisasi dan berkolaborasi. Contohnya adalah Himpunan Mahasiswa Universitas Terbuka Surakarta (HIMASUTA). Semua kegiatan ORMAWA dikoordinasikan melalui sistem informasi kemahasiswaan di tingkat pusat (<a href="https://kemahasiswaan.ut.ac.id" target="_blank" rel="noopener noreferrer">kemahasiswaan.ut.ac.id</a>).</p>`
        },
        {
            question: "Acara dan kompetisi tingkat nasional apa saja yang bisa diikuti mahasiswa UT?",
            answer: `<p>UT secara aktif memfasilitasi mahasiswanya untuk berkompetisi di berbagai ajang bergengsi tingkat nasional, beberapa di antaranya adalah:</p>
                    <ul>
                        <li><strong>Diskusi Ilmiah, Pekan Olahraga, dan Seni (Disporseni) Nasional:</strong> Ajang internal terbesar UT yang memperlombakan berbagai cabang.</li>
                        <li><strong>Pekan Ilmiah Mahasiswa Nasional (PIMNas):</strong> Forum ilmiah paling prestisius bagi mahasiswa di Indonesia.</li>
                        <li><strong>Kompetisi Nasional Matematika dan IPA (KN-MIPA)</strong></li>
                        <li><strong>Kompetisi Debat Mahasiswa Indonesia (KDMI) & National University Debating Championship (NUDC)</strong></li>
                        <li><strong>Pekan Olahraga Mahasiswa Nasional (POMNAS)</strong></li>
                        <li><strong>Musabaqah Tilawatil Qur'an (MTQ) Mahasiswa Nasional</strong></li>
                        <li><strong>Program Mahasiswa Wirausaha (PMW)</strong></li>
                    </ul>`
        },
        {
            question: "Apakah ada kegiatan kemahasiswaan di tingkat daerah (UPBJJ)?",
            answer: `<p>Ya, UPBJJ memegang peranan vital sebagai pusat kegiatan kemahasiswaan di daerah. Berbagai acara dan kegiatan rutin diselenggarakan, seperti:</p>
                    <ul>
                        <li>Kegiatan sosial seperti donor darah.</li>
                        <li>Kunjungan edukatif ke pameran atau institusi.</li>
                        <li>Seminar, lokakarya, dan pelatihan yang relevan.</li>
                    </ul>
                    <p>Ajang Disporseni juga dilaksanakan secara berjenjang, dimulai dari tingkat UPBJJ, kemudian wilayah, sebelum para pemenang berkompetisi di tingkat nasional. Ini memastikan mahasiswa dari seluruh nusantara memiliki kesempatan yang sama untuk berpartisipasi dan berprestasi.</p>`
        }
    ]
  }
];
