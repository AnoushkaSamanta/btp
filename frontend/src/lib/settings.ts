/**
 * Settings and Preferences Management for ASHA Co-Pilot
 * Handles profile metadata, notification options, voice preferences,
 * display settings, language, privacy, and persistence.
 */

export interface ProfileSettings {
  workerName: string;
  phone: string;
  village: string;
  workerId: string;
  supervisor: string;
  phc: string;
  photoUrl?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  visitReminders: boolean;
  immunizationAlerts: boolean;
  schemeDeadlines: boolean;
  criticalAlerts: boolean;
  soundEnabled: boolean;
  quietHours: boolean;
}

export interface VoiceSettings {
  readBackEnabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
  voiceLanguage: string; // 'Auto', 'English', 'Hindi', 'Bhojpuri'
}

export interface DisplaySettings {
  darkMode: boolean;
  compactView: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface AutoSaveSettings {
  saveVisitsAuto: boolean;
  syncWithBackend: boolean;
}

export interface LanguageSettings {
  interfaceLanguage: 'en' | 'hi' | 'bho' | 'ta' | 'te' | 'English' | 'Hindi' | 'Bhojpuri';
  voiceLanguage: 'auto' | 'en' | 'hi' | 'bho' | 'Auto' | 'English' | 'Hindi' | 'Bhojpuri';
  dateFormat: 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
}

export interface PrivacySettings {
  dataStorage: 'local_only' | 'sync_backend';
  storageMode?: 'local' | 'backend';
  encryptStoredData: boolean;
  encryptData?: boolean;
  requirePinToOpen: boolean;
  requirePin?: boolean;
  autoLockMinutes: number;
}

export interface AppSettings {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  voice: VoiceSettings;
  display: DisplaySettings;
  autoSave: AutoSaveSettings;
  language: LanguageSettings;
  privacy: PrivacySettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    workerName: 'Rekha Singh',
    phone: '+91 98765 43210',
    village: 'Ramnagar',
    workerId: 'ASHA-BHR-0421',
    supervisor: 'Dr. Amit Kumar',
    phc: 'Ramnagar Primary Health Centre',
    photoUrl: '',
  },
  notifications: {
    enabled: true,
    visitReminders: true,
    immunizationAlerts: true,
    schemeDeadlines: true,
    criticalAlerts: true,
    soundEnabled: true,
    quietHours: false,
  },
  voice: {
    readBackEnabled: true,
    speed: 'normal',
    voiceLanguage: 'auto',
  },
  display: {
    darkMode: false,
    compactView: false,
    fontSize: 'medium',
  },
  autoSave: {
    saveVisitsAuto: true,
    syncWithBackend: true,
  },
  language: {
    interfaceLanguage: 'en',
    voiceLanguage: 'auto',
    dateFormat: 'DD-MM-YYYY',
  },
  privacy: {
    dataStorage: 'local_only',
    storageMode: 'local',
    encryptStoredData: true,
    encryptData: true,
    requirePinToOpen: false,
    requirePin: false,
    autoLockMinutes: 30,
  },
};

const SETTINGS_KEY = 'asha-copilot-settings-v2';
const LEGACY_PREFS_KEY = 'asha-preferences';

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        profile: { ...DEFAULT_SETTINGS.profile, ...parsed.profile },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
        voice: { ...DEFAULT_SETTINGS.voice, ...parsed.voice },
        display: { ...DEFAULT_SETTINGS.display, ...parsed.display },
        autoSave: { ...DEFAULT_SETTINGS.autoSave, ...parsed.autoSave },
        language: { ...DEFAULT_SETTINGS.language, ...parsed.language },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
      };
    }

    // Fallback migration from legacy preferences if present
    const legacyRaw = localStorage.getItem(LEGACY_PREFS_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const migrated: AppSettings = {
        ...DEFAULT_SETTINGS,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          workerName: legacy.workerName || DEFAULT_SETTINGS.profile.workerName,
          village: legacy.sector || DEFAULT_SETTINGS.profile.village,
          workerId: legacy.workerId || DEFAULT_SETTINGS.profile.workerId,
        },
        notifications: {
          ...DEFAULT_SETTINGS.notifications,
          enabled: legacy.notifications ?? true,
        },
        voice: {
          ...DEFAULT_SETTINGS.voice,
          readBackEnabled: legacy.voiceGuidance ?? true,
        },
        display: {
          ...DEFAULT_SETTINGS.display,
          darkMode: legacy.darkMode ?? false,
        },
        language: {
          ...DEFAULT_SETTINGS.language,
          interfaceLanguage: (legacy.language as any) || 'en',
        },
      };
      return migrated;
    }

    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Aliases for compatibility
export const getStoredSettings = getAppSettings;

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // Keep legacy preferences in sync for any components consuming asha-preferences
    const legacy = {
      notifications: settings.notifications.enabled,
      voiceGuidance: settings.voice.readBackEnabled,
      darkMode: settings.display.darkMode,
      language: settings.language.interfaceLanguage,
      workerName: settings.profile.workerName,
      sector: settings.profile.village,
      workerId: settings.profile.workerId,
    };
    localStorage.setItem(LEGACY_PREFS_KEY, JSON.stringify(legacy));

    // Apply dark mode immediately
    document.documentElement.classList.toggle('dark', settings.display.darkMode);

    // Apply font size class
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.documentElement.classList.add(`font-size-${settings.display.fontSize}`);

    // Dispatch sync events
    window.dispatchEvent(new Event('asha-preferences-changed'));
    window.dispatchEvent(new CustomEvent('asha-settings-changed', { detail: settings }));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export const saveStoredSettings = saveAppSettings;

/**
 * Trigger download of full local patient and app data as JSON
 */
export async function exportAllDataBackup(): Promise<void> {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    app: 'ASHA Co-Pilot',
    settings: getAppSettings(),
    localStorage: { ...localStorage },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `asha-copilot-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Wipe local offline patient and session caches
 */
export function clearAllLocalData(): void {
  const preserveKeys = ['token'];
  const preserved: Record<string, string> = {};
  preserveKeys.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val) preserved[key] = val;
  });

  localStorage.clear();

  Object.entries(preserved).forEach(([k, v]) => {
    localStorage.setItem(k, v);
  });

  window.dispatchEvent(new Event('asha-preferences-changed'));
}
