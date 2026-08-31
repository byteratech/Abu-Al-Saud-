import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { projectItems } from '../../data/projects';
import { ProjectCategory, ProjectItem } from '../../types';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Briefcase, 
  Palette, 
  Code2, 
  ShieldCheck, 
  ExternalLink, 
  Github, 
  ArrowLeft, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProjectsListProps {
  onSelectProject: (slug: string) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ onSelectProject }) => {
  const { language, dir, localize, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    // Start with static projectItems fallback
    let currentList = [...projectItems];
    try {
      const saved = localStorage.getItem('cms_local_projects');
      if (saved) {
        currentList = JSON.parse(saved);
      }
    } catch (_) {}
    setProjects(currentList);

    const fetchLiveProjects = async () => {
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
          list.sort((a, b) => {
            const ordA = (a as any).order ?? 99;
            const ordB = (b as any).order ?? 99;
            return ordA - ordB;
          });
          setProjects(list);
          try {
            localStorage.setItem('cms_local_projects', JSON.stringify(list));
          } catch (_) {}
        } else if (projectItems.length === 0) {
          // Both Firestore and projectItems are empty
          setProjects([]);
        }
      } catch (err) {
        console.warn('Failed to load published projects from Firestore:', err);
      }
    };
    fetchLiveProjects();
  }, []);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
    all: Briefcase,
    design: Palette,
    development: Code2,
    security: ShieldCheck,
  };

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(p => p.category === selectedCategory);
  }, [selectedCategory, projects]);

  return (
    <div id="projects-page" className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 text-start">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <Briefcase className="w-4 h-4" />
          <span>{t.projects.title}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'المشاريع ودراسات الحالة' : 'Selected Works & Case Studies'}
        </h1>
        <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed max-w-3xl">
          {t.projects.subtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#202735] pb-6">
        {(['all', 'design', 'development', 'security'] as (ProjectCategory | 'all')[]).map((cat) => {
          const Icon = categoryIcons[cat] || Briefcase;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`project-filter-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#5B7CFA] text-white shadow-md font-semibold'
                  : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80" />
              <span>{t.projects.categories[cat]}</span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
        {filteredProjects.map((project) => {
          const CatIcon = categoryIcons[project.category] || Briefcase;
          return (
            <div
              key={project.id}
              className="p-7 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                      <CatIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-mono text-[11px] text-[#9AA4B2] uppercase">
                      {t.projects.categories[project.category]}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[#64748B]">
                    {project.year}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors leading-snug">
                  {localize(project.title)}
                </h2>

                <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
                  {localize(project.description)}
                </p>

                {/* Highlight Metric if available */}
                {project.highlightMetric && (
                  <div className="p-3 rounded-xl bg-[#111722] border border-[#202735] text-xs text-[#5B7CFA] font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{localize(project.highlightMetric)}</span>
                  </div>
                )}

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#151B26] text-[#9AA4B2] border border-[#202735]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

              </div>

              {/* Action Links */}
              <div className="pt-5 border-t border-[#202735]/60 flex items-center justify-between gap-3 text-xs">
                {project.caseStudy ? (
                  <button
                    onClick={() => onSelectProject(project.slug)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B7CFA] hover:text-[#4B6EF5] transition-colors cursor-pointer group/btn"
                  >
                    <span>{t.projects.viewCaseStudy}</span>
                    <ArrowIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                      title={t.projects.viewGithub}
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] transition-all"
                      title={t.projects.viewLive}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
