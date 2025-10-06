import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-transparent p-6 mt-12">
      <div className="text-center text-sm text-gray-400 max-w-4xl mx-auto">
        <p className="font-semibold text-gray-300 mb-2">
          Peringatan: Selalu verifikasi informasi yang dihasilkan ABM-UT. Waspadai potensi halusinasi.
          Anggap ABM-UT sebagai asisten cerdas untuk meningkatkan produktivitas dan wawasan Anda, bukan sebagai pengganti dari proses berpikir kritis dan validasi akademis.
        </p>
        <p className="text-gray-500">
          &copy; {new Date().getFullYear()} ABM-UT by @radinallshare | Dirancang Khusus untuk Mahasiswa Universitas Terbuka
        </p>
      </div>
    </footer>
  );
};