import { useState, useEffect, useRef } from 'react'
import './App.css'
import { authService } from './firebase/auth'
import { type User as FirebaseUser } from 'firebase/auth'
import RehabExercise from './pages/RehabExercise'
import RehabProgram from './pages/RehabProgram'
import PoseTestPage from './pages/PoseTest'
import InjurySelection from './pages/InjurySelection'
import InjuryRehabProgram from './pages/InjuryRehabProgram'
import { injuryRehabService } from './services/dataService'
import { type InjuryType } from './types/injuries'
import PersonalizedPlanView from './components/PersonalizedPlanView'
import SmartIntakeForm from './components/SmartIntakeForm'
import { PersonalizationService } from './services/personalizationService'
import type { PersonalizedPlan } from './types/personalization'

// Types
interface User {
  name: string;
  firstName: string;
  email: string;
  photoURL: string | null;
  uid: string;
}

type Page = 'home' | 'dashboard' | 'login' | 'signup' | 'profile' | 'exercises' | 'debug' | 'rehab-program' | 'injury-selection' | 'injury-rehab';

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
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null);
  const [hasCompletedIntake, setHasCompletedIntake] = useState(false);
  const [intakeData, setIntakeData] = useState<any>(null);

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
      if (firebaseUser) {
        const fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        setUser({
          name: fullName,
          firstName: getFirstName(fullName),
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    authService.addAuthStateListener(handleAuthStateChange);

    // Initial check
    const currentUser = authService.getCurrentUser();
    handleAuthStateChange(currentUser);

    return () => {
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

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

  const handleProfilePictureUpload = async (file: File) => {
    const photoURL = await authService.uploadProfilePicture(file);
    if (photoURL && user) {
      setUser({ ...user, photoURL });
    }
  };

  // Handle intake form completion
  const handleIntakeComplete = (data: any) => {
    console.log('📝 Intake data received:', data);
    
    // Save to localStorage
    localStorage.setItem(`intake_data_${user?.uid}`, JSON.stringify(data));
    setHasCompletedIntake(true);
    setIntakeData(data);
    
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

  // Check if user should see intake form on dashboard load
  useEffect(() => {
    if (user && currentPage === 'dashboard') {
      const hasIntakeData = localStorage.getItem(`intake_data_${user.uid}`);
      const hasSkipped = localStorage.getItem(`intake_skipped_${user.uid}`);
      
      if (!hasIntakeData && !hasSkipped) {
        // Show intake form after a short delay for better UX
        const timer = setTimeout(() => {
          setShowIntakeForm(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (hasIntakeData) {
        setHasCompletedIntake(true);
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
                <a onClick={() => navigateTo('exercises')} className={currentPage === 'exercises' ? 'active' : ''}>Exercises</a>
              </>
            )}
            
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
                    <a onClick={() => navigateTo('dashboard')} className="dropdown-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <span>Dashboard</span>
                    </a>
                    <a onClick={() => { setCurrentPage('profile'); setShowProfileDropdown(false); }} className="dropdown-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Profile</span>
                    </a>
                    <a onClick={() => { /* Handle settings */ }} className="dropdown-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"></path>
                      </svg>
                      <span>Settings</span>
                    </a>
                    <a onClick={() => { /* Handle help */ }} className="dropdown-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <span>Help</span>
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
            <div className="mobile-menu-header">
              <a onClick={() => navigateTo('home')} className="logo">
                <img src="/logo.png" alt="RehabMotion Logo" style={{ width: '150px', height: 'auto' }} />
              </a>
              <button className="close-menu" onClick={() => setShowMobileMenu(false)}>&times;</button>
            </div>
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
                <a onClick={() => navigateTo('dashboard')}>Dashboard</a>
              )}
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
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'dashboard' && (
        <DashboardPage 
          user={user} 
          navigateTo={navigateTo}
          personalizedPlan={personalizedPlan}
          intakeData={intakeData}
          onShowIntakeForm={() => setShowIntakeForm(true)}
        />
      )}
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} navigateTo={navigateTo} />}
      {currentPage === 'signup' && <SignupPage onSignup={handleSignup} navigateTo={navigateTo} />}
      {currentPage === 'profile' && <ProfilePage user={user} onProfilePictureUpload={handleProfilePictureUpload} />}
      {currentPage === 'exercises' && <RehabExercise />}
      {currentPage === 'rehab-program' && <RehabProgram user={user} />}
      {currentPage === 'injury-selection' && user && (
        <InjurySelection 
          onSelectInjury={(injuryType: InjuryType) => {
            injuryRehabService.setUserInjury(user.uid, injuryType);
            navigateTo('injury-rehab');
          }}
          onBack={() => navigateTo('dashboard')}
        />
      )}
      {currentPage === 'injury-rehab' && user && (
        <InjuryRehabProgram 
          userId={user.uid}
          onBack={() => navigateTo('dashboard')}
        />
      )}
      {currentPage === 'debug' && <PoseTestPage />}

      {/* Intake Form Modal */}
      {showIntakeForm && user && (
        <SmartIntakeForm
          userId={user.uid}
          onComplete={handleIntakeComplete}
          onSkip={handleIntakeSkip}
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
              <a href="mailto:support@rehabmotion.com">support@rehabmotion.com</a><br />
              <a href="mailto:help@rehabmotion.com">help@rehabmotion.com</a>
            </p>
            <p><strong>Phone:</strong><br />
              <a href="tel:+1234567890">+1 (234) 567-890</a><br />
              <a href="tel:+1234567891">+1 (234) 567-891</a>
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a onClick={() => navigateTo('home')}>Home</a>
            <a onClick={() => navigateTo('signup')}>Sign Up</a>
            <a onClick={() => navigateTo('login')}>Login</a>
            <a onClick={() => navigateTo('dashboard')}>Dashboard</a>
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
function HomePage() {
  return (
    <>
      <div className="hero-header">
        <div className="container">
          <h1>Welcome to RehabMotion</h1>
          <p>Interactive injury recovery for knee and ankle rehabilitation</p>
        </div>
      </div>

      <main>
        <section className="intro">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Physical therapy session" className="intro-img" />
          <div>
            <h2>🎯 Guided Rehabilitation</h2>
            <p>Personalized programs for knee and ankle recovery, designed by certified physical therapists and medical professionals.</p>
            <h2>📊 Track Your Progress</h2>
            <p>Visualize your recovery journey with interactive charts, milestone tracking, and detailed analytics.</p>
          </div>
        </section>

        <section className="features">
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80" alt="Guided Rehab" />
            <h3>🏥 Expert-Guided Rehab</h3>
            <p>Step-by-step exercise plans tailored to your specific condition and recovery needs, created by licensed professionals.</p>
          </div>
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80" alt="Progress Tracking" />
            <h3>📈 Smart Progress Tracking</h3>
            <p>Monitor your improvements with easy-to-read graphs, pain level tracking, and milestone achievements.</p>
          </div>
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80" alt="Community Support" />
            <h3>🤝 Community Support</h3>
            <p>Connect with others on a similar recovery journey, share experiences, and get motivated by success stories.</p>
          </div>
        </section>

        <section className="testimonials">
          <h2>💬 What Our Users Say</h2>
          <div className="testimonial-list">
            <div className="testimonial">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b9d59278?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80" alt="Sarah K." className="avatar" />
              <blockquote>"This platform made my knee recovery so much easier! The guided exercises were perfect for my fitness level."</blockquote>
              <cite>- Sarah K., Knee Recovery Patient</cite>
            </div>
            <div className="testimonial">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80" alt="Mike L." className="avatar" />
              <blockquote>"I loved tracking my progress and seeing real results. The charts kept me motivated throughout my ankle rehabilitation."</blockquote>
              <cite>- Mike L., Ankle Recovery Patient</cite>
            </div>
            <div className="testimonial">
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80" alt="Priya S." className="avatar" />
              <blockquote>"The community support kept me motivated every day. Sharing my journey with others who understood made all the difference."</blockquote>
              <cite>- Priya S., Recovery Advocate</cite>
            </div>
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
  onShowIntakeForm 
}: { 
  user: User | null; 
  navigateTo: (page: Page) => void;
  personalizedPlan: PersonalizedPlan | null;
  intakeData: any;
  onShowIntakeForm: () => void;
}) {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Import and load dashboard data
      import('./services/dataService').then(({ dashboardService }) => {
        const data = dashboardService.getDashboardData(user.uid);
        setDashboardData(data);
      });
    }
  }, [user]);

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

  if (!dashboardData) {
    return <div className="dashboard-fullscreen"><p>Loading...</p></div>;
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
            <h2>� Progress Overview</h2>
            <div className="progress-widget">
              <div className="progress-chart">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Progress Chart" 
                  className="chart-img" 
                />
              </div>
              <div className="progress-details">
                <h3>Knee Rehabilitation Program</h3>
                <div className="progress-bar-full">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <p>Week 3 of 8 - You're doing great! Keep up the excellent work.</p>
              </div>
            </div>
          </div>

          {/* Personalized Weekly Plan */}
          <div className="dashboard-section" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>🎯 Your Personalized Plan</h2>
              <button 
                onClick={onShowIntakeForm}
                style={{
                  padding: '10px 20px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {personalizedPlan ? '⚙️ Update Plan' : '✨ Create Personalized Plan'}
              </button>
            </div>
            
            {personalizedPlan && intakeData ? (
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
                onStartExercise={(exerciseId) => {
                  console.log('Starting exercise:', exerciseId);
                  navigateTo('exercises');
                }}
              />
            ) : (
              <div style={{
                padding: '40px',
                background: '#f8f9fa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
                <h3 style={{ marginBottom: '10px', color: '#333' }}>Get Your Personalized Rehab Plan</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Answer a few quick questions to receive a customized rehabilitation program
                  tailored to your injury, fitness level, and goals.
                </p>
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
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
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
      setResetMessage('Password reset email sent! Please check your inbox.');
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

// Profile Page Component
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

export default App
