import type { User, ProgressMetrics, ExerciseSession, PainLevel } from '../types/index.js';
import { generateProgressMetrics, formatRelativeDate, getPainLevelColor } from '../utils/calculations.js';

export class DashboardManager {
  private user: User | null = null;
  private sessions: ExerciseSession[] = [];
  
  constructor() {
    this.loadUserData();
    this.loadSessions();
  }
  
  /**
   * Load user data from localStorage or API
   */
  private loadUserData(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.updateUserDisplay();
    }
  }
  
  /**
   * Load exercise sessions from localStorage or API
   */
  private loadSessions(): void {
    const storedSessions = localStorage.getItem('exerciseSessions');
    if (storedSessions) {
      this.sessions = JSON.parse(storedSessions).map((session: any) => ({
        ...session,
        completedAt: new Date(session.completedAt)
      }));
      this.updateProgressDisplay();
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
}
