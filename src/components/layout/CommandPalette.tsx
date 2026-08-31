import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { contentItems } from '../../data/content';
import { labItems } from '../../data/labs';
import { projectItems } from '../../data/projects';
import { ActiveView } from '../../types';
import { 
  Search, 
  X, 
  FileText, 
  FlaskConical, 
  Briefcase, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ActiveView) => void;
}

interface SearchResult {
  id: string;
  type: 'article' | 'lab' | 'project';
  title: string;
  category: string;
  snippet: string;
  slug: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setActiveView }) => {
  const { language, dir, localize, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open from parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items
  const results: SearchResult[] = React.useMemo(() => {
    if (!query.trim()) {
      // Show default top items
      const topArticles: SearchResult[] = contentItems.slice(0, 3).map(item => ({
        id: item.id,
        type: 'article',
        title: localize(item.title),
        category: item.category,
        snippet: localize(item.description),
        slug: item.slug,
      }));
      const topLabs: SearchResult[] = labItems.slice(0, 2).map(item => ({
        id: item.id,
        type: 'lab',
        title: localize(item.title),
        category: item.category,
        snippet: localize(item.description),
        slug: item.slug,
      }));
      const topProjects: SearchResult[] = projectItems.slice(0, 2).map(item => ({
        id: item.id,
        type: 'project',
        title: localize(item.title),
        category: item.category,
        snippet: localize(item.description),
        slug: item.slug,
      }));
      return [...topArticles, ...topLabs, ...topProjects];
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    contentItems.forEach(item => {
      const title = localize(item.title).toLowerCase();
      const desc = localize(item.description).toLowerCase();
      const tags = item.tags.join(' ').toLowerCase();
      if (title.includes(q) || desc.includes(q) || tags.includes(q) || item.category.toLowerCase().includes(q)) {
        matches.push({
          id: item.id,
          type: 'article',
          title: localize(item.title),
          category: item.category,
          snippet: localize(item.description),
          slug: item.slug,
        });
      }
    });

    labItems.forEach(item => {
      const title = localize(item.title).toLowerCase();
      const desc = localize(item.description).toLowerCase();
      const topics = item.topics.join(' ').toLowerCase();
      if (title.includes(q) || desc.includes(q) || topics.includes(q) || item.category.toLowerCase().includes(q)) {
        matches.push({
          id: item.id,
          type: 'lab',
          title: localize(item.title),
          category: item.category,
          snippet: localize(item.description),
          slug: item.slug,
        });
      }
    });

    projectItems.forEach(item => {
      const title = localize(item.title).toLowerCase();
      const desc = localize(item.description).toLowerCase();
      const tech = item.technologies.join(' ').toLowerCase();
      if (title.includes(q) || desc.includes(q) || tech.includes(q)) {
        matches.push({
          id: item.id,
          type: 'project',
          title: localize(item.title),
          category: item.category,
          snippet: localize(item.description),
          slug: item.slug,
        });
      }
    });

    return matches;
  }, [query, language]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === 'article') {
      setActiveView({ type: 'content', slug: item.slug });
    } else if (item.type === 'lab') {
      setActiveView({ type: 'labs', slug: item.slug });
    } else if (item.type === 'project') {
      setActiveView({ type: 'projects', slug: item.slug });
    }
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        id="command-palette-modal"
        className="w-full max-w-2xl bg-[#0D111A] border border-[#202735] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#202735] gap-3 bg-[#111722]">
          <Search className="w-5 h-5 text-[#5B7CFA] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.common.searchAll}
            className="w-full bg-transparent text-[#F3F5F7] placeholder-[#64748B] text-sm focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-[#9AA4B2] hover:text-[#F3F5F7] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="font-mono text-[10px] bg-[#151B26] text-[#9AA4B2] px-2 py-0.5 rounded border border-[#202735] shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#202735]/40 max-h-[55vh]">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#9AA4B2]">
              {t.common.noSearchResults}
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.type === 'article' ? FileText : item.type === 'lab' ? FlaskConical : Briefcase;
              const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-3 group ${
                    isSelected ? 'bg-[#151B26] border border-[#5B7CFA]/30 text-white' : 'hover:bg-[#111722] text-[#9AA4B2]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-md shrink-0 ${
                      item.type === 'article' 
                        ? 'bg-blue-500/10 text-blue-400' 
                        : item.type === 'lab' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F3F5F7] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#111722] border border-[#202735] text-[#64748B]">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#9AA4B2] line-clamp-1">
                        {item.snippet}
                      </p>
                    </div>
                  </div>

                  <ArrowIcon className={`w-4 h-4 text-[#5B7CFA] shrink-0 transition-transform ${
                    isSelected ? 'translate-x-0.5 opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-[#080B12] border-t border-[#202735] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-[#111722] px-1 py-0.5 rounded border border-[#202735] font-mono">↑</kbd> <kbd className="bg-[#111722] px-1 py-0.5 rounded border border-[#202735] font-mono">↓</kbd> للتنقل</span>
            <span><kbd className="bg-[#111722] px-1 py-0.5 rounded border border-[#202735] font-mono">↵</kbd> للاختيار</span>
          </div>
          <span>Abu Al-Saud Digital Index</span>
        </div>
      </div>
    </div>
  );
};
