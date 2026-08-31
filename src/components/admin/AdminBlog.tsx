import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Clock, 
  Eye, 
  Check, 
  BookOpen,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSBlogPost } from '../../types';
import { contentItems } from '../../data/content';

export const AdminBlog: React.FC = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<CMSBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Cybersecurity');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('Abu Al-Saud');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Markdown live preview toggles
  const [showPreviewAr, setShowPreviewAr] = useState(false);
  const [showPreviewEn, setShowPreviewEn] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const snap = await getDocs(collection(db, 'blogPosts'));
      const list: CMSBlogPost[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as CMSBlogPost);
      });
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setPosts(list);
      try {
        localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
      } catch (_) {}
    } catch (err) {
      console.warn('Failed to load posts from Firestore, falling back to localStorage:', err);
      try {
        const saved = localStorage.getItem('cms_local_blogPosts');
        if (saved) {
          setPosts(JSON.parse(saved));
        } else {
          const list: CMSBlogPost[] = contentItems.map((c) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            description: c.description,
            excerpt: c.description,
            content: c.content,
            category: c.category,
            tags: c.tags,
            author: 'Abu Al-Saud',
            published: true,
            featured: c.featured || false,
            coverImage: '',
            createdAt: c.date ? new Date(c.date).toISOString() : new Date().toISOString()
          }));
          setPosts(list);
          localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
        }
      } catch (_) {
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setId('');
    setSlug('');
    setTitleAr('');
    setTitleEn('');
    setDescAr('');
    setDescEn('');
    setContentAr('');
    setContentEn('');
    setCoverImage('');
    setCategory('Cybersecurity');
    setTags('');
    setAuthor(language === 'ar' ? 'أبو السعود' : 'Abu Al-Saud');
    setPublished(true);
    setFeatured(false);
    setIsEditing(false);
    setShowPreviewAr(false);
    setShowPreviewEn(false);
  };

  const handleEdit = (post: CMSBlogPost) => {
    setId(post.id);
    setSlug(post.slug);
    setTitleAr(post.title.ar);
    setTitleEn(post.title.en);
    setDescAr(post.description.ar);
    setDescEn(post.description.en);
    setContentAr(post.content?.ar || '');
    setContentEn(post.content?.en || '');
    setCoverImage(post.coverImage || '');
    setCategory(post.category);
    setTags(post.tags.join(', '));
    setAuthor(post.author || 'Abu Al-Saud');
    setPublished(post.published);
    setFeatured(post.featured || false);
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleDelete = async (docId: string) => {
    const confirmDelete = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف هذه المقالة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' 
        : 'Are you sure you want to permanently delete this blog post? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'blogPosts', docId));
      setPosts(prev => prev.filter(p => p.id !== docId));
      try {
        const saved = localStorage.getItem('cms_local_blogPosts');
        if (saved) {
          const list = JSON.parse(saved).filter((p: any) => p.id !== docId);
          localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore delete failed, updating local state:', err);
      setPosts(prev => {
        const list = prev.filter(p => p.id !== docId);
        try {
          localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
        } catch (_) {}
        return list;
      });
    }
  };

  const handleTogglePublish = async (post: CMSBlogPost) => {
    try {
      const docRef = doc(db, 'blogPosts', post.id);
      await setDoc(docRef, { published: !post.published }, { merge: true });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
      try {
        const saved = localStorage.getItem('cms_local_blogPosts');
        if (saved) {
          const list = JSON.parse(saved).map((p: any) => p.id === post.id ? { ...p, published: !p.published } : p);
          localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
        }
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore toggle publish failed, updating local state:', err);
      setPosts(prev => {
        const list = prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p);
        try {
          localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
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

    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const postData: any = {
      slug: cleanedSlug,
      title: { ar: titleAr, en: titleEn },
      description: { ar: descAr, en: descEn },
      content: { ar: contentAr, en: contentEn },
      excerpt: { ar: descAr, en: descEn },
      category,
      tags: parsedTags,
      author,
      published,
      featured,
      coverImage: coverImage.trim() || null,
      createdAt: new Date().toISOString()
    };

    if (published) {
      postData.publishedAt = new Date().toISOString();
    }

    try {
      await setDoc(doc(db, 'blogPosts', docId), postData, { merge: true });
      alert(language === 'ar' ? 'تم حفظ المقالة بنجاح!' : 'Blog post saved successfully!');
      resetForm();
      setActiveTab('list');
      fetchPosts();
    } catch (err) {
      console.warn('Firestore save failed, saving to localStorage:', err);
      const updatedPost = { id: docId, ...postData };
      setPosts(prev => {
        const exists = prev.some(p => p.id === docId);
        const list = exists ? prev.map(p => p.id === docId ? updatedPost : p) : [...prev, updatedPost];
        try {
          localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
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
            <FileText className="w-5 h-5 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'إدارة المقالات والمدونة' : 'Blog & Content Management'}</span>
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            {language === 'ar' ? 'إنشاء وتعديل المقالات التقنية، الشروحات، ونشر محتوى التوعية بالأمن السيبراني.' : 'Publish and manage technical logs, cybersecurity articles, walkthroughs, and news.'}
          </p>
        </div>

        {/* Navigation actions */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'list' 
                ? 'bg-[#1F293D] text-[#F3F5F7] border border-[#374151]' 
                : 'bg-[#0D111A] text-[#9AA4B2] border border-transparent hover:text-[#F3F5F7]'
            }`}
          >
            {language === 'ar' ? 'جميع المقالات' : 'All Posts'}
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
            <span>{language === 'ar' ? 'إضافة مقال' : 'Write Post'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* Blog List */
        <div className="bg-[#0D111A] border border-[#202735] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل المقالات...' : 'Loading articles...'}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#64748B] flex flex-col items-center gap-3">
              <BookOpen className="w-10 h-10 stroke-1" />
              <p>{language === 'ar' ? 'لا توجد مقالات مضافة بعد. انقر على إضافة مقال لكتابة أول تدوينة.' : 'No blog posts found. Write your first article today!'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111722] border-b border-[#202735] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">{language === 'ar' ? 'المقالة' : 'Article'}</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'القسم' : 'Category'}</th>
                    <th className="px-6 py-4">{language === 'ar' ? 'الكاتب' : 'Author'}</th>
                    <th className="px-6 py-4 text-center">{language === 'ar' ? 'النشر' : 'Published'}</th>
                    <th className="px-6 py-4 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202735] text-xs text-[#9AA4B2]">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#111722]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-[#F3F5F7] text-sm">
                            {post.title[language] || post.title.ar}
                          </span>
                          <span className="block text-[10px] text-[#64748B] font-mono select-all">/{post.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#111722] border border-[#202735] text-[10px] text-slate-300">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{post.author}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleTogglePublish(post)}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                              post.published 
                                ? 'text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20' 
                                : 'text-[#64748B] bg-[#111722] hover:bg-[#202735]'
                            }`}
                          >
                            {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
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
        /* Blog Form Editor */
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#202735]">
            <h3 className="font-bold text-[#F3F5F7] text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5B7CFA]" />
              <span>{isEditing ? (language === 'ar' ? 'تحرير تدوينة' : 'Edit Blog Post') : (language === 'ar' ? 'مقال تدويني جديد' : 'Compose New Article')}</span>
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
            
            {/* Slug */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رابط المقالة (Slug) *' : 'Article Slug *'}
              </label>
              <input
                type="text"
                required
                value={slug}
                disabled={isEditing}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. owasp-top-10-vulnerabilities-walkthrough"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none transition-all disabled:opacity-50"
              />
              <p className="text-[10px] text-[#64748B]">
                {language === 'ar' ? 'رابط المقال في المتصفح. لا يمكن تغييره لاحقاً.' : 'Browser URL slug path. Permanent and cannot be changed later.'}
              </p>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                  {language === 'ar' ? 'التصنيف *' : 'Category *'}
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Network Security, Web Application Security"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                  {language === 'ar' ? 'الوسوم والكلمات الدلالية *' : 'Tags (Comma-separated) *'}
                </label>
                <input
                  type="text"
                  required
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. CTF, Linux, OWASP, Pentest"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Author & Cover Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'اسم كاتب المقالة *' : 'Author Name *'}
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Abu Al-Saud"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'رابط صورة الغلاف (اختياري)' : 'Cover Image URL / Base64 (Optional)'}
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.jpg or paste base64 data"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Arabic Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'عنوان المقال بالعربية *' : 'Title (Arabic) *'}
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان المقال"
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right"
              />
            </div>

            {/* English Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'عنوان المقال بالإنجليزية *' : 'Title (English) *'}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Article Title in English"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>

            {/* Arabic Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'نبذة مختصرة بالعربية *' : 'Short Excerpt (Arabic) *'}
              </label>
              <textarea
                required
                rows={2}
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                placeholder="نبذة سريعة تظهر في ملخص المقالات في الرئيسية..."
                dir="rtl"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none text-right resize-none animate-fade-in"
              />
            </div>

            {/* English Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                {language === 'ar' ? 'نبذة مختصرة بالإنجليزية *' : 'Short Excerpt (English) *'}
              </label>
              <textarea
                required
                rows={2}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Summary or excerpt to show on cards and listing..."
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-sm text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none resize-none"
              />
            </div>

            {/* Markdown Editor - AR */}
            <div className="space-y-2 md:col-span-2 pb-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                  {language === 'ar' ? 'محتوى المقالة بالعربية (Markdown) *' : 'Article Body (Arabic - Markdown) *'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreviewAr(!showPreviewAr)}
                  className="px-3 py-1 rounded bg-[#111722] border border-[#202735] text-[10px] text-[#5B7CFA] hover:text-[#F3F5F7] cursor-pointer"
                >
                  {showPreviewAr ? (language === 'ar' ? 'العودة للمحرر' : 'Back to Editor') : (language === 'ar' ? 'معاينة النتيجة' : 'Toggle Preview')}
                </button>
              </div>

              {showPreviewAr ? (
                <div className="w-full min-h-[300px] bg-[#111722] border border-[#202735] rounded-xl p-5 overflow-y-auto text-right text-[#9AA4B2] prose prose-invert max-w-none text-xs leading-relaxed font-sans" dir="rtl">
                  {contentAr ? contentAr.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  )) : <p className="text-gray-500 italic">محتوى فارغ</p>}
                </div>
              ) : (
                <textarea
                  required
                  rows={10}
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  placeholder="# اكتب المقالة هنا مستخدماً كود مارك داون للتنسيقات..."
                  dir="rtl"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs font-mono text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none text-right resize-y min-h-[250px]"
                />
              )}
            </div>

            {/* Markdown Editor - EN */}
            <div className="space-y-2 md:col-span-2 pb-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#9AA4B2] uppercase tracking-wider block">
                  {language === 'ar' ? 'محتوى المقالة بالإنجليزية (Markdown) *' : 'Article Body (English - Markdown) *'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreviewEn(!showPreviewEn)}
                  className="px-3 py-1 rounded bg-[#111722] border border-[#202735] text-[10px] text-[#5B7CFA] hover:text-[#F3F5F7] cursor-pointer"
                >
                  {showPreviewEn ? 'Back to Editor' : 'Toggle Preview'}
                </button>
              </div>

              {showPreviewEn ? (
                <div className="w-full min-h-[300px] bg-[#111722] border border-[#202735] rounded-xl p-5 overflow-y-auto text-left text-[#9AA4B2] prose prose-invert max-w-none text-xs leading-relaxed font-sans">
                  {contentEn ? contentEn.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  )) : <p className="text-gray-500 italic">Empty body content</p>}
                </div>
              ) : (
                <textarea
                  required
                  rows={10}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="# Write your Markdown post body here..."
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs font-mono text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none resize-y min-h-[250px]"
                />
              )}
            </div>

            {/* Settings */}
            <div className="flex gap-6 items-center pt-2 md:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#9AA4B2]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5B7CFA] focus:ring-0 cursor-pointer bg-[#111722] border-[#202735]"
                />
                <span>{language === 'ar' ? 'تثبيت كمقال مميز' : 'Featured Post'}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#9AA4B2]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5B7CFA] focus:ring-0 cursor-pointer bg-[#111722] border-[#202735]"
                />
                <span>{language === 'ar' ? 'نشر المقال فوراً' : 'Published / Visible'}</span>
              </label>
            </div>

          </div>

          {/* Form buttons footer */}
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
              <span>{language === 'ar' ? 'حفظ المقالة' : 'Save Article'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
