import { getAppSettings, saveAppSettings } from './settings';

export interface AppPreferences {
  notifications: boolean;
  voiceGuidance: boolean;
  darkMode: boolean;
  language: string;
  workerName: string;
  sector: string;
  workerId: string;
}

const defaults: AppPreferences = {
  notifications: true,
  voiceGuidance: true,
  darkMode: false,
  language: 'English',
  workerName: 'Rekha Singh',
  sector: 'Ramnagar',
  workerId: 'ASHA-BHR-0421',
};

export function getPreferences(): AppPreferences {
  try {
    const s = getAppSettings();
    return {
      notifications: s.notifications.enabled,
      voiceGuidance: s.voice.readBackEnabled,
      darkMode: s.display.darkMode,
      language: s.language.interfaceLanguage,
      workerName: s.profile.workerName,
      sector: s.profile.village,
      workerId: s.profile.workerId,
    };
  } catch {
    return defaults;
  }
}

export function savePreferences(preferences: Partial<AppPreferences>) {
  const current = getAppSettings();
  if (preferences.notifications !== undefined) current.notifications.enabled = preferences.notifications;
  if (preferences.voiceGuidance !== undefined) current.voice.readBackEnabled = preferences.voiceGuidance;
  if (preferences.darkMode !== undefined) current.display.darkMode = preferences.darkMode;
  if (preferences.language !== undefined) current.language.interfaceLanguage = (preferences.language as any) || 'English';
  if (preferences.workerName !== undefined) current.profile.workerName = preferences.workerName;
  if (preferences.sector !== undefined) current.profile.village = preferences.sector;
  if (preferences.workerId !== undefined) current.profile.workerId = preferences.workerId;
  saveAppSettings(current);
}

export function workerInitials(name = getPreferences().workerName): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'A';
}
