// Personalized Rehab Recommendation System - Types

export type RehabPhase = 'ACUTE' | 'SUBACUTE' | 'STRENGTHENING' | 'RETURN_TO_SPORT' | 'MAINTENANCE';
export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type DifficultyAdjustment = 'DECREASE' | 'MAINTAIN' | 'INCREASE';

export interface UserProfile {
  userId: string;
  injuryType: string;
  injuryDate: Date;
  currentPainLevel: number; // 1-10
  fitnessLevel: FitnessLevel;
  age: number;
  goals: string[];
  limitations: string[];
  preferredSessionDuration: number; // minutes
  availableDays: number; // days per week
  previousInjuries?: string[];
}

export interface SessionHistory {
  sessionId: string;
  date: Date;
  exercisesCompleted: string[];
  completionRate: number; // 0-100
  prePainLevel: number; // 1-10
  postPainLevel: number; // 1-10
  effortLevel: number; // 1-10
  formQualityScore: number; // 0-100
  duration: number; // minutes
  notes?: string;
}

export interface PersonalizedPlan {
  phase: RehabPhase;
  weekNumber: number;
  exercises: PersonalizedExercise[];
  estimatedDuration: number;
  sessionsPerWeek: number;
  difficultyLevel: number; // 1-10
  focusAreas: string[];
  warnings: string[];
  motivationalMessage: string;
  nextMilestone: string;
}

export interface PersonalizedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps?: number;
  holdTime?: number; // seconds
  restTime: number; // seconds
  difficulty: number; // 1-10
  modifications: string[];
  reasoning: string; // Why this exercise was selected
  expectedPainLevel: string; // "none", "mild", "moderate"
}

export interface ProgressMetrics {
  weeksSinceInjury: number;
  averagePainLevel: number;
  painTrend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  averageCompletionRate: number;
  consistencyScore: number; // 0-100
  formQualityTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  estimatedRecoveryProgress: number; // 0-100%
}

export interface RecommendationReason {
  factor: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate?: Date;
  progress?: number; // 0-100
}
