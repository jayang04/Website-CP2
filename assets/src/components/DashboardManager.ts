import type { User, ProgressMetrics, ExerciseSession, PainLevel } from '../types/index.js';
import { generateProgressMetrics, formatRelativeDate, getPainLevelColor } from '../utils/calculations.js';

export class DashboardManager {
  private user: User | null = null;
  private sessions: ExerciseSession[] = [];
  private authService: any = null;
  private dataService: any = null;
  private unsubscribe: any = null;
  
  constructor() {
    this.initializeServices();
  }
  
  /**
   * Initialize Firebase services and load data
   */
  private async initializeServices(): Promise<void> {
    try {
      const authModule = await import('../firebase/auth.js');
      const dataModule = await import('../firebase/data.js');
      
      this.authService = new (authModule as any).AuthService();
      this.dataService = new (dataModule as any).DataService();
      
      // Listen for auth state changes
      this.authService.onAuthStateChange((user: any) => {
        if (user) {
          this.loadUserData(user.uid);
          this.loadSessions(user.uid);
        } else {
          // Redirect to login if not authenticated
          window.location.href = 'login.html';
        }
      });
      
    } catch (error) {
      console.error('Error initializing Firebase services:', error);
    }
  }
  
  /**
   * Load user data from Firestore
   */
  private async loadUserData(userId: string): Promise<void> {
    try {
      const result = await this.dataService.getUserProfile(userId);
      if (result.success) {
        this.user = {
          id: userId,
          name: result.data.displayName || 'User',
          email: result.data.email,
          avatar: `https://images.unsplash.com/photo-1494790108755-2616b9d59278?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80`,
          createdAt: result.data.createdAt?.toDate() || new Date(),
          lastLogin: result.data.lastLogin?.toDate() || new Date()
        };
        this.updateUserDisplay();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }
  
  /**
   * Load exercise sessions from Firestore
   */
  private async loadSessions(userId: string): Promise<void> {
    try {
      // Subscribe to real-time session updates
      this.unsubscribe = this.dataService.subscribeToUserSessions(userId, (sessions: any[]) => {
        this.sessions = sessions.map((session: any) => ({
          id: session.id,
          exerciseId: session.exerciseType,
          userId: userId,
          exerciseType: session.exerciseType,
          exerciseName: session.exerciseName,
          duration: session.duration,
          painLevel: session.painLevel,
          difficultyRating: session.difficulty === 'easy' ? 1 : session.difficulty === 'moderate' ? 2 : 3,
          completedAt: session.timestamp?.toDate() || new Date(),
          completed: session.completed
        }));
        this.updateProgressDisplay();
        this.updateActivityWidget();
      });
      
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }
  
  /**
   * Update user display in the dashboard
   */
  private updateUserDisplay(): void {
    if (!this.user) return;
    
    const nameElement = document.querySelector('.dashboard-header h2');
    const avatarElement = document.querySelector('.dashboard-avatar') as HTMLImageElement;
    
    if (nameElement) {
      nameElement.textContent = `👋 Welcome back, ${this.user.name}!`;
    }
    
    if (avatarElement && this.user.avatar) {
      avatarElement.src = this.user.avatar;
    }
  }
  
  /**
   * Update progress widgets with real data
   */
  private updateProgressDisplay(): void {
    const metrics = generateProgressMetrics(this.sessions);
    this.updateProgressWidget(metrics);
    this.updateActivityWidget();
    this.updateStreakDisplay(metrics.streakDays);
  }
  
  /**
   * Update the progress widget
   */
  private updateProgressWidget(metrics: ProgressMetrics): void {
    const progressWidget = document.querySelector('.widget-progress');
    if (!progressWidget) return;
    
    // Update progress text
    const existingText = progressWidget.querySelector('p');
    if (existingText) {
      existingText.textContent = 
        `You've completed ${metrics.totalSessions} sessions. ${metrics.progressPercentage}% complete!`;
    } else {
      const progressText = document.createElement('p');
      progressText.textContent = 
        `You've completed ${metrics.totalSessions} sessions. ${metrics.progressPercentage}% complete!`;
      progressWidget.appendChild(progressText);
    }
    
    // Add progress bar
    if (!progressWidget.querySelector('.progress-bar')) {
      const progressBar = this.createProgressBar(metrics.progressPercentage);
      progressWidget.appendChild(progressBar);
    }
  }
  
  /**
   * Create a progress bar element
   */
  private createProgressBar(percentage: number): HTMLElement {
    const container = document.createElement('div');
    container.className = 'progress-bar';
    container.style.cssText = `
      width: 100%;
      height: 8px;
      background-color: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 1rem;
    `;
    
    const fill = document.createElement('div');
    fill.style.cssText = `
      width: ${percentage}%;
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 4px;
      transition: width 0.5s ease;
    `;
    
    container.appendChild(fill);
    return container;
  }
  
  /**
   * Update recent activity widget
   */
  private updateActivityWidget(): void {
    const activityWidget = document.querySelector('.widget-activity ul');
    if (!activityWidget || this.sessions.length === 0) return;
    
    const recentSessions = this.sessions
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 4);
    
    activityWidget.innerHTML = '';
    
    recentSessions.forEach(session => {
      const li = document.createElement('li');
      const painColor = getPainLevelColor(session.painLevel as PainLevel);
      
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>✅ Exercise completed</span>
          <span style="font-size: 0.875rem; color: #64748b;">
            ${formatRelativeDate(session.completedAt)}
          </span>
        </div>
        <div style="margin-top: 0.25rem; font-size: 0.875rem;">
          Pain level: <span style="color: ${painColor}; font-weight: 600;">${session.painLevel}/10</span>
        </div>
      `;
      
      activityWidget.appendChild(li);
    });
  }
  
  /**
   * Update streak display
   */
  private updateStreakDisplay(streakDays: number): void {
    // Add streak badge to dashboard header
    const header = document.querySelector('.dashboard-header');
    if (!header || header.querySelector('.streak-badge')) return;
    
    const streakBadge = document.createElement('div');
    streakBadge.className = 'streak-badge';
    streakBadge.style.cssText = `
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    `;
    streakBadge.innerHTML = `🔥 ${streakDays} day streak`;
    
    header.appendChild(streakBadge);
  }
  
  /**
   * Add a new exercise session
   */
  public addSession(session: Omit<ExerciseSession, 'id'>): void {
    const newSession: ExerciseSession = {
      ...session,
      id: Date.now().toString()
    };
    
    this.sessions.push(newSession);
    localStorage.setItem('exerciseSessions', JSON.stringify(this.sessions));
    this.updateProgressDisplay();
  }
  
  /**
   * Get current progress metrics
   */
  public getProgressMetrics(): ProgressMetrics {
    return generateProgressMetrics(this.sessions);
  }
  
  /**
   * Handle user logout
   */
  public async logout(): Promise<void> {
    try {
      if (this.authService) {
        await this.authService.logout();
      }
      this.cleanup();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  /**
   * Log exercise completion
   */
  public async logExercise(exerciseData: any): Promise<void> {
    try {
      const currentUser = this.authService?.getCurrentUser();
      if (!currentUser) return;
      
      await this.dataService.logExerciseSession(currentUser.uid, exerciseData);
      // Sessions will be updated automatically via the real-time listener
    } catch (error) {
      console.error('Error logging exercise:', error);
    }
  }
  
  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
