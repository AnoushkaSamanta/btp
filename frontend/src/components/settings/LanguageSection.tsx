import React from 'react';
import { LanguageSettings } from '../../lib/settings';

interface LanguageSectionProps {
  language: LanguageSettings;
  onChange: (updated: LanguageSettings) => void;
  onInstantLanguageChange?: (langCode: LanguageSettings['interfaceLanguage']) => void;
}

const INTERFACE_LANGUAGES: Array<{
  code: LanguageSettings['interfaceLanguage'];
  name: string;
  native: string;
  desc: string;
}> = [
  { code: 'en', name: 'English', native: 'English', desc: 'Default system language' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', desc: 'हिंदी भाषा इंटरफ़ेस' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी', desc: 'भोजपुरी क्षेत्रीय भाषा' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', desc: 'தமிழ் இடைமுகம்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', desc: 'తెలుగు ఇంటర్‌ఫేస్' },
];

const VOICE_LANGUAGES: Array<{
  code: LanguageSettings['voiceLanguage'];
  name: string;
  native: string;
}> = [
  { code: 'auto', name: 'Auto-detect', native: 'Follows interface' },
  { code: 'en', name: 'English', native: 'English audio' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी आवाज़' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी आवाज़' },
];

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  language,
  onChange,
  onInstantLanguageChange,
}) => {
  const handleInterfaceChange = (code: LanguageSettings['interfaceLanguage']) => {
    onChange({ ...language, interfaceLanguage: code });
    if (onInstantLanguageChange) {
      onInstantLanguageChange(code);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🌐</span> Language & Region
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Customize display terminology, voice speech synthesizers, and calendar date formats.
        </p>
      </div>

      {/* Interface Language */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Interface Language
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose your preferred language for buttons, labels, and clinical prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {INTERFACE_LANGUAGES.map((lang) => {
            const isSelected = language.interfaceLanguage === lang.code;
            return (
              <label
                key={lang.code}
                className={`relative flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="interfaceLanguage"
                  value={lang.code}
                  checked={isSelected}
                  onChange={() => handleInterfaceChange(lang.code)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {lang.native}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {lang.desc}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Voice Language */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Voice Read-Back Language
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Preferred synthesized accent for speech read-back and guidance prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {VOICE_LANGUAGES.map((vLang) => {
            const isSelected = language.voiceLanguage === vLang.code;
            return (
              <label
                key={vLang.code}
                className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="voiceLanguage"
                  value={vLang.code}
                  checked={isSelected}
                  onChange={() => onChange({ ...language, voiceLanguage: vLang.code })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                    {vLang.name}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {vLang.native}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Date Format */}
      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
          Date Format
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Format used in immunization cards, ANC registries, and scheduled visits.
        </p>
        <select
          value={language.dateFormat}
          onChange={(e) =>
            onChange({
              ...language,
              dateFormat: e.target.value as LanguageSettings['dateFormat'],
            })
          }
          className="w-full sm:w-64 px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
        >
          <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 13-10-2026 - Standard India)</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-13 - ISO Standard)</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/13/2026)</option>
        </select>
      </div>
    </div>
  );
};
