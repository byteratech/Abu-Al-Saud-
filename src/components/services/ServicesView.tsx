import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSService } from '../../types';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Shield, 
  Terminal, 
  Cpu, 
  Database, 
  Server, 
  Key, 
  Globe, 
  Search, 
  Lock, 
  Network,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Shield,
  Terminal,
  Cpu,
  Database,
  Server,
  Key,
  Globe,
  Search,
  Lock,
  Network
};

export const ServicesView: React.FC = () => {
  const { language, dir, localize } = useLanguage();
  const [services, setServices] = useState<CMSService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load fallback static/local services
    let initialList: CMSService[] = [];
    try {
      const saved = localStorage.getItem('cms_local_services');
      if (saved) {
        initialList = JSON.parse(saved);
      } else {
        initialList = [
          {
            id: 'srv-1',
            title: { ar: 'اختبار الاختراق والتدقيق الأمني', en: 'Penetration Testing & Security Auditing' },
            description: { ar: 'تقييم شامل للثغرات في تطبيقات الويب والبنية التحتية لحماية الأصول الرقمية.', en: 'Comprehensive web-app & network penetration testing to protect systems.' },
            icon: 'Shield',
            published: true,
            order: 1
          },
          {
            id: 'srv-2',
            title: { ar: 'مراجعة أمان الكود المصدري', en: 'Secure Source Code Review' },
            description: { ar: 'تحليل شفرة المصدر للتطبيقات واكتشاف الثغرات الأمنية قبل النشر للإنتاج.', en: 'Static and dynamic application security testing to audit backend repositories.' },
            icon: 'Terminal',
            published: true,
            order: 2
          },
          {
            id: 'srv-3',
            title: { ar: 'تطوير المواقع الآمنة والحديثة', en: 'Secure Web Development' },
            description: { ar: 'بناء مواقع وتطبيقات تفاعلية عالية الأداء مع مراعاة أعلى معايير أمان الويب.', en: 'Crafting high-performance, interactive apps aligned with top security standards.' },
            icon: 'Cpu',
            published: true,
            order: 3
          }
        ];
      }
    } catch (_) {}
    setServices(initialList.filter(s => s.published));

    // 2. Load live services from Firestore
    const fetchServicesLive = async () => {
      try {
        const snap = await getDocs(collection(db, 'services'));
        const list: CMSService[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.published) {
            list.push({ id: doc.id, ...data } as CMSService);
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          setServices(list);
          try {
            localStorage.setItem('cms_local_services', JSON.stringify(list));
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Failed to load services in public view:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesLive();
  }, []);

  const pageTitle = language === 'ar' ? 'الخدمات التقنية والأمنية' : 'Technical & Security Services';
  const pageSubtitle = language === 'ar' 
    ? 'خدمات متكاملة تبدأ من تطوير وبرمجة المواقع، وتمر بإدارة النظم وتكنولوجيا المعلومات، وصولاً إلى التدقيق والأمن السيبراني لحماية أعمالك الرقمية.'
    : 'Comprehensive solutions starting from full-stack web development, through IT systems administration, up to full-scale cybersecurity auditing.';

  const arrowIcon = dir === 'rtl' ? <ArrowLeft className="w-4 h-4 ml-1" /> : <ArrowRight className="w-4 h-4 mr-1" />;

  return (
    <div id="services-page" className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Title block */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{language === 'ar' ? 'كيف يمكنني مساعدتك' : 'How I Can Help You'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed">
          {pageSubtitle}
        </p>
      </div>

      {/* Services grid */}
      {loading && services.length === 0 ? (
        <div className="text-center py-20 text-[#9AA4B2]">
          <p>{language === 'ar' ? 'جاري تحميل الخدمات...' : 'Loading services...'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv) => {
            const IconComponent = ICON_MAP[srv.icon] || Shield;
            return (
              <div 
                key={srv.id}
                className="p-8 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 hover:bg-[#111722] transition-all flex flex-col justify-between text-start relative group shadow-md"
              >
                <div className="space-y-6">
                  {/* Service Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#151B26] border border-[#202735] text-[#5B7CFA] group-hover:bg-[#5B7CFA]/10 group-hover:border-[#5B7CFA]/30 transition-all flex items-center justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Service Details */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors leading-snug">
                      {localize(srv.title)}
                    </h3>
                    <p className="text-sm text-[#9AA4B2] leading-relaxed">
                      {localize(srv.description)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#202735] flex items-center justify-between text-xs font-semibold text-[#5B7CFA] group-hover:text-white transition-colors cursor-pointer">
                  <span>{language === 'ar' ? 'طلب الخدمة أو استفسار' : 'Inquire or Order Service'}</span>
                  {arrowIcon}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Prompt */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D111A] to-[#111722] border border-[#202735] text-center space-y-6 max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5B7CFA]/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5F7]">
          {language === 'ar' ? 'لديك مشروع أو فكرة ترغب بمناقشتها؟' : 'Have a project or idea to discuss?'}
        </h3>
        <p className="text-sm sm:text-base text-[#9AA4B2] max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'سواء كنت بحاجة إلى تدقيق أمني لموقعك أو تطبيقك، أو تود بناء منصة رقمية آمنة، فلا تتردد في حجز استشارة تقنية.' 
            : 'Whether you need a full web security audit or want to build a fully secure, modern web application, I am here to help.'}
        </p>
        <div className="pt-2">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const contactSection = document.getElementById('contact-view');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                // If on another view, we should toggle contact view
                const btn = document.getElementById('nav-link-contact') || document.getElementById('mobile-nav-contact');
                if (btn) btn.click();
              }
            }}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#5B7CFA] hover:bg-[#4866D6] text-white font-bold text-sm transition-all shadow-md shadow-[#5B7CFA]/20 cursor-pointer"
          >
            {language === 'ar' ? 'ابدأ المحادثة الآن' : 'Start Discussion Now'}
          </a>
        </div>
      </div>
    </div>
  );
};
