import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ArrowUpDown,
  Star,
  Clock,
  RotateCcw,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';
import { resources } from '@/data';
import type { ResourceItem } from '@/types';
import { getPreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import { ProtocolCard } from './ProtocolCard';
import { ProtocolPreview } from './ProtocolPreview';

type SortOption = 'name' | 'duration' | 'category' | 'recent';

const categories = [
  'All',
  'Favorites',
  'Maternal Health',
  'Emergency Care',
  'Child Health',
  'Nutrition',
  'Reproductive Health',
];

export function Resources() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(() => getPreferences().language);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('asha-fav-protocols');
      return stored ? JSON.parse(stored) : ['r1', 'r3'];
    } catch {
      return ['r1', 'r3'];
    }
  });

  // Recently viewed stored in localStorage
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('asha-recent-protocols');
      return stored ? JSON.parse(stored) : ['r1', 'r3'];
    } catch {
      return ['r1', 'r3'];
    }
  });

  // Pagination (8 items per page, ready for 8+ records)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const handlePrefChange = () => setLang(getPreferences().language);
    window.addEventListener('asha-preferences-changed', handlePrefChange);
    return () => window.removeEventListener('asha-preferences-changed', handlePrefChange);
  }, []);

  // Simulate smooth loading transition
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('asha-fav-protocols', JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  const markRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 4);
      try {
        localStorage.setItem('asha-recent-protocols', JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  const handleOpenPreview = (item: ResourceItem) => {
    markRecentlyViewed(item.id);
    setPreviewResource(item);
  };

  const handleOpenDetailModal = (item: ResourceItem) => {
    markRecentlyViewed(item.id);
    setSelectedResource(item);
  };

  // Filter & Search
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      // Favorites filter
      if (activeCategory === 'Favorites') {
        if (!favorites.includes(r.id)) return false;
      } else if (activeCategory !== 'All' && r.category !== activeCategory) {
        return false;
      }

      // Search matching title, description, or official source
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchSource = (r.officialSource || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSource) return false;
      }

      return true;
    });
  }, [search, activeCategory, favorites]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'duration') {
        return (a.readMinutes || 8) - (b.readMinutes || 8);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === 'recent') {
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      }
      return 0;
    });
  }, [filtered, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Recently viewed protocol objects
  const recentItems = useMemo(() => {
    return recentlyViewed
      .map((id) => resources.find((r) => r.id === id))
      .filter((r): r is ResourceItem => !!r);
  }, [recentlyViewed]);

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-2 py-2">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Clinical Protocols & Guidelines
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              National Health Mission (NHM) & MoHFW evidence-based operational reference manuals and standard operating procedures
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://nhm.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shadow-2xs flex items-center gap-1.5 transition-all"
              title="Open Official National Health Mission Portal (nhm.gov.in)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              Visit Official Portal
            </a>
          </div>
        </div>

        {/* Recently Viewed Bar */}
        {recentItems.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Recently viewed:
            </span>
            {recentItems.map((item, idx) => (
              <span key={item.id} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(item)}
                  className="font-medium text-primary-700 hover:text-primary-800 hover:underline"
                >
                  {item.title}
                </button>
                {idx < recentItems.length - 1 && <span className="text-slate-300 mx-1.5">•</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guidelines by condition, protocol, or keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500 transition-colors shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="relative inline-flex items-center shrink-0">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort protocols"
            className="pl-8 pr-7 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:border-primary-500 transition-all cursor-pointer shadow-2xs"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="duration">Sort: Duration (Short to Long)</option>
            <option value="category">Sort: Category</option>
            <option value="recent">Sort: Most Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Filter Pills with Consistent Styling */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap border ${
                isActive
                  ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-primary-50 hover:text-primary-800 hover:border-primary-200'
              }`}
            >
              {cat === 'Favorites' ? `⭐ Favorites (${favorites.length})` : cat}
            </button>
          );
        })}
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-0.5">
        <span>
          Showing {paginated.length} of {sorted.length} protocols
          {search ? ` matching "${search}"` : ''}
        </span>
        {activeCategory !== 'All' && (
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className="text-primary-700 font-semibold hover:underline"
          >
            Show all categories
          </button>
        )}
      </div>

      {/* Protocol Cards Grid / Skeleton Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 h-48 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
              <div className="h-8 bg-slate-100 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((resource) => (
            <ProtocolCard
              key={resource.id}
              resource={resource}
              onPreview={handleOpenPreview}
              onClick={handleOpenDetailModal}
              isFavorite={favorites.includes(resource.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-4">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No protocols found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? `No medical guidelines matched your search for "${search}". Try checking for spelling or searching for a general topic.`
              : 'No items currently in this category.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Clear Filters & Search
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              type="button"
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                currentPage === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PDF Iframe Modal Preview */}
      <ProtocolPreview
        protocol={previewResource}
        onClose={() => setPreviewResource(null)}
        isFavorite={previewResource ? favorites.includes(previewResource.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Detail Modal (Legacy trigger from title click) */}
      {selectedResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="card-elevated max-w-xl w-full p-6 space-y-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                  {selectedResource.category}
                </span>
                <h3 className="text-lg font-display font-bold mt-2">{selectedResource.title}</h3>
                {selectedResource.officialSource && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Source: {selectedResource.officialSource}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{selectedResource.description}</p>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = selectedResource;
                  setSelectedResource(null);
                  handleOpenPreview(target);
                }}
                className="btn-primary flex items-center gap-1.5 text-xs py-2"
              >
                <Eye className="w-4 h-4" /> Preview Official Document
              </button>
              <a
                href={selectedResource.officialUrl || selectedResource.officialPortal || 'https://nhm.gov.in/'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Official Website
              </a>
              <a
                href={`/api/protocols/${selectedResource.id}/pdf`}
                download
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
