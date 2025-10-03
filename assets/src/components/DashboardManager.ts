import type { User, ProgressMetrics, ExerciseSession, PainLevel } from '../types/index.js';
import { generateProgressMetrics, formatRelativeDate, getPainLevelColor } from '../utils/calculations.js';

export class DashboardManager {
  private user: User | null = null;
  private firstName: string = '';
  private sessions: ExerciseSession[] = [];
  private authService: any = null;
  private dataService: any = null;
  private unsubscribe: any = null;
  
  constructor() {
    console.log('📊 Dashboard: DashboardManager constructor called');
    this.initializeServices();
    
    // Add a delayed fallback to ensure dashboard shows even if data fails to load
    setTimeout(() => {
      console.log('📊 Dashboard: Fallback timeout - ensuring dashboard is visible');
      const dashboard = document.querySelector('.dashboard-fullscreen') as HTMLElement;
      
      if (dashboard && dashboard.style.opacity === '0') {
        console.log('📊 Dashboard: Fallback - forcing dashboard to show');
        
        // Try to get user from auth service directly
        if (this.authService && this.authService.getCurrentUser()) {
          const user = this.authService.getCurrentUser();
          console.log('📊 Dashboard: Fallback - got user from auth:', user);
          const fallbackName = user.displayName?.split(' ')[0] || 
                              user.email?.split('@')[0] || 
                              'User';
          this.firstName = fallbackName;
          this.updateUserDisplay();
        } else {
          // Dashboard will show automatically since we removed the opacity block
          console.log('📊 Dashboard: No user data, but dashboard should be visible');
        }
      }
    }, 2000); // 2 second fallback
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
        console.log('📊 Dashboard: Auth state changed, user:', user);
        
        if (user) {
          console.log('📊 Dashboard: User authenticated, UID:', user.uid);
          console.log('📊 Dashboard: User email:', user.email);
          console.log('📊 Dashboard: User displayName:', user.displayName);
          
          this.loadUserData(user.uid);
          this.loadSessions(user.uid);
        } else {
          console.log('🚫 Dashboard: User not authenticated');
          // Don't redirect here - let the main app logic handle redirects
          // Just clear the user data
          this.user = null;
          this.firstName = '';
        }
      });
      
    } catch (error) {
      console.error('Error initializing Firebase services:', error);
    }
  }
  
  /**
   * Generate a unique avatar URL based on user's first name
   */
  private generateUserAvatar(firstName: string): string {
    // Array of different professional-looking avatar images
    const avatarOptions = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80', // Male 1
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80', // Male 2  
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80', // Male 3
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80', // Female 1
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80', // Female 2
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80', // Female 3
    ];
    
    // Generate a consistent index based on the first letter of the name
    const charCode = firstName.charCodeAt(0) || 65; // Default to 'A' if empty
    const index = charCode % avatarOptions.length;
    
    return (avatarOptions[index] || avatarOptions[0]) as string;
  }

  /**
   * Load user data from Firestore
   */
  private async loadUserData(userId: string): Promise<void> {
    try {
      console.log('📊 Dashboard: Loading user data for ID:', userId);
      
      // Get current Firebase Auth user for fallback
      const currentAuthUser = this.authService.getCurrentUser();
      console.log('📊 Dashboard: Firebase Auth user:', currentAuthUser);
      
      const result = await this.dataService.getUserProfile(userId);
      console.log('📊 Dashboard: User profile result:', result);
      
      if (result.success) {
        console.log('📊 Dashboard: User data from Firestore:', result.data);
        
        // Extract first name from either firstName field or displayName
        const firstName = result.data.firstName || 
                         result.data.displayName?.split(' ')[0] || 
                         currentAuthUser?.displayName?.split(' ')[0] ||
                         currentAuthUser?.email?.split('@')[0] || 
                         'User';
                         
        console.log('📊 Dashboard: Extracted firstName:', firstName);
        
        // Get email from Firestore or Firebase Auth
        const userEmail = result.data.email || currentAuthUser?.email || 'user@example.com';
        console.log('📊 Dashboard: User email:', userEmail);
        
        this.user = {
          id: userId,
          name: result.data.displayName || `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim() || 'User',
          email: userEmail,
          avatar: this.generateUserAvatar(result.data.firstName || firstName),
          createdAt: result.data.createdAt?.toDate() || new Date(),
          lastLogin: result.data.lastLogin?.toDate() || new Date()
        };
        
        // Store first name for easy access
        this.firstName = firstName;
        console.log('📊 Dashboard: Stored firstName:', this.firstName);
        console.log('📊 Dashboard: Stored user.email:', this.user.email);
        
        this.updateUserDisplay();
        console.log('📊 Dashboard: Called updateUserDisplay()');
      } else {
        console.log('❌ Dashboard: Failed to get user profile:', result);
        
        // Use Firebase Auth data as complete fallback
        if (currentAuthUser) {
          console.log('🔄 Dashboard: Using complete Firebase Auth fallback');
          const fallbackFirstName = currentAuthUser.displayName?.split(' ')[0] || 
                                    currentAuthUser.email?.split('@')[0] || 
                                    'User';
          this.firstName = fallbackFirstName;
          this.user = {
            id: userId,
            name: currentAuthUser.displayName || fallbackFirstName,
            email: currentAuthUser.email || 'user@example.com',
            avatar: this.generateUserAvatar(fallbackFirstName),
            createdAt: new Date(),
            lastLogin: new Date()
          };
          this.updateUserDisplay();
        }
      }
    } catch (error) {
      console.error('❌ Dashboard: Error loading user data:', error);
      
      // Fallback: try to get name from Firebase Auth user
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        console.log('🔄 Dashboard: Using fallback from Firebase Auth due to error');
        const fallbackFirstName = currentUser.displayName?.split(' ')[0] || 
                                  currentUser.email?.split('@')[0] || 
                                  'User';
        this.firstName = fallbackFirstName;
        this.user = {
          id: userId,
          name: currentUser.displayName || fallbackFirstName,
          email: currentUser.email || 'user@example.com',
          avatar: this.generateUserAvatar(fallbackFirstName),
          createdAt: new Date(),
          lastLogin: new Date()
        };
        this.updateUserDisplay();
      }
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
    console.log('📊 Dashboard: updateUserDisplay called');
    console.log('📊 Dashboard: this.user:', this.user);
    console.log('📊 Dashboard: this.firstName:', this.firstName);
    
    if (!this.user && !this.firstName) {
      console.log('❌ Dashboard: No user data available for display update');
      return;
    }
    
    // Use firstName if available, otherwise fallback to user.name
    const displayName = this.firstName || this.user?.name || 'User';
    console.log('📊 Dashboard: Using display name:', displayName);
    
    // Update welcome message in hero section
    const heroTitle = document.querySelector('.hero-content h1') as HTMLElement;
    if (heroTitle) {
      heroTitle.textContent = `👋 Welcome back, ${displayName}!`;
    }
    
    // Update profile button name
    const profileName = document.querySelector('.profile-name') as HTMLElement;
    if (profileName) {
      profileName.textContent = displayName;
    }
    
    // Update dropdown username
    const dropdownUsername = document.querySelector('.dropdown-username') as HTMLElement;
    if (dropdownUsername) {
      dropdownUsername.textContent = this.user?.name || displayName;
    }
    
    // Update dropdown email
    const dropdownEmail = document.querySelector('.dropdown-email') as HTMLElement;
    if (dropdownEmail && this.user?.email) {
      dropdownEmail.textContent = this.user.email;
    }
    
    // Update mobile username
    const mobileUsername = document.querySelector('.mobile-username') as HTMLElement;
    if (mobileUsername) {
      mobileUsername.textContent = this.user?.name || displayName;
    }
    
    // Update mobile email
    const mobileEmail = document.querySelector('.mobile-email') as HTMLElement;
    if (mobileEmail && this.user?.email) {
      mobileEmail.textContent = this.user.email;
    }
    
    // Trigger dashboard fade-in when user data is ready
    this.triggerDashboardFadeIn();
  }
  
  /**
   * Trigger dashboard fade-in (faster when user data is ready)
   */
  private triggerDashboardFadeIn(): void {
    const dashboard = document.querySelector('.dashboard-fullscreen') as HTMLElement;
    if (dashboard) {
      console.log('📊 Dashboard: User data ready, triggering fade-in');
      dashboard.style.opacity = '1';
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
