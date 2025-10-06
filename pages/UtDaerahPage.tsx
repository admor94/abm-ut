import React, { useState, useMemo } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { utDaerahData } from '../data/utDaerah';
import type { UtDaerah } from '../data/utDaerah';

interface UtDaerahPageProps {
  setActiveView: (view: AppView) => void;
}

const UtDaerahCard: React.FC<{ item: UtDaerah }> = ({ item }) => (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 hover:border-ut-blue transition-colors h-full flex flex-col">
        <h3 className="font-bold text-xl text-white font-display mb-4 flex-shrink-0">{item.daerah}</h3>
        <div className="space-y-3 text-sm flex-grow">
            <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-slate-300">{item.alamat}</p>
            </div>
            {item.telp && (
                 <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <p className="text-slate-300">{item.telp}</p>
                </div>
            )}
            {item.faks && (
                 <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    <p className="text-slate-300">Faks: {item.faks}</p>
                </div>
            )}
            {item.email && (
                 <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     <a href={`mailto:${item.email}`} className="text-ut-blue-light hover:underline break-all">{item.email}</a>
                </div>
            )}
             <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" /></svg>
                <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-ut-blue-light hover:underline break-all">{item.website}</a>
            </div>
        </div>
    </div>
);

export const UtDaerahPage: React.FC<UtDaerahPageProps> = ({ setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Informasi UT Daerah'];
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return utDaerahData;
        }
        return utDaerahData.filter(item =>
            item.daerah.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <section id="Informasi-UT-Daerah" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Informasi UT Daerah</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Temukan alamat dan situs web resmi semua kantor Universitas Terbuka di seluruh Indonesia.</p>
                </div>

                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    <div className="mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari UT Daerah (contoh: Jakarta, Bandung, Surabaya...)"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map(item => (
                            <UtDaerahCard key={item.daerah} item={item} />
                        ))}
                    </div>
                    {filteredData.length === 0 && (
                        <p className="text-center text-slate-400 py-8">UT Daerah tidak ditemukan.</p>
                    )}
                </div>
            </div>
        </section>
    );
};
