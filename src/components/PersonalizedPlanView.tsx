// Personalized Rehab Plan Display Component

import { useState, useEffect, useRef } from 'react';
import { PersonalizationService } from '../services/personalizationService';
import type { PersonalizedPlan } from '../types/personalization';
import { requiresAngleDetection } from '../data/exerciseAngleConfig';
import ExerciseAngleTracker from './ExerciseAngleTracker';
import { cloudDashboardService, cloudCompletionsService } from '../services/cloudDataService';
import '../styles/PersonalizedPlan.css';
import '../styles/InjuryRehabProgram.css';
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
  
  // Track all video elements for auto-pause functionality
  const videoRefs = useRef<Map<HTMLVideoElement, () => void>>(new Map());

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
    // Function to register video element with proper cleanup (for future use)
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

    // Store for potential future use
    (window as any).__registerVideo = registerVideo;

    return () => {
      videoRefs.current.forEach((cleanup) => cleanup());
      videoRefs.current.clear();
      delete (window as any).__registerVideo;
    };
  }, []);

  // Load completed exercises from localStorage on mount
  useEffect(() => {
    loadCompletedExercises();
    // Check every minute if we've crossed midnight
    const midnightCheck = setInterval(() => {
      checkAndResetCompletions();
    }, 60000); // Check every minute

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
    if (lastCompletedExercise) {
      // Add to activity feed (async cloud call)
      cloudDashboardService.addActivity(userId, {
        type: 'completed',
        title: `Completed "${lastCompletedExercise.name}" exercise`,
        timestamp: new Date(),
        icon: '✅'
      }).then(() => {
        // Update stats with current completion count
        return cloudDashboardService.updateStats(userId, { 
          exercisesCompleted: completedExercises.length 
        });
      }).then(() => {
        // Trigger dashboard refresh for instant sync
        if (onDashboardRefresh) {
          onDashboardRefresh();
        }
        console.log('📊 Dashboard updated and refreshed (cloud)');
      }).catch(error => {
        console.error('❌ Error updating dashboard:', error);
      });
      
      // Reset the trigger
      setLastCompletedExercise(null);
    }
  }, [lastCompletedExercise, userId, completedExercises.length, onDashboardRefresh]);

  useEffect(() => {
    generatePlan();
  }, [userId, injuryData, sessionHistory, currentWeek]);

  // Load completed exercises for today from cloud
  const loadCompletedExercises = async () => {
    try {
      const today = getTodayDateString();
      const exercises = await cloudCompletionsService.getCompletions(userId, today);
      setCompletedExercises(exercises);
      console.log('✅ Loaded completions from cloud:', exercises.length, 'exercises');
    } catch (error) {
      console.error('❌ Error loading completions from cloud:', error);
      setCompletedExercises([]);
    }
  };

  // Save completed exercises to cloud
  const saveCompletedExercises = async (exercises: string[]) => {
    try {
      const today = getTodayDateString();
      await cloudCompletionsService.saveCompletions(userId, today, exercises);
      console.log('💾 Saved completions to cloud:', exercises.length, 'exercises');
    } catch (error) {
      console.error('❌ Error saving completions to cloud:', error);
    }
  };

  // Check if midnight has passed and reset if needed
  const checkAndResetCompletions = async () => {
    try {
      const today = getTodayDateString();
      const exercises = await cloudCompletionsService.getCompletions(userId, today);
      
      if (exercises.length === 0 && completedExercises.length > 0) {
        console.log('🌅 Midnight passed - resetting completions');
        setCompletedExercises([]);
      }
    } catch (error) {
      console.error('❌ Error checking midnight reset:', error);
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
      console.error('❌ Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExercise = (exerciseId: string) => {
    const exerciseName = plan?.exercises.find(ex => ex.exerciseId === exerciseId)?.name || 'Exercise';
    
    setCompletedExercises(prev => {
      let newCompletions: string[];
      
      if (prev.includes(exerciseId)) {
        // Uncomplete
        newCompletions = prev.filter(id => id !== exerciseId);
        console.log(`❌ Unmarked: ${exerciseName}`);
      } else {
        // Complete - trigger dashboard update via useEffect
        newCompletions = [...prev, exerciseId];
        console.log(`✅ Completed: ${exerciseName}`);
        
        // Set trigger for dashboard logging (useEffect will handle it)
        setLastCompletedExercise({ id: exerciseId, name: exerciseName });
      }
      
      // Save to localStorage
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
          📍 {plan.phase.replace('_', ' ')} PHASE
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

      {/* Exercises Section - Matching InjuryRehabProgram Format */}
      <div className="phase-section">
        <h3>💪 Your Personalized Exercises</h3>
        
        {plan.exercises.length === 0 ? (
          <div className="no-exercises-message">
            <p>⚠️ No exercises available for your current configuration.</p>
            <p>Please try regenerating your plan or contact support.</p>
            <button onClick={generatePlan}>🔄 Regenerate Plan</button>
          </div>
        ) : completedExercises.length === plan.exercises.length ? (
          // Show completion celebration when all exercises are done - Using Tailwind CSS
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl p-12 text-center shadow-2xl animate-fadeIn">
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
              <div className="text-8xl mb-5 animate-bounce">🎉</div>
              <h2 className="text-5xl font-extrabold !text-[#fbbf24] mb-4 text-center drop-shadow-lg">
                Amazing Work!
              </h2>
              <p className="text-xl font-medium text-white leading-relaxed mb-7 drop-shadow-sm">
                You've completed all exercises for this session today. Your body needs time to recover and rebuild.
              </p>
              <div className="inline-flex items-center gap-3 bg-white/25 backdrop-blur-md px-8 py-4 rounded-full mb-6 border-2 border-white/30">
                <span className="text-3xl text-white bg-green-500/90 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  ✓
                </span>
                <span className="text-xl font-bold text-white drop-shadow-sm">
                  {plan.exercises.length}/{plan.exercises.length} Exercises Complete
                </span>
              </div>
              <p className="text-lg font-semibold text-white mb-0 drop-shadow-sm">
                💪 Come back for the next session to continue your recovery journey!
              </p>
              <button 
                className="mt-5 px-8 py-3 bg-white/95 text-gray-800 border-2 border-gray-200 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 hover:shadow-lg active:scale-95"
                onClick={generatePlan}
              >
                🔄 View Plan Details
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
                  
                  {/* Exercise Video */}
                  {(() => {                      // Map exercise names to video paths
                      const getVideoPath = (exerciseName: string): string | null => {
                        // Normalize exercise name for matching
                        const normalizedName = exerciseName.trim();
                        
                        const videoMap: Record<string, string> = {
                          // ACL exercises
                          'Quad Set': '/exercise-demo-videos/ACL/Quad Set.mp4',
                          'Quad Sets': '/exercise-demo-videos/ACL/Quad Set.mp4',
                          'Straight Leg Raises': '/exercise-demo-videos/ACL/Straight Leg Raises.mp4',
                          'Straight Leg Raise': '/exercise-demo-videos/ACL/Straight Leg Raises.mp4',
                          'Ankle Pumps': '/exercise-demo-videos/ACL/Ankle Pumps.mp4',
                          'Ankle Pump': '/exercise-demo-videos/ACL/Ankle Pumps.mp4',
                          'Heel Slide': '/exercise-demo-videos/ACL/Heel Slide.mp4',
                          'Heel Slides': '/exercise-demo-videos/ACL/Heel Slide.mp4',
                          'Short Arc Quad': '/exercise-demo-videos/ACL/Short Arc Quad.mp4',
                          'Short Arc Quads': '/exercise-demo-videos/ACL/Short Arc Quad.mp4',
                          'Short Arc Quad Activation': '/exercise-demo-videos/ACL/Short Arc Quad.mp4',
                          'Bridges': '/exercise-demo-videos/ACL/Bridges.mp4',
                          'Bridge': '/exercise-demo-videos/ACL/Bridges.mp4',
                          'Glute Bridges': '/exercise-demo-videos/ACL/Bridges.mp4',
                          'Glute Bridge': '/exercise-demo-videos/ACL/Bridges.mp4',
                          
                          // MCL exercises
                          'Hip Flexion with Straight Leg Raise': '/exercise-demo-videos/MCL/Hip Flexion with Straight Leg Raise.mp4',
                          'Hip Adduction (Seated Pillow/Towel Squeeze)': '/exercise-demo-videos/MCL/Hip Adduction (Seated Pillow:Towel Squeeze).mp4',
                          'Banded Hip Abduction': '/exercise-demo-videos/MCL/Banded Hip Abduction.mp4',
                          'Hip Abduction': '/exercise-demo-videos/MCL/Banded Hip Abduction.mp4',
                          'Lateral Step-Up': '/exercise-demo-videos/MCL/Lateral Step-Up.mp4',
                          'Lateral Step-Ups': '/exercise-demo-videos/MCL/Lateral Step-Up.mp4',
                          
                          // Meniscus Tear exercises
                          'Mini Squats': '/exercise-demo-videos/Meniscus Tear/Mini Squats.mp4',
                          'Mini Squat': '/exercise-demo-videos/Meniscus Tear/Mini Squats.mp4',
                          'Wall Sit': '/exercise-demo-videos/Meniscus Tear/Wall Sit.mp4',
                          'Wall Sits': '/exercise-demo-videos/Meniscus Tear/Wall Sit.mp4',
                          'Step-Ups': '/exercise-demo-videos/Meniscus Tear/Step-Ups.mp4',
                          'Step-Up': '/exercise-demo-videos/Meniscus Tear/Step-Ups.mp4',
                          'Terminal Knee Extension': '/exercise-demo-videos/Meniscus Tear/Terminal Knee Extension.mp4',
                          'Terminal Knee Extensions': '/exercise-demo-videos/Meniscus Tear/Terminal Knee Extension.mp4',
                          
                          // Lateral Ankle Sprain exercises
                          'Ankle Dorsiflexion Mobility': '/exercise-demo-videos/Lateral Ankle Sprain/Ankle Dorsiflexion Mobility.mp4',
                          'Ankle Strengthening (Isometric/Eversion Band Work)': '/exercise-demo-videos/Lateral Ankle Sprain/Ankle Strengthening (Isometric:Eversion Band Work).mp4',
                          'Ankle Strengthening (Isometric Eversion)': '/exercise-demo-videos/Lateral Ankle Sprain/Ankle Strengthening (Isometric:Eversion Band Work).mp4',
                          'Calf Raise Exercise': '/exercise-demo-videos/Lateral Ankle Sprain/Calf Raise Exercise.mp4',
                          'Calf Raises': '/exercise-demo-videos/Lateral Ankle Sprain/Calf Raise Exercise.mp4',
                          'Calf Raise': '/exercise-demo-videos/Lateral Ankle Sprain/Calf Raise Exercise.mp4',
                          'Proprioceptive Control (Clock Reaches)': '/exercise-demo-videos/Lateral Ankle Sprain/Proprioceptive Control (Clock Reaches).mp4',
                          'Single-Leg Squat': '/exercise-demo-videos/Lateral Ankle Sprain/Single-Leg Squat.mp4',
                          'Single-Leg Squats': '/exercise-demo-videos/Lateral Ankle Sprain/Single-Leg Squat.mp4',
                          'Forward Lunge': '/exercise-demo-videos/Lateral Ankle Sprain/Forward Lunge.mp4',
                          'Forward Lunges': '/exercise-demo-videos/Lateral Ankle Sprain/Forward Lunge.mp4',
                          'Hop to Landing': '/exercise-demo-videos/Lateral Ankle Sprain/Hop to Landing.mp4',
                          
                          // High Ankle Sprain exercises
                          'Elevated Ankle Pumps': '/exercise-demo-videos/High Ankle Sprain/Elevated Ankle Pumps.mp4',
                          'Elevated Ankle Pump': '/exercise-demo-videos/High Ankle Sprain/Elevated Ankle Pumps.mp4',
                          'Ankle Circles': '/exercise-demo-videos/High Ankle Sprain/Ankle Circles.mp4',
                          'Ankle Circle': '/exercise-demo-videos/High Ankle Sprain/Ankle Circles.mp4',
                          'Double-Leg Calf Raises': '/exercise-demo-videos/High Ankle Sprain/Double-Leg Calf Raises.mp4',
                          'Double-Leg Calf Raise': '/exercise-demo-videos/High Ankle Sprain/Double-Leg Calf Raises.mp4',
                          'Progressive Weight Bearing': '/exercise-demo-videos/High Ankle Sprain/Progressive Weight Bearing.mp4',
                          
                          // Medial Ankle Sprain exercises
                          'Ankle Inversion Mobility': '/exercise-demo-videos/Medial Ankle Sprain/Ankle Inversion Mobility.mp4',
                          'Isometric Ankle Inversion': '/exercise-demo-videos/Medial Ankle Sprain/Isometric Ankle Inversion.mp4',
                          'Tibialis Posterior Strengthening': '/exercise-demo-videos/Medial Ankle Sprain/Tibialis Posterior Strengthening.mp4',
                          'Single-Leg Balance': '/exercise-demo-videos/Medial Ankle Sprain/Single-Leg Balance.mp4',
                          
                          // Aliases and variations
                          'Balance Exercises': '/exercise-demo-videos/Medial Ankle Sprain/Single-Leg Balance.mp4',
                          'Balance Maintenance Exercises': '/exercise-demo-videos/Medial Ankle Sprain/Single-Leg Balance.mp4',
                          'Ankle Eversion – Band': '/exercise-demo-videos/Lateral Ankle Sprain/Ankle Strengthening (Isometric:Eversion Band Work).mp4',
                          'Ankle Inversion – Band': '/exercise-demo-videos/Medial Ankle Sprain/Isometric Ankle Inversion.mp4',
                          'Heel Raise – Off Step': '/exercise-demo-videos/Lateral Ankle Sprain/Calf Raise Exercise.mp4',
                        };
                        
                        // Try exact match first
                        if (videoMap[normalizedName]) {
                          return videoMap[normalizedName];
                        }
                        
                        // Try case-insensitive match
                        const caseInsensitiveMatch = Object.keys(videoMap).find(
                          key => key.toLowerCase() === normalizedName.toLowerCase()
                        );
                        if (caseInsensitiveMatch) {
                          return videoMap[caseInsensitiveMatch];
                        }
                        
                        // Try partial match (contains)
                        const partialMatch = Object.keys(videoMap).find(
                          key => normalizedName.toLowerCase().includes(key.toLowerCase()) ||
                                 key.toLowerCase().includes(normalizedName.toLowerCase())
                        );
                        if (partialMatch) {
                          return videoMap[partialMatch];
                        }
                        
                        return null;
                      };
                    
                    const videoPath = getVideoPath(exercise.name);
                    
                    return videoPath ? (
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
                            <source src={videoPath} type="video/mp4" />
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
                    );
                  })()}
                  
                  <p className="exercise-desc">{exercise.reasoning}</p>
                  
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
                        📐 Live Form Tracker
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

      {/* Regenerate Button */}
      <div className="plan-actions">
        <button className="regenerate-btn" onClick={generatePlan}>
          🔄 Regenerate Plan
        </button>
      </div>

      {/* Exercise Details Modal */}
      {showExerciseModal && selectedExercise && (
        <div className="exercise-modal-overlay" onClick={handleCloseExerciseModal}>
          <div className="exercise-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseExerciseModal}>
              ✕
            </button>
            
            <div className="modal-body-scroll">
              <div className="modal-header">
                <h2>{selectedExercise.name}</h2>
                <span className={`difficulty-badge ${selectedExercise.difficulty <= 3 ? 'beginner' : selectedExercise.difficulty <= 6 ? 'intermediate' : 'advanced'}`}>
                  Level {selectedExercise.difficulty}
                </span>
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

                <div className="modal-section">
                  <h3>📝 Why This Exercise?</h3>
                  <div className="modal-description">
                    <p>{selectedExercise.reasoning}</p>
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
