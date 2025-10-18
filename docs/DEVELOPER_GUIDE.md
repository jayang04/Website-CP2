# 🚀 Developer Quick Reference

**Last Updated:** October 18, 2025

Quick reference guide for developers working on RehabMotion.

---

## 📂 Project Structure

```
Website-CP2/
├── src/
│   ├── components/          # Reusable components
│   │   ├── PoseDetector.tsx # MediaPipe pose detection
│   │   └── ApiTest.tsx      # Backend API testing
│   ├── pages/               # Route pages
│   │   ├── InjurySelection.tsx        # Injury picker
│   │   ├── InjuryRehabProgram.tsx     # Main rehab interface
│   │   ├── RehabExercise.tsx          # Exercise tracker
│   │   └── PoseTest.tsx               # Pose detection test
│   ├── types/               # TypeScript definitions
│   │   ├── injuries.ts      # Injury & rehab types
│   │   ├── rehab.ts         # Exercise types
│   │   └── dashboard.ts     # Dashboard types
│   ├── data/                # Static data
│   │   └── injuryPlans.ts   # All 6 injury rehab plans
│   ├── services/            # Business logic
│   │   └── dataService.ts   # Data management service
│   ├── styles/              # Component styles
│   │   ├── InjurySelection.css
│   │   └── InjuryRehabProgram.css
│   ├── utils/               # Utilities
│   │   └── angleCalculations.ts
│   └── firebase/            # Firebase config
│       ├── config.ts
│       └── auth.ts
├── docs/                    # Documentation
├── server/                  # Optional backend
└── public/                  # Static assets
```

---

## 🔑 Key Files

### Data Layer
- `src/data/injuryPlans.ts` - All 6 injury rehabilitation plans
- `src/services/dataService.ts` - localStorage management, CRUD operations
- `src/types/injuries.ts` - Type definitions for injuries & rehab

### UI Components
- `src/pages/InjurySelection.tsx` - Injury selection interface
- `src/pages/InjuryRehabProgram.tsx` - Main rehab program (phases, exercises)
- `src/components/PoseDetector.tsx` - Real-time pose detection

### Styling
- `src/styles/InjuryRehabProgram.css` - Main rehab interface styles
- `src/styles/InjurySelection.css` - Injury selection styles
- `src/index.css` - Global styles and CSS variables

---

## 🎯 Common Tasks

### Add a New Injury

1. **Define injury info** in `src/types/injuries.ts`:
```typescript
export type InjuryType = 
  | 'acl-tear'
  | 'your-new-injury'; // Add here
```

2. **Create rehab plan** in `src/data/injuryPlans.ts`:
```typescript
const yourNewInjuryPlan: InjuryRehabPlan = {
  injuryInfo: {
    id: 'your-new-injury',
    name: 'Your New Injury',
    icon: '🦴',
    description: 'Description...',
    category: 'knee' // or 'ankle'
  },
  phases: [ /* ... */ ],
  totalWeeks: 12,
  dosList: [ /* ... */ ],
  dontsList: [ /* ... */ ],
  whenToSeeDoctor: [ /* ... */ ]
};

// Add to exports
export const injuryPlans: Record<InjuryType, InjuryRehabPlan> = {
  // ...existing
  'your-new-injury': yourNewInjuryPlan
};
```

3. **Test it:**
   - Start dev server: `npm run dev`
   - Navigate to injury selection
   - Select your new injury

---

### Add a New Exercise to a Phase

Edit `src/data/injuryPlans.ts`:

```typescript
phases: [
  {
    phase: 1,
    name: 'Phase Name',
    duration: 'Week 1-4',
    exercises: [
      // ...existing exercises
      {
        id: 'new-exercise-unique-id',
        name: 'New Exercise',
        description: 'How to perform...',
        image: '🏋️',
        sets: 3,
        reps: '10-15',
        hold: '30 seconds', // optional
        difficulty: 'beginner',
        requiredEquipment: ['None'], // optional
        painThreshold: 'Stop if pain > 3/10',
        videoUrl: '' // optional, for future
      }
    ],
    goals: [ /* ... */ ],
    precautions: [ /* ... */ ]
  }
]
```

---

### Modify User Progress Logic

Edit `src/services/dataService.ts`:

```typescript
// Key methods:
- setInjuryPlan(userId, injuryType)     // Start new plan
- getInjuryProgress(userId)             // Get progress
- completeExercise(userId, exerciseId)  // Mark complete
- progressToNextPhase(userId)           // Advance phase
- updatePainLevel(userId, level, note)  // Log pain
```

**Storage Key:** `rehabmotion_injury_${userId}`

---

### Update Styling

#### Global Variables
Edit `src/index.css`:
```css
:root {
  --primary-color: #007bff;
  --text-primary: #212529;
  /* ... */
}
```

#### Component Styles
- Injury Selection: `src/styles/InjurySelection.css`
- Rehab Program: `src/styles/InjuryRehabProgram.css`

**Design System:**
- Border radius: 8-16px
- Spacing: 12-24px increments
- Shadow levels: 2px, 4px, 8px blur
- Transitions: 0.3s ease

---

### Add a New Page

1. **Create component** in `src/pages/YourPage.tsx`
2. **Add route** in `src/App.tsx`:
```typescript
<Route path="/your-route" element={<YourPage userId={userId} />} />
```
3. **Add navigation** (if needed) in navbar/dashboard

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Select each injury type
- [ ] Complete exercises in each phase
- [ ] Progress through phases
- [ ] Log pain levels
- [ ] Test on mobile viewport
- [ ] Test in different browsers

### Pose Detection Test
Navigate to: `http://localhost:5173/#debug`

---

## 🎨 CSS Architecture

### Naming Convention
- Component wrapper: `.injury-rehab-program`
- Sections: `.phase-content`, `.exercises-grid`
- Elements: `.exercise-card`, `.stat-box`
- Modifiers: `.completed`, `.active`, `.locked`

### Responsive Breakpoints
```css
/* Large: 1200px+ - 3 column layout */
/* Medium: 768-1199px - 2 column, collapsible sidebars */
/* Small: < 768px - single column, stacked */
```

---

## 📦 Dependencies

### Core
- `react` - UI library
- `typescript` - Type safety
- `vite` - Build tool

### Pose Detection
- `@mediapipe/tasks-vision` - Pose detection
- `@mediapipe/drawing_utils` - Skeleton rendering

### Backend (Optional)
- `express` - API server
- `firebase` - Auth & database

---

## 🔧 Scripts

```bash
# Development
npm run dev              # Start frontend (port 5173)
npm run dev:server       # Start backend (port 4000)
npm run dev:all          # Start both

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

---

## 🐛 Common Issues & Solutions

### Issue: MediaPipe not loading
**Solution:** Clear cache, hard refresh (Cmd+Shift+R)

### Issue: localStorage not persisting
**Solution:** Check browser privacy settings, ensure localStorage is enabled

### Issue: Pose detection laggy
**Solution:** Close other tabs, ensure good lighting, use Chrome/Edge

### Issue: Exercises not saving
**Solution:** Check browser console for errors, verify userId is set

---

## 📚 Key Documentation

| Need | Read This |
|------|-----------|
| **Architecture Overview** | [INJURY_SYSTEM_IMPLEMENTATION.md](./INJURY_SYSTEM_IMPLEMENTATION.md) |
| **All Rehab Plans** | [COMPLETE_REHAB_PLANS.md](./COMPLETE_REHAB_PLANS.md) |
| **Data Flow** | [DYNAMIC_DATA_GUIDE.md](./DYNAMIC_DATA_GUIDE.md) |
| **UI Changes** | [UI_IMPROVEMENTS_SUMMARY.md](./UI_IMPROVEMENTS_SUMMARY.md) |
| **Version History** | [CHANGELOG.md](./CHANGELOG.md) |

---

## 🔐 Environment Setup

### Required
1. Node.js 18+ installed
2. Git installed
3. Code editor (VS Code recommended)

### Optional (for Firebase)
1. Firebase project created
2. Config in `src/firebase/config.ts`
3. Authentication enabled

---

## 🚀 Deployment

### Frontend Only
```bash
npm run build
# Deploy /dist folder to:
# - Netlify, Vercel, GitHub Pages, etc.
```

### With Backend
```bash
# Build frontend
npm run build

# Deploy backend to:
# - Heroku, Railway, Render, etc.
# - Ensure port 4000 is available
```

---

## 💡 Best Practices

### TypeScript
- Always define interfaces for data structures
- Use strict mode
- Avoid `any` type

### React
- Use functional components + hooks
- Keep components small and focused
- Use proper dependency arrays in useEffect

### State Management
- localStorage for persistence
- React state for UI state
- Service layer for business logic

### CSS
- Use CSS variables for theming
- Mobile-first responsive design
- Consistent naming conventions

---

## 🆘 Getting Help

1. Check [INDEX.md](./INDEX.md) for relevant documentation
2. Search [CHANGELOG.md](./CHANGELOG.md) for similar issues
3. Review code comments in key files
4. Check browser console for errors

---

**Need more info?** See [Documentation Index](./INDEX.md)

**Found a bug?** Document it in [CHANGELOG.md](./CHANGELOG.md)

**Last Updated:** October 18, 2025
