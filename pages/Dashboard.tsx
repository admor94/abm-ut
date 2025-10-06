import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { StudentData, AppView, DeadlineTask, AcademicEvent } from '../types';
import { StudentInfoForm } from '../components/StudentInfoForm';
import { v4 as uuidv4 } from 'uuid';
import { CourseSearchInput } from '../components/CourseSearchInput';
import { academicCalendarData } from '../data/academicCalendar';


// --- Notification Helper Functions ---
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return "denied";
    }
    return await Notification.requestPermission();
};

const scheduleNotification = (title: string, body: string, timestamp: number): boolean => {
    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted.');
        alert("Gagal mengatur pengingat. Pastikan notifikasi sudah diizinkan.");
        return false;
    }

    const delay = timestamp - Date.now();
    if (delay <= 0) {
        console.warn('Cannot schedule notification in the past.');
        alert("Gagal mengatur pengingat. Waktu yang dipilih sudah lewat.");
        return false;
    }

    setTimeout(() => {
        new Notification(title, {
            body,
            icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='50' fill='%23346BF1'/%3e%3ctext x='50' y='55' font-size='30' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif' font-weight='bold'%3eABM%3c/text%3e%3c/svg%3e"
        });
    }, delay);
    
    return true;
};
// --- End Notification Helper Functions ---

// --- New Agenda Ticker Component ---
const AgendaTicker: React.FC = () => {
    const tickerItems = useMemo(() => {
        const items: { text: string; date: Date; type: 'end' }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const processedTitles = new Set<string>();

        academicCalendarData.forEach(event => {
            if (processedTitles.has(event.title)) return;

            const endDate = new Date(event.endDate + 'T00:00:00');
            
            // Only show items ending within 7 days
            if (endDate >= today && endDate <= sevenDaysFromNow) {
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                let dayText = '';
                if (diffDays === 0) dayText = 'hari ini';
                else if (diffDays === 1) dayText = 'besok';
                else dayText = `dalam ${diffDays} hari`;

                items.push({ text: `Berakhir ${dayText}: ${event.title}`, date: endDate, type: 'end' });
                processedTitles.add(event.title);
            }
        });

        // Sort by date, soonest first
        return items.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, []);

    if (tickerItems.length === 0) {
        return null;
    }

    // Each item will be displayed for 4 seconds before jumping to the next.
    const animationDuration = tickerItems.length * 4; 

    return (
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 mb-8 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 text-ut-yellow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            </div>
            <div className="ticker-wrap flex-grow h-6">
                <div 
                    className="ticker-move" 
                    style={{ 
                        animationDuration: `${animationDuration}s`,
                    }}
                >
                    {tickerItems.map((item, index) => (
                        <p key={index} className="text-slate-300 text-sm leading-6 h-6 truncate">{item.text}</p>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {tickerItems.map((item, index) => (
                        <p key={`dup-${index}`} className="text-slate-300 text-sm leading-6 h-6 truncate">{item.text}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};
// --- End Agenda Ticker Component ---

const DeadlineItem: React.FC<{ task: DeadlineTask; onRemove: (id: string) => void }> = ({ task, onRemove }) => {
  const [timeLeft, setTimeLeft] = useState(task.endTime - Date.now());

  const handleRemove = () => {
    const taskDisplayName = task.taskType === 'Lainnya' ? task.customTaskName : task.taskType;
    if (window.confirm(`Apakah Anda yakin ingin menghapus tugas "${taskDisplayName}"?`)) {
      onRemove(task.id);
    }
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(task.endTime - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [task.endTime]);

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) {
      return "Waktu Habis";
    }
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
        return `${days} hari ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const daysRemaining = timeLeft / (1000 * 60 * 60 * 24);
  let borderColorClass = 'border-ut-green'; // Default for >= 4 days
  if (timeLeft < 0) {
    borderColorClass = 'border-ut-blue'; // Selesai
  } else if (daysRemaining < 2) {
    borderColorClass = 'border-ut-red';
  } else if (daysRemaining < 4) {
    borderColorClass = 'border-ut-yellow';
  }

  const taskDisplayName = task.taskType === 'Lainnya' ? task.customTaskName : task.taskType;

  return (
    <div className={`bg-slate-900/50 p-4 rounded-lg border-l-4 ${borderColorClass} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-500`}>
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-white text-lg truncate" title={taskDisplayName}>{taskDisplayName}</p>
            <p className="text-sm text-slate-400 truncate" title={task.courseName}>{task.courseName}</p>
            <p className="text-xs text-slate-500 mt-1">
                Berakhir: {new Date(task.endTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3 w-full md:w-auto self-end md:self-center">
             <div className="text-center bg-slate-800/50 p-2 rounded-md flex-grow md:flex-grow-0 md:w-48">
                <p className="text-lg font-semibold font-mono text-white">{formatTimeLeft(timeLeft)}</p>
                <p className="text-xs text-slate-500">Sisa Waktu</p>
            </div>
            <button onClick={handleRemove} className="p-2 text-slate-400 hover:text-ut-red rounded-full" aria-label="Hapus tugas">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    </div>
  );
};


const DeadlineTracker: React.FC = () => {
    const [tasks, setTasks] = useState<DeadlineTask[]>([]);
    // Form state
    const [courseName, setCourseName] = useState('');
    const [taskType, setTaskType] = useState('');
    const [customTaskName, setCustomTaskName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reminderDays, setReminderDays] = useState(3);
    const [reminderTime, setReminderTime] = useState('12:00');

    const taskTypes = [
        'Diskusi Sesi 1', 'Diskusi Sesi 2', 'Diskusi Sesi 3', 'Diskusi Sesi 4', 'Diskusi Sesi 5', 'Diskusi Sesi 6', 'Diskusi Sesi 7', 'Diskusi Sesi 8',
        'Tugas Tuton 1', 'Tugas Tuton 2', 'Tugas Tuton 3',
        'Tutorial Webinar 1', 'Tutorial Webinar 2', 'Tutorial Webinar 3',
        'Bimbingan Karil 1', 'Bimbingan Karil 2', 'Bimbingan Karil 3',
        'Praktik 1', 'Praktik 2', 'Praktik 3',
        'Lainnya',
    ];
    const inputStyle = "block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ut-blue text-white placeholder:text-slate-500";
    const labelStyle = "block text-sm font-medium text-slate-300 font-display mb-1";


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

    useEffect(() => {
        try {
            // Filter out tasks that ended more than a day ago before saving
            const upcomingTasks = tasks.filter(task => task.endTime > (Date.now() - 86400000));
            localStorage.setItem('deadlineTasksV2', JSON.stringify(upcomingTasks));
        } catch (error) {
            console.error("Failed to save tasks to localStorage", error);
        }
    }, [tasks]);
    
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseName || !taskType || !startTime || !endTime || (taskType === 'Lainnya' && !customTaskName)) {
            alert("Harap lengkapi semua kolom yang wajib diisi (bertanda *).");
            return;
        }

        const startTimeMs = new Date(startTime).getTime();
        const endTimeMs = new Date(endTime).getTime();

        if (isNaN(startTimeMs) || isNaN(endTimeMs)) {
            alert("Format tanggal dan waktu tidak valid.");
            return;
        }

        if (endTimeMs <= startTimeMs) {
            alert("Waktu akhir kegiatan harus setelah waktu awal.");
            return;
        }
        
        const [reminderHours, reminderMinutes] = reminderTime.split(':').map(Number);
        const reminderDurationMs = (reminderDays * 24 * 60 * 60 * 1000) + (reminderHours * 60 * 60 * 1000) + (reminderMinutes * 60 * 1000);
        const totalDurationMs = endTimeMs - startTimeMs;

        if (reminderDurationMs > totalDurationMs) {
            alert("Durasi pengingat tidak boleh lebih lama dari total durasi kegiatan.");
            return;
        }

        const reminderTimestamp = endTimeMs - reminderDurationMs;
        const taskDisplayName = taskType === 'Lainnya' ? customTaskName : taskType;

        let finalPermission = Notification.permission;
        if (finalPermission === 'default') {
            finalPermission = await requestNotificationPermission();
        }
        
        if (finalPermission === 'granted') {
            const success = scheduleNotification(
                `Pengingat: ${taskDisplayName}`,
                `Kegiatan untuk mata kuliah "${courseName}" akan berakhir.`,
                reminderTimestamp
            );
            if (success) {
                alert(`Pengingat untuk "${taskDisplayName}" berhasil diatur.`);
            }
        } else {
             alert("Izin notifikasi tidak diberikan. Pengingat tidak akan ditampilkan. Anda dapat mengubah ini di pengaturan browser Anda.");
        }
        
        const newTask: DeadlineTask = {
            id: uuidv4(),
            courseName,
            taskType,
            customTaskName,
            startTime: startTimeMs,
            endTime: endTimeMs,
            reminderDays,
            reminderTime,
        };

        setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => a.endTime - b.endTime));
        
        // Reset form
        setCourseName('');
        setTaskType('');
        setCustomTaskName('');
        setStartTime('');
        setEndTime('');
        setReminderDays(3);
        setReminderTime('12:00');
    };
    
    const removeTask = (id: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    };

    const now = Date.now();
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const fourDays = 4 * 24 * 60 * 60 * 1000;

    const redTasks = tasks.filter(t => t.endTime - now > 0 && t.endTime - now < twoDays);
    const yellowTasks = tasks.filter(t => t.endTime - now >= twoDays && t.endTime - now < fourDays).slice(0, 3);
    const greenTasks = tasks.filter(t => t.endTime - now >= fourDays).slice(0, 1);
    const expiredTasks = tasks.filter(t => t.endTime - now <= 0);

    const tasksToDisplay = [...redTasks, ...yellowTasks, ...greenTasks, ...expiredTasks];


    return (
        <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700/50 md:col-span-2 lg:col-span-4 mt-6">
            <h3 className="font-semibold text-xl text-white font-display mb-4">Pelacak Tenggat Waktu</h3>
            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 mb-6">
                <div>
                    <label className={labelStyle}>Nama Mata Kuliah <span className="text-ut-red">*</span></label>
                    <CourseSearchInput value={courseName} onChange={setCourseName} placeholder="Cari atau ketik nama mata kuliah..."/>
                </div>
                <div>
                    <label htmlFor="taskType" className={labelStyle}>Jenis Tugas <span className="text-ut-red">*</span></label>
                    <select id="taskType" value={taskType} onChange={e => setTaskType(e.target.value)} className={inputStyle}>
                        <option value="" disabled>[Pilih Jenis Tugas]</option>
                        {taskTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                {taskType === 'Lainnya' && (
                    <div className="md:col-span-2">
                        <label htmlFor="customTaskName" className={labelStyle}>Nama Tugas Lainnya <span className="text-ut-red">*</span></label>
                        <input type="text" id="customTaskName" value={customTaskName} onChange={e => setCustomTaskName(e.target.value)} placeholder="Ketikkan nama tugas manual..." className={inputStyle}/>
                    </div>
                )}
                <div>
                    <label htmlFor="startTime" className={labelStyle}>Awal Kegiatan <span className="text-ut-red">*</span></label>
                    <input type="datetime-local" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputStyle}/>
                </div>
                <div>
                    <label htmlFor="endTime" className={labelStyle}>Akhir Kegiatan <span className="text-ut-red">*</span></label>
                    <input type="datetime-local" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputStyle}/>
                </div>
                <div className="md:col-span-2 p-4 bg-slate-900/40 rounded-lg border border-slate-700">
                    <label className={labelStyle}>Pengingat sebelum akhir pengerjaan</label>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <input type="number" value={reminderDays} onChange={e => setReminderDays(Number(e.target.value))} min="0" className={`${inputStyle} w-20 text-center`}/>
                            <span className="text-slate-400">hari</span>
                        </div>
                        <span className="text-slate-400">:</span>
                        <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className={`${inputStyle} w-32`}/>
                    </div>
                     <p className="text-xs text-slate-500 mt-3">
                        <strong>Saran:</strong> Untuk tugas Tuton, aktifkan pengingat 2-3 hari sebelum batas akhir untuk mencegah lonjakan traffic dan kegagalan sistem e-learning.
                    </p>
                </div>

                <button type="submit" className="md:col-span-2 w-full py-3 px-4 font-display font-medium text-lg text-white bg-ut-green hover:bg-green-500 rounded-lg shadow-md transition-colors">Tambah & Setel Pengingat</button>
            </form>
            <div className="space-y-4">
                {tasksToDisplay.length > 0 ? tasksToDisplay.map(task => (
                   <DeadlineItem key={task.id} task={task} onRemove={removeTask} />
                )) : (
                    <p className="text-center text-slate-400 py-4">Belum ada tenggat waktu. Tambahkan kegiatan untuk memulai!</p>
                )}
            </div>
        </div>
    )
}


interface DashboardProps {
  studentData: StudentData | null;
  onProfileSubmit: (data: StudentData) => void;
  setActiveView: (view: AppView) => void;
  studyEndTime: number | null;
}

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode; className?: string }> = ({ icon, label, value, className }) => (
  <div className={`bg-slate-800/60 p-4 rounded-xl flex items-start gap-4 border border-slate-700/50 ${className}`}>
    <div className="flex-shrink-0 h-10 w-10 text-ut-blue-light mt-1">{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-slate-400 font-display">{label}</p>
      <p className="text-lg font-semibold text-white break-words">{value}</p>
    </div>
  </div>
);

const StudyTimer: React.FC<{ initialDuration: number }> = ({ initialDuration }) => {
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1000);
            }, 1000);
        } else if (timeLeft <= 0) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);
    
    // Auto-start timer on mount or when duration changes.
    useEffect(() => {
        setTimeLeft(initialDuration);
        setIsActive(true);
    }, [initialDuration])

    const formatTime = (ms: number) => {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    const addFiveMinutes = () => setTimeLeft(prev => prev + 5 * 60 * 1000);
    const toggleTimer = () => setIsActive(prev => !prev);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialDuration);
    };

    return (
        <div className="bg-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center border border-slate-700/50 lg:col-span-1">
            <p className="text-sm text-slate-400 font-display">Stopwatch Sesi Belajar</p>
            <p className="text-4xl font-bold font-mono text-white my-2">{formatTime(timeLeft)}</p>
            <div className="flex items-center gap-2">
                <button onClick={toggleTimer} className="px-3 py-1 bg-ut-blue rounded-md text-sm hover:bg-ut-blue-light transition-colors">{isActive ? 'Jeda' : 'Mulai'}</button>
                <button onClick={addFiveMinutes} className="px-3 py-1 bg-slate-700 rounded-md text-sm hover:bg-slate-600 transition-colors">+5 Menit</button>
                <button onClick={resetTimer} className="px-3 py-1 bg-slate-700 rounded-md text-sm hover:bg-slate-600 transition-colors">Reset</button>
            </div>
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ studentData, onProfileSubmit }) => {
    const [notificationPermission, setNotificationPermission] = useState("Notification" in window ? Notification.permission : "denied");

    const handleRequestPermission = () => {
        requestNotificationPermission().then(setNotificationPermission);
    };

  if (!studentData) {
    return (
        <section id="Dashboard" className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-6 md:px-12 pt-20 md:pt-28">
            <div className="text-center mb-8 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl font-semibold text-white font-display">Selamat Datang di ABM-UT</h1>
                <p className="mt-2 text-lg text-slate-300 max-w-3xl mx-auto">
                    Untuk memberikan pengalaman belajar yang personal, mohon isi data profil singkat Anda di bawah ini.
                </p>
            </div>
            <StudentInfoForm onSubmit={onProfileSubmit} />
        </section>
    );
  }
  
  const { name, faculty, studyProgram, semester, isWorking, studySituation, studyTimeStart, studyTimeEnd, studyDuration } = studentData;

  return (
    <section id="Dashboard" className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-6 md:p-12 pt-20 md:pt-28">
      <div className="w-full max-w-7xl">
        <div className="mb-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-white font-display">Selamat Datang, {name.split(' ')[0]}!</h1>
                    <p className="mt-2 text-lg text-slate-300 max-w-3xl mx-auto md:mx-0">Berikut adalah ringkasan profil dan sesi belajar Anda.</p>
                </div>
            </div>
        </div>

        <AgendaTicker />

        {notificationPermission === 'default' && (
            <div className="bg-ut-yellow/20 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 text-center sm:text-left">
                <p className="text-sm text-ut-yellow">Aktifkan notifikasi untuk mendapatkan pengingat sesi belajar dan tenggat waktu.</p>
                <button onClick={handleRequestPermission} className="px-4 py-2 bg-ut-yellow hover:bg-yellow-300 rounded-lg text-black font-semibold text-sm flex-shrink-0">Aktifkan Notifikasi</button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>} label="Fakultas" value={faculty} />
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} label="Program Studi" value={studyProgram} />
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M9.75 14.25h.008v.008H9.75v-.008zm3 0h.008v.008H12.75v-.008zm3 0h.008v.008H15.75v-.008z" /></svg>} label="Semester" value={`Semester ke-${semester}`} />
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.072c0 .31.026.613.076.911l-4.21 2.105a1.5 1.5 0 01-1.638 0l-4.21-2.105a1.8 1.8 0 01-.077-.911V14.15M20.25 14.15V6.721a1.5 1.5 0 00-1.02-1.425l-4.21-2.105a1.5 1.5 0 00-1.638 0l-4.21 2.105A1.5 1.5 0 003.75 6.721v7.429a1.8 1.8 0 00.077.911l4.21 2.105a1.5 1.5 0 001.638 0l4.21-2.105a1.5 1.5 0 001.02-1.425V14.15z" /></svg>} label="Status Bekerja" value={isWorking ? 'Ya' : 'Tidak'} />
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>} label="Situasi Belajar" value={studySituation} className="lg:col-span-1" />
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Rentang Waktu" value={`${studyTimeStart} - ${studyTimeEnd}`} className="lg:col-span-1" />
            <InfoCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Estimasi Durasi" value={`${Math.floor(studyDuration / (1000*60*60))} Jam ${Math.floor((studyDuration % (1000*60*60)) / (1000 * 60))} Menit`} className="lg:col-span-1" />
            <StudyTimer initialDuration={studyDuration} />
            <DeadlineTracker />
        </div>
      </div>
    </section>
  );
};
