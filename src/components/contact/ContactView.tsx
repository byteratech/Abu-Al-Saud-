import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { personalProfile } from '../../data/profile';
import { sendContactMessageAndNotify } from '../../lib/emailService';
import { playNotificationSound } from '../../lib/notificationSound';
import { 
  Mail, 
  Send, 
  MapPin, 
  Clock, 
  Github, 
  Linkedin, 
  Youtube, 
  Instagram, 
  Twitter, 
  Check, 
  Copy, 
  AlertCircle,
  MessageSquare,
  Loader2,
  Bell,
  Phone
} from 'lucide-react';
import { TikTokIcon, WhatsAppIcon, FacebookIcon } from '../common/SocialIcons';

export const ContactView: React.FC = () => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status === 'error') setStatus('idle');
  };

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText(personalProfile.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPhone = () => {
    try {
      navigator.clipboard.writeText(personalProfile.phone || '+201033108223');
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage(t.contact.errorMessage);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage(language === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح.' : 'Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    
    try {
      const res = await sendContactMessageAndNotify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      if (res.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Play gentle audio confirmation
        playNotificationSound();
      } else {
        setStatus('error');
        setErrorMessage(language === 'ar' ? 'تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى.' : 'Failed to send message, please try again.');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage(language === 'ar' ? 'حدث خطأ غير متوقع أثناء إرسال الرسالة.' : 'An unexpected error occurred while sending your message.');
    }
  };

  return (
    <div id="contact-page" className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 text-start">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <Mail className="w-4 h-4" />
          <span>{t.contact.title}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'تواصل معي' : 'Get in Touch'}
        </h1>
        <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed max-w-2xl">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-start">
        
        {/* Left Column: Direct Info & Social Platforms */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-5">
            <h2 className="text-base font-bold text-[#F3F5F7]">
              {language === 'ar' ? 'معلومات التواصل المباشر' : 'Direct Contact Info'}
            </h2>

            <div className="space-y-3 text-xs">
              
              {/* Phone & WhatsApp item with direct chat & copy */}
              <div className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-[#64748B] block">
                      {language === 'ar' ? 'الهاتف وواتساب' : 'Phone & WhatsApp'}
                    </span>
                    <a 
                      href="https://wa.me/201033108223" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      dir="ltr"
                      style={{ unicodeBidi: 'isolate' }}
                      className="text-xs font-mono font-bold text-[#F3F5F7] hover:text-[#10B981] transition-colors truncate block text-start tracking-wider"
                    >
                      +20 103 310 8223
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href="https://wa.me/201033108223"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] transition-colors"
                    title={language === 'ar' ? 'محادثة واتساب مباشرة' : 'Direct WhatsApp Chat'}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <button
                    id="copy-phone-btn"
                    onClick={handleCopyPhone}
                    className="p-1.5 rounded-lg bg-[#151B26] hover:bg-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors"
                    title={language === 'ar' ? 'نسخ رقم الهاتف' : 'Copy Phone'}
                  >
                    {phoneCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email item with copy button */}
              <div className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#5B7CFA]/15 text-[#5B7CFA] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-[#64748B] block">Email</span>
                    <a 
                      href={`mailto:${personalProfile.email}`} 
                      className="text-xs font-mono text-[#F3F5F7] hover:text-[#5B7CFA] transition-colors truncate block"
                    >
                      {personalProfile.email}
                    </a>
                  </div>
                </div>

                <button
                  id="copy-email-btn"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg bg-[#151B26] hover:bg-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors shrink-0"
                  title="Copy email"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Location & Timezone item */}
              <div className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#5B7CFA] shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] block">{language === 'ar' ? 'الموقع الجغرافي' : 'Location'}</span>
                  <span className="text-xs text-[#F3F5F7] font-medium">{personalProfile.location[language]}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#10B981] shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] block">{language === 'ar' ? 'المنطقة الزمنية' : 'Timezone'}</span>
                  <span className="text-xs font-mono text-[#F3F5F7]">{personalProfile.timezone}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Social Platforms Links */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7]">
              {t.contact.socialsTitle}
            </h3>

            <div className="flex flex-wrap gap-2">
              {personalProfile.socialLinks.github && (
                <a
                  href={personalProfile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Github className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>GitHub</span>
                </a>
              )}
              {personalProfile.socialLinks.linkedin && (
                <a
                  href={personalProfile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {personalProfile.socialLinks.facebook && (
                <a
                  href={personalProfile.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <FacebookIcon className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>Facebook</span>
                </a>
              )}
              {personalProfile.socialLinks.tiktok && (
                <a
                  href={personalProfile.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>TikTok</span>
                </a>
              )}
              {personalProfile.socialLinks.youtube && (
                <a
                  href={personalProfile.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>YouTube</span>
                </a>
              )}
              {personalProfile.socialLinks.instagram && (
                <a
                  href={personalProfile.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>Instagram</span>
                </a>
              )}
              {personalProfile.socialLinks.x && (
                <a
                  href={personalProfile.socialLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-mono text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                >
                  <Twitter className="w-3.5 h-3.5 text-[#5B7CFA]" />
                  <span>X / Twitter</span>
                </a>
              )}

            </div>
          </div>

        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <form 
            id="contact-form"
            onSubmit={handleSubmit}
            className="p-7 sm:p-8 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-5"
          >
            {status === 'success' ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#F3F5F7]">
                  {t.contact.successTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#9AA4B2] max-w-md mx-auto">
                  {t.contact.successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-2 text-xs font-semibold text-[#5B7CFA] hover:underline"
                >
                  {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                </button>
              </div>
            ) : (
              <>
                {status === 'error' && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-xs font-medium text-[#F3F5F7] block">
                      {t.contact.nameLabel} <span className="text-[#5B7CFA]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t.contact.namePlaceholder}
                      className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] placeholder-[#64748B] px-3.5 py-2.5 rounded-xl focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-medium text-[#F3F5F7] block">
                      {t.contact.emailLabel} <span className="text-[#5B7CFA]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t.contact.emailPlaceholder}
                      className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] placeholder-[#64748B] px-3.5 py-2.5 rounded-xl focus:outline-none transition-colors"
                    />
                  </div>

                </div>

                {/* Subject field */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="text-xs font-medium text-[#F3F5F7] block">
                    {t.contact.subjectLabel}
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t.contact.subjectPlaceholder}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] placeholder-[#64748B] px-3.5 py-2.5 rounded-xl focus:outline-none transition-colors"
                  />
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="text-xs font-medium text-[#F3F5F7] block">
                    {t.contact.messageLabel} <span className="text-[#5B7CFA]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] placeholder-[#64748B] p-3.5 rounded-xl focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3 px-6 rounded-xl bg-[#5B7CFA] hover:bg-[#4B6EF5] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-[#5B7CFA]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <span>{t.contact.sendingButton}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.contact.sendButton}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>

      </div>

    </div>
  );
};
