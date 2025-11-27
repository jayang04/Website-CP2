import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import NotificationService from '../services/notificationService';
import type { ReminderSchedule } from '../types/feedback';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    shareProgress: boolean;
    publicProfile: boolean;
  };
  reminderTime?: string; // HH:MM format
  reminderFrequency?: 'daily' | 'every-other-day';
}

export default function Settings() {
  const user = auth.currentUser;
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: false,
      reminders: true
    },
    privacy: {
      shareProgress: false,
      publicProfile: false
    },
    reminderTime: '09:00', // Default 9 AM
    reminderFrequency: 'daily'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage based on user ID
    if (user) {
      const savedSettings = localStorage.getItem(`userSettings_${user.uid}`);
      if (savedSettings) {
        const loadedSettings = JSON.parse(savedSettings);
        setSettings(loadedSettings);
      }
    }
  }, [user]);

  const handleToggle = (category: 'notifications' | 'privacy', key: string) => {
    setSettings(prev => {
      const categorySettings = prev[category];
      const newSettings = {
        ...prev,
        [category]: {
          ...categorySettings,
          [key]: !(categorySettings as any)[key]
        }
      };
      
      // Auto-save on toggle
      if (user) {
        localStorage.setItem(`userSettings_${user.uid}`, JSON.stringify(newSettings));
      }
      
      return newSettings;
    });
  };

  const handleSave = () => {
    if (user) {
      localStorage.setItem(`userSettings_${user.uid}`, JSON.stringify(settings));
      
      // Save reminder schedule
      if (settings.notifications.reminders && settings.reminderTime) {
        const schedule: ReminderSchedule = {
          userId: user.uid,
          reminderTime: settings.reminderTime,
          frequency: settings.reminderFrequency || 'daily',
          enabled: true
        };
        NotificationService.saveReminderSchedule(schedule);
        
        // Request notification permission if not granted
        NotificationService.requestPermission().then(granted => {
          if (granted) {
            NotificationService.initializeReminders(user.uid);
          }
        });
      } else if (user) {
        // Disable reminders
        NotificationService.cancelReminders(user.uid);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = () => {
    const defaultSettings: Settings = {
      notifications: {
        email: true,
        push: false,
        reminders: true
      },
      privacy: {
        shareProgress: false,
        publicProfile: false
      }
    };
    setSettings(defaultSettings);
    if (user) {
      localStorage.setItem(`userSettings_${user.uid}`, JSON.stringify(defaultSettings));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
          <p className="text-xl text-gray-600">Customize your RehabMotion experience</p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-8 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-center font-medium animate-pulse">
            ✓ Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🔔 Notifications
              </h2>
              <p className="text-gray-600 mt-1">Manage how you receive updates</p>
            </div>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive updates about your rehab progress via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => handleToggle('notifications', 'email')}
                    className="sr-only peer"
                  />
                  <div className="toggle-gradient w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Get real-time notifications in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={() => handleToggle('notifications', 'push')}
                    className="sr-only peer"
                  />
                  <div className="toggle-gradient w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                </label>
              </div>

              {/* Exercise Reminders */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">Exercise Reminders</h3>
                    <p className="text-sm text-gray-600 pr-2">Get reminded to complete your exercises</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.notifications.reminders}
                      onChange={() => handleToggle('notifications', 'reminders')}
                      className="sr-only peer"
                    />
                    <div className="toggle-gradient w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                  </label>
                </div>

                {/* Reminder Time Settings */}
                {settings.notifications.reminders && (
                  <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ⏰ Reminder Time
                      </label>
                      <input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => {
                          const newSettings = { ...settings, reminderTime: e.target.value };
                          setSettings(newSettings);
                          // Auto-save reminder time and update reminder schedule
                          if (user) {
                            localStorage.setItem(`userSettings_${user.uid}`, JSON.stringify(newSettings));
                            
                            // Update reminder schedule immediately
                            if (settings.notifications.reminders && newSettings.reminderTime) {
                              const schedule: ReminderSchedule = {
                                userId: user.uid,
                                reminderTime: newSettings.reminderTime,
                                frequency: newSettings.reminderFrequency || 'daily',
                                enabled: true
                              };
                              NotificationService.saveReminderSchedule(schedule);
                            }
                          }
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📅 Frequency
                      </label>
                      <select
                        value={settings.reminderFrequency}
                        onChange={(e) => {
                          const newSettings = { ...settings, reminderFrequency: e.target.value as 'daily' | 'every-other-day' };
                          setSettings(newSettings);
                          // Auto-save frequency and update reminder schedule
                          if (user) {
                            localStorage.setItem(`userSettings_${user.uid}`, JSON.stringify(newSettings));
                            
                            // Update reminder schedule immediately
                            if (settings.notifications.reminders && newSettings.reminderTime) {
                              const schedule: ReminderSchedule = {
                                userId: user.uid,
                                reminderTime: newSettings.reminderTime || '09:00',
                                frequency: newSettings.reminderFrequency || 'daily',
                                enabled: true
                              };
                              NotificationService.saveReminderSchedule(schedule);
                            }
                          }
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="daily">Every Day</option>
                        <option value="every-other-day">Every Other Day</option>
                      </select>
                    </div>


                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🔒 Privacy
              </h2>
              <p className="text-gray-600 mt-1">Control your data and privacy settings</p>
            </div>
            <div className="space-y-4">
              {/* Share Progress */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Share Progress</h3>
                  <p className="text-sm text-gray-600">Allow sharing your progress with healthcare providers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.privacy.shareProgress}
                    onChange={() => handleToggle('privacy', 'shareProgress')}
                    className="sr-only peer"
                  />
                  <div className="toggle-gradient w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                </label>
              </div>

              {/* Public Profile */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">Public Profile</h3>
                  <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.privacy.publicProfile}
                    onChange={() => handleToggle('privacy', 'publicProfile')}
                    className="sr-only peer"
                  />
                  <div className="toggle-gradient w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={handleSave}
            className="px-8 py-3 text-white rounded-lg text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            💾 Save Changes
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
