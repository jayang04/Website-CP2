// Firebase Data Service for Rehabilitation Platform
import { db } from './config.js';
import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

export class DataService {
    constructor() {
        this.usersCollection = 'rehab-users';
        this.exercisesCollection = 'exercises';
        this.progressCollection = 'user-progress';
        this.sessionsCollection = 'exercise-sessions';
    }
    
    // User Profile Management
    async createUserProfile(userId, userData) {
        try {
            const userRef = doc(db, this.usersCollection, userId);
            const profileData = {
                email: userData.email,
                displayName: userData.displayName || '',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                profileComplete: false,
                currentProgram: null,
                totalSessions: 0,
                currentStreak: 0,
                bestStreak: 0,
                ...userData
            };
            
            await setDoc(userRef, profileData);
            return { success: true, data: profileData };
        } catch (error) {
            console.error('Error creating user profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getUserProfile(userId) {
        try {
            const userRef = doc(db, this.usersCollection, userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                return { success: true, data: userSnap.data() };
            } else {
                return { success: false, error: 'User profile not found' };
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    async updateUserProfile(userId, updates) {
        try {
            const userRef = doc(db, this.usersCollection, userId);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Exercise Session Management
    async logExerciseSession(userId, sessionData) {
        try {
            const sessionRef = collection(db, this.sessionsCollection);
            const session = {
                userId: userId,
                exerciseType: sessionData.exerciseType,
                exerciseName: sessionData.exerciseName,
                duration: sessionData.duration || 0,
                painLevel: sessionData.painLevel || 0,
                difficulty: sessionData.difficulty || 'moderate',
                notes: sessionData.notes || '',
                completed: sessionData.completed || true,
                timestamp: serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            };
            
            const docRef = await addDoc(sessionRef, session);
            
            // Update user stats
            await this.updateUserStats(userId);
            
            return { success: true, sessionId: docRef.id, data: session };
        } catch (error) {
            console.error('Error logging exercise session:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getUserSessions(userId, limitCount = 10) {
        try {
            const sessionsRef = collection(db, this.sessionsCollection);
            const q = query(
                sessionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            const sessions = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: sessions };
        } catch (error) {
            console.error('Error getting user sessions:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Progress Tracking
    async updateUserStats(userId) {
        try {
            // Get all user sessions to calculate stats
            const sessionsRef = collection(db, this.sessionsCollection);
            const q = query(
                sessionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const sessions = [];
            querySnapshot.forEach((doc) => {
                sessions.push(doc.data());
            });
            
            // Calculate stats
            const totalSessions = sessions.length;
            const completedSessions = sessions.filter(s => s.completed).length;
            const currentStreak = this.calculateCurrentStreak(sessions);
            const bestStreak = this.calculateBestStreak(sessions);
            
            // Update user profile with new stats
            await this.updateUserProfile(userId, {
                totalSessions: totalSessions,
                completedSessions: completedSessions,
                currentStreak: currentStreak,
                bestStreak: Math.max(bestStreak, currentStreak),
                lastActivity: serverTimestamp()
            });
            
            return { 
                success: true, 
                stats: { totalSessions, completedSessions, currentStreak, bestStreak }
            };
        } catch (error) {
            console.error('Error updating user stats:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Calculate current streak (consecutive days with completed sessions)
    calculateCurrentStreak(sessions) {
        if (sessions.length === 0) return 0;
        
        const today = new Date().toISOString().split('T')[0];
        const sessionDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
        
        let streak = 0;
        let currentDate = new Date(today);
        
        for (const sessionDate of sessionDates) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (sessionDate === dateStr) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (streak === 0 && sessionDate === new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
                // Allow for yesterday if no session today yet
                streak++;
                currentDate.setDate(currentDate.getDate() - 2);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Calculate best streak ever
    calculateBestStreak(sessions) {
        if (sessions.length === 0) return 0;
        
        const sessionDates = [...new Set(sessions.map(s => s.date))].sort();
        let bestStreak = 0;
        let currentStreak = 1;
        
        for (let i = 1; i < sessionDates.length; i++) {
            const prevDate = new Date(sessionDates[i - 1]);
            const currDate = new Date(sessionDates[i]);
            const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                bestStreak = Math.max(bestStreak, currentStreak);
                currentStreak = 1;
            }
        }
        
        return Math.max(bestStreak, currentStreak);
    }
    
    // Get user progress summary
    async getUserProgress(userId) {
        try {
            const profile = await this.getUserProfile(userId);
            const sessions = await this.getUserSessions(userId, 30); // Last 30 sessions
            
            if (!profile.success) {
                return profile;
            }
            
            const progressData = {
                profile: profile.data,
                recentSessions: sessions.success ? sessions.data : [],
                completionRate: this.calculateCompletionRate(sessions.success ? sessions.data : []),
                averagePainLevel: this.calculateAveragePainLevel(sessions.success ? sessions.data : [])
            };
            
            return { success: true, data: progressData };
        } catch (error) {
            console.error('Error getting user progress:', error);
            return { success: false, error: error.message };
        }
    }
    
    calculateCompletionRate(sessions) {
        if (sessions.length === 0) return 0;
        const completed = sessions.filter(s => s.completed).length;
        return Math.round((completed / sessions.length) * 100);
    }
    
    calculateAveragePainLevel(sessions) {
        if (sessions.length === 0) return 0;
        const validSessions = sessions.filter(s => s.painLevel !== undefined);
        if (validSessions.length === 0) return 0;
        
        const total = validSessions.reduce((sum, s) => sum + s.painLevel, 0);
        return Math.round((total / validSessions.length) * 10) / 10;
    }
    
    // Real-time listeners
    subscribeToUserSessions(userId, callback) {
        const sessionsRef = collection(db, this.sessionsCollection);
        const q = query(
            sessionsRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        
        return onSnapshot(q, (querySnapshot) => {
            const sessions = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() });
            });
            callback(sessions);
        });
    }
}
