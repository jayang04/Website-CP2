// Service for managing dashboard and rehab program data using localStorage

import { type DashboardData, type Activity, type UserStats, type ProgramProgress } from '../types/dashboard';
import { type Exercise } from '../types/rehab';

const STORAGE_KEYS = {
  DASHBOARD_DATA: 'rehabmotion_dashboard_data',
  KNEE_EXERCISES: 'rehabmotion_knee_exercises',
  ANKLE_EXERCISES: 'rehabmotion_ankle_exercises',
  USER_PROGRESS: 'rehabmotion_user_progress'
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
      icon: '🦵',
      title: 'Knee Rehabilitation',
      description: 'Start your knee recovery program',
      link: 'rehab-program'
    },
    {
      id: '2',
      icon: '🦶',
      title: 'Ankle Rehabilitation',
      description: 'Start your ankle strengthening exercises',
      link: 'rehab-program'
    },
    {
      id: '3',
      icon: '📅',
      title: 'Book Appointment',
      description: 'Schedule with your therapist',
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
