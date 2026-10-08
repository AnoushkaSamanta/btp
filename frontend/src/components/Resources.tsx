import { useState } from 'react';
import { Search, ClipboardList, AlertTriangle, Syringe, HeartHandshake, Pill, Baby, Users, Activity, BookOpen, Clock, Download, Sparkles, X } from 'lucide-react';
import { resources } from '@/data';
import type { ResourceItem } from '@/types';
import { downloadText } from '@/lib/download';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const iconMap: Record<string, typeof BookOpen> = {
  ClipboardList,
  AlertTriangle,
  Syringe,
  HeartHandshake,
  Pill,
  Baby,
  Users,
  Activity,
};

const categoryColors: Record<string, string> = {
  'Maternal Health': 'from-primary-400 to-primary-600',
  'Emergency Care': 'from-error-400 to-error-600',
  'Child Health': 'from-sky-400 to-sky-600',
  'Nutrition': 'from-accent-400 to-accent-500',
  'Reproductive Health': 'from-success-400 to-success-600',
};

const categories = ['All', 'Maternal Health', 'Emergency Care', 'Child Health', 'Nutrition', 'Reproductive Health'];

export function Resources() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const filtered = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in max-w-7xl mx-auto relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-accent-200/20 top-40 -left-16" delay={2} />

      <div className="mb-6 relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
            <Sparkles className="w-3.5 h-3.5" />
            {filtered.length} Resources
          </span>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-slate-900">Resources</h2>
        <p className="text-slate-500 mt-1">Clinical protocols, guidelines, and training materials</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((resource, i) => {
          const Icon = iconMap[resource.icon] || BookOpen;
          const gradient = categoryColors[resource.category] || 'from-primary-400 to-primary-600';
          return (
            <div key={resource.id} className="glass-card card-hover p-5 text-left group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="stat-badge bg-slate-100 text-slate-600">
                  {resource.category}
                </span>
              </div>
              <h3 className="font-display font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">
                <button type="button" onClick={() => setSelectedResource(resource)} className="text-left">{resource.title}</button>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                {resource.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {resource.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {resource.language}
                  </span>
                </div>
                <button type="button" aria-label={`Download ${resource.title}`} onClick={() => downloadText(`${resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`, `${resource.title}\n${resource.category}\n\n${resource.description}\n\nDemo note: verify clinical information against current official guidance before use.`)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center transition-all active:scale-90">
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">No resources found matching your search.</p>
        </div>
      )}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="resource-title">
          <button type="button" aria-label="Close resource" className="absolute inset-0 bg-slate-900/50" onClick={() => setSelectedResource(null)} />
          <section className="relative card-elevated max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div><span className="stat-badge bg-primary-50 text-primary-700">{selectedResource.category}</span><h3 id="resource-title" className="text-xl font-display font-bold mt-3">{selectedResource.title}</h3></div>
              <button type="button" aria-label="Close" onClick={() => setSelectedResource(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{selectedResource.description}</p>
            <p className="text-xs text-slate-500">This demo resource is a summary. Check current official guidance before making care decisions.</p>
            <button type="button" className="btn-primary" onClick={() => downloadText(`${selectedResource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`, `${selectedResource.title}\n${selectedResource.category}\n\n${selectedResource.description}\n\nDemo note: verify clinical information against current official guidance before use.`)}><Download className="w-4 h-4" /> Download summary</button>
          </section>
        </div>
      )}
    </div>
  );
}
