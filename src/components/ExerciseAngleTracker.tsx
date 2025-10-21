// Exercise-specific angle detection and rep counting component
import { useState, useEffect, useRef } from 'react';
import PoseDetector from './PoseDetector';
import type { JointAngles } from './PoseDetector';
import { getExerciseAngleConfig, validateAngles, type ExerciseAngleConfig } from '../data/exerciseAngleConfig';

interface ExerciseAngleTrackerProps {
  exerciseName: string;
  onComplete?: (reps: number, duration: number) => void;
  onClose?: () => void;
}

interface RepState {
  currentRep: number;
  isInStartPosition: boolean;
  hasReachedEndPosition: boolean;
  repTimestamp: number;
}

export default function ExerciseAngleTracker({ exerciseName, onComplete, onClose }: ExerciseAngleTrackerProps) {
  const [config, setConfig] = useState<ExerciseAngleConfig | null>(null);
  const [currentAngles, setCurrentAngles] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [repState, setRepState] = useState<RepState>({
    currentRep: 0,
    isInStartPosition: false,
    hasReachedEndPosition: false,
    repTimestamp: Date.now()
  });
  const [sessionStartTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const exerciseConfig = getExerciseAngleConfig(exerciseName);
    setConfig(exerciseConfig);
    
    if (!exerciseConfig) {
      setFeedback(`⚠️ No angle tracking available for "${exerciseName}"`);
    }
  }, [exerciseName]);

  useEffect(() => {
    // Create audio element for rep completion sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+zPLTgjMGHm7A7+OZURE');
  }, []);

  const handleAnglesUpdate = (angles: JointAngles) => {
    if (!config || !isTracking) return;
    
    // Use angles directly from PoseDetector (includes real hip angles now)
    setCurrentAngles(angles);

    // Validate angles against exercise requirements
    const validation = validateAngles(config, angles);
    setFeedback(validation.feedback);

    // Track angle history for the primary joint
    if (config.repCounting) {
      const primaryJoint = config.repCounting.startCondition.joint;
      const side = config.repCounting.startCondition.side;
      
      let currentAngle: number;
      if (side === 'left') {
        currentAngle = primaryJoint === 'knee' ? angles.leftKnee : angles.leftAnkle;
      } else if (side === 'right') {
        currentAngle = primaryJoint === 'knee' ? angles.rightKnee : angles.rightAnkle;
      } else {
        const left = primaryJoint === 'knee' ? angles.leftKnee : angles.leftAnkle;
        const right = primaryJoint === 'knee' ? angles.rightKnee : angles.rightAnkle;
        currentAngle = (left + right) / 2;
      }

      // Rep counting logic
      handleRepCounting(currentAngle);
    }
  };

  const handleRepCounting = (currentAngle: number) => {
    if (!config || !config.repCounting) return;

    const { startCondition, endCondition } = config.repCounting;

    setRepState(prev => {
      let newState = { ...prev };

      // Check if in start position
      if (startCondition.direction === 'above' && currentAngle > startCondition.angleThreshold) {
        if (!prev.isInStartPosition && prev.hasReachedEndPosition) {
          // Completed a full rep!
          newState.currentRep = prev.currentRep + 1;
          newState.isInStartPosition = true;
          newState.hasReachedEndPosition = false;
          newState.repTimestamp = Date.now();
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
          
          setFeedback(`🎉 Rep ${newState.currentRep} complete!`);
        } else if (!prev.hasReachedEndPosition) {
          newState.isInStartPosition = true;
        }
      } else if (startCondition.direction === 'below' && currentAngle < startCondition.angleThreshold) {
        if (!prev.isInStartPosition && prev.hasReachedEndPosition) {
          // Completed a full rep!
          newState.currentRep = prev.currentRep + 1;
          newState.isInStartPosition = true;
          newState.hasReachedEndPosition = false;
          newState.repTimestamp = Date.now();
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
          
          setFeedback(`🎉 Rep ${newState.currentRep} complete!`);
        } else if (!prev.hasReachedEndPosition) {
          newState.isInStartPosition = true;
        }
      } else {
        newState.isInStartPosition = false;
      }

      // Check if reached end position
      if (endCondition.direction === 'above' && currentAngle > endCondition.angleThreshold) {
        if (prev.isInStartPosition) {
          newState.hasReachedEndPosition = true;
        }
      } else if (endCondition.direction === 'below' && currentAngle < endCondition.angleThreshold) {
        if (prev.isInStartPosition) {
          newState.hasReachedEndPosition = true;
        }
      }

      return newState;
    });
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    setRepState({
      currentRep: 0,
      isInStartPosition: false,
      hasReachedEndPosition: false,
      repTimestamp: Date.now()
    });
    setFeedback('🚀 Tracking started! Get into position...');
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    if (onComplete) {
      onComplete(repState.currentRep, duration);
    }
    setFeedback(`✅ Session complete! ${repState.currentRep} reps in ${duration}s`);
  };

  if (!config) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#ff6b6b', fontSize: '18px' }}>
          ⚠️ Angle tracking not available for this exercise yet.
        </p>
        <p style={{ color: '#666', marginTop: '10px' }}>
          This feature is being developed. Check back soon!
        </p>
        {onClose && (
          <button 
            onClick={onClose}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%',
      height: '100%',
      overflow: 'auto',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px',
        gap: '20px',
        minHeight: '600px',
        boxSizing: 'border-box'
      }}>
        {/* Left Side - Camera Feed */}
        <div style={{ 
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <PoseDetector onAnglesUpdate={handleAnglesUpdate} />
        </div>

        {/* Right Side - Exercise Info & Stats */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          boxSizing: 'border-box'
        }}>
        {/* Exercise Info */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px',
          border: '2px solid #2196f3'
        }}>
          <h3 style={{ marginTop: 0, color: '#1976d2' }}>📋 {config.exerciseName}</h3>
          <p><strong>Camera Position:</strong> {config.cameraAngle.toUpperCase()} view</p>
          <div style={{ marginTop: '10px' }}>
            <strong>Target Angles:</strong>
            {config.angleRequirements.map((req, idx) => (
              <div key={idx} style={{ 
                fontSize: '14px', 
                marginTop: '5px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '4px'
              }}>
                {req.description}
              </div>
            ))}
          </div>
        </div>

        {/* Rep Counter */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '48px', color: '#2196f3' }}>
            {repState.currentRep}
          </h2>
          <p style={{ margin: 0, color: '#666' }}>Reps Completed</p>
        </div>

        {/* Live Feedback */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: feedback.includes('✓') || feedback.includes('🎉') ? '#c8e6c9' : '#fff3e0',
          borderRadius: '8px',
          border: `2px solid ${feedback.includes('✓') || feedback.includes('🎉') ? '#4caf50' : '#ff9800'}`,
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {feedback || 'Waiting for position...'}
          </p>
        </div>

        {/* Current Angles Display */}
        {currentAngles && config.angleRequirements.map((req, idx) => {
          let currentAngle: number = 0;
          let label = '';
          
          if (req.joint === 'knee') {
            if (req.side === 'left') {
              currentAngle = currentAngles.leftKnee;
              label = 'Left Knee';
            } else if (req.side === 'right') {
              currentAngle = currentAngles.rightKnee;
              label = 'Right Knee';
            } else {
              currentAngle = (currentAngles.leftKnee + currentAngles.rightKnee) / 2;
              label = 'Knee (Avg)';
            }
          } else if (req.joint === 'ankle') {
            if (req.side === 'left') {
              currentAngle = currentAngles.leftAnkle;
              label = 'Left Ankle';
            } else if (req.side === 'right') {
              currentAngle = currentAngles.rightAnkle;
              label = 'Right Ankle';
            } else {
              currentAngle = (currentAngles.leftAnkle + currentAngles.rightAnkle) / 2;
              label = 'Ankle (Avg)';
            }
          } else if (req.joint === 'hip') {
            if (req.side === 'left') {
              currentAngle = currentAngles.leftHip;
              label = 'Left Hip';
            } else if (req.side === 'right') {
              currentAngle = currentAngles.rightHip;
              label = 'Right Hip';
            } else {
              currentAngle = (currentAngles.leftHip + currentAngles.rightHip) / 2;
              label = 'Hip (Avg)';
            }
          }

          const isInRange = (req.minAngle === undefined || currentAngle >= req.minAngle) &&
                           (req.maxAngle === undefined || currentAngle <= req.maxAngle);

          return (
            <div key={idx} style={{ 
              padding: '12px', 
              backgroundColor: isInRange ? '#c8e6c9' : '#ffcdd2',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong>{label}:</strong>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {Math.round(currentAngle)}°
              </span>
            </div>
          );
        })}

        {/* Control Buttons - Sticky at bottom */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          paddingTop: '15px',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 10,
          borderTop: '2px solid #e0e0e0',
          marginTop: '15px'
        }}>
          {!isTracking ? (
            <button
              onClick={handleStartTracking}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ▶️ Start Tracking
            </button>
          ) : (
            <button
              onClick={handleStopTracking}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ⏹️ Stop & Save
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '15px 30px',
                backgroundColor: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
