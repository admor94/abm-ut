import React, { useState, useEffect } from 'react';
import type { AppView, DeadlineTask } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';

interface ReminderTrackerPageProps {
  setActiveView: (view: AppView) => void;
}

const DeadlineItem: React.FC<{ task: DeadlineTask; onRemove: (id: string) => void }> = ({ task, onRemove }) => {
  const taskDisplayName = task.taskType === 'Lainnya' ? task.customTaskName : task.taskType;
  
  const reminderDateTime = new Date(task.endTime - ((task.reminderDays * 24 * 60 * 60 * 1000) + (parseInt(task.reminderTime.split(':')[0]) * 60 * 60 * 1000) + (parseInt(task.reminderTime.split(':')[1]) * 60 * 1000)));

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg shadow-lg hover:shadow-ut-blue/20 border border-slate-700 hover:border-ut-blue/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ut-blue-light font-semibold font-display truncate" title={task.courseName}>{task.courseName}</p>
          <h3 className="font-semibold text-lg text-white font-display truncate" title={taskDisplayName}>{taskDisplayName}</h3>
          <p className="text-xs text-slate-400 mt-1">Tenggat: {new Date(task.endTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
          <p className="text-xs text-slate-500 mt-1">Pengingat diatur pada: {reminderDateTime.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <button onClick={() => { if (window.confirm(`Apakah Anda yakin ingin menghapus pengingat untuk "${taskDisplayName}"?`)) { onRemove(task.id); } }} className="p-2 bg-gray-600 text-white rounded-md hover:bg-ut-red transition-colors" aria-label="Hapus">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReminderTrackerPage: React.FC<ReminderTrackerPageProps> = ({ setActiveView }) => {
  const parentView = PARENT_VIEW_MAP['Lacak Pengingat'];
  const [tasks, setTasks] = useState<DeadlineTask[]>([]);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('deadlineTasksV2');
      if (savedTasks) {
        const parsedTasks: DeadlineTask[] = JSON.parse(savedTasks);
        setTasks(parsedTasks.sort((a, b) => a.endTime - b.endTime));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
    }
  }, []);
  
  const handleDelete = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('deadlineTasksV2', JSON.stringify(updatedTasks));
  };
  
  return (
    <section id="Lacak-Pengingat" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Lacak Pengingat</h1>
          <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Semua pengingat tenggat waktu yang pernah Anda buat tersimpan di sini.</p>
        </div>
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
          <PageHeader parentView={parentView} setActiveView={setActiveView} />
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-lg shadow-inner">
                <p className="text-slate-400">Belum ada pengingat yang dibuat. Atur pengingat di Dashboard untuk melihatnya di sini!</p>
              </div>
            ) : (
              tasks.map(task => <DeadlineItem key={task.id} task={task} onRemove={handleDelete} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
};