import React, { useState } from 'react';
import '../styles/SmartIntakeForm.css';

interface SmartIntakeData {
  injuryType: string;
  injuryDate: string;
  currentPainLevel: number;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  age: number;
  goals: string[];
  availableDays: number;
  preferredSessionDuration: number;
}

interface SmartIntakeFormProps {
  onComplete: (data: SmartIntakeData) => void;
  onSkip: () => void;
  userId: string;
  existingData?: SmartIntakeData | null;
}

const INJURY_TYPES = [
  { id: 'acl', name: 'ACL Tear', icon: '🦵', common: true },
  { id: 'mcl', name: 'MCL Tear', icon: '🦵', common: true },
  { id: 'meniscus', name: 'Meniscus Tear', icon: '🦵', common: true },
  { id: 'lateral-ankle', name: 'Lateral Ankle Sprain', icon: '🦶', common: true },
  { id: 'medial-ankle', name: 'Medial Ankle Sprain', icon: '🦶', common: true },
  { id: 'high-ankle', name: 'High Ankle Sprain', icon: '🦶', common: true },
];

const SmartIntakeForm: React.FC<SmartIntakeFormProps> = ({ onComplete, onSkip, userId, existingData }) => {
  const [formData, setFormData] = useState<SmartIntakeData>(existingData || {
    injuryType: '',
    injuryDate: '',
    currentPainLevel: 5,
    fitnessLevel: 'INTERMEDIATE',
    age: 30,
    goals: [],
    availableDays: 3,
    preferredSessionDuration: 20
  });

  const [showDetails, setShowDetails] = useState(!!existingData);

  // Auto-infer goals based on injury and pain level
  const inferGoals = (injuryType: string, painLevel: number): string[] => {
    const goals: string[] = [];
    
    if (painLevel >= 6) {
      goals.push('Reduce pain');
    }
    
    if (injuryType.includes('ACL') || injuryType.includes('Ankle')) {
      goals.push('Improve mobility');
      goals.push('Return to sports');
    }
    
    if (injuryType.includes('MCL') || injuryType.includes('Meniscus')) {
      goals.push('Restore daily activities');
      goals.push('Increase strength');
    }
    
    goals.push('Prevent re-injury');
    
    return goals;
  };

  // Auto-detect fitness level based on age
  const inferFitnessLevel = (age: number): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' => {
    if (age < 25) return 'INTERMEDIATE';
    if (age < 50) return 'INTERMEDIATE';
    return 'BEGINNER';
  };

  // Auto-suggest schedule based on injury and fitness
  const inferSchedule = (injuryType: string, fitnessLevel: string) => {
    if (fitnessLevel === 'ADVANCED') {
      return { days: 4, duration: 30 };
    } else if (fitnessLevel === 'INTERMEDIATE') {
      return { days: 3, duration: 25 };
    } else {
      return { days: 2, duration: 20 };
    }
  };

  const handleInjurySelect = (injuryName: string) => {
    const updatedData = {
      ...formData,
      injuryType: injuryName
    };
    
    // Auto-generate goals
    updatedData.goals = inferGoals(injuryName, formData.currentPainLevel);
    
    setFormData(updatedData);
  };

  const handleQuickStart = () => {
    if (!formData.injuryType) {
      alert('Please select your injury type');
      return;
    }

    // Auto-complete missing data with smart defaults
    const completeData = {
      ...formData,
      injuryDate: formData.injuryDate || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks ago default
      fitnessLevel: inferFitnessLevel(formData.age),
      goals: formData.goals.length > 0 ? formData.goals : inferGoals(formData.injuryType, formData.currentPainLevel)
    };

    const schedule = inferSchedule(completeData.injuryType, completeData.fitnessLevel);
    completeData.availableDays = schedule.days;
    completeData.preferredSessionDuration = schedule.duration;

    onComplete(completeData);
  };

  const handleDetailedSetup = () => {
    setShowDetails(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const completeData = {
      ...formData,
      goals: formData.goals.length > 0 ? formData.goals : inferGoals(formData.injuryType, formData.currentPainLevel)
    };
    
    onComplete(completeData);
  };

  // Quick Start View (Default)
  if (!showDetails) {
    const isUpdateMode = !!existingData;
    
    return (
      <div className="smart-intake-overlay">
        <div className="smart-intake-modal quick-setup">
          <button className="close-btn" onClick={onSkip}>×</button>
          
          <div className="quick-setup-header">
            <div className="pulse-icon">{isUpdateMode ? '⚙️' : '🎯'}</div>
            <h2>{isUpdateMode ? 'Update Your Recovery Plan' : 'Let\'s Personalize Your Recovery'}</h2>
            <p>{isUpdateMode ? 'Modify your injury details to update your plan' : 'Select your injury and we\'ll create an optimal rehab plan'}</p>
          </div>

          <div className="injury-grid">
            {INJURY_TYPES.filter(i => i.common).map(injury => (
              <button
                key={injury.id}
                className={`injury-card ${formData.injuryType === injury.name ? 'selected' : ''}`}
                onClick={() => handleInjurySelect(injury.name)}
              >
                <div className="injury-icon">{injury.icon}</div>
                <div className="injury-name">{injury.name}</div>
              </button>
            ))}
          </div>

          {formData.injuryType && (
            <div className="quick-details-section">
              <div className="detail-row">
                <label>When did it happen?</label>
                <select 
                  value={(() => {
                    if (!formData.injuryDate) return '2weeks';
                    
                    // Calculate days ago from the injury date
                    const injuryDateObj = new Date(formData.injuryDate);
                    const now = new Date();
                    const daysAgo = Math.floor((now.getTime() - injuryDateObj.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Match to closest option
                    if (daysAgo <= 10) return '1week';
                    if (daysAgo <= 21) return '2weeks';
                    if (daysAgo <= 45) return '1month';
                    return '2months';
                  })()}
                  onChange={(e) => {
                    const daysAgo = {
                      '1week': 7,
                      '2weeks': 14,
                      '1month': 30,
                      '2months': 60
                    }[e.target.value] || 14;
                    
                    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
                    setFormData({ ...formData, injuryDate: date.toISOString().split('T')[0] });
                  }}
                >
                  <option value="1week">About 1 week ago</option>
                  <option value="2weeks">About 2 weeks ago</option>
                  <option value="1month">About 1 month ago</option>
                  <option value="2months">About 2 months ago</option>
                </select>
              </div>

              <div className="detail-row">
                <label>Current pain level: <strong>{formData.currentPainLevel}/10</strong></label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.currentPainLevel}
                  onChange={(e) => {
                    const painLevel = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      currentPainLevel: painLevel,
                      goals: inferGoals(formData.injuryType, painLevel)
                    });
                  }}
                  className="pain-slider"
                />
              </div>

              <div className="auto-plan-preview">
                <h4>🤖 Smart Recommendations:</h4>
                <div className="preview-items">
                  <div className="preview-item">
                    <span>📅</span>
                    <span>{inferSchedule(formData.injuryType, inferFitnessLevel(formData.age)).days}x per week</span>
                  </div>
                  <div className="preview-item">
                    <span>⏱️</span>
                    <span>{inferSchedule(formData.injuryType, inferFitnessLevel(formData.age)).duration} min sessions</span>
                  </div>
                  <div className="preview-item">
                    <span>🎯</span>
                    <span>{inferGoals(formData.injuryType, formData.currentPainLevel)[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="quick-actions">
            <button 
              className="btn-text"
              onClick={handleDetailedSetup}
            >
              ⚙️ Customize Details
            </button>
            <button 
              className="btn-primary-large"
              onClick={handleQuickStart}
              disabled={!formData.injuryType}
            >
              {isUpdateMode ? 'Update My Plan →' : 'Generate My Plan →'}
            </button>
          </div>

          <p className="privacy-note">
            💡 We'll use AI to customize exercises based on your recovery stage and fitness level
          </p>
        </div>
      </div>
    );
  }

  // Detailed Setup View
  const isUpdateMode = !!existingData;
  
  return (
    <div className="smart-intake-overlay">
      <div className="smart-intake-modal detailed-setup">
        <button className="close-btn" onClick={onSkip}>×</button>
        
        <div className="detailed-header">
          <button className="back-btn" onClick={() => setShowDetails(false)}>← Back</button>
          <h2>{isUpdateMode ? 'Update Your Plan' : 'Customize Your Plan'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="detailed-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Injury Type</label>
              <select 
                value={formData.injuryType}
                onChange={(e) => handleInjurySelect(e.target.value)}
                required
              >
                <option value="">Select your injury</option>
                {INJURY_TYPES.map(injury => (
                  <option key={injury.id} value={injury.name}>{injury.icon} {injury.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Injury Date</label>
                <input
                  type="date"
                  value={formData.injuryDate}
                  onChange={(e) => setFormData({ ...formData, injuryDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => {
                    const age = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      age,
                      fitnessLevel: inferFitnessLevel(age)
                    });
                  }}
                  min="10"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Current Pain Level: {formData.currentPainLevel}/10</label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.currentPainLevel}
                onChange={(e) => {
                  const painLevel = parseInt(e.target.value);
                  setFormData({ 
                    ...formData, 
                    currentPainLevel: painLevel,
                    goals: inferGoals(formData.injuryType, painLevel)
                  });
                }}
                className="pain-slider"
              />
              <div className="pain-labels">
                <span>No Pain</span>
                <span>Worst Pain</span>
              </div>
            </div>

            <div className="form-group">
              <label>Fitness Level</label>
              <div className="fitness-pills">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(level => (
                  <button
                    key={level}
                    type="button"
                    className={`fitness-pill ${formData.fitnessLevel === level ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, fitnessLevel: level })}
                  >
                    {level === 'BEGINNER' && '🌱'} 
                    {level === 'INTERMEDIATE' && '💪'} 
                    {level === 'ADVANCED' && '🏆'} 
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule Preferences</h3>
            
            <div className="form-group">
              <label>Sessions per week: {formData.availableDays} days</label>
              <div className="day-buttons">
                {[2, 3, 4, 5].map(days => (
                  <button
                    key={days}
                    type="button"
                    className={`day-btn ${formData.availableDays === days ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, availableDays: days })}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Session duration: {formData.preferredSessionDuration} minutes</label>
              <div className="duration-buttons">
                {[15, 20, 25, 30].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    className={`duration-btn ${formData.preferredSessionDuration === mins ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, preferredSessionDuration: mins })}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="commitment-box">
              <strong>Weekly Time:</strong> {formData.availableDays * formData.preferredSessionDuration} minutes
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary-large">
              {isUpdateMode ? 'Update Personalized Plan →' : 'Generate Personalized Plan →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartIntakeForm;
