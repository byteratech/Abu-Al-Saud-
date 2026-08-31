import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Link2, 
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Site settings state
  const [websiteName, setWebsiteName] = useState('Abu Al-Saud Portfolio');
  const [logo, setLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('bytera.ttech@gmail.com');
  
  // Socials
  const [github, setGithub] = useState('https://github.com');
  const [linkedin, setLinkedin] = useState('https://linkedin.com');
  const [youtube, setYoutube] = useState('https://youtube.com');
  const [instagram, setInstagram] = useState('https://instagram.com');
  const [x, setX] = useState('https://x.com');

  // SEO Defaults
  const [seoTitle, setSeoTitle] = useState('Abu Al-Saud - Cybersecurity & Security Research');
  const [seoDesc, setSeoDesc] = useState('Web Application Security, Network Traffic Analysis, and Linux Server Hardening.');
  const [seoKeywords, setSeoKeywords] = useState('Pentesting, Cybersecurity, CTF, Web Security, Linux Hardening');

  const [siteLanguage, setSiteLanguage] = useState('en');

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setWebsiteName(data.websiteName || 'Abu Al-Saud Portfolio');
        setLogo(data.logo || '');
        setContactEmail(data.contactEmail || 'bytera.ttech@gmail.com');
        
        if (data.socials) {
          setGithub(data.socials.github || '');
          setLinkedin(data.socials.linkedin || '');
          setYoutube(data.socials.youtube || '');
          setInstagram(data.socials.instagram || '');
          setX(data.socials.x || '');
        }

        if (data.seo) {
          setSeoTitle(data.seo.title || '');
          setSeoDesc(data.seo.description || '');
          setSeoKeywords(data.seo.keywords || '');
        }

        setSiteLanguage(data.language || 'en');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const settingsData: SiteSettings = {
      id: 'global',
      websiteName: websiteName.trim(),
      logo: logo.trim() || undefined,
      contactEmail: contactEmail.trim(),
      socials: {
        github: github.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        youtube: youtube.trim() || undefined,
        instagram: instagram.trim() || undefined,
        x: x.trim() || undefined
      },
      seo: {
        title: seoTitle.trim(),
        description: seoDesc.trim(),
        keywords: seoKeywords.trim() || undefined
      },
      language: siteLanguage
    };

    try {
      await setDoc(doc(db, 'settings', 'global'), settingsData, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      await fetchSettings();
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert(language === 'ar' ? 'فشل حفظ الإعدادات في قاعدة البيانات.' : 'Failed to save global configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5B7CFA]" />
          <span>{language === 'ar' ? 'الإعدادات العامة للموقع' : 'Global Settings Configuration'}</span>
        </h1>
        <p className="text-xs text-[#9AA4B2] mt-0.5">
          {language === 'ar' ? 'إعداد اسم الموقع وشعار البوابة وروابط التواصل ومحركات البحث.' : 'Configure default site properties, socials routing, and default SEO metadata.'}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">
            {language === 'ar' ? 'تم حفظ الإعدادات العامة للموقع بنجاح في Firestore!' : 'Global site settings successfully saved and synced live!'}
          </span>
        </div>
      )}

      {isLoading && mediaListLengthCheck() ? (
        <div className="bg-[#0D111A] border border-[#202735] rounded-2xl p-12 text-center text-xs text-[#9AA4B2]">
          {language === 'ar' ? 'جاري تحميل تفاصيل الإعدادات...' : 'Loading global configuration...'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General info */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-2.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#5B7CFA]" />
              <span>General Configurations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Website Display Name</label>
                <input
                  type="text"
                  required
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Website Contact Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] ps-9 pe-4 py-2.5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Website Logo / Icon URL</label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Default Dashboard Language</label>
                <select
                  value={siteLanguage}
                  onChange={(e) => setSiteLanguage(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="en">English (US)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-2.5 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#5B7CFA]" />
              <span>Social Media Profile Integrations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">GitHub Profile URL</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">YouTube Channel URL</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">X / Twitter Account URL</label>
                <input
                  type="url"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  placeholder="https://x.com/username"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEO Defaults */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-2.5 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#5B7CFA]" />
              <span>Search Engine Optimization (SEO) Defaults</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Meta Title Tag</label>
                <input
                  type="text"
                  required
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Meta Description Tag</label>
                <textarea
                  rows={2}
                  required
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Keywords List (Comma-separated)</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Save footer */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white flex items-center gap-1.5 shadow-md hover:shadow-[#5B7CFA]/15 cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

// Simple utility function to prevent lint issues inside loading condition
function mediaListLengthCheck(): boolean {
  return true;
}
