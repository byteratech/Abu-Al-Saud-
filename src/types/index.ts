export type Language = 'ar' | 'en';

export interface LocalizedText {
  ar: string;
  en: string;
}

export type ContentType = 'article' | 'writeup' | 'tutorial' | 'research' | 'note' | 'video' | 'news' | 'update';

export interface ContentItem {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: string;
  type: ContentType;
  date: string;
  readingTime: number; // in minutes
  tags: string[];
  featured?: boolean;
  content: {
    ar: string;
    en: string;
  };
  externalUrl?: string;
}

export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LabStatus = 'completed' | 'in_progress' | 'research' | 'archived';

export interface LabItem {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  platform: string; // e.g. "TryHackMe", "Local Lab", "HackTheBox", "PortSwigger"
  category: string;
  difficulty: LabDifficulty;
  status: LabStatus;
  date: string;
  topics: string[];
  technologies: string[];
  writeup: {
    overview: LocalizedText;
    objective: LocalizedText;
    environment: LocalizedText;
    methodology: LocalizedText;
    technicalInvestigation: LocalizedText;
    findings: LocalizedText;
    lessonsLearned: LocalizedText;
    references?: string[];
    codeSnippets?: {
      title: string;
      language: string;
      code: string;
      explanation?: LocalizedText;
    }[];
  };
}

export type ProjectCategory = 'design' | 'development' | 'security';
export type ProjectStatus = 'completed' | 'in_progress' | 'concept';

export interface CaseStudyData {
  overview: LocalizedText;
  problem: LocalizedText;
  context: LocalizedText;
  research: LocalizedText;
  strategy: LocalizedText;
  designOrArchitecture: LocalizedText;
  implementation: LocalizedText;
  challenges: LocalizedText;
  solution: LocalizedText;
  results: LocalizedText;
  lessonsLearned: LocalizedText;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: ProjectCategory;
  year: string;
  technologies: string[];
  status: ProjectStatus;
  highlightMetric?: LocalizedText;
  githubUrl?: string;
  liveUrl?: string;
  caseStudy?: CaseStudyData;
}

export interface SkillItem {
  name: string;
  levelLabel?: LocalizedText;
  description?: LocalizedText;
  tags?: string[];
}

export interface SkillCategory {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  skills: SkillItem[];
}

export interface JourneyStage {
  id: string;
  period: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  skills: string[];
  whatChanged: LocalizedText;
  whatLearned: LocalizedText;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
  x?: string;
  email: string;
}

export type ActiveView = 
  | { type: 'home' }
  | { type: 'about' }
  | { type: 'content'; slug?: string }
  | { type: 'projects'; slug?: string }
  | { type: 'services' }
  | { type: 'skills' }
  | { type: 'contact' }
  | { type: 'admin' };

export interface CMSProject {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: ProjectCategory;
  year: string;
  technologies: string[];
  status: ProjectStatus;
  highlightMetric?: LocalizedText;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  published: boolean;
  order: number;
  caseStudy?: CaseStudyData;
  createdAt: string;
}

export interface CMSBlogPost {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  content: LocalizedText;
  coverImage?: string;
  excerpt: LocalizedText;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface CMSService {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  published: boolean;
  order: number;
}

export interface CMSTestimonial {
  id: string;
  clientName: string;
  companyName?: string;
  content: LocalizedText;
  clientImage?: string;
  published: boolean;
}

export interface CMSMessage {
  id: string;
  senderName: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  websiteName: string;
  logo?: string;
  contactEmail: string;
  socials: {
    github?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    x?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords?: string;
  };
  language: string;
}
