import { useState, useEffect } from 'react';
import { injuryRehabService } from '../services/dataService';
import { type InjuryRehabPlan, type RehabPhase } from '../types/injuries';
import '../styles/InjuryRehabProgram.css';

interface InjuryRehabProgramProps {
  userId: string;
  onBack: () => void;
}

export default function InjuryRehabProgram({ userId, onBack }: InjuryRehabProgramProps) {
  const [plan, setPlan] = useState<InjuryRehabPlan | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [showPainLog, setShowPainLog] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [painNote, setPainNote] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const rehabPlan = injuryRehabService.getInjuryPlan(userId);
    const userProgress = injuryRehabService.getInjuryProgress(userId);
    setPlan(rehabPlan);
    setProgress(userProgress);
    if (userProgress) {
      setSelectedPhase(userProgress.currentPhase);
    }
  };

  const handleToggleExercise = (exerciseId: string) => {
    const isCompleted = injuryRehabService.isExerciseCompleted(userId, exerciseId);
    if (isCompleted) {
      injuryRehabService.uncompleteExercise(userId, exerciseId);
    } else {
      injuryRehabService.completeExercise(userId, exerciseId);
    }
    loadData();
  };

  const handleLogPain = () => {
    injuryRehabService.updatePainLevel(userId, painLevel, painNote);
    setShowPainLog(false);
    setPainLevel(0);
    setPainNote('');
    loadData();
  };

  const handleProgressPhase = () => {
    if (window.confirm('Are you sure you want to progress to the next phase? Consult with your therapist first.')) {
      injuryRehabService.progressToNextPhase(userId);
      loadData();
    }
  };

  if (!plan || !progress) {
    return (
      <div className="injury-rehab-loading">
        <p>Loading your rehabilitation plan...</p>
      </div>
    );
  }

  const currentPhase = plan.phases[selectedPhase - 1];
  const completedInPhase = currentPhase.exercises.filter(ex => 
    progress.completedExercises.includes(ex.id)
  ).length;
  const totalInPhase = currentPhase.exercises.length;
  const phaseProgress = (completedInPhase / totalInPhase) * 100;

  return (
    <div className="injury-rehab-program">
      {/* Header */}
      <div className="rehab-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="rehab-title">
          <span className="injury-icon-large">{plan.injuryInfo.icon}</span>
          <div>
            <h1>{plan.injuryInfo.name} Rehabilitation</h1>
            <p className="injury-subtitle">{plan.injuryInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="rehab-stats-grid">
        <div className="stat-box">
          <span className="stat-icon">📅</span>
          <div>
            <div className="stat-value">Week {progress.currentWeek}</div>
            <div className="stat-label">of {plan.totalWeeks}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">🎯</span>
          <div>
            <div className="stat-value">Phase {progress.currentPhase}</div>
            <div className="stat-label">of {plan.phases.length}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">✅</span>
          <div>
            <div className="stat-value">{progress.completedExercises.length}</div>
            <div className="stat-label">Exercises Done</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">😊</span>
          <div>
            <div className="stat-value">{progress.painLevel}/10</div>
            <div className="stat-label">Pain Level</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="rehab-content">
        {/* Left Sidebar - Phase Navigation */}
        <div className="phases-sidebar">
          <h3>Rehabilitation Phases</h3>
          {plan.phases.map((phase: RehabPhase) => (
            <button
              key={phase.phase}
              className={`phase-nav-btn ${selectedPhase === phase.phase ? 'active' : ''} ${progress.currentPhase > phase.phase ? 'completed' : ''} ${progress.currentPhase < phase.phase ? 'locked' : ''}`}
              onClick={() => setSelectedPhase(phase.phase)}
              disabled={progress.currentPhase < phase.phase}
            >
              <div className="phase-nav-header">
                <span className="phase-number">Phase {phase.phase}</span>
                {progress.currentPhase > phase.phase && <span className="check-icon">✓</span>}
                {progress.currentPhase < phase.phase && <span className="lock-icon">🔒</span>}
              </div>
              <div className="phase-nav-title">{phase.name}</div>
              <div className="phase-nav-duration">{phase.duration}</div>
            </button>
          ))}
        </div>

        {/* Main Content - Current Phase Details */}
        <div className="phase-content">
          <div className="phase-header">
            <div>
              <h2>{currentPhase.name}</h2>
              <p className="phase-duration">{currentPhase.duration}</p>
            </div>
            {selectedPhase === progress.currentPhase && selectedPhase < plan.phases.length && (
              <button className="progress-phase-btn" onClick={handleProgressPhase}>
                Advance to Next Phase →
              </button>
            )}
          </div>

          {/* Phase Progress Bar */}
          <div className="phase-progress-section">
            <div className="progress-bar-header">
              <span>Phase Progress</span>
              <span>{completedInPhase}/{totalInPhase} exercises</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${phaseProgress}%` }}></div>
            </div>
          </div>

          {/* Goals */}
          <div className="phase-section">
            <h3>🎯 Phase Goals</h3>
            <ul className="goals-list">
              {currentPhase.goals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </div>

          {/* Precautions */}
          <div className="phase-section precautions-section">
            <h3>⚠️ Precautions</h3>
            <ul className="precautions-list">
              {currentPhase.precautions.map((precaution, idx) => (
                <li key={idx}>{precaution}</li>
              ))}
            </ul>
          </div>

          {/* Exercises */}
          <div className="phase-section">
            <h3>💪 Exercises for This Phase</h3>
            <div className="exercises-grid">
              {currentPhase.exercises.map((exercise) => {
                const isCompleted = progress.completedExercises.includes(exercise.id);
                return (
                  <div key={exercise.id} className={`exercise-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="exercise-header">
                      <span className="exercise-emoji">{exercise.image}</span>
                      <span className={`difficulty-badge ${exercise.difficulty}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    
                    <h4>{exercise.name}</h4>
                    
                    {/* Media Section - Video or Images */}
                    {exercise.media && (exercise.media.videoUrl || exercise.media.images) && (
                      <div className="exercise-media">
                        {exercise.media.videoUrl ? (
                          <div className="video-container">
                            <video 
                              controls 
                              poster={exercise.media.thumbnail}
                              preload="metadata"
                              className="exercise-video"
                            >
                              <source src={exercise.media.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : exercise.media.images && exercise.media.images.length > 0 ? (
                          <div className="image-gallery">
                            {exercise.media.images.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`${exercise.name} step ${idx + 1}`}
                                className="exercise-image"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    {/* Placeholder for exercises without media */}
                    {(!exercise.media || (!exercise.media.videoUrl && !exercise.media.images)) && (
                      <div className="exercise-media-placeholder">
                        <div className="placeholder-content">
                          <span className="placeholder-icon">🎥</span>
                          <span className="placeholder-text">Demo Coming Soon</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="exercise-desc">{exercise.description}</p>
                    
                    <div className="exercise-details">
                      <div className="detail-row">
                        <span>🔄 {exercise.sets} sets × {exercise.reps} reps</span>
                      </div>
                      {exercise.hold && (
                        <div className="detail-row">
                          <span>⏱️ {exercise.hold}</span>
                        </div>
                      )}
                      {exercise.requiredEquipment && (
                        <div className="detail-row">
                          <span>🛠️ {exercise.requiredEquipment.join(', ')}</span>
                        </div>
                      )}
                      <div className="detail-row pain-threshold">
                        <span>⚠️ {exercise.painThreshold}</span>
                      </div>
                    </div>
                    
                    <button
                      className={`exercise-toggle-btn ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleToggleExercise(exercise.id)}
                    >
                      {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Guidelines */}
        <div className="guidelines-sidebar">
          {/* Do's */}
          <div className="guideline-section">
            <h3>✅ Do's</h3>
            <ul className="guideline-list">
              {plan.dosList.slice(0, 5).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="guideline-section">
            <h3>❌ Don'ts</h3>
            <ul className="guideline-list">
              {plan.dontsList.slice(0, 5).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Pain Logger */}
          <div className="pain-logger-section">
            <h3>📝 Log Pain Level</h3>
            {!showPainLog ? (
              <button className="log-pain-btn" onClick={() => setShowPainLog(true)}>
                Log Current Pain
              </button>
            ) : (
              <div className="pain-log-form">
                <label>Pain Level: {painLevel}/10</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="pain-slider"
                />
                <textarea
                  placeholder="Add notes (optional)..."
                  value={painNote}
                  onChange={(e) => setPainNote(e.target.value)}
                  rows={3}
                />
                <div className="pain-log-actions">
                  <button onClick={handleLogPain} className="submit-pain-btn">Submit</button>
                  <button onClick={() => setShowPainLog(false)} className="cancel-pain-btn">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* When to See Doctor */}
          <div className="guideline-section warning-section">
            <h3>🚨 See Doctor If:</h3>
            <ul className="guideline-list">
              {plan.whenToSeeDoctor.slice(0, 4).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
