// Core types for the Rehabilitation Platform

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetArea: 'knee' | 'ankle';
  instructions: string[];
  videoUrl?: string;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  userId: string;
  completedAt: Date;
  painLevel: number; // 0-10 scale
  difficultyRating: number; // 1-5 scale
  notes?: string;
  duration: number; // actual time spent in minutes
}

export interface RehabProgram {
  id: string;
  name: string;
  description: string;
  type: 'knee' | 'ankle';
  duration: number; // total weeks
  exercises: Exercise[];
  createdBy: string; // therapist ID
}

export interface UserProgress {
  userId: string;
  programId: string;
  currentWeek: number;
  totalWeeks: number;
  completedSessions: ExerciseSession[];
  overallProgress: number; // percentage
  averagePainLevel: number;
  lastSessionDate: Date;
}

export interface PainEntry {
  id: string;
  userId: string;
  date: Date;
  painLevel: number; // 0-10 scale
  location: 'knee' | 'ankle';
  notes?: string;
}

export interface ProgressMetrics {
  totalSessions: number;
  averagePainLevel: number;
  progressPercentage: number;
  streakDays: number;
  lastSessionDate: Date;
  improvementRate: number;
}

export type RehabType = 'knee' | 'ankle';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Form validation types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ExerciseCompletionForm {
  exerciseId: string;
  painLevel: PainLevel;
  difficultyRating: number;
  notes?: string;
  actualDuration: number;
}
