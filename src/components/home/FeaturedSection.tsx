import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { contentItems } from '../../data/content';
import { projectItems } from '../../data/projects';
import { ActiveView, ProjectItem, ContentItem, ContentType } from '../../types';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  FlaskConical, 
  Briefcase, 
  Clock, 
  Calendar, 
  ChevronRight,
  ChevronLeft,
  ShieldAlert
} from 'lucide-react';

interface FeaturedSectionProps {
  setActiveView: (view: ActiveView) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ setActiveView }) => {
  const { language, dir, localize, t } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = useState<ProjectItem[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ContentItem[]>([]);

  useEffect(() => {
    // 1. Initial local/static load for projects
    let initialProjs = [...projectItems];
    try {
      const savedProjs = localStorage.getItem('cms_local_projects');
      if (savedProjs) {
        initialProjs = JSON.parse(savedProjs);
      }
    } catch (_) {}
    setFeaturedProjects(initialProjs.slice(0, 2));

    // 2. Initial local/static load for articles
    let initialArts = [...contentItems].filter(item => item.featured);
    try {
      const savedArts = localStorage.getItem('cms_local_blogPosts');
      if (savedArts) {
        initialArts = JSON.parse(savedArts).filter((item: any) => item.featured);
      }
    } catch (_) {}
    setFeaturedArticles(initialArts.slice(0, 2));

    // 3. Fetch projects from Firestore
    const loadProjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        const list: ProjectItem[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.published) {
            list.push({ id: doc.id, ...data } as ProjectItem);
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => ((a as any).order ?? 99) - ((b as any).order ?? 99));
          setFeaturedProjects(list.slice(0, 2));
        } else if (projectItems.length === 0) {
          setFeaturedProjects([]);
        }
      } catch (err) {
        console.warn('Failed to fetch projects in FeaturedSection:', err);
      }
    };

    // 4. Fetch articles from Firestore
    const loadArticles = async () => {
      try {
        const snap = await getDocs(collection(db, 'blogPosts'));
        const list: ContentItem[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.published && data.featured) {
            list.push({
              id: doc.id,
              slug: data.slug || doc.id,
              category: data.category || 'General',
              type: (data.type || 'article') as ContentType,
              date: data.publishedAt || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
              readingTime: data.readingTime || 5,
              featured: !!data.featured,
              tags: data.tags || [],
              title: data.title,
              description: data.description || data.excerpt,
              content: data.content
            } as ContentItem);
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setFeaturedArticles(list.slice(0, 2));
        } else if (contentItems.length === 0) {
          setFeaturedArticles([]);
        }
      } catch (err) {
        console.warn('Failed to fetch articles in FeaturedSection:', err);
      }
    };

    loadProjects();
    loadArticles();
  }, []);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section id="featured-section" className="py-24 bg-[#0D111A] border-t border-[#202735]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section 1: Featured Projects */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-start">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>{t.projects.title}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'أعمال مختارة من المشاريع' : 'Selected Project Works'}
              </h2>
            </div>
            <button
              id="view-all-projects-btn"
              onClick={() => {
                setActiveView({ type: 'projects' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B7CFA] hover:text-[#4B6EF5] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'استعراض كل المشاريع' : 'Explore All Projects'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setActiveView({ type: 'projects', slug: project.slug });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-6 rounded-2xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 text-start"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#9AA4B2]">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#151B26] border border-[#202735] text-amber-400">
                      {t.projects.categories[project.category as keyof typeof t.projects.categories]}
                    </span>
                    <span className="font-mono text-[11px] text-[#64748B]">
                      {project.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors leading-snug">
                    {localize(project.title)}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed line-clamp-2">
                    {localize(project.description)}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#202735]/60 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span key={i} className="text-[10px] font-mono bg-[#151B26] px-2 py-0.5 rounded text-[#9AA4B2]">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="text-[#5B7CFA] font-medium group-hover:underline inline-flex items-center gap-1">
                    {t.projects.viewCaseStudy}
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Featured Articles */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-start">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>{t.content.title}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'مقالات وأبحاث تقنية مختارة' : 'Featured Publications & Insights'}
              </h2>
            </div>

            <button
              id="view-all-content-btn"
              onClick={() => {
                setActiveView({ type: 'content' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B7CFA] hover:text-[#4B6EF5] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'استعراض كل المقالات' : 'Explore All Publications'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  setActiveView({ type: 'content', slug: article.slug });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-6 rounded-2xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 text-start"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#9AA4B2]">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#151B26] border border-[#202735] text-purple-400">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#64748B]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readingTime} {t.content.readingTime}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors leading-snug">
                    {localize(article.title)}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed line-clamp-2">
                    {localize(article.description)}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#202735]/60 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{article.date}</span>
                  </div>
                  <span className="text-[#5B7CFA] font-medium group-hover:underline inline-flex items-center gap-1">
                    {t.content.readArticle}
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
