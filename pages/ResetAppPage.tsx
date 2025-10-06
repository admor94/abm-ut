import React from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface ResetAppPageProps {
  setActiveView: (view: AppView) => void;
}

export const ResetAppPage: React.FC<ResetAppPageProps> = ({ setActiveView }) => {
  const parentView = PARENT_VIEW_MAP['Reset Aplikasi'];

  const handleResetApp = () => {
    if (window.confirm("APAKAH ANDA YAKIN? Tindakan ini tidak dapat diurungkan. Semua data profil, riwayat belajar, dan status login akan dihapus secara permanen.")) {
        if(window.confirm("KONFIRMASI TERAKHIR: Anda akan keluar dan semua data akan hilang. Lanjutkan?")) {
            // Explicitly remove key items before clearing all for robustness
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loginMethod');
            localStorage.removeItem('studentData');
            localStorage.removeItem('learningHistory');
            localStorage.removeItem('deadlineTasksV2');
            localStorage.removeItem('trackedCourses');
            localStorage.removeItem('geminiApiKey');
            localStorage.removeItem('sessionExpiry');
            localStorage.removeItem('usedInviteCode');
            localStorage.removeItem('abmut_used_codes');
            // A final clear for any other potential data
            localStorage.clear();
            // Reload the page to reset the app state and redirect to login
            window.location.reload();
        }
    }
  };

  return (
    <section id="Reset-Aplikasi" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Reset Aplikasi</h1>
        <p className="mt-2 text-lg text-slate-300 max-w-4xl mx-auto">Hapus semua data lokal dan kembalikan aplikasi ke kondisi awal.</p>
      </div>
      
      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
        <PageHeader
          parentView={parentView}
          setActiveView={setActiveView}
        />

        <div className="space-y-6 text-center">
            <div className="p-6 bg-ut-red/20 border-l-4 border-ut-red rounded-lg text-left">
                <h3 className="font-bold text-xl text-ut-red font-display">PERINGATAN KERAS</h3>
                <p className="mt-2 text-red-200">
                    Tindakan ini akan <strong>menghapus semua data Anda secara permanen</strong> dari browser ini, termasuk:
                </p>
                <ul className="list-disc list-inside mt-2 text-red-200 space-y-1">
                    <li>Profil mahasiswa yang telah Anda isi.</li>
                    <li>Seluruh riwayat belajar interaktif.</li>
                    <li>Semua pengingat tenggat waktu.</li>
                    <li>Status login dan Kunci API yang tersimpan.</li>
                </ul>
                <p className="mt-3 text-red-200">
                    Aplikasi akan kembali seperti saat pertama kali Anda membukanya. Tindakan ini <strong>tidak dapat diurungkan</strong>.
                </p>
            </div>
            
            <button
                onClick={handleResetApp}
                className="w-full py-3 px-4 font-display text-lg font-medium text-white bg-ut-red hover:bg-red-700 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
                Saya Mengerti, Hapus Semua Data Saya
            </button>
        </div>
      </div>
    </section>
  );
};
