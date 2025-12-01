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
    }

    const now = new Date();
    const [hours, minutes] = schedule.reminderTime.split(':').map(Number);
    
    // Calculate next reminder time
    const nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);
    
    // Calculate time difference in milliseconds
    const timeDiff = nextReminder.getTime() - now.getTime();
    
    // If time has already passed today, schedule for tomorrow
    if (timeDiff < 0) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    // Check if reminder should be sent based on frequency
    if (schedule.frequency === 'every-other-day') {
      const lastActivity = FeedbackService.calculateFeedbackStats(schedule.userId).lastFeedbackDate;
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActivity % 2 !== 0) {
        // Skip today, schedule for next day
        nextReminder.setDate(nextReminder.getDate() + 1);
      }
    }

    // Calculate final delay in milliseconds
    const delay = nextReminder.getTime() - now.getTime();
    
    // Ensure delay is positive
    if (delay <= 0) {
      console.error('Invalid delay calculated:', delay);
      return;
    }

    // Schedule the reminder
    const timer = setTimeout(() => {
      console.log('Reminder timer fired at', new Date().toLocaleTimeString());
      this.sendReminder(schedule.userId);
      // Reschedule for next occurrence based on frequency
      this.scheduleNextReminder(schedule);
    }, delay) as unknown as number;

    this.notificationTimers.set(schedule.userId, timer);
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
    // Check if user actually needs a reminder (can be skipped for manual testing)
    if (!skipActivityCheck && !FeedbackService.shouldSendReminder(userId)) {
      console.log('Reminder skipped - user has been active within 24 hours');
      return;
    }

    const message = FeedbackService.getContextualReminder(userId);
    
    // Send browser notification if supported
    if (this.isNotificationSupported()) {
      console.log('Sending reminder notification');
      new Notification('RehabMotion Reminder 🏃', {
        body: message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'exercise-reminder',
        requireInteraction: false
      });
    } else {
      console.warn('Notifications not available - permission:', 'Notification' in window ? Notification.permission : 'not supported');
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
      // Silent fail
    }
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
  }

  /**
   * Get notification history for user
   */
  static getNotificationHistory(userId: string): NotificationMessage[] {
    try {
      const stored = localStorage.getItem(`notifications_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Initialize reminders for user (call on app load)
   */
  static initializeReminders(userId: string): void {
    const schedule = this.getReminderSchedule(userId);
    
    if (!schedule || !schedule.enabled) {
      return;
    }
    
    this.scheduleNextReminder(schedule);
  }
}

export default NotificationService;
