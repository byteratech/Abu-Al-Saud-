import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ProjectItem } from '../../types';
import { projectItems } from '../../data/projects';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  ExternalLink, 
  Github, 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface CaseStudyViewProps {
  slug: string;
  onBack: () => void;
}

export const CaseStudyView: React.FC<CaseStudyViewProps> = ({ slug, onBack }) => {
  const { language, dir, localize, t } = useLanguage();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    // Search local cache or static first
    let found: ProjectItem | null = projectItems.find(item => item.slug === slug) || null;
    if (!found) {
      try {
        const saved = localStorage.getItem('cms_local_projects');
        if (saved) {
          const list = JSON.parse(saved);
          found = list.find((item: any) => item.slug === slug) || null;
        }
      } catch (_) {}
    }
    setProject(found);

    const fetchProjectLive = async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        let foundLive: ProjectItem | null = null;
        snap.forEach(doc => {
          const data = doc.data();
          if (data.slug === slug) {
            foundLive = { id: doc.id, ...data } as ProjectItem;
          }
        });
        if (foundLive) {
          setProject(foundLive);
        }
      } catch (err) {
        console.warn('Failed to fetch project study live:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectLive();
  }, [slug]);

  if (isLoading && !project) {
    return (
      <div className="pt-32 text-center text-[#9AA4B2]">
        <p>{language === 'ar' ? 'جاري تحميل تفاصيل المشروع...' : 'Loading project details...'}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 text-center text-[#9AA4B2]">
        <p>{language === 'ar' ? 'المشروع غير موجود.' : 'Project not found.'}</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#5B7CFA] hover:underline">
          {t.projects.backToProjects}
        </button>
      </div>
    );
  }

  const cs = project.caseStudy;

  if (!cs) {
    return (
      <div className="pt-32 text-center text-[#9AA4B2]">
        <p>{language === 'ar' ? 'دراسة الحالة غير متوفرة لهذا المشروع.' : 'Case study not available.'}</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#5B7CFA] hover:underline">
          {t.projects.backToProjects}
        </button>
      </div>
    );
  }

  return (
    <div id="case-study-page" className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 border-b border-[#202735] pb-4">
        <button
          id="case-study-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.projects.backToProjects}</span>
        </button>

        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#9AA4B2] hover:text-[#F3F5F7] px-3 py-1.5 rounded-lg bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all"
            >
              <Github className="w-3.5 h-3.5" />
              <span>{t.projects.viewGithub}</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg bg-[#5B7CFA] hover:bg-[#4B6EF5] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.projects.viewLive}</span>
            </a>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="space-y-6 text-start">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-[#111722] border border-[#202735] text-[#5B7CFA]">
            {t.projects.categories[project.category]}
          </span>
          <span className="text-[#64748B] ms-auto">
            {project.year}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight leading-tight">
          {localize(project.title)}
        </h1>

        <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed">
          {localize(project.description)}
        </p>

        {/* Technologies List */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#202735] text-xs font-mono">
          <span className="text-[#64748B] me-1">{t.common.technologies}:</span>
          {project.technologies.map((tech, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded bg-[#111722] border border-[#202735] text-[#F3F5F7]">
              {tech}
            </span>
          ))}
        </div>
      </header>

      {/* Case Study Deep Dive Main Content */}
      <main className="space-y-10 text-start">
        
        {/* Overview */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
          <h2 className="text-lg font-bold text-[#F3F5F7]">
            {t.projects.caseStudySections.overview}
          </h2>
          <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
            {localize(cs.overview)}
          </p>
        </section>

        {/* Problem & Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{t.projects.caseStudySections.problem}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.problem)}
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-base font-bold text-[#5B7CFA] flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{t.projects.caseStudySections.context}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.context)}
            </p>
          </section>
        </div>

        {/* Research & Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-base font-bold text-purple-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>{t.projects.caseStudySections.research}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.research)}
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-base font-bold text-[#10B981] flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>{t.projects.caseStudySections.strategy}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.strategy)}
            </p>
          </section>
        </div>

        {/* Architecture / Design & Implementation */}
        <section className="space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#5B7CFA]" />
              <span>{t.projects.caseStudySections.designOrArchitecture}</span>
            </h2>
            <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
              {localize(cs.designOrArchitecture)}
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-lg font-bold text-[#F3F5F7]">
              {t.projects.caseStudySections.implementation}
            </h2>
            <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
              {localize(cs.implementation)}
            </p>
          </div>
        </section>

        {/* Challenges & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-base font-bold text-amber-400">
              {t.projects.caseStudySections.challenges}
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.challenges)}
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-3">
            <h2 className="text-base font-bold text-[#10B981]">
              {t.projects.caseStudySections.solution}
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.solution)}
            </p>
          </section>
        </div>

        {/* Results & Lessons */}
        <section className="p-6 sm:p-7 rounded-2xl bg-[#111722] border border-[#202735] space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#10B981] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.projects.caseStudySections.results}</span>
            </h2>
            <p className="text-sm text-[#F3F5F7] leading-relaxed font-medium">
              {localize(cs.results)}
            </p>
          </div>

          <div className="pt-4 border-t border-[#202735] space-y-2">
            <h3 className="text-sm font-bold text-[#5B7CFA]">
              {t.projects.caseStudySections.lessonsLearned}
            </h3>
            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {localize(cs.lessonsLearned)}
            </p>
          </div>
        </section>

      </main>

      {/* Bottom Back Button */}
      <div className="pt-6 text-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-xs font-medium text-[#F3F5F7] transition-all cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.projects.backToProjects}</span>
        </button>
      </div>

    </div>
  );
};
