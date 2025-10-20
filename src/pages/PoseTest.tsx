import PoseDetector, { type JointAngles } from '../components/PoseDetector';

// Simple test page for debugging pose detection
export default function PoseTestPage() {
  const handleAnglesUpdate = (angles: JointAngles) => {
    // You can add any debug logging here
    console.log('Angles updated:', angles);
  };

  return (
    <div style={{ padding: '80px 20px 20px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Pose Detection Debug Page</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Use this page to test and debug the pose detection system
      </p>
      
      <PoseDetector onAnglesUpdate={handleAnglesUpdate} />
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <h3>Debug Info:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ Check if skeleton tracks smoothly</li>
          <li>✅ Verify angle measurements are accurate</li>
          <li>✅ Test different lighting conditions</li>
          <li>✅ Try different distances from camera</li>
          <li>✅ Check console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
}
