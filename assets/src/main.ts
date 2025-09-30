import { DashboardManager } from './components/DashboardManager.js';
import { FormHandler } from './components/FormHandler.js';
import { NavigationComponent } from './components/NavigationComponent.js';

// Global instances
let navigation: NavigationComponent | null = null;
let dashboardManager: DashboardManager | null = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize navigation on all pages
  navigation = new NavigationComponent();
  navigation.highlightActiveLink();

  const currentPage = getCurrentPage();
  
  // Check authentication for protected pages
  if (['dashboard', 'knee-rehab', 'ankle-rehab'].includes(currentPage)) {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      window.location.href = 'login.html';
      return;
    }
  }
  
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
  
  // Set up logout functionality if user is authenticated
  setupLogoutHandlers();
});

/**
 * Check if user is authenticated
 */
async function checkAuthentication(): Promise<boolean> {
  try {
    const authModule = await import('./firebase/auth.js');
    const authService = new (authModule as any).AuthService();
    return authService.isAuthenticated();
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

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
  
  // Initialize dashboard manager (handles authentication internally)
  dashboardManager = new DashboardManager();
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
  
  // Note: Authentication is now handled by Firebase in the main auth check
  
  // Add exercise completion tracking
  const exerciseCards = document.querySelectorAll('.exercise-card');
  exerciseCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      // TODO: Implement Firebase exercise completion modal
      console.log('Exercise card clicked:', index);
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
 * Set up logout handlers
 */
function setupLogoutHandlers(): void {
  const logoutLinks = document.querySelectorAll('a[href="index.html"].logout, .dropdown-item.logout');
  logoutLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleLogout();
    });
  });
}

/**
 * Handle user logout
 */
async function handleLogout(): Promise<void> {
  try {
    if (dashboardManager) {
      await dashboardManager.logout();
    } else {
      // Fallback logout
      const authModule = await import('./firebase/auth.js');
      const authService = new (authModule as any).AuthService();
      await authService.logout();
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    window.location.href = 'index.html';
  }
}
