// Personalized Rehab Plan Display Component

import { useState, useEffect, useRef } from 'react';
import { PersonalizationService } from '../services/personalizationService';
import type { PersonalizedPlan } from '../types/personalization';
import { requiresAngleDetection } from '../data/exerciseAngleConfig';
import ExerciseAngleTracker from './ExerciseAngleTracker';
import { cloudDashboardService, cloudCompletionsService } from '../services/cloudDataService';
import { useBadges } from '../hooks/useBadges';
import BadgeNotificationToast from './BadgeNotificationToast';
import { getCloudinaryVideoUrl, convertToCloudinaryPath } from '../services/cloudinaryService';
import FeedbackModal from './FeedbackModal';
import type { ExerciseFeedback, FeedbackResponse } from '../types/feedback';
import '../styles/InjuryRehabProgram.css';
import '../styles/PersonalizedPlan.css';
import '../styles/AngleDetector.css';

interface PersonalizedPlanViewProps {
  userId: string;
  injuryData: any;
  sessionHistory: any[];
  onDashboardRefresh?: () => void;
}

// Helper to get today's date string (YYYY-MM-DD)
const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Helper to get program start date for week calculation (from cloud)
const getProgramStartDate = async (userId: string): Promise<Date> => {
  return await cloudCompletionsService.getProgramStartDate(userId);
};

// Helper to calculate current week number
const calculateCurrentWeek = async (userId: string): Promise<number> => {
  const startDate = await getProgramStartDate(userId);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil(diffDays / 7);
  return Math.max(1, weekNumber);
};

export default function PersonalizedPlanView({ 
  userId, 
  injuryData, 
  sessionHistory,
  onDashboardRefresh
}: PersonalizedPlanViewProps) {
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showAngleDetector, setShowAngleDetector] = useState(false);
  const [exerciseForAngleDetection, setExerciseForAngleDetection] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [lastCompletedExercise, setLastCompletedExercise] = useState<{id: string, name: string} | null>(null);
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackExercise, setFeedbackExercise] = useState<{id: string, name: string} | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Badge system integration
  const { notifications, checkBadges, dismissNotification } = useBadges(userId);
  
  // Track all video elements for auto-pause functionality
  const videoRefs = useRef<Map<HTMLVideoElement, () => void>>(new Map());
  
  // Store pending badge check data to run after feedback modal closes
  const pendingBadgeCheck = useRef<any>(null);

  // Helper function to update dashboard progress and days active
  const updateDashboardProgress = async () => {
    try {
      // Track activity and get days active
      const daysActive = await cloudDashboardService.trackActivity(userId);
      
      // Calculate progress percentage for personalized plan
      const totalExercises = plan?.exercises.length || 0;
      const progressPercentage = await cloudDashboardService.calculatePersonalizedProgress(
        userId, 
        completedExercises.length, 
        totalExercises
      );
      
      // Update dashboard stats
      await cloudDashboardService.updateStats(userId, {
        daysActive,
        progressPercentage
      });
      
      console.log('✅ Dashboard progress updated:', { daysActive, progressPercentage });
    } catch (error) {
      console.error('❌ Error updating dashboard progress:', error);
    }
  };

  // Function to pause all videos except the one currently playing
  const pauseAllVideosExcept = (currentVideo: HTMLVideoElement) => {
    videoRefs.current.forEach((_cleanup, video) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
      }
    });
  };

  // Function to pause ALL videos (used when opening modals)
  const pauseAllVideos = () => {
    videoRefs.current.forEach((_cleanup, video) => {
      if (!video.paused) {
        video.pause();
      }
    });
  };

  // Cleanup all videos on unmount
  useEffect(() => {
    const registerVideo = (video: HTMLVideoElement | null) => {
      if (video === null) return;
      if (videoRefs.current.has(video)) return;

      const handlePlay = () => {
        pauseAllVideosExcept(video);
      };
      
      video.addEventListener('play', handlePlay);
      
      const cleanup = () => {
        video.removeEventListener('play', handlePlay);
        videoRefs.current.delete(video);
      };
      
      videoRefs.current.set(video, cleanup);
    };

    (window as any).__registerVideo = registerVideo;

    return () => {
      videoRefs.current.forEach((cleanup) => cleanup());
      videoRefs.current.clear();
      delete (window as any).__registerVideo;
    };
  }, []);

  // Load completed exercises on mount
  useEffect(() => {
    loadCompletedExercises();
    const midnightCheck = setInterval(() => {
      checkAndResetCompletions();
    }, 60000);

    return () => clearInterval(midnightCheck);
  }, [userId]);

  // Load initial week number
  useEffect(() => {
    calculateCurrentWeek(userId).then(week => {
      setCurrentWeek(week);
    });
  }, [userId]);

  // Log to dashboard when new exercise is completed
  useEffect(() => {
    if (lastCompletedExercise && !showFeedbackModal) {
      cloudDashboardService.addActivity(userId, {
        type: 'completed',
        title: `Completed "${lastCompletedExercise.name}" exercise`,
        timestamp: new Date(),
        icon: '✅'
      }).then(async () => {
        // Update exercises completed count
        await cloudDashboardService.updateStats(userId, { 
          exercisesCompleted: completedExercises.length 
        });
        
        // Update progress percentage and days active
        await updateDashboardProgress();
      }).then(() => {
        // Only refresh dashboard if modal is not open to prevent flicker
        if (onDashboardRefresh && !showFeedbackModal) {
          onDashboardRefresh();
        }
      }).catch(error => {
        console.error('Error updating dashboard:', error);
      });
      
      setLastCompletedExercise(null);
    }
  }, [lastCompletedExercise, userId, completedExercises.length, onDashboardRefresh, showFeedbackModal]);

  useEffect(() => {
    generatePlan();
  }, [userId, injuryData, sessionHistory, currentWeek]);

  // Load completed exercises for today from cloud
  const loadCompletedExercises = async () => {
    try {
      const today = getTodayDateString();
      const exercises = await cloudCompletionsService.getCompletions(userId, today);
      setCompletedExercises(exercises);
    } catch (error) {
      console.error('Error loading completions:', error);
      setCompletedExercises([]);
    }
  };

  // Save completed exercises to cloud
  const saveCompletedExercises = async (exercises: string[]) => {
    try {
      const today = getTodayDateString();
      await cloudCompletionsService.saveCompletions(userId, today, exercises);
    } catch (error) {
      console.error('Error saving completions:', error);
    }
  };

  // Check if midnight has passed and reset if needed
  const checkAndResetCompletions = async () => {
    try {
      const today = getTodayDateString();
      const exercises = await cloudCompletionsService.getCompletions(userId, today);
      
      if (exercises.length === 0 && completedExercises.length > 0) {
        setCompletedExercises([]);
      }
    } catch (error) {
      console.error('Error checking midnight reset:', error);
    }
  };

  const generatePlan = () => {
    setLoading(true);
    try {
      const personalizedPlan = PersonalizationService.generatePlan(
        userId,
        injuryData,
        sessionHistory
      );
      setPlan(personalizedPlan);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCompletions = async () => {
    setCompletedExercises([]);
    await saveCompletedExercises([]);
  };

  const handleToggleExercise = (exerciseId: string) => {
    const exerciseName = plan?.exercises.find(ex => ex.exerciseId === exerciseId)?.name || 'Exercise';
    
    setCompletedExercises(prev => {
      let newCompletions: string[];
      const wasCompleted = prev.includes(exerciseId);
      
      if (wasCompleted) {
        newCompletions = prev.filter(id => id !== exerciseId);
      } else {
        newCompletions = [...prev, exerciseId];
        
        // Show feedback modal FIRST before any other updates
        setFeedbackExercise({ id: exerciseId, name: exerciseName });
        setSessionId(`session_${userId}_${Date.now()}`);
        setShowFeedbackModal(true);
        
        // Delay dashboard updates to prevent interference with modal
        setTimeout(() => {
          setLastCompletedExercise({ id: exerciseId, name: exerciseName });
        }, 100);
        
        // Store badge check data to run AFTER feedback modal closes
        // This ensures badge notifications appear after user submits feedback
        const newCompletionCount = newCompletions.length;
        
        setTimeout(async () => {
          try {
            const dashboardData = await cloudDashboardService.getDashboardData(userId);
            const currentHour = new Date().getHours();
            const currentDay = new Date().getDay();
            
            // Get all tracking data from localStorage
            const phasesCompleted = parseInt(localStorage.getItem(`phases_completed_${userId}`) || '0');
            const videosWatchedStr = localStorage.getItem(`videos_watched_${userId}`) || '[]';
            const videosWatched = JSON.parse(videosWatchedStr).length;
            
            // Store badge check data to be used when feedback modal closes
            pendingBadgeCheck.current = {
              exercisesCompleted: newCompletionCount,
              daysActive: dashboardData.stats.daysActive,
              currentStreak: 0,
              progressPercentage: dashboardData.stats.progressPercentage,
              phasesCompleted,
              videosWatched,
              isEarlyMorning: currentHour < 8,
              isLateNight: currentHour >= 20,
              isWeekend: currentDay === 0 || currentDay === 6,
            };
          } catch (error) {
            console.error('Error preparing badge check:', error);
          }
        }, 500);
      }
      
      saveCompletedExercises(newCompletions);
      return newCompletions;
    });
  };

  const handleOpenExerciseModal = (exercise: any) => {
    pauseAllVideos();
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleCloseExerciseModal = () => {
    setShowExerciseModal(false);
    setSelectedExercise(null);
  };

  const handleOpenAngleDetector = (exercise: any) => {
    setExerciseForAngleDetection(exercise);
    setShowAngleDetector(true);
  };

  const handleCloseAngleDetector = () => {
    setShowAngleDetector(false);
    setExerciseForAngleDetection(null);
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
          📋 {plan.phase.replace('_', ' ')} PHASE
        </div>
        <h2>Your Week {currentWeek} Plan</h2>
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

      {/* Exercises Section */}
      <div className="phase-section">
        <h3>💪 Your Personalized Exercises</h3>
        
        {plan.exercises.length === 0 ? (
          <div className="no-exercises-message">
            <p>⚠️ No exercises available for your current configuration.</p>
            <p>Please try regenerating your plan or contact support.</p>
            <button onClick={generatePlan}>🔄 Regenerate Plan</button>
          </div>
        ) : completedExercises.length === plan.exercises.length && plan.exercises.length > 0 ? (
          // Completion celebration with Tailwind
          <div className="bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-2xl p-8 md:p-12 text-center shadow-heavy animate-fadeIn">
            <div className="max-w-2xl mx-auto flex flex-col items-center">
              {/* Celebration Icon */}
              <div className="text-7xl md:text-8xl mb-6 animate-bounce">🎉</div>
              
              {/* Title */}
              <h2 
                className="text-4xl md:text-5xl font-extrabold !text-[#fbbf24] mb-6 drop-shadow-lg text-center"
              >
                Amazing Work!
              </h2>
              
              {/* Personalized Motivational Message */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 mb-6 border-2 border-white/30">
                <p className="text-lg md:text-xl font-semibold text-white leading-relaxed">
                  💪 {plan.motivationalMessage}
                </p>
              </div>
              
              {/* Description */}
              <p className="text-base md:text-lg font-medium text-white/95 leading-relaxed mb-8 px-4">
                You've completed all exercises for this session. Your body needs time to recover and rebuild stronger.
              </p>
              
              {/* Completion Badge */}
              <div className="inline-flex items-center gap-3 bg-white/25 backdrop-blur-md px-6 md:px-8 py-3 md:py-4 rounded-full mb-8 border-2 border-white/40 shadow-lg">
                <span className="text-2xl md:text-3xl bg-success/90 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold shadow-md">
                  ✓
                </span>
                <span className="text-lg md:text-xl font-bold text-white">
                  {plan.exercises.length}/{plan.exercises.length} Exercises Complete
                </span>
              </div>
              
              {/* Comeback Message */}
              <p className="text-base md:text-lg font-semibold text-white mb-6">
                💪 Come back for the next session to continue your recovery journey!
              </p>
              
              {/* Reset Button */}
              <button 
                onClick={resetCompletions}
                className="mt-2 px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                🔄 Reset & View Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="exercises-grid">
            {plan.exercises.map((exercise) => {
              const isCompleted = completedExercises.includes(exercise.exerciseId);
              return (
                <div key={exercise.exerciseId} className={`exercise-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="exercise-header">
                    <span className="exercise-emoji">💪</span>
                    <span className={`difficulty-badge ${exercise.difficulty <= 3 ? 'beginner' : exercise.difficulty <= 6 ? 'intermediate' : 'advanced'}`}>
                      Level {exercise.difficulty}
                    </span>
                  </div>
                  
                  <h4>{exercise.name}</h4>
                  
                  {/* Exercise Video - Uses Cloudinary hosted videos */}
                  {exercise.media?.videoUrl ? (
                    <div className="exercise-media">
                      <div className="video-container">
                        <video 
                          ref={(video) => {
                            if (video && (window as any).__registerVideo) {
                              (window as any).__registerVideo(video);
                            }
                          }}
                          controls 
                          preload="metadata"
                          className="exercise-video"
                        >
                          <source src={getCloudinaryVideoUrl(convertToCloudinaryPath(exercise.media.videoUrl))} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  ) : (
                    <div className="exercise-media-placeholder">
                      <div className="placeholder-content">
                        <span className="placeholder-icon">🎥</span>
                        <span className="placeholder-text">Demo Coming Soon</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Display summary from injury plan */}
                  <p className="exercise-desc">
                    {(() => {
                      const summary = exercise.summary || 'Complete this exercise as prescribed';
                      // Extract credit if it exists in the summary
                      const creditMatch = summary.match(/^(.*?)\s*Credit to:\s*(.+)$/s);
                      if (creditMatch) {
                        return (
                          <>
                            {creditMatch[1].trim()}
                            <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
                              Credit to: {creditMatch[2].trim()}
                            </span>
                          </>
                        );
                      }
                      return summary;
                    })()}
                  </p>
                  
                  <div className="exercise-details">
                    <div className="detail-row">
                      <span>🔄 {exercise.sets} sets × {exercise.reps ? `${exercise.reps} reps` : `${exercise.holdTime}s hold`}</span>
                    </div>
                    {exercise.restTime && (
                      <div className="detail-row">
                        <span>⏱️ Rest: {exercise.restTime}s</span>
                      </div>
                    )}
                    <div className="detail-row pain-threshold">
                      <span>⚠️ {exercise.expectedPainLevel}</span>
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
                      onClick={() => handleToggleExercise(exercise.exerciseId)}
                    >
                      {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                    </button>

                    {requiresAngleDetection(exercise.name) && (
                      <button
                        className="ai-form-check-btn"
                        onClick={() => handleOpenAngleDetector(exercise)}
                      >
                        📹 Live Form Tracker
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
          <div className="plan-stat-label">Overall Difficulty</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{plan.exercises.length}</div>
          <div className="plan-stat-label">Exercises</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{plan.sessionsPerWeek}x</div>
          <div className="plan-stat-label">Per Week</div>
        </div>
      </div>

      {/* Exercise Details Modal */}
      {showExerciseModal && selectedExercise && (
        <div className="exercise-modal-overlay" onClick={handleCloseExerciseModal}>
          <div className="exercise-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseExerciseModal}>
              ✕
            </button>
            
            <div className="modal-header">
              <span className="modal-exercise-emoji">💪</span>
              <div>
                <h2>{selectedExercise.name}</h2>
                <span className={`difficulty-badge ${selectedExercise.difficulty <= 3 ? 'beginner' : selectedExercise.difficulty <= 6 ? 'intermediate' : 'advanced'}`}>
                  Level {selectedExercise.difficulty}
                </span>
              </div>
            </div>

            <div className="modal-body">
              {/* Large Video/Media Section - Uses Cloudinary hosted videos */}
              <div className="modal-media-section">
                {selectedExercise.media?.videoUrl ? (
                  <div className="modal-video-container">
                    <video 
                      ref={(video) => {
                        if (video && (window as any).__registerVideo) {
                          (window as any).__registerVideo(video);
                        }
                      }}
                      controls 
                      className="modal-exercise-video"
                    >
                      <source src={getCloudinaryVideoUrl(convertToCloudinaryPath(selectedExercise.media.videoUrl))} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
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
                      <span className="spec-value">{selectedExercise.reps || 'Hold'}</span>
                    </div>
                    {selectedExercise.holdTime && (
                      <div className="spec-item">
                        <span className="spec-label">Hold Time:</span>
                        <span className="spec-value">{selectedExercise.holdTime}s</span>
                      </div>
                    )}
                    {selectedExercise.restTime && (
                      <div className="spec-item">
                        <span className="spec-label">Rest:</span>
                        <span className="spec-value">{selectedExercise.restTime}s</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercise Summary (from injuryPlans.ts) */}
                {selectedExercise.summary && (
                  <div className="modal-section">
                    <h3>🎯 Why This Exercise</h3>
                    <div className="personalization-reason">
                      <p>{selectedExercise.summary}</p>
                    </div>
                  </div>
                )}

                {/* Full Exercise Description */}
                <div className="modal-section">
                  <h3>📝 How To Perform</h3>
                  <div className="modal-description">
                    {(selectedExercise.description || selectedExercise.summary || 'No description available').split('\n').map((line: string, idx: number) => (
                      <p key={idx} className="description-line">{line}</p>
                    ))}
                  </div>
                </div>

                {selectedExercise.modifications && selectedExercise.modifications.length > 0 && (
                  <div className="modal-section">
                    <h3>💡 Tips & Modifications</h3>
                    <ul className="tips-list">
                      {selectedExercise.modifications.map((mod: string, idx: number) => (
                        <li key={idx}>{mod}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-section">
                  <h3>⚠️ Expected Discomfort</h3>
                  <div className="pain-threshold-box">
                    {selectedExercise.expectedPainLevel}
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
                className={`modal-complete-btn ${completedExercises.includes(selectedExercise.exerciseId) ? 'completed' : ''}`}
                onClick={() => {
                  handleToggleExercise(selectedExercise.exerciseId);
                  handleCloseExerciseModal();
                }}
              >
                {completedExercises.includes(selectedExercise.exerciseId) ? '✓ Completed' : 'Mark as Complete'}
              </button>
              <button className="modal-cancel-btn" onClick={handleCloseExerciseModal}>
                Close
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
                
                // Automatically mark exercise as complete after tracking
                if (reps > 0 && exerciseForAngleDetection?.exerciseId) {
                  handleToggleExercise(exerciseForAngleDetection.exerciseId);
                  
                  // Add activity to cloud dashboard
                  cloudDashboardService.addActivity(userId, {
                    type: 'completed',
                    title: `Completed "${exerciseForAngleDetection.name}" - ${reps} reps in ${duration}s`,
                    timestamp: new Date(),
                    icon: '✅'
                  }).catch(err => console.error('Error saving activity:', err));
                  
                  // Update stats
                  cloudDashboardService.updateStats(userId, {
                    exercisesCompleted: completedExercises.length + 1
                  }).catch(err => console.error('Error updating stats:', err));
                }
              }}
              onClose={handleCloseAngleDetector}
            />
          </div>
        </div>
      )}

      {/* Badge Notifications */}
      {notifications.map((notification, index) => (
        <BadgeNotificationToast
          key={notification.badge.id}
          notification={notification}
          onClose={() => dismissNotification(index)}
        />
      ))}

      {/* Feedback Modal */}
      {feedbackExercise && (
        <FeedbackModal
          userId={userId}
          exerciseId={feedbackExercise.id}
          exerciseName={feedbackExercise.name}
          sessionId={sessionId}
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackExercise(null);
            
            // Check for badge unlocks AFTER feedback modal closes
            if (pendingBadgeCheck.current) {
              setTimeout(() => {
                checkBadges(pendingBadgeCheck.current);
                pendingBadgeCheck.current = null;
              }, 500);
            }
            
            // Trigger dashboard update after modal closes
            if (onDashboardRefresh) {
              setTimeout(() => {
                onDashboardRefresh();
              }, 300);
            }
          }}
          onSubmit={(feedback: ExerciseFeedback, response: FeedbackResponse) => {
            console.log('Feedback submitted:', feedback);
            console.log('Response generated:', response);
            
            // Store additional context if needed
            if (response.adjustIntensity) {
              console.log('⚠️ User may need intensity adjustment');
            }
          }}
        />
      )}
    </div>
  );
}