import React from 'react';
import type { AppView } from '../types';

interface PageHeaderProps {
  parentView?: AppView;
  setActiveView?: (view: AppView) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ parentView, setActiveView }) => {
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (parentView && setActiveView) {
      setActiveView(parentView);
    }
  };

  return (
    <>
      {parentView && setActiveView && (
        <a
          href={`#${parentView.replace(/\s+/g, '-')}`}
          onClick={handleBack}
          className="flex items-center gap-2 text-ut-blue-light hover:text-white mb-6 transition-colors group text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold font-display">Kembali ke {parentView}</span>
        </a>
      )}
    </>
  );
};