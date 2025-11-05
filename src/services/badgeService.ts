// Badge Service - Handles badge unlocking, tracking, and storage
import type { Badge, UserBadges, BadgeNotification } from '../types/badges';
import { BADGES_DATA, calculateLevel } from '../data/badgesData';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'rehabmotion_badges';

class BadgeService {
  // Get user's badge data from Firestore (with localStorage fallback)
  async getUserBadges(userId: string): Promise<UserBadges> {
    try {
      // Try to get from Firestore first
      const docRef = doc(db, 'users', userId, 'badges', 'data');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserBadges;
        // Convert Firestore Timestamps back to Date objects
        data.unlockedBadges = data.unlockedBadges.map((badge: any) => ({
          ...badge,
          unlockedAt: badge.unlockedAt?.toDate ? badge.unlockedAt.toDate() : badge.unlockedAt ? new Date(badge.unlockedAt) : undefined,
        }));
        console.log('✅ Badge data loaded from cloud');
        return data;
      }

      // If not in Firestore, check localStorage for migration
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert date strings back to Date objects
        data.unlockedBadges = data.unlockedBadges.map((badge: Badge) => ({
          ...badge,
          unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined,
        }));
        
        // Migrate to Firestore
        await this.saveUserBadges(data);
        console.log('✅ Badge data migrated from localStorage to cloud');
        return data;
      }

      // Return default data
      const { level, nextLevelPoints } = calculateLevel(0);
      const defaultData: UserBadges = {
        userId,
        unlockedBadges: [],
        totalPoints: 0,
        level,
        nextLevelPoints,
      };
      
      // Save default to Firestore
      await this.saveUserBadges(defaultData);
      return defaultData;
    } catch (error: any) {
      console.error('❌ Error fetching badge data from Firestore:', error);
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        data.unlockedBadges = data.unlockedBadges.map((badge: Badge) => ({
          ...badge,
          unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined,
        }));
        return data;
      }

      // Return default data
      const { level, nextLevelPoints } = calculateLevel(0);
      return {
        userId,
        unlockedBadges: [],
        totalPoints: 0,
        level,
        nextLevelPoints,
      };
    }
  }

  // Save user badge data to Firestore
  private async saveUserBadges(userBadges: UserBadges): Promise<void> {
    try {
      const docRef = doc(db, 'users', userBadges.userId, 'badges', 'data');
      await setDoc(docRef, {
        ...userBadges,
        updatedAt: serverTimestamp()
      });
      
      // Also save to localStorage as backup
      localStorage.setItem(`${STORAGE_KEY}_${userBadges.userId}`, JSON.stringify(userBadges));
      console.log('✅ Badge data saved to cloud');
    } catch (error: any) {
      console.error('❌ Error saving badge data to Firestore:', error);
      
      // Fallback to localStorage
      localStorage.setItem(`${STORAGE_KEY}_${userBadges.userId}`, JSON.stringify(userBadges));
      console.log('⚠️ Badge data saved to localStorage (fallback)');
    }
  }

  // Check if a badge is unlocked
  async isBadgeUnlocked(userId: string, badgeId: string): Promise<boolean> {
    const userBadges = await this.getUserBadges(userId);
    return userBadges.unlockedBadges.some(badge => badge.id === badgeId);
  }

  // Unlock a badge
  async unlockBadge(userId: string, badgeId: string): Promise<BadgeNotification | null> {
    // Check if already unlocked
    if (await this.isBadgeUnlocked(userId, badgeId)) {
      return null;
    }

    const badge = BADGES_DATA.find(b => b.id === badgeId);
    if (!badge) {
      return null;
    }

    const userBadges = await this.getUserBadges(userId);
    
    // Add the badge with unlock timestamp
    const unlockedBadge: Badge = {
      ...badge,
      unlockedAt: new Date(),
      progress: 100,
    };

    userBadges.unlockedBadges.push(unlockedBadge);
    userBadges.totalPoints += badge.points;

    // Recalculate level
    const levelInfo = calculateLevel(userBadges.totalPoints);
    userBadges.level = levelInfo.level;
    userBadges.nextLevelPoints = levelInfo.nextLevelPoints;

    await this.saveUserBadges(userBadges);

    // Return notification
    return {
      badge: unlockedBadge,
      message: `You've unlocked: ${badge.name}!`,
      showConfetti: badge.tier === 'platinum' || badge.tier === 'gold',
    };
  }

  // Check and unlock badges based on user stats
  async checkAndUnlockBadges(
    userId: string,
    stats: {
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
    }
  ): Promise<BadgeNotification[]> {
    const notifications: BadgeNotification[] = [];

    // Check each badge
    for (const badge of BADGES_DATA) {
      // Skip if already unlocked
      if (await this.isBadgeUnlocked(userId, badge.id)) {
        continue;
      }

      let shouldUnlock = false;

      // Check based on requirement type
      switch (badge.requirementType) {
        case 'exercises':
          shouldUnlock = (stats.exercisesCompleted ?? 0) >= badge.requirement;
          break;
        case 'days':
          shouldUnlock = (stats.daysActive ?? 0) >= badge.requirement;
          break;
        case 'streak':
          shouldUnlock = (stats.currentStreak ?? 0) >= badge.requirement;
          break;
        case 'phases':
          shouldUnlock = (stats.phasesCompleted ?? 0) >= badge.requirement;
          break;
        case 'painFree':
          shouldUnlock = (stats.painFreeSessions ?? 0) >= badge.requirement;
          break;
        case 'videos':
          shouldUnlock = (stats.videosWatched ?? 0) >= badge.requirement;
          break;
        case 'custom':
          // Handle custom badge logic
          shouldUnlock = this.checkCustomBadge(badge.id, stats);
          break;
      }

      if (shouldUnlock) {
        const notification = await this.unlockBadge(userId, badge.id);
        if (notification) {
          notifications.push(notification);
        }
      }
    }

    return notifications;
  }

  // Handle custom badge logic
  private checkCustomBadge(badgeId: string, stats: any): boolean {
    switch (badgeId) {
      case 'halfway-there':
        return (stats.progressPercentage ?? 0) >= 50;
      case 'almost-done':
        return (stats.progressPercentage ?? 0) >= 75;
      case 'full-recovery':
        return (stats.progressPercentage ?? 0) >= 100;
      case 'angle-master':
        return (stats.angleDetectionUsed ?? 0) >= 10;
      case 'early-bird':
        return stats.isEarlyMorning ?? false;
      case 'night-owl':
        return stats.isLateNight ?? false;
      case 'weekend-warrior':
        return stats.isWeekend ?? false;
      case 'comeback-kid':
        return stats.hadLongBreak ?? false;
      default:
        return false;
    }
  }

  // Get all available badges with progress
  async getAllBadgesWithProgress(userId: string, currentStats: any): Promise<Badge[]> {
    const userBadges = await this.getUserBadges(userId);
    
    return BADGES_DATA.map(badge => {
      const unlocked = userBadges.unlockedBadges.find((b: Badge) => b.id === badge.id);
      
      if (unlocked) {
        return unlocked;
      }

      // Calculate progress for locked badges
      let progress = 0;
      switch (badge.requirementType) {
        case 'exercises':
          progress = Math.min(100, ((currentStats.exercisesCompleted ?? 0) / badge.requirement) * 100);
          break;
        case 'days':
          progress = Math.min(100, ((currentStats.daysActive ?? 0) / badge.requirement) * 100);
          break;
        case 'streak':
          progress = Math.min(100, ((currentStats.currentStreak ?? 0) / badge.requirement) * 100);
          break;
        case 'phases':
          progress = Math.min(100, ((currentStats.phasesCompleted ?? 0) / badge.requirement) * 100);
          break;
        case 'painFree':
          progress = Math.min(100, ((currentStats.painFreeSessions ?? 0) / badge.requirement) * 100);
          break;
        case 'videos':
          progress = Math.min(100, ((currentStats.videosWatched ?? 0) / badge.requirement) * 100);
          break;
        default:
          progress = 0;
      }

      return {
        ...badge,
        progress: Math.round(progress),
      };
    });
  }

  // Get badges by category
  async getBadgesByCategory(userId: string, currentStats: any) {
    const badges = await this.getAllBadgesWithProgress(userId, currentStats);
    
    return {
      milestone: badges.filter((b: Badge) => b.category === 'milestone'),
      streak: badges.filter((b: Badge) => b.category === 'streak'),
      progress: badges.filter((b: Badge) => b.category === 'progress'),
      exercise: badges.filter((b: Badge) => b.category === 'exercise'),
      special: badges.filter((b: Badge) => b.category === 'special'),
    };
  }

  // Get recently unlocked badges (last 7 days)
  async getRecentlyUnlocked(userId: string): Promise<Badge[]> {
    const userBadges = await this.getUserBadges(userId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return userBadges.unlockedBadges
      .filter((badge: Badge) => badge.unlockedAt && badge.unlockedAt >= sevenDaysAgo)
      .sort((a: Badge, b: Badge) => {
        const dateA = a.unlockedAt?.getTime() ?? 0;
        const dateB = b.unlockedAt?.getTime() ?? 0;
        return dateB - dateA;
      });
  }
}

export const badgeService = new BadgeService();
