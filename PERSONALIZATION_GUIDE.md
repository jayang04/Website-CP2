# Personalized Rehab Recommendation System - Usage Guide

## 🎯 What You Just Got

A complete **rule-based personalized recommendation system** that:

✅ **Adapts to each user** based on their injury, pain levels, and progress
✅ **Automatically adjusts difficulty** based on performance
✅ **Provides motivational feedback** and warnings
✅ **Tracks progress** through different rehab phases
✅ **Generates personalized weekly plans** with reasoning for each exercise

---

## 🚀 How to Use It

### **Step 1: Add to Your Dashboard**

In your `App.tsx` or dashboard page:

```typescript
import PersonalizedPlanView from './components/PersonalizedPlanView';
import { PersonalizationService } from './services/personalizationService';

// In your component:
const [injuryData] = useState({
  type: 'ACL', // Or get from user profile
  date: new Date('2024-10-01'),
  painLevel: 6,
  fitnessLevel: 'INTERMEDIATE',
  age: 28,
  goals: ['Reduce pain', 'Return to basketball', 'Improve strength'],
  limitations: ['No jumping yet'],
  sessionDuration: 25, // minutes
  availableDays: 4, // days per week
});

const [sessionHistory] = useState([
  {
    id: '1',
    date: new Date('2024-10-18'),
    exercises: ['heel-slide', 'quad-set'],
    completionRate: 85,
    prePainLevel: 6,
    postPainLevel: 5,
    effortLevel: 6,
    formQuality: 75,
    duration: 22
  },
  // ... more sessions
]);

// Render:
<PersonalizedPlanView
  userId="user123"
  injuryData={injuryData}
  sessionHistory={sessionHistory}
  onStartExercise={(exerciseId) => {
    // Navigate to exercise page or start tracker
    console.log('Starting:', exerciseId);
  }}
/>
```

---

### **Step 2: Track Sessions After Each Workout**

After user completes a workout:

```typescript
import { PersonalizationService } from './services/personalizationService';

// After completing exercise tracker:
PersonalizationService.trackSession({
  userId: 'user123',
  id: `session-${Date.now()}`,
  date: new Date(),
  exercises: ['heel-slide', 'bridges', 'mini-squats'],
  completionRate: 90, // From tracker
  prePainLevel: 5, // Ask before session
  postPainLevel: 4, // Ask after session  
  effortLevel: 7, // Ask after session (1-10)
  formQuality: 82, // From angle tracker
  duration: 25, // minutes
  notes: 'Felt good!'
}, (metrics) => {
  console.log('Updated metrics:', metrics);
  // Show achievement if streak increased, etc.
});
```

---

### **Step 3: Add Pain Tracking UI**

Add simple pain tracking before/after sessions:

```typescript
function PainTracker({ type, onSubmit }: { type: 'pre' | 'post', onSubmit: (level: number) => void }) {
  const [painLevel, setPainLevel] = useState(5);
  
  return (
    <div className="pain-tracker">
      <h3>{type === 'pre' ? '📊 How do you feel now?' : '📊 How do you feel after?'}</h3>
      <div className="pain-scale">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
          <button
            key={level}
            className={painLevel === level ? 'active' : ''}
            onClick={() => setPainLevel(level)}
          >
            {level}
          </button>
        ))}
      </div>
      <p>1 = No pain · 10 = Worst pain</p>
      <button onClick={() => onSubmit(painLevel)}>Continue</button>
    </div>
  );
}
```

---

## 🎨 Features You Get

### **1. Automatic Phase Detection**
- **ACUTE** (0-2 weeks, high pain): Gentle exercises only
- **SUBACUTE** (2-6 weeks): Range of motion focus
- **STRENGTHENING** (6-12 weeks): Building strength
- **RETURN TO SPORT** (12+ weeks): Sport-specific training
- **MAINTENANCE**: Injury prevention

### **2. Smart Difficulty Adjustment**
```
User completing 95%+ → INCREASE difficulty
User completing <60% → DECREASE difficulty
High pain (>6) → REDUCE intensity
```

### **3. Motivational Messages**
- Celebrating streaks: "🔥 7 day streak!"
- Progress milestones: "🎉 50% recovered!"
- Encouraging when struggling: "💪 Every rep counts!"

### **4. Personalized Exercise Selection**
Each exercise includes:
- **Sets, reps, hold times** adjusted to user level
- **Reasoning**: Why this exercise was selected
- **Modifications**: Tips to make it easier/harder
- **Expected pain level**: So users know what's normal

### **5. Progress Tracking**
- Pain trends (improving/stable/worsening)
- Form quality trends
- Consistency score
- Estimated recovery progress

---

## 📊 Example Plan Output

```typescript
{
  phase: "SUBACUTE",
  weekNumber: 4,
  sessionsPerWeek: 3,
  difficultyLevel: 5,
  focusAreas: ["Range of Motion", "Flexibility", "Light Strengthening"],
  motivationalMessage: "🚀 Fantastic! Your pain levels are improving - down 40%!",
  nextMilestone: "Achieve 80% completion rate to advance to strengthening",
  warnings: ["📅 Low consistency detected - try scheduling sessions in advance"],
  exercises: [
    {
      name: "Heel Slide",
      sets: 3,
      reps: 15,
      restTime: 45,
      difficulty: 4,
      reasoning: "Improves knee flexion range of motion. Selected for your current phase.",
      expectedPainLevel: "mild",
      modifications: ["Use towel to assist", "Stop before pain"]
    },
    // ... more exercises
  ]
}
```

---

## 🔧 How to Customize

### **Add More Injury Types**

In `rehabRecommendationEngine.ts`, add to `exerciseDatabase`:

```typescript
'Meniscus Tear': {
  'ACUTE': [/* exercises */],
  'SUBACUTE': [/* exercises */],
  // ...
}
```

### **Adjust Difficulty Rules**

In `calculateDifficultyAdjustment()`:

```typescript
// Make it more aggressive:
if (avgCompletion > 85 && avgPain < 3) return 'INCREASE';

// Make it more conservative:
if (avgCompletion > 95 && avgPain < 2) return 'INCREASE';
```

### **Change Phase Progression**

In `determineRehabPhase()`:

```typescript
// Faster progression:
if (weeksSinceInjury <= 4 || averagePainLevel > 4) return 'SUBACUTE';

// Slower/safer:
if (weeksSinceInjury <= 8 || averagePainLevel > 4) return 'SUBACUTE';
```

---

## 🎯 Next Steps to Enhance

### **Phase 1 (Immediate):**
1. ✅ Add PersonalizedPlanView to your dashboard
2. ✅ Add pain tracking before/after sessions
3. ✅ Connect to your exercise tracker
4. ✅ Save sessions to localStorage

### **Phase 2 (Week 2-3):**
1. 🔄 Add achievement system (badges for streaks, milestones)
2. 🔄 Add progress charts (pain over time, completion rate trends)
3. 🔄 Add weekly summaries
4. 🔄 Add push notification reminders

### **Phase 3 (Month 2):**
1. 🔄 Connect to backend database
2. 🔄 Add social features (share progress)
3. 🔄 Add expert content library
4. 🔄 Add predictive recovery timeline

---

## 📝 Example Integration Points

### **After Exercise Tracker Session:**
```typescript
// In ExerciseAngleTracker.tsx:
const handleStopTracking = () => {
  // ... existing code ...
  
  // Track session for personalization
  PersonalizationService.trackSession({
    userId: currentUser.id,
    exercises: [exerciseName],
    completionRate: (repState.currentRep / targetReps) * 100,
    formQuality: avgFormScore,
    duration: (Date.now() - sessionStartTime) / 1000 / 60
  });
};
```

### **On Dashboard Load:**
```typescript
useEffect(() => {
  // Generate fresh personalized plan
  const plan = PersonalizationService.generatePlan(
    userId,
    injuryData,
    sessionHistory
  );
  setWeeklyPlan(plan);
}, [userId, sessionHistory]);
```

---

## 🎉 What Makes This Special

✅ **No AI training needed** - Works from day 1
✅ **Fully explainable** - Users know WHY exercises were selected
✅ **Adaptive** - Adjusts based on real performance
✅ **Motivating** - Celebrates progress and encourages consistency
✅ **Safe** - Reduces difficulty if pain increases
✅ **Personalized** - Considers age, fitness level, goals, limitations

---

## 🚀 Ready to Launch!

You now have a complete personalized recommendation system that rivals commercial apps!

**Start by:**
1. Adding PersonalizedPlanView to your dashboard
2. Connecting pain tracking
3. Watching the magic happen! ✨

The system will automatically:
- Progress users through rehab phases
- Adjust difficulty based on performance
- Provide encouraging feedback
- Track recovery progress
- Generate weekly personalized plans

**No AI, no complexity - just smart, rule-based personalization!** 🎯
