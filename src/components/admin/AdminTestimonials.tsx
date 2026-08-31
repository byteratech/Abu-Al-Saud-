import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  UserCircle2, 
  CheckCircle2, 
  MessageSquareQuote
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSTestimonial } from '../../types';

export const AdminTestimonials: React.FC = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<CMSTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [clientImage, setClientImage] = useState('');
  const [published, setPublished] = useState(true);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const snap = await getDocs(collection(db, 'testimonials'));
      const list: CMSTestimonial[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as CMSTestimonial);
      });
      setTestimonials(list);
      try {
        localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
      } catch (_) {}
    } catch (err) {
      console.warn('Failed to load testimonials from Firestore, falling back to localStorage:', err);
      try {
        const saved = localStorage.getItem('cms_local_testimonials');
        if (saved) {
          setTestimonials(JSON.parse(saved));
        } else {
          const defaultTestimonials: CMSTestimonial[] = [
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
          setTestimonials(defaultTestimonials);
          localStorage.setItem('cms_local_testimonials', JSON.stringify(defaultTestimonials));
        }
      } catch (_) {
        setTestimonials([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setId('');
    setClientName('');
    setCompanyName('');
    setContentAr('');
    setContentEn('');
    setClientImage('');
    setPublished(true);
    setIsEditing(false);
  };

  const handleEdit = (test: CMSTestimonial) => {
    setId(test.id);
    setClientName(test.clientName);
    setCompanyName(test.companyName || '');
    setContentAr(test.content.ar);
    setContentEn(test.content.en);
    setClientImage(test.clientImage || '');
    setPublished(test.published);
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleDelete = async (docId: string) => {
    const confirmDelete = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف هذه التوصية نهائياً؟' 
        : 'Are you sure you want to permanently delete this testimonial?'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'testimonials', docId));
      setTestimonials(prev => prev.filter(t => t.id !== docId));
      try {
        const saved = localStorage.getItem('cms_local_testimonials');
        if (saved) {
          const list = JSON.parse(saved).filter((t: any) => t.id !== docId);
          localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore delete failed, updating local state:', err);
      setTestimonials(prev => {
        const list = prev.filter(t => t.id !== docId);
        try {
          localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleTogglePublish = async (test: CMSTestimonial) => {
    try {
      const docRef = doc(db, 'testimonials', test.id);
      await setDoc(docRef, { published: !test.published }, { merge: true });
      setTestimonials(prev => prev.map(t => t.id === test.id ? { ...t, published: !t.published } : t));
      try {
        const saved = localStorage.getItem('cms_local_testimonials');
        if (saved) {
          const list = JSON.parse(saved).map((t: any) => t.id === test.id ? { ...t, published: !t.published } : t);
          localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore toggle publish failed, updating local state:', err);
      setTestimonials(prev => {
        const list = prev.map(t => t.id === test.id ? { ...t, published: !t.published } : t);
        try {
          localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docId = id || `test-${Date.now()}`;

    const testData: any = {
      clientName: clientName.trim(),
      companyName: companyName.trim() || null,
      content: { ar: contentAr.trim(), en: contentEn.trim() },
      clientImage: clientImage.trim() || null,
      published
    };

    try {
      await setDoc(doc(db, 'testimonials', docId), testData, { merge: true });
      alert(language === 'ar' ? 'تم حفظ التوصية بنجاح!' : 'Testimonial saved successfully!');
      resetForm();
      setActiveTab('list');
      fetchTestimonials();
    } catch (err) {
      console.warn('Firestore save failed, saving to localStorage:', err);
      const updatedTest = { id: docId, ...testData };
      setTestimonials(prev => {
        const exists = prev.some(t => t.id === docId);
        const list = exists ? prev.map(t => t.id === docId ? updatedTest : t) : [...prev, updatedTest];
        try {
          localStorage.setItem('cms_local_testimonials', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
      alert(language === 'ar' ? 'تم الحفظ في الذاكرة المحلية للجهاز بنجاح (وضع غير متصل بالإنترنت)!' : 'Saved successfully to local browser storage (offline mode)!');
      resetForm();
      setActiveTab('list');
    }
  };

  return (
    <div className="space-y-6 text-start">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'إدارة التوصيات والعملاء' : 'Testimonials & Reviews Management'}</span>
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            {language === 'ar' ? 'عرض وإدارة توصيات العملاء والشركات الزميلة لتوثيق المصداقية.' : 'Manage glowing recommendations from security officers or engineering teams.'}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'list' 
                ? 'bg-[#1F293D] text-[#F3F5F7] border border-[#374151]' 
                : 'bg-[#0D111A] text-[#9AA4B2] border border-transparent hover:text-[#F3F5F7]'
            }`}
          >
            {language === 'ar' ? 'جميع التوصيات' : 'All Reviews'}
          </button>
          <button
            onClick={() => { setActiveTab('form'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'form' 
                ? 'bg-[#5B7CFA] text-white hover:bg-[#4A6BD8]' 
                : 'bg-[#0D111A] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إضافة توصية' : 'Add Testimonial'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* List */
        <div className="bg-[#0D111A] border border-[#202735] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل التوصيات...' : 'Loading testimonials...'}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#64748B] flex flex-col items-center gap-3">
              <MessageSquareQuote className="w-10 h-10 stroke-1 text-[#5B7CFA]" />
              <p>{language === 'ar' ? 'لا توجد توصيات حتى الآن.' : 'No reviews or feedback listed yet.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111722] border-b border-[#202735] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">{language === 'ar' ? 'العميل' : 'Client'}</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'الشركة' : 'Company'}</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'التوصية' : 'Testimonial'}</th>
                    <th className="px-6 py-4 text-center">{language === 'ar' ? 'النشر' : 'Published'}</th>
                    <th className="px-6 py-4 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202735] text-xs text-[#9AA4B2]">
                  {testimonials.map((test) => (
                    <tr key={test.id} className="hover:bg-[#111722]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {test.clientImage ? (
                            <img 
                              src={test.clientImage} 
                              alt={test.clientName} 
                              className="w-8 h-8 rounded-full object-cover border border-[#202735]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <UserCircle2 className="w-8 h-8 text-[#64748B] stroke-1" />
                          )}
                          <span className="font-bold text-[#F3F5F7] text-sm">{test.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">{test.companyName || '-'}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#9AA4B2] line-clamp-1 max-w-sm">"{test.content[language] || test.content.ar}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleTogglePublish(test)}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                              test.published 
                                ? 'text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20' 
                                : 'text-[#64748B] bg-[#111722] hover:bg-[#202735]'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(test)}
                            className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-red-500 hover:border-red-500/40 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#202735]">
            <h3 className="font-bold text-[#F3F5F7] text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#5B7CFA]" />
              <span>{isEditing ? (language === 'ar' ? 'تعديل التوصية' : 'Edit Testimonial') : (language === 'ar' ? 'إضافة توصية عميل جديد' : 'Add New Client Review')}</span>
            </h3>
            <button
              type="button"
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'اسم العميل / المقيم *' : 'Client Name *'}
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. John Doe, Eng. Mohamed"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Company / Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'الشركة أو المسمى الوظيفي' : 'Company Name or Role'}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Security Specialist, CEO at TechInc"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Client Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رابط الصورة الشخصية للعميل' : 'Client Avatar Image URL'}
              </label>
              <input
                type="text"
                value={clientImage}
                onChange={(e) => setClientImage(e.target.value)}
                placeholder="https://example.com/avatar.png or base64 data"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Published toggle */}
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#9AA4B2]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5B7CFA] focus:ring-0 cursor-pointer bg-[#111722] border-[#202735]"
                />
                <span>{language === 'ar' ? 'عرض ونشر التوصية في الموقع' : 'Publish / Active on Website'}</span>
              </label>
            </div>

            {/* Content Arabic */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'التوصية باللغة العربية *' : 'Review Text (Arabic) *'}
              </label>
              <textarea
                required
                rows={4}
                value={contentAr}
                onChange={(e) => setContentAr(e.target.value)}
                placeholder="تفاصيل التوصية والتعليقات..."
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right resize-none"
              />
            </div>

            {/* Content English */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'التوصية باللغة الإنجليزية *' : 'Review Text (English) *'}
              </label>
              <textarea
                required
                rows={4}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Testimonial text details..."
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#202735] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] cursor-pointer transition-all"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#5B7CFA] text-white hover:bg-[#4A6BD8] cursor-pointer flex items-center gap-1.5 shadow-md hover:shadow-[#5B7CFA]/15 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'حفظ التوصية' : 'Save Testimonial'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
