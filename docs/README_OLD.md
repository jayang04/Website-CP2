# 📚 RehabMotion - Complete Documentation

**Last Updated:** October 18, 2025

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [User Guide](#user-guide)
5. [Developer Guide](#developer-guide)
6. [Clinical Content](#clinical-content)
7. [UI/UX Design](#uiux-design)
8. [Backend Setup](#backend-setup)
9. [Changelog](#changelog)
10. [Troubleshooting](#troubleshooting)

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
1. Clone the repository
2. Run `npm install`
3. Start dev server with `npm run dev`
4. Navigate to Dashboard → "Start Rehab Program" → Select your injury

---

## 📋 Features

### 🎯 Core Features
- **6 Injury-Specific Rehabilitation Programs**
  - ACL Tear (4 phases, 24+ weeks)
  - MCL Tear (3 phases, 12+ weeks)
  - Meniscus Tear (4 phases, 12+ weeks)
  - Lateral Ankle Sprain (3 phases, 8+ weeks)
  - Medial Ankle Sprain (3 phases, 8+ weeks)
  - High Ankle Sprain (4 phases, 12+ weeks)

- **Phase-Based Exercise Progression** - 3-4 phases per injury with clinical guidelines
- **Exercise Demonstration Support** - Videos and images for each exercise (add your own media)
- **Real-time Pose Detection** - MediaPipe integration for angle measurements
- **Per-User Progress Tracking** - localStorage-based progress and completion tracking
- **Pain Level Monitoring** - Log and track pain levels during rehabilitation
- **Clinical Guidelines** - Do's, Don'ts, and red flags for each injury

### 🎥 Pose Detection
- Real-time knee and ankle angle measurements
- Live webcam feed with skeleton overlay
- Zoom and mirror controls
- Landmark smoothing for accuracy

---

## 🎯 Project Structure

```
Website-CP2/
├── src/
│   ├── components/
│   │   ├── PoseDetector.tsx          # MediaPipe pose detection
│   │   └── ApiTest.tsx               # Backend API testing
│   ├── pages/
│   │   ├── InjurySelection.tsx       # Injury picker interface
│   │   ├── InjuryRehabProgram.tsx    # Main rehab program UI
│   │   ├── RehabExercise.tsx         # Exercise tracker with pose detection
│   │   └── PoseTest.tsx              # Pose detection test page
│   ├── types/
│   │   ├── injuries.ts               # Injury & rehab type definitions
│   │   ├── rehab.ts                  # Exercise types
│   │   └── dashboard.ts              # Dashboard types
│   ├── data/
│   │   └── injuryPlans.ts            # All 6 injury rehabilitation plans
│   ├── services/
│   │   └── dataService.ts            # localStorage management & CRUD
│   ├── styles/
│   │   ├── InjurySelection.css       # Injury selection styles
│   │   └── InjuryRehabProgram.css    # Main rehab interface styles
│   ├── utils/
│   │   └── angleCalculations.ts      # Joint angle calculations
│   ├── firebase/
│   │   ├── config.ts                 # Firebase configuration
│   │   └── auth.ts                   # Authentication service
│   └── App.tsx                       # Main app with routing
├── server/                            # Optional Express backend
├── docs/                              # Documentation
└── public/                            # Static assets
```

---

## 👤 User Guide

### How to Access the Injury System

#### Step 1: Navigate to Dashboard
- Click **"Dashboard"** in the navigation bar
- You'll see your stats and quick actions

#### Step 2: Start a Rehab Program
- Click **"Start Rehab Program"** button in the Quick Actions section
- Or navigate directly to `/rehab-programs`

#### Step 3: Select Your Injury
You'll see injuries grouped by category:

**Knee Injuries:**
- 🦵 ACL Tear - Complete tear of anterior cruciate ligament
- 🦵 MCL Tear - Medial collateral ligament injury
- 🦵 Meniscus Tear - Cartilage tear in the knee

**Ankle Injuries:**
- 🦶 Lateral Ankle Sprain - Outside ankle ligament damage
- 🦶 Medial Ankle Sprain - Inside ankle ligament damage
- 🦶 High Ankle Sprain - Syndesmotic ligament injury

#### Step 4: Follow Your Rehab Plan
- View phase-based exercises
- Track your progress
- Log pain levels
- Complete exercises as prescribed

### Navigation Tips
- **Back to Dashboard:** Use the "← Back to Dashboard" button
- **Phase Navigation:** Use the left sidebar to switch between phases
- **Exercise Completion:** Click "Mark as Complete" on each exercise
- **Pain Logging:** Use the right sidebar "Log Pain Level" section

---

## 💻 Developer Guide

### Common Tasks

#### 1. Add a New Injury

**Step 1:** Define injury type in `src/types/injuries.ts`:
```typescript
export type InjuryType = 
  | 'acl-tear'
  | 'mcl-tear'
  | 'your-new-injury'; // Add here
```

**Step 2:** Create rehab plan in `src/data/injuryPlans.ts`:
```typescript
const yourNewInjuryPlan: InjuryRehabPlan = {
  injuryInfo: {
    id: 'your-new-injury',
    name: 'Your New Injury',
    icon: '🦴',
    description: 'Brief description...',
    category: 'knee' // or 'ankle'
  },
  phases: [
    {
      phase: 1,
      name: 'Initial Phase',
      duration: 'Week 1-4',
      exercises: [ /* exercises array */ ],
      goals: [ /* goals array */ ],
      precautions: [ /* precautions array */ ]
    }
  ],
  totalWeeks: 12,
  dosList: [ /* do's array */ ],
  dontsList: [ /* don'ts array */ ],
  whenToSeeDoctor: [ /* red flags array */ ]
};

// Add to exports
export const injuryPlans: Record<InjuryType, InjuryRehabPlan> = {
  // ...existing
  'your-new-injury': yourNewInjuryPlan
};
```

#### 2. Add an Exercise to a Phase

Edit the `exercises` array in `src/data/injuryPlans.ts`:
```typescript
exercises: [
  {
    id: 'unique-exercise-id',
    name: 'Exercise Name',
    description: 'How to perform the exercise...',
    image: '🏋️', // Emoji icon
    sets: 3,
    reps: '10-15',
    hold: '30 seconds', // optional
    difficulty: 'beginner', // or 'intermediate' or 'advanced'
    requiredEquipment: ['None'], // optional
    painThreshold: 'Stop if pain > 3/10',
    // Add demo video or images
    media: {
      videoUrl: '/exercise-videos/knee/exercise-name.mp4', // option 1
      // OR
      images: [ // option 2
        '/exercise-images/knee/exercise-step1.jpg',
        '/exercise-images/knee/exercise-step2.jpg'
      ],
      thumbnail: '/thumbnails/exercise-thumb.jpg' // optional
    }
  }
]
```

**📹 See [Exercise Media Guide](./docs/EXERCISE_MEDIA_GUIDE.md) for detailed instructions on adding videos/images**

#### 3. Modify User Progress Logic

Key methods in `src/services/dataService.ts`:
```typescript
// Start new rehab plan
injuryRehabService.setInjuryPlan(userId, injuryType)

// Get user's progress
injuryRehabService.getInjuryProgress(userId)

// Mark exercise complete
injuryRehabService.completeExercise(userId, exerciseId)

// Progress to next phase
injuryRehabService.progressToNextPhase(userId)

// Log pain level
injuryRehabService.updatePainLevel(userId, level, note)
```

**Storage Key Pattern:** `rehabmotion_injury_${userId}`

#### 4. Update Styling

**Global CSS Variables** (`src/index.css`):
```css
:root {
  --primary-color: #007bff;
  --primary-dark: #0056b3;
  --text-primary: #212529;
  --text-secondary: #6c757d;
}
```

**Component Styles:**
- Injury Selection: `src/styles/InjurySelection.css`
- Rehab Program: `src/styles/InjuryRehabProgram.css`

### Development Scripts

```bash
# Frontend only
npm run dev              # Port 5173

# Backend only
npm run dev:server       # Port 4000

# Both frontend + backend
npm run dev:all

# Production build
npm run build

# Preview production
npm run preview

# Lint code
npm run lint
```

### Testing Checklist

- [ ] Select each injury type
- [ ] Complete exercises in each phase
- [ ] Progress through phases
- [ ] Log pain levels
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test pose detection at `/#debug`

---

## 🏥 Clinical Content

### Complete Injury Plans

All 6 injuries include:
- **Phases:** 3-4 rehabilitation phases
- **Duration:** 8-24+ weeks total
- **Exercises:** 5-8 exercises per phase
- **Clinical Goals:** Specific objectives for each phase
- **Precautions:** What to avoid in each phase
- **Guidelines:** Do's and Don'ts
- **Red Flags:** When to see a doctor

### Exercise Details

Each exercise includes:
- **Name & Description:** Clear instructions
- **Sets & Reps:** Specific dosage
- **Difficulty Level:** Beginner, Intermediate, or Advanced
- **Equipment:** Required items (if any)
- **Pain Threshold:** Safe pain limits
- **Visual:** Emoji icon (video URL for future)

### Injury Categories

**Knee Injuries:**
1. **ACL Tear** - 4 phases, focus on stability and strength
2. **MCL Tear** - 3 phases, progressive loading
3. **Meniscus Tear** - 4 phases, gradual return to activity

**Ankle Injuries:**
4. **Lateral Ankle Sprain** - 3 phases, most common ankle injury
5. **Medial Ankle Sprain** - 3 phases, deltoid ligament focus
6. **High Ankle Sprain** - 4 phases, longer recovery needed

### Phase Progression

**Phase 1 (Early):**
- Pain & swelling management
- Restore range of motion
- Protect healing tissues

**Phase 2 (Middle):**
- Strengthen surrounding muscles
- Improve balance
- Restore function

**Phase 3 (Advanced):**
- Sport-specific training
- Advanced strengthening
- Return to activity prep

**Phase 4 (Return - if applicable):**
- Full function restoration
- Sport-specific drills
- Injury prevention

---

## 🎨 UI/UX Design

### Design System

**Color Palette:**
- Primary: `#007bff` → `#667eea` (blue to purple gradient)
- Success: `#4CAF50` → `#66bb6a` (green gradient)
- Warning: `#FF9800` → `#ffa726` (orange gradient)
- Danger: `#f44336` → `#e57373` (red gradient)

**Typography Scale:**
- Extra Large: 2.2-3rem (headers)
- Large: 1.6-2rem (section titles)
- Medium: 1.2-1.3rem (card titles)
- Base: 0.95-1rem (body text)
- Small: 0.9rem (labels)
- Tiny: 0.7-0.85rem (badges)

**Spacing:** 8px, 12px, 16px, 20px, 24px, 32px, 40px

**Border Radius:** 8-10px (small), 12-14px (medium), 16-20px (large)

**Shadows:** 
- Level 1: `0 2px 4px rgba(0,0,0,0.05)`
- Level 2: `0 4px 8px rgba(0,0,0,0.1)`
- Level 3: `0 4px 12px rgba(0,0,0,0.12)`
- Level 4: `0 8px 20px rgba(0,0,0,0.12)`

### Responsive Breakpoints

- **Large (1200px+):** 3-column layout, all sidebars visible
- **Medium (768-1199px):** 2-column, horizontal sidebars
- **Small (<768px):** Single column, stacked layout

### Component Styles

**Exercise Cards:**
- Equal height flex layout
- Gradient top border on hover
- Completed state with green accent
- Animated button hover effects

**Phase Navigation:**
- Active phase: gradient background
- Completed phases: green border
- Locked phases: grayed out
- Smooth hover transitions

**Progress Indicators:**
- Animated gradient progress bar
- Stat boxes with hover lift effect
- Real-time completion tracking

---

## 🔧 Backend Setup

### Optional Express Server

**Setup:**
```bash
# Already included in package.json
npm install

# Start server
npm run dev:server
```

**Server runs on:** `http://localhost:4000`

### API Endpoints

```
GET  /api/health              # Health check
GET  /api/users/:id           # Get user data
POST /api/users               # Create user
GET  /api/exercises           # List exercises
POST /api/exercises/complete  # Mark exercise complete
```

### Firebase Configuration

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add config to `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

---

## 📝 Changelog

### v1.3.0 (October 18, 2025)
**UI Improvements:**
- Enhanced exercise cards with modern gradients
- Animated progress bars with shimmer effects
- Improved stat boxes and phase navigation
- Better hover effects and visual feedback

### v1.2.0 (October 17, 2025)
**Fixed:**
- Exercise card alignment and equal heights
- Content overflow in rehab program
- Sidebar width constraints
- Text wrapping issues

### v1.1.0 (October 15-16, 2025)
**Fixed:**
- Injury selection page layout
- Grid consistency (3 columns)
- Category grouping
- Responsive design

### v1.0.0 (October 14, 2025)
**Initial Release:**
- 6 complete injury rehabilitation programs
- Dynamic per-user progress tracking
- Phase-based exercise progression
- Clinical guidelines and precautions
- Pain level monitoring
- Real-time pose detection

### Roadmap (Future)
- [ ] Video integration for exercises
- [ ] Dark mode support
- [ ] Progress charts and analytics
- [ ] Export/print rehab plans
- [ ] Therapist dashboard
- [ ] Mobile app

---

## 🐛 Troubleshooting

### Pose Detection Not Working
1. Try debug page: `http://localhost:5173/#debug`
2. Check camera permissions in browser
3. Ensure good lighting
4. Make sure full body is visible
5. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)

### Installation Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### localStorage Not Persisting
1. Check browser privacy settings
2. Ensure localStorage is enabled
3. Clear browser cache if needed
4. Check browser console for errors

### Exercises Not Saving
1. Verify userId is set correctly
2. Check browser console for errors
3. Ensure localStorage has space
4. Try different browser

### Performance Issues
1. Close unnecessary browser tabs
2. Use Chrome or Edge (best performance)
3. Disable browser extensions
4. Check system resources

---

## 📊 Tech Stack

**Frontend:**
- React 19 + TypeScript + Vite
- MediaPipe Pose Landmarker
- Custom CSS with modern design system

**State Management:**
- localStorage for persistence
- React hooks for UI state

**Backend (Optional):**
- Express + Node.js
- Firebase Auth & Firestore

**Pose Detection:**
- MediaPipe Tasks Vision
- Custom angle calculations

---

## 🚀 Deployment

### Frontend Only
```bash
npm run build
# Deploy /dist folder to Netlify, Vercel, etc.
```

### With Backend
```bash
# Build frontend
npm run build

# Deploy backend to Heroku, Railway, etc.
# Ensure environment variables are set
```

---

## 📄 License

Private project - All rights reserved

---

## 💡 Best Practices

### TypeScript
- Always define interfaces
- Use strict mode
- Avoid `any` type

### React
- Functional components + hooks
- Keep components focused
- Proper dependency arrays in useEffect

### State Management
- localStorage for persistence
- React state for UI
- Service layer for business logic

### CSS
- Use CSS variables
- Mobile-first design
- Consistent naming (BEM-style)

---

**Made with ❤️ for physiotherapy rehabilitation**

**Last Updated:** October 18, 2025
