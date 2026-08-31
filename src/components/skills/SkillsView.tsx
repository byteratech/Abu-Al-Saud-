import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { skillCategories } from '../../data/skills';
import { Palette, Code2, Server, ShieldCheck, Terminal, Search, Check } from 'lucide-react';

export const SkillsView: React.FC = () => {
  const { language, localize, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
    design: Palette,
    development: Code2,
    it: Server,
    security: ShieldCheck,
  };

  const filteredCategories = skillCategories.filter(cat => {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) return false;
    return true;
  }).map(cat => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase();
    const matchingSkills = cat.skills.filter(s => 
      s.name.toLowerCase().includes(q) ||
      (s.description && localize(s.description).toLowerCase().includes(q)) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
    );
    return {
      ...cat,
      skills: matchingSkills,
    };
  }).filter(cat => cat.skills.length > 0);

  return (
    <div id="skills-page" className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 text-start">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>{t.skills.title}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'القدرات والمهارات الفنية' : 'Skills & Technical Depth'}
        </h1>
        <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed max-w-3xl">
          {t.skills.subtitle}
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-[#202735] pb-6">
        
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#5B7CFA] text-white shadow-sm font-semibold'
                : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
            }`}
          >
            {t.common.all}
          </button>
          {skillCategories.map(cat => {
            const Icon = categoryIcons[cat.id] || Terminal;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#5B7CFA] text-white shadow-sm font-semibold'
                    : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{localize(cat.name)}</span>
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في المهارات...' : 'Filter skills...'}
            className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] placeholder-[#64748B] ps-9 pe-3 py-2 rounded-lg focus:outline-none focus:border-[#5B7CFA]"
          />
        </div>

      </div>

      {/* Skill Categories Grid */}
      <div className="space-y-12 text-start">
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9AA4B2] bg-[#0D111A] border border-[#202735] rounded-2xl">
            {language === 'ar' ? 'لا توجد مهارات تطابق خيارات البحث.' : 'No skills found matching the search criteria.'}
          </div>
        ) : (
          filteredCategories.map((category) => {
            const Icon = categoryIcons[category.id] || Terminal;
            return (
              <div key={category.id} className="space-y-6">
                
                {/* Category Header */}
                <div className="flex items-center gap-3 border-s-2 border-[#5B7CFA] ps-3">
                  <div className="p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#F3F5F7]">
                      {localize(category.name)}
                    </h2>
                    <p className="text-xs text-[#9AA4B2]">
                      {localize(category.description)}
                    </p>
                  </div>
                </div>

                {/* Skills Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.skills.map((skill, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-5 rounded-xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-[#F3F5F7] leading-snug">
                            {skill.name}
                          </h3>
                          {skill.levelLabel && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111722] border border-[#202735] text-[#5B7CFA] shrink-0">
                              {localize(skill.levelLabel)}
                            </span>
                          )}
                        </div>

                        {skill.description && (
                          <p className="text-xs text-[#9AA4B2] leading-relaxed">
                            {localize(skill.description)}
                          </p>
                        )}
                      </div>

                      {skill.tags && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#202735]/40">
                          {skill.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151B26] text-[#64748B]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
