import React from 'react';

interface MobileHeaderProps {
  // No props needed after removing menu button
}

export const MobileHeader: React.FC<MobileHeaderProps> = () => {
  return (
    <header className="sticky top-0 md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm z-30 border-b border-slate-700/50 h-16">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold font-display text-white truncate">Asisten Belajar Mahasiswa</h1>
      </div>
      {/* Hamburger button removed for bottom navigation */}
    </header>
  );
};