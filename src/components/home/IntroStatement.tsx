import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveView } from '../../types';
import { ArrowLeft, ArrowRight, Compass, Shield, Server, Layers, BookOpen } from 'lucide-react';

interface IntroStatementProps {
  setActiveView: (view: ActiveView) => void;
}

export const IntroStatement: React.FC<IntroStatementProps> = ({ setActiveView }) => {
  const { dir, t } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const metricsIcons = [Shield, Server, Layers, BookOpen];

  return (
    <section id="intro-statement-section" className="py-20 bg-[#0D111A] border-y border-[#202735] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Narrative */}
          <div className="lg:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>{t.intro.question}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#F3F5F7] leading-snug">
              {t.brand.role}
            </h2>

            <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed font-normal whitespace-pre-line">
              {t.intro.text}
            </p>

            <div className="pt-2">
              <button
                id="intro-read-more-btn"
                onClick={() => {
                  setActiveView({ type: 'about' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B7CFA] hover:text-[#4B6EF5] transition-colors cursor-pointer group"
              >
                <span>{t.common.readMore}</span>
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Context Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.intro.metrics.map((metric, idx) => {
              const Icon = metricsIcons[idx];
              return (
                <div 
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 hover:bg-[#151B26] transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0D111A] border border-[#202735] flex items-center justify-center shrink-0 group-hover:border-[#5B7CFA]/40 text-[#64748B] group-hover:text-[#5B7CFA] transition-colors shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-start">
                    <div className="text-sm sm:text-base font-bold text-[#F3F5F7] mb-0.5">
                      {metric.value}
                    </div>
                    <div className="text-xs text-[#9AA4B2] font-medium">
                      {metric.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
