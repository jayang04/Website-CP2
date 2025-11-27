import { useState, useEffect, useRef } from 'react'
import './App.css'
import { authService } from './firebase/auth'
import { type User as FirebaseUser } from 'firebase/auth'
import PoseTestPage from './pages/PoseTest'
import InjurySelection from './pages/InjurySelection'
import InjuryRehabProgram from './pages/InjuryRehabProgram'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Help from './pages/Help'
import AboutUs from './pages/AboutUs'
import BadgesPage from './pages/Badges'
import { injuryRehabService } from './services/dataService'
import { type InjuryType } from './types/injuries'
import PersonalizedPlanView from './components/PersonalizedPlanView'
import SmartIntakeForm from './components/SmartIntakeForm'
import { PersonalizationService } from './services/personalizationService'
import type { PersonalizedPlan } from './types/personalization'
import NotificationService from './services/notificationService'

// Types
interface User {
  name: string;
  firstName: string;
  email: string;
  photoURL: string | null;
  uid: string;
}

type Page = 'home' | 'dashboard' | 'login' | 'signup' | 'profile' | 'settings' | 'help' | 'about' | 'debug' | 'rehab-program' | 'injury-selection' | 'injury-rehab' | 'badges';

// Helper function to extract first name
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(timestamp).toLocaleDateString();
}

function App() {
  // Load saved page from localStorage or default to 'home'
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const saved = localStorage.getItem('rehabmotion_current_page');
    console.log('🔍 Loading saved page:', saved);
    return (saved as Page) || 'home';
  });
  const [user, setUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [activePlanType, setActivePlanType] = useState<'personalized' | 'general' | null>(null);
  
  // Track if this is the initial mount to prevent redirect on page load
  const hasCompletedInitialAuth = useRef(false);

  // Detect which plan type the user has active
  useEffect(() => {
    if (!user) {
      setActivePlanType(null);
      return;
    }
    
    // Check if user has a general rehab program (injury-based)
    const hasGeneralProgram = injuryRehabService.getUserInjury(user.uid) !== null;
    
    // Check if user has personalized plan
    const savedIntakeData = localStorage.getItem(`intake_data_${user.uid}`);
    const hasPersonalizedPlan = savedIntakeData !== null;
    
    // Set active plan type (prioritize personalized if both exist)
    if (hasPersonalizedPlan) {
      setActivePlanType('personalized');
    } else if (hasGeneralProgram) {
      setActivePlanType('general');
    } else {
      setActivePlanType(null);
    }
  }, [user, dashboardRefreshKey]);

  // Save current page to localStorage when it changes
  useEffect(() => {
    console.log('💾 Saving page to localStorage:', currentPage);
    localStorage.setItem('rehabmotion_current_page', currentPage);
  }, [currentPage]);

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    setDashboardRefreshKey(prev => prev + 1);
  };

  // Handle hash-based routing (for easy debug access)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      if (hash === 'debug') {
        setCurrentPage('debug');
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      if (firebaseUser) {
        const fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        setUser({
          name: fullName,
          firstName: getFirstName(fullName),
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid
        });
        setLoading(false);
        hasCompletedInitialAuth.current = true; // Auth complete with user
        
        // Initialize reminders when user logs in
        console.log('🔔 Initializing reminders for user:', firebaseUser.uid);
        NotificationService.initializeReminders(firebaseUser.uid);
        
        // Track activity when user logs in
        Promise.all([
          import('./services/dataService').then(({ activityTracker, dashboardService }) => {
            const daysActive = activityTracker.trackActivity(firebaseUser.uid);
            // Update dashboard stats with current activity days
            return dashboardService.updateStats(firebaseUser.uid, { daysActive });
          }),
          import('./services/cloudDataService').then(({ cloudDashboardService }) => {
            return cloudDashboardService.trackActivity(firebaseUser.uid).then(daysActive => {
              return cloudDashboardService.updateStats(firebaseUser.uid, { daysActive });
            });
          })
        ]).catch(err => console.error('Error tracking activity:', err));
      } else {
        setUser(null);
        setLoading(false);
        // Only mark auth as complete if this is a real "no user" state
        // Not the initial "no user yet" state during session restoration
        setTimeout(() => {
          hasCompletedInitialAuth.current = true;
        }, 500); // Wait 500ms to allow Firebase to restore session
      }
    };

    authService.addAuthStateListener(handleAuthStateChange);

    // Initial check
    const currentUser = authService.getCurrentUser();
    handleAuthStateChange(currentUser);

    return () => {
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  // Protect dashboard/profile pages after auth is loaded
  // IMPORTANT: Only redirect if we're SURE the user is not authenticated
  // Don't redirect during the initial loading phase
  useEffect(() => {
    console.log('🛡️ Protection check - loading:', loading, 'user:', !!user, 'currentPage:', currentPage, 'hasCompletedInitialAuth:', hasCompletedInitialAuth.current);
    
    // Only check protection AFTER initial auth check is complete
    if (hasCompletedInitialAuth.current && !loading) {
      // Small delay to ensure auth state is fully propagated
      const timeoutId = setTimeout(() => {
        // If no user and trying to access protected page, redirect
        const protectedPages = ['dashboard', 'profile', 'settings', 'rehab-program', 'injury-selection', 'injury-rehab'];
        if (!user && protectedPages.includes(currentPage)) {
          console.log('⚠️ Redirecting to home - user not authenticated');
          setCurrentPage('home');
        } else if (user) {
          console.log('✅ User authenticated - access granted to:', currentPage);
        }
      }, 100); // 100ms delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, user, currentPage]); // Now safe to include currentPage

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setCurrentPage('dashboard');
    } else {
      alert(result.message);
    }
    return result.success;
  };

  const handleSignup = async (firstName: string, lastName: string, email: string, password: string) => {
    const displayName = `${firstName} ${lastName}`;
    const result = await authService.register(email, password, displayName);
    if (result.success) {
      setCurrentPage('dashboard');
    } else {
      alert(result.message);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentPage('home');
    setShowProfileDropdown(false);
  };

  // Profile picture upload handler (currently unused - can be re-enabled if needed)
  /*
  const handleProfilePictureUpload = async (file: File) => {
    const photoURL = await authService.uploadProfilePicture(file);
    if (photoURL && user) {
      setUser({ ...user, photoURL });
    }
  };
  */

  // Handle intake form completion
  const handleIntakeComplete = (data: any) => {
    console.log('📝 Intake data received:', data);
    
    // Save to localStorage
    localStorage.setItem(`intake_data_${user?.uid}`, JSON.stringify(data));
    setIntakeData(data);
    setActivePlanType('personalized'); // User chose personalized plan
    
    // Generate personalized plan automatically
    if (user) {
      console.log('🤖 Generating personalized rehab plan...');
      const plan = PersonalizationService.generatePlan(
        user.uid,
        {
          type: data.injuryType,
          date: data.injuryDate,
          painLevel: data.currentPainLevel,
          fitnessLevel: data.fitnessLevel,
          age: data.age,
          goals: data.goals,
          limitations: [],
          sessionDuration: data.preferredSessionDuration,
          availableDays: data.availableDays,
          previousInjuries: []
        },
        [] // Empty session history initially - will populate as user exercises
      );
      
      setPersonalizedPlan(plan);
      console.log('✅ Plan generated successfully:', plan.phase, `- Week ${plan.weekNumber}`);
    }
    
    setShowIntakeForm(false);
  };

  const handleIntakeSkip = () => {
    setShowIntakeForm(false);
    // Mark as skipped so we don't show again immediately
    localStorage.setItem(`intake_skipped_${user?.uid}`, 'true');
  };

  // Handle reset ALL programs (both personalized and general)
  const resetAllPrograms = () => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to reset ALL your programs? This will clear both personalized and general program data and progress.')) {
      console.log('🗑️ Resetting ALL programs for user:', user.uid);
      
      // Clear personalized plan data
      localStorage.removeItem(`intake_data_${user.uid}`);
      localStorage.removeItem(`intake_skipped_${user.uid}`);
      
      // Clear general program data
      injuryRehabService.clearUserInjury(user.uid);
      
      // Clear React state
      setPersonalizedPlan(null);
      setIntakeData(null);
      setActivePlanType(null);
      
      // Trigger dashboard refresh
      refreshDashboard();
      
      console.log('✅ All programs reset complete');
    }
  };

  // Check if user should see intake form on dashboard load
  useEffect(() => {
    if (user && currentPage === 'dashboard') {
      const hasIntakeData = localStorage.getItem(`intake_data_${user.uid}`);
      const hasSkipped = localStorage.getItem(`intake_skipped_${user.uid}`);
      const hasGeneralProgram = injuryRehabService.getUserInjury(user.uid) !== null;
      
      // Only show intake form if user has no intake data, hasn't skipped, AND hasn't chosen a general program
      if (!hasIntakeData && !hasSkipped && !hasGeneralProgram) {
        // Show intake form after a short delay for better UX
        const timer = setTimeout(() => {
          setShowIntakeForm(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (hasIntakeData) {
        // Load saved intake data
        try {
          const savedData = JSON.parse(hasIntakeData);
          setIntakeData(savedData);
          const plan = PersonalizationService.generatePlan(
            user.uid,
            savedData,
            [] // Load from localStorage/backend if available
          );
          setPersonalizedPlan(plan);
        } catch (error) {
          console.error('Error loading intake data:', error);
        }
      }
    }
  }, [user, currentPage]);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Navigation with auth protection
  const navigateTo = (page: Page) => {
    // Protect dashboard - redirect to login if not authenticated
    if (page === 'dashboard' && !user) {
      setCurrentPage('login');
      setShowMobileMenu(false);
      return;
    }
    
    // Protect profile - redirect to login if not authenticated
    if (page === 'profile' && !user) {
      setCurrentPage('login');
      setShowMobileMenu(false);
      return;
    }
    
    setCurrentPage(page);
    setShowMobileMenu(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="site-header">
        <div className="nav-container">
          <a onClick={() => navigateTo('home')} className="logo">
            <img src="/logo.png" alt="RehabMotion Logo" style={{ width: '200px', height: 'auto' }} />
          </a>
          <nav className="main-nav">
            <a onClick={() => navigateTo('home')} className={currentPage === 'home' ? 'active' : ''}>Home</a>
            {user && (
              <>
                <a onClick={() => navigateTo('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>Dashboard</a>
                <a onClick={() => navigateTo('injury-selection')} className={currentPage === 'injury-selection' || currentPage === 'injury-rehab' ? 'active' : ''}>Rehab Programs</a>
              </>
            )}
            <a onClick={() => navigateTo('about')} className={currentPage === 'about' ? 'active' : ''}>About</a>
            <a onClick={() => navigateTo('help')} className={currentPage === 'help' ? 'active' : ''}>Help</a>
            
            {!user ? (
              <a onClick={() => navigateTo('login')} className="account-nav">Login / Sign Up</a>
            ) : (
              <div className="profile-dropdown">
                <button 
                  className="profile-btn" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-expanded={showProfileDropdown}
                >
                  <div className="profile-icon">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                  <span className="profile-name">{user.name}</span>
                  <svg className="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 9"></polyline>
                    <polyline points="9 6 12 9 9 12"></polyline>
                  </svg>
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown-menu show">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                      </div>
                      <div className="dropdown-user-details">
                        <h4 className="dropdown-username">{user.name}</h4>
                        <p className="dropdown-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <a onClick={() => { setCurrentPage('profile'); setShowProfileDropdown(false); }} className="dropdown-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Profile</span>
                    </a>
                    <a onClick={() => { setCurrentPage('settings'); setShowProfileDropdown(false); }} className="dropdown-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"></path>
                      </svg>
                      <span>Settings</span>
                    </a>
                    <div className="dropdown-divider"></div>
                    <a onClick={handleLogout} className="dropdown-link logout-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Logout</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </nav>
          <button 
            className={`hamburger ${showMobileMenu ? 'active' : ''}`} 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu active">
            <nav className="mobile-nav">
              {user && (
                <div className="mobile-user-profile">
                  <div className="mobile-avatar">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="mobile-username">{user.name}</h4>
                    <p className="mobile-email">{user.email}</p>
                  </div>
                </div>
              )}
              <a onClick={() => navigateTo('home')}>Home</a>
              {user && (
                <>
                  <a onClick={() => navigateTo('dashboard')}>📊 Dashboard</a>
                  <a onClick={() => navigateTo('injury-selection')}>🏥 Rehab Programs</a>
                  <a onClick={() => navigateTo('profile')}>👤 Profile</a>
                  <a onClick={() => navigateTo('settings')}>⚙️ Settings</a>
                </>
              )}
              <a onClick={() => navigateTo('about')}>ℹ️ About Us</a>
              <a onClick={() => navigateTo('help')}>❓ Help</a> 
              {!user ? (
                <a onClick={() => navigateTo('login')} className="account-nav">Login / Sign Up</a>
              ) : (
                <a onClick={handleLogout} className="logout">Logout</a>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      {currentPage === 'home' && <HomePage user={user} navigateTo={navigateTo} />}
      {currentPage === 'dashboard' && (
        <DashboardPage 
          user={user} 
          navigateTo={navigateTo}
          personalizedPlan={personalizedPlan}
          intakeData={intakeData}
          onShowIntakeForm={() => setShowIntakeForm(true)}
          refreshKey={dashboardRefreshKey}
          onRefreshDashboard={refreshDashboard}
          onResetPlan={resetAllPrograms}
          activePlanType={activePlanType}
        />
      )}
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} navigateTo={navigateTo} />}
      {currentPage === 'signup' && <SignupPage onSignup={handleSignup} navigateTo={navigateTo} />}
      {currentPage === 'profile' && user && <Profile />}
      {currentPage === 'settings' && user && <Settings />}
      {currentPage === 'help' && <Help />}
      {currentPage === 'about' && <AboutUs />}
      {currentPage === 'badges' && user && (
        <BadgesPage 
          userId={user.uid}
          onBack={() => navigateTo('dashboard')}
        />
      )}
      {currentPage === 'rehab-program' && user && (
        <InjuryRehabProgram 
          userId={user.uid}
          onBack={() => navigateTo('dashboard')}
          onProgramSelected={() => {
            // Clear personalized data when starting general program
            localStorage.removeItem(`intake_data_${user.uid}`);
            localStorage.removeItem(`intake_skipped_${user.uid}`);
            setPersonalizedPlan(null);
            setIntakeData(null);
            setActivePlanType('general');
            refreshDashboard();
            navigateTo('dashboard');
          }}
          onDashboardRefresh={refreshDashboard}
          onResetAllPrograms={resetAllPrograms}
        />
      )}
      {currentPage === 'injury-selection' && user && (
        <InjurySelection 
          onSelectInjury={(injuryType: InjuryType) => {
            // Clear personalized data when starting general program
            localStorage.removeItem(`intake_data_${user.uid}`);
            localStorage.removeItem(`intake_skipped_${user.uid}`);
            setPersonalizedPlan(null);
            setIntakeData(null);
            injuryRehabService.setUserInjury(user.uid, injuryType);
            setActivePlanType('general'); // User chose general program
            navigateTo('injury-rehab');
          }}
          onBack={() => navigateTo('dashboard')}
        />
      )}
      {currentPage === 'injury-rehab' && user && (
        <InjuryRehabProgram 
          userId={user.uid}
          onBack={() => navigateTo('dashboard')}
          onDashboardRefresh={refreshDashboard}
          onResetAllPrograms={resetAllPrograms}
        />
      )}
      {currentPage === 'debug' && <PoseTestPage />}

      {/* Intake Form Modal */}
      {showIntakeForm && user && (
        <SmartIntakeForm
          userId={user.uid}
          onComplete={handleIntakeComplete}
          onSkip={handleIntakeSkip}
          existingData={intakeData}
        />
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-logo-bg">
              <img src="/logo.png" alt="RehabMotion Logo" style={{ width: '180px', height: 'auto', objectFit: 'contain' }} />
            </div>
            <p>Your comprehensive partner in recovery and rehabilitation. Providing guided exercises, progress tracking, and professional support for knee and ankle rehabilitation.</p>
          </div>
          <div className="footer-info">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong><br />
              <a href="mailto:23029762@imail.sunway.edu.my">23029762@imail.sunway.edu.my</a><br />
            </p>
            <p><strong>Phone:</strong><br />
              <a href="tel:+60122163450">+6012-2163450</a><br />
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a onClick={() => navigateTo('home')}>Home</a>
            {user && (
                <>
                  <a onClick={() => navigateTo('dashboard')}>Dashboard</a>
                  <a onClick={() => navigateTo('injury-selection')}>Rehab Programs</a>
                  <a onClick={() => navigateTo('profile')}>Profile</a>
                  <a onClick={() => navigateTo('settings')}>Settings</a>
                </>
              )}
              <a onClick={() => navigateTo('about')}>About Us</a>
              <a onClick={() => navigateTo('help')}>Help</a> 
              {!user ? (
                <a onClick={() => navigateTo('login')} className="account-nav">Login / Sign Up</a>
              ) : (
                <a onClick={handleLogout} className="logout">Logout</a>
              )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 RehabMotion - Interactive Injury Recovery. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Home Page Component
interface HomePageProps {
  user: User | null;
  navigateTo: (page: Page) => void;
}

function HomePage({ user, navigateTo }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonials = [
    {
      name: "Sarah K.",
      role: "ACL Recovery Patient",
      image: "https://images.unsplash.com/photo-1494790108755-2616b9d59278?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80",
      quote: "This platform made my knee recovery so much easier! The guided exercises were perfect for my fitness level.",
      rating: 5
    },
    {
      name: "Mike L.",
      role: "Ankle Sprain Recovery",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80",
      quote: "I loved tracking my progress and seeing real results. The charts kept me motivated throughout my ankle rehabilitation.",
      rating: 5
    },
    {
      name: "Priya S.",
      role: "MCL Tear Recovery",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80",
      quote: "The community support kept me motivated every day. Sharing my journey with others who understood made all the difference.",
      rating: 5
    },
    {
      name: "James T.",
      role: "Meniscus Tear Recovery",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80",
      quote: "The live form tracking helped me perfect my technique and prevented re-injury. Incredible technology!",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section-modern">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Your Journey to
              <span className="gradient-text"> Full Recovery</span>
            </h1>
            <p className="hero-subtitle">
              Evidence-based rehabilitation programs powered by new technology for knee and ankle injuries
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-numbers">10K+</div>
                <div className="stat-label">Successful Recoveries</div>
              </div>
              <div className="stat-item">
                <div className="stat-numbers">95%</div>
                <div className="stat-label">Recovery Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-numbers">24/7</div>
                <div className="stat-label">Support Available</div>
              </div>
            </div>
            <div className="hero-cta">
              <a 
                onClick={() => user ? navigateTo('dashboard') : navigateTo('login')} 
                className="btn-primary-modern"
                style={{ cursor: 'pointer' }}
              >
                Start Your Recovery
                <span className="btn-arrow">→</span>
              </a>
              <a href="#how-it-works" className="btn-secondary-modern">
                How It Works
              </a>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="card-icon">✅</div>
              <div className="card-text">Personalized or General Rehab Plans</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🎥</div>
              <div className="card-text">Video Demonstrations and Live Form Tracking</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">📊</div>
              <div className="card-text">Progress Tracking</div>
            </div>
          </div>
        </div>
      </div>

      <main className="modern-main">
        {/* Features Section */}
        <section className="features-modern" id="features">
          <div className="section-header">
            <h2 className="section-title">Why Choose RehabMotion?</h2>
            <p className="section-subtitle">Everything you need for a successful recovery journey</p>
          </div>
          <div className="features-grid">
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🤖</div>
              </div>
              <h3>Live Form Tracking</h3>
              <p>Real-time exercise form analysis using computer vision to ensure safe and effective rehabilitation</p>
              <div className="feature-badge">New</div>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">👨‍⚕️</div>
              </div>
              <h3>Expert-Designed Programs</h3>
              <p>Created by certified physical therapists and medical professionals with years of experience</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📈</div>
              </div>
              <h3>Smart Progress Tracking</h3>
              <p>Visualize your recovery with interactive charts, pain tracking, and milestone achievements</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🎯</div>
              </div>
              <h3>Personalized Plans</h3>
              <p>Adaptive programs that adjust based on your pain levels, fitness, and recovery progress</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🎥</div>
              </div>
              <h3>Video Demonstrations</h3>
              <p>High-quality exercise videos with step-by-step instructions for every movement</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🏆</div>
              </div>
              <h3>Achievement Badges</h3>
              <p>Stay motivated with rewards for consistency, milestones, and recovery progress</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works" id="how-it-works">
          <div className="section-header">
            <h2 className="section-title">Your Recovery Journey</h2>
            <p className="section-subtitle">Four simple steps to start your rehabilitation</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Sign up and tell us about your injury, fitness level, and recovery goals</p>
              </div>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Get Your Plan</h3>
                <p>Receive a personalized or general rehab program tailored to your specific needs</p>
              </div>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Start Exercising</h3>
                <p>Follow guided exercises with video demos and live form tracking</p>
              </div>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Track Progress</h3>
                <p>Monitor your recovery with detailed analytics and celebrate milestones</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-modern">
          <div className="section-header">
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">Join thousands who have recovered successfully</p>
          </div>
          <div className="testimonial-slider">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`testimonial-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ display: index === currentSlide ? 'flex' : 'none' }}
              >
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p className="testimonial-quote">{testimonial.quote}</p>
                  <div className="testimonial-rating">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                  <div className="testimonial-author">
                    <img src={testimonial.image} alt={testimonial.name} className="author-avatar" />
                    <div className="author-info">
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Start Your Recovery?</h2>
            <p>Join thousands of users who have successfully recovered with RehabMotion</p>
            <a 
              onClick={() => user ? navigateTo('dashboard') : navigateTo('login')} 
              className="btn-cta"
              style={{ cursor: 'pointer' }}
            >
              Get Started
              <span className="btn-arrow">→</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

// Dashboard Page Component
function DashboardPage({ 
  user, 
  navigateTo, 
  personalizedPlan,
  intakeData,
  onShowIntakeForm,
  refreshKey,
  onRefreshDashboard,
  onResetPlan,
  activePlanType
}: { 
  user: User | null; 
  navigateTo: (page: Page) => void;
  personalizedPlan: PersonalizedPlan | null;
  intakeData: any;
  onShowIntakeForm: () => void;
  refreshKey: number;
  onRefreshDashboard: () => void;
  onResetPlan: () => void;
  activePlanType: 'personalized' | 'general' | null;
}) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoadingDashboard(true);
      setDashboardError(null);
      
      // Import and load dashboard data from cloud
      import('./services/cloudDataService').then(({ cloudDashboardService, migrateToCloud }) => {
        console.log('📊 Loading dashboard for user:', user.uid);
        
        // First, migrate any existing localStorage data to cloud (runs once)
        return migrateToCloud(user.uid).then(() => {
          console.log('🔄 Migration complete, loading data...');
          // Then load data from cloud
          return cloudDashboardService.getDashboardData(user.uid);
        });
      }).then(data => {
        console.log('✅ Dashboard data loaded:', data);
        setDashboardData(data);
        setIsLoadingDashboard(false);
      }).catch(error => {
        console.error('❌ Error loading dashboard data:', error);
        setDashboardError(error.message);
        
        // Fallback to localStorage if cloud fails
        console.log('⚠️ Falling back to localStorage...');
        import('./services/dataService').then(({ dashboardService }) => {
          const localData = dashboardService.getDashboardData(user.uid);
          console.log('📦 Loaded from localStorage:', localData);
          setDashboardData(localData);
          setIsLoadingDashboard(false);
        }).catch(fallbackError => {
          console.error('❌ Fallback also failed:', fallbackError);
          setIsLoadingDashboard(false);
        });
      });
    }
  }, [user, refreshKey]); // Re-run when refreshKey changes

  if (!user) {
    return (
      <div className="login-container">
        <h2>🔒 Access Restricted</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You need to be logged in to access the dashboard.
        </p>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Please <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>log in</a> to continue.
        </p>
      </div>
    );
  }

  if (isLoadingDashboard) {
    return (
      <div className="dashboard-fullscreen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="dashboard-fullscreen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ marginBottom: '1rem' }}>Error Loading Dashboard</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{dashboardError}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              background: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-fullscreen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ color: 'var(--text-secondary)' }}>No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <main className="dashboard-fullscreen">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="welcome-message">👋 Welcome back, {user?.name || 'User'}!</h1>
          <p>Your rehabilitation journey continues - here's your progress and activities</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card-hero">
            <div className="stat-number">{dashboardData.stats.progressPercentage}%</div>
            <div className="stat-label">Progress</div>
          </div>
          <div className="stat-card-hero">
            <div className="stat-number">{dashboardData.stats.daysActive}</div>
            <div className="stat-label">Days Active</div>
          </div>
          <div className="stat-card-hero">
            <div className="stat-number">{dashboardData.stats.exercisesCompleted}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>🚀 Quick Actions</h2>
            <div className="action-cards">
              {dashboardData.quickActions.map((action: any) => (
                <a 
                  key={action.id}
                  href="#" 
                  className="action-card" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (action.link !== '#') navigateTo(action.link as Page);
                  }}
                >
                  <div className="action-icon">{action.icon}</div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="dashboard-section">
            <h2>📊 Progress Overview</h2>
            <div className="progress-widget">
              <div className="progress-chart">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Progress Chart" 
                  className="chart-img" 
                />
              </div>
              <div className="progress-details">
                <h3>{dashboardData.programProgress.programName}</h3>
                <div className="progress-bar-full">
                  <div className="progress-fill" style={{ width: `${dashboardData.programProgress.progressPercentage}%` }}></div>
                </div>
                <p>Week {dashboardData.programProgress.currentWeek} of {dashboardData.programProgress.totalWeeks} - {dashboardData.programProgress.description}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity - Moved to top row */}
          <div className="dashboard-section">
            <h2>🏃‍♀️ Recent Activity</h2>
            <div className="activity-list">
              {dashboardData.activities.length > 0 ? (
                dashboardData.activities.map((activity: any) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>{activity.icon}</div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  No recent activities. Start exercising to see your progress here!
                </p>
              )}
            </div>
          </div>

          {/* Personalized Weekly Plan - Full width below */}
          <div className="dashboard-section" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '10px' }}>
              <h2>{activePlanType === 'general' ? '🦵 Your Rehab Program' : '🎯 Your Personalized Plan'}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {personalizedPlan && (
                  <button 
                    onClick={onResetPlan}
                    style={{
                      padding: '10px 20px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                    title="Reset your personalized plan (for testing)"
                  >
                    🗑️ Reset Plan
                  </button>
                )}
              </div>
            </div>
            
            {/* Show Personalized Plan if user has one */}
            {activePlanType === 'personalized' && personalizedPlan && intakeData ? (
              <PersonalizedPlanView
                userId={user?.uid || 'demo-user'}
                injuryData={{
                  type: intakeData.injuryType,
                  date: intakeData.injuryDate,
                  painLevel: intakeData.currentPainLevel,
                  fitnessLevel: intakeData.fitnessLevel,
                  age: intakeData.age,
                  goals: intakeData.goals,
                  limitations: intakeData.limitations,
                  sessionDuration: intakeData.preferredSessionDuration,
                  availableDays: intakeData.availableDays
                }}
                sessionHistory={[]}
                onDashboardRefresh={onRefreshDashboard}
              />
            ) : activePlanType === 'general' && user ? (
              /* Show General Rehab Program if user has one */
              <div style={{ marginTop: '20px' }}>
                <InjuryRehabProgram 
                  userId={user.uid}
                  onBack={() => {}}
                  onDashboardRefresh={onRefreshDashboard}
                  onResetAllPrograms={onResetPlan}
                />
              </div>
            ) : (
              /* Show options if no plan is selected */
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
                <h3 style={{ marginBottom: '10px', color: '#333' }}>Get Your Rehab Plan</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Choose a personalized plan tailored to your needs, or select a general rehabilitation program.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={onShowIntakeForm}
                    style={{
                      padding: '14px 28px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    ✨ Personalized Plan
                  </button>
                  <button
                    onClick={() => navigateTo('rehab-program')}
                    style={{
                      padding: '14px 28px',
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    🦵 General Program
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Login Page Component
function LoginPage({ onLogin, navigateTo }: { onLogin: (email: string, password: string) => void; navigateTo: (page: Page) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleForgotPassword = async () => {
    setResetMessage(null);
    setResetError(null);
    if (!email) {
      setResetError('Please enter your email address above first.');
      return;
    }
    setResetting(true);
    const result = await authService.resetPassword(email);
    setResetting(false);
    if (result.success) {
      setResetMessage('Password reset email sent! Please check your inbox and spam folder.');
    } else {
      setResetError(result.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="login-container">
      <h2>👋 Welcome Back</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Sign in to continue your recovery journey
      </p>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Sign In</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button type="button" onClick={handleForgotPassword} style={{ color: 'var(--primary-color)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }} disabled={resetting}>
          {resetting ? 'Sending...' : 'Forgot your password?'}
        </button>
      </p>
      {resetMessage && <p style={{ color: 'green', textAlign: 'center', marginTop: '0.5rem' }}>{resetMessage}</p>}
      {resetError && <p style={{ color: 'red', textAlign: 'center', marginTop: '0.5rem' }}>{resetError}</p>}
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <a onClick={() => navigateTo('signup')} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Sign Up
        </a>
      </p>
    </div>
  );
}

// Signup Page Component
function SignupPage({ onSignup, navigateTo }: { onSignup: (firstName: string, lastName: string, email: string, password: string) => void; navigateTo: (page: Page) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onSignup(firstName, lastName, email, password);
  };

  return (
    <div className="signup-container">
      <h2>🚀 Create Your Account</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Join thousands on their recovery journey
      </p>
      <form onSubmit={handleSubmit}>
        <div className="name-row">
          <input 
            type="text" 
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required 
          />
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required 
          />
        </div>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
        />
        <button type="submit">Create Account</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <a onClick={() => navigateTo('login')} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Sign In
        </a>
      </p>
    </div>
  );
}

// Profile Page Component (currently unused - using Profile component from pages/Profile.tsx instead)
/*
function ProfilePage({ user, onProfilePictureUpload }: { user: User | null; onProfilePictureUpload: (file: File) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await onProfilePictureUpload(file);
      alert('Profile picture updated successfully!');
    } catch (error) {
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <h2>⚠️ Not Logged In</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You need to be logged in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>👤 My Profile</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          position: 'relative', 
          width: '150px', 
          height: '150px', 
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid var(--primary-color)',
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
        }}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            opacity: uploading ? 0.6 : 1
          }}
        >
          {uploading ? '⏳ Uploading...' : '📷 Change Profile Picture'}
        </button>
        
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Max file size: 5MB. Supported formats: JPG, PNG, GIF
        </p>
      </div>
      
      <div style={{ 
        background: 'var(--card-bg)', 
        padding: '2rem', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Account Information</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Full Name
          </label>
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'var(--bg-secondary)', 
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}>
            {user.name}
          </div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Email Address
          </label>
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'var(--bg-secondary)', 
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}>
            {user.email}
          </div>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            User ID
          </label>
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'var(--bg-secondary)', 
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}>
            {user.uid}
          </div>
        </div>
      </div>
    </div>
  );
}
*/

export default App
