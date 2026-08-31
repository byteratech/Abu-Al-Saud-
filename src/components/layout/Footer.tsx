import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { personalProfile } from '../../data/profile';
import { ActiveView, SiteSettings } from '../../types';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  Github, 
  Linkedin, 
  Youtube, 
  Instagram, 
  Twitter, 
  Mail, 
  MapPin, 
  Shield, 
  ArrowUp,
  Globe,
  Send,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        if (data.logo && data.logo.trim() !== '') {
          setCustomLogo(data.logo);
        } else {
          setCustomLogo(null);
        }
      }
    }, (err) => {
      console.warn('Footer settings listener notice:', err);
    });

    return () => unsubscribe();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(true);
      return;
    }
    setError(false);
    setSubscribed(true);
  };

  const navLinks: { id: ActiveView['type']; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'services', label: t.nav.services },
    { id: 'projects', label: t.nav.projects },
    { id: 'content', label: t.nav.content },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <footer id="main-footer" className="bg-[#0D111A] border-t border-[#202735] text-[#9AA4B2] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* Newsletter Subscription Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#111722] to-[#0A0E17] border border-[#202735] relative overflow-hidden text-start shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#5B7CFA]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>{t.newsletter.title}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight">
                {language === 'ar' ? 'ابق على اطلاع دائم بكل جديد' : 'Never Miss an Article or Update'}
              </h3>
              <p className="text-sm text-[#9AA4B2] leading-relaxed">
                {t.newsletter.subtitle}
              </p>
            </div>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="text-xs sm:text-sm font-medium">
                  <p className="font-bold">{t.newsletter.successTitle}</p>
                  <p className="text-[#9AA4B2]">{t.newsletter.successMessage}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#64748B] absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(false);
                    }}
                    placeholder={t.newsletter.placeholder}
                    className={`w-full bg-[#0D111A] border text-xs sm:text-sm text-[#F3F5F7] placeholder-[#64748B] ps-10 pe-4 py-3 rounded-xl focus:outline-none transition-all ${
                      error ? 'border-red-500' : 'border-[#202735] focus:border-[#5B7CFA]'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  id="newsletter-subscribe-btn"
                  className="px-6 py-3 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
                >
                  <span>{t.newsletter.subscribeButton}</span>
                  <Send className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </form>
            )}
            {error && !subscribed && (
              <p className="text-xs text-red-400 font-mono">
                {language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email address.'}
              </p>
            )}
          </div>
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#202735]">
          
          {/* Brand Info & Location */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111722] border border-[#202735] flex items-center justify-center text-[#5B7CFA] overflow-hidden p-1">
                {customLogo ? (
                  <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </div>
              <span className="font-bold text-lg text-[#F3F5F7]">
                {t.brand.name}
              </span>
            </div>
            
            <p className="text-sm text-[#9AA4B2] leading-relaxed max-w-sm">
              {t.brand.tagline}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#9AA4B2] pt-2">
              <MapPin className="w-4 h-4 text-[#5B7CFA]" />
              <span>{personalProfile.location[language]}</span>
              <span className="text-[#64748B]">•</span>
              <span className="font-mono text-[#64748B]">{personalProfile.timezone}</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F5F7]">
              {t.common.quickNav}
            </h3>
            <ul className="space-y-2 text-sm flex flex-col items-start">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    id={`footer-nav-${link.id}`}
                    onClick={() => {
                      setActiveView({ type: link.id });
                      scrollToTop();
                    }}
                    className="hover:text-[#5B7CFA] transition-colors py-1 text-start"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials & Connect */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F5F7]">
              {t.contact.socialsTitle}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {personalProfile.socialLinks.github && (
                <a
                  href={personalProfile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="p-2.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {personalProfile.socialLinks.linkedin && (
                <a
                  href={personalProfile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="p-2.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {personalProfile.socialLinks.youtube && (
                <a
                  href={personalProfile.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  className="p-2.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {personalProfile.socialLinks.instagram && (
                <a
                  href={personalProfile.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="p-2.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {personalProfile.socialLinks.x && (
                <a
                  href={personalProfile.socialLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="p-2.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              <a
                href={`mailto:${personalProfile.email}`}
                aria-label="Send Email"
                className="p-2.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#64748B]">
          <div className="space-y-0.5 text-center sm:text-start">
            <p className="text-[11px] text-[#9AA4B2]">{t.brand.footerNote}</p>
            <p className="text-[10px]">
              {language === 'ar' 
                ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} • ابوالسعود`
                : `All Rights Reserved © ${new Date().getFullYear()} • Abu Al-Saud`}
            </p>
          </div>

          <button
            id="scroll-to-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[11px] text-[#9AA4B2] hover:text-[#F3F5F7] px-2.5 py-1 rounded-md bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
          >
            <span>{language === 'ar' ? 'للأعلى' : 'Top'}</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
