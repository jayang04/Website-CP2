import { DashboardManager } from './components/DashboardManager.js';
import { FormHandler } from './components/FormHandler.js';
import { NavigationComponent } from './components/NavigationComponent.js';

// Global instances
let navigation: NavigationComponent | null = null;
let dashboardManager: DashboardManager | null = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 App initializing...');
  
  // Initialize navigation on all pages
  navigation = new NavigationComponent();
  navigation.highlightActiveLink();

  const currentPage = getCurrentPage();
  console.log('📄 Current page:', currentPage);
  
  // Check authentication status for all pages
  console.log('🔐 Checking authentication...');
  const isAuthenticated = await checkAuthentication();
  console.log('🔐 Authentication result:', isAuthenticated);
  
  // For protected pages, redirect to login if not authenticated
  if (['dashboard', 'knee-rehab', 'ankle-rehab'].includes(currentPage) && !isAuthenticated) {
    console.log('🚫 Redirecting to login - protected page without auth');
    window.location.href = 'login.html';
    return;
  }
  
  // For login/signup pages, redirect to dashboard if already authenticated
  if (['login', 'signup'].includes(currentPage) && isAuthenticated) {
    console.log('✅ Redirecting to dashboard - already authenticated');
    window.location.href = 'dashboard.html';
    return;
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
 * Wait for Firebase auth to be ready and check authentication
 */
async function checkAuthentication(): Promise<boolean> {
  try {
    console.log('🔍 Loading auth service...');
    const authModule = await import('./firebase/auth.js');
    const authService = new (authModule as any).AuthService();
    
    // Return a promise that resolves when auth state is determined
    return new Promise((resolve) => {
      // Set up a one-time auth state listener
      let resolved = false;
      
      const resolveOnce = (isAuthenticated: boolean) => {
        if (!resolved) {
          resolved = true;
          console.log('🔐 Auth state resolved:', isAuthenticated);
          resolve(isAuthenticated);
        }
      };
      
      // Check if already authenticated
      console.log('🔍 Checking current auth state...');
      if (authService.isAuthenticated()) {
        console.log('✅ Already authenticated');
        resolveOnce(true);
        return;
      }
      
      console.log('⏳ Waiting for auth state change...');
      // Listen for auth state change
      authService.onAuthStateChange((user: any) => {
        console.log('🔄 Auth state changed:', user ? 'authenticated' : 'not authenticated');
        resolveOnce(user !== null);
      });
      
      // Fallback timeout - assume not authenticated after 2 seconds
      setTimeout(() => {
        console.log('⏰ Auth check timeout - assuming not authenticated');
        resolveOnce(false);
      }, 2000);
    });
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
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
 * Update home page UI for logged-in users
 */
async function updateHomePageForLoggedInUser(): Promise<void> {
  try {
    console.log('📝 Updating home page for logged-in user...');
    
    // Get user data
    const authModule = await import('./firebase/auth.js');
    const dataModule = await import('./firebase/data.js');
    const authService = new (authModule as any).AuthService();
    const dataService = new (dataModule as any).DataService();
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.log('❌ No current user found');
      return;
    }
    
    console.log('👤 Current user from Firebase Auth:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    });
    
    // Start with Firebase Auth data as fallback
    let userName = currentUser.displayName?.split(' ')[0] ||
                   currentUser.email?.split('@')[0] || 
                   'User';
    let userEmail = currentUser.email || 'user@example.com';
    
    // Try to get user profile data from Firestore
    try {
      const result = await dataService.getUserProfile(currentUser.uid);
      
      if (result.success && result.data) {
        console.log('✅ User profile loaded from Firestore:', result.data);
        
        // Use Firestore data if available
        if (result.data.firstName) {
          userName = result.data.firstName;
        } else if (result.data.displayName) {
          userName = result.data.displayName.split(' ')[0];
        }
        
        if (result.data.email) {
          userEmail = result.data.email;
        }
      } else {
        console.log('⚠️ User profile not found in Firestore, using Auth data');
        console.log('Firestore result:', result);
      }
    } catch (firestoreError) {
      console.warn('⚠️ Error fetching from Firestore, using Firebase Auth data:', firestoreError);
    }
    
    console.log('👤 Final display name:', userName);
    console.log('📧 Final email:', userEmail);
    
    // Hide login link and show profile dropdown
    const loginLink = document.getElementById('loginLink');
    const profileDropdownContainer = document.getElementById('profileDropdownContainer');
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileUserProfile = document.getElementById('mobileUserProfile');
    const mobileLoggedInLinks = document.getElementById('mobileLoggedInLinks');
    
    if (loginLink) loginLink.style.display = 'none';
    if (profileDropdownContainer) profileDropdownContainer.style.display = 'block';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';
    if (mobileUserProfile) mobileUserProfile.style.display = 'flex';
    if (mobileLoggedInLinks) mobileLoggedInLinks.style.display = 'block';
    
    // Update profile dropdown with user data
    const profileName = document.querySelector('.profile-name') as HTMLElement;
    const dropdownUsername = document.querySelector('.dropdown-username') as HTMLElement;
    const dropdownEmail = document.querySelector('.dropdown-email') as HTMLElement;
    const mobileUsername = document.querySelector('.mobile-username') as HTMLElement;
    const mobileEmail = document.querySelector('.mobile-email') as HTMLElement;
    
    if (profileName) {
      profileName.textContent = userName;
      console.log('✅ Updated profile name:', userName);
    }
    if (dropdownUsername) {
      dropdownUsername.textContent = userName;
      console.log('✅ Updated dropdown username:', userName);
    }
    if (dropdownEmail) {
      dropdownEmail.textContent = userEmail;
      console.log('✅ Updated dropdown email:', userEmail);
    }
    if (mobileUsername) {
      mobileUsername.textContent = userName;
      console.log('✅ Updated mobile username:', userName);
    }
    if (mobileEmail) {
      mobileEmail.textContent = userEmail;
      console.log('✅ Updated mobile email:', userEmail);
    }
    
    console.log('✅ Home page UI updated for logged-in user');
  } catch (error) {
    console.error('❌ Error updating home page for logged-in user:', error);
  }
}

/**
 * Initialize home page
 */
async function initializeHomePage(): Promise<void> {
  console.log('Initializing home page...');
  
  // Set up auth state listener for home page
  try {
    const authModule = await import('./firebase/auth.js');
    const authService = new (authModule as any).AuthService();
    
    // Listen for auth state changes
    authService.onAuthStateChange(async (user: any) => {
      console.log('🔐 Home page auth state changed:', user ? 'logged in' : 'logged out');
      
      if (user) {
        console.log('✅ User is authenticated, updating home page UI...');
        await updateHomePageForLoggedInUser();
      } else {
        console.log('❌ User is not authenticated, showing login link');
        // Make sure login link is visible
        const loginLink = document.getElementById('loginLink');
        const profileDropdownContainer = document.getElementById('profileDropdownContainer');
        const mobileLoginLink = document.getElementById('mobileLoginLink');
        const mobileUserProfile = document.getElementById('mobileUserProfile');
        const mobileLoggedInLinks = document.getElementById('mobileLoggedInLinks');
        
        if (loginLink) loginLink.style.display = 'block';
        if (profileDropdownContainer) profileDropdownContainer.style.display = 'none';
        if (mobileLoginLink) mobileLoginLink.style.display = 'block';
        if (mobileUserProfile) mobileUserProfile.style.display = 'none';
        if (mobileLoggedInLinks) mobileLoggedInLinks.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('❌ Error setting up auth listener:', error);
  }
  
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
