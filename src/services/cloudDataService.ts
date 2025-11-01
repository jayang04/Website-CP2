// Cloud-based data service using Firebase Firestore
// Replaces localStorage with cloud storage for cross-device sync

import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { type DashboardData, type Activity, type UserStats, type ProgramProgress } from '../types/dashboard';

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

// Cloud Dashboard Service
export const cloudDashboardService = {
  // Get dashboard data from Firestore
  getDashboardData: async (userId: string): Promise<DashboardData> => {
    try {
      const docRef = doc(db, 'users', userId, 'dashboard', 'data');
      const docSnap = await getDoc(docRef);

      const defaultData = getDefaultDashboardData();

      if (docSnap.exists()) {
        const data = docSnap.data() as DashboardData;
        
        // Convert Firestore Timestamps back to Date objects
        if (data.activities) {
          data.activities = data.activities.map((activity: any) => ({
            ...activity,
            timestamp: activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp)
          }));
        }
        data.quickActions = defaultData.quickActions; // Ensure quickActions are always default
        return data;
      }
      
      // First time - create default data
      await cloudDashboardService.saveDashboardData(userId, defaultData);
      return defaultData;
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data from Firestore:', error);
      
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        console.error('🚫 PERMISSION DENIED - Please set up Firestore security rules!');
        console.error('Go to: https://console.firebase.google.com/project/capstone-project-2-d0caf/firestore/rules');
        throw new Error('Permission denied. Please configure Firestore security rules.');
      }
      
      throw error;
    }
  },

  // Save dashboard data to Firestore
  saveDashboardData: async (userId: string, data: DashboardData): Promise<void> => {
    try {
      const docRef = doc(db, 'users', userId, 'dashboard', 'data');
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Dashboard data saved to cloud');
    } catch (error: any) {
      console.error('❌ Error saving dashboard data to Firestore:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🚫 PERMISSION DENIED - Please set up Firestore security rules!');
        throw new Error('Permission denied. Please configure Firestore security rules.');
      }
      
      throw error;
    }
  },

  // Update user stats
  updateStats: async (userId: string, stats: Partial<UserStats>): Promise<void> => {
    try {
      const data = await cloudDashboardService.getDashboardData(userId);
      data.stats = { ...data.stats, ...stats };
      await cloudDashboardService.saveDashboardData(userId, data);
      console.log('✅ Stats updated in cloud:', stats);
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  },

  // Add activity
  addActivity: async (userId: string, activity: Omit<Activity, 'id'>): Promise<void> => {
    try {
      const data = await cloudDashboardService.getDashboardData(userId);
      const newActivity: Activity = {
        ...activity,
        id: Date.now().toString()
      };
      data.activities = [newActivity, ...data.activities].slice(0, 10); // Keep last 10
      await cloudDashboardService.saveDashboardData(userId, data);
      console.log('✅ Activity added to cloud:', newActivity.title);
    } catch (error: any) {
      console.error('❌ Error adding activity:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🚫 PERMISSION DENIED - Check Firestore security rules!');
      }
      
      throw error;
    }
  },

  // Update program progress
  updateProgramProgress: async (userId: string, progress: Partial<ProgramProgress>): Promise<void> => {
    try {
      const data = await cloudDashboardService.getDashboardData(userId);
      data.programProgress = { ...data.programProgress, ...progress };
      await cloudDashboardService.saveDashboardData(userId, data);
      console.log('✅ Program progress updated in cloud');
    } catch (error) {
      console.error('❌ Error updating program progress:', error);
    }
  }
};

// Cloud Exercise Completions Service
export const cloudCompletionsService = {
  // Get exercise completions for today
  getCompletions: async (userId: string, date: string): Promise<string[]> => {
    try {
      const docRef = doc(db, 'users', userId, 'completions', date);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().exercises || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching completions from Firestore:', error);
      return [];
    }
  },

  // Save exercise completions
  saveCompletions: async (userId: string, date: string, exercises: string[]): Promise<void> => {
    try {
      const docRef = doc(db, 'users', userId, 'completions', date);
      await setDoc(docRef, {
        exercises,
        date,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Completions saved to cloud:', exercises.length, 'exercises');
    } catch (error) {
      console.error('❌ Error saving completions to Firestore:', error);
    }
  },

  // Get program start date
  getProgramStartDate: async (userId: string): Promise<Date> => {
    try {
      const docRef = doc(db, 'users', userId, 'program', 'metadata');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.startDate) {
          return data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
        }
      }
      
      // First time - set start date to now
      const now = new Date();
      await setDoc(docRef, {
        startDate: Timestamp.fromDate(now),
        createdAt: serverTimestamp()
      });
      return now;
    } catch (error) {
      console.error('❌ Error fetching program start date:', error);
      return new Date();
    }
  }
};

// Migrate from localStorage to Firestore (run once per user)
export const migrateToCloud = async (userId: string): Promise<void> => {
  console.log('🔄 Starting migration from localStorage to Firestore...');
  
  try {
    // Check if already migrated
    const docRef = doc(db, 'users', userId, 'dashboard', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('ℹ️ User data already exists in cloud, skipping migration');
      return;
    }
    
    // Migrate dashboard data
    const localDashboardKey = `rehabmotion_dashboard_data_${userId}`;
    const localDashboard = localStorage.getItem(localDashboardKey);
    
    if (localDashboard) {
      const dashboardData = JSON.parse(localDashboard);
      // Convert timestamp strings to Date objects
      if (dashboardData.activities) {
        dashboardData.activities = dashboardData.activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      }
      await cloudDashboardService.saveDashboardData(userId, dashboardData);
      console.log('✅ Migrated dashboard data');
    }
    
    // Migrate exercise completions
    const completionsKey = 'rehabmotion_personalized_completions';
    const localCompletions = localStorage.getItem(completionsKey);
    
    if (localCompletions) {
      const completionsData = JSON.parse(localCompletions);
      await cloudCompletionsService.saveCompletions(
        userId, 
        completionsData.date, 
        completionsData.exercises
      );
      console.log('✅ Migrated exercise completions');
    }
    
    // Migrate program start date
    const programStartKey = `rehabmotion_program_start_${userId}`;
    const localProgramStart = localStorage.getItem(programStartKey);
    
    if (localProgramStart) {
      const startDate = new Date(localProgramStart);
      const metadataRef = doc(db, 'users', userId, 'program', 'metadata');
      await setDoc(metadataRef, {
        startDate: Timestamp.fromDate(startDate),
        createdAt: serverTimestamp()
      });
      console.log('✅ Migrated program start date');
    }
    
    console.log('✅ Migration complete! Data is now synced to cloud');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};
