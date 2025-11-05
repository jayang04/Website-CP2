# 📚 RehabMotion Platform - Quick Start

**Last Updated:** October 26, 2025

---

## 🎯 Documentation Navigation

**IMPORTANT**: Documentation has been consolidated for easier navigation!

### 📖 Main Documentation
- **[Complete Feature Guide](./COMPLETE_FEATURE_GUIDE.md)** - ALL features and updates in one place (NEW!)
- **[INDEX](./INDEX.md)** - Quick navigation to all docs
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Setup and development

### 📚 Technical Guides
- [Firebase Setup](./FIREBASE_FIRESTORE_SETUP.md) - Database configuration
- [Exercise Media Guide](./EXERCISE_MEDIA_GUIDE.md) - Video management
- [Angle Detection Guide](./ANGLE_DETECTION_GUIDE.md) - Pose detection
- [Server README](./SERVER_README.md) - Backend server

**Note**: 20+ individual update files have been consolidated into the Complete Feature Guide (29 → 10 files)

---

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### First Time Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up Firebase** (optional, falls back to localStorage):
   - Create Firebase project
   - Add config to `src/firebase/config.ts`
   - See [Firebase Setup Guide](./FIREBASE_FIRESTORE_SETUP.md)
4. **Run the dev server**: `npm run dev`
5. **Open in browser**: http://localhost:5173

---

## 💡 Key Features

### 1. Personalized Rehabilitation Plans
- Smart intake form with quick start and detailed modes
- AI-powered exercise selection based on injury and fitness level
- Automatic phase progression (Acute → Subacute → Strengthening → Return to Sport)
- Week-by-week adjustments

### 2. Exercise Tracking
- Video demonstrations for 80+ exercises
- Mark exercises as complete
- Live form tracker with AI pose detection
- Daily progress tracking with midnight reset

### 3. Dashboard & Analytics
- Real-time progress statistics
- Activity feed with instant sync
- Streak tracking
- Motivational messages

### 4. Cloud Storage
- Firestore integration for data persistence
- Automatic migration from localStorage
- Cross-device synchronization
- Secure user data storage

### 5. Pre-built Programs
- ACL Tear rehabilitation
- MCL Tear rehabilitation
- Meniscus Tear rehabilitation
- Lateral Ankle Sprain
- Medial Ankle Sprain
- High Ankle Sprain

---

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ExerciseAngleTracker.tsx    # Pose detection
│   ├── PersonalizedPlanView.tsx    # Plan display
│   └── SmartIntakeForm.tsx         # Intake form
├── pages/               # Page components
│   ├── InjuryRehabProgram.tsx      # Pre-built programs
│   └── RehabProgram.tsx            # Program overview
├── services/            # Business logic
│   ├── cloudDataService.ts         # Firestore operations
│   ├── personalizationService.ts   # Plan integration
│   └── rehabRecommendationEngine.ts # AI recommendations
├── data/                # Static data
│   ├── exerciseAngleConfig.ts      # Pose detection config
│   └── injuryPlans.ts              # Pre-built programs
└── firebase/            # Firebase config
    ├── auth.ts
    └── config.ts
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS Modules
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Pose Detection**: MediaPipe
- **Charts**: Recharts

---

## 📱 User Flow

1. **Sign up / Login** → Dashboard
2. **Complete intake form** → Generates personalized plan
3. **View exercises** → Watch videos, get instructions
4. **Mark complete** → Updates dashboard instantly
5. **Track progress** → See stats and activity feed
6. **Progress through weeks** → Difficulty auto-adjusts

---

## 🎯 Recent Updates (October 26, 2025)

✅ Fixed reset plan button (clears state correctly)  
✅ Fixed intake form dropdown (injury date now changeable)  
✅ Enhanced video auto-pause (only one plays at a time)  
✅ Expanded video mapping (80+ exercise variations)  
✅ Added update mode to intake form (pre-fills existing data)  
✅ Consolidated documentation (29 → 10 files)

See [Complete Feature Guide](./COMPLETE_FEATURE_GUIDE.md) for full changelog.

---

## 🔗 Quick Links

- [Complete Feature Guide](./COMPLETE_FEATURE_GUIDE.md) - Comprehensive documentation
- [Developer Guide](./DEVELOPER_GUIDE.md) - Setup and development
- [Firebase Setup](./FIREBASE_FIRESTORE_SETUP.md) - Database configuration
- [INDEX](./INDEX.md) - All documentation

---

## 📝 Contributing

1. Read the [Developer Guide](./DEVELOPER_GUIDE.md)
2. Check the [Complete Feature Guide](./COMPLETE_FEATURE_GUIDE.md) to understand current features
3. Follow the coding standards
4. Test thoroughly before submitting PRs

---

## 📄 License

MIT License - See LICENSE file for details

---

**Need help?** Check the [Complete Feature Guide](./COMPLETE_FEATURE_GUIDE.md) or [INDEX](./INDEX.md) for detailed documentation.
