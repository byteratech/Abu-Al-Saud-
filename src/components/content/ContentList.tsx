import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { contentItems } from '../../data/content';
import { ContentType, ActiveView, ContentItem } from '../../types';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  FileText, 
  Search, 
  Clock, 
  Calendar, 
  Tag, 
  ArrowLeft, 
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ContentListProps {
  onSelectArticle: (slug: string) => void;
}

export const ContentList: React.FC<ContentListProps> = ({ onSelectArticle }) => {
  const { language, dir, localize, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    let currentList = [...contentItems];
    try {
      const saved = localStorage.getItem('cms_local_blogPosts');
      if (saved) {
        currentList = JSON.parse(saved);
      }
    } catch (_) {}
    setItems(currentList);

    const fetchLiveArticles = async () => {
      try {
        const snap = await getDocs(collection(db, 'blogPosts'));
        const list: ContentItem[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.published) {
            // Map CMSBlogPost to ContentItem structure
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
          setItems(list);
          try {
            localStorage.setItem('cms_local_blogPosts', JSON.stringify(list));
          } catch (_) {}
        } else if (contentItems.length === 0) {
          setItems([]);
        }
      } catch (err) {
        console.warn('Failed to load published blog posts from Firestore:', err);
      }
    };
    fetchLiveArticles();
  }, []);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => set.add(item.category));
    return Array.from(set);
  }, [items]);

  const types: { id: ContentType | 'all'; label: string }[] = [
    { id: 'all', label: t.content.allTypes },
    { id: 'tutorial', label: t.content.types.tutorial },
    { id: 'article', label: t.content.types.article },
    { id: 'news', label: t.content.types.news },
    { id: 'update', label: t.content.types.update },
    { id: 'writeup', label: t.content.types.writeup },
    { id: 'research', label: t.content.types.research },
    { id: 'note', label: t.content.types.note },
  ];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = localize(item.title).toLowerCase();
        const desc = localize(item.description).toLowerCase();
        const tags = item.tags.join(' ').toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !tags.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedType, items, language]);

  return (
    <div id="content-page" className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 text-start">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#5B7CFA] uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>{t.content.title}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3F5F7] tracking-tight">
          {language === 'ar' ? 'المقالات والأبحاث التقنية' : 'Publications & Articles'}
        </h1>
        <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed max-w-3xl">
          {t.content.subtitle}
        </p>
      </div>

      {/* Discovery Filters Bar */}
      <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-5 text-start">
        
        {/* Top search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.content.searchPlaceholder}
            className="w-full bg-[#111722] border border-[#202735] text-sm text-[#F3F5F7] placeholder-[#64748B] ps-10 pe-4 py-2.5 rounded-xl focus:outline-none focus:border-[#5B7CFA] transition-colors"
          />
        </div>

        {/* Category & Type Pills */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-mono text-[#64748B] me-1">
              {language === 'ar' ? 'التصنيف:' : 'Category:'}
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#5B7CFA] text-white font-semibold'
                  : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
              }`}
            >
              {t.content.filterAll}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#5B7CFA] text-white font-semibold'
                    : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Types */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-mono text-[#64748B] me-1">
              {language === 'ar' ? 'النوع:' : 'Type:'}
            </span>
            {types.map(tp => (
              <button
                key={tp.id}
                onClick={() => setSelectedType(tp.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedType === tp.id
                    ? 'bg-[#151B26] text-[#5B7CFA] border border-[#5B7CFA]/40 font-semibold'
                    : 'bg-[#111722] text-[#64748B] hover:text-[#9AA4B2] border border-[#202735]'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Publications Grid */}
      <div className="space-y-6 text-start">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#9AA4B2] bg-[#0D111A] border border-[#202735] rounded-2xl space-y-3">
            <p>{t.content.emptyState}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="text-xs text-[#5B7CFA] hover:underline"
            >
              {t.content.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => onSelectArticle(item.slug)}
                className="p-6 sm:p-7 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                        {item.category}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#151B26] text-[#64748B]">
                        {t.content.types[item.type]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64748B]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.readingTime} {t.content.readingTime}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-[#F3F5F7] group-hover:text-[#5B7CFA] transition-colors leading-snug">
                    {localize(item.title)}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed line-clamp-3">
                    {localize(item.description)}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#202735]/60 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#5B7CFA] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>{t.content.readArticle}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
