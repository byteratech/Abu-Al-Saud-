import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { journeyStages } from '../../data/profile';
import { ActiveView } from '../../types';
import { 
  Palette, 
  Layout, 
  Code2, 
  Server, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface JourneySectionProps {
  setActiveView: (view: ActiveView) => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({ setActiveView }) => {
  const { language, dir, localize, t } = useLanguage();
  const [selectedStage, setSelectedStage] = useState<string>('cybersecurity');

  const stageIcons: Record<string, React.FC<{ className?: string }>> = {
    branding: Palette,
    uiux: Layout,
    webdev: Code2,
    it: Server,
    cybersecurity: ShieldCheck,
  };

  const currentStage = journeyStages.find(s => s.id === selectedStage) || journeyStages[4];
  const IconComponent = stageIcons[currentStage.id] || ShieldCheck;

  return (
    <section id="journey-timeline-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-start space-y-3 mb-14">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>{t.journey.title}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'رحلة التطور من البرمجة وتطوير الويب إلى الأمن السيبراني' : 'The Evolution from Web Development to Cybersecurity'}
        </h2>
        <p className="text-sm sm:text-base text-[#9AA4B2] max-w-2xl">
          {t.journey.subtitle}
        </p>
      </div>

      {/* Interactive Horizontal / Responsive Step Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Stages Navigation List */}
        <div className="lg:col-span-5 space-y-3">
          {journeyStages.map((stage, idx) => {
            const isSelected = stage.id === selectedStage;
            const StepIcon = stageIcons[stage.id] || Palette;
            return (
              <button
                key={stage.id}
                id={`journey-step-${stage.id}`}
                onClick={() => setSelectedStage(stage.id)}
                className={`w-full p-4 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-[#151B26] border-[#5B7CFA] shadow-lg shadow-[#5B7CFA]/10 text-white'
                    : 'bg-[#0D111A] border-[#202735] text-[#9AA4B2] hover:bg-[#111722] hover:text-[#F3F5F7]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-[#5B7CFA] text-white' : 'bg-[#111722] text-[#9AA4B2]'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#64748B] tracking-wider mb-0.5">
                      0{idx + 1} // {stage.period}
                    </div>
                    <div className="text-sm font-semibold truncate text-[#F3F5F7]">
                      {localize(stage.title)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {dir === 'rtl' ? (
                    <ChevronLeft className={`w-4 h-4 ${isSelected ? 'text-[#5B7CFA]' : 'text-[#64748B]'}`} />
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#5B7CFA]' : 'text-[#64748B]'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="lg:col-span-7 bg-[#0D111A] border border-[#202735] p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 text-start">
          
          <div className="flex items-start justify-between gap-4 border-b border-[#202735] pb-6">
            <div className="space-y-1">
              <span className="font-mono text-xs text-[#5B7CFA] font-bold tracking-wider">
                {currentStage.period}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">
                {localize(currentStage.title)}
              </h3>
              <p className="text-xs sm:text-sm text-[#9AA4B2]">
                {localize(currentStage.subtitle)}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#111722] border border-[#202735] flex items-center justify-center text-[#5B7CFA] shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
            {localize(currentStage.description)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-2">
              <h4 className="text-xs font-mono font-semibold text-[#5B7CFA] uppercase tracking-wider">
                {language === 'ar' ? 'ما الذي تغير؟' : 'The Shift'}
              </h4>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                {localize(currentStage.whatChanged)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-2">
              <h4 className="text-xs font-mono font-semibold text-[#10B981] uppercase tracking-wider">
                {language === 'ar' ? 'ما الذي تم تعلمه؟' : 'Core Insights'}
              </h4>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                {localize(currentStage.whatLearned)}
              </p>
            </div>
          </div>

          {/* Skills acquired in this stage */}
          <div className="pt-2">
            <h4 className="text-xs font-mono text-[#64748B] uppercase tracking-wider mb-2.5">
              {language === 'ar' ? 'المهارات المكتسبة في هذه المرحلة:' : 'Skills Acquired:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentStage.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#151B26] border border-[#202735] text-[#F3F5F7]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
