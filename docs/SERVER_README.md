# Backend Server Setup

## What Got Added

1. **Express server** (`server/index.ts`) - Node.js backend running on port 4000
2. **Vite proxy** - Routes `/api/*` requests from frontend to backend
3. **New scripts** in package.json:
   - `npm run dev` - Frontend only (Vite on port 5173)
   - `npm run dev:server` - Backend only (Express on port 4000)
   - `npm run dev:all` - Both servers simultaneously

## How to Use

### Start Both Servers
```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

### Test the API

**Health Check:**
```bash
curl http://localhost:4000/api/health
```

**From Frontend:**
```typescript
// No need for full URL - Vite proxy handles it
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log(data));
```

## Available Endpoints

- `GET /api/health` - Server health check
- `POST /api/echo` - Echo back request body
- `GET /api/user-info` - Placeholder user info
- `POST /api/rehab/session` - Save rehab session data

## How It Works

1. **Vite Proxy** (vite.config.ts):
   - Intercepts `/api/*` requests from frontend
   - Forwards to `http://localhost:4000`
   - Avoids CORS issues
   - Maintains same-origin for Firebase Auth

2. **Express Server** (server/index.ts):
   - Listens on port 4000
   - Handles API routes
   - Can integrate Firebase Admin SDK
   - Can connect to database

## Next Steps

### Add Firebase Admin
```bash
npm install firebase-admin
```

Then in server/index.ts:
```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Verify Firebase tokens
app.use('/api/*', async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (token) {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
  }
  next();
});
```

### Save Rehab Sessions
```typescript
// Example: save to Firestore from backend
app.post('/api/rehab/session', async (req, res) => {
  const { userId, exercise, reps, angles, duration } = req.body;
  
  await admin.firestore().collection('sessions').add({
    userId,
    exercise,
    reps,
    angles,
    duration,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  
  res.json({ success: true });
});
```

## Why Use Backend Server?

- **Server-side validation** - Verify data before saving
- **Firebase Admin** - Access Firestore/Auth with admin privileges
- **Third-party APIs** - Call external services without exposing keys
- **Complex logic** - Heavy processing on server
- **WebSockets** - Real-time features
- **File uploads** - Handle large files server-side

## Notes

- Firebase Auth persistence still works (client-side, localStorage)
- Keep same origin (localhost:5173) for auth to persist
- Use `/api` prefix for all backend routes
- Backend auto-restarts on code changes (ts-node-dev)
- CORS enabled for development

## Troubleshooting

**Port 4000 already in use:**
```bash
# Find and kill process
lsof -ti:4000 | xargs kill -9
```

**Hot reload not working:**
```bash
# Restart dev server
npm run dev:all
```

**Can't reach /api from frontend:**
- Check Vite proxy config in vite.config.ts
- Ensure backend is running (npm run dev:server)
- Check browser Network tab for errors
