// Service for managing dashboard and rehab program data using localStorage

import { type DashboardData, type Activity, type UserStats, type ProgramProgress } from '../types/dashboard';
import { type Exercise } from '../types/rehab';
import { type InjuryType, type UserInjuryProgress } from '../types/injuries';
import { REHAB_PLANS } from '../data/injuryPlans';

const STORAGE_KEYS = {
  DASHBOARD_DATA: 'rehabmotion_dashboard_data',
  KNEE_EXERCISES: 'rehabmotion_knee_exercises',
  ANKLE_EXERCISES: 'rehabmotion_ankle_exercises',
  USER_PROGRESS: 'rehabmotion_user_progress',
  USER_INJURY: 'rehabmotion_user_injury',
  INJURY_PROGRESS: 'rehabmotion_injury_progress',
  ACTIVITY_DATES: 'rehabmotion_activity_dates'
};

// Helper function to calculate progress percentage
export const calculateProgressPercentage = (userId: string): number => {
  const progress = injuryRehabService.getInjuryProgress(userId);
  const plan = injuryRehabService.getInjuryPlan(userId);
  
  if (!progress || !plan) return 0;
  
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

// Helper function to track activity dates
export const trackActivity = (userId: string): number => {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  const key = `${STORAGE_KEYS.ACTIVITY_DATES}_${userId}`;
  
  // Get existing activity dates
  const stored = localStorage.getItem(key);
  const dates: string[] = stored ? JSON.parse(stored) : [];
  
  // Add today's date if not already recorded
  if (!dates.includes(today)) {
    dates.push(today);
    localStorage.setItem(key, JSON.stringify(dates));
  }
  
  return dates.length;
};

// Helper function to get activity days count
export const getActivityDays = (userId: string): number => {
  const key = `${STORAGE_KEYS.ACTIVITY_DATES}_${userId}`;
  const stored = localStorage.getItem(key);
  const dates: string[] = stored ? JSON.parse(stored) : [];
  return dates.length;
};

// Default dashboard data
const getDefaultDashboardData = (): DashboardData => ({
  stats: {
    progressPercentage: 0,
    daysActive: 0,
    exercisesCompleted: 0
  },
  activities: [],
  programProgress: {
    programName: 'No active program',
    currentWeek: 0,
    totalWeeks: 8,
    progressPercentage: 0,
    description: 'Start a rehabilitation program to track your progress.'
  },
  quickActions: [
    {
      id: '1',
      icon: '💪',
      title: 'Rehabilitation Programs',
      description: 'General knee and ankle recovery programs',
      link: 'rehab-program'
    },
    {
      id: '2',
      icon: '🏆',
      title: 'Achievements and Badges',
      description: 'View your achievements and earned badges',
      link: '#'
    }
  ]
});

// Dashboard Data Management
export const dashboardService = {
  // Get dashboard data
  getDashboardData: (userId: string): DashboardData => {
    const key = `${STORAGE_KEYS.DASHBOARD_DATA}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      data.activities = data.activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
      return data;
    }
    return getDefaultDashboardData();
  },

  // Save dashboard data
  saveDashboardData: (userId: string, data: DashboardData): void => {
    const key = `${STORAGE_KEYS.DASHBOARD_DATA}_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Update user stats
  updateStats: (userId: string, stats: Partial<UserStats>): void => {
    const data = dashboardService.getDashboardData(userId);
    data.stats = { ...data.stats, ...stats };
    dashboardService.saveDashboardData(userId, data);
  },

  // Add activity
  addActivity: (userId: string, activity: Omit<Activity, 'id'>): void => {
    const data = dashboardService.getDashboardData(userId);
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString()
    };
    data.activities = [newActivity, ...data.activities].slice(0, 10); // Keep last 10
    dashboardService.saveDashboardData(userId, data);
  },

  // Update program progress
  updateProgramProgress: (userId: string, progress: Partial<ProgramProgress>): void => {
    const data = dashboardService.getDashboardData(userId);
    data.programProgress = { ...data.programProgress, ...progress };
    dashboardService.saveDashboardData(userId, data);
  }
};

// Exercise Management
export const exerciseService = {
  // Get exercises for a program type
  getExercises: (userId: string, type: 'knee' | 'ankle'): Exercise[] => {
    const key = type === 'knee' 
      ? `${STORAGE_KEYS.KNEE_EXERCISES}_${userId}`
      : `${STORAGE_KEYS.ANKLE_EXERCISES}_${userId}`;
    
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return default exercises based on type
    return type === 'knee' ? getDefaultKneeExercises() : getDefaultAnkleExercises();
  },

  // Save exercises
  saveExercises: (userId: string, type: 'knee' | 'ankle', exercises: Exercise[]): void => {
    const key = type === 'knee' 
      ? `${STORAGE_KEYS.KNEE_EXERCISES}_${userId}`
      : `${STORAGE_KEYS.ANKLE_EXERCISES}_${userId}`;
    localStorage.setItem(key, JSON.stringify(exercises));
  },

  // Toggle exercise completion
  toggleExerciseCompletion: (userId: string, type: 'knee' | 'ankle', exerciseId: string): void => {
    const exercises = exerciseService.getExercises(userId, type);
    const updated = exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );
    exerciseService.saveExercises(userId, type, updated);

    // Update dashboard stats
    const completedCount = updated.filter(ex => ex.completed).length;
    dashboardService.updateStats(userId, { exercisesCompleted: completedCount });

    // Add activity if completed
    const exercise = updated.find(ex => ex.id === exerciseId);
    if (exercise?.completed) {
      dashboardService.addActivity(userId, {
        type: 'completed',
        title: `Completed "${exercise.name}" exercise`,
        timestamp: new Date(),
        icon: '✅'
      });
    }
  },

  // Add custom exercise
  addExercise: (userId: string, type: 'knee' | 'ankle', exercise: Omit<Exercise, 'id'>): void => {
    const exercises = exerciseService.getExercises(userId, type);
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString()
    };
    exerciseService.saveExercises(userId, type, [...exercises, newExercise]);
  },

  // Delete exercise
  deleteExercise: (userId: string, type: 'knee' | 'ankle', exerciseId: string): void => {
    const exercises = exerciseService.getExercises(userId, type);
    const filtered = exercises.filter(ex => ex.id !== exerciseId);
    exerciseService.saveExercises(userId, type, filtered);
  },

  // Update exercise
  updateExercise: (userId: string, type: 'knee' | 'ankle', exerciseId: string, updates: Partial<Exercise>): void => {
    const exercises = exerciseService.getExercises(userId, type);
    const updated = exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    );
    exerciseService.saveExercises(userId, type, updated);
  }
};

// Default exercise data
function getDefaultKneeExercises(): Exercise[] {
  return [
    {
      id: '1',
      name: 'Straight Leg Raises',
      phase: 1,
      sets: 3,
      reps: 10,
      hold: '5 seconds each',
      description: 'Strengthen quadriceps while keeping knee straight. Helps improve stability and control.',
      image: '🦵',
      completed: false
    },
    {
      id: '2',
      name: 'Seated Knee Extensions',
      phase: 2,
      sets: 3,
      reps: 12,
      hold: 'Slow, controlled movement',
      description: 'Strengthen quadriceps and improve range of motion. Use resistance band for added challenge.',
      image: '💺',
      completed: false
    },
    {
      id: '3',
      name: 'Wall Slides',
      phase: 2,
      sets: 3,
      reps: 8,
      hold: '10 seconds each',
      description: 'Improve knee stability and strengthen quadriceps in a controlled environment with back support.',
      image: '🧱',
      completed: false
    },
    {
      id: '4',
      name: 'Hamstring Curls',
      phase: 2,
      sets: 3,
      reps: 10,
      hold: '3 seconds at top',
      description: 'Strengthen hamstrings to improve knee stability and balance muscle development around the joint.',
      image: '🏋️',
      completed: false
    }
  ];
}

function getDefaultAnkleExercises(): Exercise[] {
  return [
    {
      id: '1',
      name: 'Ankle Pumps',
      phase: 1,
      sets: 3,
      reps: 15,
      hold: '2 seconds each',
      description: 'Gentle range of motion exercises to improve flexibility and reduce stiffness.',
      image: '👣',
      completed: false
    },
    {
      id: '2',
      name: 'Alphabet Writing',
      phase: 1,
      sets: 2,
      reps: 1,
      hold: 'Full alphabet',
      description: 'Use your big toe to write the alphabet in the air. Improves flexibility and range of motion.',
      image: '✍️',
      completed: false
    },
    {
      id: '3',
      name: 'Heel Raises',
      phase: 2,
      sets: 3,
      reps: 12,
      hold: '3 seconds at top',
      description: 'Strengthen calf muscles and improve ankle stability. Begin with light strengthening exercises.',
      image: '🦶',
      completed: false
    },
    {
      id: '4',
      name: 'Resistance Band Flexion',
      phase: 2,
      sets: 3,
      reps: 15,
      hold: 'Controlled movement',
      description: 'Use resistance band to strengthen ankle in all directions. Improves stability and control.',
      image: '🔗',
      completed: false
    }
  ];
}

// Injury-Specific Rehabilitation Management
export const injuryRehabService = {
  // Get user's selected injury type
  getUserInjury: (userId: string): InjuryType | null => {
    const key = `${STORAGE_KEYS.USER_INJURY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? (stored as InjuryType) : null;
  },

  // Set user's injury type
  setUserInjury: (userId: string, injuryType: InjuryType): void => {
    const key = `${STORAGE_KEYS.USER_INJURY}_${userId}`;
    localStorage.setItem(key, injuryType);
    
    // Initialize injury progress
    const progress: UserInjuryProgress = {
      userId,
      injuryType,
      startDate: new Date(),
      currentPhase: 1,
      currentWeek: 1,
      completedExercises: [],
      painLevel: 0,
      notes: [],
      lastUpdated: new Date()
    };
    injuryRehabService.saveInjuryProgress(userId, progress);
    
    // Update dashboard with injury info
    const plan = REHAB_PLANS[injuryType];
    if (plan) {
      dashboardService.updateProgramProgress(userId, {
        programName: `${plan.injuryInfo.name} Rehabilitation`,
        currentWeek: 1,
        totalWeeks: plan.totalWeeks,
        progressPercentage: 0,
        description: `Starting ${plan.phases[0].name}`
      });
    }
  },

  // Clear user's injury data (for resetting general program)
  clearUserInjury: (userId: string): void => {
    const userInjuryKey = `${STORAGE_KEYS.USER_INJURY}_${userId}`;
    const injuryProgressKey = `${STORAGE_KEYS.INJURY_PROGRESS}_${userId}`;
    localStorage.removeItem(userInjuryKey);
    localStorage.removeItem(injuryProgressKey);
    console.log('🗑️ Cleared general program data for user:', userId);
  },

  // Get injury rehabilitation plan
  getInjuryPlan: (userId: string) => {
    const injuryType = injuryRehabService.getUserInjury(userId);
    if (!injuryType) return null;
    return REHAB_PLANS[injuryType] || null;
  },

  // Get user's injury progress
  getInjuryProgress: (userId: string): UserInjuryProgress | null => {
    const key = `${STORAGE_KEYS.INJURY_PROGRESS}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const progress = JSON.parse(stored);
      progress.startDate = new Date(progress.startDate);
      progress.lastUpdated = new Date(progress.lastUpdated);
      return progress;
    }
    return null;
  },

  // Save injury progress
  saveInjuryProgress: (userId: string, progress: UserInjuryProgress): void => {
    const key = `${STORAGE_KEYS.INJURY_PROGRESS}_${userId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  },

  // Mark exercise as complete in injury plan
  completeExercise: (userId: string, exerciseId: string): void => {
    const progress = injuryRehabService.getInjuryProgress(userId);
    if (!progress) return;
    
    if (!progress.completedExercises.includes(exerciseId)) {
      progress.completedExercises.push(exerciseId);
      progress.lastUpdated = new Date();
      injuryRehabService.saveInjuryProgress(userId, progress);
      
      // Track activity for today
      const daysActive = trackActivity(userId);
      
      // Calculate progress percentage
      const progressPercentage = calculateProgressPercentage(userId);
      
      // Update dashboard stats with all metrics
      dashboardService.updateStats(userId, {
        exercisesCompleted: progress.completedExercises.length,
        progressPercentage: progressPercentage,
        daysActive: daysActive
      });
      
      // Add activity
      const plan = injuryRehabService.getInjuryPlan(userId);
      if (plan) {
        const exercise = plan.phases
          .flatMap(p => p.exercises)
          .find(e => e.id === exerciseId);
        
        if (exercise) {
          dashboardService.addActivity(userId, {
            type: 'completed',
            title: `Completed "${exercise.name}"`,
            timestamp: new Date(),
            icon: '✅'
          });
        }
      }
    }
  },

  // Uncomplete exercise
  uncompleteExercise: (userId: string, exerciseId: string): void => {
    const progress = injuryRehabService.getInjuryProgress(userId);
    if (!progress) return;
    
    progress.completedExercises = progress.completedExercises.filter(id => id !== exerciseId);
    progress.lastUpdated = new Date();
    injuryRehabService.saveInjuryProgress(userId, progress);
    
    // Recalculate progress percentage
    const progressPercentage = calculateProgressPercentage(userId);
    
    // Update dashboard stats
    dashboardService.updateStats(userId, {
      exercisesCompleted: progress.completedExercises.length,
      progressPercentage: progressPercentage
    });
  },

  // Update pain level
  updatePainLevel: (userId: string, painLevel: number, note?: string): void => {
    const progress = injuryRehabService.getInjuryProgress(userId);
    if (!progress) return;
    
    progress.painLevel = painLevel;
    progress.lastUpdated = new Date();
    
    if (note) {
      progress.notes.push(`[${new Date().toLocaleDateString()}] Pain: ${painLevel}/10 - ${note}`);
    }
    
    injuryRehabService.saveInjuryProgress(userId, progress);
    
    // Track activity for today
    trackActivity(userId);
    
    // Add activity
    dashboardService.addActivity(userId, {
      type: 'logged',
      title: `Logged pain level: ${painLevel}/10`,
      timestamp: new Date(),
      icon: '📝'
    });
  },

  // Progress to next phase
  progressToNextPhase: (userId: string): boolean => {
    const progress = injuryRehabService.getInjuryProgress(userId);
    const plan = injuryRehabService.getInjuryPlan(userId);
    
    if (!progress || !plan) return false;
    
    if (progress.currentPhase < plan.phases.length) {
      progress.currentPhase++;
      progress.lastUpdated = new Date();
      injuryRehabService.saveInjuryProgress(userId, progress);
      
      const newPhase = plan.phases[progress.currentPhase - 1];
      dashboardService.addActivity(userId, {
        type: 'goal',
        title: `Advanced to ${newPhase.name}`,
        timestamp: new Date(),
        icon: '🎯'
      });
      
      return true;
    }
    
    return false;
  },

  // Get exercises for current phase
  getCurrentPhaseExercises: (userId: string) => {
    const progress = injuryRehabService.getInjuryProgress(userId);
    const plan = injuryRehabService.getInjuryPlan(userId);
    
    if (!progress || !plan) return [];
    
    const phase = plan.phases[progress.currentPhase - 1];
    return phase ? phase.exercises : [];
  },

  // Check if exercise is completed
  isExerciseCompleted: (userId: string, exerciseId: string): boolean => {
    const progress = injuryRehabService.getInjuryProgress(userId);
    return progress?.completedExercises.includes(exerciseId) || false;
  }
};

// Export activity tracking for use in other modules
export const activityTracker = {
  trackActivity,
  getActivityDays
};
