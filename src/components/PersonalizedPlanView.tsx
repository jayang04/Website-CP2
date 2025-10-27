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
    if (lastCompletedExercise) {
      cloudDashboardService.addActivity(userId, {
        type: 'completed',
        title: `Completed "${lastCompletedExercise.name}" exercise`,
        timestamp: new Date(),
        icon: '✅'
      }).then(() => {
        return cloudDashboardService.updateStats(userId, { 
          exercisesCompleted: completedExercises.length 
        });
      }).then(() => {
        if (onDashboardRefresh) {
          onDashboardRefresh();
        }
      }).catch(error => {
        console.error('Error updating dashboard:', error);
      });
      
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
      
      if (prev.includes(exerciseId)) {
        newCompletions = prev.filter(id => id !== exerciseId);
      } else {
        newCompletions = [...prev, exerciseId];
        setLastCompletedExercise({ id: exerciseId, name: exerciseName });
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
                  
                  {/* Exercise Video */}
                  {(() => {
                    const getVideoPath = (exerciseName: string): string | null => {
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
                      
                      if (videoMap[normalizedName]) {
                        return videoMap[normalizedName];
                      }
                      
                      const caseInsensitiveMatch = Object.keys(videoMap).find(
                        key => key.toLowerCase() === normalizedName.toLowerCase()
                      );
                      if (caseInsensitiveMatch) {
                        return videoMap[caseInsensitiveMatch];
                      }
                      
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

      {/* Regenerate Button */}
      <div className="plan-actions">
        <button className="regenerate-btn" onClick={generatePlan}>
          🔄 Regenerate Plan
        </button>
        <button 
          className="regenerate-btn" 
          onClick={resetCompletions}
          style={{ marginLeft: '10px', background: '#f44336', color: 'white', borderColor: '#f44336' }}
        >
          🔄 Reset All Completions
        </button>
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
              {/* Large Video/Media Section */}
              <div className="modal-media-section">
                {(() => {
                  const getVideoPath = (exerciseName: string): string | null => {
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
                    
                    if (videoMap[normalizedName]) {
                      return videoMap[normalizedName];
                    }
                    
                    const caseInsensitiveMatch = Object.keys(videoMap).find(
                      key => key.toLowerCase() === normalizedName.toLowerCase()
                    );
                    if (caseInsensitiveMatch) {
                      return videoMap[caseInsensitiveMatch];
                    }
                    
                    const partialMatch = Object.keys(videoMap).find(
                      key => normalizedName.toLowerCase().includes(key.toLowerCase()) ||
                             key.toLowerCase().includes(normalizedName.toLowerCase())
                    );
                    if (partialMatch) {
                      return videoMap[partialMatch];
                    }
                    
                    return null;
                  };
                
                  const videoPath = getVideoPath(selectedExercise.name);
                  
                  return videoPath ? (
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
                        <source src={videoPath} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="modal-media-placeholder">
                      <span className="placeholder-icon-large">🎥</span>
                      <p>Demo video coming soon</p>
                    </div>
                  );
                })()}
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
                    {selectedExercise.reasoning.split('\n').map((line: string, idx: number) => (
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
              }}
              onClose={handleCloseAngleDetector}
            />
          </div>
        </div>
      )}
    </div>
  );
}