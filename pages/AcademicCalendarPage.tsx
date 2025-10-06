import React, { useState, useMemo } from 'react';
import type { AppView, AcademicEvent } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { academicCalendarData } from '../data/academicCalendar';

interface AcademicCalendarPageProps {
  setActiveView: (view: AppView) => void;
}

const categoryColors: Record<AcademicEvent['category'], string> = {
    Pendaftaran: 'bg-ut-blue',
    Pembayaran: 'bg-ut-yellow',
    Akademik: 'bg-ut-green',
    Ujian: 'bg-ut-red',
    Lainnya: 'bg-slate-500',
};

// Helper to format date as YYYY-MM-DD for map keys
const toISODateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const AcademicCalendarPage: React.FC<AcademicCalendarPageProps> = ({ setActiveView }) => {
    const parentView = PARENT_VIEW_MAP['Kalender Akademik'];
    const [currentDate, setCurrentDate] = useState(new Date('2025-10-01T00:00:00'));
    const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-10-05T00:00:00'));

    const eventsMap = useMemo(() => {
        const map = new Map<string, AcademicEvent[]>();
        academicCalendarData.forEach(event => {
            let loopDate = new Date(event.startDate + 'T00:00:00');
            const endDate = new Date(event.endDate + 'T00:00:00');

            while (loopDate <= endDate) {
                const dateString = toISODateString(loopDate);
                if (!map.has(dateString)) {
                    map.set(dateString, []);
                }
                map.get(dateString)!.push(event);
                loopDate.setDate(loopDate.getDate() + 1);
            }
        });
        return map;
    }, []);

    const calendarDays = useMemo(() => {
        const days = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDayOfWeek = firstDayOfMonth.getDay();

        // Previous month's padding days
        for (let i = startDayOfWeek; i > 0; i--) {
            days.push(new Date(year, month, 1 - i));
        }

        // Current month's days
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        // Next month's padding days to fill the grid
        const gridCells = 42; // 6 rows * 7 days
        while (days.length < gridCells) {
            const lastDay = days[days.length - 1];
            days.push(new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1));
        }

        return days;
    }, [currentDate]);

    const selectedDateEvents = useMemo(() => {
        return eventsMap.get(toISODateString(selectedDate)) || [];
    }, [selectedDate, eventsMap]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <section id="Kalender-Akademik" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Kalender Akademik</h1>
                    <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Jadwal dan tanggal penting untuk program Sarjana/Diploma.</p>
                </div>

                <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <PageHeader parentView={parentView} setActiveView={setActiveView} />

                    <div className="bg-slate-900/50 rounded-lg p-4">
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Previous month">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h2 className="text-xl font-bold font-display text-white">
                                {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Next month">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                <div key={day} className="text-center font-semibold text-slate-400 text-xs md:text-sm p-2">{day}</div>
                            ))}
                            {calendarDays.map((day, index) => {
                                const dayKey = toISODateString(day);
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                const isToday = day.getTime() === today.getTime();
                                const isSelected = day.getTime() === selectedDate.getTime();
                                const dayEvents = eventsMap.get(dayKey) || [];

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(day)}
                                        className={`relative aspect-square flex flex-col items-center justify-start p-1.5 md:p-2 rounded-lg transition-all duration-200 border-2 
                                            ${isSelected ? 'border-ut-blue bg-ut-blue/20' : 'border-transparent'}
                                            ${!isCurrentMonth ? 'text-slate-600' : 'text-slate-200'}
                                            ${isCurrentMonth ? 'hover:bg-slate-700/50 hover:border-slate-600' : ''}
                                        `}
                                    >
                                        <span className={`text-sm md:text-base ${isToday ? 'bg-ut-blue text-white rounded-full h-7 w-7 flex items-center justify-center' : ''}`}>
                                            {day.getDate()}
                                        </span>
                                        <div className="absolute bottom-1 md:bottom-2 flex space-x-1">
                                            {[...new Set(dayEvents.map(e => e.category))].slice(0, 3).map((category, i) => (
                                                <div key={i} className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${categoryColors[category as AcademicEvent['category']]}`}></div>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="mt-6">
                        <h3 className="text-lg font-bold font-display text-white border-b border-slate-700 pb-2 mb-4">
                            Kegiatan pada {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </h3>
                        {selectedDateEvents.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="w-full text-left table-auto border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="py-3 px-2 text-sm font-semibold text-slate-400 uppercase tracking-wider w-[150px]">Tanggal</th>
                                            <th className="py-3 px-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">Nama Kegiatan</th>
                                            <th className="py-3 px-2 text-sm font-semibold text-slate-400 uppercase tracking-wider w-[150px]">Berakhir Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDateEvents.map((event, index) => {
                                            const startDate = new Date(event.startDate + 'T00:00:00');
                                            const endDate = new Date(event.endDate + 'T00:00:00');
                                            const formattedStartDate = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                                            const formattedEndDate = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                                            const categoryClass = categoryColors[event.category].replace('bg-', 'border-');

                                            return (
                                                <tr key={index} className="border-t border-slate-700">
                                                    <td className="py-4 px-2 text-slate-300 align-top whitespace-nowrap">{formattedStartDate}</td>
                                                    <td className={`py-4 px-2 text-white align-top border-l-4 ${categoryClass} pl-4`}>
                                                        {event.title}
                                                    </td>
                                                    <td className="py-4 px-2 text-slate-300 align-top whitespace-nowrap">{formattedEndDate}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">Tidak ada kegiatan terjadwal pada tanggal ini.</p>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};