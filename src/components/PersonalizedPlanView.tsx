// Personalized Rehab Plan Display Component

import { useState, useEffect } from 'react';
import { PersonalizationService } from '../services/personalizationService';
import type { PersonalizedPlan } from '../types/personalization';
import '../styles/PersonalizedPlan.css';

interface PersonalizedPlanViewProps {
  userId: string;
  injuryData: any;
  sessionHistory: any[];
  onStartExercise?: (exerciseId: string) => void;
}

export default function PersonalizedPlanView({ 
  userId, 
  injuryData, 
  sessionHistory,
  onStartExercise 
}: PersonalizedPlanViewProps) {
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePlan();
  }, [userId, injuryData, sessionHistory]);

  const generatePlan = () => {
    setLoading(true);
    try {
      console.log('🔨 Generating plan with data:', { userId, injuryData, sessionHistory });
      const personalizedPlan = PersonalizationService.generatePlan(
        userId,
        injuryData,
        sessionHistory
      );
      console.log('📦 Received plan:', personalizedPlan);
      console.log('📋 Number of exercises:', personalizedPlan.exercises.length);
      setPlan(personalizedPlan);
    } catch (error) {
      console.error('❌ Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="plan-loading">
        <div className="spinner"></div>
        <p>Creating your personalized plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="plan-error">
        <p>Unable to generate plan. Please try again.</p>
        <button onClick={generatePlan}>Retry</button>
      </div>
    );
  }

  return (
    <div className="personalized-plan">
      {/* Header Section */}
      <div className="plan-header">
        <div className="phase-badge" data-phase={plan.phase}>
          📍 {plan.phase.replace('_', ' ')} PHASE
        </div>
        <h2>Your Week {plan.weekNumber} Plan</h2>
        <p className="plan-subtitle">
          {plan.sessionsPerWeek} sessions per week · {Math.round(plan.estimatedDuration)} min each
        </p>
      </div>

      {/* Motivational Message */}
      <div className="motivational-card">
        <div className="motivation-icon">💪</div>
        <p className="motivation-text">{plan.motivationalMessage}</p>
      </div>

      {/* Warnings (if any) */}
      {plan.warnings.length > 0 && (
        <div className="warnings-section">
          {plan.warnings.map((warning, idx) => (
            <div key={idx} className="warning-item">
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Focus Areas */}
      <div className="focus-section">
        <h3>🎯 This Week's Focus</h3>
        <div className="focus-areas">
          {plan.focusAreas.map((area, idx) => (
            <span key={idx} className="focus-tag">{area}</span>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div className="exercises-section">
        <h3>📋 Your Exercises ({plan.exercises.length})</h3>
        
        {plan.exercises.length === 0 ? (
          <div className="no-exercises-message">
            <p>⚠️ No exercises available for your current configuration.</p>
            <p>Please try regenerating your plan or contact support.</p>
            <button onClick={generatePlan}>🔄 Regenerate Plan</button>
          </div>
        ) : (
          <div className="exercises-grid">
            {plan.exercises.map((exercise, idx) => (
              <div key={exercise.exerciseId} className="exercise-card">
              <div className="exercise-header">
                <div className="exercise-number">#{idx + 1}</div>
                <h4>{exercise.name}</h4>
                <div className="difficulty-badge" data-level={exercise.difficulty}>
                  Difficulty: {exercise.difficulty}/10
                </div>
              </div>

              <div className="exercise-details">
                <div className="detail-item">
                  <span className="detail-label">Sets:</span>
                  <span className="detail-value">{exercise.sets}</span>
                </div>
                {exercise.reps && (
                  <div className="detail-item">
                    <span className="detail-label">Reps:</span>
                    <span className="detail-value">{exercise.reps}</span>
                  </div>
                )}
                {exercise.holdTime && (
                  <div className="detail-item">
                    <span className="detail-label">Hold:</span>
                    <span className="detail-value">{exercise.holdTime}s</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Rest:</span>
                  <span className="detail-value">{exercise.restTime}s</span>
                </div>
              </div>

              <div className="exercise-reasoning">
                <strong>Why this exercise?</strong>
                <p>{exercise.reasoning}</p>
              </div>

              <div className="exercise-expectations">
                <span className="pain-indicator" data-level={exercise.expectedPainLevel}>
                  Expected: {exercise.expectedPainLevel} discomfort
                </span>
              </div>

              {exercise.modifications.length > 0 && (
                <div className="modifications">
                  <strong>💡 Tips:</strong>
                  <ul>
                    {exercise.modifications.map((mod, modIdx) => (
                      <li key={modIdx}>{mod}</li>
                    ))}
                  </ul>
                </div>
              )}

              {onStartExercise && (
                <button 
                  className="start-exercise-btn"
                  onClick={() => onStartExercise(exercise.exerciseId)}
                >
                  Start Exercise
                </button>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Next Milestone */}
      <div className="milestone-section">
        <h3>🏆 Next Milestone</h3>
        <div className="milestone-card">
          <div className="milestone-icon">🎯</div>
          <p>{plan.nextMilestone}</p>
        </div>
      </div>

      {/* Plan Stats */}
      <div className="plan-stats">
        <div className="stat-item">
          <div className="stat-value">{plan.difficultyLevel}/10</div>
          <div className="stat-label">Overall Difficulty</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{plan.exercises.length}</div>
          <div className="stat-label">Exercises</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{plan.sessionsPerWeek}x</div>
          <div className="stat-label">Per Week</div>
        </div>
      </div>

      {/* Regenerate Button */}
      <div className="plan-actions">
        <button className="regenerate-btn" onClick={generatePlan}>
          🔄 Regenerate Plan
        </button>
      </div>
    </div>
  );
}
