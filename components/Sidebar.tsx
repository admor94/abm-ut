import React from 'react';
import type { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isLocked: boolean;
}

const colorClassMap: Partial<Record<AppView, string>> = {
    'Dashboard': 'hover-bar-blue',
    'Kreativitas': 'hover-bar-green',
    'Interaktif': 'hover-bar-yellow',
    'Alat Bantu': 'hover-bar-red',
    'Simulasi': 'hover-bar-green',
    'Tutorial Online': 'hover-bar-yellow',
    'Tracking': 'hover-bar-blue',
    'Seputar UT': 'hover-bar-blue',
    'Pengaturan': 'hover-bar-blue',
    'Informasi': 'hover-bar-yellow',
};

const activeColorClassMap: Partial<Record<AppView, string>> = {
    'Dashboard': 'bg-ut-blue/20 text-ut-blue-light',
    'Kreativitas': 'bg-ut-green/20 text-ut-green',
    'Interaktif': 'bg-ut-yellow/20 text-ut-yellow',
    'Alat Bantu': 'bg-ut-red/20 text-ut-red',
    'Simulasi': 'bg-ut-green/20 text-ut-green',
    'Tutorial Online': 'bg-ut-yellow/20 text-ut-yellow',
    'Tracking': 'bg-ut-blue/20 text-ut-blue-light',
    'Seputar UT': 'bg-ut-blue/20 text-ut-blue-light',
    'Pengaturan': 'bg-slate-600/20 text-slate-200',
    'Informasi': 'bg-ut-yellow/20 text-ut-yellow',
};


const NavLink: React.FC<{
  view: AppView;
  title: string;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  children: React.ReactNode;
  isLocked: boolean;
}> = ({ view, title, activeView, setActiveView, children, isLocked }) => {
  const allowedWhenLocked: AppView[] = ['Dashboard', 'Informasi', 'Riwayat Belajar Mahasiswa', 'FAQ', 'Dokumentasi Pembaruan', 'Tentang Aplikasi', 'Pengaturan', 'Integrasi API', 'Reset Aplikasi'];
  const isDisabled = isLocked && !allowedWhenLocked.includes(view);
  const isActive = activeView === view;

  const colorClass = colorClassMap[view] || 'hover-bar-blue';
  const activeClasses = activeColorClassMap[view] || 'bg-ut-blue/20 text-ut-blue-light';
  
  const baseClasses = "flex items-center w-full px-4 py-3 rounded-md transition-colors duration-200 ease-in-out text-sm link-hover-effect";
  const inactiveClasses = `text-slate-400 hover:bg-slate-800/60 hover:text-white ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <a
      href={`#${view.replace(/\s+/g, '-')}`}
      onClick={(e) => {
        e.preventDefault();
        if (!isDisabled) {
          setActiveView(view);
        }
      }}
      className={`${baseClasses} ${colorClass} ${isActive ? `active ${activeClasses} font-semibold` : inactiveClasses}`}
      aria-label={title}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled}
    >
      <div className="mr-3 w-6 h-6 flex-shrink-0">{children}</div>
      <span className="font-display">{title}</span>
    </a>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isLocked }) => {
  const menuItems: { view: AppView, title: string, icon: React.ReactNode }[] = [
    { view: 'Dashboard', title: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
    { view: 'Kreativitas', title: 'Metode Belajar', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-7.5 0C4.508 19.64 2.25 15.223 2.25 10.5c0-1.09.117-2.155.33-3.182m19.14 3.182c.213 1.027.33 2.092.33 3.182 0 4.723-2.258 9.14-5.649 11.642M12 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
    { view: 'Interaktif', title: 'Asisten Interaktif', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
    { view: 'Alat Bantu', title: 'Alat Bantu', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 01-1.622 3.385m-5.043-.025a15.998 15.998 0 00-3.388-1.62m7.869 5.043A15.998 15.998 0 0119.5 12a15.998 15.998 0 01-3.388-1.62m-7.869-5.043A15.998 15.998 0 0012 4.5c-2.446 0-4.728.666-6.612 1.834m13.224 0A15.998 15.998 0 0112 19.5c-2.446 0-4.728-.666-6.612-1.834m-13.224 0c-1.168-.667-2.254-1.518-3.186-2.521m16.392 2.521c-.932 1.003-2.018 1.854-3.186 2.521m0 0A15.998 15.998 0 0112 4.5c2.446 0 4.728.666 6.612 1.834m-13.224 0c-1.168-.667-2.254-1.518-3.186-2.521m16.392 2.521c-.932 1.003-2.018 1.854-3.186 2.521" /></svg> },
    { view: 'Simulasi', title: 'Simulasi & Riset', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
    { view: 'Tutorial Online', title: 'Tutorial Online', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg> },
    { view: 'Tracking', title: 'Pelacakan', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.091 12a3.091 3.091 0 10-6.182 0 3.091 3.091 0 006.182 0z" /></svg> },
    { view: 'Seputar UT', title: 'Seputar UT', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg> },
    { view: 'Pengaturan', title: 'Pengaturan', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg> },
    { view: 'Informasi', title: 'Informasi & Bantuan', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg> },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 h-full bg-slate-900/70 backdrop-blur-lg flex-col w-64 z-50 border-r border-slate-700/50">
      <div aria-label="Asisten Belajar Mahasiswa Universitas Terbuka Home" className="px-6 pt-12 pb-8">
        <h1 className="text-xl font-semibold text-white font-display leading-tight">Asisten Belajar Mahasiswa</h1>
        <p className="text-base text-slate-300">Universitas Terbuka</p>
      </div>
      <div className="flex flex-col space-y-2 px-4">
        {menuItems.map(item => (
          <NavLink key={item.view} {...item} activeView={activeView} setActiveView={setActiveView} isLocked={isLocked}>
            {item.icon}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};