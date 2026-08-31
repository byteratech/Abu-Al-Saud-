import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveView } from '../../types';
import { contentItems } from '../../data/content';
import { projectItems } from '../../data/projects';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  Trash2, 
  Search, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Database, 
  RefreshCw,
  Terminal,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';

interface CommentData {
  id: string;
  articleSlug: string;
  author: string;
  text: string;
  createdAt?: string;
}

interface DashboardViewProps {
  setActiveView: (view: ActiveView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { language, t } = useLanguage();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'content' | 'projects' | 'system'>('overview');
  const [commentSearch, setCommentSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  // Subscribe to real-time comments from Firestore
  useEffect(() => {
    setIsLoadingComments(true);
    const commentsRef = collection(db, 'comments');

    const unsubscribe = onSnapshot(
      commentsRef,
      (snapshot) => {
        const fetched: CommentData[] = [];
        snapshot.forEach((document) => {
          const data = document.data();
          fetched.push({
            id: document.id,
            articleSlug: data.articleSlug || '',
            author: data.author || 'Visitor',
            text: data.text || '',
            createdAt: data.createdAt,
          });
        });

        // Sort descending by date
        fetched.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setComments(fetched);
        setIsLoadingComments(false);
      },
      (err) => {
        console.error('Firestore snapshot error in dashboard:', err);
        setIsLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch dynamic CMS projects and articles
  useEffect(() => {
    // 1. Initial local/static load for projects
    let initialProjs = [...projectItems];
    try {
      const savedProjs = localStorage.getItem('cms_local_projects');
      if (savedProjs) {
        initialProjs = JSON.parse(savedProjs);
      }
    } catch (_) {}
    setProjects(initialProjs);

    // 2. Initial local/static load for articles
    let initialArts = [...contentItems];
    try {
      const savedArts = localStorage.getItem('cms_local_blogPosts');
      if (savedArts) {
        initialArts = JSON.parse(savedArts).map((data: any) => ({
          id: data.id,
          slug: data.slug || data.id,
          category: data.category || 'General',
          type: data.type || 'article',
          date: data.publishedAt || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
          readingTime: data.readingTime || 5,
          featured: !!data.featured,
          tags: data.tags || [],
          title: data.title,
          description: data.description || data.excerpt,
          content: data.content
        }));
      }
    } catch (_) {}
    setArticles(initialArts);

    // 3. Fetch live projects
    const loadLive = async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        const list: any[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        if (list.length > 0) {
          setProjects(list);
        } else if (projectItems.length === 0) {
          setProjects([]);
        }
      } catch (err) {
        console.warn('Failed to fetch live projects in Dashboard:', err);
      }
    };

    // 4. Fetch live articles
    const loadLiveArticles = async () => {
      try {
        const snap = await getDocs(collection(db, 'blogPosts'));
        const list: any[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          list.push({
            id: doc.id,
            slug: data.slug || doc.id,
            category: data.category || 'General',
            type: data.type || 'article',
            date: data.publishedAt || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            readingTime: data.readingTime || 5,
            featured: !!data.featured,
            tags: data.tags || [],
            title: data.title,
            description: data.description || data.excerpt,
            content: data.content
          });
        });
        if (list.length > 0) {
          setArticles(list);
        } else if (contentItems.length === 0) {
          setArticles([]);
        }
      } catch (err) {
        console.warn('Failed to fetch live articles in Dashboard:', err);
      }
    };

    loadLive();
    loadLiveArticles();
  }, []);

  const handleDeleteComment = async (commentId: string) => {
    const confirmMsg = language === 'ar' 
      ? 'هل أنت تأكد من رغبتك في حذف هذا التعليق نهائياً؟' 
      : 'Are you sure you want to permanently delete this comment?';
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(commentId);
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  // Stats Calculations
  const totalArticles = articles.length;
  const totalProjects = projects.length;
  const totalReadingTime = articles.reduce((acc, curr) => acc + (curr.readingTime || 5), 0);
  const categoriesCount = new Set(articles.map(c => c.category)).size;

  const filteredComments = comments.filter(c => 
    c.text.toLowerCase().includes(commentSearch.toLowerCase()) ||
    c.author.toLowerCase().includes(commentSearch.toLowerCase()) ||
    c.articleSlug.toLowerCase().includes(commentSearch.toLowerCase())
  );

  const filteredContent = articles.filter(c =>
    (c.title[language] || c.title.ar || '').toLowerCase().includes(contentSearch.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(contentSearch.toLowerCase()) ||
    (c.tags || []).some((tag: string) => tag.toLowerCase().includes(contentSearch.toLowerCase()))
  );

  const getArticleTitle = (slug: string) => {
    const item = articles.find(c => c.slug === slug);
    if (!item) return slug;
    return item.title[language] || item.title.ar;
  };

  return (
    <div id="dashboard-page" className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#202735] pb-8 text-start">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#5B7CFA] text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === 'ar' ? 'نظام الإدارة والتحليل المباشر' : 'Live Platform Management & Analytics'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5F7] tracking-tight">
            {language === 'ar' ? 'لوحة تحكم المنصة' : 'Platform Control Dashboard'}
          </h1>
          <p className="text-sm text-[#9AA4B2] max-w-2xl">
            {language === 'ar' 
              ? 'متابعة إحصائيات المحتوى، إدارة التعليقات الحية من الزوار عبر Firebase Firestore، ومراقبة حالة النظام والتفاعل.'
              : 'Overview of platform analytics, real-time visitor comment moderation via Firebase Firestore, and system diagnostics.'}
          </p>
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center gap-3 bg-[#0D111A] border border-[#202735] p-3 rounded-2xl shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111722] border border-[#202735] text-xs text-[#9AA4B2]">
            <Database className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[#F3F5F7] font-semibold">Firestore</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111722] border border-[#202735] text-xs text-[#9AA4B2]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'محمي' : 'Protected'}</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-start">
        
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-[#5B7CFA]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'إجمالي التعليقات الحية' : 'Live Comments'}
            </span>
            <div className="p-2 rounded-xl bg-[#111722] border border-[#202735]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F3F5F7]">
              {isLoadingComments ? '...' : comments.length}
            </span>
            <span className="text-xs text-[#10B981] font-mono">{language === 'ar' ? 'تحديث لحظي' : 'Real-time'}</span>
          </div>
          <p className="text-xs text-[#9AA4B2]">
            {language === 'ar' ? 'مزامنة مباشرة مع Firebase' : 'Synced live with Firebase Firestore'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-[#5B7CFA]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'منشورات المدونة والدروس' : 'Published Content'}
            </span>
            <div className="p-2 rounded-xl bg-[#111722] border border-[#202735]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F3F5F7]">{totalArticles}</span>
            <span className="text-xs text-[#9AA4B2] font-mono">{categoriesCount} {language === 'ar' ? 'تصنيفات' : 'categories'}</span>
          </div>
          <p className="text-xs text-[#9AA4B2]">
            {language === 'ar' ? 'مقالات وتقارير تعليمية' : 'Articles & technical write-ups'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-[#5B7CFA]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'المشاريع والحالات الدراسية' : 'Projects'}
            </span>
            <div className="p-2 rounded-xl bg-[#111722] border border-[#202735]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F3F5F7]">{totalProjects}</span>
            <span className="text-xs text-[#10B981] font-mono">100% {language === 'ar' ? 'مكتملة' : 'built'}</span>
          </div>
          <p className="text-xs text-[#9AA4B2]">
            {language === 'ar' ? 'هوية، تطوير، وأنظمة أمنية' : 'Design, Web & Security builds'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all space-y-3">
          <div className="flex items-center justify-between text-[#5B7CFA]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'زمن القراءة التراكمي' : 'Total Read Time'}
            </span>
            <div className="p-2 rounded-xl bg-[#111722] border border-[#202735]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F3F5F7]">{totalReadingTime}</span>
            <span className="text-xs text-[#9AA4B2]">{language === 'ar' ? 'دقيقة' : 'minutes'}</span>
          </div>
          <p className="text-xs text-[#9AA4B2]">
            {language === 'ar' ? 'إجمالي المحتوى التعليمي والمجاني' : 'Knowledge base reading depth'}
          </p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#202735] pb-4 text-start">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#5B7CFA] text-white shadow-md shadow-[#5B7CFA]/20'
              : 'bg-[#0D111A] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{language === 'ar' ? 'نظرة عامة' : 'Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-[#5B7CFA] text-white shadow-md shadow-[#5B7CFA]/20'
              : 'bg-[#0D111A] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{language === 'ar' ? 'إدارة التعليقات الحية' : 'Live Comments Moderation'}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#111722] text-[10px] font-mono border border-[#202735]">
            {comments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'content'
              ? 'bg-[#5B7CFA] text-white shadow-md shadow-[#5B7CFA]/20'
              : 'bg-[#0D111A] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل المحتوى والمدونة' : 'Content Index'}</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-[#5B7CFA] text-white shadow-md shadow-[#5B7CFA]/20'
              : 'bg-[#0D111A] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{language === 'ar' ? 'المشاريع' : 'Projects'}</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'system'
              ? 'bg-[#5B7CFA] text-white shadow-md shadow-[#5B7CFA]/20'
              : 'bg-[#0D111A] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'ar' ? 'تشخيصات الأمان' : 'System & Security'}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 text-start">
          
          {/* Recent Comments Stream Preview */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#5B7CFA]" />
                <h3 className="text-lg font-bold text-[#F3F5F7]">
                  {language === 'ar' ? 'أحدث التعليقات الحية من الزوار' : 'Recent Visitor Comments Stream'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('comments')}
                className="text-xs text-[#5B7CFA] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{language === 'ar' ? 'عرض الكل والإدارة' : 'View All & Moderate'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {isLoadingComments ? (
              <div className="py-12 text-center text-xs text-[#9AA4B2] flex justify-center items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#5B7CFA]" />
                <span>{language === 'ar' ? 'جاري تحميل البيانات الحية...' : 'Loading live stream...'}</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B] bg-[#111722] rounded-xl border border-[#202735]">
                {language === 'ar' ? 'لا توجد تعليقات حتى الآن.' : 'No comments submitted yet.'}
              </div>
            ) : (
              <div className="divide-y divide-[#202735]">
                {comments.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F3F5F7]">{c.author}</span>
                        <span className="text-[10px] font-mono text-[#64748B]">({c.date || 'اليوم'})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                          {getArticleTitle(c.articleSlug)}
                        </span>
                      </div>
                      <p className="text-xs text-[#9AA4B2] leading-relaxed">
                        {c.text}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={deletingId === c.id}
                      title={language === 'ar' ? 'حذف التعليق' : 'Delete comment'}
                      className="p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Categories Breakdown */}
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#5B7CFA]" />
                <h3 className="text-base font-bold text-[#F3F5F7]">
                  {language === 'ar' ? 'توزيع المحتوى حسب التصنيف' : 'Content Category Distribution'}
                </h3>
              </div>
              <div className="space-y-3">
                {Array.from(new Set(articles.map(c => c.category))).map((cat, idx) => {
                  const count = articles.filter(c => c.category === cat).length;
                  const percentage = Math.round((count / totalArticles) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#F3F5F7]">{cat}</span>
                        <span className="text-[#9AA4B2] font-mono">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#111722] overflow-hidden">
                        <div 
                          className="h-full bg-[#5B7CFA] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#5B7CFA]" />
                <h3 className="text-base font-bold text-[#F3F5F7]">
                  {language === 'ar' ? 'إجراءات سريعة واختصارات' : 'Quick Navigation Shortcuts'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveView({ type: 'content' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-semibold text-[#F3F5F7] flex items-center justify-between text-start cursor-pointer"
                >
                  <span>{language === 'ar' ? 'تصفح المدونة' : 'View Blog'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5B7CFA]" />
                </button>

                <button
                  onClick={() => {
                    setActiveView({ type: 'projects' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-semibold text-[#F3F5F7] flex items-center justify-between text-start cursor-pointer"
                >
                  <span>{language === 'ar' ? 'تصفح المشاريع' : 'View Projects'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5B7CFA]" />
                </button>

                <button
                  onClick={() => {
                    setActiveView({ type: 'about' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-semibold text-[#F3F5F7] flex items-center justify-between text-start cursor-pointer"
                >
                  <span>{language === 'ar' ? 'صفحة عني' : 'About View'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5B7CFA]" />
                </button>

                <button
                  onClick={() => {
                    setActiveView({ type: 'contact' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs font-semibold text-[#F3F5F7] flex items-center justify-between text-start cursor-pointer"
                >
                  <span>{language === 'ar' ? 'صفحة التواصل' : 'Contact View'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5B7CFA]" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: LIVE COMMENTS MODERATION */}
      {activeTab === 'comments' && (
        <div className="space-y-6 text-start">
          
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative min-w-[280px] flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                placeholder={language === 'ar' ? 'تصفية التعليقات بالكاتب أو النص أو المقال...' : 'Filter comments by author, text or article...'}
                className="w-full bg-[#0D111A] border border-[#202735] text-xs text-[#F3F5F7] placeholder-[#64748B] ps-9 pe-4 py-2.5 rounded-xl focus:outline-none focus:border-[#5B7CFA]"
              />
            </div>

            <div className="text-xs text-[#9AA4B2] font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>{filteredComments.length} {language === 'ar' ? 'تعليق متاح' : 'comments found'}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735]">
            {isLoadingComments ? (
              <div className="py-16 text-center text-xs text-[#9AA4B2] flex justify-center items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#5B7CFA]" />
                <span>{language === 'ar' ? 'جاري الاتصال بـ Firebase...' : 'Connecting to Firebase Firestore...'}</span>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#64748B]">
                {language === 'ar' ? 'لا توجد تعليقات تطابق خيارات البحث.' : 'No comments match search filters.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs text-[#9AA4B2]">
                  <thead>
                    <tr className="border-b border-[#202735] text-[#64748B] font-mono uppercase">
                      <th className="pb-3 text-start">{language === 'ar' ? 'الكاتب' : 'Author'}</th>
                      <th className="pb-3 text-start">{language === 'ar' ? 'التعليق' : 'Comment Text'}</th>
                      <th className="pb-3 text-start">{language === 'ar' ? 'المقال' : 'Article'}</th>
                      <th className="pb-3 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="pb-3 text-end">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202735]">
                    {filteredComments.map((c) => (
                      <tr key={c.id} className="hover:bg-[#111722]/50 transition-colors">
                        <td className="py-4 font-bold text-[#F3F5F7] whitespace-nowrap pe-4">
                          {c.author}
                        </td>
                        <td className="py-4 text-[#9AA4B2] max-w-md pe-4 leading-relaxed">
                          {c.text}
                        </td>
                        <td className="py-4 pe-4">
                          <button
                            onClick={() => {
                              setActiveView({ type: 'content', slug: c.articleSlug });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-[#5B7CFA] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <span>{getArticleTitle(c.articleSlug)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap pe-4">
                          {c.date || 'اليوم'}
                        </td>
                        <td className="py-4 text-end whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            disabled={deletingId === c.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: CONTENT INDEX */}
      {activeTab === 'content' && (
        <div className="space-y-6 text-start">
          <div className="flex items-center justify-between gap-4">
            <div className="relative min-w-[280px] flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                placeholder={language === 'ar' ? 'تصفية المقالات بالعنوان أو التصنيف أو الوسم...' : 'Filter content by title, category, or tag...'}
                className="w-full bg-[#0D111A] border border-[#202735] text-xs text-[#F3F5F7] placeholder-[#64748B] ps-9 pe-4 py-2.5 rounded-xl focus:outline-none focus:border-[#5B7CFA]"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735]">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-[#9AA4B2]">
                <thead>
                  <tr className="border-b border-[#202735] text-[#64748B] font-mono uppercase">
                    <th className="pb-3 text-start">{language === 'ar' ? 'العنوان' : 'Title'}</th>
                    <th className="pb-3 text-start">{language === 'ar' ? 'التصنيف' : 'Category'}</th>
                    <th className="pb-3 text-start">{language === 'ar' ? 'النوع' : 'Type'}</th>
                    <th className="pb-3 text-start">{language === 'ar' ? 'زمن القراءة' : 'Reading Time'}</th>
                    <th className="pb-3 text-end">{language === 'ar' ? 'فتح' : 'View'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202735]">
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="hover:bg-[#111722]/50 transition-colors">
                      <td className="py-4 font-bold text-[#F3F5F7] max-w-sm pe-4">
                        {item.title[language] || item.title.ar}
                      </td>
                      <td className="py-4 pe-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#111722] border border-[#202735] text-[10px] text-[#5B7CFA]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-[10px] text-[#9AA4B2] uppercase pe-4">
                        {item.type}
                      </td>
                      <td className="py-4 font-mono text-[11px] text-[#64748B] pe-4">
                        {item.readingTime} {language === 'ar' ? 'دقائق' : 'mins'}
                      </td>
                      <td className="py-4 text-end">
                        <button
                          onClick={() => {
                            setActiveView({ type: 'content', slug: item.slug });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#5B7CFA] hover:border-[#5B7CFA]/50 transition-all inline-flex items-center cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6 text-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                      {proj.category}
                    </span>
                    <h3 className="text-base font-bold text-[#F3F5F7]">
                      {proj.title[language] || proj.title.ar}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#10B981] px-2 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/20 shrink-0">
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-[#9AA4B2] leading-relaxed">
                  {proj.description[language] || proj.description.ar}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.technologies.map((tech, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151B26] text-[#64748B]">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveView({ type: 'projects', slug: proj.slug });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B7CFA] hover:bg-[#4B6EF5] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'عرض دراسة الحالة' : 'View Case Study'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM DIAGNOSTICS */}
      {activeTab === 'system' && (
        <div className="space-y-6 text-start">
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5B7CFA]" />
              <h3 className="text-lg font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'تشخيصات النظام وحالة الأمان' : 'System & Security Health Diagnostics'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F5F7]">{language === 'ar' ? 'قاعدة بيانات Firestore' : 'Firestore Database'}</span>
                  <span className="text-xs font-mono text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'نشط ومتصل' : 'Active & Connected'}
                  </span>
                </div>
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'تم ضبط بيئة Firestore للاستقبال اللحظي للتعليقات.' : 'Firestore live streaming initialized for comments.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F5F7]">{language === 'ar' ? 'قواعد الأمان (Firestore Rules)' : 'Firestore Security Rules'}</span>
                  <span className="text-xs font-mono text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'تم النشر' : 'Deployed'}
                  </span>
                </div>
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'تسمح بالقراءة وإنشاء التعليقات مع التحقق من الحقول ومنع التجاوز.' : 'Validates fields and size limits on comments.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F5F7]">{language === 'ar' ? 'اللغات المدعومة' : 'Supported Locales'}</span>
                  <span className="text-xs font-mono text-[#5B7CFA]">Arabic (ar) / English (en)</span>
                </div>
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'دعم كامل للتنقل بين العربية والإنجليزية مع اتجاه RTL/LTR.' : 'Full bi-directional support with RTL/LTR.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F5F7]">{language === 'ar' ? 'أداء خادم التطبيق' : 'Server Environment'}</span>
                  <span className="text-xs font-mono text-[#10B981]">Vite + React 18 + Cloud Run</span>
                </div>
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'التطبيق محزم ومحسّن للسرعة بأعلى كفاءة.' : 'Optimized single page app build.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
