import React, { useState } from 'react';
import type { AppView } from '../types';
import { HUB_PAGES_DATA } from '../constants';
import { FaqPage } from './FaqPage';
import { UpdateDocsPage } from './UpdateDocsPage';
import { AboutPage } from './AboutPage';
import { ApiIntegrationGuidePage } from './ApiIntegrationGuidePage';
import { isApiKeyFeatureEnabled } from '../featureFlags';

interface PreLoginInfoPageProps {
  onBackToLogin: () => void;
  onLoginSuccess: (method: 'apiKey' | 'invite', value: string, durationMs?: number, resetTimestamp?: number) => void;
}

const InfoCard: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-6 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl transition-all duration-300 hover:border-ut-blue/50 hover:bg-slate-800"
    >
        <h3 className="font-semibold text-xl text-white font-display">{title}</h3>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">{description}</p>
    </button>
);

export const PreLoginInfoPage: React.FC<PreLoginInfoPageProps> = ({ onBackToLogin, onLoginSuccess }) => {
    const [activeInfoView, setActiveInfoView] = useState<'menu' | AppView>('menu');
    
    // Create a local, potentially filtered version of the hub data
    const infoHubData = JSON.parse(JSON.stringify(HUB_PAGES_DATA['Informasi'])); // Deep copy
    if (!isApiKeyFeatureEnabled) {
        infoHubData.sections[0].cards = infoHubData.sections[0].cards.filter(
            (card: { targetView: string; }) => card.targetView !== 'Panduan Integrasi API'
        );
    }


    const renderView = () => {
        if (activeInfoView === 'menu') {
            return (
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Informasi & Bantuan</h1>
                        <p className="mt-2 text-lg text-slate-300 max-w-4xl mx-auto">{infoHubData.pageDescription}</p>
                    </div>
                    <div className="w-full max-w-4xl bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                        <button
                            onClick={onBackToLogin}
                            className="flex items-center gap-2 text-ut-blue-light hover:text-white mb-6 transition-colors group text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span className="font-semibold font-display">Kembali ke Halaman Login</span>
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {infoHubData.sections[0].cards.map((card: { targetView: AppView, title: string, description: string }) => (
                                <InfoCard 
                                    key={card.targetView}
                                    title={card.title}
                                    description={card.description}
                                    onClick={() => setActiveInfoView(card.targetView)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        
        const goBackToMenu = () => setActiveInfoView('menu');

        switch (activeInfoView) {
            case 'FAQ':
                return <FaqPage setActiveView={goBackToMenu} studentData={null} />;
            case 'Panduan Integrasi API':
                 if (!isApiKeyFeatureEnabled) return null; // Double guard
                 return <ApiIntegrationGuidePage setActiveView={goBackToMenu} onApiKeySubmit={(key) => onLoginSuccess('apiKey', key)} />;
            case 'Dokumentasi Pembaruan':
                return <UpdateDocsPage setActiveView={goBackToMenu} />;
            case 'Tentang Aplikasi':
                return <AboutPage setActiveView={goBackToMenu} />;
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            {renderView()}
        </main>
    );
};