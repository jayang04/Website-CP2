# Dynamic Data Management Guide

This guide explains how to manage your own data for the Dashboard and Rehab Program pages.

## Overview

Both the Dashboard and Rehab Program pages now use **localStorage** to store personalized user data. All data is tied to your user ID, so each user has their own independent data.

## Files Created

1. **`src/types/dashboard.ts`** - Type definitions for dashboard data
2. **`src/services/dataService.ts`** - Service layer for managing all data
3. **`src/types/rehab.ts`** - Updated with Exercise interface

## How It Works

### Dashboard Data

The dashboard displays:
- **Stats**: Progress percentage, days active, exercises completed
- **Quick Actions**: Customizable action cards
- **Program Progress**: Current week, total weeks, progress bar
- **Recent Activities**: Timeline of your actions

All this data is automatically loaded when you visit the dashboard and is unique to your user account.

### Rehab Program Data

When you select a knee or ankle program:
- Exercises are loaded from localStorage
- You can mark exercises as complete/incomplete
- Completion status is saved automatically
- Your progress is reflected on the dashboard

## Using the Data Service

### Dashboard Service

```typescript
import { dashboardService } from '../services/dataService';

// Get dashboard data for a user
const data = dashboardService.getDashboardData(userId);

// Update user stats
dashboardService.updateStats(userId, {
  progressPercentage: 85,
  daysActive: 15,
  exercisesCompleted: 12
});

// Add a new activity
dashboardService.addActivity(userId, {
  type: 'completed',
  title: 'Completed morning workout',
  timestamp: new Date(),
  icon: '✅'
});

// Update program progress
dashboardService.updateProgramProgress(userId, {
  programName: 'Knee Rehabilitation Program',
  currentWeek: 5,
  totalWeeks: 8,
  progressPercentage: 62,
  description: "You're making great progress!"
});
```

### Exercise Service

```typescript
import { exerciseService } from '../services/dataService';

// Get exercises for a program
const kneeExercises = exerciseService.getExercises(userId, 'knee');
const ankleExercises = exerciseService.getExercises(userId, 'ankle');

// Toggle exercise completion (this happens automatically when you click)
exerciseService.toggleExerciseCompletion(userId, 'knee', exerciseId);

// Add a custom exercise
exerciseService.addExercise(userId, 'knee', {
  name: 'Custom Exercise',
  phase: 2,
  sets: 3,
  reps: 10,
  hold: '5 seconds',
  description: 'My custom rehabilitation exercise',
  image: '🏃',
  completed: false
});

// Update an exercise
exerciseService.updateExercise(userId, 'knee', exerciseId, {
  sets: 4,
  reps: 12
});

// Delete an exercise
exerciseService.deleteExercise(userId, 'knee', exerciseId);
```

## Activity Types

Activities can have these types (affects icon styling):
- `'completed'` - Exercise completions (green checkmark)
- `'logged'` - Data logging (notepad icon)
- `'checkin'` - Daily check-ins (clock icon)
- `'goal'` - Goal achievements (target icon)

## Default Data

When you first visit:
- Dashboard shows zero stats
- No activities listed
- Default quick actions for knee/ankle programs
- Default exercise sets loaded for each program

As you interact with the app:
- Marking exercises as complete updates your stats
- Activities are automatically logged
- Data persists across sessions

## Customization Examples

### Add a Morning Check-in Activity

```typescript
dashboardService.addActivity(userId, {
  type: 'checkin',
  title: 'Morning check-in completed',
  timestamp: new Date(),
  icon: '⏰'
});
```

### Update Your Program Progress

```typescript
dashboardService.updateProgramProgress(userId, {
  programName: 'Advanced Knee Recovery',
  currentWeek: 3,
  totalWeeks: 12,
  progressPercentage: 25,
  description: 'Week 3: Building strength and mobility'
});
```

### Add a Custom Exercise

```typescript
exerciseService.addExercise(userId, 'ankle', {
  name: 'Toe Taps',
  phase: 1,
  sets: 2,
  reps: 20,
  hold: 'Quick pace',
  description: 'Tap your toes rapidly to improve ankle flexibility',
  image: '🦶',
  completed: false
});
```

## Data Persistence

- All data is stored in **browser localStorage**
- Data persists between sessions
- Each user (by user ID) has isolated data
- Clear browser data will reset everything

## Future Enhancements

Potential additions:
- Export/import data as JSON
- Sync with Firebase Firestore
- Share progress with therapist
- Weekly/monthly reports
- Exercise history tracking
- Pain level logging
- Custom program creation

## Testing

To test the dynamic data:
1. Log in with a user account
2. Navigate to Dashboard - should show zero stats initially
3. Go to Rehab Program → Select Knee or Ankle
4. Mark some exercises as complete
5. Return to Dashboard - stats should update
6. Check Recent Activities - should show completions

## Browser Console Access

You can also manipulate data directly from the browser console:

```javascript
// Get the service (already imported in pages)
const userId = 'your-user-id';

// View current data
console.log(localStorage.getItem(`rehabmotion_dashboard_data_${userId}`));

// Clear all data for testing
localStorage.clear();
```

---

**Need help?** Check the source code in `src/services/dataService.ts` for all available methods!
