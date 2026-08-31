import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveView } from '../../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Terminal, 
  ShieldCheck,
  Sparkles, 
  BookOpen, 
  Layers, 
  Cpu, 
  Code2,
  Lock,
  Wifi,
  Server,
  Code,
  Calendar,
  ChevronDown
} from 'lucide-react';

interface HeroProps {
  setActiveView: (view: ActiveView) => void;
}

export const Hero: React.FC<HeroProps> = ({ setActiveView }) => {
  const { language, dir, t } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section id="hero-section" className="relative min-h-[100dvh] flex items-center pt-24 pb-20 overflow-hidden">
      
      {/* Background Subtle Radar & Technical Grid */}
      <div className="absolute inset-0 pointer-events-none -z-10 editorial-grid opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B7CFA]/6 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-start flex flex-col items-start">
            
            {/* Public Name & Headline */}
            <div className="space-y-3 flex flex-col items-start">
              <span className="text-sm text-[#5B7CFA] uppercase tracking-widest block font-bold">
                {t.hero.greeting}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F3F5F7] leading-[1.15]">
                {t.brand.name}
              </h1>
              <p className="text-lg sm:text-xl text-[#9AA4B2] max-w-2xl leading-relaxed pt-2 whitespace-pre-line text-start">
                {t.hero.subtitle}
              </p>
            </div>



            {/* Action Buttons */}
            <div className="flex flex-wrap justify-start items-center gap-3 pt-3">
              <button
                id="hero-explore-work-btn"
                onClick={() => {
                  setActiveView({ type: 'projects' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B7CFA] hover:bg-[#4B6EF5] text-white text-sm font-semibold shadow-lg shadow-[#5B7CFA]/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>{t.hero.exploreWork}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                id="hero-book-consultation-btn"
                onClick={() => {
                  setActiveView({ type: 'contact' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#F3F5F7] text-sm font-medium transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#5B7CFA]" />
                <span>{t.hero.readWriteups}</span>
              </button>


            </div>

          </div>

          {/* Right Column: Animated Cloudinary Image Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              
              {/* Outer Glow & Gradient Pulse */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#5B7CFA]/30 via-purple-500/20 to-[#10B981]/30 rounded-3xl blur-xl opacity-75 animate-pulse" />

              <div className="relative p-6 rounded-3xl bg-[#0D111A]/90 border border-[#202735] shadow-2xl backdrop-blur-md flex flex-col items-center space-y-6 group">
                
                {/* Header Node Info */}
                <div className="w-full flex items-center justify-between border-b border-[#202735] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="font-mono text-[11px] text-[#64748B] tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                    Abu Al-Saud
                  </span>
                </div>

                {/* Image Container with Floating & Hover Animation */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center p-4 rounded-2xl bg-[#111722] border border-[#202735] overflow-hidden transition-transform duration-500 group-hover:scale-105">
                  
                  {/* Subtle Grid Pattern Inside */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#5B7CFA_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Animated Floating Image */}
                  <img 
                    src="https://res.cloudinary.com/f6t2sqiv/image/upload/v1787852818/Icon.png" 
                    alt="Brand Icon" 
                    referrerPolicy="no-referrer"
                    className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_10px_20px_rgba(91,124,250,0.3)] animate-[bounce_4s_ease-in-out_infinite]"
                  />
                  
                  {/* Glowing Ring Underneath */}
                  <div className="absolute bottom-6 w-24 h-4 bg-[#5B7CFA]/30 blur-md rounded-full animate-pulse" />
                </div>

                {/* Footer Badge */}
                <div className="w-full flex items-center justify-center text-[11px] sm:text-sm font-bold bg-[#111722] px-3.5 py-2 rounded-xl border border-[#202735]">
                  <span className="text-[#9AA4B2] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5B7CFA]" />
                    <span>برمجة &middot; تطوير ويب &middot; أمن سيبراني &middot; IT</span>
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer z-20"
        onClick={() => {
          const nextSection = document.getElementById('projects-section') || document.querySelector('section:nth-of-type(2)');
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
          }
        }}
      >
        <span className="text-[10px] uppercase tracking-widest text-[#9AA4B2] font-mono">
          {language === 'ar' ? 'اكتشف المزيد' : 'Scroll'}
        </span>
        <ChevronDown className="w-5 h-5 text-[#5B7CFA] animate-bounce" />
      </div>
    </section>
  );
};

