import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LocalizedText } from '../types';
import { getTranslation, Translations } from '../locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: 'rtl' | 'ltr';
  t: Translations;
  localize: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('abualsaud_lang') as Language;
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';
  const t = getTranslation(language);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('abualsaud_lang', newLang);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const localize = (text: LocalizedText): string => {
    if (!text) return '';
    return text[language] || text.ar || text.en || '';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    
    if (language === 'ar') {
      document.title = 'أبو السعود — Mohamed Mohamed Abu Al-Saud | الموقع الشخصي ومختبر الأمن السيبراني';
    } else {
      document.title = 'Abu Al-Saud — Mohamed Mohamed Abu Al-Saud | Personal Space & Security Lab';
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        dir,
        t,
        localize,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
