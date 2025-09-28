import { DashboardManager } from './components/DashboardManager.js';
import { FormHandler } from './components/FormHandler.js';
import { NavigationComponent } from './components/NavigationComponent.js';

// Global navigation instance
let navigation: NavigationComponent | null = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation on all pages
  navigation = new NavigationComponent();
  navigation.highlightActiveLink();

  const currentPage = getCurrentPage();
  
  switch (currentPage) {
    case 'dashboard':
      initializeDashboard();
      break;
    case 'login':
      initializeLoginForm();
      break;
    case 'signup':
      initializeSignupForm();
      break;
    case 'knee-rehab':
    case 'ankle-rehab':
      initializeRehabPage();
      break;
    default:
      initializeHomePage();
  }
});

/**
 * Get current page from URL
 */
function getCurrentPage(): string {
  const path = window.location.pathname;
  const filename = path.split('/').pop()?.split('.')[0] || 'index';
  return filename;
}

/**
 * Initialize dashboard page
 */
function initializeDashboard(): void {
  console.log('Initializing dashboard...');
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  const dashboardManager = new DashboardManager();
  
  // Add sample data for demonstration
  addSampleExerciseSessions(dashboardManager);
  
  // Initialize logout functionality
  const logoutLinks = document.querySelectorAll('a[href="index.html"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}

/**
 * Initialize login form
 */
function initializeLoginForm(): void {
  console.log('Initializing login form...');
  
  const loginForm = document.querySelector('form') as HTMLFormElement;
  if (loginForm) {
    // Add name attributes to inputs for form handling
    const emailInput = loginForm.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = loginForm.querySelector('input[type="password"]') as HTMLInputElement;
    
    if (emailInput) emailInput.name = 'email';
    if (passwordInput) passwordInput.name = 'password';
    
    FormHandler.handleLoginForm(loginForm);
  }
}

/**
 * Initialize signup form
 */
function initializeSignupForm(): void {
  console.log('Initializing signup form...');
  
  const signupForm = document.querySelector('form') as HTMLFormElement;
  if (signupForm) {
    FormHandler.handleSignupForm(signupForm);
  }
}

/**
 * Initialize rehabilitation pages
 */
function initializeRehabPage(): void {
  console.log('Initializing rehab page...');
  
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  // Add exercise completion tracking
  const exerciseCards = document.querySelectorAll('.exercise-card');
  exerciseCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      showExerciseModal(index);
    });
  });
}

/**
 * Initialize home page
 */
function initializeHomePage(): void {
  console.log('Initializing home page...');
  
  // Add smooth scrolling for navigation
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);
      const target = document.getElementById(targetId || '');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Add feature card hover effects
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    const cardElement = card as HTMLElement;
    
    card.addEventListener('mouseenter', () => {
      cardElement.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', () => {
      cardElement.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Check if user is logged in
 */
function isLoggedIn(): boolean {
  return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Logout user
 */
function logout(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('exerciseSessions');
  window.location.href = 'index.html';
}

/**
 * Add sample exercise sessions for demonstration
 */
function addSampleExerciseSessions(dashboardManager: DashboardManager): void {
  // Only add if no sessions exist
  const existingSessions = localStorage.getItem('exerciseSessions');
  if (existingSessions) return;
  
  const sampleSessions = [
    {
      exerciseId: '1',
      userId: '1',
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      painLevel: 3,
      difficultyRating: 4,
      notes: 'Felt good today',
      duration: 15
    },
    {
      exerciseId: '2',
      userId: '1',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      painLevel: 4,
      difficultyRating: 3,
      notes: 'Slight discomfort',
      duration: 20
    },
    {
      exerciseId: '1',
      userId: '1',
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      painLevel: 2,
      difficultyRating: 4,
      notes: 'Great session',
      duration: 18
    }
  ];
  
  sampleSessions.forEach(session => {
    dashboardManager.addSession(session);
  });
}

/**
 * Show exercise completion modal
 */
function showExerciseModal(exerciseIndex: number): void {
  const modal = document.createElement('div');
  modal.className = 'exercise-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <h3>Complete Exercise</h3>
      <form class="exercise-completion-form">
        <label>
          Pain Level (0-10):
          <input type="range" name="painLevel" min="0" max="10" value="0" style="width: 100%; margin: 0.5rem 0;">
          <span class="pain-value">0</span>
        </label>
        
        <label>
          Difficulty (1-5):
          <input type="range" name="difficulty" min="1" max="5" value="3" style="width: 100%; margin: 0.5rem 0;">
          <span class="difficulty-value">3</span>
        </label>
        
        <label>
          Duration (minutes):
          <input type="number" name="duration" min="1" max="60" value="15" style="width: 100%; padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #e2e8f0; border-radius: 0.375rem;">
        </label>
        
        <label>
          Notes (optional):
          <textarea name="notes" rows="3" style="width: 100%; padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #e2e8f0; border-radius: 0.375rem;"></textarea>
        </label>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="submit" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; cursor: pointer;">
            Complete Exercise
          </button>
          <button type="button" class="cancel-btn" style="flex: 1; background: #6b7280; color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; cursor: pointer;">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Add event listeners
  const painInput = modal.querySelector('input[name="painLevel"]') as HTMLInputElement;
  const painValue = modal.querySelector('.pain-value') as HTMLElement;
  const difficultyInput = modal.querySelector('input[name="difficulty"]') as HTMLInputElement;
  const difficultyValue = modal.querySelector('.difficulty-value') as HTMLElement;
  
  painInput.addEventListener('input', () => {
    painValue.textContent = painInput.value;
  });
  
  difficultyInput.addEventListener('input', () => {
    difficultyValue.textContent = difficultyInput.value;
  });
  
  const form = modal.querySelector('form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    // Create session data
    const sessionData = {
      exerciseId: exerciseIndex.toString(),
      userId: '1',
      completedAt: new Date(),
      painLevel: parseInt(formData.get('painLevel') as string),
      difficultyRating: parseInt(formData.get('difficulty') as string),
      duration: parseInt(formData.get('duration') as string),
      notes: formData.get('notes') as string
    };
    
    // Save session
    const sessions = JSON.parse(localStorage.getItem('exerciseSessions') || '[]');
    sessions.push({
      ...sessionData,
      id: Date.now().toString()
    });
    localStorage.setItem('exerciseSessions', JSON.stringify(sessions));
    
    // Close modal
    document.body.removeChild(modal);
    
    // Show success message
    alert('Exercise completed! Great job! 🎉');
  });
  
  const cancelBtn = modal.querySelector('.cancel-btn') as HTMLButtonElement;
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  document.body.appendChild(modal);
}

// Export for global access if needed
declare global {
  interface Window {
    RehabApp: {
      logout: () => void;
      isLoggedIn: () => boolean;
    };
  }
}

window.RehabApp = {
  logout,
  isLoggedIn
};
