import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { 
  BarChart3, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Settings, 
  Users, 
  Layers, 
  Sparkles,
  Database,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { projectItems } from '../../data/projects';
import { contentItems } from '../../data/content';

interface OverviewStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  draftBlogPosts: number;
  unreadMessages: number;
  totalServices: number;
  totalTestimonials: number;
  totalClients: number;
}

interface AdminOverviewProps {
  onNavigate: (section: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<OverviewStats>({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    draftBlogPosts: 0,
    unreadMessages: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalClients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Projects
      let projectsList: any[] = [];
      try {
        const projectsSnap = await getDocs(collection(db, 'projects'));
        projectsSnap.forEach(d => projectsList.push({ id: d.id, ...d.data() }));
        localStorage.setItem('cms_local_projects', JSON.stringify(projectsList));
      } catch (err) {
        console.warn('Overview project fetch failed, loading local:', err);
        const saved = localStorage.getItem('cms_local_projects');
        if (saved) {
          projectsList = JSON.parse(saved);
        } else {
          projectsList = projectItems.map((p, i) => ({
            id: p.slug,
            slug: p.slug,
            title: p.title,
            description: p.description,
            category: p.category,
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
        }
      }

      // 2. Fetch Blog Posts
      let postsList: any[] = [];
      try {
        const postsSnap = await getDocs(collection(db, 'blogPosts'));
        postsSnap.forEach(d => postsList.push({ id: d.id, ...d.data() }));
        localStorage.setItem('cms_local_blogPosts', JSON.stringify(postsList));
      } catch (err) {
        console.warn('Overview blog post fetch failed, loading local:', err);
        const saved = localStorage.getItem('cms_local_blogPosts');
        if (saved) {
          postsList = JSON.parse(saved);
        } else {
          postsList = contentItems.map((c) => ({
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
        }
      }

      // 3. Fetch Services
      let servicesCount = 0;
      try {
        const servicesSnap = await getDocs(collection(db, 'services'));
        servicesCount = servicesSnap.size;
        const srvs: any[] = [];
        servicesSnap.forEach(d => srvs.push({ id: d.id, ...d.data() }));
        localStorage.setItem('cms_local_services', JSON.stringify(srvs));
      } catch (err) {
        console.warn('Overview services fetch failed, loading local:', err);
        const saved = localStorage.getItem('cms_local_services');
        servicesCount = saved ? JSON.parse(saved).length : 2;
      }

      // 4. Fetch Testimonials
      let testimonialsCount = 0;
      try {
        const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
        testimonialsCount = testimonialsSnap.size;
        const tests: any[] = [];
        testimonialsSnap.forEach(d => tests.push({ id: d.id, ...d.data() }));
        localStorage.setItem('cms_local_testimonials', JSON.stringify(tests));
      } catch (err) {
        console.warn('Overview testimonials fetch failed, loading local:', err);
        const saved = localStorage.getItem('cms_local_testimonials');
        testimonialsCount = saved ? JSON.parse(saved).length : 1;
      }

      // 5. Fetch Messages
      let unreadCount = 0;
      try {
        const messagesSnap = await getDocs(collection(db, 'messages'));
        const msgs: any[] = [];
        messagesSnap.forEach(d => {
          msgs.push({ id: d.id, ...d.data() });
          if (!d.data().read) unreadCount++;
        });
        localStorage.setItem('cms_local_messages', JSON.stringify(msgs));
      } catch (err) {
        console.warn('Overview messages fetch failed, loading local:', err);
        const saved = localStorage.getItem('cms_local_messages');
        if (saved) {
          const msgs = JSON.parse(saved);
          unreadCount = msgs.filter((m: any) => !m.read).length;
        } else {
          unreadCount = 1;
        }
      }

      // 6. Fetch Clients
      let clientsCount = 0;
      try {
        const clientsSnap = await getDocs(collection(db, 'clients'));
        clientsCount = clientsSnap.size;
      } catch (err) {
        const saved = localStorage.getItem('cms_local_clients');
        clientsCount = saved ? JSON.parse(saved).length : 2;
      }

      // Stats Calculations
      const publishedProjectsCount = projectsList.filter(p => p.published).length;
      const publishedBlogPostsCount = postsList.filter(p => p.published).length;

      setStats({
        totalProjects: projectsList.length,
        publishedProjects: publishedProjectsCount,
        draftProjects: projectsList.length - publishedProjectsCount,
        totalBlogPosts: postsList.length,
        publishedBlogPosts: publishedBlogPostsCount,
        draftBlogPosts: postsList.length - publishedBlogPostsCount,
        unreadMessages: unreadCount,
        totalServices: servicesCount,
        totalTestimonials: testimonialsCount,
        totalClients: clientsCount
      });

      // Sort recent
      const sortedProjs = [...projectsList].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).slice(0, 3);
      const sortedPosts = [...postsList].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).slice(0, 3);
      
      setRecentProjects(sortedProjs);
      setRecentPosts(sortedPosts);

    } catch (err) {
      console.error('Failed to compile admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedData = async () => {
    const confirmSeed = window.confirm(
      language === 'ar'
        ? 'هل تريد ملء قاعدة البيانات بالمشاريع والمقالات التلقائية؟'
        : 'Do you want to seed initial projects and blog posts from static files to your Firestore database?'
    );
    if (!confirmSeed) return;

    setIsSeeding(true);
    try {
      // Seed Projects
      for (const proj of projectItems) {
        const docRef = doc(db, 'projects', proj.slug);
        await setDoc(docRef, {
          slug: proj.slug,
          title: proj.title,
          description: proj.description,
          category: proj.category,
          year: proj.year,
          technologies: proj.technologies,
          status: proj.status,
          githubUrl: proj.githubUrl || '',
          liveUrl: proj.liveUrl || '',
          featured: true,
          published: true,
          order: 1,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      // Seed Blog Posts
      for (const post of contentItems) {
        const docRef = doc(db, 'blogPosts', post.slug);
        await setDoc(docRef, {
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          excerpt: post.description,
          category: post.category,
          tags: post.tags,
          author: language === 'ar' ? 'أبو السعود' : 'Abu Al-Saud',
          published: true,
          featured: post.featured || false,
          coverImage: '',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
      await fetchStats();
    } catch (err) {
      console.error('Error seeding data:', err);
      alert(language === 'ar' ? 'فشل إدخال البيانات المبدئية' : 'Failed to seed initial data.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-start">
      
      {/* Overview Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
            {language === 'ar' ? 'نظرة عامة على النظام' : 'Dashboard Overview'}
          </h1>
          <p className="text-sm text-[#9AA4B2] mt-1">
            {language === 'ar' 
              ? 'متابعة إحصائيات المحتوى، التفاعل المباشر، وحالة النظام بشكل فوري.'
              : 'Monitor real-time content analytics, contact interactions, and system telemetry.'}
          </p>
        </div>
      </div>

      {seedSuccess && (
        <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">
            {language === 'ar' ? 'تم نسخ البيانات التجريبية بنجاح إلى Firestore!' : 'Initial portfolio data successfully seeded to Firestore!'}
          </span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Projects Stats Card */}
        <div 
          onClick={() => onNavigate('projects')}
          className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between text-[#9AA4B2] group-hover:text-[#5B7CFA] transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'المشاريع' : 'Projects'}
            </span>
            <div className="p-2.5 rounded-xl bg-[#111722] border border-[#202735]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#F3F5F7]">{stats.totalProjects}</div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9AA4B2] font-mono">
              <span className="text-[#10B981]">{stats.publishedProjects} {language === 'ar' ? 'منشور' : 'published'}</span>
              <span className="text-[#64748B]">•</span>
              <span>{stats.draftProjects} {language === 'ar' ? 'مسودة' : 'drafts'}</span>
            </div>
          </div>
        </div>

        {/* Blog Posts Card */}
        <div 
          onClick={() => onNavigate('blog')}
          className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between text-[#9AA4B2] group-hover:text-[#5B7CFA] transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'المدونة والمقالات' : 'Blog Posts'}
            </span>
            <div className="p-2.5 rounded-xl bg-[#111722] border border-[#202735]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#F3F5F7]">{stats.totalBlogPosts}</div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9AA4B2] font-mono">
              <span className="text-[#10B981]">{stats.publishedBlogPosts} {language === 'ar' ? 'منشور' : 'published'}</span>
              <span className="text-[#64748B]">•</span>
              <span>{stats.draftBlogPosts} {language === 'ar' ? 'مسودة' : 'drafts'}</span>
            </div>
          </div>
        </div>

        {/* Unread Messages Card */}
        <div 
          onClick={() => onNavigate('messages')}
          className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between text-[#9AA4B2] group-hover:text-[#5B7CFA] transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
            </span>
            <div className="p-2.5 rounded-xl bg-[#111722] border border-[#202735] relative">
              <MessageSquare className="w-4 h-4" />
              {stats.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
              )}
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#F3F5F7]">{stats.unreadMessages}</div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-red-400 font-medium">
              <span>{stats.unreadMessages > 0 ? (language === 'ar' ? 'بحاجة لمراجعة' : 'awaiting reply') : (language === 'ar' ? 'لا يوجد رسائل غير مقروءة' : 'all caught up')}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Items (Services/Testimonials) */}
        <div 
          onClick={() => onNavigate('services')}
          className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between text-[#9AA4B2] group-hover:text-[#5B7CFA] transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {language === 'ar' ? 'الخدمات والتوصيات' : 'Services & Reviews'}
            </span>
            <div className="p-2.5 rounded-xl bg-[#111722] border border-[#202735]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#F3F5F7]">
              {stats.totalServices + stats.totalTestimonials}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9AA4B2] font-mono">
              <span>{stats.totalServices} {language === 'ar' ? 'خدمات' : 'services'}</span>
              <span className="text-[#64748B]">•</span>
              <span>{stats.totalTestimonials} {language === 'ar' ? 'توصيات' : 'testimonials'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Financial Operations & Client Vault */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('clients')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-amber-500/20 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#F3F5F7]">
                  {language === 'ar' ? 'سجل وخزنة العملاء' : 'Clients & Vault'}
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 font-mono">
                  {stats.totalClients}
                </span>
              </div>
              <p className="text-[11px] text-[#9AA4B2]">
                {language === 'ar' ? 'سجل بيانات العملاء، الهواتف، كلمات المرور، والـ cPanel' : 'Manage client phones, encrypted credentials & passwords'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        <div 
          onClick={() => onNavigate('quotations')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-[#5B7CFA]/20 hover:border-[#5B7CFA] transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#5B7CFA]/15 text-[#5B7CFA] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'عروض الأسعار (Quotations)' : 'Create & Manage Quotations'}
              </h4>
              <p className="text-[11px] text-[#9AA4B2]">
                {language === 'ar' ? 'إعداد عروض أسعار تفصيلية للعملاء وتحويلها لفواتير' : 'Create professional client quotes & convert to invoices'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#5B7CFA] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        <div 
          onClick={() => onNavigate('invoices')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-[#10B981]/20 hover:border-[#10B981] transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'الفواتير والمطالبات (Invoices)' : 'Billing & Invoice Tracking'}
              </h4>
              <p className="text-[11px] text-[#9AA4B2]">
                {language === 'ar' ? 'متابعة الدفعات ومشاركة فواتير PDF عبر واتساب' : 'Track payment statuses & print PDF invoices'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#10B981] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>


      {/* Overview Analytics Details (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Projects list */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#5B7CFA]" />
              <h3 className="text-base font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'آخر المشاريع المضافة' : 'Recent Added Projects'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-[#5B7CFA] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{language === 'ar' ? 'إدارة الكل' : 'Manage All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading recent projects...'}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B] bg-[#111722]/50 rounded-xl border border-[#202735] border-dashed">
              {language === 'ar' ? 'لا توجد مشاريع مضافة حتى الآن.' : 'No projects added yet.'}
            </div>
          ) : (
            <div className="divide-y divide-[#202735]">
              {recentProjects.map((p) => (
                <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F3F5F7]">{p.title[language] || p.title.ar}</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        p.published ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {p.published ? (language === 'ar' ? 'منشور' : 'live') : (language === 'ar' ? 'مسودة' : 'draft')}
                      </span>
                    </div>
                    <p className="text-xs text-[#9AA4B2] line-clamp-1">{p.description[language] || p.description.ar}</p>
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono whitespace-nowrap">{p.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Blog Posts list */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B7CFA]" />
              <h3 className="text-base font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'آخر المقالات المنشورة' : 'Recent Published Articles'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="text-xs text-[#5B7CFA] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{language === 'ar' ? 'إدارة الكل' : 'Manage All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading recent posts...'}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B] bg-[#111722]/50 rounded-xl border border-[#202735] border-dashed">
              {language === 'ar' ? 'لا توجد مقالات مضافة حتى الآن.' : 'No blog posts added yet.'}
            </div>
          ) : (
            <div className="divide-y divide-[#202735]">
              {recentPosts.map((post) => (
                <div key={post.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F3F5F7]">{post.title[language] || post.title.ar}</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        post.published ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {post.published ? (language === 'ar' ? 'منشور' : 'live') : (language === 'ar' ? 'مسودة' : 'draft')}
                      </span>
                    </div>
                    <p className="text-xs text-[#9AA4B2] line-clamp-1">{post.description[language] || post.description.ar}</p>
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    <span>{post.category}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
