// Notification and Reminder Service
// Handles automated reminders and notifications

import type { ReminderSchedule, NotificationMessage } from '../types/feedback';
import FeedbackService from './feedbackService';

class NotificationService {
  private static reminderSchedules: Map<string, ReminderSchedule> = new Map();
  private static notifications: NotificationMessage[] = [];
  private static notificationTimers: Map<string, number> = new Map();

  /**
   * Request notification permission (browser)
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Check if notifications are supported and permitted
   */
  static isNotificationSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Save reminder schedule for user
   */
  static saveReminderSchedule(schedule: ReminderSchedule): void {
    this.reminderSchedules.set(schedule.userId, schedule);
    
    // Save to localStorage
    try {
      localStorage.setItem(
        `reminder_schedule_${schedule.userId}`,
        JSON.stringify(schedule)
      );
      
      // Reschedule reminders
      if (schedule.enabled) {
        this.scheduleNextReminder(schedule);
      } else {
        this.cancelReminders(schedule.userId);
      }
    } catch (error) {
      console.error('Error saving reminder schedule:', error);
    }
  }

  /**
   * Get reminder schedule for user
   */
  static getReminderSchedule(userId: string): ReminderSchedule | null {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(`reminder_schedule_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.reminderSchedules.set(userId, parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading reminder schedule:', error);
    }

    return this.reminderSchedules.get(userId) || null;
  }

  /**
   * Schedule next reminder
   */
  private static scheduleNextReminder(schedule: ReminderSchedule): void {
    // Cancel existing timer
    const existingTimer = this.notificationTimers.get(schedule.userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      console.log('🔄 Cancelled previous reminder timer');
    }

    const now = new Date();
    const [hours, minutes] = schedule.reminderTime.split(':').map(Number);
    
    console.log(`⏰ Current time: ${now.toLocaleTimeString()}`);
    console.log(`⏰ Target time: ${hours}:${String(minutes).padStart(2, '0')}`);
    
    // Calculate next reminder time
    const nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);
    
    // If time has passed today by more than 1 minute, schedule for tomorrow
    // Allow 1-minute grace period for just-set reminders
    const timeDiff = nextReminder.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    console.log(`⏰ Time difference: ${Math.round(minutesDiff)} minutes`);
    
    if (minutesDiff < -1) {
      // Time has passed by more than a minute, schedule for tomorrow
      nextReminder.setDate(nextReminder.getDate() + 1);
      console.log('📆 Time already passed today, scheduling for tomorrow');
    } else if (minutesDiff < 0) {
      // Just passed (within 1 minute), send immediately
      console.log('🚀 Time just passed, sending reminder immediately');
      setTimeout(() => {
        this.sendReminder(schedule.userId);
      }, 1000);
      // Then schedule for tomorrow
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    // Check if reminder should be sent based on frequency
    if (schedule.frequency === 'every-other-day') {
      const lastActivity = FeedbackService.calculateFeedbackStats(schedule.userId).lastFeedbackDate;
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActivity % 2 !== 0) {
        // Skip today, schedule for next day
        nextReminder.setDate(nextReminder.getDate() + 1);
        console.log('📆 Every-other-day: Skipping today, scheduling for next occurrence');
      }
    }

    // Calculate delay in milliseconds
    const delay = nextReminder.getTime() - now.getTime();
    const delayMinutes = Math.round(delay / (1000 * 60));

    console.log(`⏰ Next reminder in ${delayMinutes} minutes`);
    console.log(`📅 Next reminder at: ${nextReminder.toLocaleString()}`);

    // Schedule the reminder
    const timer = setTimeout(() => {
      console.log('🔔 Reminder timer triggered!');
      this.sendReminder(schedule.userId);
      // Reschedule for next day
      this.scheduleNextReminder(schedule);
    }, delay) as unknown as number;

    this.notificationTimers.set(schedule.userId, timer);
    
    console.log(`✅ Reminder successfully scheduled`);
  }

  /**
   * Cancel all reminders for user
   */
  static cancelReminders(userId: string): void {
    const timer = this.notificationTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.notificationTimers.delete(userId);
    }
  }

  /**
   * Send reminder notification
   */
  static async sendReminder(userId: string, skipActivityCheck: boolean = false): Promise<void> {
    console.log('🔔 sendReminder called for user:', userId);
    
    // Check if user actually needs a reminder (can be skipped for manual testing)
    if (!skipActivityCheck && !FeedbackService.shouldSendReminder(userId)) {
      console.log('ℹ️ User is active, skipping reminder');
      return;
    }

    const message = FeedbackService.getContextualReminder(userId);
    console.log('📝 Reminder message:', message);
    
    // Send browser notification if supported
    if (this.isNotificationSupported()) {
      console.log('✅ Sending browser notification...');
      new Notification('RehabMotion Reminder 🏃', {
        body: message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'exercise-reminder',
        requireInteraction: false
      });
      console.log('✅ Browser notification sent successfully!');
    } else {
      console.log('⚠️ Browser notifications not supported or not permitted');
    }

    // Store notification in history
    const notificationRecord: NotificationMessage = {
      userId,
      title: 'Exercise Reminder',
      body: message,
      type: 'reminder',
      scheduledTime: new Date(),
      sent: true
    };

    this.notifications.push(notificationRecord);
    
    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]');
      existing.push(notificationRecord);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(existing.slice(-50))); // Keep last 50
    } catch (error) {
      console.error('Error storing notification:', error);
    }

    console.log('🔔 Reminder sent:', message);
  }

  /**
   * Send encouragement notification
   */
  static async sendEncouragement(userId: string): Promise<void> {
    const message = FeedbackService.generatePersonalizedEncouragement(userId);
    
    if (this.isNotificationSupported()) {
      new Notification('Keep Going! 💪', {
        body: message,
        icon: '/logo.png',
        tag: 'encouragement'
      });
    }

    console.log('✨ Encouragement sent:', message);
  }

  /**
   * Get notification history for user
   */
  static getNotificationHistory(userId: string): NotificationMessage[] {
    try {
      const stored = localStorage.getItem(`notifications_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notification history:', error);
      return [];
    }
  }

  /**
   * Initialize reminders for user (call on app load)
   */
  static initializeReminders(userId: string): void {
    console.log('🔔 Initializing reminders for user:', userId);
    const schedule = this.getReminderSchedule(userId);
    
    if (!schedule) {
      console.log('ℹ️ No reminder schedule found for user');
      return;
    }
    
    if (!schedule.enabled) {
      console.log('ℹ️ Reminders are disabled for user');
      return;
    }
    
    console.log('✅ Reminder schedule found:', {
      time: schedule.reminderTime,
      frequency: schedule.frequency,
      enabled: schedule.enabled
    });
    
    this.scheduleNextReminder(schedule);
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(): Promise<boolean> {
    console.log('🔔 Test notification button clicked');
    console.log('Notification support:', 'Notification' in window);
    console.log('Current permission:', Notification?.permission);
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      alert('❌ Your browser does not support notifications.\nPlease try Chrome, Firefox, or Edge.');
      console.error('Notifications not supported in this browser');
      return false;
    }

    const hasPermission = await this.requestPermission();
    console.log('Permission granted:', hasPermission);
    
    if (!hasPermission) {
      alert('⚠️ Notification permission denied.\n\nTo enable notifications:\n1. Click the lock/info icon in your address bar\n2. Find "Notifications"\n3. Select "Allow"\n4. Refresh the page and try again');
      return false;
    }

    try {
      const notification = new Notification('RehabMotion Test', {
        body: '🎉 Notifications are working! You will receive exercise reminders.',
        icon: '/logo.png',
        badge: '/logo.png',
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        console.log('✅ Test notification clicked');
        window.focus();
        notification.close();
      };

      console.log('✅ Test notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      alert('Failed to send test notification. Check browser console for details.');
      return false;
    }
  }

  /**
   * Send immediate reminder for testing (bypasses activity check)
   */
  static async sendImmediateReminder(userId: string): Promise<boolean> {
    console.log('🚀 Sending immediate reminder for testing...');
    
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      alert('Please enable notifications first');
      return false;
    }

    try {
      await this.sendReminder(userId, true); // true = skip activity check
      console.log('✅ Immediate reminder sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending immediate reminder:', error);
      return false;
    }
  }
}

export default NotificationService;
