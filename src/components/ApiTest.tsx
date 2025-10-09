import { useState } from 'react';

/**
 * Example component showing how to call the backend API
 * Add this to any page to test the server connection
 */
export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [echoResult, setEchoResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      console.log('✅ Health check:', data);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      setHealthStatus({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testEcho = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello from frontend!',
          timestamp: new Date().toISOString()
        })
      });
      const data = await response.json();
      setEchoResult(data);
      console.log('✅ Echo test:', data);
    } catch (error) {
      console.error('❌ Echo test failed:', error);
      setEchoResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ccc', 
      borderRadius: '8px',
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔌 API Connection Test</h3>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Test the backend server connection (requires <code>npm run dev:all</code>)
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testHealth}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Health Check
        </button>

        <button 
          onClick={testEcho}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Echo POST
        </button>
      </div>

      {loading && <p>⏳ Loading...</p>}

      {healthStatus && (
        <div style={{ 
          marginBottom: '10px', 
          padding: '10px', 
          backgroundColor: 'white', 
          borderRadius: '4px' 
        }}>
          <strong>Health Status:</strong>
          <pre style={{ 
            fontSize: '12px', 
            overflow: 'auto',
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        </div>
      )}

      {echoResult && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'white', 
          borderRadius: '4px' 
        }}>
          <strong>Echo Result:</strong>
          <pre style={{ 
            fontSize: '12px', 
            overflow: 'auto',
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(echoResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
