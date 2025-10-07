import React from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { referensiData } from '../data/referensiData';
import type { Referensi } from '../data/referensiData';

interface ReferensiAkademikPageProps {
  setActiveView: (view: AppView) => void;
}

const ReferensiCard: React.FC<{ item: Referensi }> = ({ item }) => (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 hover:border-ut-blue transition-colors h-full flex flex-col">
        <h3 className="font-bold text-xl text-white font-display mb-2">{item.name}</h3>
        <p className="text-slate-400 text-sm flex-grow mb-4">{item.description}</p>
        <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-auto inline-flex items-center gap-2 justify-center bg-slate-700 hover:bg-ut-blue text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
            Kunjungi Situs
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    </div>
);

export const ReferensiAkademikPage: React.FC<ReferensiAkademikPageProps> = ({ setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Referensi Akademik'];

    return (
        <section id="Referensi-Akademik" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Referensi Akademik</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Kumpulan situs web untuk mencari referensi makalah, buku, skripsi, tesis, dan disertasi.</p>
                </div>

                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {referensiData.map(item => (
                            <ReferensiCard key={item.name} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};