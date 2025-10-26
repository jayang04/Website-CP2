# Complete Feature Guide - RehabMotion Platform

**Last Updated**: October 26, 2025  
**Version**: 2.0

This comprehensive guide documents all major features, updates, and implementations in the RehabMotion rehabilitation platform.

---

## Table of Contents

1. [Personalized Plan Features](#personalized-plan-features)
2. [Dashboard Features](#dashboard-features)
3. [Cloud Storage & Data Management](#cloud-storage--data-management)
4. [Video & Media Features](#video--media-features)
5. [UI/UX Improvements](#uiux-improvements)
6. [Progress Tracking](#progress-tracking)
7. [Technical Implementation](#technical-implementation)

---

## Personalized Plan Features

### Overview
The personalized plan system generates custom rehabilitation programs based on user intake data, including injury type, fitness level, pain level, and recovery goals.

### Key Features

#### 1. Smart Intake Form
**Location**: `src/components/SmartIntakeForm.tsx`

- **Quick Start Mode**: Select injury and go (auto-generates plan)
- **Detailed Setup**: Full customization of all parameters
- **Update Mode**: Pre-populates existing data when updating plan
- **Auto-Inference**: Intelligently suggests goals, schedule, and fitness level

**Collected Data**:
- Injury type (ACL, MCL, Meniscus, Ankle Sprains)
- Injury date (when it happened)
- Current pain level (0-10 scale)
- Fitness level (Beginner/Intermediate/Advanced)
- Age
- Recovery goals
- Available days per week
- Preferred session duration

#### 2. Plan Generation
**Location**: `src/services/rehabRecommendationEngine.ts`

The engine automatically:
- Determines rehab phase (Acute → Subacute → Strengthening → Return to Sport → Maintenance)
- Calculates current week based on injury date
- Selects appropriate exercises for phase and fitness level
- Adjusts difficulty based on user profile
- Generates motivational messages
- Sets next milestone
- Creates warnings if needed

**Phase Determination**:
- Acute: 0-2 weeks post-injury
- Subacute: 2-6 weeks post-injury
- Strengthening: 6-12 weeks post-injury
- Return to Sport: 12+ weeks post-injury
- Maintenance: Ongoing prevention

#### 3. Exercise Display
**Location**: `src/components/PersonalizedPlanView.tsx`

Each exercise card includes:
- 💪 Exercise emoji and difficulty badge
- Exercise name
- Video demo (or "Demo Coming Soon" placeholder)
- Exercise reasoning/purpose
- Sets, reps, hold time, rest time
- Expected pain level warning
- Three action buttons:
  - ℹ️ **Need Help**: Opens detailed modal
  - **Mark as Complete**: Tracks completion
  - 📐 **Live Form Tracker**: AI-powered form analysis

#### 4. Exercise Completion Tracking
- Persists to Firestore (`completions/{userId}/{date}`)
- Automatically resets at midnight each day
- Updates dashboard instantly on completion
- Logs activity to Recent Activity feed
- Updates exercise completion stats

#### 5. Exercise Details Modal
Shows when user clicks "Need Help":
- Complete exercise specifications
- Why this exercise is included
- Tips & modifications
- Expected discomfort level
- Key safety tips
- Quick complete button

#### 6. Live Form Tracker
**Location**: `src/components/ExerciseAngleTracker.tsx`

For supported exercises (Heel Slide, Quad Set, etc.):
- Opens full-screen camera view
- Real-time pose detection via MediaPipe
- Angle measurement and feedback
- Rep counting
- Form quality assessment
- Completion tracking

#### 7. Update & Reset
- **Update Plan**: Opens intake form with existing data pre-filled
- **Regenerate Plan**: Creates new plan with same data
- **Reset Plan** (Testing): Clears all data and state

---

## Dashboard Features

### Layout
**Location**: `src/App.tsx` - DashboardPage component

Grid layout with three main sections:
1. **Motivational Card** (full width)
2. **Progress Stats** (left column)
3. **Recent Activity** (right column)
4. **Personalized Plan** (full width below)

### 1. Motivational Card
- Personalized greeting with user's first name
- Dynamic encouragement messages
- High contrast white text on gradient background

### 2. Progress Stats
Real-time statistics:
- 🎯 **Exercises Completed** (lifetime)
- 🔥 **Current Streak** (consecutive days)
- 📈 **Weekly Goals** (completion rate)
- ⏱️ **Total Time** (accumulated minutes)

Data stored in Firestore: `dashboardData/{userId}/stats`

### 3. Recent Activity Feed
- Scrollable activity log (max height with custom scrollbar)
- Timestamped activities with icons
- Types of activities:
  - ✅ Exercise completions
  - 🎯 Milestone achievements
  - 📝 Plan updates
  - 🔥 Streak notifications

Data stored in Firestore: `dashboardData/{userId}/activities`

### 4. Instant Sync
- Dashboard refreshes immediately after exercise completion
- Uses `dashboardRefreshKey` state to trigger re-render
- No manual refresh needed

---

## Cloud Storage & Data Management

### Firebase Firestore Integration
**Location**: `src/services/cloudDataService.ts`

### Data Structure

```
users/{userId}/
  ├── dashboardData/
  │   ├── stats: {
  │   │   exercisesCompleted: number
  │   │   currentStreak: number
  │   │   weeklyGoals: number
  │   │   totalMinutes: number
  │   │ }
  │   └── activities: [{
  │       type: string
  │       title: string
  │       timestamp: Date
  │       icon: string
  │     }]
  │
  ├── completions/{date}/
  │   └── exercises: string[]
  │
  └── programMetadata/
      └── startDate: Date
```

### Migration from localStorage
Automatic migration runs on first load:
- Detects localStorage data
- Migrates to Firestore
- Keeps localStorage as backup
- Logs migration process

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Video & Media Features

### Exercise Videos
**Location**: `/public/exercise-demo-videos/`

Organized by injury type:
- ACL/
- MCL/
- Meniscus Tear/
- Lateral Ankle Sprain/
- Medial Ankle Sprain/
- High Ankle Sprain/

### Video Integration
**Location**: `src/components/PersonalizedPlanView.tsx` & `src/pages/InjuryRehabProgram.tsx`

#### Video Mapping
Comprehensive mapping with 80+ exercise variations:
- Exact name matching
- Case-insensitive matching
- Partial/substring matching
- Fallback to "Demo Coming Soon" placeholder

Example mappings:
```javascript
'Quad Set': '/exercise-demo-videos/ACL/Quad Set.mp4'
'Short Arc Quad Activation': '/exercise-demo-videos/ACL/Short Arc Quad.mp4'
'Balance Exercises': '/exercise-demo-videos/Medial Ankle Sprain/Single-Leg Balance.mp4'
```

#### Auto-Pause Feature
**Implementation**: Video registration system

```typescript
const videoRefs = useRef<Map<HTMLVideoElement, () => void>>(new Map());

// Pause all videos except current
const pauseAllVideosExcept = (currentVideo: HTMLVideoElement) => {
  videoRefs.current.forEach((_, video) => {
    if (video !== currentVideo && !video.paused) {
      video.pause();
    }
  });
};
```

**Features**:
- Only one video plays at a time
- Automatic pause of other videos when new one starts
- Works across all exercise cards
- Proper cleanup on component unmount

---

## UI/UX Improvements

### 1. Consistent Design System
Both `PersonalizedPlanView` and `InjuryRehabProgram` share:
- Same card layout and styling
- Identical button designs
- Matching color schemes
- Consistent spacing and typography

### 2. Layout Improvements
**Changes Made**:
- Increased content width for better readability
- Improved padding and margins
- Larger icons (1.5em)
- Better visual hierarchy

### 3. Text Readability
**Motivational Card**:
- Forced white text color (`color: white !important`)
- Strong text shadow for contrast
- Works on all gradient backgrounds

**Warning Messages**:
- Amber background (#fff3cd)
- Dark text (#856404)
- Clear icon and formatting

### 4. Responsive Design
- Grid layouts adapt to screen size
- Mobile-friendly touch targets
- Scrollable sections with custom scrollbars

### 5. Custom Scrollbar
```css
.recent-activity-list::-webkit-scrollbar {
  width: 8px;
}
.recent-activity-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.recent-activity-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
```

---

## Progress Tracking

### Daily Completions
**Storage**: Firestore `completions/{userId}/{date}`

- Tracks which exercises completed each day
- Automatically resets at midnight
- Used for streak calculations
- Synced across devices

### Week Progression
**Location**: `src/services/cloudDataService.ts` - `getProgramStartDate()`

- Program start date stored in Firestore
- Week number calculated from days since start
- Used to adjust exercise difficulty
- Phases progress automatically

### Statistics Calculation
**Location**: `src/services/cloudDataService.ts` - `cloudDashboardService`

Real-time updates:
- **Exercises Completed**: Increments on each completion
- **Current Streak**: Consecutive days with at least one exercise
- **Weekly Goals**: Percentage of planned sessions completed
- **Total Minutes**: Accumulated from exercise durations

### Activity Logging
Automatic logging for:
- Exercise completions
- Milestone achievements (first exercise, 10th exercise, etc.)
- Week progressions
- Plan updates

---

## Technical Implementation

### State Management
**Location**: `src/App.tsx`

Key state variables:
```typescript
const [currentPage, setCurrentPage] = useState<Page>()
const [user, setUser] = useState<User | null>(null)
const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null)
const [intakeData, setIntakeData] = useState<any>(null)
const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0)
```

### Page Persistence
Saves current page to localStorage:
```typescript
useEffect(() => {
  localStorage.setItem('rehabmotion_current_page', currentPage);
}, [currentPage]);
```

Protection logic prevents unwanted redirects:
- Checks if user is authenticated
- Uses ref to track initial auth completion
- Adds delay before protection kicks in
- Only redirects unauthenticated users from protected pages

### Data Flow

1. **User completes intake form** → Saves to localStorage & generates plan
2. **User marks exercise complete** → Updates Firestore completions & dashboard
3. **Dashboard refreshes** → Reads from Firestore, falls back to localStorage
4. **Midnight passes** → Completions reset (checked every minute)
5. **Week progresses** → Plan difficulty adjusts automatically

### Performance Optimizations
- Lazy loading of cloud services
- Batch Firestore writes where possible
- Local state updates before async operations
- Fallback to localStorage if Firestore fails

### Error Handling
- Try-catch blocks around all Firestore operations
- Console logging for debugging
- Graceful degradation to localStorage
- User-friendly error messages

---

## Testing Utilities

### Reset Plan Button
**Location**: Dashboard - next to "Update Plan" button

**Purpose**: Temporary testing utility (remove before production)

**Functionality**:
- Clears user-specific localStorage keys
- Resets React state (plan, intake data, completion status)
- Triggers dashboard refresh
- Shows confirmation dialog

**Implementation**:
```typescript
const handleResetPlan = () => {
  localStorage.removeItem(`intake_data_${user.uid}`);
  localStorage.removeItem(`intake_skipped_${user.uid}`);
  setPersonalizedPlan(null);
  setIntakeData(null);
  setHasCompletedIntake(false);
  refreshDashboard();
};
```

---

## File Structure

### Components
```
src/components/
├── ExerciseAngleTracker.tsx      # Live form tracking with pose detection
├── PersonalizedPlanView.tsx      # Personalized plan display & management
├── PoseDetector.tsx              # Core pose detection logic
└── SmartIntakeForm.tsx           # Intake form with quick/detailed modes
```

### Pages
```
src/pages/
├── InjuryRehabProgram.tsx        # Pre-built injury programs
├── InjurySelection.tsx           # Injury type selection
├── PoseTest.tsx                  # Pose detection testing
├── RehabExercise.tsx             # Individual exercise tracker
└── RehabProgram.tsx              # Program overview
```

### Services
```
src/services/
├── cloudDataService.ts           # Firestore operations & migration
├── dataService.ts                # localStorage operations (legacy)
├── personalizationService.ts    # Integration with recommendation engine
└── rehabRecommendationEngine.ts # AI-powered plan generation
```

### Styles
```
src/styles/
├── AngleDetector.css             # Live form tracker styles
├── InjuryRehabProgram.css        # Pre-built program styles
├── PersonalizedPlan.css          # Personalized plan styles
└── SmartIntakeForm.css           # Intake form styles
```

---

## Known Issues & Limitations

### Current Limitations
1. Some exercises don't have video demos yet (show "Demo Coming Soon")
2. Angle detection only supports specific exercises
3. Reset Plan button is temporary (remove before production)

### Future Improvements
1. Add more exercise videos
2. Expand angle detection to more exercises
3. Add video playback controls (speed, quality)
4. Implement video progress tracking
5. Add accessibility features (captions, audio descriptions)
6. Create admin interface for video management
7. Add social features (share progress, connect with others)

---

## Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md) - Setup and development instructions
- [Firebase Setup](./FIREBASE_FIRESTORE_SETUP.md) - Firestore configuration
- [Exercise Media Guide](./EXERCISE_MEDIA_GUIDE.md) - Video management
- [Server README](./SERVER_README.md) - Backend server documentation

---

## Change Log

### October 26, 2025
- ✅ Fixed reset plan button (now clears correct localStorage keys and state)
- ✅ Fixed "When did it happen" dropdown (now changeable)
- ✅ Enhanced video auto-pause functionality
- ✅ Expanded exercise video mapping (80+ variations)
- ✅ Added update mode to intake form (pre-populates data)

### October 25, 2025
- ✅ Migrated from localStorage to Firestore
- ✅ Implemented instant dashboard sync
- ✅ Added page persistence
- ✅ Fixed duplicate activity notifications
- ✅ Improved text readability and layout

### Earlier Updates
- ✅ Created personalized plan system
- ✅ Built smart intake form
- ✅ Implemented exercise completion tracking
- ✅ Added live form tracker
- ✅ Created dashboard with statistics

---

**End of Complete Feature Guide**
