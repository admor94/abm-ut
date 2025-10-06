import React, { useState, useEffect, useMemo } from 'react';
import type { StudentData } from '../types';
import { FACULTIES, STUDY_PROGRAMS } from '../constants';

interface StudentInfoFormProps {
  onSubmit: (data: StudentData) => void;
}

export const StudentInfoForm: React.FC<StudentInfoFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [semester, setSemester] = useState(0);
  const [isWorking, setIsWorking] = useState<boolean | null>(null);
  const [studySituation, setStudySituation] = useState<'Pagi' | 'Siang' | 'Malam' | ''>('');
  const [studyTimeStart, setStudyTimeStart] = useState('');
  const [studyTimeEnd, setStudyTimeEnd] = useState('');

  useEffect(() => {
    setStudyProgram(''); // Reset study program when faculty changes
  }, [faculty]);

  const [studyDuration, studyDurationInMillis] = useMemo(() => {
    if (!studyTimeStart || !studyTimeEnd) return ['0 Jam 0 Menit', 0];
    const [startH, startM] = studyTimeStart.split(':').map(Number);
    const [endH, endM] = studyTimeEnd.split(':').map(Number);

    const startDate = new Date(0, 0, 0, startH, startM);
    let endDate = new Date(0, 0, 0, endH, endM);
    
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    let diff = endDate.getTime() - startDate.getTime();
    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return [`${hours} Jam ${minutes} Menit`, diff];
  }, [studyTimeStart, studyTimeEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWorking === null || !studySituation) return;
    onSubmit({
      name,
      faculty,
      studyProgram,
      semester,
      isWorking,
      studySituation,
      studyTimeStart,
      studyTimeEnd,
      studyDuration: studyDurationInMillis,
    });
  };

  const inputStyle = "mt-1 block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ut-blue focus:border-ut-blue text-white placeholder:text-gray-500";
  const labelStyle = "block text-sm font-medium text-gray-300 font-display";
  const optionStyle = "bg-gray-700 text-white";

  return (
    <div className="w-full max-w-4xl bg-slate-900/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700/50 transition-opacity duration-500 ease-in-out">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelStyle}>Nama Mahasiswa</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} required placeholder="[Masukkan Nama Anda]" />
          </div>
          <div>
            <label htmlFor="faculty" className={labelStyle}>Fakultas</label>
            <select id="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} className={inputStyle} required>
              <option value="" disabled hidden className={optionStyle}>[Pilih Fakultas Anda]</option>
              {FACULTIES.map(f => <option key={f} value={f} className={optionStyle}>{f}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="studyProgram" className={labelStyle}>Program Studi</label>
            <select id="studyProgram" value={studyProgram} onChange={(e) => setStudyProgram(e.target.value)} className={inputStyle} disabled={!faculty} required>
              <option value="" disabled hidden className={optionStyle}>[Pilih Program Studi Anda]</option>
              {faculty && STUDY_PROGRAMS[faculty].map(p => <option key={p} value={p} className={optionStyle}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="semester" className={labelStyle}>Semester</label>
            <select id="semester" value={semester} onChange={(e) => setSemester(Number(e.target.value))} className={inputStyle} required>
              <option value={0} disabled hidden className={optionStyle}>[Pilih Semester Anda]</option>
              {Array.from({ length: 8 }, (_, i) => i + 1).map(s => <option key={s} value={s} className={optionStyle}>Semester ke - {s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelStyle}>Status Bekerja</label>
            <div className="mt-3 flex items-center space-x-6">
              <label className="flex items-center text-white"><input type="radio" name="isWorking" checked={isWorking === true} onChange={() => setIsWorking(true)} className="focus:ring-ut-blue h-4 w-4 text-ut-blue bg-gray-700 border-gray-600" required/> <span className="ml-2">Ya</span></label>
              <label className="flex items-center text-white"><input type="radio" name="isWorking" checked={isWorking === false} onChange={() => setIsWorking(false)} className="focus:ring-ut-blue h-4 w-4 text-ut-blue bg-gray-700 border-gray-600"/> <span className="ml-2">Tidak</span></label>
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="studySituation" className={labelStyle}>Situasi Jam Belajar</label>
            <select id="studySituation" value={studySituation} onChange={(e) => setStudySituation(e.target.value as any)} className={inputStyle} required>
              <option value="" disabled hidden className={optionStyle}>[Pilih Situasi Jam Belajar Anda]</option>
              <option value="Pagi" className={optionStyle}>Pagi</option>
              <option value="Siang" className={optionStyle}>Siang</option>
              <option value="Malam" className={optionStyle}>Malam</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label htmlFor="studyTimeStart" className={labelStyle}>Dari Jam</label>
              <input type="time" id="studyTimeStart" value={studyTimeStart} onChange={(e) => setStudyTimeStart(e.target.value)} className={inputStyle} required />
            </div>
            <div>
              <label htmlFor="studyTimeEnd" className={labelStyle}>Sampai Jam</label>
              <input type="time" id="studyTimeEnd" value={studyTimeEnd} onChange={(e) => setStudyTimeEnd(e.target.value)} className={inputStyle} required />
            </div>
          </div>
          <div className="md:col-span-2 p-3 bg-ut-blue/10 rounded-lg text-center border border-ut-blue/30">
            <p className="text-sm font-medium text-gray-300 font-display">Estimasi Durasi Belajar</p>
            <p className="text-xl font-bold text-ut-blue-light font-display">{studyDuration}</p>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-ut-blue hover:bg-ut-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-ut-blue transition duration-300 ease-in-out transform hover:scale-105 font-display">
              Siap Explore!
            </button>
          </div>
        </form>
      </div>
  );
};