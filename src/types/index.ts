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
  facebook?: string;
  youtube?: string;
  instagram?: string;
  tiktok?: string;
  x?: string;
  whatsapp?: string;
  phone?: string;
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
    facebook?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    whatsapp?: string;
    phone?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords?: string;
  };
  language: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type SupportedCurrency = 'EGP' | 'USD' | 'SAR' | 'EUR' | 'AED';

export interface CMSQuotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  validUntil: string;
  currency: SupportedCurrency;
  items: LineItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  status: QuotationStatus;
  convertedInvoiceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CMSInvoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  quotationNumber?: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  currency: SupportedCurrency;
  items: LineItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: InvoiceStatus;
  paymentMethod?: string;
  paymentDetails?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSecurityConfig {
  adminEmail: string;
  adminPassword?: string;
  recoveryPhone: string;
  recoveryOtp?: string;
  recoveryOtpExpiresAt?: number;
  lastPasswordChangedAt?: string;
}

export type ClientStatus = 'active' | 'pending' | 'vip' | 'archived';

export type CredentialType = 
  | 'cpanel' 
  | 'hosting' 
  | 'wordpress' 
  | 'database' 
  | 'api_key' 
  | 'email_account' 
  | 'ftp' 
  | 'server_ssh' 
  | 'social_media' 
  | 'admin_panel' 
  | 'other';

export interface ClientCredential {
  id: string;
  type: CredentialType;
  title: string;
  url?: string;
  username?: string;
  password?: string;
  accessKey?: string;
  notes?: string;
}

export interface CMSClient {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  status: ClientStatus;
  serviceType?: string;
  totalRevenue?: number;
  currency?: SupportedCurrency;
  notes?: string;
  credentials: ClientCredential[];
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

