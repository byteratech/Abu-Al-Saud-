import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ContentItem, ContentType } from '../../types';
import { contentItems } from '../../data/content';
import { CommentsSection } from './CommentsSection';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Tag, 
  Share2, 
  Check, 
  Copy, 
  BookOpen,
  User,
  Shield
} from 'lucide-react';

interface ArticleViewProps {
  slug: string;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ slug, onBack, onSelectArticle }) => {
  const { language, dir, localize, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [article, setArticle] = useState<ContentItem | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    // 1. Initial local/static load
    let found: ContentItem | null = contentItems.find(item => item.slug === slug) || null;
    let localAll: ContentItem[] = [...contentItems];
    if (!found) {
      try {
        const saved = localStorage.getItem('cms_local_blogPosts');
        if (saved) {
          const list = JSON.parse(saved).map((data: any) => ({
            id: data.id,
            slug: data.slug || data.id,
            category: data.category || 'General',
            type: (data.type || 'article') as ContentType,
            date: data.publishedAt || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            readingTime: data.readingTime || 5,
            featured: !!data.featured,
            tags: data.tags || [],
            title: data.title,
            description: data.description || data.excerpt,
            content: data.content
          }));
          found = list.find((item: any) => item.slug === slug) || null;
          localAll = list;
        }
      } catch (_) {}
    }
    setArticle(found);
    if (found) {
      const rel = localAll.filter(item => item.slug !== found?.slug && item.category === found?.category).slice(0, 2);
      setRelatedArticles(rel);
    }

    // 2. Load live from Firestore
    const fetchArticleLive = async () => {
      try {
        const snap = await getDocs(collection(db, 'blogPosts'));
        let foundLive: ContentItem | null = null;
        const allLive: ContentItem[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.published) {
            const mapped = {
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
            } as ContentItem;
            allLive.push(mapped);
            if (data.slug === slug) {
              foundLive = mapped;
            }
          }
        });

        if (foundLive) {
          setArticle(foundLive);
          const rel = allLive.filter(item => item.slug !== (foundLive as ContentItem).slug && item.category === (foundLive as ContentItem).category).slice(0, 2);
          setRelatedArticles(rel);
        }
      } catch (err) {
        console.warn('Failed to load article details from Firestore:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticleLive();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: localize(article.title),
      text: localize(article.description),
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // User cancelled share
        }
      }
    }

    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopySnippet = (text: string, index: number) => {
    try {
      navigator.clipboard.writeText(text);
      setCodeCopied(index);
      setTimeout(() => setCodeCopied(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Helper to render formatted article text with proper code blocks
  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLanguage = '';
    let blockIndex = 0;

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim() || 'text';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeString = codeBuffer.join('\n');
          const currentBlock = blockIndex++;
          elements.push(
            <div key={`code-${index}`} className="my-6 rounded-xl bg-[#080B12] border border-[#202735] overflow-hidden not-prose" dir="ltr">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111722] border-b border-[#202735] text-xs text-[#9AA4B2] font-mono">
                <span>{codeLanguage}</span>
                <button
                  onClick={() => handleCopySnippet(codeString, currentBlock)}
                  className="flex items-center gap-1.5 hover:text-[#F3F5F7] transition-colors py-0.5 px-2 rounded bg-[#151B26] border border-[#202735]"
                >
                  {codeCopied === currentBlock ? (
                    <>
                      <Check className="w-3 h-3 text-[#10B981]" />
                      <span className="text-[#10B981]">{t.common.copiedCode}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{t.common.copyCode}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-[#F3F5F7] overflow-x-auto leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl sm:text-2xl font-bold text-[#F3F5F7] mt-8 mb-4">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl sm:text-3xl font-extrabold text-[#F3F5F7] mt-10 mb-5">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="ms-6 list-disc text-sm sm:text-base text-[#9AA4B2] my-1.5 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.startsWith('---')) {
        elements.push(<hr key={index} className="my-8 border-[#202735]" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={index} className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed my-3">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  if (isLoading && !article) {
    return (
      <div className="pt-32 text-center text-[#9AA4B2]">
        <p>{language === 'ar' ? 'جاري تحميل تفاصيل المقال...' : 'Loading publication details...'}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-32 text-center text-[#9AA4B2]">
        <p>{language === 'ar' ? 'المقال غير موجود.' : 'Publication not found.'}</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#5B7CFA] hover:underline">
          {t.content.backToContent}
        </button>
      </div>
    );
  }

  return (
    <div id="article-detail-page" className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative">
      
      {/* Animated Reading Progress Bar */}
      <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 h-1 bg-[#202735] overflow-hidden rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-[#5B7CFA] to-[#10B981] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 border-b border-[#202735] pb-4">
        <button
          id="article-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.content.backToContent}</span>
        </button>

        <button
          id="article-share-btn"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA4B2] hover:text-[#F3F5F7] px-3 py-1.5 rounded-lg bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#10B981] font-medium">{t.content.copied}</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#5B7CFA]" />
              <span>{t.content.share}</span>
            </>
          )}
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-6 text-start">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#111722] border border-[#202735] text-[#5B7CFA]">
            {article.category}
          </span>
          <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-[#151B26] text-[#64748B]">
            {t.content.types[article.type]}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight leading-tight">
          {localize(article.title)}
        </h1>

        <p className="text-base sm:text-lg text-[#9AA4B2] leading-relaxed">
          {localize(article.description)}
        </p>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#202735] text-xs font-mono text-[#64748B]">
          <div className="flex items-center gap-2 text-[#9AA4B2]">
            <User className="w-4 h-4 text-[#5B7CFA]" />
            <span>{t.brand.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{article.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{article.readingTime} {t.content.readingTime}</span>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <main className="text-start space-y-4 pt-4 border-t border-[#202735]/60">
        {renderFormattedContent(article.content[language] || article.content.ar)}
      </main>

      {/* Tags */}
      <div className="pt-8 border-t border-[#202735] flex flex-wrap items-center gap-2 text-start">
        <Tag className="w-4 h-4 text-[#5B7CFA] me-1" />
        {article.tags.map((tag, idx) => (
          <span
            key={idx}
            className="text-xs font-mono px-3 py-1 rounded-md bg-[#111722] border border-[#202735] text-[#9AA4B2]"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Comments Section */}
      <CommentsSection articleSlug={article.slug} />

      {/* Related Content */}
      {relatedArticles.length > 0 && (
        <div className="pt-12 border-t border-[#202735] space-y-6 text-start">
          <h3 className="text-lg font-bold text-[#F3F5F7]">
            {t.content.relatedContent}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel.slug)}
                className="p-5 rounded-xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all cursor-pointer group space-y-2"
              >
                <span className="text-[10px] font-mono text-[#5B7CFA] uppercase">{rel.category}</span>
                <h4 className="text-sm font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors line-clamp-2">
                  {localize(rel.title)}
                </h4>
                <p className="text-xs text-[#64748B] line-clamp-2">
                  {localize(rel.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="pt-6 text-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-xs font-medium text-[#F3F5F7] transition-all cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.content.backToContent}</span>
        </button>
      </div>

    </div>
  );
};
