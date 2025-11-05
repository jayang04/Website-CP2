// Predefined badges and achievements data
import type { Badge, BadgeCategory } from '../types/badges';

export const BADGES_DATA: Badge[] = [
  // MILESTONE BADGES
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first exercise',
    icon: '👣',
    category: 'milestone',
    tier: 'bronze',
    requirement: 1,
    requirementType: 'exercises',
    points: 10,
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 5 exercises',
    icon: '🚀',
    category: 'milestone',
    tier: 'bronze',
    requirement: 5,
    requirementType: 'exercises',
    points: 25,
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Complete 25 exercises',
    icon: '💪',
    category: 'milestone',
    tier: 'silver',
    requirement: 25,
    requirementType: 'exercises',
    points: 50,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 50 exercises',
    icon: '🏋️',
    category: 'milestone',
    tier: 'gold',
    requirement: 50,
    requirementType: 'exercises',
    points: 100,
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Complete 100 exercises',
    icon: '🏆',
    category: 'milestone',
    tier: 'platinum',
    requirement: 100,
    requirementType: 'exercises',
    points: 200,
  },

  // STREAK BADGES
  {
    id: 'day-one',
    name: 'Day One',
    description: 'Start your rehab journey',
    icon: '☀️',
    category: 'streak',
    tier: 'bronze',
    requirement: 1,
    requirementType: 'days',
    points: 5,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Stay active for 7 days',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    requirement: 7,
    requirementType: 'streak',
    points: 50,
  },
  {
    id: 'two-week-streak',
    name: 'Two Week Streak',
    description: 'Maintain a 14-day streak',
    icon: '⚡',
    category: 'streak',
    tier: 'silver',
    requirement: 14,
    requirementType: 'streak',
    points: 75,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Stay consistent for 30 days',
    icon: '🌟',
    category: 'streak',
    tier: 'gold',
    requirement: 30,
    requirementType: 'streak',
    points: 150,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Achieve a 50-day streak',
    icon: '💥',
    category: 'streak',
    tier: 'platinum',
    requirement: 50,
    requirementType: 'streak',
    points: 250,
  },

  // PROGRESS BADGES
  {
    id: 'phase-one',
    name: 'Phase One Complete',
    description: 'Complete your first rehab phase',
    icon: '🎯',
    category: 'progress',
    tier: 'bronze',
    requirement: 1,
    requirementType: 'phases',
    points: 30,
  },
  {
    id: 'halfway-there',
    name: 'Halfway There',
    description: 'Reach 50% program completion',
    icon: '📈',
    category: 'progress',
    tier: 'silver',
    requirement: 50,
    requirementType: 'custom',
    points: 75,
  },
  {
    id: 'almost-done',
    name: 'Almost Done',
    description: 'Reach 75% program completion',
    icon: '🎖️',
    category: 'progress',
    tier: 'gold',
    requirement: 75,
    requirementType: 'custom',
    points: 100,
  },
  {
    id: 'full-recovery',
    name: 'Full Recovery',
    description: 'Complete your entire rehab program',
    icon: '🎉',
    category: 'progress',
    tier: 'platinum',
    requirement: 100,
    requirementType: 'custom',
    points: 300,
  },

  // EXERCISE-SPECIFIC BADGES
  {
    id: 'video-learner',
    name: 'Video Learner',
    description: 'Watch 5 exercise demonstration videos',
    icon: '📹',
    category: 'exercise',
    tier: 'bronze',
    requirement: 5,
    requirementType: 'videos',
    points: 20,
  },
  {
    id: 'video-enthusiast',
    name: 'Video Enthusiast',
    description: 'Watch 15 exercise demonstration videos',
    icon: '🎬',
    category: 'exercise',
    tier: 'silver',
    requirement: 15,
    requirementType: 'videos',
    points: 50,
  },
  {
    id: 'video-master',
    name: 'Video Master',
    description: 'Watch 30 exercise demonstration videos',
    icon: '🎥',
    category: 'exercise',
    tier: 'gold',
    requirement: 30,
    requirementType: 'videos',
    points: 100,
  },

  // SPECIAL BADGES
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete exercises before 8 AM',
    icon: '🌅',
    category: 'special',
    tier: 'gold',
    requirement: 1,
    requirementType: 'custom',
    points: 40,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete exercises after 8 PM',
    icon: '🌙',
    category: 'special',
    tier: 'gold',
    requirement: 1,
    requirementType: 'custom',
    points: 40,
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Stay active on weekends',
    icon: '🏖️',
    category: 'special',
    tier: 'silver',
    requirement: 5,
    requirementType: 'custom',
    points: 35,
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Resume training after a 7-day break',
    icon: '🔄',
    category: 'special',
    tier: 'bronze',
    requirement: 1,
    requirementType: 'custom',
    points: 25,
  },
];

// Calculate level based on points
export const calculateLevel = (points: number): { level: number; nextLevelPoints: number } => {
  // Level formula: 100 points per level, increasing by 50 each level
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-450, etc.
  let level = 1;
  let totalPointsForLevel = 0;
  let pointsPerLevel = 100;

  while (points >= totalPointsForLevel + pointsPerLevel) {
    totalPointsForLevel += pointsPerLevel;
    pointsPerLevel += 50;
    level++;
  }

  const nextLevelPoints = totalPointsForLevel + pointsPerLevel;
  
  return { level, nextLevelPoints };
};

// Get badge tier color
export const getBadgeTierColor = (tier?: string): string => {
  switch (tier) {
    case 'bronze':
      return 'from-amber-600 to-amber-800';
    case 'silver':
      return 'from-gray-300 to-gray-500';
    case 'gold':
      return 'from-yellow-400 to-yellow-600';
    case 'platinum':
      return 'from-cyan-400 to-blue-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
};

// Get category display info
export const getCategoryInfo = (category: BadgeCategory) => {
  const categoryMap = {
    milestone: { name: 'Milestones', icon: '🎯', color: 'text-blue-600' },
    streak: { name: 'Streaks', icon: '🔥', color: 'text-orange-600' },
    progress: { name: 'Progress', icon: '📈', color: 'text-green-600' },
    exercise: { name: 'Exercise', icon: '💪', color: 'text-purple-600' },
    special: { name: 'Special', icon: '⭐', color: 'text-yellow-600' },
  };
  return categoryMap[category];
};
