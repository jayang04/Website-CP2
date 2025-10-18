# 📚 Documentat### 🏥 [Complete Rehab Plans](./COMPLETE_REHAB_PLANS.md)
Detailed rehabilitation plans for all 6 injuries:
- ACL Tear, MCL Tear, Meniscus Tear
- Lateral, Medial, and High Ankle Sprains
- Phase-by-phase breakdown with exercises

### 🎥 [Exercise Media Guide](./EXERCISE_MEDIA_GUIDE.md)
**How to add videos and images to exercises:**
- Video format requirements and best practices
- Image guidelines and organization
- Step-by-step instructions
- Complete examples with codeSupporting documentation for RehabMotion project.

## 📄 Available Documentation

### 📖 [Main README](../README.md)
**Complete project documentation** - Start here! Includes:
- Quick start guide
- Feature overview
- Developer guide (add injuries, exercises, modify progress)
- Clinical content details
- UI/UX design system
- Changelog and troubleshooting

### � [Complete Rehab Plans](./COMPLETE_REHAB_PLANS.md)
Detailed rehabilitation plans for all 6 injuries:
- ACL Tear, MCL Tear, Meniscus Tear
- Lateral, Medial, and High Ankle Sprains
- Phase-by-phase breakdown with exercises

### 🔧 [Backend Setup](./BACKEND_SETUP_COMPLETE.md)
Optional Express server setup:
- Installation guide
- API endpoints
- Configuration

### 🌐 [Server API Reference](./SERVER_README.md)
Backend API documentation:
- Endpoint details
- Request/response formats

### 🎨 [Logo Guide](./LOGO_GUIDE.md)
Branding and logo usage guidelines

---

## 🚀 Quick Navigation

**Need to:**
- **Get started?** → [Main README](../README.md#quick-start)
- **Add an injury?** → [Main README - Developer Guide](../README.md#developer-guide)
- **See rehab plans?** → [Complete Rehab Plans](./COMPLETE_REHAB_PLANS.md)
- **Setup backend?** → [Backend Setup](./BACKEND_SETUP_COMPLETE.md)

---

**All documentation consolidated into main README for easier access.**

## 🎯 Project Structure

```
Website-CP2/
├── src/
│   ├── components/
│   │   ├── PoseDetector.tsx      # Main pose detection component
│   │   ├── MediaPipeDebug.tsx    # Debug/testing component
│   │   └── ApiTest.tsx           # Backend API test component
│   ├── pages/
│   │   ├── RehabExercise.tsx     # Exercise tracking page
│   │   └── Debug.tsx             # Debug page
│   ├── utils/
│   │   └── angleCalculations.ts  # Joint angle math
│   ├── types/
│   │   └── rehab.ts              # TypeScript types
│   ├── firebase/
│   │   ├── config.ts             # Firebase configuration
│   │   └── auth.ts               # Auth service
│   └── App.tsx                   # Main app component
├── server/                        # Optional backend server
│   └── index.ts
├── docs/                          # Documentation
└── package.json
```

## 🔧 Development Scripts

```bash
# Frontend only (recommended)
npm run dev

# Backend only
npm run dev:server

# Both frontend + backend
npm run dev:all

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎥 How It Works

1. **Pose Detection:** MediaPipe analyzes webcam feed to detect 33 body landmarks
2. **Angle Calculation:** Uses landmark coordinates to calculate joint angles
3. **Real-time Feedback:** Updates UI with current angles and status
4. **Session Tracking:** Records exercise data (future: save to Firebase)

## 🌐 Pages

- **Home** (`/`) - Landing page
- **Dashboard** - User dashboard (requires login)
- **Exercises** - Rehabilitation exercise tracker
- **Debug** (`/#debug`) - MediaPipe diagnostic tool
- **Login/Signup** - Authentication pages

## 🔐 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add your config to `src/firebase/config.ts`

## 📱 Browser Support

- **Best:** Chrome, Edge (latest)
- **Good:** Firefox (latest)
- **Limited:** Safari (WASM support varies)

## 🐛 Troubleshooting

### Pose detection not working?
- Try the debug page: `http://localhost:5173/#debug`
- Check camera permissions
- Ensure good lighting and full body is visible
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)

### Installation errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend server errors?
- Make sure you ran `npm install` after adding backend
- Check if port 4000 is available
- See [Backend Setup Guide](./docs/BACKEND_SETUP_COMPLETE.md)

## 📄 License

Private project - All rights reserved

## 🤝 Contributing

This is a course project. Not accepting external contributions.

---

**Made with ❤️ for physiotherapy rehabilitation**
