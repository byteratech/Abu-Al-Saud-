import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSTestimonial } from '../../types';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MessageSquare, Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { language, dir, localize } = useLanguage();
  const [testimonials, setTestimonials] = useState<CMSTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial local/static load for testimonials
    let initialList: CMSTestimonial[] = [];
    try {
      const saved = localStorage.getItem('cms_local_testimonials');
      if (saved) {
        initialList = JSON.parse(saved);
      } else {
        initialList = [
          {
            id: 'test-1',
            clientName: 'Sarah Connor',
            companyName: 'TechCorp Security',
            content: {
              ar: 'أفضل استشاري أمني تعاملنا معه على الإطلاق. دقة في مواعيد التسليم ومهارات تقنية عالية.',
              en: 'Best security consultant we have ever worked with. Precise execution and unparalleled technical expertise.'
            },
            clientImage: '',
            published: true
          }
        ];
      }
    } catch (_) {}
    setTestimonials(initialList.filter(t => t.published));

    // 2. Fetch live testimonials from Firestore
    const fetchLiveTestimonials = async () => {
      try {
        const snap = await getDocs(collection(db, 'testimonials'));
        const list: CMSTestimonial[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.published) {
            list.push({ id: doc.id, ...data } as CMSTestimonial);
          }
        });
        if (list.length > 0) {
          setTestimonials(list);
          try {
            localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Failed to load published testimonials from Firestore:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveTestimonials();
  }, []);

  const titleText = language === 'ar' ? 'آراء العملاء' : 'Client Testimonials';
  const subtitleText = language === 'ar' ? 'ماذا يقول الشركاء والعملاء عن مستوى الخدمة والاحترافية' : 'What partners and clients say about the quality of service and professionalism';

  // If there are no published testimonials, we can show a placeholder or render nothing.
  // But since the user explicitly asked for this section, let's make sure it looks fantastic!
  if (testimonials.length === 0 && !loading) {
    return null;
  }

  return (
    <section id="testimonials-section" className="py-24 bg-[#080B12] border-t border-[#202735] relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#5B7CFA]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>{titleText}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5F7] tracking-tight">
            {language === 'ar' ? 'ثقة شركاء النجاح' : 'Trusted by Partners'}
          </h2>
          <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed">
            {subtitleText}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 hover:bg-[#111722] transition-all flex flex-col justify-between relative group shadow-lg"
            >
              {/* Quote Icon overlay */}
              <div className="absolute top-6 right-6 text-[#202735] group-hover:text-[#5B7CFA]/10 transition-colors pointer-events-none">
                <Quote className="w-10 h-10" />
              </div>

              <div className="space-y-6">
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-base text-[#E5E9F0] leading-relaxed italic text-start font-normal">
                  " {localize(item.content)} "
                </p>
              </div>

              {/* Client Info */}
              <div className="mt-8 pt-6 border-t border-[#202735] flex items-center gap-4 text-start">
                {item.clientImage ? (
                  <img
                    src={item.clientImage}
                    alt={item.clientName}
                    className="w-12 h-12 rounded-full object-cover border border-[#202735]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#151B26] border border-[#202735] flex items-center justify-center text-[#5B7CFA] font-bold text-lg select-none">
                    {item.clientName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-[#F3F5F7]">
                    {item.clientName}
                  </h4>
                  {item.companyName && (
                    <p className="text-xs text-[#9AA4B2] font-medium mt-0.5">
                      {item.companyName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
