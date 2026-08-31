import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Sparkles, X, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_WHATSAPP_NUMBER = '201033108223';

export const FloatingWhatsAppButton: React.FC = () => {
  const { language } = useLanguage();
  const { theme, isDark } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [isHovered, setIsHovered] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch registered phone from Firebase settings if custom set
  useEffect(() => {
    async function loadPhone() {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'admin_security'));
        if (docSnap.exists() && docSnap.data().recoveryPhone) {
          setPhoneNumber(docSnap.data().recoveryPhone.replace(/\D/g, ''));
        }
      } catch (_) {}
    }
    loadPhone();
  }, []);

  // Monitor scroll for subtle entrance animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const messageText = language === 'ar'
    ? 'مرحباً أبو السعود، أود التواصل معك بخصوص مشروع / استشارة تقنية.'
    : 'Hello Abu Al-Saud, I would like to inquire about a project or technical consultation.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-6 z-40 transition-all duration-300 left-6 sm:left-8">
      <div className="relative flex items-center group">
        
        {/* Floating Bubble Tooltip / Quick Chat Banner */}
        {!isDismissed && (
          <div
            className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xl transition-all duration-300 absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap backdrop-blur-md ${
              isDark 
                ? 'bg-[#0D111A]/95 border border-[#10B981]/40 shadow-black/40 text-[#F3F5F7]' 
                : 'bg-white/95 border border-[#10B981]/50 shadow-slate-400/20 text-[#0F172A]'
            } ${
              isHovered ? 'opacity-100 translate-x-2' : 'opacity-95 translate-x-0'
            }`}
          >
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
            </div>

            <div className="space-y-0.5 text-start">
              <div className={`font-bold flex items-center gap-1 text-xs ${isDark ? 'text-[#F3F5F7]' : 'text-slate-900'}`}>
                <span>{language === 'ar' ? 'تواصل معي مباشرة عبر واتساب' : 'Direct WhatsApp Chat'}</span>
                <Sparkles className="w-3 h-3 text-[#10B981]" />
              </div>
              <p className={`text-[10px] font-mono ${isDark ? 'text-[#9AA4B2]' : 'text-slate-500'}`}>
                {language === 'ar' ? 'متاح للرد والاستشارات السريعة' : 'Online & ready for inquiries'}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="ms-2 px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
            >
              <span>{language === 'ar' ? 'محادثة' : 'Chat'}</span>
              <Send className="w-2.5 h-2.5" />
            </a>

            <button
              onClick={() => setIsDismissed(true)}
              className={`p-0.5 rounded transition-colors ms-1 cursor-pointer ${
                isDark ? 'text-[#64748B] hover:text-[#F3F5F7]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title={language === 'ar' ? 'إغلاق التلميح' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Floating Action Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={language === 'ar' ? 'تواصل مع أبو السعود عبر واتساب' : 'Chat with Abu Al-Saud on WhatsApp'}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#059669] to-[#10B981] text-white shadow-2xl shadow-[#10B981]/40 border-2 border-white/25 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#10B981]/40"
        >
          {/* Subtle Outer Radar Pulse */}
          <span className="absolute -inset-1 rounded-full bg-[#10B981] opacity-30 animate-ping pointer-events-none"></span>

          {/* Icon */}
          <MessageCircle className="w-7 h-7 fill-white/20 text-white relative z-10 transition-transform group-hover:rotate-12" />

          {/* Online badge */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#10B981] border-2 border-white dark:border-[#080B12] rounded-full flex items-center justify-center shadow-xs">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          </span>
        </a>

      </div>
    </aside>
  );
};
