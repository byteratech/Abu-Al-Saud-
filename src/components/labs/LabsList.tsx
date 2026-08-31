import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { labItems } from '../../data/labs';
import { LabDifficulty, LabStatus } from '../../types';
import { 
  FlaskConical, 
  Search, 
  ShieldCheck, 
  Terminal, 
  ArrowLeft, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface LabsListProps {
  onSelectLab: (slug: string) => void;
}

export const LabsList: React.FC<LabsListProps> = ({ onSelectLab }) => {
  const { language, dir, localize, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const filteredLabs = useMemo(() => {
    return labItems.filter(lab => {
      if (selectedDifficulty !== 'all' && lab.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedStatus !== 'all' && lab.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = localize(lab.title).toLowerCase();
        const desc = localize(lab.description).toLowerCase();
        const topics = lab.topics.join(' ').toLowerCase();
        const tech = lab.technologies.join(' ').toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !topics.includes(q) && !tech.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedDifficulty, selectedStatus, language]);

  return (
    <div id="labs-page" className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 text-start">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <FlaskConical className="w-4 h-4" />
          <span>{t.labs.title}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'معمل التجارب والأبحاث الأمنية' : 'Cybersecurity Labs & Write-ups'}
        </h1>
        <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed max-w-3xl">
          {t.labs.subtitle}
        </p>
      </div>

      {/* Discovery & Filter Controls */}
      <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-5 text-start">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.labs.searchPlaceholder}
            className="w-full bg-[#111722] border border-[#202735] text-sm text-[#F3F5F7] placeholder-[#64748B] ps-10 pe-4 py-2.5 rounded-xl focus:outline-none focus:border-[#5B7CFA] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          
          {/* Difficulty filter */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-mono text-[#64748B] me-1">
              {t.labs.filterDifficulty}:
            </span>
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDifficulty === 'all'
                  ? 'bg-[#5B7CFA] text-white font-semibold'
                  : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
              }`}
            >
              {t.common.all}
            </button>
            {(['beginner', 'intermediate', 'advanced'] as LabDifficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#5B7CFA] text-white font-semibold'
                    : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
                }`}
              >
                {t.labs.difficulties[diff]}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-mono text-[#64748B] me-1">
              {t.labs.filterStatus}:
            </span>
            {(['all', 'completed', 'in_progress'] as (LabStatus | 'all')[]).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedStatus === st
                    ? 'bg-[#151B26] text-[#5B7CFA] border border-[#5B7CFA]/40 font-semibold'
                    : 'bg-[#111722] text-[#64748B] hover:text-[#9AA4B2] border border-[#202735]'
                }`}
              >
                {st === 'all' ? t.common.all : t.labs.statuses[st]}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Labs Grid */}
      <div className="space-y-6 text-start">
        {filteredLabs.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#9AA4B2] bg-[#0D111A] border border-[#202735] rounded-2xl space-y-2">
            <p>{t.labs.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLabs.map((lab) => (
              <div
                key={lab.id}
                onClick={() => onSelectLab(lab.slug)}
                className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                      {lab.platform}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        lab.difficulty === 'advanced' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : lab.difficulty === 'intermediate'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {t.labs.difficulties[lab.difficulty]}
                      </span>

                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#151B26] text-[#64748B]">
                        {t.labs.statuses[lab.status]}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors leading-snug">
                    {localize(lab.title)}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed line-clamp-3">
                    {localize(lab.description)}
                  </p>

                  {/* Topics Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lab.topics.map((tp, idx) => (
                      <span key={idx} className="text-[10px] font-mono bg-[#111722] px-2 py-0.5 rounded text-[#9AA4B2] border border-[#202735]">
                        {tp}
                      </span>
                    ))}
                  </div>

                </div>

                <div className="pt-4 border-t border-[#202735]/60 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-mono text-[11px]">{lab.date}</span>

                  <div className="flex items-center gap-1 text-[#5B7CFA] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>{t.labs.viewWriteup}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
