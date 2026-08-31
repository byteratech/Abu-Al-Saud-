import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Shield, 
  Terminal, 
  Cpu, 
  Database, 
  Server, 
  Key, 
  Globe, 
  Search, 
  CheckCircle2,
  Lock,
  Network
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSService } from '../../types';

// Supported Icons for selection
const ICON_POOL = [
  { name: 'Shield', component: Shield },
  { name: 'Terminal', component: Terminal },
  { name: 'Cpu', component: Cpu },
  { name: 'Database', component: Database },
  { name: 'Server', component: Server },
  { name: 'Key', component: Key },
  { name: 'Globe', component: Globe },
  { name: 'Search', component: Search },
  { name: 'Lock', component: Lock },
  { name: 'Network', component: Network }
];

export const AdminServices: React.FC = () => {
  const { language } = useLanguage();
  const [services, setServices] = useState<CMSService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [icon, setIcon] = useState('Shield');
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(1);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const snap = await getDocs(collection(db, 'services'));
      const list: CMSService[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as CMSService);
      });
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setServices(list);
      try {
        localStorage.setItem('cms_local_services', JSON.stringify(list));
      } catch (_) {}
    } catch (err) {
      console.warn('Failed to load services from Firestore, falling back to localStorage:', err);
      try {
        const saved = localStorage.getItem('cms_local_services');
        if (saved) {
          setServices(JSON.parse(saved));
        } else {
          const defaultServices: CMSService[] = [
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
            }
          ];
          setServices(defaultServices);
          localStorage.setItem('cms_local_services', JSON.stringify(defaultServices));
        }
      } catch (_) {
        setServices([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setId('');
    setTitleAr('');
    setTitleEn('');
    setDescAr('');
    setDescEn('');
    setIcon('Shield');
    setPublished(true);
    setOrder(services.length + 1);
    setIsEditing(false);
  };

  const handleEdit = (srv: CMSService) => {
    setId(srv.id);
    setTitleAr(srv.title.ar);
    setTitleEn(srv.title.en);
    setDescAr(srv.description.ar);
    setDescEn(srv.description.en);
    setIcon(srv.icon);
    setPublished(srv.published);
    setOrder(srv.order || 1);
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleDelete = async (docId: string) => {
    const confirmDelete = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف هذه الخدمة نهائياً؟' 
        : 'Are you sure you want to permanently delete this service?'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'services', docId));
      setServices(prev => prev.filter(s => s.id !== docId));
      try {
        const saved = localStorage.getItem('cms_local_services');
        if (saved) {
          const list = JSON.parse(saved).filter((s: any) => s.id !== docId);
          localStorage.setItem('cms_local_services', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore delete failed, updating local state:', err);
      setServices(prev => {
        const list = prev.filter(s => s.id !== docId);
        try {
          localStorage.setItem('cms_local_services', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleTogglePublish = async (srv: CMSService) => {
    try {
      const docRef = doc(db, 'services', srv.id);
      await setDoc(docRef, { published: !srv.published }, { merge: true });
      setServices(prev => prev.map(s => s.id === srv.id ? { ...s, published: !s.published } : s));
      try {
        const saved = localStorage.getItem('cms_local_services');
        if (saved) {
          const list = JSON.parse(saved).map((s: any) => s.id === srv.id ? { ...s, published: !s.published } : s);
          localStorage.setItem('cms_local_services', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore toggle publish failed, updating local state:', err);
      setServices(prev => {
        const list = prev.map(s => s.id === srv.id ? { ...s, published: !s.published } : s);
        try {
          localStorage.setItem('cms_local_services', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docId = id || `srv-${Date.now()}`;

    const serviceData: any = {
      title: { ar: titleAr, en: titleEn },
      description: { ar: descAr, en: descEn },
      icon,
      published,
      order: Number(order) || 1
    };

    try {
      await setDoc(doc(db, 'services', docId), serviceData, { merge: true });
      alert(language === 'ar' ? 'تم حفظ الخدمة بنجاح!' : 'Service saved successfully!');
      resetForm();
      setActiveTab('list');
      fetchServices();
    } catch (err) {
      console.warn('Firestore save failed, saving to localStorage:', err);
      const updatedSrv = { id: docId, ...serviceData };
      setServices(prev => {
        const exists = prev.some(s => s.id === docId);
        const list = exists ? prev.map(s => s.id === docId ? updatedSrv : s) : [...prev, updatedSrv];
        try {
          localStorage.setItem('cms_local_services', JSON.stringify(list));
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
            <Layers className="w-5 h-5 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'إدارة الخدمات والاستشارات الفنية' : 'Technical Services Management'}</span>
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            {language === 'ar' ? 'إضافة وتعديل الخدمات المهنية المعروضة للعملاء كاختبار الاختراق والتدقيق البرمجي.' : 'Offer security auditing, web-pentesting, or code review services.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'list' 
                ? 'bg-[#1F293D] text-[#F3F5F7] border border-[#374151]' 
                : 'bg-[#0D111A] text-[#9AA4B2] border border-transparent hover:text-[#F3F5F7]'
            }`}
          >
            {language === 'ar' ? 'جميع الخدمات' : 'All Services'}
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
            <span>{language === 'ar' ? 'إضافة خدمة' : 'Add Service'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* List */
        <div className="bg-[#0D111A] border border-[#202735] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل الخدمات...' : 'Loading services...'}
            </div>
          ) : services.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#64748B] flex flex-col items-center gap-3">
              <Layers className="w-10 h-10 stroke-1 text-[#5B7CFA]" />
              <p>{language === 'ar' ? 'لا توجد خدمات مضافة حتى الآن.' : 'No services offered yet. Create one!'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111722] border-b border-[#202735] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4 text-center w-12 font-mono">Order</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'أيقونة' : 'Icon'}</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'الخدمة' : 'Service'}</th>
                    <th className="px-6 py-4 text-center">{language === 'ar' ? 'النشر' : 'Published'}</th>
                    <th className="px-6 py-4 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202735] text-xs text-[#9AA4B2]">
                  {services.map((srv) => {
                    const SelectedIcon = ICON_POOL.find(x => x.name === srv.icon)?.component || Shield;
                    return (
                      <tr key={srv.id} className="hover:bg-[#111722]/40 transition-colors">
                        <td className="px-6 py-4 text-center font-mono text-xs font-bold text-[#5B7CFA]">{srv.order || 1}</td>
                        <td className="px-6 py-4">
                          <div className="w-9 h-9 rounded-lg bg-[#111722] border border-[#202735] flex items-center justify-center text-[#5B7CFA]">
                            <SelectedIcon className="w-4 h-4" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="font-bold text-[#F3F5F7] text-sm">
                              {srv.title[language] || srv.title.ar}
                            </span>
                            <p className="text-xs text-[#9AA4B2] line-clamp-1 max-w-md">{srv.description[language] || srv.description.ar}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleTogglePublish(srv)}
                              className={`p-1 rounded-md transition-all cursor-pointer ${
                                srv.published 
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
                              onClick={() => handleEdit(srv)}
                              className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(srv.id)}
                              className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-red-500 hover:border-red-500/40 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
              <span>{isEditing ? (language === 'ar' ? 'تعديل الخدمة المهنية' : 'Edit Service') : (language === 'ar' ? 'تقديم خدمة فنية جديدة' : 'Add New Service Offer')}</span>
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
            
            {/* Order */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'الترتيب التنازلي *' : 'Service Display Order *'}
              </label>
              <input
                type="number"
                required
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="e.g. 1"
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
                <span>{language === 'ar' ? 'إتاحة الخدمة ونشرها في الموقع' : 'Publish / Make Active'}</span>
              </label>
            </div>

            {/* Arabic Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'اسم الخدمة بالعربية *' : 'Service Title (Arabic) *'}
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان الخدمة بالعربية"
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right"
              />
            </div>

            {/* English Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'اسم الخدمة بالإنجليزية *' : 'Service Title (English) *'}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Service Title in English"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Arabic Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'الوصف بالعربية *' : 'Description (Arabic) *'}
              </label>
              <textarea
                required
                rows={3}
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                placeholder="وصف وتفاصيل هذه الخدمة..."
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right resize-none"
              />
            </div>

            {/* English Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'الوصف بالإنجليزية *' : 'Description (English) *'}
              </label>
              <textarea
                required
                rows={3}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Detailed explanations about service outcomes..."
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'اختر الأيقونة المناسبة *' : 'Select Associated Icon *'}
              </label>
              
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3.5">
                {ICON_POOL.map((item) => {
                  const IconComponent = item.component;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all hover:bg-[#111722] cursor-pointer ${
                        icon === item.name 
                          ? 'bg-[#5B7CFA]/15 border-[#5B7CFA] text-[#5B7CFA]' 
                          : 'bg-[#111722]/50 border-[#202735] text-[#9AA4B2]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-[9px] font-mono select-none">{item.name}</span>
                    </button>
                  );
                })}
              </div>
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
              <span>{language === 'ar' ? 'حفظ الخدمة' : 'Save Service'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
