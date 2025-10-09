import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Echo test route
app.post('/api/echo', (req, res) => {
  res.json({ 
    success: true, 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Example user info route (placeholder for auth integration)
app.get('/api/user-info', (_req, res) => {
  // In production, verify Firebase token and return real user data
  res.json({ 
    uid: 'dev-user-123', 
    name: 'Dev User',
    email: 'dev@example.com',
    message: 'This is a dev placeholder. Integrate Firebase Admin SDK for production.'
  });
});

// Example rehab session save endpoint
app.post('/api/rehab/session', (req, res) => {
  const { userId, exercise, reps, angles, duration } = req.body;
  
  console.log('📊 Rehab session data received:', {
    userId,
    exercise,
    reps,
    duration
  });
  
  // In production: save to Firestore
  res.json({
    success: true,
    sessionId: `session-${Date.now()}`,
    message: 'Session saved successfully'
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Dev API server running on http://localhost:${PORT}`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
  console.log(`   - Echo test: POST http://localhost:${PORT}/api/echo`);
});
