import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import type { AppView, LearningHistoryEntry, PersonalFolder, StudentData } from '../types';

interface PersonalFolderPageProps {
    folders: PersonalFolder[];
    history: LearningHistoryEntry[];
    studentData: StudentData;
    onAddFolder: (name: string) => void;
    onDeleteFolder: (id: string) => void;
    onAssignHistoryToFolder: (historyId: string, folderId: string | null) => void;
    setActiveView: (view: AppView) => void;
    onContinue: (entry: LearningHistoryEntry) => void;
    onDeleteHistory: (id: string) => void;
}

const HistoryEntryCard: React.FC<{
    entry: LearningHistoryEntry;
    onContinue: (entry: LearningHistoryEntry) => void;
    onDelete: (id: string) => void;
    onRemoveFromFolder: (historyId: string) => void;
}> = ({ entry, onContinue, onDelete, onRemoveFromFolder }) => {
    return (
        <div className="bg-slate-900/50 p-4 rounded-lg shadow-md border border-slate-700">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-ut-blue-light font-semibold font-display">{entry.view}</p>
                    <h4 className="font-semibold text-md text-white font-display truncate" title={entry.topic}>{entry.topic}</h4>
                    <p className="text-xs text-slate-400 mt-1">{entry.date}</p>
                </div>
                <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    <button onClick={() => onContinue(entry)} className="px-3 py-1.5 bg-ut-blue text-white text-xs font-semibold rounded-md hover:bg-ut-blue-light transition-colors">Lanjutkan</button>
                    <button onClick={() => onRemoveFromFolder(entry.id)} className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-md hover:bg-yellow-500 transition-colors" title="Keluarkan dari folder">Keluarkan</button>
                    <button onClick={() => { if(window.confirm("Hapus riwayat ini secara permanen?")) onDelete(entry.id); }} className="p-2 bg-slate-600 text-white rounded-md hover:bg-ut-red transition-colors" aria-label="Hapus Permanen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


export const PersonalFolderPage: React.FC<PersonalFolderPageProps> = ({ folders, history, onAddFolder, onDeleteFolder, onAssignHistoryToFolder, setActiveView, onContinue, onDeleteHistory }) => {
    const parentView = PARENT_VIEW_MAP['Folder Pribadi'];
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const handleAddFolder = () => {
        if (newFolderName.trim()) {
            onAddFolder(newFolderName.trim());
            setNewFolderName('');
        }
    };
    
    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    const folderHistory = history.filter(h => h.folderId === selectedFolderId);

    return (
        <section id="Folder-Pribadi" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Folder Pribadi</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Buat folder kustom untuk mengorganisir riwayat belajar Anda.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Folder Management Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <h2 className="text-xl font-bold text-white font-display mb-4">Kelola Folder</h2>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleAddFolder()}
                                        placeholder="Nama folder baru..."
                                        className="flex-grow px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white"
                                    />
                                    <button onClick={handleAddFolder} className="py-2 px-4 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">+</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {folders.map(folder => (
                                    <div 
                                        key={folder.id} 
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedFolderId === folder.id ? 'bg-ut-blue/20' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
                                        onClick={() => setSelectedFolderId(folder.id)}
                                    >
                                        <span className="font-semibold text-white">{folder.name}</span>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); if (selectedFolderId === folder.id) setSelectedFolderId(null); }} className="text-slate-400 hover:text-ut-red text-lg">&times;</button>
                                    </div>
                                ))}
                                {folders.length === 0 && <p className="text-center text-sm text-slate-500 py-4">Belum ada folder. Buat folder baru untuk memulai.</p>}
                            </div>
                        </div>

                        {/* Folder Content Panel */}
                        <div className="lg:col-span-2">
                            {selectedFolder ? (
                                <div>
                                    <h2 className="text-2xl font-bold text-white font-display mb-4">Isi Folder: {selectedFolder.name}</h2>
                                    <div className="space-y-4">
                                        {folderHistory.length > 0 ? (
                                            folderHistory.map(entry => (
                                                <HistoryEntryCard 
                                                    key={entry.id}
                                                    entry={entry}
                                                    onContinue={onContinue}
                                                    onDelete={onDeleteHistory}
                                                    onRemoveFromFolder={() => onAssignHistoryToFolder(entry.id, null)}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-slate-400 text-center py-8">Folder ini masih kosong.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-900/30 rounded-lg">
                                    <p className="text-slate-500">Pilih sebuah folder untuk melihat isinya.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};