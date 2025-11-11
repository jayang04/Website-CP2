// Simplified Integration Service - Uses injuryPlans.ts as single source of truth

import { rehabEngine } from './rehabRecommendationEngine';
import type { UserProfile, SessionHistory, PersonalizedPlan } from '../types/personalization';

/**
 * Simplified service to manage personalized rehab recommendations
 * No more complex enrichment - exercises come directly from injuryPlans.ts
 */
export class PersonalizationService {
  
  /**
   * Normalize injury type to match standard format
   */
  private static normalizeInjuryType(injuryType: string): string {
    console.log('🔍 Normalizing injury type:', injuryType);
    const normalized = injuryType.toUpperCase();
    
    // Map full injury names to standard keys
    if (normalized.includes('ACL')) {
      console.log('✅ Matched to: ACL');
      return 'ACL';
    }
    if (normalized.includes('MCL')) {
      console.log('✅ Matched to: MCL');
      return 'MCL';
    }
    if (normalized.includes('MENISCUS')) {
      console.log('✅ Matched to: MENISCUS');
      return 'MENISCUS';
    }
    if (normalized.includes('LATERAL') && normalized.includes('ANKLE')) {
      console.log('✅ Matched to: LATERAL_ANKLE');
      return 'LATERAL_ANKLE';
    }
    if (normalized.includes('MEDIAL') && normalized.includes('ANKLE')) {
      console.log('✅ Matched to: MEDIAL_ANKLE');
      return 'MEDIAL_ANKLE';
    }
    if (normalized.includes('HIGH') && normalized.includes('ANKLE')) {
      console.log('✅ Matched to: HIGH_ANKLE');
      return 'HIGH_ANKLE';
    }
    
    // Default
    const result = normalized.replace(/\s+(TEAR|SPRAIN|INJURY)$/i, '').trim();
    console.log('⚠️ Using default normalization:', result);
    return result;
  }
  
  /**
   * Initialize user profile for personalization
   */
  static createUserProfile(userId: string, injuryData: any): UserProfile {
    console.log('👤 Creating user profile with injury data:', injuryData);
    
    const profile: UserProfile = {
      userId,
      injuryType: this.normalizeInjuryType(injuryData.type || 'ACL'),
      injuryDate: new Date(injuryData.date || Date.now()),
      currentPainLevel: injuryData.painLevel || 5,
      fitnessLevel: injuryData.fitnessLevel || 'INTERMEDIATE',
      age: injuryData.age || 30,
      goals: injuryData.goals || ['Reduce pain', 'Return to sports', 'Improve mobility'],
      limitations: injuryData.limitations || [],
      preferredSessionDuration: injuryData.sessionDuration || 20, // minutes
      availableDays: injuryData.availableDays || 3, // days per week
      previousInjuries: injuryData.previousInjuries || []
    };
    
    console.log('✅ User profile created with normalized injury type:', profile.injuryType);
    return profile;
  }
  
  /**
   * Convert exercise session to session history
   */
  static createSessionHistory(sessionData: any): SessionHistory {
    return {
      sessionId: sessionData.id || `session-${Date.now()}`,
      date: new Date(sessionData.date || Date.now()),
      exercisesCompleted: sessionData.exercises || [],
      completionRate: sessionData.completionRate || 0,
      prePainLevel: sessionData.prePainLevel || 5,
      postPainLevel: sessionData.postPainLevel || 5,
      effortLevel: sessionData.effortLevel || 5,
      formQualityScore: sessionData.formQuality || 70,
      duration: sessionData.duration || 20,
      notes: sessionData.notes
    };
  }
  
  /**
   * Generate personalized weekly plan
   * Now simplified - all exercise data comes from injuryPlans.ts via rehabEngine
   */
  static generatePlan(userId: string, injuryData: any, sessionData: any[]): PersonalizedPlan {
    console.log('🎯 Generating personalized plan for user:', userId);
    
    const userProfile = this.createUserProfile(userId, injuryData);
    const sessionHistory = sessionData.map(s => this.createSessionHistory(s));
    
    // The rehabEngine now pulls exercises directly from injuryPlans.ts
    // No enrichment needed - everything is already there!
    const plan = rehabEngine.generateWeeklyPlan(userProfile, sessionHistory);
    
    console.log('✅ Generated plan with', plan.exercises.length, 'exercises');
    
    return plan;
  }
  
  /**
   * Track session completion and update metrics
   */
  static trackSession(
    sessionData: any,
    onComplete?: (metrics: any) => void
  ): void {
    const session = this.createSessionHistory(sessionData);
    
    // Save to localStorage or backend
    this.saveSessionToStorage(session);
    
    // Calculate updated metrics
    const allSessions = this.getAllSessions(sessionData.userId);
    const metrics = this.calculateQuickMetrics(allSessions);
    
    if (onComplete) {
      onComplete(metrics);
    }
  }
  
  /**
   * Get user's session history from storage
   */
  private static getAllSessions(userId: string): SessionHistory[] {
    const key = `rehab_sessions_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }
  
  /**
   * Save session to localStorage
   */
  private static saveSessionToStorage(session: SessionHistory): void {
    const userId = 'current_user'; // Replace with actual user ID
    const key = `rehab_sessions_${userId}`;
    const sessions = this.getAllSessions(userId);
    sessions.push(session);
    
    // Keep last 100 sessions
    if (sessions.length > 100) {
      sessions.shift();
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));
  }
  
  /**
   * Calculate quick metrics for display
   */
  private static calculateQuickMetrics(sessions: SessionHistory[]): any {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgCompletionRate: 0,
        avgPainLevel: 5,
        streak: 0
      };
    }
    
    const recent = sessions.slice(-7);
    
    return {
      totalSessions: sessions.length,
      avgCompletionRate: recent.reduce((sum, s) => sum + s.completionRate, 0) / recent.length,
      avgPainLevel: recent.reduce((sum, s) => sum + s.postPainLevel, 0) / recent.length,
      streak: this.calculateStreak(sessions)
    };
  }
  
  private static calculateStreak(sessions: SessionHistory[]): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasSession) {
        streak++;
      } else if (i > 0) { // Allow grace for today
        break;
      }
    }
    
    return streak;
  }
}
