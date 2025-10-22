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
  startPositionFrames: number; // Count frames in start position
  endPositionFrames: number; // Count frames in end position
}

export default function ExerciseAngleTracker({ exerciseName, onComplete, onClose }: ExerciseAngleTrackerProps) {
  const [config, setConfig] = useState<ExerciseAngleConfig | null>(null);
  const [currentAngles, setCurrentAngles] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [repState, setRepState] = useState<RepState>({
    currentRep: 0,
    isInStartPosition: false,
    hasReachedEndPosition: false,
    repTimestamp: Date.now(),
    startPositionFrames: 0,
    endPositionFrames: 0
  });
  const [sessionStartTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(false);
  const isTrackingRef = useRef(false); // Use ref to avoid closure issues
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log('🔍 Looking for config for exercise:', exerciseName);
    const exerciseConfig = getExerciseAngleConfig(exerciseName);
    console.log('📋 Config found:', exerciseConfig);
    setConfig(exerciseConfig);
    
    if (!exerciseConfig) {
      setFeedback(`⚠️ No angle tracking available for "${exerciseName}"`);
    } else {
      console.log('✅ Exercise config loaded:', exerciseConfig.exerciseName);
      console.log('📐 Angle requirements:', exerciseConfig.angleRequirements);
      console.log('🔁 Rep counting config:', exerciseConfig.repCounting);
    }
  }, [exerciseName]);

  useEffect(() => {
    // Create audio element for rep completion sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+zPLTgjMGHm7A7+OZURE');
  }, []);

  const handleAnglesUpdate = (angles: JointAngles) => {
    // Always update currentAngles for display, even when not tracking
    setCurrentAngles(angles);
    
    if (!config) {
      console.log('⏸️ No config loaded');
      return;
    }
    
    if (!isTrackingRef.current) {
      console.log('⏸️ Tracker not active (tracking not started)', isTrackingRef.current);
      return;
    }
    
    console.log('📊 Angles received:', angles);
    
    // Validate angles against exercise requirements
    const validation = validateAngles(config, angles);
    console.log('✅ Validation result:', validation);
    setFeedback(validation.feedback);

    // Track angle history for the primary joint
    if (config.repCounting) {
      const primaryJoint = config.repCounting.startCondition.joint;
      const side = config.repCounting.startCondition.side;
      
      let currentAngle: number;
      if (side === 'left') {
        currentAngle = primaryJoint === 'knee' ? angles.leftKnee : 
                       primaryJoint === 'ankle' ? angles.leftAnkle : angles.leftHip;
      } else if (side === 'right') {
        currentAngle = primaryJoint === 'knee' ? angles.rightKnee : 
                       primaryJoint === 'ankle' ? angles.rightAnkle : angles.rightHip;
      } else {
        // 'both' side - use average, but only if both are detected
        const left = primaryJoint === 'knee' ? angles.leftKnee : 
                     primaryJoint === 'ankle' ? angles.leftAnkle : angles.leftHip;
        const right = primaryJoint === 'knee' ? angles.rightKnee : 
                      primaryJoint === 'ankle' ? angles.rightAnkle : angles.rightHip;
        
        // Smart fallback: if one side isn't detected (0°), use the other side
        if (left > 0 && right > 0) {
          currentAngle = (left + right) / 2; // Average when both detected
        } else if (left > 0) {
          currentAngle = left; // Use left if right not detected
        } else if (right > 0) {
          currentAngle = right; // Use right if left not detected
        } else {
          currentAngle = 0; // Neither detected
        }
      }

      console.log('🎯 Current angle for rep counting:', currentAngle, `(${primaryJoint}, ${side})`);
      
      // Rep counting logic
      handleRepCounting(currentAngle);
    }
  };

  const handleRepCounting = (currentAngle: number) => {
    if (!config || !config.repCounting) return;

    const { startCondition, endCondition } = config.repCounting;
    
    // Require at least 5 consecutive frames in position to confirm (about 0.15s at 30fps)
    const REQUIRED_FRAMES = 5;
    // Require at least 500ms between reps to prevent double-counting
    const MIN_REP_COOLDOWN = 500; // milliseconds

    setRepState(prev => {
      let newState = { ...prev };
      const now = Date.now();
      const timeSinceLastRep = now - prev.repTimestamp;

      // Check if in start position
      const inStartPosition = 
        (startCondition.direction === 'above' && currentAngle > startCondition.angleThreshold) ||
        (startCondition.direction === 'below' && currentAngle < startCondition.angleThreshold);

      // Check if in end position
      const inEndPosition = 
        (endCondition.direction === 'above' && currentAngle > endCondition.angleThreshold) ||
        (endCondition.direction === 'below' && currentAngle < endCondition.angleThreshold);

      // Update start position tracking
      if (inStartPosition) {
        newState.startPositionFrames = prev.startPositionFrames + 1;
        
        // Confirm start position only after holding it for REQUIRED_FRAMES
        if (newState.startPositionFrames >= REQUIRED_FRAMES && !prev.isInStartPosition) {
          newState.isInStartPosition = true;
          console.log('✅ Start position confirmed!');
        }
      } else {
        newState.startPositionFrames = 0;
        newState.isInStartPosition = false;
      }

      // Update end position tracking
      if (inEndPosition && prev.isInStartPosition) {
        newState.endPositionFrames = prev.endPositionFrames + 1;
        
        // Confirm end position only after holding it for REQUIRED_FRAMES
        if (newState.endPositionFrames >= REQUIRED_FRAMES && !prev.hasReachedEndPosition) {
          newState.hasReachedEndPosition = true;
          console.log('✅ End position confirmed!');
        }
      } else {
        newState.endPositionFrames = 0;
        if (!inStartPosition) {
          newState.hasReachedEndPosition = false;
        }
      }

      // Count rep only when returning to start position after reaching end position
      // AND enough time has passed since last rep (cooldown)
      if (newState.isInStartPosition && prev.hasReachedEndPosition && 
          !prev.isInStartPosition && timeSinceLastRep > MIN_REP_COOLDOWN) {
        // REP COMPLETED!
        newState.currentRep = prev.currentRep + 1;
        newState.hasReachedEndPosition = false;
        newState.endPositionFrames = 0;
        newState.repTimestamp = now;
        
        // Play sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        
        setFeedback(`🎉 Rep ${newState.currentRep} complete!`);
        console.log('🎉 REP COUNTED! Total:', newState.currentRep);
      }

      return newState;
    });
  };

  const handleStartTracking = () => {
    console.log('▶️ START TRACKING clicked!');
    console.log('Has config:', !!config);
    console.log('Config:', config);
    setIsTracking(true);
    isTrackingRef.current = true; // Set ref immediately for callbacks
    setRepState({
      currentRep: 0,
      isInStartPosition: false,
      hasReachedEndPosition: false,
      repTimestamp: Date.now(),
      startPositionFrames: 0,
      endPositionFrames: 0
    });
    setFeedback('🚀 Tracking started! Get into position...');
    console.log('✅ Tracking state set to TRUE, ref:', isTrackingRef.current);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    isTrackingRef.current = false; // Set ref immediately for callbacks
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
          {config.repCounting && (
            <div style={{ marginTop: '15px', fontSize: '13px', backgroundColor: '#fff9c4', padding: '10px', borderRadius: '4px' }}>
              <strong>🔁 Rep Counting:</strong><br/>
              Start: {config.repCounting.startCondition.joint} {config.repCounting.startCondition.direction} {config.repCounting.startCondition.angleThreshold}°<br/>
              End: {config.repCounting.endCondition.joint} {config.repCounting.endCondition.direction} {config.repCounting.endCondition.angleThreshold}°
            </div>
          )}
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
          
          {/* Rep State Indicator */}
          {isTracking && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <div style={{ 
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '4px',
                backgroundColor: repState.isInStartPosition ? '#4caf50' : '#e0e0e0',
                color: repState.isInStartPosition ? 'white' : '#666',
                marginRight: '5px'
              }}>
                Start: {repState.isInStartPosition ? '✓' : '○'}
              </div>
              <div style={{ 
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '4px',
                backgroundColor: repState.hasReachedEndPosition ? '#2196f3' : '#e0e0e0',
                color: repState.hasReachedEndPosition ? 'white' : '#666'
              }}>
                End: {repState.hasReachedEndPosition ? '✓' : '○'}
              </div>
            </div>
          )}
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
        {currentAngles && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            marginBottom: '10px'
          }}>
            <strong>🔍 Debug - Raw Angles:</strong><br/>
            L Knee: {Math.round(currentAngles.leftKnee)}° | 
            R Knee: {Math.round(currentAngles.rightKnee)}° | 
            L Hip: {Math.round(currentAngles.leftHip)}° | 
            R Hip: {Math.round(currentAngles.rightHip)}°<br/>
            <span style={{ color: isTracking ? 'green' : 'red', fontWeight: 'bold' }}>
              Tracking: {isTracking ? 'YES ✅' : 'NO ❌'}
            </span>
          </div>
        )}
        
        {!currentAngles && isTracking && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#ffcccc',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '10px',
            color: '#cc0000',
            fontWeight: 'bold'
          }}>
            ⚠️ No angles received yet! Check camera detection.
          </div>
        )}
        
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
              // 'both' - smart fallback for single-side detection
              const left = currentAngles.leftKnee;
              const right = currentAngles.rightKnee;
              if (left > 0 && right > 0) {
                currentAngle = (left + right) / 2;
                label = 'Knee (Avg)';
              } else if (left > 0) {
                currentAngle = left;
                label = 'Left Knee (only detected)';
              } else if (right > 0) {
                currentAngle = right;
                label = 'Right Knee (only detected)';
              } else {
                currentAngle = 0;
                label = 'Knee (not detected)';
              }
            }
          } else if (req.joint === 'ankle') {
            if (req.side === 'left') {
              currentAngle = currentAngles.leftAnkle;
              label = 'Left Ankle';
            } else if (req.side === 'right') {
              currentAngle = currentAngles.rightAnkle;
              label = 'Right Ankle';
            } else {
              // 'both' - smart fallback for single-side detection
              const left = currentAngles.leftAnkle;
              const right = currentAngles.rightAnkle;
              if (left > 0 && right > 0) {
                currentAngle = (left + right) / 2;
                label = 'Ankle (Avg)';
              } else if (left > 0) {
                currentAngle = left;
                label = 'Left Ankle (only detected)';
              } else if (right > 0) {
                currentAngle = right;
                label = 'Right Ankle (only detected)';
              } else {
                currentAngle = 0;
                label = 'Ankle (not detected)';
              }
            }
          } else if (req.joint === 'hip') {
            if (req.side === 'left') {
              currentAngle = currentAngles.leftHip;
              label = 'Left Hip';
            } else if (req.side === 'right') {
              currentAngle = currentAngles.rightHip;
              label = 'Right Hip';
            } else {
              // 'both' - smart fallback for single-side detection
              const left = currentAngles.leftHip;
              const right = currentAngles.rightHip;
              if (left > 0 && right > 0) {
                currentAngle = (left + right) / 2;
                label = 'Hip (Avg)';
              } else if (left > 0) {
                currentAngle = left;
                label = 'Left Hip (only detected)';
              } else if (right > 0) {
                currentAngle = right;
                label = 'Right Hip (only detected)';
              } else {
                currentAngle = 0;
                label = 'Hip (not detected)';
              }
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
