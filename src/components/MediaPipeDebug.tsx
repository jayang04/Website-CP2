import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * MediaPipe Debug Component
 * This component provides detailed diagnostics for MediaPipe initialization and detection
 */
export default function MediaPipeDebug() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Step 1: Initialize MediaPipe
  const initializeMediaPipe = async () => {
    try {
      addLog('🔄 Starting MediaPipe initialization...');
      
      addLog('Loading FilesetResolver...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      addLog('✅ FilesetResolver loaded successfully');

      addLog('Creating PoseLandmarker...');
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.3,
        minPosePresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
        outputSegmentationMasks: false
      });
      addLog('✅ PoseLandmarker created successfully');
      
      return landmarker;
    } catch (err: any) {
      addLog(`❌ MediaPipe initialization failed: ${err.message}`);
      console.error('Full error:', err);
      throw err;
    }
  };

  // Step 2: Start webcam
  const startWebcam = async () => {
    try {
      addLog('🔄 Requesting webcam access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      
      addLog(`✅ Webcam access granted`);
      addLog(`Video tracks: ${stream.getVideoTracks().length}`);
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      addLog(`Video settings: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`);
      
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          videoRef.current!.onloadeddata = () => {
            addLog(`✅ Video loaded: ${videoRef.current!.videoWidth}x${videoRef.current!.videoHeight}`);
            resolve();
          };
        });
      }
      
      return stream;
    } catch (err: any) {
      addLog(`❌ Webcam access failed: ${err.message}`);
      console.error('Full error:', err);
      throw err;
    }
  };

  // Step 3: Run detection loop
  const startDetection = (landmarker: PoseLandmarker) => {
    addLog('🔄 Starting detection loop...');
    let detectionCount = 0;
    let lastLogTime = Date.now();

    const detect = () => {
      if (!videoRef.current || !canvasRef.current || !landmarker) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Check video ready state
      if (video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      // Set canvas size
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        addLog(`Canvas resized to ${canvas.width}x${canvas.height}`);
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw frame counter
      ctx.fillStyle = '#00FF00';
      ctx.font = '20px monospace';
      ctx.fillText(`Frame: ${detectionCount}`, 10, 30);

      try {
        // Run detection
        const startTime = performance.now();
        const results = landmarker.detectForVideo(video, startTime);
        const detectionTime = performance.now() - startTime;

        detectionCount++;
        setFrameCount(detectionCount);

        // Log every second
        if (Date.now() - lastLogTime > 1000) {
          addLog(`Detection #${detectionCount}: ${detectionTime.toFixed(2)}ms, ${results.landmarks?.length || 0} poses`);
          lastLogTime = Date.now();
        }

        // Draw results
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // Draw simple dots for each landmark
          ctx.fillStyle = '#FF0000';
          landmarks.forEach((landmark, idx) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Label first few landmarks
            if (idx < 5) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(`${idx}`, x + 8, y + 8);
              ctx.fillStyle = '#FF0000';
            }
          });
          
          // Draw success message
          ctx.fillStyle = '#00FF00';
          ctx.font = 'bold 24px Arial';
          ctx.fillText(`✅ POSE DETECTED (${landmarks.length} points)`, 10, 70);
        } else {
          // No pose detected
          ctx.fillStyle = '#FF0000';
          ctx.font = 'bold 24px Arial';
          ctx.fillText('❌ NO POSE DETECTED', 10, 70);
        }

      } catch (err: any) {
        addLog(`❌ Detection error: ${err.message}`);
        console.error('Full error:', err);
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  // Full test sequence
  const runFullTest = async () => {
    setLogs([]);
    setFrameCount(0);
    addLog('🚀 Starting full MediaPipe test...');
    
    try {
      // Step 1: Initialize MediaPipe
      const landmarker = await initializeMediaPipe();
      
      // Step 2: Start webcam
      await startWebcam();
      
      // Step 3: Start detection
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for video to stabilize
      startDetection(landmarker);
      
      addLog('✅ All systems operational!');
    } catch (err: any) {
      addLog(`❌ Test failed: ${err.message}`);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setLogs([]);
    setFrameCount(0);
    setVideoStream(null);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>MediaPipe Diagnostic Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runFullTest}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Run Full Test
        </button>
        <button 
          onClick={cleanup}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Stop & Reset
        </button>
        <span style={{ marginLeft: '20px', fontSize: '18px', fontWeight: 'bold' }}>
          Frames Processed: {frameCount}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Video/Canvas section */}
        <div>
          <h3>Camera Feed & Detection</h3>
          <div style={{ position: 'relative', border: '2px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ display: 'block', width: '640px', transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'scaleX(-1)',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        {/* Logs section */}
        <div style={{ flex: 1 }}>
          <h3>System Logs</h3>
          <div 
            style={{
              backgroundColor: '#1e1e1e',
              color: '#00ff00',
              padding: '10px',
              borderRadius: '4px',
              height: '500px',
              overflowY: 'auto',
              fontSize: '12px',
              lineHeight: '1.4'
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#888' }}>Click "Run Full Test" to start diagnostics...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3>System Information</h3>
        <ul>
          <li><strong>Browser:</strong> {navigator.userAgent}</li>
          <li><strong>Platform:</strong> {navigator.platform}</li>
          <li><strong>MediaPipe Package:</strong> @mediapipe/tasks-vision@0.10.22-rc.20250304</li>
          <li><strong>Model:</strong> pose_landmarker_lite (Float16)</li>
          <li><strong>Delegate:</strong> CPU</li>
        </ul>
      </div>
    </div>
  );
}
