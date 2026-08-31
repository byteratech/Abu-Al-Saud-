import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveView } from '../../types';
import { 
  Menu, 
  X, 
  Globe, 
  Terminal,
  Shield,
  Layers,
  FileText,
  Briefcase,
  User,
  Mail,
  LayoutDashboard,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: ActiveView['type']; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Layers },
    { id: 'projects', label: t.nav.projects, icon: Briefcase },
    { id: 'services', label: t.nav.services, icon: Cpu },
    { id: 'about', label: t.nav.about, icon: User },
    { id: 'content', label: t.nav.content, icon: FileText },
    { id: 'contact', label: t.nav.contact, icon: Mail },
  ];

  const handleNavClick = (type: ActiveView['type']) => {
    setActiveView({ type });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header 
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#080B12]/85 backdrop-blur-md border-b border-[#202735] py-3 shadow-lg shadow-black/20' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Wordmark / Monogram */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7CFA] rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-md bg-[#111722] border border-[#202735] flex items-center justify-center text-[#5B7CFA] group-hover:border-[#5B7CFA]/50 group-hover:bg-[#151B26] transition-all overflow-hidden">
              <img src="https://res.cloudinary.com/f6t2sqiv/image/upload/v1787853834/Artboard_1_9x.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#F3F5F7] group-hover:text-white transition-colors">
                {t.brand.name}
              </span>
              <span className={`text-[9px] sm:text-[10px] text-[#9AA4B2] ${language === 'ar' ? '' : 'tracking-wider uppercase font-mono'}`}>
                {language === 'ar' ? 'تطوير ويب · أمن سيبراني · IT' : 'Web Dev · Cybersecurity · IT'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1 bg-[#111722]/80 border border-[#202735] px-2 py-1.5 rounded-full backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = activeView.type === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5B7CFA] text-white shadow-sm shadow-[#5B7CFA]/30 font-semibold'
                      : 'text-[#9AA4B2] hover:text-[#F3F5F7] hover:bg-[#151B26]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Language Switcher & Theme Toggle */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? (language === 'ar' ? 'تفعيل الوضع المضيء' : 'Switch to Light Mode') : (language === 'ar' ? 'تفعيل الوضع المظلم' : 'Switch to Dark Mode')}
              className="flex items-center justify-center p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#F3F5F7] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              id="language-toggle-btn"
              onClick={toggleLanguage}
              title={t.nav.switchLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#F3F5F7] hover:border-[#5B7CFA]/40 text-xs font-medium transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#5B7CFA]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                {language === 'ar' ? 'EN' : 'العربية'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7]"
              aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className="md:hidden fixed inset-x-0 top-[65px] bg-[#080B12]/98 border-b border-[#202735] px-4 pt-4 pb-6 backdrop-blur-xl shadow-2xl transition-all"
        >
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeView.type === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-start ${
                    isActive
                      ? 'bg-[#5B7CFA] text-white font-semibold shadow-md shadow-[#5B7CFA]/20'
                      : 'text-[#9AA4B2] hover:text-[#F3F5F7] hover:bg-[#111722]'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#202735] flex items-center justify-center">
            <button
              id="mobile-lang-btn"
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-2 text-xs text-[#F3F5F7] px-3 py-2.5 rounded-lg bg-[#111722] border border-[#202735]"
            >
              <Globe className="w-3.5 h-3.5 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
