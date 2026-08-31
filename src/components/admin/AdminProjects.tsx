import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ExternalLink, 
  FolderPlus, 
  Check, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSProject, ProjectCategory, ProjectStatus } from '../../types';
import { projectItems } from '../../data/projects';

export const AdminProjects: React.FC = () => {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<CMSProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

  // Form State
  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('development');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [technologies, setTechnologies] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('completed');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(1);
  const [highlightMetricAr, setHighlightMetricAr] = useState('');
  const [highlightMetricEn, setHighlightMetricEn] = useState('');

  // Case Study Sub-Form Accordion
  const [showCaseStudyForm, setShowCaseStudyForm] = useState(false);
  const [csOverviewAr, setCsOverviewAr] = useState('');
  const [csOverviewEn, setCsOverviewEn] = useState('');
  const [csProblemAr, setCsProblemAr] = useState('');
  const [csProblemEn, setCsProblemEn] = useState('');
  const [csSolutionAr, setCsSolutionAr] = useState('');
  const [csSolutionEn, setCsSolutionEn] = useState('');
  const [csResultsAr, setCsResultsAr] = useState('');
  const [csResultsEn, setCsResultsEn] = useState('');
  const [csLessonsAr, setCsLessonsAr] = useState('');
  const [csLessonsEn, setCsLessonsEn] = useState('');

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const snap = await getDocs(collection(db, 'projects'));
      const list: CMSProject[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as CMSProject);
      });
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProjects(list);
      try {
        localStorage.setItem('cms_local_projects', JSON.stringify(list));
      } catch (_) {}
    } catch (err) {
      console.warn('Failed to load projects from Firestore, falling back to localStorage:', err);
      try {
        const saved = localStorage.getItem('cms_local_projects');
        if (saved) {
          setProjects(JSON.parse(saved));
        } else {
          const list: CMSProject[] = projectItems.map((p, i) => ({
            id: p.slug,
            slug: p.slug,
            title: p.title,
            description: p.description,
            category: p.category as any,
            year: p.year,
            technologies: p.technologies,
            status: p.status,
            githubUrl: p.githubUrl,
            liveUrl: p.liveUrl,
            featured: false,
            published: true,
            order: i + 1,
            createdAt: new Date().toISOString()
          }));
          setProjects(list);
          localStorage.setItem('cms_local_projects', JSON.stringify(list));
        }
      } catch (_) {
        setProjects([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setId('');
    setSlug('');
    setTitleAr('');
    setTitleEn('');
    setDescAr('');
    setDescEn('');
    setCategory('development');
    setYear(new Date().getFullYear().toString());
    setTechnologies('');
    setStatus('completed');
    setGithubUrl('');
    setLiveUrl('');
    setFeatured(false);
    setPublished(true);
    setOrder(projects.length + 1);
    setHighlightMetricAr('');
    setHighlightMetricEn('');
    
    // Case study reset
    setCsOverviewAr('');
    setCsOverviewEn('');
    setCsProblemAr('');
    setCsProblemEn('');
    setCsSolutionAr('');
    setCsSolutionEn('');
    setCsResultsAr('');
    setCsResultsEn('');
    setCsLessonsAr('');
    setCsLessonsEn('');
    setIsEditing(false);
  };

  const handleEdit = (proj: CMSProject) => {
    setId(proj.id);
    setSlug(proj.slug);
    setTitleAr(proj.title.ar);
    setTitleEn(proj.title.en);
    setDescAr(proj.description.ar);
    setDescEn(proj.description.en);
    setCategory(proj.category);
    setYear(proj.year);
    setTechnologies(proj.technologies.join(', '));
    setStatus(proj.status);
    setGithubUrl(proj.githubUrl || '');
    setLiveUrl(proj.liveUrl || '');
    setFeatured(proj.featured || false);
    setPublished(proj.published);
    setOrder(proj.order || 1);
    setHighlightMetricAr(proj.highlightMetric?.ar || '');
    setHighlightMetricEn(proj.highlightMetric?.en || '');

    // Case Study fields
    if (proj.caseStudy) {
      setCsOverviewAr(proj.caseStudy.overview?.ar || '');
      setCsOverviewEn(proj.caseStudy.overview?.en || '');
      setCsProblemAr(proj.caseStudy.problem?.ar || '');
      setCsProblemEn(proj.caseStudy.problem?.en || '');
      setCsSolutionAr(proj.caseStudy.solution?.ar || '');
      setCsSolutionEn(proj.caseStudy.solution?.en || '');
      setCsResultsAr(proj.caseStudy.results?.ar || '');
      setCsResultsEn(proj.caseStudy.results?.en || '');
      setCsLessonsAr(proj.caseStudy.lessonsLearned?.ar || '');
      setCsLessonsEn(proj.caseStudy.lessonsLearned?.en || '');
      setShowCaseStudyForm(true);
    } else {
      setShowCaseStudyForm(false);
    }

    setIsEditing(true);
    setActiveTab('form');
  };

  const handleDelete = async (docId: string) => {
    const confirmDelete = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' 
        : 'Are you sure you want to permanently delete this project? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'projects', docId));
      setProjects(prev => prev.filter(p => p.id !== docId));
      try {
        const saved = localStorage.getItem('cms_local_projects');
        if (saved) {
          const list = JSON.parse(saved).filter((p: any) => p.id !== docId);
          localStorage.setItem('cms_local_projects', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore delete failed, updating local state:', err);
      setProjects(prev => {
        const list = prev.filter(p => p.id !== docId);
        try {
          localStorage.setItem('cms_local_projects', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleTogglePublish = async (proj: CMSProject) => {
    try {
      const docRef = doc(db, 'projects', proj.id);
      await setDoc(docRef, { published: !proj.published }, { merge: true });
      setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, published: !p.published } : p));
      try {
        const saved = localStorage.getItem('cms_local_projects');
        if (saved) {
          const list = JSON.parse(saved).map((p: any) => p.id === proj.id ? { ...p, published: !p.published } : p);
          localStorage.setItem('cms_local_projects', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore toggle publish failed, updating local state:', err);
      setProjects(prev => {
        const list = prev.map(p => p.id === proj.id ? { ...p, published: !p.published } : p);
        try {
          localStorage.setItem('cms_local_projects', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم فريد للرابط (Slug)' : 'Please enter a unique URL slug');
      return;
    }

    const cleanedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const docId = id || cleanedSlug;

    const parsedTechnologies = technologies
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const projectData: any = {
      slug: cleanedSlug,
      title: { ar: titleAr, en: titleEn },
      description: { ar: descAr, en: descEn },
      category,
      year,
      technologies: parsedTechnologies,
      status,
      githubUrl: githubUrl.trim() || null,
      liveUrl: liveUrl.trim() || null,
      featured,
      published,
      order: Number(order) || 1,
      createdAt: new Date().toISOString()
    };

    if (highlightMetricAr || highlightMetricEn) {
      projectData.highlightMetric = {
        ar: highlightMetricAr,
        en: highlightMetricEn
      };
    }

    // Attach Case Study if fields exist
    if (csOverviewAr || csOverviewEn || csProblemAr || csProblemEn || csSolutionAr || csSolutionEn) {
      projectData.caseStudy = {
        overview: { ar: csOverviewAr, en: csOverviewEn },
        problem: { ar: csProblemAr, en: csProblemEn },
        context: { ar: csOverviewAr, en: csOverviewEn }, // duplicated as generic context
        research: { ar: '', en: '' },
        strategy: { ar: '', en: '' },
        designOrArchitecture: { ar: '', en: '' },
        implementation: { ar: '', en: '' },
        challenges: { ar: csProblemAr, en: csProblemEn },
        solution: { ar: csSolutionAr, en: csSolutionEn },
        results: { ar: csResultsAr, en: csResultsEn },
        lessonsLearned: { ar: csLessonsAr, en: csLessonsEn }
      };
    }

    try {
      await setDoc(doc(db, 'projects', docId), projectData, { merge: true });
      alert(language === 'ar' ? 'تم حفظ المشروع بنجاح!' : 'Project saved successfully!');
      resetForm();
      setActiveTab('list');
      fetchProjects();
    } catch (err) {
      console.warn('Firestore save failed, saving to localStorage:', err);
      const updatedProject = { id: docId, ...projectData };
      setProjects(prev => {
        const exists = prev.some(p => p.id === docId);
        const list = exists ? prev.map(p => p.id === docId ? updatedProject : p) : [...prev, updatedProject];
        try {
          localStorage.setItem('cms_local_projects', JSON.stringify(list));
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
      
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'إدارة المشاريع معرض الأعمال' : 'Portfolio Projects Management'}</span>
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            {language === 'ar' ? 'إنشاء، تعديل، وحذف مشاريع معرض الأعمال ودراسات الحالة.' : 'Create, edit, and manage portfolio projects & full case studies.'}
          </p>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'list' 
                ? 'bg-[#1F293D] text-[#F3F5F7] border border-[#374151]' 
                : 'bg-[#0D111A] text-[#9AA4B2] border border-transparent hover:text-[#F3F5F7]'
            }`}
          >
            {language === 'ar' ? 'قائمة المشاريع' : 'All Projects'}
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
            <span>{language === 'ar' ? 'إضافة مشروع' : 'Add Project'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* List View */
        <div className="bg-[#0D111A] border border-[#202735] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل المشاريع...' : 'Loading portfolio projects...'}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#64748B] flex flex-col items-center gap-3">
              <FolderPlus className="w-10 h-10 stroke-1" />
              <p>{language === 'ar' ? 'لا توجد مشاريع مضافة حتى الآن. انقر على إضافة مشروع للبدء.' : 'No projects found in Firestore. Click "Add Project" to begin.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111722] border-b border-[#202735] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4 text-center w-12 font-mono">Order</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'المشروع' : 'Project'}</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'التصنيف' : 'Category'}</th>
                    <th className="px-6 py-4 font-mono">Year</th>
                    <th className="px-6 py-4 text-center">{language === 'ar' ? 'النشر' : 'Published'}</th>
                    <th className="px-6 py-4 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202735] text-xs text-[#9AA4B2]">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-[#111722]/40 transition-colors">
                      <td className="px-6 py-4 text-center font-mono text-xs font-bold text-[#5B7CFA]">{proj.order || 1}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-[#F3F5F7] text-sm">
                            {proj.title[language] || proj.title.ar}
                          </span>
                          <span className="block text-[10px] text-[#64748B] font-mono select-all">/{proj.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#111722] border border-[#202735] text-[10px] text-slate-300 capitalize">
                          {proj.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{proj.year}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleTogglePublish(proj)}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                              proj.published 
                                ? 'text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20' 
                                : 'text-[#64748B] bg-[#111722] hover:bg-[#202735]'
                            }`}
                            title={proj.published ? 'Published' : 'Draft'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(proj)}
                            className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(proj.id)}
                            className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-red-500 hover:border-red-500/40 transition-all cursor-pointer"
                            title="Delete"
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
        /* Form View (Add/Edit) */
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#202735]">
            <h3 className="font-bold text-[#F3F5F7] text-base flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#5B7CFA]" />
              <span>{isEditing ? (language === 'ar' ? 'تعديل بيانات المشروع' : 'Edit Project Details') : (language === 'ar' ? 'إضافة مشروع جديد' : 'Create New Project')}</span>
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
            
            {/* Slug / ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رابط المشروع (Slug) *' : 'Project Slug (Unique identifier) *'}
              </label>
              <input
                type="text"
                required
                value={slug}
                disabled={isEditing}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. web-penetration-testing-tool"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none transition-all disabled:opacity-50"
              />
              <p className="text-[10px] text-[#64748B]">
                {language === 'ar' ? 'الرابط الفريد لتصفح صفحة المشروع. لا يمكن تغييره بعد الحفظ.' : 'Used in the URL path. Cannot be modified after creation.'}
              </p>
            </div>

            {/* Year & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                  {language === 'ar' ? 'السنة *' : 'Year *'}
                </label>
                <input
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                  {language === 'ar' ? 'الترتيب *' : 'Order *'}
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
            </div>

            {/* Arabic Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'العنوان باللغة العربية *' : 'Title (Arabic) *'}
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان المشروع بالعربية"
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right"
              />
            </div>

            {/* English Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'العنوان باللغة الإنجليزية *' : 'Title (English) *'}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Project Title in English"
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
                placeholder="تفاصيل ووصف المشروع باللغة العربية..."
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
                placeholder="Short project summary or description in English..."
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>

            {/* Category & Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'التصنيف *' : 'Category *'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="development">{language === 'ar' ? 'برمجة وتطوير' : 'Development'}</option>
                <option value="security">{language === 'ar' ? 'أمن سيبراني واختبار اختراق' : 'Cybersecurity'}</option>
                <option value="design">{language === 'ar' ? 'شبكات وبنية أنظمة' : 'Networks & Systems'}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'الحالة *' : 'Status *'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="in_progress">{language === 'ar' ? 'قيد التطوير' : 'In Progress'}</option>
                <option value="concept">{language === 'ar' ? 'فكرة / تصور مسبق' : 'Concept'}</option>
              </select>
            </div>

            {/* Technologies */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'التقنيات المستخدمة (مفصولة بفواصل) *' : 'Technologies Used (Comma-separated) *'}
              </label>
              <input
                type="text"
                required
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="e.g. React, TypeScript, Tailwind, Node.js, Firebase"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* GitHub and Live URLs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رابط GitHub (اختياري)' : 'GitHub Repository URL (Optional)'}
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'الرابط المباشر للموقع (اختياري)' : 'Live Demo / Website URL (Optional)'}
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Highlights Metrics */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رقم الإنجاز المميز بالعربية (مثال: 100% نجاح)' : 'Highlight Metric (Arabic)'}
              </label>
              <input
                type="text"
                value={highlightMetricAr}
                onChange={(e) => setHighlightMetricAr(e.target.value)}
                placeholder="مثال: نسبة حماية 100%"
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رقم الإنجاز المميز بالإنجليزية' : 'Highlight Metric (English)'}
              </label>
              <input
                type="text"
                value={highlightMetricEn}
                onChange={(e) => setHighlightMetricEn(e.target.value)}
                placeholder="e.g. 100% Secure"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Featured & Published */}
            <div className="flex gap-6 items-center pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#9AA4B2]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5B7CFA] focus:ring-0 cursor-pointer bg-[#111722] border-[#202735]"
                />
                <span>{language === 'ar' ? 'تثبيت كمشروع مميز' : 'Featured Project'}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#9AA4B2]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5B7CFA] focus:ring-0 cursor-pointer bg-[#111722] border-[#202735]"
                />
                <span>{language === 'ar' ? 'نشر المشروع فوراً' : 'Published / Visible'}</span>
              </label>
            </div>

          </div>

          {/* Case Study Section Accordion Header */}
          <div className="pt-4 border-t border-[#202735]">
            <button
              type="button"
              onClick={() => setShowCaseStudyForm(!showCaseStudyForm)}
              className="w-full flex justify-between items-center py-2.5 text-sm font-bold text-[#F3F5F7] hover:text-[#5B7CFA] transition-colors cursor-pointer text-start"
            >
              <span>{language === 'ar' ? 'تفاصيل دراسة الحالة الكاملة (إضافي)' : 'Full Case Study & Technical Journey (Optional)'}</span>
              {showCaseStudyForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              {language === 'ar' ? 'بإمكانك إضافة دراسة حالة تفصيلية لتوضيح المشكلة الاستراتيجية والنتائج والحلول الفنية للمشروع.' : 'Provide the programmatic journey, engineering problems, solution strategies, and technical achievements.'}
            </p>
          </div>

          {/* Case Study Fields */}
          {showCaseStudyForm && (
            <div className="space-y-6 pt-4 border-t border-[#202735]/40 animate-fade-in grid grid-cols-1 gap-6">
              
              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">Overview / Context (Arabic)</label>
                  <textarea
                    rows={2}
                    value={csOverviewAr}
                    onChange={(e) => setCsOverviewAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none text-right resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">Overview / Context (English)</label>
                  <textarea
                    rows={2}
                    value={csOverviewEn}
                    onChange={(e) => setCsOverviewEn(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* The Problem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">The Problem / Challenges (Arabic)</label>
                  <textarea
                    rows={2}
                    value={csProblemAr}
                    onChange={(e) => setCsProblemAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none text-right resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">The Problem / Challenges (English)</label>
                  <textarea
                    rows={2}
                    value={csProblemEn}
                    onChange={(e) => setCsProblemEn(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Solution & Implementation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">The Solution / Engineering (Arabic)</label>
                  <textarea
                    rows={2}
                    value={csSolutionAr}
                    onChange={(e) => setCsSolutionAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none text-right resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">The Solution / Engineering (English)</label>
                  <textarea
                    rows={2}
                    value={csSolutionEn}
                    onChange={(e) => setCsSolutionEn(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Results & Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">The Results & Metrics (Arabic)</label>
                  <textarea
                    rows={2}
                    value={csResultsAr}
                    onChange={(e) => setCsResultsAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none text-right resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">The Results & Metrics (English)</label>
                  <textarea
                    rows={2}
                    value={csResultsEn}
                    onChange={(e) => setCsResultsEn(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">Lessons Learned (Arabic)</label>
                  <textarea
                    rows={2}
                    value={csLessonsAr}
                    onChange={(e) => setCsLessonsAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none text-right resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block">Lessons Learned (English)</label>
                  <textarea
                    rows={2}
                    value={csLessonsEn}
                    onChange={(e) => setCsLessonsEn(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Form Actions footer */}
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
              <span>{language === 'ar' ? 'حفظ المشروع' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
