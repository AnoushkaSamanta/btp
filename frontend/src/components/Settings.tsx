import React, { useState, useEffect, useMemo } from 'react';
import { AdvancedDashboard } from './AdvancedDashboard';
import {
  AppSettings,
  getStoredSettings,
  saveStoredSettings,
  DEFAULT_SETTINGS,
  exportAllDataBackup,
  clearAllLocalData,
} from '../lib/settings';
import { savePreferences } from '../lib/preferences';
import { ProfileSection } from './settings/ProfileSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { LanguageSection } from './settings/LanguageSection';
import { PrivacySection } from './settings/PrivacySection';
import { HelpSection } from './settings/HelpSection';
import { AboutSection } from './settings/AboutSection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

type SettingsTab = 'profile' | 'preferences' | 'language' | 'privacy' | 'help' | 'about' | 'advanced';

import {
  User,
  Sliders,
  Globe,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  Terminal,
} from 'lucide-react';

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const TABS: TabItem[] = [
  { id: 'profile', label: 'Profile', icon: User, keywords: ['name', 'phone', 'village', 'worker id', 'supervisor', 'phc', 'photo', 'avatar'] },
  { id: 'preferences', label: 'Preferences', icon: Sliders, keywords: ['notifications', 'voice', 'read-back', 'dark mode', 'theme', 'display', 'font', 'auto-save', 'sync'] },
  { id: 'language', label: 'Language', icon: Globe, keywords: ['language', 'hindi', 'english', 'bhojpuri', 'tamil', 'telugu', 'voice language', 'date format'] },
  { id: 'privacy', label: 'Privacy', icon: Shield, keywords: ['privacy', 'storage', 'data', 'export', 'delete', 'backup', 'pin', 'encrypt', 'security', 'lock'] },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, keywords: ['help', 'support', 'guide', 'video', 'tutorial', 'whatsapp', 'call', 'email', 'helpline'] },
  { id: 'about', label: 'About', icon: Info, keywords: ['about', 'version', 'team', 'iiit', 'kottayam', 'rohan', 'anoushka', 'adithya', 'github', 'build'] },
  { id: 'advanced', label: 'Advanced', icon: Terminal, keywords: ['pipeline', 'rag', 'evaluation', 'ablation', 'system health', 'wer', 'f1', 'latency', 'developer', 'debug', 'chromadb'] },
];

export const Settings: React.FC<SettingsModalProps> = ({ isOpen, onClose, onLogout }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync settings whenever opened
  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredSettings());
      setToastMessage(null);
      setShowLogoutConfirm(false);
    }
  }, [isOpen]);

  // Handle immediate dark mode toggle preview
  const handleImmediateDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle immediate language switch preview & toast
  const handleInstantLanguageChange = (langCode: AppSettings['language']['interfaceLanguage']) => {
    savePreferences({ language: langCode });
    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bho: 'Bhojpuri (भोजपुरी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
    };
    showToast(`Language switched to ${langNames[langCode] || langCode}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const handleSave = () => {
    saveStoredSettings(settings);
    showToast('Settings saved successfully');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportAllDataBackup();
      showToast('Data exported successfully (.json)');
    } catch {
      showToast('Failed to export data package');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearLocalData = () => {
    clearAllLocalData();
    setSettings(DEFAULT_SETTINGS);
    showToast('All local cached data cleared');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onClose();
    if (onLogout) {
      onLogout();
    } else {
      // Clear session token if present and reload
      localStorage.removeItem('token');
      localStorage.removeItem('asha_user');
      window.location.reload();
    }
  };

  // Filter tabs based on search query
  const filteredTabs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return TABS;
    return TABS.filter((t) => {
      const matchLabel = t.label.toLowerCase().includes(q);
      const matchKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchKeywords;
    });
  }, [searchQuery]);

  // If active tab is not in filtered list, switch to first visible
  useEffect(() => {
    if (filteredTabs.length > 0 && !filteredTabs.some((t) => t.id === activeTab)) {
      setActiveTab(filteredTabs[0].id);
    }
  }, [filteredTabs, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
              ⚙️
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Settings & Configuration
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ASHA Co-Pilot • Rekha Singh (ASHA-BHR-0421)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Settings */}
            <div className="relative hidden sm:block w-52">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Top-Right X Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden px-6 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          />
        </div>

        {/* Middle Body: Sidebar Tabs + Active Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
          {/* Navigation Tabs */}
          <nav aria-label="Settings categories" className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 p-2 md:p-3 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col shrink-0">
            {filteredTabs.length === 0 ? (
              <div className="text-xs text-gray-400 p-3 italic">
                No matching settings found
              </div>
            ) : (
              filteredTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all w-full text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <TabIcon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })
            )}

            <div className="hidden md:block pt-4 mt-auto border-t border-gray-200/80 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {activeTab === 'profile' && (
              <ProfileSection
                profile={settings.profile}
                onChange={(p) => setSettings({ ...settings, profile: p })}
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesSection
                notifications={settings.notifications}
                voice={settings.voice}
                display={settings.display}
                autoSave={settings.autoSave}
                onUpdateNotifications={(n) =>
                  setSettings({ ...settings, notifications: { ...settings.notifications, ...n } })
                }
                onUpdateVoice={(v) =>
                  setSettings({ ...settings, voice: { ...settings.voice, ...v } })
                }
                onUpdateDisplay={(d) =>
                  setSettings({ ...settings, display: { ...settings.display, ...d } })
                }
                onUpdateAutoSave={(a) =>
                  setSettings({ ...settings, autoSave: { ...settings.autoSave, ...a } })
                }
                onImmediateDarkMode={handleImmediateDarkMode}
              />
            )}


            {activeTab === 'language' && (
              <LanguageSection
                language={settings.language}
                onChange={(l) => setSettings({ ...settings, language: l })}
                onInstantLanguageChange={handleInstantLanguageChange}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacySection
                privacy={settings.privacy}
                onChange={(p) => setSettings({ ...settings, privacy: p })}
                onExportData={handleExportData}
                onClearLocalData={handleClearLocalData}
                isExporting={isExporting}
              />
            )}

            {activeTab === 'help' && <HelpSection />}

            {activeTab === 'about' && <AboutSection />}

            {activeTab === 'advanced' && (
              <div className="-m-5 sm:-m-7">
                <div className="px-5 pt-5 pb-3 sm:px-7 sm:pt-7 border-b border-gray-200 dark:border-gray-800 mb-0">
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 font-medium">
                    ⚠️ This section is for developers and examiners only. ASHA workers do not see any of this on their dashboard.
                  </p>
                </div>
                <div className="p-5 sm:p-7">
                  <AdvancedDashboard onNavigate={() => {}} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            🚪 Logout
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md hover:shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-xl mx-auto">
              🚪
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Are you sure you want to logout?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You will need to verify your ASHA Worker ID and credentials upon logging back in.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Settings;
