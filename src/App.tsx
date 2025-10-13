import { useState, useEffect, useRef } from 'react'
import './App.css'
import { authService } from './firebase/auth'
import { type User as FirebaseUser } from 'firebase/auth'
import RehabExercise from './pages/RehabExercise'
import DebugPage from './pages/Debug'

// Types
interface User {
  name: string;
  firstName: string;
  email: string;
  photoURL: string | null;
  uid: string;
}

type Page = 'home' | 'dashboard' | 'login' | 'signup' | 'profile' | 'exercises' | 'debug';

// Helper function to extract first name
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

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
            <img src="/logo.png" alt="Rehab Hub Logo" style={{ width: '150px', height: '110px' }} />
          </a>
          <nav className="main-nav">
            <a onClick={() => navigateTo('home')} className={currentPage === 'home' ? 'active' : ''}>Home</a>
            {user && (
              <>
                <a onClick={() => navigateTo('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>Dashboard</a>
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
                <img src="/logo.png" alt="Rehab Hub Logo" style={{ width: '100px', height: '100px' }} />
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
      {currentPage === 'dashboard' && <DashboardPage user={user} />}
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} navigateTo={navigateTo} />}
      {currentPage === 'signup' && <SignupPage onSignup={handleSignup} navigateTo={navigateTo} />}
      {currentPage === 'profile' && <ProfilePage user={user} onProfilePictureUpload={handleProfilePictureUpload} />}
      {currentPage === 'exercises' && <RehabExercise />}
      {currentPage === 'debug' && <DebugPage />}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/logo.png" alt="Rehab Hub Logo" style={{ width: '160px', height: '160px', marginBottom: '15px' }} />
            <p>Your comprehensive partner in recovery and rehabilitation. Providing guided exercises, progress tracking, and professional support for knee and ankle rehabilitation.</p>
          </div>
          <div className="footer-contact">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong><br />
              <a href="mailto:support@rehabhub.com">support@rehabhub.com</a><br />
              <a href="mailto:help@rehabhub.com">help@rehabhub.com</a>
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
          <p>&copy; 2025 Rehab Hub - Capstone Project. All Rights Reserved.</p>
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
          <h1>Welcome to Knee and Ankle Rehab Hub</h1>
          <p>Your comprehensive platform for guided rehabilitation and recovery tracking</p>
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
function DashboardPage({ user }: { user: User | null }) {
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

  return (
    <main className="dashboard-fullscreen">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="welcome-message">👋 Welcome back, {user?.name || 'User'}!</h1>
          <p>Your rehabilitation journey continues - here's your progress and activities</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card-hero">
            <div className="stat-number">75%</div>
            <div className="stat-label">Progress</div>
          </div>
          <div className="stat-card-hero">
            <div className="stat-number">12</div>
            <div className="stat-label">Days Active</div>
          </div>
          <div className="stat-card-hero">
            <div className="stat-number">8</div>
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
              <a href="#" className="action-card">
                <div className="action-icon">🦵</div>
                <h3>Knee Rehabilitation</h3>
                <p>Continue your knee recovery program</p>
              </a>
              <a href="#" className="action-card">
                <div className="action-icon">🦶</div>
                <h3>Ankle Rehabilitation</h3>
                <p>Start your ankle strengthening exercises</p>
              </a>
              <a href="#" className="action-card">
                <div className="action-icon">📅</div>
                <h3>Book Appointment</h3>
                <p>Schedule with your therapist</p>
              </a>
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

          {/* Recent Activity */}
          <div className="dashboard-section">
            <h2>�‍♀️ Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon completed">✅</div>
                <div className="activity-content">
                  <h4>Completed "Quad Sets" exercise</h4>
                  <p>2 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon logged">📝</div>
                <div className="activity-content">
                  <h4>Logged pain level: 2/10</h4>
                  <p>3 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon checkin">⏰</div>
                <div className="activity-content">
                  <h4>Morning check-in completed</h4>
                  <p>This morning at 10:00 AM</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon goal">🎯</div>
                <div className="activity-content">
                  <h4>Achieved daily movement goal</h4>
                  <p>Yesterday</p>
                </div>
              </div>
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
