import React, { useState } from 'react';
import { BookOpen, Search, X, ExternalLink, Bookmark, ShieldAlert, Sparkles } from 'lucide-react';
import { resources } from '@/data';
import type { ResourceItem } from '@/types';

interface ProtocolSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export function ProtocolSidePanel({ isOpen, onClose, onSelectPrompt }: ProtocolSidePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<ResourceItem | null>(null);

  if (!isOpen) return null;

  const filtered = resources.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in-right">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-700 dark:text-primary-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">NHM Protocol Reference</h3>
              <p className="text-[11px] text-slate-500">Official guidance and standard operating procedures</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search protocols (e.g., ANC, anemia, high BP)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {selectedProtocol ? (
            <div className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => setSelectedProtocol(null)}
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to list
              </button>

              <div className="p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                  {selectedProtocol.category}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {selectedProtocol.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProtocol.description}
                </p>
                {selectedProtocol.officialSource && (
                  <p className="text-[11px] text-slate-400">
                    Source: {selectedProtocol.officialSource}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Key Clinical Rule
                </h5>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  Refer directly to Primary Health Centre (PHC) if BP systolic ≥ 140 mmHg, diastolic ≥ 90 mmHg, or if severe headache/blurring of vision occurs.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPrompt(`What is the NHM protocol guidance for ${selectedProtocol.title}?`);
                    onClose();
                  }}
                  className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Co-Pilot about this protocol
                </button>
                {selectedProtocol.officialUrl && (
                  <a
                    href={selectedProtocol.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost border border-slate-200 dark:border-slate-700 text-xs py-2 px-3 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open official NHM source
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Select a protocol to review or ask about
              </p>
              {filtered.map((proto) => (
                <div
                  key={proto.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:shadow-xs transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {proto.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPrompt(`What are the key instructions for ${proto.title}?`);
                        onClose();
                      }}
                      className="text-[11px] font-bold text-primary-600 hover:text-primary-700 underline"
                    >
                      Ask this →
                    </button>
                  </div>
                  <h4
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProtocol(proto)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProtocol(proto)}
                    className="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-primary-600 cursor-pointer"
                  >
                    {proto.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {proto.description}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProtocolSidePanel;
