import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { personalProfile, journeyStages } from '../../data/profile';
import { skillCategories } from '../../data/skills';
import { ActiveView } from '../../types';
import { 
  User, 
  MapPin, 
  Target, 
  Lightbulb, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Palette, 
  Layout, 
  Code2, 
  Server,
  Mail,
  Terminal,
  Search
} from 'lucide-react';

interface AboutViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setActiveView }) => {
  const { language, dir, localize, t } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stageIcons: Record<string, React.FC<{ className?: string }>> = {
    branding: Palette,
    uiux: Layout,
    webdev: Code2,
    it: Server,
    cybersecurity: ShieldCheck,
  };

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
    <div id="about-page" className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      
      {/* Page Header */}
      <div className="space-y-4 text-start">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'من أنا ؟' : 'The Story & Philosophy'}
        </h1>
        <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed max-w-3xl">
          {t.about.bioIntro}
        </p>
      </div>

      {/* Narrative Section: The Detailed Journey */}
      <div className="space-y-10 text-start">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7]">
            {language === 'ar' ? 'مسيرة التطور التراكمي' : 'The Cumulative Journey'}
          </h2>
          <p className="text-sm text-[#9AA4B2]">
            {language === 'ar' 
              ? 'كل خطوة في هذا المسار كانت تمهيداً منطقياً لما بعدها، وصولاً إلى التخصص الأمني الحالي.' 
              : 'Every milestone laid a logical foundation for the next, culminating in defensive security and systems research.'}
          </p>
        </div>

        <div className="relative border-s border-[#202735] ms-4 sm:ms-6 space-y-10">
          {journeyStages.map((stage, idx) => {
            const Icon = stageIcons[stage.id] || ShieldCheck;
            return (
              <div key={stage.id} className="relative ps-6 sm:ps-8 group">
                
                {/* Timeline Dot with Icon */}
                <div className="absolute -start-[17px] top-1.5 w-8 h-8 rounded-full bg-[#111722] border border-[#202735] group-hover:border-[#5B7CFA] flex items-center justify-center text-[#5B7CFA] transition-colors shadow-sm">
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202735]/60 pb-3">
                    <div>
                      <span className="font-mono text-xs text-[#5B7CFA] font-bold">
                        {stage.period}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#F3F5F7]">
                        {localize(stage.title)}
                      </h3>
                    </div>
                    <span className="text-xs text-[#64748B] font-mono">
                      {localize(stage.subtitle)}
                    </span>
                  </div>

                  <p className="text-sm text-[#9AA4B2] leading-relaxed">
                    {localize(stage.description)}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-[#111722] border border-[#202735]">
                      <span className="font-mono text-[#5B7CFA] font-semibold block mb-1">
                        {language === 'ar' ? 'التحول الفكري:' : 'The Shift:'}
                      </span>
                      <span className="text-[#9AA4B2]">{localize(stage.whatChanged)}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#111722] border border-[#202735]">
                      <span className="font-mono text-[#10B981] font-semibold block mb-1">
                        {language === 'ar' ? 'المعرفة المكتسبة:' : 'Key Takeaways:'}
                      </span>
                      <span className="text-[#9AA4B2]">{localize(stage.whatLearned)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stage.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#151B26] text-[#64748B]">
                        {skill}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Skills & Technical Depth Section */}
      <div className="space-y-8 text-start border-t border-[#202735] pt-16">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>{t.skills.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
            {language === 'ar' ? 'القدرات والمهارات الفنية' : 'Skills & Technical Depth'}
          </h2>
          <p className="text-sm text-[#9AA4B2] max-w-2xl">
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
        <div className="space-y-12">
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
                      <h3 className="text-lg font-bold text-[#F3F5F7]">
                        {localize(category.name)}
                      </h3>
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
                            <h4 className="text-sm font-bold text-[#F3F5F7] leading-snug">
                              {skill.name}
                            </h4>
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

      {/* Core Philosophy Section */}
      <div className="space-y-8 text-start">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>{t.about.philosophyTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7]">
            {language === 'ar' ? 'المبادئ والقيم المهنية' : 'Core Principles & Values'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.about.philosophies.map((phil, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
              <div className="text-sm font-bold text-[#5B7CFA] font-bold">
                0{idx + 1} // PRINCIPLE
              </div>
              <h3 className="text-lg font-bold text-[#F3F5F7]">
                {phil.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
                {phil.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA to Contact */}
      <div className="p-8 rounded-2xl bg-[#111722] border border-[#202735] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#F3F5F7]">
            {language === 'ar' ? 'هل تود مناقشة مشروع أو تبادل الأفكار؟' : 'Interested in collaboration or knowledge exchange?'}
          </h3>
          <p className="text-xs sm:text-sm text-[#9AA4B2]">
            {language === 'ar' ? 'أرحب دائماً بالتواصل مع المطورين، المصممين، والباحثين الأمنيين.' : 'Always happy to connect with developers, designers, and security researchers.'}
          </p>
        </div>

        <button
          id="about-contact-cta"
          onClick={() => {
            setActiveView({ type: 'contact' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B7CFA] hover:bg-[#4B6EF5] text-white text-xs font-semibold shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span>{t.nav.contact}</span>
        </button>
      </div>

    </div>
  );
};
