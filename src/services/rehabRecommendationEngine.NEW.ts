// Simplified Personalized Rehab Recommendation Engine
// Uses injuryPlans.ts as single source of truth

import type { 
  UserProfile, 
  SessionHistory, 
  PersonalizedPlan, 
  PersonalizedExercise,
  RehabPhase,
  ProgressMetrics,
  DifficultyAdjustment,
} from '../types/personalization';

import { 
  ACL_REHAB_PLAN,
  MCL_REHAB_PLAN,
  MENISCUS_REHAB_PLAN,
  LATERAL_ANKLE_SPRAIN_PLAN,
  MEDIAL_ANKLE_SPRAIN_PLAN,
  HIGH_ANKLE_SPRAIN_PLAN
} from '../data/injuryPlans';

import type { InjuryRehabPlan, PhaseExercise } from '../types/injuries';

export class RehabRecommendationEngine {
  
  /**
   * Get the appropriate injury plan based on injury type
   */
  private getInjuryPlan(injuryType: string): InjuryRehabPlan {
    const normalized = injuryType.toUpperCase();
    
    if (normalized.includes('ACL')) return ACL_REHAB_PLAN;
    if (normalized.includes('MCL')) return MCL_REHAB_PLAN;
    if (normalized.includes('MENISCUS')) return MENISCUS_REHAB_PLAN;
    if (normalized.includes('LATERAL') && normalized.includes('ANKLE')) return LATERAL_ANKLE_SPRAIN_PLAN;
    if (normalized.includes('MEDIAL') && normalized.includes('ANKLE')) return MEDIAL_ANKLE_SPRAIN_PLAN;
    if (normalized.includes('HIGH') && normalized.includes('ANKLE')) return HIGH_ANKLE_SPRAIN_PLAN;
    
    // Default to ACL if no match
    console.warn('⚠️ No matching injury plan found, defaulting to ACL');
    return ACL_REHAB_PLAN;
  }
  
  /**
   * Generate a personalized weekly rehab plan
   */
  generateWeeklyPlan(
    userProfile: UserProfile, 
    sessionHistory: SessionHistory[]
  ): PersonalizedPlan {
    console.log('🎯 Generating personalized plan for user:', userProfile.userId);
    
    // Get the injury plan
    const injuryPlan = this.getInjuryPlan(userProfile.injuryType);
    
    // Calculate progress metrics
    const metrics = this.calculateProgressMetrics(userProfile, sessionHistory);
    
    // Determine current rehab phase (which phase in the injury plan to use)
    const phaseIndex = this.determinePhaseIndex(userProfile, metrics, injuryPlan);
    const currentPhase = injuryPlan.phases[phaseIndex];
    
    console.log(`📍 Selected phase ${currentPhase.phase}: ${currentPhase.name}`);
    
    // Calculate difficulty adjustment
    const difficultyAdjustment = this.calculateDifficultyAdjustment(metrics, sessionHistory);
    
    // Select and personalize exercises from the injury plan phase
    const exercises = this.selectAndPersonalizeExercises(
      currentPhase.exercises,
      userProfile,
      difficultyAdjustment,
      metrics
    );
    
    // Determine optimal frequency
    const sessionsPerWeek = this.calculateOptimalFrequency(userProfile, metrics);
    
    // Generate motivational content
    const motivationalMessage = this.generateMotivationalMessage(metrics, sessionHistory);
    
    // Calculate next milestone
    const nextMilestone = this.calculateNextMilestone(currentPhase, metrics);
    
    // Generate warnings if needed
    const warnings = this.generateWarnings(metrics, userProfile, currentPhase);
    
    // Map internal phase to external phase type
    const phaseType = this.mapToPhaseType(currentPhase.phase, injuryPlan.phases.length);
    
    const plan: PersonalizedPlan = {
      phase: phaseType,
      weekNumber: this.calculateProgramWeek(sessionHistory),
      exercises,
      estimatedDuration: this.estimateDuration(exercises),
      sessionsPerWeek,
      difficultyLevel: this.calculateOverallDifficulty(exercises),
      focusAreas: currentPhase.goals,
      warnings: [...warnings, ...currentPhase.precautions],
      motivationalMessage,
      nextMilestone
    };
    
    console.log('✅ Generated personalized plan:', {
      phase: plan.phase,
      exerciseCount: plan.exercises.length,
      duration: plan.estimatedDuration
    });
    
    return plan;
  }
  
  /**
   * Map injury plan phase number to RehabPhase type
   */
  private mapToPhaseType(phaseNumber: number, totalPhases: number): RehabPhase {
    const ratio = phaseNumber / totalPhases;
    
    if (ratio <= 0.25) return 'ACUTE';
    if (ratio <= 0.5) return 'SUBACUTE';
    if (ratio <= 0.75) return 'STRENGTHENING';
    if (ratio <= 0.9) return 'RETURN_TO_SPORT';
    return 'MAINTENANCE';
  }
  
  /**
   * Determine which phase of the injury plan to use based on user progress
   */
  private determinePhaseIndex(
    userProfile: UserProfile, 
    metrics: ProgressMetrics,
    injuryPlan: InjuryRehabPlan
  ): number {
    const weeksSinceInjury = metrics.weeksSinceInjury;
    const painLevel = userProfile.currentPainLevel;
    const recoveryProgress = metrics.estimatedRecoveryProgress;
    
    console.log('📊 Determining phase:', { weeksSinceInjury, painLevel, recoveryProgress });
    
    // Very conservative approach based on pain and time
    if (painLevel >= 7 || weeksSinceInjury < 1) {
      console.log('→ ACUTE phase (high pain or very early)');
      return 0; // First phase (ACUTE)
    }
    
    if (painLevel >= 5 || weeksSinceInjury < 2) {
      console.log('→ Early phase (moderate pain)');
      return Math.min(1, injuryPlan.phases.length - 1); // Second phase or first if only one
    }
    
    if (painLevel >= 3 || weeksSinceInjury < 4) {
      console.log('→ Middle phase (mild pain)');
      return Math.min(Math.floor(injuryPlan.phases.length / 2), injuryPlan.phases.length - 1);
    }
    
    if (painLevel >= 2 || recoveryProgress < 80) {
      console.log('→ Advanced phase (minimal pain)');
      return Math.min(injuryPlan.phases.length - 2, injuryPlan.phases.length - 1);
    }
    
    console.log('→ Final phase (recovery complete)');
    return injuryPlan.phases.length - 1; // Last phase
  }
  
  /**
   * Select and personalize exercises from injury plan phase
   */
  private selectAndPersonalizeExercises(
    phaseExercises: PhaseExercise[],
    userProfile: UserProfile,
    difficultyAdjustment: DifficultyAdjustment,
    metrics: ProgressMetrics
  ): PersonalizedExercise[] {
    console.log(`🎯 Selecting from ${phaseExercises.length} exercises in phase`);
    
    // Filter exercises based on user limitations
    let availableExercises = phaseExercises.filter(ex => {
      const hasLimitation = userProfile.limitations.some(limit => 
        ex.name.toLowerCase().includes(limit.toLowerCase()) ||
        ex.description.toLowerCase().includes(limit.toLowerCase())
      );
      return !hasLimitation;
    });
    
    console.log(`✓ ${availableExercises.length} exercises after filtering limitations`);
    
    // Determine how many exercises to include based on session duration
    const targetCount = this.getExerciseCount(userProfile.preferredSessionDuration);
    
    // If we have more exercises than needed, prioritize based on user profile
    if (availableExercises.length > targetCount) {
      availableExercises = this.prioritizeExercises(
        availableExercises,
        userProfile,
        metrics
      );
    }
    
    // Take the top exercises
    const selectedExercises = availableExercises.slice(0, targetCount);
    
    console.log(`✓ Selected ${selectedExercises.length} exercises`);
    
    // Apply difficulty adjustments and convert to PersonalizedExercise
    const difficultyMultiplier = this.getDifficultyMultiplier(
      difficultyAdjustment,
      userProfile.fitnessLevel
    );
    
    return selectedExercises.map(ex => this.convertToPersonalizedExercise(
      ex,
      difficultyMultiplier,
      userProfile,
      metrics
    ));
  }
  
  /**
   * Convert PhaseExercise from injury plan to PersonalizedExercise with adjustments
   */
  private convertToPersonalizedExercise(
    exercise: PhaseExercise,
    difficultyMultiplier: number,
    userProfile: UserProfile,
    metrics: ProgressMetrics
  ): PersonalizedExercise {
    // Adjust sets and reps based on difficulty multiplier
    const adjustedSets = Math.max(1, Math.round(exercise.sets * difficultyMultiplier));
    
    let adjustedReps: number | undefined;
    if (typeof exercise.reps === 'number') {
      adjustedReps = Math.max(1, Math.round(exercise.reps * difficultyMultiplier));
    }
    
    // Generate personalization reasoning
    const reasoning = this.generateExerciseReasoning(
      exercise,
      userProfile,
      metrics,
      difficultyMultiplier
    );
    
    // Map difficulty level to number
    const difficultyNum = this.mapDifficultyToNumber(exercise.difficulty);
    
    // Convert to PersonalizedExercise format
    const personalizedExercise: PersonalizedExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      sets: adjustedSets,
      reps: adjustedReps,
      holdTime: exercise.hold ? this.parseHoldTime(exercise.hold) : undefined,
      restTime: 45, // Default rest time
      difficulty: difficultyNum,
      modifications: exercise.requiredEquipment || [],
      reasoning,
      expectedPainLevel: exercise.painThreshold || 'mild',
      
      // Include all enriched fields from injury plan
      id: exercise.id,
      summary: exercise.summary,
      description: exercise.description,
      image: exercise.image,
      media: exercise.media,
      painThreshold: exercise.painThreshold,
      hold: exercise.hold,
      requiredEquipment: exercise.requiredEquipment,
      
      // Track original vs personalized values
      originalSets: exercise.sets,
      originalReps: typeof exercise.reps === 'number' ? exercise.reps : undefined,
      personalizedSets: adjustedSets,
      personalizedReps: adjustedReps,
      personalizationReasoning: reasoning
    };
    
    return personalizedExercise;
  }
  
  /**
   * Parse hold time string to number (seconds)
   */
  private parseHoldTime(holdStr: string): number {
    const match = holdStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  }
  
  /**
   * Map difficulty string to number
   */
  private mapDifficultyToNumber(difficulty: 'beginner' | 'intermediate' | 'advanced'): number {
    const map = {
      'beginner': 3,
      'intermediate': 6,
      'advanced': 9
    };
    return map[difficulty] || 5;
  }
  
  /**
   * Prioritize exercises based on user profile and metrics
   */
  private prioritizeExercises(
    exercises: PhaseExercise[],
    userProfile: UserProfile,
    metrics: ProgressMetrics
  ): PhaseExercise[] {
    // Score each exercise based on relevance
    const scored = exercises.map(ex => ({
      exercise: ex,
      score: this.calculateExerciseScore(ex, userProfile, metrics)
    }));
    
    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);
    
    return scored.map(s => s.exercise);
  }
  
  /**
   * Calculate relevance score for an exercise
   */
  private calculateExerciseScore(
    exercise: PhaseExercise,
    userProfile: UserProfile,
    metrics: ProgressMetrics
  ): number {
    let score = 50; // Base score
    
    // Prefer exercises matching fitness level
    if (userProfile.fitnessLevel === 'BEGINNER' && exercise.difficulty === 'beginner') score += 20;
    if (userProfile.fitnessLevel === 'INTERMEDIATE' && exercise.difficulty === 'intermediate') score += 20;
    if (userProfile.fitnessLevel === 'ADVANCED' && exercise.difficulty === 'advanced') score += 20;
    
    // Prefer exercises with videos
    if (exercise.media?.videoUrl) score += 10;
    
    // Prefer exercises matching user goals
    const exerciseText = `${exercise.name} ${exercise.description}`.toLowerCase();
    userProfile.goals.forEach(goal => {
      if (exerciseText.includes(goal.toLowerCase())) {
        score += 5;
      }
    });
    
    // Adjust for pain level
    if (userProfile.currentPainLevel > 5 && exercise.painThreshold?.includes('pain-free')) {
      score += 15;
    }
    
    return score;
  }
  
  /**
   * Determine how many exercises to include based on session duration
   */
  private getExerciseCount(durationMinutes: number): number {
    if (durationMinutes <= 15) return 4;
    if (durationMinutes <= 20) return 5;
    if (durationMinutes <= 30) return 6;
    if (durationMinutes <= 45) return 8;
    return 10;
  }
  
  /**
   * Generate personalization reasoning for an exercise
   */
  private generateExerciseReasoning(
    exercise: PhaseExercise,
    userProfile: UserProfile,
    metrics: ProgressMetrics,
    difficultyMultiplier: number
  ): string {
    const reasons: string[] = [];
    
    // Add reasoning based on adjustments
    if (difficultyMultiplier < 1) {
      reasons.push('Reduced intensity for your current condition');
    } else if (difficultyMultiplier > 1) {
      reasons.push('Increased intensity based on your progress');
    }
    
    // Add reasoning based on pain level
    if (userProfile.currentPainLevel > 5) {
      reasons.push('Selected for gentle rehabilitation');
    } else if (userProfile.currentPainLevel < 3) {
      reasons.push('Builds strength for recovery');
    }
    
    // Add reasoning based on fitness level
    if (userProfile.fitnessLevel === 'BEGINNER') {
      reasons.push('Appropriate for your fitness level');
    } else if (userProfile.fitnessLevel === 'ADVANCED') {
      reasons.push('Challenging enough for your fitness level');
    }
    
    // Default to exercise summary if no specific reasoning
    if (reasons.length === 0 && exercise.summary) {
      return exercise.summary;
    }
    
    return reasons.join('. ') || 'Important for your recovery';
  }
  
  /**
   * Calculate progress metrics
   */
  calculateProgressMetrics(
    userProfile: UserProfile, 
    sessionHistory: SessionHistory[]
  ): ProgressMetrics {
    const weeksSinceInjury = this.getWeeksSince(userProfile.injuryDate);
    
    // Get recent sessions (last 2 weeks)
    const recentSessions = this.getRecentSessions(sessionHistory, 14);
    
    // Calculate average pain level
    const averagePainLevel = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.postPainLevel, 0) / recentSessions.length
      : userProfile.currentPainLevel;
    
    // Determine pain trend
    const painTrend = this.calculatePainTrend(sessionHistory);
    
    // Calculate average completion rate
    const averageCompletionRate = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.completionRate, 0) / recentSessions.length
      : 0;
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(sessionHistory, userProfile.availableDays);
    
    // Calculate form quality trend
    const formQualityTrend = this.calculateFormTrend(sessionHistory);
    
    // Estimate recovery progress
    const estimatedRecoveryProgress = this.estimateRecoveryProgress(
      weeksSinceInjury,
      averagePainLevel,
      averageCompletionRate,
      consistencyScore
    );
    
    return {
      weeksSinceInjury,
      averagePainLevel,
      painTrend,
      averageCompletionRate,
      consistencyScore,
      formQualityTrend,
      estimatedRecoveryProgress
    };
  }
  
  /**
   * Calculate weeks since a date
   */
  private getWeeksSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }
  
  /**
   * Get recent sessions within days
   */
  private getRecentSessions(sessions: SessionHistory[], days: number): SessionHistory[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sessions.filter(s => new Date(s.date) >= cutoffDate);
  }
  
  /**
   * Calculate pain trend
   */
  private calculatePainTrend(sessions: SessionHistory[]): 'IMPROVING' | 'STABLE' | 'WORSENING' {
    if (sessions.length < 3) return 'STABLE';
    
    const recent = sessions.slice(-5);
    const avgRecent = recent.reduce((sum, s) => sum + s.postPainLevel, 0) / recent.length;
    
    const older = sessions.slice(-10, -5);
    if (older.length === 0) return 'STABLE';
    
    const avgOlder = older.reduce((sum, s) => sum + s.postPainLevel, 0) / older.length;
    
    if (avgRecent < avgOlder - 0.5) return 'IMPROVING';
    if (avgRecent > avgOlder + 0.5) return 'WORSENING';
    return 'STABLE';
  }
  
  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(sessions: SessionHistory[], targetDays: number): number {
    if (sessions.length === 0) return 0;
    
    const last4Weeks = this.getRecentSessions(sessions, 28);
    const expectedSessions = targetDays * 4; // 4 weeks
    const actualSessions = last4Weeks.length;
    
    return Math.min(100, (actualSessions / expectedSessions) * 100);
  }
  
  /**
   * Calculate form quality trend
   */
  private calculateFormTrend(sessions: SessionHistory[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (sessions.length < 3) return 'STABLE';
    
    const recent = sessions.slice(-5);
    const avgRecent = recent.reduce((sum, s) => sum + s.formQualityScore, 0) / recent.length;
    
    const older = sessions.slice(-10, -5);
    if (older.length === 0) return 'STABLE';
    
    const avgOlder = older.reduce((sum, s) => sum + s.formQualityScore, 0) / older.length;
    
    if (avgRecent > avgOlder + 5) return 'IMPROVING';
    if (avgRecent < avgOlder - 5) return 'DECLINING';
    return 'STABLE';
  }
  
  /**
   * Estimate recovery progress percentage
   */
  private estimateRecoveryProgress(
    weeksSinceInjury: number,
    avgPainLevel: number,
    completionRate: number,
    consistency: number
  ): number {
    // Simple weighted formula
    const timeProgress = Math.min(100, (weeksSinceInjury / 12) * 100); // 12 weeks = 100%
    const painProgress = Math.max(0, (10 - avgPainLevel) * 10); // Lower pain = higher progress
    const performanceProgress = (completionRate + consistency) / 2;
    
    return Math.round(
      (timeProgress * 0.3) + 
      (painProgress * 0.4) + 
      (performanceProgress * 0.3)
    );
  }
  
  /**
   * Calculate difficulty adjustment
   */
  calculateDifficultyAdjustment(
    metrics: ProgressMetrics,
    sessions: SessionHistory[]
  ): DifficultyAdjustment {
    let score = 0;
    
    // Pain trend
    if (metrics.painTrend === 'IMPROVING') score += 1;
    if (metrics.painTrend === 'WORSENING') score -= 2;
    
    // Completion rate
    if (metrics.averageCompletionRate > 90) score += 1;
    if (metrics.averageCompletionRate < 70) score -= 1;
    
    // Consistency
    if (metrics.consistencyScore > 80) score += 1;
    if (metrics.consistencyScore < 50) score -= 1;
    
    // Form quality
    if (metrics.formQualityTrend === 'IMPROVING') score += 1;
    if (metrics.formQualityTrend === 'DECLINING') score -= 1;
    
    if (score >= 2) return 'INCREASE';
    if (score <= -2) return 'DECREASE';
    return 'MAINTAIN';
  }
  
  /**
   * Get difficulty multiplier
   */
  private getDifficultyMultiplier(
    adjustment: DifficultyAdjustment,
    fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  ): number {
    let base = 1.0;
    
    // Fitness level adjustment
    if (fitnessLevel === 'BEGINNER') base = 0.8;
    if (fitnessLevel === 'ADVANCED') base = 1.2;
    
    // Apply adjustment
    if (adjustment === 'DECREASE') return base * 0.75;
    if (adjustment === 'INCREASE') return base * 1.25;
    return base;
  }
  
  /**
   * Calculate optimal frequency
   */
  calculateOptimalFrequency(userProfile: UserProfile, metrics: ProgressMetrics): number {
    let frequency = userProfile.availableDays;
    
    // Adjust based on consistency
    if (metrics.consistencyScore < 50) {
      frequency = Math.max(2, frequency - 1); // Reduce by 1, minimum 2
    }
    
    return Math.min(frequency, 5); // Cap at 5 days per week
  }
  
  /**
   * Calculate program week
   */
  calculateProgramWeek(sessions: SessionHistory[]): number {
    if (sessions.length === 0) return 1;
    
    const oldestSession = sessions.reduce((oldest, s) => 
      new Date(s.date) < new Date(oldest.date) ? s : oldest
    );
    
    const weeksSinceStart = this.getWeeksSince(new Date(oldestSession.date));
    return Math.max(1, weeksSinceStart + 1);
  }
  
  /**
   * Estimate duration
   */
  estimateDuration(exercises: PersonalizedExercise[]): number {
    // Simple estimation: 2 min per set + rest time
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    return Math.round(totalSets * 2.5); // 2.5 min per set on average
  }
  
  /**
   * Calculate overall difficulty
   */
  calculateOverallDifficulty(exercises: PersonalizedExercise[]): number {
    if (exercises.length === 0) return 5;
    
    const avgDifficulty = exercises.reduce((sum, ex) => sum + ex.difficulty, 0) / exercises.length;
    return Math.round(avgDifficulty);
  }
  
  /**
   * Generate motivational message
   */
  generateMotivationalMessage(metrics: ProgressMetrics, sessions: SessionHistory[]): string {
    if (metrics.painTrend === 'IMPROVING') {
      return "Great progress! Your pain is decreasing - keep up the excellent work! 💪";
    }
    
    if (metrics.consistencyScore > 80) {
      return "Your consistency is outstanding! You're building a strong foundation for recovery. 🌟";
    }
    
    if (metrics.averageCompletionRate > 90) {
      return "Amazing dedication! Completing exercises at this rate will speed your recovery. 🎯";
    }
    
    if (metrics.painTrend === 'WORSENING') {
      return "Recovery isn't always linear. Focus on proper form and listen to your body. 🧘";
    }
    
    return "Every session brings you closer to full recovery. Stay committed! 🚀";
  }
  
  /**
   * Calculate next milestone
   */
  calculateNextMilestone(currentPhase: any, metrics: ProgressMetrics): string {
    if (metrics.estimatedRecoveryProgress < 25) {
      return "Focus on pain reduction and mobility restoration";
    }
    
    if (metrics.estimatedRecoveryProgress < 50) {
      return "Build strength and improve range of motion";
    }
    
    if (metrics.estimatedRecoveryProgress < 75) {
      return "Progress to functional movement patterns";
    }
    
    return "Prepare for return to full activity";
  }
  
  /**
   * Generate warnings
   */
  generateWarnings(
    metrics: ProgressMetrics, 
    userProfile: UserProfile,
    currentPhase: any
  ): string[] {
    const warnings: string[] = [];
    
    if (metrics.painTrend === 'WORSENING') {
      warnings.push('⚠️ Pain is increasing - consider reducing intensity');
    }
    
    if (userProfile.currentPainLevel > 7) {
      warnings.push('⚠️ High pain level detected - prioritize pain management');
    }
    
    if (metrics.consistencyScore < 40) {
      warnings.push('💡 Try to maintain regular exercise sessions for better results');
    }
    
    if (metrics.formQualityTrend === 'DECLINING') {
      warnings.push('⚠️ Form quality declining - focus on technique over volume');
    }
    
    return warnings;
  }
}

// Export singleton instance
export const rehabEngine = new RehabRecommendationEngine();
