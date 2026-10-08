import { useEffect, useState } from 'react';
import { LayoutDashboard, Mic, Users, CalendarDays, BookOpen, BarChart3, Heart, Settings, RotateCcw, Wifi, CircleDot, Landmark, Syringe, GraduationCap, X, Bell, Volume2, Globe, Moon, Shield } from 'lucide-react';
import type { ViewId } from '@/types';
import { getPreferences, savePreferences, type AppPreferences } from '@/lib/preferences';
import { healthCheck } from '@/lib/api';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const navItems: { id: ViewId; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'voice', label: 'Voice Assistant', icon: Mic, badge: 'AI' },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'schemes', label: 'Gov Schemes', icon: Landmark, badge: 'New' },
  { id: 'immunization', label: 'Immunization', icon: Syringe },
  { id: 'training', label: 'Training', icon: GraduationCap },
];

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  useEffect(() => {
    const check = () => healthCheck().then(setApiOnline).catch(() => setApiOnline(false));
    void check();
    const timer = window.setInterval(check, 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <aside className="w-64 shrink-0 glass flex flex-col h-screen sticky top-0 z-40">
        <div className="px-5 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Heart className="w-5 h-5 text-white" fill="white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success-400 border-2 border-white flex items-center justify-center">
                <CircleDot className="w-2 h-2 text-white" />
              </span>
            </div>
            <div>
              <h1 className="font-display font-extrabold text-slate-900 text-lg leading-tight tracking-tight">ASHA CoPilot</h1>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Maternal Health AI</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item w-full ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-white text-[10px] font-bold shadow-sm shadow-accent-500/30">
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-scale-in" />
                )}
              </button>
            );
          })}

          <div className="pt-4">
            <p className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">System</p>
            <button onClick={() => setSettingsOpen(true)} className="nav-item w-full">
              <Settings className="w-5 h-5 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="px-3 py-3 border-t border-slate-200/60 space-y-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${apiOnline ? 'bg-success-50 border-success-100' : 'bg-error-50 border-error-100'}`}>
            <Wifi className={`w-4 h-4 ${apiOnline ? 'text-success-600' : 'text-error-600'}`} />
            <span className={`text-xs font-semibold ${apiOnline ? 'text-success-700' : 'text-error-700'}`}>{apiOnline ? 'API connected' : 'API offline'}</span>
            <span className={`ml-auto w-2 h-2 rounded-full ${apiOnline ? 'bg-success-400 animate-pulse' : 'bg-error-400'}`} />
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-500/20">
              RS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">Rekha Singh</p>
              <p className="text-[11px] text-slate-400 truncate">ASHA - Ramnagar Sector</p>
            </div>
            <button title="Reset demo preferences and training progress" aria-label="Reset demo preferences and training progress" onClick={() => {
              if (window.confirm('Reset saved preferences and demo training progress on this device?')) {
                localStorage.removeItem('asha-preferences');
                localStorage.removeItem('asha-training-progress');
                window.location.reload();
              }
            }} className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center transition-colors">
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [preferences, setPreferences] = useState<AppPreferences>(getPreferences);
  const updatePreferences = (patch: Partial<AppPreferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    savePreferences(next);
  };
  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.darkMode);
  }, [preferences.darkMode]);

  const toggles = [
    { id: 'notifications', label: 'Alert Badge', desc: 'Show the unread alert count in the top bar', icon: Bell, value: preferences.notifications, onChange: (value: boolean) => updatePreferences({ notifications: value }) },
    { id: 'voice', label: 'Voice Guidance', desc: 'Speak visit summaries aloud after processing', icon: Volume2, value: preferences.voiceGuidance, onChange: (value: boolean) => updatePreferences({ voiceGuidance: value }) },
    { id: 'dark', label: 'Dark Mode', desc: 'Use darker page and card colors', icon: Moon, value: preferences.darkMode, onChange: (value: boolean) => updatePreferences({ darkMode: value }) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up shadow-soft">
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">Settings</h3>
                <p className="text-white/80 text-sm mt-0.5">Customize your ASHA CoPilot experience</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Language */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary-600" />
              <h4 className="font-display font-bold text-slate-800">Language</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['English', 'Hindi', 'Bhojpuri'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => updatePreferences({ language: lang })}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    preferences.language === lang
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div>
            <h4 className="font-display font-bold text-slate-800 mb-3">Preferences</h4>
            <div className="space-y-2">
              {toggles.map((toggle) => (
                <div key={toggle.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <toggle.icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{toggle.label}</p>
                    <p className="text-xs text-slate-400">{toggle.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle.onChange(!toggle.value)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${toggle.value ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${toggle.value ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Profile */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary-600" />
              <h4 className="font-display font-bold text-slate-800">Profile</h4>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Name</span>
                <span className="text-sm font-semibold text-slate-700">Rekha Singh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Role</span>
                <span className="text-sm font-semibold text-slate-700">ASHA Worker</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Sector</span>
                <span className="text-sm font-semibold text-slate-700">Ramnagar</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Worker ID</span>
                <span className="text-sm font-semibold text-slate-700">ASHA-BHR-0421</span>
              </div>
            </div>
          </div>

          <button onClick={() => { savePreferences(preferences); onClose(); }} className="btn-primary w-full">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
