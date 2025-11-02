// Settings Service - Access user settings throughout the app

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    shareProgress: boolean;
    publicProfile: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    exerciseUnits: 'metric' | 'imperial';
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    email: true,
    push: false,
    reminders: true
  },
  privacy: {
    shareProgress: false,
    publicProfile: false
  },
  preferences: {
    theme: 'light',
    language: 'en',
    exerciseUnits: 'metric'
  }
};

export class SettingsService {
  /**
   * Get user settings from localStorage
   */
  static getUserSettings(userId: string): UserSettings {
    const saved = localStorage.getItem(`userSettings_${userId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_SETTINGS;
  }

  /**
   * Save user settings to localStorage
   */
  static saveUserSettings(userId: string, settings: UserSettings): void {
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
  }

  /**
   * Check if email notifications are enabled
   */
  static isEmailNotificationsEnabled(userId: string): boolean {
    const settings = this.getUserSettings(userId);
    return settings.notifications.email;
  }

  /**
   * Check if push notifications are enabled
   */
  static isPushNotificationsEnabled(userId: string): boolean {
    const settings = this.getUserSettings(userId);
    return settings.notifications.push;
  }

  /**
   * Check if exercise reminders are enabled
   */
  static isRemindersEnabled(userId: string): boolean {
    const settings = this.getUserSettings(userId);
    return settings.notifications.reminders;
  }

  /**
   * Get user's preferred theme
   */
  static getTheme(userId: string): 'light' | 'dark' | 'auto' {
    const settings = this.getUserSettings(userId);
    return settings.preferences.theme;
  }

  /**
   * Get user's preferred language
   */
  static getLanguage(userId: string): string {
    const settings = this.getUserSettings(userId);
    return settings.preferences.language;
  }

  /**
   * Get user's preferred units
   */
  static getUnits(userId: string): 'metric' | 'imperial' {
    const settings = this.getUserSettings(userId);
    return settings.preferences.exerciseUnits;
  }

  /**
   * Check if progress sharing is enabled
   */
  static isProgressSharingEnabled(userId: string): boolean {
    const settings = this.getUserSettings(userId);
    return settings.privacy.shareProgress;
  }

  /**
   * Check if profile is public
   */
  static isProfilePublic(userId: string): boolean {
    const settings = this.getUserSettings(userId);
    return settings.privacy.publicProfile;
  }

  /**
   * Reset settings to defaults
   */
  static resetSettings(userId: string): void {
    this.saveUserSettings(userId, DEFAULT_SETTINGS);
  }
}
