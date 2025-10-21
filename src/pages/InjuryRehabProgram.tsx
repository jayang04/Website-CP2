import { useState, useEffect, useRef } from 'react';
import { injuryRehabService } from '../services/dataService';
import { type InjuryRehabPlan, type RehabPhase } from '../types/injuries';
import { requiresAngleDetection } from '../data/exerciseAngleConfig';
import ExerciseAngleTracker from '../components/ExerciseAngleTracker';
import '../styles/InjuryRehabProgram.css';
import '../styles/AngleDetector.css';

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
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAngleDetector, setShowAngleDetector] = useState(false);
  const [exerciseForAngleDetection, setExerciseForAngleDetection] = useState<any>(null);
  
  // Track all video elements for auto-pause functionality
  const videoRefs = useRef<Map<HTMLVideoElement, () => void>>(new Map());

  // Function to register video element with proper cleanup
  const registerVideo = (video: HTMLVideoElement | null) => {
    // Cleanup previous video if exists
    if (video === null) return;

    // Check if already registered
    if (videoRefs.current.has(video)) return;

    console.log('🎥 Registering video:', video.currentSrc || 'modal video');

    // Add play event listener to pause other videos
    const handlePlay = () => {
      console.log('▶️ Video started playing, pausing others...');
      pauseAllVideosExcept(video);
    };
    
    video.addEventListener('play', handlePlay);
    
    // Store cleanup function
    const cleanup = () => {
      video.removeEventListener('play', handlePlay);
      videoRefs.current.delete(video);
    };
    
    videoRefs.current.set(video, cleanup);
  };

  // Function to pause all videos except the one currently playing
  const pauseAllVideosExcept = (currentVideo: HTMLVideoElement) => {
    let pausedCount = 0;
    videoRefs.current.forEach((_cleanup, video) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
        pausedCount++;
        console.log('⏸️ Auto-paused video:', video.currentSrc || 'a video');
      }
    });
    console.log(`✅ Auto-pause complete: ${pausedCount} video(s) paused, ${videoRefs.current.size} total videos tracked`);
  };

  // Function to pause ALL videos (used when opening modals)
  const pauseAllVideos = () => {
    let pausedCount = 0;
    videoRefs.current.forEach((_cleanup, video) => {
      if (!video.paused) {
        video.pause();
        pausedCount++;
        console.log('⏸️ Paused video due to modal open:', video.currentSrc || 'a video');
      }
    });
    console.log(`✅ All videos paused: ${pausedCount} video(s) stopped`);
  };

  // Cleanup all videos on unmount
  useEffect(() => {
    return () => {
      videoRefs.current.forEach((cleanup) => cleanup());
      videoRefs.current.clear();
    };
  }, []);

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

  const handleOpenExerciseModal = (exercise: any) => {
    pauseAllVideos(); // Pause all playing videos when modal opens
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleCloseExerciseModal = () => {
    setShowExerciseModal(false);
    setSelectedExercise(null);
  };

  const handleProgressPhase = () => {
    pauseAllVideos(); // Pause all playing videos when modal opens
    setShowProgressModal(true);
  };

  const confirmProgressPhase = () => {
    injuryRehabService.progressToNextPhase(userId);
    loadData();
    setShowProgressModal(false);
  };

  const handleOpenAngleDetector = (exercise: any) => {
    setExerciseForAngleDetection(exercise);
    setShowAngleDetector(true);
  };

  const handleCloseAngleDetector = () => {
    setShowAngleDetector(false);
    setExerciseForAngleDetection(null);
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
                              ref={registerVideo}
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
                    
                    <p className="exercise-desc">{exercise.summary || exercise.description}</p>
                    
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
                    
                    <div className="exercise-actions">
                      <button
                        className="exercise-info-btn"
                        onClick={() => handleOpenExerciseModal(exercise)}
                      >
                        ℹ️ Need Help? Click Here for More Details
                      </button>
                      
                      <button
                        className={`exercise-toggle-btn ${isCompleted ? 'completed' : ''}`}
                        onClick={() => handleToggleExercise(exercise.id)}
                      >
                        {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                      </button>

                      {requiresAngleDetection(exercise.name) && (
                        <button
                          className="ai-form-check-btn"
                          onClick={() => handleOpenAngleDetector(exercise)}
                        >
                          📐 Live Form Tracker
                        </button>
                      )}
                    </div>
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

      {/* Exercise Detail Modal */}
      {showExerciseModal && selectedExercise && (
        <div className="exercise-modal-overlay" onClick={handleCloseExerciseModal}>
          <div className="exercise-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseExerciseModal}>
              ✕
            </button>
            
            <div className="modal-header">
              <span className="modal-exercise-emoji">{selectedExercise.image}</span>
              <div>
                <h2>{selectedExercise.name}</h2>
                <span className={`difficulty-badge ${selectedExercise.difficulty}`}>
                  {selectedExercise.difficulty}
                </span>
              </div>
            </div>

            <div className="modal-body">
              {/* Large Video/Media Section */}
              <div className="modal-media-section">
                {selectedExercise.media?.videoUrl ? (
                  <div className="modal-video-container">
                    <video 
                      ref={registerVideo}
                      controls 
                      poster={selectedExercise.media.thumbnail}
                      className="modal-exercise-video"
                    >
                      <source src={selectedExercise.media.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : selectedExercise.media?.images && selectedExercise.media.images.length > 0 ? (
                  <div className="modal-image-gallery">
                    {selectedExercise.media.images.map((img: string, idx: number) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`${selectedExercise.name} step ${idx + 1}`}
                        className="modal-exercise-image"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="modal-media-placeholder">
                    <span className="placeholder-icon-large">🎥</span>
                    <p>Demo video coming soon</p>
                  </div>
                )}
              </div>

              {/* Detailed Information */}
              <div className="modal-info-section">
                <div className="modal-section">
                  <h3>📋 Exercise Details</h3>
                  <div className="modal-specs">
                    <div className="spec-item">
                      <span className="spec-label">Sets:</span>
                      <span className="spec-value">{selectedExercise.sets}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Reps:</span>
                      <span className="spec-value">{selectedExercise.reps}</span>
                    </div>
                    {selectedExercise.hold && (
                      <div className="spec-item">
                        <span className="spec-label">Hold Time:</span>
                        <span className="spec-value">{selectedExercise.hold}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-section">
                  <h3>📝 Full Description</h3>
                  <div className="modal-description">
                    {selectedExercise.description.split('\n').map((line: string, idx: number) => (
                      <p key={idx} className="description-line">{line}</p>
                    ))}
                  </div>
                </div>

                {selectedExercise.requiredEquipment && (
                  <div className="modal-section">
                    <h3>🛠️ Required Equipment</h3>
                    <ul className="equipment-list">
                      {selectedExercise.requiredEquipment.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-section">
                  <h3>⚠️ Pain Threshold</h3>
                  <div className="pain-threshold-box">
                    {selectedExercise.painThreshold}
                  </div>
                </div>

                <div className="modal-section">
                  <h3>💡 Key Tips</h3>
                  <ul className="tips-list">
                    <li>Maintain proper form throughout the exercise</li>
                    <li>Breathe steadily - don't hold your breath</li>
                    <li>Stop immediately if you feel sharp pain</li>
                    <li>Progress gradually - don't rush recovery</li>
                    <li>Warm up before and stretch after</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className={`modal-complete-btn ${progress.completedExercises.includes(selectedExercise.id) ? 'completed' : ''}`}
                onClick={() => {
                  handleToggleExercise(selectedExercise.id);
                  handleCloseExerciseModal();
                }}
              >
                {progress.completedExercises.includes(selectedExercise.id) ? '✓ Completed' : 'Mark as Complete'}
              </button>
              <button className="modal-cancel-btn" onClick={handleCloseExerciseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Phase Confirmation Modal */}
      {showProgressModal && (
        <div className="exercise-modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="progress-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowProgressModal(false)}>
              ✕
            </button>
            
            <div className="progress-modal-header">
              <div className="progress-modal-icon">⚠️</div>
              <h2>Advance to Next Phase?</h2>
            </div>

            <div className="progress-modal-body">
              <p className="progress-modal-warning">
                Before progressing to the next phase, please ensure:
              </p>
              <ul className="progress-checklist">
                <li>✓ You've completed all exercises in the current phase</li>
                <li>✓ You can perform exercises with minimal to no pain</li>
                <li>✓ You've consulted with your physical therapist</li>
                <li>✓ You meet the phase completion criteria</li>
              </ul>
              <p className="progress-modal-note">
                <strong>Important:</strong> Progressing too quickly may increase injury risk. 
                Always consult your healthcare provider before advancing phases.
              </p>
            </div>

            <div className="progress-modal-footer">
              <button className="progress-confirm-btn" onClick={confirmProgressPhase}>
                Yes, Advance Phase
              </button>
              <button className="progress-cancel-btn" onClick={() => setShowProgressModal(false)}>
                Not Yet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Angle Detection Modal */}
      {showAngleDetector && exerciseForAngleDetection && (
        <div className="angle-detector-overlay" onClick={handleCloseAngleDetector}>
          <div className="angle-detector-content-full" onClick={(e) => e.stopPropagation()}>
            <ExerciseAngleTracker 
              exerciseName={exerciseForAngleDetection.name}
              onComplete={(reps: number, duration: number) => {
                console.log(`Exercise completed: ${reps} reps in ${duration}s`);
                // Could save this to user's progress here
              }}
              onClose={handleCloseAngleDetector}
            />
          </div>
        </div>
      )}
    </div>
  );
}
