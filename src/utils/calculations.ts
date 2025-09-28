import type { PainLevel, ProgressMetrics, ExerciseSession } from '../types/index.js';

// Simple date utilities
function formatDateInternal(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

function differenceInDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Format a date for display in the UI
 */
export function formatDate(date: Date, formatString: string = 'MMM d, yyyy'): string {
  return formatDateInternal(date);
}

/**
 * Format a date as a relative time string
 */
export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  
  const days = differenceInDays(new Date(), date);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  
  return formatDate(date);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get pain level description
 */
export function getPainLevelDescription(level: PainLevel): string {
  const descriptions = {
    0: 'No pain',
    1: 'Very mild',
    2: 'Mild',
    3: 'Moderate',
    4: 'Moderate+',
    5: 'Strong',
    6: 'Strong+',
    7: 'Severe',
    8: 'Very severe',
    9: 'Extreme',
    10: 'Unbearable'
  };
  return descriptions[level];
}

/**
 * Get pain level color for UI
 */
export function getPainLevelColor(level: PainLevel): string {
  if (level <= 2) return '#10b981'; // green
  if (level <= 4) return '#f59e0b'; // yellow
  if (level <= 6) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Calculate streak days from exercise sessions
 */
export function calculateStreak(sessions: ExerciseSession[]): number {
  if (sessions.length === 0) return 0;
  
  const sortedSessions = sessions
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const session of sortedSessions) {
    const sessionDate = new Date(session.completedAt);
    const daysDiff = differenceInDays(currentDate, sessionDate);
    
    if (daysDiff === streak) {
      streak++;
      currentDate = sessionDate;
    } else if (daysDiff > streak + 1) {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate average pain level from sessions
 */
export function calculateAveragePainLevel(sessions: ExerciseSession[]): number {
  if (sessions.length === 0) return 0;
  
  const total = sessions.reduce((sum, session) => sum + session.painLevel, 0);
  return Math.round((total / sessions.length) * 10) / 10;
}

/**
 * Generate progress metrics from exercise sessions
 */
export function generateProgressMetrics(sessions: ExerciseSession[]): ProgressMetrics {
  const totalSessions = sessions.length;
  const averagePainLevel = calculateAveragePainLevel(sessions);
  const streakDays = calculateStreak(sessions);
  const lastSessionDate = sessions.length > 0 
    ? new Date(Math.max(...sessions.map(s => s.completedAt.getTime())))
    : new Date();
  
  // Calculate improvement rate (pain level trend over last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentSessions = sessions.filter(s => s.completedAt >= fourWeeksAgo);
  const oldSessions = sessions.filter(s => s.completedAt < fourWeeksAgo);
  
  const recentAvgPain = calculateAveragePainLevel(recentSessions);
  const oldAvgPain = calculateAveragePainLevel(oldSessions);
  
  const improvementRate = oldAvgPain > 0 
    ? Math.round(((oldAvgPain - recentAvgPain) / oldAvgPain) * 100)
    : 0;
  
  return {
    totalSessions,
    averagePainLevel,
    progressPercentage: Math.min(100, (totalSessions / 50) * 100), // Assume 50 sessions for full recovery
    streakDays,
    lastSessionDate,
    improvementRate
  };
}
