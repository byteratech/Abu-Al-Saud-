import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { LabItem } from '../../types';
import { labItems } from '../../data/labs';
import { 
  ArrowLeft, 
  ArrowRight, 
  FlaskConical, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  Server, 
  Cpu, 
  Copy, 
  Check, 
  Layers, 
  BookOpen, 
  Share2
} from 'lucide-react';

interface WriteupViewProps {
  slug: string;
  onBack: () => void;
  onSelectLab: (slug: string) => void;
}

export const WriteupView: React.FC<WriteupViewProps> = ({ slug, onBack, onSelectLab }) => {
  const { language, dir, localize, t } = useLanguage();
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const lab = labItems.find(item => item.slug === slug) || labItems[0];
  const writeup = lab.writeup;

  const handleCopy = (code: string, index: number) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedSnippet(index);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div id="writeup-detail-page" className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 border-b border-[#202735] pb-4">
        <button
          id="writeup-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.labs.backToLabs}</span>
        </button>

        <button
          id="writeup-share-btn"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA4B2] hover:text-[#F3F5F7] px-3 py-1.5 rounded-lg bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
        >
          {shareCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#10B981] font-medium">{t.content.copied}</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#5B7CFA]" />
              <span>{t.content.share}</span>
            </>
          )}
        </button>
      </div>

      {/* Lab Header */}
      <header className="space-y-6 text-start">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-[#111722] border border-[#202735] text-[#5B7CFA]">
            {lab.platform}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-[#151B26] text-[#9AA4B2] border border-[#202735]">
            {lab.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded uppercase ${
            lab.difficulty === 'advanced' 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : lab.difficulty === 'intermediate'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {t.labs.difficulties[lab.difficulty]}
          </span>
          <span className="text-[#64748B] ms-auto">
            {lab.date}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight leading-tight">
          {localize(lab.title)}
        </h1>

        <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed">
          {localize(lab.description)}
        </p>

        {/* Technologies used in the lab */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#202735] text-xs font-mono">
          <span className="text-[#64748B] me-1">{t.common.technologies}:</span>
          {lab.technologies.map((tech, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded bg-[#111722] border border-[#202735] text-[#F3F5F7]">
              {tech}
            </span>
          ))}
        </div>
      </header>

      {/* Structured Lab Content Sections */}
      <main className="space-y-10 text-start">
        
        {/* Section: Overview */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
          <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5B7CFA]" />
            <span>{t.labs.overview}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
            {localize(writeup.overview)}
          </p>
        </section>

        {/* Section: Objective */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
          <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>{t.labs.objective}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
            {localize(writeup.objective)}
          </p>
        </section>

        {/* Section: Environment & Topology */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
          <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            <span>{t.labs.environment}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed font-mono text-xs sm:text-sm bg-[#111722] p-4 rounded-xl border border-[#202735]">
            {localize(writeup.environment)}
          </p>
        </section>

        {/* Section: Methodology & Investigation */}
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#F3F5F7] flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#5B7CFA]" />
              <span>{t.labs.methodology}</span>
            </h2>
            <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
              {localize(writeup.methodology)}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#202735]">
            <h3 className="text-lg font-bold text-[#F3F5F7]">
              {t.labs.technicalInvestigation}
            </h3>
            <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
              {localize(writeup.technicalInvestigation)}
            </p>
          </div>
        </section>

        {/* Code / Command Snippets */}
        {writeup.codeSnippets && writeup.codeSnippets.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-base font-bold text-[#F3F5F7] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#5B7CFA]" />
              <span>{t.labs.snippetsTitle}</span>
            </h3>

            <div className="space-y-4">
              {writeup.codeSnippets.map((snippet, idx) => (
                <div key={idx} className="rounded-xl bg-[#080B12] border border-[#202735] overflow-hidden" dir="ltr">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#111722] border-b border-[#202735] text-xs font-mono text-[#9AA4B2]">
                    <span className="font-semibold text-[#F3F5F7]">{snippet.title}</span>
                    <button
                      onClick={() => handleCopy(snippet.code, idx)}
                      className="flex items-center gap-1.5 text-xs text-[#9AA4B2] hover:text-[#F3F5F7] px-2.5 py-1 rounded bg-[#151B26] border border-[#202735] transition-all"
                    >
                      {copiedSnippet === idx ? (
                        <>
                          <Check className="w-3 h-3 text-[#10B981]" />
                          <span className="text-[#10B981]">{t.common.copiedCode}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t.common.copyCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <pre className="p-4 text-xs font-mono text-[#F3F5F7] overflow-x-auto leading-relaxed bg-[#080B12]">
                    <code>{snippet.code}</code>
                  </pre>

                  {snippet.explanation && (
                    <div className="px-4 py-3 bg-[#0D111A] border-t border-[#202735] text-xs text-[#9AA4B2] leading-relaxed" dir={dir}>
                      <span className="font-semibold text-[#5B7CFA] me-1.5">{language === 'ar' ? 'ملاحظة تحليلية:' : 'Analysis Note:'}</span>
                      {localize(snippet.explanation)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Findings */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
          <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span>{t.labs.findings}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
            {localize(writeup.findings)}
          </p>
        </section>

        {/* Section: Lessons Learned */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#111722] border border-[#202735] space-y-3">
          <h2 className="text-lg font-bold text-[#F3F5F7]">
            {t.labs.lessonsLearned}
          </h2>
          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
            {localize(writeup.lessonsLearned)}
          </p>
        </section>

        {/* References */}
        {writeup.references && writeup.references.length > 0 && (
          <section className="pt-4 border-t border-[#202735] space-y-3">
            <h4 className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
              {t.labs.references}:
            </h4>
            <ul className="space-y-1.5 text-xs font-mono text-[#9AA4B2]">
              {writeup.references.map((ref, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-[#5B7CFA]">›</span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

      </main>

      {/* Footer Back Button */}
      <div className="pt-6 text-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-xs font-medium text-[#F3F5F7] transition-all cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.labs.backToLabs}</span>
        </button>
      </div>

    </div>
  );
};
