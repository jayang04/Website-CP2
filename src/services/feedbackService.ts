// Feedback Service with Decision Tree Logic
// Implements the feedback and motivational support features

import type { 
  ExerciseFeedback, 
  FeedbackResponse, 
  FeedbackHistory
} from '../types/feedback';

class FeedbackService {
  private static feedbackHistory: Map<string, ExerciseFeedback[]> = new Map();

  /**
   * Store feedback in memory and Firebase
   */
  static async storeFeedback(feedback: ExerciseFeedback): Promise<void> {
    const userFeedbacks = this.feedbackHistory.get(feedback.userId) || [];
    userFeedbacks.push(feedback);
    this.feedbackHistory.set(feedback.userId, userFeedbacks);

    // Store in localStorage for persistence
    try {
      localStorage.setItem(
        `feedback_${feedback.userId}`,
        JSON.stringify(userFeedbacks)
      );
    } catch (error) {
      console.error('Error storing feedback:', error);
    }
  }

  /**
   * Get user's feedback history
   */
  static getFeedbackHistory(userId: string): ExerciseFeedback[] {
    // Try to load from localStorage first
    try {
      const stored = localStorage.getItem(`feedback_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.feedbackHistory.set(userId, parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading feedback history:', error);
    }

    return this.feedbackHistory.get(userId) || [];
  }

  /**
   * Calculate feedback statistics for personalization
   */
  static calculateFeedbackStats(userId: string): FeedbackHistory {
    const feedbacks = this.getFeedbackHistory(userId);
    
    if (feedbacks.length === 0) {
      return {
        userId,
        feedbacks: [],
        lastFeedbackDate: new Date(),
        averagePainLevel: 0,
        averageDifficulty: 0,
        completionRate: 100
      };
    }

    const painLevels = feedbacks
      .filter(f => f.painExperienced && f.painLevel)
      .map(f => f.painLevel as number);
    
    const difficultyMap = { 'easy': 1, 'moderate': 2, 'difficult': 3, 'too-difficult': 4 };
    const difficulties = feedbacks.map(f => difficultyMap[f.difficultyRating]);
    
    const completed = feedbacks.filter(f => f.completed).length;
    
    return {
      userId,
      feedbacks,
      lastFeedbackDate: new Date(feedbacks[feedbacks.length - 1].timestamp),
      averagePainLevel: painLevels.length > 0 
        ? painLevels.reduce((a, b) => a + b, 0) / painLevels.length 
        : 0,
      averageDifficulty: difficulties.reduce((a, b) => a + b, 0) / difficulties.length,
      completionRate: (completed / feedbacks.length) * 100
    };
  }

  /**
   * DECISION TREE LOGIC
   * Generate contextual response based on user feedback
   */
  static generateFeedbackResponse(
    feedback: ExerciseFeedback,
    history?: FeedbackHistory
  ): FeedbackResponse {
    const stats = history || this.calculateFeedbackStats(feedback.userId);
    const previousFeedbacks = stats.feedbacks.slice(-5); // Last 5 feedbacks

    // CRITICAL PATH: High pain level
    if (feedback.painExperienced && feedback.painLevel && feedback.painLevel >= 8) {
      return {
        message: "⚠️ High pain level detected. Please stop and rest. Consider consulting your healthcare provider before continuing.",
        type: 'warning',
        icon: '⚠️',
        suggestedAction: 'Rest and consult healthcare provider',
        adjustIntensity: true
      };
    }

    // MODERATE-HIGH PAIN PATH
    if (feedback.painExperienced && feedback.painLevel && feedback.painLevel >= 6) {
      return {
        message: "🧘 Moderate pain detected. Take a break and reduce the intensity of your exercises. Focus on proper form rather than repetitions.",
        type: 'warning',
        icon: '🧘',
        suggestedAction: 'Reduce intensity and focus on form',
        adjustIntensity: true
      };
    }

    // TOO DIFFICULT PATH
    if (feedback.difficultyRating === 'too-difficult' && !feedback.completed) {
      // Check if this is consistent pattern
      const recentDifficult = previousFeedbacks.filter(
        f => f.difficultyRating === 'too-difficult' || f.difficultyRating === 'difficult'
      ).length;

      if (recentDifficult >= 3) {
        return {
          message: "💪 We notice you're finding exercises challenging. That's completely normal! Let's adjust the intensity for your next session so you can build strength gradually.",
          type: 'adjustment',
          icon: '💪',
          suggestedAction: 'Reduce sets/reps or modify exercise',
          adjustIntensity: true
        };
      }

      return {
        message: "💪 It's okay to take it slow! Recovery is a journey, not a race. Try reducing the number of repetitions and focus on proper form.",
        type: 'encouragement',
        icon: '💪',
        suggestedAction: 'Reduce repetitions, maintain form',
        adjustIntensity: false
      };
    }

    // DIFFICULT BUT COMPLETED PATH
    if (feedback.difficultyRating === 'difficult' && feedback.completed) {
      return {
        message: "🌟 Great perseverance! You pushed through a challenging session. Remember to rest adequately before your next workout.",
        type: 'motivation',
        icon: '🌟',
        suggestedAction: 'Rest well before next session',
        adjustIntensity: false
      };
    }

    // MILD PAIN BUT COMPLETED PATH
    if (feedback.painExperienced && feedback.painLevel && feedback.painLevel <= 3 && feedback.completed) {
      return {
        message: "✅ Mild discomfort is normal during rehab. You're doing great! Keep monitoring your pain levels and don't hesitate to rest if needed.",
        type: 'motivation',
        icon: '✅',
        suggestedAction: 'Continue monitoring pain levels',
        adjustIntensity: false
      };
    }

    // EXCELLENT PERFORMANCE PATH
    if (!feedback.painExperienced && feedback.completed && 
        (feedback.difficultyRating === 'easy' || feedback.difficultyRating === 'moderate')) {
      
      // Check for consistent good performance
      const recentSuccess = previousFeedbacks.filter(
        f => f.completed && !f.painExperienced
      ).length;

      if (recentSuccess >= 4) {
        return {
          message: "🎉 Outstanding work! You're showing excellent consistency. You might be ready to progress to the next phase soon!",
          type: 'motivation',
          icon: '🎉',
          suggestedAction: 'Consider advancing to next phase',
          adjustIntensity: false
        };
      }

      return {
        message: "🎯 Excellent work! You're making great progress. Keep up this consistency!",
        type: 'motivation',
        icon: '🎯',
        suggestedAction: 'Maintain current routine',
        adjustIntensity: false
      };
    }

    // NOT COMPLETED PATH
    if (!feedback.completed) {
      const recentIncomplete = previousFeedbacks.filter(f => !f.completed).length;
      
      if (recentIncomplete >= 3) {
        return {
          message: "💬 We notice you're having trouble completing sessions. That's okay! Let's adjust your program to better match your current capability. Small steps lead to big progress!",
          type: 'encouragement',
          icon: '💬',
          suggestedAction: 'Reduce session difficulty',
          adjustIntensity: true
        };
      }

      return {
        message: "🤗 It's perfectly fine to not complete every session. Listen to your body and try again tomorrow. Progress isn't always linear!",
        type: 'encouragement',
        icon: '🤗',
        suggestedAction: 'Rest and try again tomorrow',
        adjustIntensity: false
      };
    }

    // DEFAULT POSITIVE PATH
    return {
      message: "👍 Good job completing your session! Every step forward counts toward your recovery.",
      type: 'motivation',
      icon: '👍',
      suggestedAction: 'Keep up the good work',
      adjustIntensity: false
    };
  }

  /**
   * Generate personalized encouragement message based on history
   */
  static generatePersonalizedEncouragement(userId: string): string {
    const stats = this.calculateFeedbackStats(userId);
    
    if (stats.feedbacks.length === 0) {
      return "🚀 Welcome to your rehabilitation journey! Let's start building healthy habits together.";
    }

    // High completion rate
    if (stats.completionRate >= 90) {
      return "⭐ Your dedication is incredible! You're completing sessions consistently - this is the key to successful recovery!";
    }

    // Improving pain levels
    if (stats.averagePainLevel < 3) {
      return "🎊 Your pain levels are staying low - excellent! This shows your body is responding well to the exercises.";
    }

    // Moderate difficulty
    if (stats.averageDifficulty >= 2 && stats.averageDifficulty < 3) {
      return "💪 You're challenging yourself at just the right level. Keep pushing, but remember to listen to your body!";
    }

    // Needs encouragement
    if (stats.completionRate < 50) {
      return "🌱 Every journey starts with small steps. Don't be discouraged - consistency matters more than perfection!";
    }

    return "✨ You're making progress! Keep going, you've got this!";
  }

  /**
   * Check if user needs a reminder based on feedback history
   */
  static shouldSendReminder(userId: string): boolean {
    const feedbacks = this.getFeedbackHistory(userId);
    
    if (feedbacks.length === 0) {
      return true; // New user, send reminder
    }

    const lastFeedback = feedbacks[feedbacks.length - 1];
    const hoursSinceLastActivity = 
      (Date.now() - new Date(lastFeedback.timestamp).getTime()) / (1000 * 60 * 60);
    
    // Send reminder if no activity for 24+ hours
    return hoursSinceLastActivity >= 24;
  }

  /**
   * Get contextual reminder message
   */
  static getContextualReminder(userId: string): string {
    const stats = this.calculateFeedbackStats(userId);
    
    if (stats.feedbacks.length === 0) {
      return "🏃 Time to start your rehabilitation exercises! Your future self will thank you.";
    }

    const daysSinceLastActivity = Math.floor(
      (Date.now() - stats.lastFeedbackDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity === 0) {
      return "💪 Great job staying active today! Ready for your next session?";
    }

    if (daysSinceLastActivity === 1) {
      return "⏰ It's time for your daily exercises! Let's maintain that momentum!";
    }

    if (daysSinceLastActivity >= 2) {
      return "🎯 We missed you! It's been a couple days - let's get back on track with a gentle session.";
    }

    return "🔔 Time for your rehabilitation exercises!";
  }
}

export default FeedbackService;
