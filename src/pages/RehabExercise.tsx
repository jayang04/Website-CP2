import PoseDetector from '../components/PoseDetector';
import type { JointAngles } from '../components/PoseDetector';
import { useState } from 'react';

export default function RehabExercise() {
  const [currentAngles, setCurrentAngles] = useState<JointAngles | null>(null);
  const [exerciseData] = useState<{
    reps: number;
    targetAngle: number;
    currentRep: number;
  }>({
    reps: 0,
    targetAngle: 90, // Target knee angle for squat exercise
    currentRep: 0
  });

  const handleAnglesUpdate = (angles: JointAngles) => {
    setCurrentAngles(angles);
    
    // Example: Track squat reps based on knee angle
    // If right knee angle goes below 100 degrees (squat down)
    // Then returns above 160 degrees (stand up), count as 1 rep
    const rightKneeAngle = angles.rightKnee;
    
    // You can implement rep counting logic here
    if (rightKneeAngle < 100) {
      // In squat position
    } else if (rightKneeAngle > 160) {
      // Standing position
    }
  };

  return (
    <div style={{ padding: '100px 20px 20px 20px', maxWidth: '1600px', margin: '0 auto', backgroundColor: '#f8f9fa' }}>
      <h1 style={{ marginBottom: '30px', color: '#1976d2', fontSize: '2.5rem', fontWeight: '700' }}>Rehabilitation Exercise Tracker</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Left Side - Camera */}
        <div>
          <PoseDetector onAnglesUpdate={handleAnglesUpdate} />
        </div>

        {/* Right Side - Instructions & Stats */}
        <div style={{ position: 'sticky', top: '20px' }}>
          {/* Instructions Card */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #2196f3'
          }}>
            <h2 style={{ marginTop: 0, color: '#1976d2' }}>📋 Setup Instructions</h2>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li><strong>Click "Start Camera"</strong> below</li>
              <li><strong>Use Field of View slider</strong> to widen the view until you see your full body (50-100% wider)</li>
              <li><strong>Stand 3-5 feet back</strong> from camera</li>
              <li><strong>Turn sideways (90°)</strong> to camera for best results</li>
              <li><strong>Ensure good lighting</strong> - face the light source</li>
              <li><strong>Check angle boxes</strong> turn green when detected</li>
            </ol>
          </div>

          {/* Current Angles Display */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>📊 Live Measurements</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: currentAngles && currentAngles.leftKnee > 0 ? '#c8e6c9' : '#ffcdd2',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <strong>Left Knee:</strong>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {currentAngles && currentAngles.leftKnee > 0 
                    ? `${Math.round(currentAngles.leftKnee)}°` 
                    : '---'}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: currentAngles && currentAngles.rightKnee > 0 ? '#c8e6c9' : '#ffcdd2',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <strong>Right Knee:</strong>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {currentAngles && currentAngles.rightKnee > 0 
                    ? `${Math.round(currentAngles.rightKnee)}°` 
                    : '---'}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: currentAngles && currentAngles.leftAnkle > 0 ? '#c8e6c9' : '#ffcdd2',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <strong>Left Ankle:</strong>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {currentAngles && currentAngles.leftAnkle > 0 
                    ? `${Math.round(currentAngles.leftAnkle)}°` 
                    : '---'}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: currentAngles && currentAngles.rightAnkle > 0 ? '#c8e6c9' : '#ffcdd2',
                borderRadius: '4px'
              }}>
                <strong>Right Ankle:</strong>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {currentAngles && currentAngles.rightAnkle > 0 
                    ? `${Math.round(currentAngles.rightAnkle)}°` 
                    : '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Exercise Stats */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff3e0', 
            borderRadius: '8px',
            border: '2px solid #ff9800'
          }}>
            <h3 style={{ marginTop: 0, color: '#e65100' }}>🎯 Exercise Progress</h3>
            <div style={{ lineHeight: '2' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>Reps Completed:</strong> {exerciseData.reps}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Target Angle:</strong> {exerciseData.targetAngle}°
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Status:</strong> {currentAngles && (currentAngles.leftKnee > 0 || currentAngles.rightKnee > 0) 
                  ? '✅ Tracking' 
                  : '⏸️ Waiting...'}
              </p>
            </div>
          </div>

          {/* Form Tips */}
          <div style={{ 
            marginTop: '20px',
            padding: '15px', 
            backgroundColor: '#fff9c4', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <strong>💡 Quick Tips:</strong>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Green box = Joint detected ✅</li>
              <li>Red box = Not visible ❌</li>
              <li>Side view works best for squats</li>
              <li>Keep full body in frame</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
