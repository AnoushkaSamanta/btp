import React from 'react';
import { Languages, Check } from 'lucide-react';
import { getPreferences, savePreferences } from '@/lib/preferences';

const LANGUAGES = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'Bhojpuri', label: 'Bhojpuri', native: 'भोजपुरी' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
];

interface LanguageSelectorProps {
  activeLang: string;
  onChangeLang?: (lang: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({ activeLang, onChangeLang, disabled = false }: LanguageSelectorProps) {
  const handleSelect = (lang: string) => {
    if (disabled || lang === activeLang) return;
    const current = getPreferences();
    savePreferences({ ...current, language: lang });
    onChangeLang?.(lang);
  };

  return (
    <div className="card p-4 glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
          <Languages className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">Language</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Interface & speech dialect</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {LANGUAGES.map((item) => {
          const isSelected = activeLang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(item.code)}
              className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-2xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-transparent'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2">
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({item.native})</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSelector;
