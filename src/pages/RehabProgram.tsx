import { useState, useEffect } from 'react';
import '../styles/RehabProgram.css';
import { exerciseService } from '../services/dataService';

type RehabType = 'knee' | 'ankle' | null;

interface User {
  name: string;
  firstName: string;
  email: string;
  photoURL: string | null;
  uid: string;
}

export interface Exercise {
  id: string;
  name: string;
  phase: number;
  sets: number;
  reps: number;
  hold?: string;
  description: string;
  image: string;
  videoUrl?: string;
  completed: boolean;
}

export default function RehabProgram({ user }: { user: User | null }) {
  const [selectedProgram, setSelectedProgram] = useState<RehabType>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // Load exercises when program is selected
  useEffect(() => {
    if (user && selectedProgram) {
      const loadedExercises = exerciseService.getExercises(user.uid, selectedProgram);
      setExercises(loadedExercises);
    }
  }, [user, selectedProgram]);

  // Toggle exercise completion
  const toggleExercise = (exerciseId: string) => {
    if (user && selectedProgram) {
      exerciseService.toggleExerciseCompletion(user.uid, selectedProgram, exerciseId);
      // Reload exercises to get updated state
      const updated = exerciseService.getExercises(user.uid, selectedProgram);
      setExercises(updated);
    }
  };

  // Mock user data - now using real user if available
  const userData = {
    name: user?.firstName || 'User',
    weekInProgram: 5,
    totalWeeks: 12,
    completedExercises: exercises.filter(ex => ex.completed).length,
    totalExercises: exercises.length,
    painLevel: 3,
    lastPainUpdate: '14 days'
  };

  const displayedExercises = exercises.slice(0, 4); // Show first 4

  const phases = [
    {
      phase: 1,
      title: 'Phase 1: Protection',
      subtitle: 'Weeks 1-2',
      description: 'Initial healing, gentle range of motion exercises, and protecting the area from further injury.',
      status: 'Completed' as const
    },
    {
      phase: 2,
      title: 'Phase 2: Motion',
      subtitle: 'Weeks 3-4',
      description: 'Improve range of motion, begin light strengthening exercises, and reduce dependence on assistive devices.',
      status: 'Completed' as const
    },
    {
      phase: 3,
      title: 'Phase 3: Strength',
      subtitle: 'Weeks 5-8',
      description: 'Progressive strengthening exercises, improved balance and coordination, and functional movement patterns.',
      status: 'In Progress' as const
    },
    {
      phase: 4,
      title: 'Phase 4: Return to Activity',
      subtitle: 'Weeks 9-12',
      description: 'Sport-specific training, advanced strengthening, and gradual return to normal or sport activities.',
      status: 'Upcoming' as const
    }
  ];

  const stretchingExercises = [
    {
      name: 'Seated Hamstring Stretch',
      duration: '30 seconds',
      reps: 3,
      image: '🧘'
    },
    {
      name: 'Standing Quad Stretch',
      duration: '20-30 seconds',
      reps: 3,
      image: '🧍'
    },
    {
      name: 'Figure Four Stretch',
      duration: '20 seconds',
      reps: 3,
      image: '🤸'
    },
    {
      name: 'IT Band Rolling',
      duration: '1-2 minutes',
      reps: 1,
      image: '🎯'
    }
  ];

  if (!selectedProgram) {
    return (
      <div className="rehab-program-container">
        <div className="program-selection">
          <h1>Select Your Rehabilitation Program</h1>
          <p className="subtitle">Choose the program that matches your recovery needs</p>
          
          <div className="program-cards">
            <div 
              className="program-card knee-card"
              onClick={() => setSelectedProgram('knee')}
            >
              <div className="card-icon">🦵</div>
              <h2>Knee Rehabilitation Program</h2>
              <p>Comprehensive recovery plan for knee injuries and post-surgery rehabilitation</p>
              <ul>
                <li>12-week structured program</li>
                <li>Progressive exercise phases</li>
                <li>Video demonstrations</li>
                <li>Progress tracking</li>
              </ul>
              <button className="select-btn">Start Knee Program →</button>
            </div>

            <div 
              className="program-card ankle-card"
              onClick={() => setSelectedProgram('ankle')}
            >
              <div className="card-icon">🦶</div>
              <h2>Ankle Rehabilitation Program</h2>
              <p>Comprehensive recovery plan for ankle sprains and post-surgery rehabilitation</p>
              <ul>
                <li>12-week structured program</li>
                <li>Balance & stability focus</li>
                <li>Proprioception training</li>
                <li>Return to sport prep</li>
              </ul>
              <button className="select-btn">Start Ankle Program →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rehab-program-container">
      {/* Header */}
      <div className="program-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => setSelectedProgram(null)}>
            ← Back to Programs
          </button>
          <h1>{selectedProgram === 'knee' ? 'Knee' : 'Ankle'} Rehabilitation Program</h1>
          <p>Comprehensive recovery plan for {selectedProgram} injuries and post-surgery rehabilitation</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="avatar">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="user-name">{userData.name}</div>
              <button className="sign-out-btn">Sign out</button>
            </div>
          </div>
          <button className="schedule-btn">Schedule Session</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Recovery Timeline</div>
            <div className="stat-value">Estimated {userData.totalWeeks} weeks</div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(userData.weekInProgram / userData.totalWeeks) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round((userData.weekInProgram / userData.totalWeeks) * 100)}%</span>
            </div>
            <div className="stat-note">You're in week {userData.weekInProgram} of your recovery program. Keep up the good work!</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <div className="stat-label">Today's Exercises</div>
            <div className="stat-value">{userData.completedExercises}/{userData.totalExercises}</div>
            <div className="stat-note">Complete today's exercises to stay on track with your recovery plan.</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Pain Level Trend</div>
            <div className="stat-value">Last {userData.lastPainUpdate} days</div>
            <div className="pain-trend">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '50%' }}></div>
                <div className="chart-bar" style={{ height: '45%' }}></div>
                <div className="chart-bar" style={{ height: '35%' }}></div>
                <div className="chart-bar" style={{ height: '30%' }}></div>
                <div className="chart-bar" style={{ height: '25%' }}></div>
                <div className="chart-bar" style={{ height: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Column - Exercises */}
        <div className="left-column">
          <div className="section-card exercises-section">
            <div className="section-header">
              <h2>Recommended Exercises</h2>
              <p className="section-subtitle">Tailored exercises for your current recovery phase</p>
            </div>

            <div className="exercises-list">
              {displayedExercises.map((exercise) => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-image">
                    <span className="exercise-emoji">{exercise.image}</span>
                  </div>
                  <div className="exercise-content">
                    <div className="exercise-header">
                      <h3>{exercise.name}</h3>
                      <span className="phase-badge">Phase {exercise.phase}</span>
                    </div>
                    <p className="exercise-description">{exercise.description}</p>
                    <div className="exercise-details">
                      <span className="detail-item">
                        <span className="detail-icon">🔄</span>
                        {exercise.sets} sets of {exercise.reps} reps
                      </span>
                      <span className="detail-item">
                        <span className="detail-icon">⏱️</span>
                        {exercise.hold}
                      </span>
                    </div>
                    <div className="exercise-actions">
                      <button className="action-btn primary-btn">Watch Video</button>
                      <button 
                        className={`action-btn ${exercise.completed ? 'completed-btn' : 'secondary-btn'}`}
                        onClick={() => toggleExercise(exercise.id)}
                      >
                        {exercise.completed ? '✓ Completed' : 'Mark as Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="view-all-section">
              <p>Showing 4 of {exercises.length} exercises for your current phase</p>
              <button className="view-all-btn">View All Exercises</button>
            </div>
          </div>

          {/* Stretching Techniques */}
          <div className="section-card stretching-section">
            <h2>Stretching Techniques</h2>
            <p className="section-subtitle">Essential stretches to improve flexibility and reduce stiffness</p>
            
            <div className="stretching-grid">
              {stretchingExercises.map((stretch, index) => (
                <div key={index} className="stretch-card">
                  <div className="stretch-icon">{stretch.image}</div>
                  <h4>{stretch.name}</h4>
                  <p>Hold for {stretch.duration}, {stretch.reps} repetitions per leg</p>
                  <button className="stretch-demo-btn">Watch Demo</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Resources & Timeline */}
        <div className="right-column">
          {/* Recovery Resources */}
          <div className="section-card resources-section">
            <h3>Recovery Resources</h3>
            
            <div className="resources-group">
              <h4>Downloadable Guides</h4>
              <a href="#" className="resource-link">
                <span className="resource-icon">📄</span>
                <span>Complete {selectedProgram === 'knee' ? 'Knee' : 'Ankle'} Rehab Guide (PDF)</span>
              </a>
              <a href="#" className="resource-link">
                <span className="resource-icon">📋</span>
                <span>Post-Surgery Recovery Timeline</span>
              </a>
              <a href="#" className="resource-link">
                <span className="resource-icon">💊</span>
                <span>Pain Management Techniques</span>
              </a>
            </div>

            <div className="resources-group">
              <h4>Video Tutorials</h4>
              <a href="#" className="resource-link video-link">
                <span className="resource-icon">▶️</span>
                <span>Proper Ice Application (3:24)</span>
              </a>
              <a href="#" className="resource-link video-link">
                <span className="resource-icon">▶️</span>
                <span>Using Crutches Safely (5:12)</span>
              </a>
              <a href="#" className="resource-link video-link">
                <span className="resource-icon">▶️</span>
                <span>{selectedProgram === 'knee' ? 'Knee' : 'Ankle'} Taping Techniques (7:45)</span>
              </a>
            </div>

            <div className="resources-group">
              <h4>Recommended Equipment</h4>
              <div className="equipment-item">
                <span className="equipment-icon">🎯</span>
                <span>Resistance bands (light & medium)</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-icon">🎯</span>
                <span>Foam roller (6" diameter)</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-icon">🎯</span>
                <span>Stability ball (65cm)</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-icon">🎯</span>
                <span>Ice pack or frozen peas</span>
              </div>
            </div>
          </div>

          {/* Recovery Timeline */}
          <div className="section-card timeline-section">
            <h3>Recovery Timeline</h3>
            
            <div className="timeline">
              {phases.map((phaseData, index) => (
                <div 
                  key={index} 
                  className={`timeline-item ${phaseData.status.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="timeline-marker">
                    <span className="timeline-number">{phaseData.phase}</span>
                  </div>
                  <div className="timeline-content">
                    <h4>{phaseData.title}</h4>
                    <div className="timeline-subtitle">{phaseData.subtitle}</div>
                    <p>{phaseData.description}</p>
                    <span className={`status-badge ${phaseData.status.toLowerCase().replace(' ', '-')}`}>
                      {phaseData.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Programs */}
          <div className="section-card related-section">
            <h3>You might also be interested in</h3>
            
            <div className="related-card">
              <div className="related-icon">🦶</div>
              <div>
                <h4>{selectedProgram === 'knee' ? 'Ankle Rehabilitation Program' : 'Knee Rehabilitation Program'}</h4>
                <p>Comprehensive recovery plan for {selectedProgram === 'knee' ? 'ankle' : 'knee'} sprains and post-surgery</p>
              </div>
            </div>

            <div className="related-card">
              <div className="related-icon">💪</div>
              <div>
                <h4>Hip Strengthening for {selectedProgram === 'knee' ? 'Knee' : 'Ankle'} Health</h4>
                <p>Supporting exercises to improve {selectedProgram} stability</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
