import { useState, useEffect, useRef, useCallback } from 'react';
import { injuryRehabService } from '../services/dataService';
import { type InjuryRehabPlan, type RehabPhase } from '../types/injuries';
import { requiresAngleDetection } from '../data/exerciseAngleConfig';
import ExerciseAngleTracker from '../components/ExerciseAngleTracker';
import { cloudDashboardService } from '../services/cloudDataService';
import { useBadges } from '../hooks/useBadges';
import BadgeNotificationToast from '../components/BadgeNotificationToast';
import { getCloudinaryVideoUrl, convertToCloudinaryPath } from '../services/cloudinaryService';
import '../styles/InjuryRehabProgram.css';
import '../styles/AngleDetector.css';

interface InjuryRehabProgramProps {
  userId: string;
  onBack: () => void;
  onProgramSelected?: () => void; // Callback when program is selected
  onDashboardRefresh?: () => void; // Callback to refresh dashboard
  onResetAllPrograms?: () => void; // Callback to reset all programs (both personalized and general)
}

export default function InjuryRehabProgram({ userId, onBack: _onBack, onProgramSelected, onDashboardRefresh, onResetAllPrograms }: InjuryRehabProgramProps) {
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
  const [showProgramSelection, setShowProgramSelection] = useState(false);
  const [lastCompletedExercise, setLastCompletedExercise] = useState<{id: string, name: string} | null>(null);
  
  // Badge system integration
  const { notifications, checkBadges, dismissNotification } = useBadges(userId);
  
  // Track all video elements for auto-pause functionality
  const videoRefs = useRef<Map<HTMLVideoElement, () => void>>(new Map());

  // Helper function to calculate progress percentage for general program
  const calculateGeneralProgramProgress = (): number => {
    if (!plan || !progress) return 0;
    
    // Get total exercises from all phases
    const totalExercises = plan.phases.reduce((sum, phase) => 
      sum + phase.exercises.length, 0
    );
    
    // Get completed exercises count
    const completedCount = progress.completedExercises.length;
    
    // Calculate percentage
    return totalExercises > 0 
      ? Math.round((completedCount / totalExercises) * 100) 
      : 0;
  };

  // Helper function to update dashboard progress and days active
  const updateDashboardProgress = async () => {
    if (!progress) return;
    
    try {
      // Track activity and get days active
      const daysActive = await cloudDashboardService.trackActivity(userId);
      
      // Calculate progress percentage for general program
      const progressPercentage = calculateGeneralProgramProgress();
      
      // Update dashboard stats
      await cloudDashboardService.updateStats(userId, {
        exercisesCompleted: progress.completedExercises.length,
        progressPercentage,
        daysActive
      });
      
      console.log('✅ Dashboard progress updated:', { 
        exercisesCompleted: progress.completedExercises.length,
        progressPercentage, 
        daysActive 
      });
    } catch (error) {
      console.error('❌ Error updating dashboard progress:', error);
    }
  };

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
      
      // Track video watch for badges (only track once per video)
      trackVideoWatch(video);
    };
    
    video.addEventListener('play', handlePlay);
    
    // Store cleanup function
    const cleanup = () => {
      video.removeEventListener('play', handlePlay);
      videoRefs.current.delete(video);
    };
    
    videoRefs.current.set(video, cleanup);
  };

  // Track video watches for badge unlocking
  const trackVideoWatch = (video: HTMLVideoElement) => {
    const videoSrc = video.currentSrc || video.src;
    if (!videoSrc) return;
    
    const watchedKey = `videos_watched_${userId}`;
    const watchedVideos = JSON.parse(localStorage.getItem(watchedKey) || '[]');
    
    // Only count if not already watched
    if (!watchedVideos.includes(videoSrc)) {
      watchedVideos.push(videoSrc);
      localStorage.setItem(watchedKey, JSON.stringify(watchedVideos));
      console.log(`📹 Video watched (${watchedVideos.length} total):`, videoSrc);
      
      // Check badges after video watch
      setTimeout(async () => {
        try {
          const dashboardData = await cloudDashboardService.getDashboardData(userId);
          
          // Get all tracking data from localStorage
          const phasesCompleted = parseInt(localStorage.getItem(`phases_completed_${userId}`) || '0');
          
          checkBadges({
            exercisesCompleted: dashboardData.stats.exercisesCompleted,
            daysActive: dashboardData.stats.daysActive,
            currentStreak: 0,
            progressPercentage: dashboardData.stats.progressPercentage,
            phasesCompleted,
            videosWatched: watchedVideos.length,
          });
        } catch (error) {
          console.error('Error checking badges after video watch:', error);
        }
      }, 500);
    }
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

  // Log to dashboard when new exercise is completed
  useEffect(() => {
    if (lastCompletedExercise && progress) {
      cloudDashboardService.addActivity(userId, {
        type: 'completed',
        title: `Completed "${lastCompletedExercise.name}" exercise`,
        timestamp: new Date(),
        icon: '✅'
      }).then(async () => {
        // Update all dashboard stats including progress percentage and days active
        await updateDashboardProgress();
      }).then(() => {
        if (onDashboardRefresh) {
          onDashboardRefresh();
        }
      }).catch(error => {
        console.error('Error updating dashboard:', error);
      });
      
      setLastCompletedExercise(null);
    }
  }, [lastCompletedExercise, userId]); // Removed progress and onDashboardRefresh from dependencies

  // Check badges when component loads or data updates
  const checkBadgesOnLoad = useCallback(async () => {
    try {
      const dashboardData = await cloudDashboardService.getDashboardData(userId);
      
      // Get all tracking data from localStorage
      const phasesCompleted = parseInt(localStorage.getItem(`phases_completed_${userId}`) || '0');
      const videosWatchedStr = localStorage.getItem(`videos_watched_${userId}`) || '[]';
      const videosWatched = JSON.parse(videosWatchedStr).length;
      
      checkBadges({
        exercisesCompleted: dashboardData.stats.exercisesCompleted,
        daysActive: dashboardData.stats.daysActive,
        currentStreak: 0, // TODO: Track streak
        progressPercentage: dashboardData.stats.progressPercentage,
        phasesCompleted,
        videosWatched,
      });
    } catch (error) {
      console.error('Error checking badges on load:', error);
    }
  }, [userId, checkBadges]);

  const loadData = useCallback(() => {
    const rehabPlan = injuryRehabService.getInjuryPlan(userId);
    const userProgress = injuryRehabService.getInjuryProgress(userId);
    setPlan(rehabPlan);
    setProgress(userProgress);
    if (userProgress) {
      setSelectedPhase(userProgress.currentPhase);
    }
    
    // Check if user needs to select a program
    if (!rehabPlan) {
      setShowProgramSelection(true);
    }
    
    // Check for badge unlocks when data loads
    checkBadgesOnLoad();
  }, [userId, checkBadgesOnLoad]);

  const handleSelectProgram = (injuryType: 'acl-tear' | 'mcl-tear' | 'meniscus-tear' | 'ankle-sprain' | 'medial-ankle-sprain' | 'high-ankle-sprain') => {
    // Clear personalized plan data when selecting a general program
    localStorage.removeItem(`intake_data_${userId}`);
    localStorage.removeItem(`intake_skipped_${userId}`);
    console.log('🗑️ Cleared personalized plan data for user:', userId);
    
    injuryRehabService.setUserInjury(userId, injuryType);
    setShowProgramSelection(false);
    loadData();
    
    // Callback to notify parent (e.g., return to dashboard)
    if (onProgramSelected) {
      onProgramSelected();
    }
  };

  const handleToggleExercise = async (exerciseId: string) => {
    const isCompleted = injuryRehabService.isExerciseCompleted(userId, exerciseId);
    
    // Find the exercise to get its name
    let exerciseName = 'Exercise';
    if (plan) {
      for (const phase of plan.phases) {
        const exercise = phase.exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
          exerciseName = exercise.name;
          break;
        }
      }
    }
    
    if (isCompleted) {
      injuryRehabService.uncompleteExercise(userId, exerciseId);
      // Update progress when uncompleting an exercise
      loadData();
      // Wait for state to update, then recalculate progress
      setTimeout(async () => {
        await updateDashboardProgress();
        if (onDashboardRefresh) {
          onDashboardRefresh();
        }
      }, 100);
    } else {
      injuryRehabService.completeExercise(userId, exerciseId);
      setLastCompletedExercise({ id: exerciseId, name: exerciseName });
      loadData();
      
      // Check for badge unlocks
      setTimeout(async () => {
        try {
          const dashboardData = await cloudDashboardService.getDashboardData(userId);
          const currentHour = new Date().getHours();
          const currentDay = new Date().getDay();
          
          // Get all tracking data from localStorage
          const phasesCompleted = parseInt(localStorage.getItem(`phases_completed_${userId}`) || '0');
          const videosWatchedStr = localStorage.getItem(`videos_watched_${userId}`) || '[]';
          const videosWatched = JSON.parse(videosWatchedStr).length;
          
          checkBadges({
            exercisesCompleted: dashboardData.stats.exercisesCompleted,
            daysActive: dashboardData.stats.daysActive,
            currentStreak: 0, // TODO: Track streak
            progressPercentage: dashboardData.stats.progressPercentage,
            phasesCompleted,
            videosWatched,
            isEarlyMorning: currentHour < 8,
            isLateNight: currentHour >= 20,
            isWeekend: currentDay === 0 || currentDay === 6,
          });
        } catch (error) {
          console.error('Error checking badges:', error);
        }
      }, 500);
    }
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

  const confirmProgressPhase = async () => {
    injuryRehabService.progressToNextPhase(userId);
    loadData();
    setShowProgressModal(false);
    
    // Track phase completion for badges
    const phaseKey = `phases_completed_${userId}`;
    const phasesCompleted = parseInt(localStorage.getItem(phaseKey) || '0') + 1;
    localStorage.setItem(phaseKey, phasesCompleted.toString());
    
    // Check for badge unlocks with phase completion
    setTimeout(async () => {
      try {
        const dashboardData = await cloudDashboardService.getDashboardData(userId);
        
        // Get all tracking data from localStorage
        const videosWatchedStr = localStorage.getItem(`videos_watched_${userId}`) || '[]';
        const videosWatched = JSON.parse(videosWatchedStr).length;
        
        checkBadges({
          exercisesCompleted: dashboardData.stats.exercisesCompleted,
          daysActive: dashboardData.stats.daysActive,
          currentStreak: 0,
          progressPercentage: dashboardData.stats.progressPercentage,
          phasesCompleted,
          videosWatched,
        });
      } catch (error) {
        console.error('Error checking badges after phase completion:', error);
      }
    }, 500);
  };

  const handleOpenAngleDetector = (exercise: any) => {
    setExerciseForAngleDetection(exercise);
    setShowAngleDetector(true);
  };

  const handleCloseAngleDetector = () => {
    setShowAngleDetector(false);
    setExerciseForAngleDetection(null);
  };

  const handleResetProgram = () => {
    // Use the unified reset function if provided, otherwise fall back to local reset
    if (onResetAllPrograms) {
      onResetAllPrograms();
      _onBack();
    } else {
      const confirmed = window.confirm(
        '⚠️ Are you sure you want to reset your program? This will clear your current progress and let you choose a new rehab path.'
      );
      
      if (confirmed) {
        // Clear the user's injury selection and progress
        localStorage.removeItem(`rehabmotion_user_injury_${userId}`);
        localStorage.removeItem(`rehabmotion_injury_progress_${userId}`);
        
        // Refresh dashboard to update stats
        if (onDashboardRefresh) {
          onDashboardRefresh();
        }
        
        // Navigate back to dashboard where user can choose again
        _onBack();
      }
    }
  };

  // Show program selection if no plan exists
  if (showProgramSelection || !plan) {
    return (
      <div className="rehab-program-container">
        <div className="program-selection">
          
          <h1>Select Your Rehabilitation Program</h1>
          <p className="subtitle">Choose the program that matches your recovery needs</p>
          
          <div className="program-cards">
            {/* Knee Injuries Card */}
            <div className="program-card knee-card">
              <div className="card-icon">🦵</div>
              <h2>Knee Injury Programs</h2>
              <p>Comprehensive recovery plans for various knee injuries</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="select-btn"
                  onClick={() => handleSelectProgram('acl-tear')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
                >
                  ACL Tear Rehabilitation →
                </button>
                <button 
                  className="select-btn"
                  onClick={() => handleSelectProgram('mcl-tear')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
                >
                  MCL Tear Rehabilitation →
                </button>
                <button 
                  className="select-btn"
                  onClick={() => handleSelectProgram('meniscus-tear')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
                >
                  Meniscus Tear Rehabilitation →
                </button>
              </div>
            </div>

            {/* Ankle Injuries Card */}
            <div className="program-card ankle-card">
              <div className="card-icon">🦶</div>
              <h2>Ankle Injury Programs</h2>
              <p>Comprehensive recovery plans for various ankle injuries</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="select-btn"
                  onClick={() => handleSelectProgram('ankle-sprain')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
                >
                  Lateral Ankle Sprain →
                </button>
                <button 
                  className="select-btn"
                  onClick={() => handleSelectProgram('medial-ankle-sprain')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
                >
                  Medial Ankle Sprain →
                </button>
                <button 
                  className="select-btn"
                  onClick={() => handleSelectProgram('high-ankle-sprain')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
                >
                  High Ankle Sprain →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
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
            <div className="phase-header-buttons">
              {selectedPhase === progress.currentPhase && selectedPhase < plan.phases.length && (
                <button className="progress-phase-btn" onClick={handleProgressPhase}>
                  Advance to Next Phase →
                </button>
              )}
              <button 
                className="reset-program-btn"
                onClick={handleResetProgram}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff5252';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff6b6b';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)';
                }}
              >
                🔄 Reset Program
              </button>
            </div>
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
            
            {/* Show celebration message if all exercises in current phase are completed */}
            {completedInPhase === totalInPhase && totalInPhase > 0 ? (
              <div className="bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-2xl p-8 md:p-12 text-center shadow-heavy animate-fadeIn">
                <div className="max-w-2xl mx-auto flex flex-col items-center">
                  {/* Celebration Icon */}
                  <div className="text-7xl md:text-8xl mb-6 animate-bounce">🎉</div>
                  
                  {/* Title */}
                  <h2 
                    className="text-4xl md:text-5xl font-extrabold !text-[#fbbf24] mb-6 drop-shadow-lg text-center"
                  >
                    Phase Complete!
                  </h2>
                  
                  {/* Description */}
                  <p className="text-base md:text-lg font-medium text-white/95 leading-relaxed mb-8 px-4">
                    You've completed all exercises for {currentPhase.name}. Great work! Your body needs time to recover and rebuild stronger.
                  </p>
                  
                  {/* Completion Badge */}
                  <div className="inline-flex items-center gap-3 bg-white/25 backdrop-blur-md px-6 md:px-8 py-3 md:py-4 rounded-full mb-8 border-2 border-white/40 shadow-lg">
                    <span className="text-2xl md:text-3xl bg-success/90 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold shadow-md">
                      ✓
                    </span>
                    <span className="text-lg md:text-xl font-bold text-white">
                      {completedInPhase}/{totalInPhase} Exercises Complete
                    </span>
                  </div>
                  
                  {/* Next Steps */}
                  <p className="text-base md:text-lg font-semibold text-white mb-6">
                    {selectedPhase < plan.phases.length 
                      ? "💪 When you're ready, advance to the next phase to continue your recovery!" 
                      : "🎯 You've completed the entire program - congratulations on your recovery!"}
                  </p>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', width: '100%' }}>
                    {selectedPhase < plan.phases.length && (
                      <button 
                        onClick={handleProgressPhase}
                        className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                      >
                        ➡️ Advance to Next Phase
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
            <div className="exercises-grid">{currentPhase.exercises.map((exercise) => {
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
                    
                    <p className="exercise-desc">
                      {(() => {
                        const summary = exercise.summary || exercise.description || '';
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
            )}
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
                {selectedExercise.media?.videoUrl ? (
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
                        <source src={getCloudinaryVideoUrl(convertToCloudinaryPath(selectedExercise.media.videoUrl))} type="video/mp4" />
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
                
                // Automatically mark exercise as complete after tracking
                if (reps > 0 && exerciseForAngleDetection?.id) {
                  // Mark the exercise as completed in the injury rehab service
                  const isAlreadyCompleted = injuryRehabService.isExerciseCompleted(userId, exerciseForAngleDetection.id);
                  
                  if (!isAlreadyCompleted) {
                    injuryRehabService.completeExercise(userId, exerciseForAngleDetection.id);
                    setLastCompletedExercise({ id: exerciseForAngleDetection.id, name: exerciseForAngleDetection.name });
                    loadData(); // Reload data to update the UI
                  }
                  
                  console.log(`✅ Exercise "${exerciseForAngleDetection.name}" marked as complete with ${reps} reps`);
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
    </div>
  );
}
