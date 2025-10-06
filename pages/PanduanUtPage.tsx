import React, { useState } from 'react';
import type { AppView } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PARENT_VIEW_MAP } from '../constants';
import { panduanUtData } from '../data/panduanUtData';
import DOMPurify from 'dompurify';

interface PanduanUtPageProps {
  setActiveView: (view: AppView) => void;
}

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  return (
    <details className="bg-slate-900/50 rounded-lg group transition-all duration-300 open:bg-slate-900/70 open:shadow-lg border border-slate-700">
      <summary className="p-5 cursor-pointer flex justify-between items-center font-semibold text-lg text-white font-display list-none">
        {question}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-5 pt-0 text-slate-300 border-t border-slate-700/50">
        <div className="pt-4 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(answer) }}></div>
      </div>
    </details>
  );
};

export const PanduanUtPage: React.FC<PanduanUtPageProps> = ({ setActiveView }) => {
  const parentView = PARENT_VIEW_MAP['Panduan Lengkap UT'];
  const [activeTabId, setActiveTabId] = useState(panduanUtData[0].id);

  const activeCategory = panduanUtData.find(cat => cat.id === activeTabId);

  return (
    <section id="Panduan-Lengkap-UT" className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-6 md:p-12 pt-20 md:pt-28">
      <style>{`
          .faq-answer table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            margin-bottom: 1rem;
            font-size: 0.9em;
          }
          .faq-answer th, .faq-answer td {
            border: 1px solid #4A5568; /* slate-600 */
            padding: 0.5rem 0.75rem;
            text-align: left;
          }
          .faq-answer th {
            background-color: #2D3748; /* slate-800 */
            font-weight: bold;
            color: #E2E8F0; /* slate-200 */
          }
           .faq-answer tbody tr:nth-child(even) {
            background-color: #2d3748; /* slate-800 */
          }
          .faq-answer code {
            background-color: #1a202c;
            padding: 2px 5px;
            border-radius: 4px;
            font-family: monospace;
            color: #FFCC00;
          }
        `}</style>
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display">Panduan Lengkap UT</h1>
          <p className="mt-2 text-lg text-slate-400 max-w-4xl mx-auto">Jawaban komprehensif dari A-Z tentang sistem perkuliahan, biaya, dan pendaftaran di Universitas Terbuka.</p>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8 border border-slate-700">
          <PageHeader parentView={parentView} setActiveView={setActiveView} />

          <div className="flex flex-col md:flex-row gap-8">
            {/* Tab Navigation */}
            <div className="flex-shrink-0 md:w-64">
                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible -mx-4 px-4 md:mx-0 md:px-0">
                {panduanUtData.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveTabId(category.id)}
                        className={`text-left w-full p-3 my-1 rounded-lg font-semibold transition-colors duration-200 flex-shrink-0 md:flex-shrink-1 ${
                            activeTabId === category.id
                            ? 'bg-ut-blue text-white'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                    >
                        {category.title}
                    </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
              {activeCategory && (
                <div>
                  <h2 className="text-3xl font-bold text-white font-display mb-6 md:hidden">{activeCategory.title}</h2>
                  <div className="space-y-4">
                    {activeCategory.faqs.map((faq, index) => (
                      <FaqItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};