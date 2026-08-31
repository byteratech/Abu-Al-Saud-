import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lock,
  Key,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SiteSettings } from '../../types';
import { getAdminSecurityConfig, updateAdminSecurityConfig, DEFAULT_RECOVERY_PHONE } from '../../lib/adminSecurity';
import { 
  isSoundNotificationEnabled, 
  setSoundNotificationEnabled, 
  playNotificationSound,
  requestNotificationPermission,
  isDesktopNotificationGranted
} from '../../lib/notificationSound';

export const AdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sound & Desktop Notification state
  const [soundEnabled, setSoundEnabled] = useState(isSoundNotificationEnabled);
  const [desktopEnabled, setDesktopEnabled] = useState(isDesktopNotificationGranted);

  // Site settings state
  const [websiteName, setWebsiteName] = useState('Abu Al-Saud Portfolio');
  const [logo, setLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('abualss3ud@gmail.com');
  
  // Admin Security State
  const [adminEmail, setAdminEmail] = useState('abualss3ud@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('201033108223');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Socials
  const [github, setGithub] = useState('https://github.com');
  const [linkedin, setLinkedin] = useState('https://linkedin.com');
  const [facebook, setFacebook] = useState('https://facebook.com');
  const [tiktok, setTiktok] = useState('https://www.tiktok.com/@abualss3ud');
  const [youtube, setYoutube] = useState('https://youtube.com');
  const [instagram, setInstagram] = useState('https://instagram.com');
  const [x, setX] = useState('https://x.com');
  const [whatsapp, setWhatsapp] = useState('https://wa.me/201033108223');

  // SEO Defaults
  const [seoTitle, setSeoTitle] = useState('Abu Al-Saud - Web Developer & Cybersecurity Specialist');
  const [seoDesc, setSeoDesc] = useState('Full-Stack Web Development, Cybersecurity, Penetration Testing & IT Systems.');
  const [seoKeywords, setSeoKeywords] = useState('Pentesting, Cybersecurity, Web Development, Full-Stack, Linux, Networking');

  const [siteLanguage, setSiteLanguage] = useState('en');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Global site settings
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setWebsiteName(data.websiteName || 'Abu Al-Saud Portfolio');
        setLogo(data.logo || '');
        setContactEmail(data.contactEmail || 'abualss3ud@gmail.com');
        
        if (data.socials) {
          setGithub(data.socials.github || '');
          setLinkedin(data.socials.linkedin || '');
          setFacebook(data.socials.facebook || 'https://facebook.com');
          setTiktok(data.socials.tiktok || 'https://www.tiktok.com/@abualss3ud');
          setYoutube(data.socials.youtube || '');
          setInstagram(data.socials.instagram || '');
          setX(data.socials.x || '');
          setWhatsapp(data.socials.whatsapp || 'https://wa.me/201033108223');
        }

        if (data.seo) {
          setSeoTitle(data.seo.title || 'Abu Al-Saud - Web Developer & Cybersecurity Specialist');
          setSeoDesc(data.seo.description || 'Full-Stack Web Development, Cybersecurity, Penetration Testing & IT Systems.');
          setSeoKeywords(data.seo.keywords || 'Pentesting, Cybersecurity, Web Development, Full-Stack, Linux, Networking');
        }

        setSiteLanguage(data.language || 'en');
      }

      // 2. Admin Security Config
      const sec = await getAdminSecurityConfig();
      setAdminEmail(sec.adminEmail || 'abualss3ud@gmail.com');
      setRecoveryPhone(sec.recoveryPhone || DEFAULT_RECOVERY_PHONE);

    } catch (err) {
      console.error('Failed to load settings:', err);
      // Non-blocking error for initial load
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);


  // Helper to optimize / resize image if needed before saving
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)' : 'Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // If it's an SVG, keep raw data URL
      if (file.type === 'image/svg+xml' || file.size < 80 * 1024) {
        setLogo(result);
        setIsUploading(false);
        return;
      }

      // Optimize image through HTML5 Canvas
      const img = new Image();
      img.onload = () => {
        const maxDimension = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/png', 0.9);
          setLogo(optimizedDataUrl);
        } else {
          setLogo(result);
        }
        setIsUploading(false);
      };

      img.onerror = () => {
        setLogo(result);
        setIsUploading(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      alert(language === 'ar' ? 'فشل قراءة ملف الصورة' : 'Failed to read image file');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (!adminEmail.trim()) {
      setSecurityError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني للوحة التحكم' : 'Please enter admin email');
      return;
    }

    if (adminPassword && adminPassword !== confirmPassword) {
      setSecurityError(language === 'ar' ? 'كلمة المرور وتأكيد كلمة المرور غير متطابقين!' : 'Passwords do not match!');
      return;
    }

    if (adminPassword && adminPassword.length < 6) {
      setSecurityError(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be at least 6 characters');
      return;
    }

    try {
      setIsSavingSecurity(true);
      await updateAdminSecurityConfig(adminEmail, adminPassword || undefined, recoveryPhone);
      setSecuritySuccess(true);
      setAdminPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving security:', err);
      setSecurityError(language === 'ar' ? 'حدث خطأ أثناء حفظ بيانات الأمان' : 'Failed to update security credentials');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    // Prepare clean data object WITHOUT undefined values to prevent Firestore validation errors
    const sanitizedSettings = {
      id: 'global',
      websiteName: websiteName.trim() || 'Abu Al-Saud Portfolio',
      logo: logo.trim() || '',
      contactEmail: contactEmail.trim() || 'abualss3ud@gmail.com',
      socials: {
        github: github.trim() || '',
        linkedin: linkedin.trim() || '',
        facebook: facebook.trim() || '',
        tiktok: tiktok.trim() || '',
        youtube: youtube.trim() || '',
        instagram: instagram.trim() || '',
        x: x.trim() || '',
        whatsapp: whatsapp.trim() || ''
      },
      seo: {
        title: seoTitle.trim() || 'Abu Al-Saud - Web Developer & Cybersecurity Specialist',
        description: seoDesc.trim() || 'Full-Stack Web Development, Cybersecurity, Penetration Testing & IT Systems.',
        keywords: seoKeywords.trim() || 'Pentesting, Cybersecurity, Web Development, Full-Stack, Linux, Networking'
      },
      language: siteLanguage || 'en',
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'settings', 'global'), sanitizedSettings, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      const errorMsg = err?.message || (language === 'ar' ? 'فشل حفظ الإعدادات في قاعدة البيانات.' : 'Failed to save global configuration.');
      setErrorMessage(errorMsg);
    } finally {
      setIsSaving(false);
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
          {language === 'ar' ? 'إعداد اسم الموقع، الشعار الرسمي، روابط التواصل، ومحركات البحث.' : 'Configure default site properties, logo branding, social media links, and default SEO metadata.'}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">
            {language === 'ar' ? 'تم حفظ الإعدادات العامة للموقع والشعار بنجاح في قاعدة البيانات!' : 'Global site settings and logo successfully saved to Firestore!'}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-3 text-[#EF4444] animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">
            {errorMessage}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-[#0D111A] border border-[#202735] rounded-2xl p-12 text-center text-xs text-[#9AA4B2] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#5B7CFA]" />
          <span>{language === 'ar' ? 'جاري تحميل تفاصيل الإعدادات...' : 'Loading global configuration...'}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General info */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-6">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-2.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'البيانات الأساسية والشعار' : 'General Brand & Configurations'}</span>
            </h3>

            {/* Logo / Icon Upload Section */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'شعار الموقع / أيقونة الهوية (Website Logo / Icon)' : 'Website Logo / Icon'}
              </label>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* Upload & Drop Zone */}
                <div className="lg:col-span-8">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      isDragOver
                        ? 'border-[#5B7CFA] bg-[#5B7CFA]/10'
                        : 'border-[#202735] hover:border-[#5B7CFA]/60 bg-[#111722]/50 hover:bg-[#111722]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/x-icon"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-xl bg-[#1F293D] border border-[#374151] flex items-center justify-center text-[#5B7CFA]">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#F3F5F7]">
                        {isUploading
                          ? (language === 'ar' ? 'جاري معالجة الصورة...' : 'Processing image...')
                          : (language === 'ar' ? 'اضغط لرفع صورة الشعار أو اسحب الملف هنا' : 'Click to browse or drag & drop logo file here')}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {language === 'ar' ? 'صيغ مدعومة: PNG, SVG, JPG, WebP, ICO (الحد الأقصى الموصى به: 2MB)' : 'Supported: PNG, SVG, JPG, WebP, ICO (Max recommended: 2MB)'}
                      </p>
                    </div>
                  </div>

                  {/* Manual URL Input Option */}
                  <div className="mt-3 space-y-1">
                    <label className="text-[10px] font-medium text-[#64748B]">
                      {language === 'ar' ? 'أو أدخل رابط الصورة المباشر:' : 'Or enter direct image URL:'}
                    </label>
                    <input
                      type="text"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Logo Live Preview */}
                <div className="lg:col-span-4 p-4 rounded-2xl bg-[#111722] border border-[#202735] flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    {language === 'ar' ? 'معاينة الشعار المباشرة' : 'Live Logo Preview'}
                  </span>

                  {logo ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-xl bg-[#0D111A] border border-[#202735] p-2 flex items-center justify-center overflow-hidden shadow-inner">
                        <img
                          src={logo}
                          alt="Logo Preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setLogo('')}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#EF4444] hover:text-[#EF4444]/80 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إزالة الشعار' : 'Remove Logo'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#64748B] py-3">
                      <ImageIcon className="w-10 h-10 stroke-1 mb-1 opacity-60" />
                      <span className="text-[11px]">
                        {language === 'ar' ? 'لم يتم تعيين شعار مخصص بعد' : 'No custom logo uploaded'}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#202735]">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'اسم الموقع الظاهر' : 'Website Display Name'}
                </label>
                <input
                  type="text"
                  required
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'بريد التواصل الرئيسي' : 'Website Contact Email'}
                </label>
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
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'اللغة الافتراضية' : 'Default Dashboard Language'}
                </label>
                <select
                  value={siteLanguage}
                  onChange={(e) => setSiteLanguage(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-2.5 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'روابط شبكات التواصل الاجتماعي' : 'Social Media Profile Integrations'}</span>
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
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">Facebook Profile URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/username"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">TikTok Profile URL</label>
                <input
                  type="url"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="https://www.tiktok.com/@username"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">WhatsApp Chat Link / Phone</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="https://wa.me/201033108223"
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
              <span>{language === 'ar' ? 'إعدادات محركات البحث (SEO)' : 'Search Engine Optimization (SEO) Defaults'}</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'عنوان الصفحة لمحركات البحث (Meta Title)' : 'Meta Title Tag'}
                </label>
                <input
                  type="text"
                  required
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'وصف الموقع لمحركات البحث (Meta Description)' : 'Meta Description Tag'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'الكلمات المفتاحية (مفصولة بفواصل)' : 'Keywords List (Comma-separated)'}
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="Pentesting, Cybersecurity, Web Development, Full-Stack"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sound Alerts & Email Notifications Settings */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#10B981]/30 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#202735] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F3F5F7]">
                    {language === 'ar' ? 'إشعارات الرسائل والتنبيهات الصوتية' : 'Message Alerts, Sound Chimes & Email Notifications'}
                  </h3>
                  <p className="text-[11px] text-[#9AA4B2] mt-0.5">
                    {language === 'ar' 
                      ? 'تشغيل رنين تنبيهي فوري عند إرسال أي مستخدم رسالة، وإعادة توجيهها للبريد الإلكتروني.' 
                      : 'Real-time audio chime upon visitor inquiry arrival with instant email dispatch.'}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#10B981]/15 text-[#10B981] font-mono text-[10px] font-bold border border-[#10B981]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Live Audio Alert</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sound Toggle Control */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F5F7]">
                    {language === 'ar' ? 'التنبيه الصوتي عند وصول رسالة جديدة' : 'Audio Chime on Inbound Messages'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      setSoundNotificationEnabled(next);
                      if (next) playNotificationSound();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      soundEnabled 
                        ? 'bg-[#10B981] text-white shadow-md' 
                        : 'bg-[#202735] text-[#9AA4B2] hover:text-white'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{soundEnabled ? (language === 'ar' ? 'مفعّل' : 'Enabled') : (language === 'ar' ? 'معطّل' : 'Disabled')}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#9AA4B2]">
                  {language === 'ar' 
                    ? 'يتم تشغيل نغمة صوتية تكنولوجية واضحة ومميزة فور إرسال أي زائر لرسالة جديدة عبر الموقع.' 
                    : 'Plays a synthesized chime whenever a visitor submits an inquiry on the public site.'}
                </p>
                <button
                  type="button"
                  onClick={() => playNotificationSound()}
                  className="px-3 py-1.5 rounded-lg bg-[#151B26] hover:bg-[#202735] border border-[#202735] text-[#5B7CFA] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تجربة رنين التنبيه الصوتي الآن' : 'Test Audio Chime Now'}</span>
                </button>
              </div>

              {/* Email Notification Forwarding Info */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F5F7]">
                    {language === 'ar' ? 'تحويل الرسائل إلى الإيميل المباشر' : 'Forward Inquiries to Email'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold font-mono">
                    ACTIVE
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#64748B] block">{language === 'ar' ? 'الإيميل المستلم للرسائل:' : 'Recipient Admin Inbox:'}</span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#080B12] border border-[#202735] text-[#5B7CFA] font-mono text-xs font-bold">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{contactEmail || 'abualss3ud@gmail.com'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#64748B]">
                  {language === 'ar' 
                    ? 'يتم إرسال نسخة من كل رسالة مباشرة إلى هذا الإيميل بالإضافة لحفظها في لوحة التحكم.' 
                    : 'Every incoming message is dispatched to this email address and archived in Firestore.'}
                </p>
              </div>
            </div>

            {/* Desktop Notification Request */}
            <div className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#5B7CFA] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#F3F5F7] block">
                    {language === 'ar' ? 'إشعارات المتصفح المنبثقة (Desktop Notifications)' : 'Desktop Browser Push Notifications'}
                  </span>
                  <span className="text-[10px] text-[#9AA4B2]">
                    {language === 'ar' 
                      ? 'تنبيهك حتى لو كانت لوحة التحكم في الخلفية أو متصفحك مصغراً' 
                      : 'Receive alerts even when the tab is in background or minimized'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const perm = await requestNotificationPermission();
                  setDesktopEnabled(perm === 'granted');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  desktopEnabled 
                    ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]' 
                    : 'bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white border-transparent'
                }`}
              >
                {desktopEnabled 
                  ? (language === 'ar' ? 'مفعل في المتصفح ✓' : 'Granted in Browser ✓') 
                  : (language === 'ar' ? 'طلب الإذن والتفعيل' : 'Request Permission')}
              </button>
            </div>
          </div>

          {/* Admin Credentials & Recovery Phone Card */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#5B7CFA]/30 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#202735] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#5B7CFA]" />
                <div>
                  <h3 className="text-sm font-bold text-[#F3F5F7]">
                    {language === 'ar' ? 'حساب الأدمن والأمان واسترجاع كلمة المرور' : 'Admin Security, Credentials & Password Recovery'}
                  </h3>
                  <p className="text-[11px] text-[#9AA4B2] mt-0.5">
                    {language === 'ar' 
                      ? 'تغيير بريد وباسورد لوحة الإدارة وربط رقم الهاتف الأساسي المعتمد لاسترجاع الحساب.' 
                      : 'Update login email, master password, and verified recovery phone.'}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#5B7CFA]/15 text-[#5B7CFA] font-mono text-[10px] font-bold border border-[#5B7CFA]/30">
                MFA / Phone Recovery Active
              </span>
            </div>

            {securitySuccess && (
              <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{language === 'ar' ? 'تم تحديث بيانات حساب الأدمن ورقم الاسترجاع بنجاح!' : 'Admin credentials and recovery phone updated successfully!'}</span>
              </div>
            )}

            {securityError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>{language === 'ar' ? 'بريد تسجيل الدخول للوحة التحكم' : 'Admin Login Email'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{language === 'ar' ? 'رقم الهاتف المعتمد لاسترجاع كلمة المرور (OTP)' : 'Authorized Recovery Phone'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  placeholder="201033108223"
                  className="w-full bg-[#111722] border border-[#10B981]/40 focus:border-[#10B981] text-xs text-[#10B981] font-bold px-4 py-2.5 rounded-xl focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-[#5B7CFA] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">
                  {language === 'ar' 
                    ? `رقم الاسترجاع المربوط حالياً: +${recoveryPhone}`
                    : `Active Recovery Phone: +${recoveryPhone}`}
                </p>
                <p className="text-[11px] text-blue-200/80 mt-0.5">
                  {language === 'ar' 
                    ? 'في حال نسيان كلمة المرور في شاشة الدخول، يتم إرسال رسالة تحقق برمز سري مشفر إلى هذا الرقم عبر واتساب لتمكينك من تعيين كلمة مرور جديدة فوراً وبأمان تام.' 
                    : 'If you ever forget your password, an encrypted OTP code will be sent to this WhatsApp phone number for instant identity verification and password reset.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#202735] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'كلمة المرور الجديدة (اتركها فارغة إن لم ترغب في التغيير)' : 'New Admin Password (leave blank to keep current)'}</span>
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveSecurity}
                disabled={isSavingSecurity}
                className="px-5 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSavingSecurity ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'حفظ وتحديث بيانات الأمان وكلمة المرور' : 'Save Security & Password')}</span>
              </button>
            </div>
          </div>


          {/* Form Save footer */}
          <div className="flex justify-end gap-3 items-center">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={isSaving}
              className="px-4 py-3 rounded-xl text-xs font-semibold bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735] flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إعادة تحميل' : 'Reload'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white flex items-center gap-1.5 shadow-md hover:shadow-[#5B7CFA]/15 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'حفظ إعدادات الموقع والشعار' : 'Save System Settings'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

