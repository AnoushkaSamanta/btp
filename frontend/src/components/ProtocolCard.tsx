import {
  Clock,
  BookOpen,
  Download,
  ExternalLink,
  Eye,
  Star,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import type { ResourceItem } from '@/types';

interface ProtocolCardProps {
  resource: ResourceItem;
  onPreview: (resource: ResourceItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (resource: ResourceItem) => void;
}

export function ProtocolCard({
  resource,
  onPreview,
  isFavorite,
  onToggleFavorite,
  onClick,
}: ProtocolCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-primary-400/80 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group relative">
      {/* Top row: Category, Badges, and Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {resource.category}
            </span>
            {resource.isNew && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                New
              </span>
            )}
            {resource.updatedDate && (
              <span className="text-[10px] text-slate-400 font-medium">
                {resource.updatedDate}
              </span>
            )}
          </div>

          {/* Favorite / Bookmark toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(resource.id);
            }}
            aria-label={isFavorite ? 'Remove bookmark' : 'Bookmark protocol'}
            className={`p-1 rounded-md transition-colors ${
              isFavorite
                ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50 opacity-60 group-hover:opacity-100'
            }`}
            title={isFavorite ? 'Bookmarked' : 'Add to bookmarks'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-slate-900 text-base mb-1.5 group-hover:text-primary-700 transition-colors">
          <button
            type="button"
            onClick={() => onClick(resource)}
            className="text-left w-full hover:underline focus:outline-none"
          >
            {resource.title}
          </button>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
          {resource.description}
        </p>

        {/* Source citation */}
        {resource.officialSource && (
          <p
            className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 mb-4 truncate"
            title={resource.officialSource}
          >
            Ref: {resource.officialSource}
          </p>
        )}
      </div>

      {/* Footer info & 3 action buttons */}
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

        {/* 3 Buttons: Preview, Download, External */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 1. Preview */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(resource);
            }}
            aria-label={`Preview PDF for ${resource.title}`}
            title="Preview official protocol PDF"
            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 border border-slate-200/80 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* 2. Download */}
          <a
            href={`/api/protocols/${resource.id}/pdf`}
            download
            aria-label={`Download PDF for ${resource.title}`}
            title="Download local official PDF"
            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 border border-slate-200/80 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
          </a>

          {/* 3. External */}
          <a
            href={resource.officialUrl || resource.officialPortal || 'https://nhm.gov.in/'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={resource.linkTooltip || `Open official website for ${resource.title}`}
            title={resource.linkTooltip || 'Open official website'}
            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-slate-200/80 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
