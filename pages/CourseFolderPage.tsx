import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { CourseSearchInput } from '../components/CourseSearchInput';
import { PARENT_VIEW_MAP } from '../constants';
import type { AppView, LearningHistoryEntry, StudentData } from '../types';

interface CourseFolderPageProps {
  history: LearningHistoryEntry[];
  studentData: StudentData;
  setActiveView: (view: AppView) => void;
  onContinue: (entry: LearningHistoryEntry) => void;
  onDelete: (id: string) => void;
}

const HistoryEntryCard: React.FC<{
    entry: LearningHistoryEntry;
    onContinue: (entry: LearningHistoryEntry) => void;
    onDelete: (id: string) => void;
}> = ({ entry, onContinue, onDelete }) => {
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
                    <button onClick={() => { if(window.confirm("Hapus riwayat ini?")) onDelete(entry.id); }} className="p-2 bg-slate-600 text-white rounded-md hover:bg-ut-red transition-colors" aria-label="Hapus">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CourseFolderPage: React.FC<CourseFolderPageProps> = ({ history, studentData, setActiveView, onContinue, onDelete }) => {
    const parentView = PARENT_VIEW_MAP['Folder Mata Kuliah'];
    const [trackedCourses, setTrackedCourses] = useState<string[]>([]);
    const [newCourse, setNewCourse] = useState('');

    useEffect(() => {
        const savedCourses = localStorage.getItem('trackedCourses');
        if (savedCourses) {
            setTrackedCourses(JSON.parse(savedCourses));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('trackedCourses', JSON.stringify(trackedCourses));
    }, [trackedCourses]);

    const addCourse = () => {
        if (newCourse && !trackedCourses.includes(newCourse)) {
            setTrackedCourses(prev => [...prev, newCourse].sort());
            setNewCourse('');
        }
    };

    const removeCourse = (courseToRemove: string) => {
        setTrackedCourses(prev => prev.filter(c => c !== courseToRemove));
    };

    return (
        <section id="Folder-Mata-Kuliah" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Folder Mata Kuliah</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Kelompokkan riwayat belajar Anda berdasarkan mata kuliah.</p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    <div className="mb-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-bold text-white font-display mb-4">Kelola Mata Kuliah yang Dilacak</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <CourseSearchInput value={newCourse} onChange={setNewCourse} placeholder="Cari atau ketik nama mata kuliah..." />
                            </div>
                            <button onClick={addCourse} className="py-3 px-6 font-display font-medium text-white bg-ut-blue hover:bg-ut-blue-light rounded-lg shadow-md">Tambah</button>
                        </div>
                        {trackedCourses.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {trackedCourses.map(course => (
                                    <div key={course} className="flex items-center gap-2 bg-slate-700/50 rounded-full px-3 py-1 text-sm">
                                        <span className="text-slate-200">{course}</span>
                                        <button onClick={() => removeCourse(course)} className="text-slate-400 hover:text-ut-red">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-6">
                        {trackedCourses.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">Tambahkan mata kuliah untuk mulai mengelompokkan riwayat belajar Anda.</p>
                        ) : (
                            trackedCourses.map(course => {
                                const courseHistory = history.filter(entry => entry.courseName === course);
                                return (
                                    <details key={course} className="bg-slate-900/50 rounded-lg group" open>
                                        <summary className="p-4 cursor-pointer flex justify-between items-center font-bold text-lg text-ut-blue-light font-display">
                                            <span>{course} ({courseHistory.length})</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </summary>
                                        <div className="p-4 border-t border-slate-700/50">
                                            {courseHistory.length > 0 ? (
                                                <div className="space-y-4">
                                                    {courseHistory.map(entry => (
                                                        <HistoryEntryCard key={entry.id} entry={entry} onContinue={onContinue} onDelete={onDelete} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-400 text-sm">Belum ada riwayat untuk mata kuliah ini.</p>
                                            )}
                                        </div>
                                    </details>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};