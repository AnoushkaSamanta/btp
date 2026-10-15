import { useEffect, useState } from 'react';
import { LayoutDashboard, Mic, Users, CalendarDays, BookOpen, BarChart3, Heart, Settings, Landmark, Syringe, GraduationCap, X, Bell, Volume2, Globe, Moon } from 'lucide-react';
import type { ViewId } from '@/types';
import { getPreferences, workerInitials, type AppPreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import SettingsModalComponent from './Settings';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<AppPreferences>(getPreferences);

  useEffect(() => {
    const sync = () => setPrefs(getPreferences());
    window.addEventListener('asha-preferences-changed', sync);
    return () => window.removeEventListener('asha-preferences-changed', sync);
  }, []);

  const navItems: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: t('dashboard', prefs.language), icon: LayoutDashboard },
    { id: 'voice', label: t('voiceAssistant', prefs.language), icon: Mic },
    { id: 'patients', label: t('patients', prefs.language), icon: Users },
    { id: 'schedule', label: t('schedule', prefs.language), icon: CalendarDays },
    { id: 'resources', label: t('resources', prefs.language), icon: BookOpen },
    { id: 'reports', label: t('reports', prefs.language), icon: BarChart3 },
    { id: 'schemes', label: t('schemes', prefs.language), icon: Landmark },
    { id: 'immunization', label: t('immunization', prefs.language), icon: Syringe },
    { id: 'training', label: t('training', prefs.language), icon: GraduationCap },
  ];

  return (
    <>
      <aside className="w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-40">
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-700 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">{t('appName', prefs.language)}</h1>
              <p className="text-[11px] text-slate-500">{t('tagline', prefs.language)}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`nav-item w-full ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setSettingsOpen(true)} className="nav-item w-full mt-4">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>{t('settings', prefs.language)}</span>
          </button>
        </nav>

        <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center text-white text-xs font-semibold">
              {workerInitials(prefs.workerName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{prefs.workerName}</p>
              <p className="text-[11px] text-slate-500 truncate">{prefs.sector} · {prefs.workerId}</p>
            </div>
          </div>
        </div>
      </aside>

      <SettingsModalComponent isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

