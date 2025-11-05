# Badge System Integration Guide

## Overview
The badge system tracks user achievements and unlocks badges based on various activities like exercises completed, streaks, progress, and special activities.

## Quick Start

### 1. Using the Badge Hook in Your Components

```tsx
import { useBadges } from '../hooks/useBadges';
import BadgeNotificationToast from '../components/BadgeNotificationToast';

function YourComponent({ userId }: { userId: string }) {
  const { notifications, checkBadges, dismissNotification } = useBadges(userId);

  // Call checkBadges whenever user completes an action
  const handleExerciseComplete = async () => {
    // Your existing logic...
    
    // Check for new badges
    checkBadges({
      exercisesCompleted: 10, // Get from your data service
      daysActive: 5,
      currentStreak: 3,
      progressPercentage: 25,
    });
  };

  return (
    <>
      {/* Your component JSX */}
      
      {/* Badge Notifications */}
      {notifications.map((notification, index) => (
        <BadgeNotificationToast
          key={notification.badge.id}
          notification={notification}
          onClose={() => dismissNotification(index)}
        />
      ))}
    </>
  );
}
```

### 2. Integration with InjuryRehabProgram.tsx

Add this to your `InjuryRehabProgram` component:

```tsx
import { useBadges } from '../hooks/useBadges';
import BadgeNotificationToast from '../components/BadgeNotificationToast';

// In your component:
const { notifications, checkBadges, dismissNotification } = useBadges(userId);

// In your completeExercise function, add:
const completeExercise = (exerciseId: string) => {
  // Existing completion logic...
  injuryRehabService.completeExercise(userId, exerciseId);
  
  // Get updated stats
  const progress = injuryRehabService.getProgress(userId);
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();
  
  // Check for badge unlocks
  checkBadges({
    exercisesCompleted: progress.completedExercises.length,
    daysActive: progress.daysActive || 0,
    currentStreak: progress.currentStreak || 0,
    progressPercentage: calculateProgress(),
    isEarlyMorning: currentHour < 8,
    isLateNight: currentHour >= 20,
    isWeekend: currentDay === 0 || currentDay === 6,
  });
};

// In your JSX return, add:
{notifications.map((notification, index) => (
  <BadgeNotificationToast
    key={notification.badge.id}
    notification={notification}
    onClose={() => dismissNotification(index)}
  />
))}
```

### 3. Add Badges to Navigation

In your main App.tsx or navigation component:

```tsx
import BadgesPage from './pages/Badges';

// Add a route/view for badges:
{currentView === 'badges' && (
  <BadgesPage 
    userId={userId} 
    onBack={() => setCurrentView('dashboard')} 
  />
)}

// Add a navigation button:
<button onClick={() => setCurrentView('badges')}>
  🏆 Badges
</button>
```

## Available Badge Categories

1. **Milestone Badges** (🎯)
   - Based on exercise count: 1, 5, 25, 50, 100 exercises
   
2. **Streak Badges** (🔥)
   - Based on consecutive days: 1, 7, 14, 30, 50 days
   
3. **Progress Badges** (📈)
   - Based on program completion: Phase completion, 50%, 75%, 100%
   
4. **Exercise Badges** (💪)
   - Pain-free exercises, video views, angle detection usage
   
5. **Special Badges** (⭐)
   - Early bird, night owl, weekend warrior, comeback kid

## Stats to Track

Make sure your data service tracks these stats:
- `exercisesCompleted`: Total number of exercises completed
- `daysActive`: Total days with activity
- `currentStreak`: Current consecutive active days
- `phasesCompleted`: Number of phases completed
- `progressPercentage`: Overall program completion (0-100)
- `painFreeSessions`: Exercises completed with pain level 0-2
- `videosWatched`: Number of demo videos watched
- `angleDetectionUsed`: Times angle detection was used

## Customization

### Add New Badges

Edit `/src/data/badgesData.ts` and add to the `BADGES_DATA` array:

```typescript
{
  id: 'my-custom-badge',
  name: 'Custom Achievement',
  description: 'Complete a custom goal',
  icon: '🎨',
  category: 'special',
  tier: 'gold',
  requirement: 10,
  requirementType: 'custom',
  points: 75,
}
```

### Modify Badge Tiers

Badge tiers define visual appearance:
- **Bronze**: Beginner achievements (amber gradient)
- **Silver**: Intermediate achievements (gray gradient)
- **Gold**: Advanced achievements (yellow gradient)
- **Platinum**: Elite achievements (cyan-blue gradient)

## Testing

Test badge unlocks in your browser console:

```javascript
import { badgeService } from './services/badgeService';

// Unlock a specific badge
badgeService.unlockBadge('user123', 'first-steps');

// Check all potential unlocks
badgeService.checkAndUnlockBadges('user123', {
  exercisesCompleted: 5,
  daysActive: 3,
  currentStreak: 2,
});
```

## Example Dashboard Integration

Show recent badges in your dashboard:

```tsx
import { badgeService } from '../services/badgeService';

function Dashboard({ userId }) {
  const [recentBadges, setRecentBadges] = useState([]);
  
  useEffect(() => {
    const badges = badgeService.getRecentlyUnlocked(userId);
    setRecentBadges(badges);
  }, [userId]);
  
  return (
    <div className="recent-badges">
      <h3>Recent Achievements</h3>
      <div className="flex gap-4">
        {recentBadges.slice(0, 3).map(badge => (
          <div key={badge.id} className="badge-mini">
            <span className="text-3xl">{badge.icon}</span>
            <p className="text-xs">{badge.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Notes

- Badge data is stored in localStorage per user
- Progress is calculated automatically for locked badges
- Notifications auto-dismiss after 5 seconds
- Gold and Platinum badges show confetti animation
- All badges use Tailwind CSS (no external CSS files needed)
