// Badge and Achievement Types

export type BadgeCategory = 
  | 'milestone' 
  | 'streak' 
  | 'exercise' 
  | 'progress' 
  | 'special';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier?: BadgeTier;
  requirement: number; // The number needed to unlock (days, exercises, etc.)
  requirementType: 'exercises' | 'days' | 'streak' | 'phases' | 'painFree' | 'videos' | 'custom';
  points: number; // Achievement points earned
  unlockedAt?: Date;
  progress?: number; // Current progress towards unlocking (0-100)
}

export interface UserBadges {
  userId: string;
  unlockedBadges: Badge[];
  totalPoints: number;
  level: number; // User level based on points
  nextLevelPoints: number; // Points needed for next level
}

export interface BadgeNotification {
  badge: Badge;
  message: string;
  showConfetti: boolean;
}
