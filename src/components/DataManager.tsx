// Data Management Component - Add this to any page for quick data editing
// Usage: <DataManager userId={user.uid} />

import { useState } from 'react';
import { dashboardService, exerciseService } from '../services/dataService';

interface DataManagerProps {
  userId: string;
}

export default function DataManager({ userId }: DataManagerProps) {
  const [showManager, setShowManager] = useState(false);

  const addSampleActivity = () => {
    dashboardService.addActivity(userId, {
      type: 'completed',
      title: `Completed sample exercise`,
      timestamp: new Date(),
      icon: '✅'
    });
    alert('Activity added! Refresh dashboard to see it.');
  };

  const updateSampleStats = () => {
    dashboardService.updateStats(userId, {
      progressPercentage: Math.floor(Math.random() * 100),
      daysActive: Math.floor(Math.random() * 30),
      exercisesCompleted: Math.floor(Math.random() * 20)
    });
    alert('Stats updated! Refresh dashboard to see changes.');
  };

  const updateProgramProgress = () => {
    dashboardService.updateProgramProgress(userId, {
      programName: 'Knee Rehabilitation Program',
      currentWeek: Math.floor(Math.random() * 8) + 1,
      totalWeeks: 8,
      progressPercentage: Math.floor(Math.random() * 100),
      description: "Making steady progress!"
    });
    alert('Program progress updated! Refresh dashboard to see changes.');
  };

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset ALL your data? This cannot be undone.')) {
      localStorage.removeItem(`rehabmotion_dashboard_data_${userId}`);
      localStorage.removeItem(`rehabmotion_knee_exercises_${userId}`);
      localStorage.removeItem(`rehabmotion_ankle_exercises_${userId}`);
      alert('All data reset! Refresh the page.');
    }
  };

  const exportData = () => {
    const data = {
      dashboard: dashboardService.getDashboardData(userId),
      kneeExercises: exerciseService.getExercises(userId, 'knee'),
      ankleExercises: exerciseService.getExercises(userId, 'ankle')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `rehab-data-${new Date().toISOString()}.json`;
    link.click();
  };

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
        title="Data Manager"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        zIndex: 1000,
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Data Manager</h3>
        <button
          onClick={() => setShowManager(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={addSampleActivity}
          style={{
            padding: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ➕ Add Sample Activity
        </button>

        <button
          onClick={updateSampleStats}
          style={{
            padding: '10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📊 Update Random Stats
        </button>

        <button
          onClick={updateProgramProgress}
          style={{
            padding: '10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📈 Update Program Progress
        </button>

        <button
          onClick={exportData}
          style={{
            padding: '10px',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          💾 Export Data (JSON)
        </button>

        <button
          onClick={resetAllData}
          style={{
            padding: '10px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          🗑️ Reset All Data
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#666', marginTop: '15px', marginBottom: 0 }}>
        <strong>Tip:</strong> Changes require a page refresh to see updates.
      </p>
    </div>
  );
}
