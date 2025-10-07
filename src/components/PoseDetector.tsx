import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { calculateKneeAngle, calculateAnkleAngle, PoseLandmarks } from '../utils/angleCalculations';

interface PoseDetectorProps {
  onAnglesUpdate?: (angles: JointAngles) => void;
}

export interface JointAngles {
  leftKnee: number;
  rightKnee: number;
  leftAnkle: number;
  rightAnkle: number;
}

export default function PoseDetector({ onAnglesUpdate }: PoseDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [videoZoom, setVideoZoom] = useState(1); // Zoom level (0.5 to 1)
  const [mirrorMode, setMirrorMode] = useState(true); // Mirror the video
  const [detectionStatus, setDetectionStatus] = useState<string>('Waiting...');
  const [poseDetectedCount, setPoseDetectedCount] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isDetectingRef = useRef(false); // Use ref to track detection state for immediate access

  // Initialize MediaPipe Pose Landmarker
  useEffect(() => {
    console.log('🚀 PoseDetector component mounted - v2.1 - Fixed async state bug');
    const initializePoseLandmarker = async () => {
      try {
        console.log('🔄 Initializing MediaPipe Pose Landmarker...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        console.log('✅ Vision tasks loaded');

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.1,
          minPosePresenceConfidence: 0.1,
          minTrackingConfidence: 0.1,
          outputSegmentationMasks: false
        });

        console.log('✅ Pose Landmarker created successfully');
        setPoseLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error initializing pose landmarker:', err);
        setError(`Failed to initialize pose detector: ${err}`);
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start webcam
  const startWebcam = async () => {
    console.log('🎥 startWebcam called! poseLandmarker ready:', !!poseLandmarker);
    try {
      setDetectionStatus('🔄 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user',
          // Request wider field of view if available
          aspectRatio: { ideal: 16/9 },
          frameRate: { ideal: 30 }
        }
      });

      setDetectionStatus('📹 Camera connected, loading video...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Use onloadeddata property instead of addEventListener for better reliability
        videoRef.current.onloadeddata = () => {
          console.log('📹 Video loaded successfully!');
          console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          console.log('Pose Landmarker ready?', !!poseLandmarker);
          
          if (!poseLandmarker) {
            console.warn('⚠️ Waiting for pose landmarker to initialize...');
            setDetectionStatus('⏳ Loading AI model...');
            // Retry after a short delay
            setTimeout(() => {
              if (poseLandmarker) {
                console.log('✅ Pose landmarker now ready, starting detection!');
                setDetectionStatus('🔄 Starting detection...');
                setIsDetecting(true);
                isDetectingRef.current = true; // Set ref immediately
                detectPose();
              } else {
                console.error('❌ Pose landmarker still not ready!');
                setDetectionStatus('❌ AI model failed to load');
              }
            }, 1000);
          } else {
            console.log('✅ Everything ready, starting detection!');
            setDetectionStatus('🔄 Starting detection...');
            setIsDetecting(true);
            isDetectingRef.current = true; // Set ref immediately
            // Start detection immediately
            detectPose();
          }
        };
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam');
      setDetectionStatus('❌ Camera access denied');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
    isDetectingRef.current = false; // Set ref immediately
    setDetectionStatus('Stopped');
    setPoseDetectedCount(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Detect pose and calculate angles
  const detectPose = () => {
    console.log('🔄 detectPose called, poseLandmarker:', !!poseLandmarker, 'isDetecting:', isDetectingRef.current);
    
    if (!poseLandmarker) {
      console.error('❌ Pose landmarker not initialized!');
      setDetectionStatus('⏳ Waiting for AI model to load...');
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not available!');
      return;
    }
    
    if (!isDetectingRef.current) {
      console.log('⏸️ Detection paused (isDetecting = false)');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('❌ Could not get canvas context!');
      return;
    }

    // Check if video is ready
    if (video.readyState < 2) {
      console.log('⏳ Video not ready, readyState:', video.readyState);
      setDetectionStatus('⏳ Video loading...');
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // Set canvas size to match video (only log on first frame or when size changes)
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('📐 Canvas resized to:', canvas.width, 'x', canvas.height);
    }

    // Draw a test indicator to prove canvas is working
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(10, 10, 20, 20); // Green square in top-left

    let results;
    try {
      // Detect pose
      const startTimeMs = performance.now();
      results = poseLandmarker.detectForVideo(video, startTimeMs);
    } catch (err) {
      console.error('❌ Detection error:', err);
      setDetectionStatus(`❌ Detection error: ${err}`);
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // Log results occasionally (every 60 frames to avoid spam)
    const frameCount = poseDetectedCount + 1;
    if (frameCount % 60 === 0) {
      console.log(`📊 Frame ${frameCount}: Landmarks found:`, results.landmarks?.length || 0);
    }

    // Clear canvas (but keep test square)
    ctx.clearRect(40, 0, canvas.width - 40, canvas.height);

    // Draw pose landmarks
    if (results.landmarks && results.landmarks.length > 0) {
      // Only log every 60 frames to avoid spam
      if (frameCount % 60 === 0) {
        console.log('✅ Pose detected! Landmarks:', results.landmarks.length);
      }
      setDetectionStatus(`✅ POSE DETECTED! (${frameCount} frames)`);
      setPoseDetectedCount(frameCount);
      
      const landmarks = results.landmarks[0];
      const drawingUtils = new DrawingUtils(ctx);

      // Draw connections first (skeleton lines) - thicker and more visible
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 5
      });
      
      // Draw landmarks on top (joint dots)
      drawingUtils.drawLandmarks(landmarks, {
        radius: 6,
        color: '#00FF00',
        fillColor: '#FF0000'
      });

      // Get landmarks with visibility check
      const leftHip = landmarks[PoseLandmarks.LEFT_HIP];
      const rightHip = landmarks[PoseLandmarks.RIGHT_HIP];
      const leftKnee = landmarks[PoseLandmarks.LEFT_KNEE];
      const rightKnee = landmarks[PoseLandmarks.RIGHT_KNEE];
      const leftAnkle = landmarks[PoseLandmarks.LEFT_ANKLE];
      const rightAnkle = landmarks[PoseLandmarks.RIGHT_ANKLE];
      const leftFootIndex = landmarks[PoseLandmarks.LEFT_FOOT_INDEX];
      const rightFootIndex = landmarks[PoseLandmarks.RIGHT_FOOT_INDEX];

      // Very lenient visibility check - just check if landmarks exist
      const leftLegVisible = leftHip && leftKnee && leftAnkle;
      const rightLegVisible = rightHip && rightKnee && rightAnkle;
      
      console.log('Left leg visible:', leftLegVisible, 'Right leg visible:', rightLegVisible);
      if (leftHip) console.log('Visibilities - L Hip:', leftHip.visibility, 'L Knee:', leftKnee?.visibility, 'L Ankle:', leftAnkle?.visibility);

      const newAngles: JointAngles = {
        leftKnee: leftLegVisible ? calculateKneeAngle(leftHip, leftKnee, leftAnkle) : 0,
        rightKnee: rightLegVisible ? calculateKneeAngle(rightHip, rightKnee, rightAnkle) : 0,
        leftAnkle: leftLegVisible && leftFootIndex?.visibility > 0.1 
          ? calculateAnkleAngle(leftKnee, leftAnkle, leftFootIndex) : 0,
        rightAnkle: rightLegVisible && rightFootIndex?.visibility > 0.1 
          ? calculateAnkleAngle(rightKnee, rightAnkle, rightFootIndex) : 0
      };

      onAnglesUpdate?.(newAngles);

      // Draw angle text on canvas with better visibility
      ctx.font = 'bold 24px Arial';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#00FF00';
      
      let yPos = 40;
      
      // Left Knee
      if (leftLegVisible) {
        const text = `L Knee: ${Math.round(newAngles.leftKnee)}°`;
        ctx.strokeText(text, 20, yPos);
        ctx.fillText(text, 20, yPos);
        yPos += 35;
      } else {
        ctx.fillStyle = '#FF0000';
        ctx.strokeText('L Knee: Not Visible', 20, yPos);
        ctx.fillText('L Knee: Not Visible', 20, yPos);
        ctx.fillStyle = '#00FF00';
        yPos += 35;
      }
      
      // Right Knee
      if (rightLegVisible) {
        const text = `R Knee: ${Math.round(newAngles.rightKnee)}°`;
        ctx.strokeText(text, 20, yPos);
        ctx.fillText(text, 20, yPos);
        yPos += 35;
      } else {
        ctx.fillStyle = '#FF0000';
        ctx.strokeText('R Knee: Not Visible', 20, yPos);
        ctx.fillText('R Knee: Not Visible', 20, yPos);
        ctx.fillStyle = '#00FF00';
        yPos += 35;
      }
      
      // Left Ankle
      if (leftLegVisible && leftFootIndex?.visibility > 0.5) {
        const text = `L Ankle: ${Math.round(newAngles.leftAnkle)}°`;
        ctx.strokeText(text, 20, yPos);
        ctx.fillText(text, 20, yPos);
        yPos += 35;
      }
      
      // Right Ankle
      if (rightLegVisible && rightFootIndex?.visibility > 0.5) {
        const text = `R Ankle: ${Math.round(newAngles.rightAnkle)}°`;
        ctx.strokeText(text, 20, yPos);
        ctx.fillText(text, 20, yPos);
      }
    } else {
      // No pose detected
      console.log('⚠️ No pose detected in frame');
      setDetectionStatus('❌ NO POSE - Check lighting & distance');
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#FF0000';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      const msg1 = '⚠️ NO POSE DETECTED';
      const msg2 = 'Step back & ensure full body visible';
      const msg3 = 'Check: Good lighting + Clear view + Standing still';
      ctx.strokeText(msg1, canvas.width / 2 - 200, canvas.height / 2 - 40);
      ctx.fillText(msg1, canvas.width / 2 - 200, canvas.height / 2 - 40);
      ctx.font = 'bold 20px Arial';
      ctx.strokeText(msg2, canvas.width / 2 - 220, canvas.height / 2 + 10);
      ctx.fillText(msg2, canvas.width / 2 - 220, canvas.height / 2 + 10);
      ctx.font = '18px Arial';
      ctx.strokeText(msg3, canvas.width / 2 - 260, canvas.height / 2 + 45);
      ctx.fillText(msg3, canvas.width / 2 - 260, canvas.height / 2 + 45);
    }

    // Continue detection loop
    animationFrameRef.current = requestAnimationFrame(detectPose);
  };

  return (
    <div className="pose-detector">
      {/* Version indicator - remove after confirming update works */}
      <div style={{ 
        fontSize: '10px', 
        color: '#888', 
        marginBottom: '5px',
        fontFamily: 'monospace' 
      }}>
        PoseDetector v2.1 - Fixed async bug
      </div>
      
      {/* Status Banner */}
      {isDetecting && (
        <div style={{
          padding: '10px 20px',
          marginBottom: '10px',
          backgroundColor: detectionStatus.includes('✅') ? '#4caf50' : '#ff9800',
          color: 'white',
          borderRadius: '4px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {detectionStatus}
        </div>
      )}

      <div className="video-container" style={{ 
        position: 'relative', 
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
        borderRadius: '8px'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            maxWidth: '1280px',
            display: isDetecting ? 'block' : 'none',
            transform: `scaleX(${mirrorMode ? -1 : 1}) scale(${1 / videoZoom})`,
            transformOrigin: 'center center'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            maxWidth: '1280px',
            transform: `scaleX(${mirrorMode ? -1 : 1})`,
            transformOrigin: 'center center',
            pointerEvents: 'none'
          }}
        />
      </div>

      <div className="controls" style={{ marginTop: '20px' }}>
        {isLoading && <p>Loading pose detector...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!isLoading && !error && (
          <>
            <div style={{ marginBottom: '15px' }}>
              {!isDetecting ? (
                <button
                  onClick={startWebcam}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopWebcam}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Stop Camera
                </button>
              )}
            </div>

            {isDetecting && (
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontWeight: 'bold' }}>🔍 Zoom Out:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={videoZoom}
                    onChange={(e) => setVideoZoom(parseFloat(e.target.value))}
                    style={{ width: '150px' }}
                  />
                  <span>{Math.round(videoZoom * 100)}%</span>
                </div>

                <button
                  onClick={() => setMirrorMode(!mirrorMode)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: mirrorMode ? '#2196F3' : '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🪞 Mirror: {mirrorMode ? 'ON' : 'OFF'}
                </button>

                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  💡 Zoom out to 60-70% to see full body
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
