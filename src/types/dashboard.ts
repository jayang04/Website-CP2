// Dashboard and Rehab Program data types

export interface UserStats {
  progressPercentage: number;
  daysActive: number;
  exercisesCompleted: number;
}

export interface Activity {
  id: string;
  type: 'completed' | 'logged' | 'checkin' | 'goal';
  title: string;
  timestamp: Date;
  icon: string;
}

export interface ProgramProgress {
  programName: string;
  currentWeek: number;
  totalWeeks: number;
  progressPercentage: number;
  description: string;
}

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: string;
}

export interface DashboardData {
  stats: UserStats;
  activities: Activity[];
  programProgress: ProgramProgress;
  quickActions: QuickAction[];
}
