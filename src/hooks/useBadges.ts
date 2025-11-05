import { useState, useCallback } from 'react';
import { badgeService } from '../services/badgeService';
import type { BadgeNotification } from '../types/badges';

export function useBadges(userId: string) {
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);

  // Check and unlock badges based on user activity
  const checkBadges = useCallback(async (stats: {
    exercisesCompleted?: number;
    daysActive?: number;
    currentStreak?: number;
    phasesCompleted?: number;
    progressPercentage?: number;
    painFreeSessions?: number;
    videosWatched?: number;
    angleDetectionUsed?: number;
    isWeekend?: boolean;
    isEarlyMorning?: boolean;
    isLateNight?: boolean;
    hadLongBreak?: boolean;
  }) => {
    const newNotifications = await badgeService.checkAndUnlockBadges(userId, stats);
    
    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
    
    return newNotifications;
  }, [userId]);

  // Manually unlock a specific badge
  const unlockBadge = useCallback(async (badgeId: string) => {
    const notification = await badgeService.unlockBadge(userId, badgeId);
    
    if (notification) {
      setNotifications(prev => [...prev, notification]);
    }
    
    return notification;
  }, [userId]);

  // Get user's badge data
  const getUserBadges = useCallback(async () => {
    return await badgeService.getUserBadges(userId);
  }, [userId]);

  // Get all badges with progress
  const getAllBadges = useCallback(async (currentStats: any) => {
    return await badgeService.getAllBadgesWithProgress(userId, currentStats);
  }, [userId]);

  // Get recently unlocked badges
  const getRecentBadges = useCallback(async () => {
    return await badgeService.getRecentlyUnlocked(userId);
  }, [userId]);

  // Dismiss a notification
  const dismissNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Dismiss all notifications
  const dismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    checkBadges,
    unlockBadge,
    getUserBadges,
    getAllBadges,
    getRecentBadges,
    dismissNotification,
    dismissAllNotifications,
  };
}
