import React from 'react';
import { Bell, Volume2, Moon, Sparkles, Sliders } from 'lucide-react';
import type { NotificationSettings, VoiceSettings, DisplaySettings, AutoSaveSettings } from '@/lib/settings';

interface PreferencesSectionProps {
  notifications: NotificationSettings;
  voice: VoiceSettings;
  display: DisplaySettings;
  autoSave?: AutoSaveSettings;
  onUpdateNotifications: (updated: Partial<NotificationSettings>) => void;
  onUpdateVoice: (updated: Partial<VoiceSettings>) => void;
  onUpdateDisplay: (updated: Partial<DisplaySettings>) => void;
  onUpdateAutoSave?: (updated: Partial<AutoSaveSettings>) => void;
  onImmediateDarkMode?: (enabled: boolean) => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  notifications,
  voice,
  display,
  autoSave = { saveVisitsAuto: true, syncWithBackend: true },
  onUpdateNotifications,
  onUpdateVoice,
  onUpdateDisplay,
  onUpdateAutoSave,
  onImmediateDarkMode,
}) => {
  const handleDarkModeToggle = (enabled: boolean) => {
    onUpdateDisplay({ darkMode: enabled });
    if (onImmediateDarkMode) {
      onImmediateDarkMode(enabled);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h4 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Application Preferences
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Notification thresholds, clinical read-back speed, dark theme, and offline auto-save rules.
        </p>
      </div>

      {/* 1. Notifications Subsection */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Clinical Notifications & Alerts
          </h5>
        </div>

        <div className="space-y-2">
          <ToggleItem
            label="Visit Reminders"
            description="Alerts for pending antenatal and domiciliary follow-ups"
            value={notifications?.visitReminders ?? true}
            onChange={(val) => onUpdateNotifications({ visitReminders: val })}
          />
          <ToggleItem
            label="Immunization Alerts"
            description="Due and overdue UIP infant vaccine reminders"
            value={notifications?.immunizationAlerts ?? true}
            onChange={(val) => onUpdateNotifications({ immunizationAlerts: val })}
          />
          <ToggleItem
            label="Scheme Deadlines"
            description="Pending documentation alerts for PMMVY & JSY subsidies"
            value={notifications?.schemeDeadlines ?? true}
            onChange={(val) => onUpdateNotifications({ schemeDeadlines: val })}
          />
          <ToggleItem
            label="Critical Risk Escalations"
            description="Instant warning banners for high BP and danger sign flags"
            value={notifications?.criticalAlerts ?? true}
            onChange={(val) => onUpdateNotifications({ criticalAlerts: val })}
          />
          <ToggleItem
            label="Audible Alert Tone"
            description="Play notification chime when urgent flags appear"
            value={notifications?.soundEnabled ?? true}
            onChange={(val) => onUpdateNotifications({ soundEnabled: val })}
          />
        </div>
      </div>

      {/* 2. Voice Subsection */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Voice Read-Back & Speech
          </h5>
        </div>

        <ToggleItem
          label="Voice Read-Back"
          description="Speak clinical summary and vital validation aloud after voice recording"
          value={voice?.readBackEnabled ?? true}
          onChange={(val) => onUpdateVoice({ readBackEnabled: val })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Read-Back Speed</span>
            <select
              value={voice?.speed ?? 'normal'}
              onChange={(e) => onUpdateVoice({ speed: e.target.value as any })}
              className="input-field mt-1 text-xs"
            >
              <option value="slow">Slow (0.75x)</option>
              <option value="normal">Normal (1.0x)</option>
              <option value="fast">Fast (1.25x)</option>
            </select>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Speech Engine Language</span>
            <select
              value={voice?.voiceLanguage ?? 'Auto'}
              onChange={(e) => onUpdateVoice({ voiceLanguage: e.target.value })}
              className="input-field mt-1 text-xs"
            >
              <option value="Auto">Auto-detect from input</option>
              <option value="English">Indian English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Bhojpuri">भोजपुरी (Bhojpuri)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Display Subsection */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-emerald-600" />
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Display & Appearance
          </h5>
        </div>

        <ToggleItem
          label="Dark Mode"
          description="High-contrast dark palette optimized for battery life and night field visits"
          value={display?.darkMode ?? false}
          onChange={(val) => handleDarkModeToggle(val)}
        />

        <ToggleItem
          label="Compact View"
          description="Dense table rows and reduced card padding for faster scanning"
          value={display?.compactView ?? false}
          onChange={(val) => onUpdateDisplay({ compactView: val })}
        />

        <div className="pt-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Interface Font Size</span>
          <select
            value={display?.fontSize ?? 'medium'}
            onChange={(e) => onUpdateDisplay({ fontSize: e.target.value as any })}
            className="input-field mt-1 text-xs"
          >
            <option value="small">Small (Dense)</option>
            <option value="medium">Medium (Standard)</option>
            <option value="large">Large (High Legibility)</option>
          </select>
        </div>
      </div>

      {/* 4. Auto-Save & Sync */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Auto-Save & Synchronization
          </h5>
        </div>

        <ToggleItem
          label="Save visits automatically"
          description="Prevent draft loss by auto-saving consultation notes every 30 seconds"
          value={autoSave?.saveVisitsAuto ?? true}
          onChange={(val) => onUpdateAutoSave && onUpdateAutoSave({ saveVisitsAuto: val })}
        />

        <ToggleItem
          label="Real-time backend synchronization"
          description="Upload clinical records to central SQLite/SQLModel server when network is reachable"
          value={autoSave?.syncWithBackend ?? true}
          onChange={(val) => onUpdateAutoSave && onUpdateAutoSave({ syncWithBackend: val })}
        />
      </div>
    </div>
  );
};

function ToggleItem({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
      <div className="min-w-0 pr-2">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
