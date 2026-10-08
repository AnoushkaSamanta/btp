export interface AppPreferences {
  notifications: boolean;
  voiceGuidance: boolean;
  darkMode: boolean;
  language: string;
}

const defaults: AppPreferences = { notifications: true, voiceGuidance: true, darkMode: false, language: 'English' };

export function getPreferences(): AppPreferences {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem('asha-preferences') || '{}') };
  } catch {
    return defaults;
  }
}

export function savePreferences(preferences: AppPreferences) {
  localStorage.setItem('asha-preferences', JSON.stringify(preferences));
  document.documentElement.classList.toggle('dark', preferences.darkMode);
  window.dispatchEvent(new Event('asha-preferences-changed'));
}
