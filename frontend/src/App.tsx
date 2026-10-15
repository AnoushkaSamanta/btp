import { useEffect, useState } from 'react';
import { Search, Bell, Menu, X, Command, AlertCircle, Clock, Info, CheckCircle2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { Patients } from '@/components/Patients';
import { Schedule } from '@/components/Schedule';
import { Resources } from '@/components/Resources';
import { Reports } from '@/components/Reports';
import { Schemes } from '@/components/Schemes';
import { Immunization } from '@/components/Immunization';
import { Training } from '@/components/Training';
import { notifications as seedNotifications } from '@/data';
import { fetchNotifications, markNotificationRead, markNotificationsRead, searchRegistry } from '@/lib/api';
import { getPreferences, workerInitials, type AppPreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import type { ViewId, AppNotification, Patient, Visit } from '@/types';

const notifIconConfig: Record<AppNotification['type'], { icon: typeof AlertCircle; bg: string; text: string }> = {
  alert: { icon: AlertCircle, bg: 'bg-error-50 dark:bg-error-900/30', text: 'text-error-600 dark:text-error-400' },
  reminder: { icon: Clock, bg: 'bg-accent-50 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400' },
  info: { icon: Info, bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
  success: { icon: CheckCircle2, bg: 'bg-success-50 dark:bg-success-900/30', text: 'text-success-600 dark:text-success-400' },
};

function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [searchQ, setSearchQ] = useState('');
  const [searchHits, setSearchHits] = useState<{ patients: Patient[]; visits: Visit[] } | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences>(getPreferences);
  const [profileOpen, setProfileOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [focusVisitId, setFocusVisitId] = useState('');
  const [focusPatientId, setFocusPatientId] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.darkMode);
    const syncPreferences = () => setPreferences(getPreferences());
    window.addEventListener('asha-preferences-changed', syncPreferences);
    return () => window.removeEventListener('asha-preferences-changed', syncPreferences);
  }, [preferences.darkMode]);

  useEffect(() => {
    fetchNotifications()
      .then((rows) => setNotifications(rows as AppNotification[]))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const q = searchQ.trim();
    if (q.length < 2) {
      setSearchHits(null);
      return;
    }
    const timer = window.setTimeout(() => {
      searchRegistry(q)
        .then((data) => setSearchHits(data as { patients: Patient[]; visits: Visit[] }))
        .catch(() => setSearchHits(null));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleNavigate = (view: ViewId) => {
    setActiveView(view);
    setMobileNavOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  };

  const toggleNotifPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifOpen((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleProfilePanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onSelectPatient={(pId) => {
              setFocusPatientId(pId);
              setActiveView('patients');
            }}
          />
        );
      case 'voice':
        return <VoiceAssistant onNavigate={handleNavigate} />;
      case 'patients':
        return <Patients initialSearch={patientSearch} initialPatientId={focusPatientId} />;
      case 'schedule':
        return (
          <Schedule
            focusVisitId={focusVisitId}
            onSelectPatient={(pId) => {
              setFocusPatientId(pId);
              setActiveView('patients');
            }}
          />
        );
      case 'resources':
        return <Resources />;
      case 'reports':
        return <Reports />;
      case 'schemes':
        return <Schemes />;
      case 'immunization':
        return <Immunization />;
      case 'training':
        return <Training />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileNavOpen ? '' : 'hidden'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileNavOpen(false)} />
        <div className="absolute left-0 top-0 bottom-0 animate-slide-in-right">
          <Sidebar activeView={activeView} onNavigate={handleNavigate} />
        </div>
      </div>

      <div className="hidden lg:block">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
          >
            {mobileNavOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
          </button>

          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              id="global-search"
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t('searchPlaceholder', preferences.language)}
              className="w-full pl-11 pr-16 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-400 focus:ring-4 focus:ring-primary-100/40 outline-none transition-all text-sm"
            />
            {searchHits && (
              <div className="absolute left-0 right-0 top-12 z-50 card-elevated rounded-2xl overflow-hidden max-h-80 overflow-y-auto shadow-xl">
                {searchHits.patients.length === 0 && searchHits.visits.length === 0 && (
                  <p className="p-3.5 text-sm text-slate-500">No matches found</p>
                )}
                {searchHits.patients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50/60 dark:hover:bg-primary-900/30 transition-all border-b border-slate-100 dark:border-slate-800/60 font-medium"
                    onClick={() => {
                      setSearchQ('');
                      setSearchHits(null);
                      setPatientSearch(p.name);
                      handleNavigate('patients');
                    }}
                  >
                    <span className="font-semibold text-primary-700 dark:text-primary-400">{p.name}</span> · {p.village}
                  </button>
                ))}
                {searchHits.visits.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-sky-50/60 dark:hover:bg-sky-900/30 transition-all text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60"
                    onClick={() => {
                      setSearchQ('');
                      setSearchHits(null);
                      setFocusVisitId(v.id);
                      handleNavigate('schedule');
                    }}
                  >
                    Visit: {v.patientName} · {v.date}
                  </button>
                ))}
              </div>
            )}
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold">
              <Command className="w-3 h-3" />
              K
            </kbd>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Notification Bell Button */}
            <button
              onClick={toggleNotifPanel}
              className="relative w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer group"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
              {preferences.notifications && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-accent-600 rounded-full ring-2 ring-white dark:ring-slate-900 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 card-elevated shadow-2xl rounded-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-700">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
                    <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">{t('notifications', preferences.language)}</h3>
                    <span className="stat-badge bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((n) => {
                      const config = notifIconConfig[n.type];
                      const Icon = config.icon;
                      return (
                        <button
                          type="button"
                          key={n.id}
                          onClick={async () => {
                            setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, read: true } : item));
                            try { await markNotificationRead(n.id); } catch { /* retain local state */ }
                            setNotifOpen(false);
                            if (/immunization/i.test(n.title + n.message)) handleNavigate('immunization');
                            else if (/scheme/i.test(n.title + n.message)) handleNavigate('schemes');
                            else if (/visit/i.test(n.title + n.message)) handleNavigate('schedule');
                            else handleNavigate('patients');
                          }}
                          className={`w-full text-left flex items-start gap-3 p-3.5 hover:bg-primary-50/50 dark:hover:bg-slate-800/60 transition-all ${!n.read ? 'bg-primary-50/20 dark:bg-primary-900/10' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${config.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await markNotificationsRead();
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      } catch {
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      }
                    }}
                    className="w-full py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
                  >
                    {t('markAllRead', preferences.language)}
                  </button>
                </div>
              </>
            )}

            {/* Profile Avatar Button */}
            <button
              type="button"
              aria-label="Open worker profile"
              onClick={toggleProfilePanel}
              className="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center text-white font-semibold text-sm"
            >
              {workerInitials(preferences.workerName)}
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-64 card-elevated rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{preferences.workerName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{preferences.sector} · {preferences.workerId}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Language: <span className="font-semibold text-primary-600">{preferences.language}</span></p>
                  </div>
                  <button type="button" onClick={() => setProfileOpen(false)} className="btn-ghost w-full mt-3 text-xs">Close</button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
