# Badge System - Quick Reference Guide

## 🚀 Quick Start

### Using the Badge System

```typescript
import { useBadges } from '../hooks/useBadges';

function MyComponent({ userId }: { userId: string }) {
  const { checkBadges, notifications, dismissNotification } = useBadges(userId);
  
  // Check and unlock badges
  await checkBadges({
    exercisesCompleted: 10,
    daysActive: 5,
    currentStreak: 3,
    // ... other stats
  });
  
  // Display notifications
  {notifications.map((notification, index) => (
    <BadgeNotificationToast
      key={notification.badge.id}
      notification={notification}
      onClose={() => dismissNotification(index)}
    />
  ))}
}
```

---

## 📦 Storage Locations

| Data Type | Primary Storage | Backup/Fallback |
|-----------|----------------|-----------------|
| Badge unlocks | Firestore: `users/{userId}/badges/data` | localStorage: `rehabmotion_badges_{userId}` |
| Phases completed | localStorage: `phases_completed_{userId}` | N/A |
| Videos watched | localStorage: `videos_watched_{userId}` | N/A |

---

## 🔧 Badge Service API

All methods are **async** - use `await`!

```typescript
import { badgeService } from '../services/badgeService';

// Get user's badge data
const badges = await badgeService.getUserBadges(userId);

// Check if badge is unlocked
const isUnlocked = await badgeService.isBadgeUnlocked(userId, 'first-steps');

// Unlock a specific badge
const notification = await badgeService.unlockBadge(userId, 'first-steps');

// Check and unlock badges based on stats
const notifications = await badgeService.checkAndUnlockBadges(userId, {
  exercisesCompleted: 5,
  daysActive: 3,
  currentStreak: 2,
  phasesCompleted: 1,
  videosWatched: 3,
  progressPercentage: 50,
  isWeekend: false,
  isEarlyMorning: false,
  isLateNight: false,
  hadLongBreak: false,
});

// Get all badges with progress
const allBadges = await badgeService.getAllBadgesWithProgress(userId, currentStats);

// Get badges by category
const badgesByCategory = await badgeService.getBadgesByCategory(userId, currentStats);

// Get recently unlocked badges (last 7 days)
const recentBadges = await badgeService.getRecentlyUnlocked(userId);
```

---

## 🎯 Badge Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `milestone` | Major achievements | First Steps, Century Club |
| `streak` | Consecutive day achievements | 3 Days, 7 Days, 30 Days |
| `progress` | Program progress milestones | Phase completion, percentage |
| `exercise` | Exercise-based achievements | Video watching |
| `special` | Time/behavior special badges | Early Bird, Weekend Warrior |

---

## 🏆 Badge Tiers

| Tier | Color | Points | Rarity |
|------|-------|--------|--------|
| Bronze | Orange/Brown | 10 | Common |
| Silver | Gray/Silver | 25 | Uncommon |
| Gold | Yellow/Gold | 50 | Rare |
| Platinum | Purple/Blue | 100 | Epic |

```typescript
import { getBadgeTierColor } from '../data/badgesData';

const color = getBadgeTierColor('gold'); // Returns Tailwind classes
```

---

## 📊 Tracking Stats

### What to Track for Badge Unlocks

```typescript
interface BadgeStats {
  // Exercise tracking
  exercisesCompleted?: number;      // Total exercises completed
  
  // Streak tracking
  daysActive?: number;               // Total days active
  currentStreak?: number;            // Current consecutive days
  
  // Progress tracking
  phasesCompleted?: number;          // Total phases completed
  progressPercentage?: number;       // Overall program progress (0-100)
  
  // Video tracking
  videosWatched?: number;            // Total unique videos watched
  
  // Special conditions
  isWeekend?: boolean;               // Is today Saturday or Sunday?
  isEarlyMorning?: boolean;          // Is it 5am-7am?
  isLateNight?: boolean;             // Is it 10pm-midnight?
  hadLongBreak?: boolean;            // Has user returned after 2+ weeks?
}
```

---

## ✅ Active Badges List

### Milestone Badges
- **First Steps** - Complete 1 exercise (Bronze, 10 pts)
- **Getting Started** - Complete 5 exercises (Bronze, 10 pts)
- **Dedicated Learner** - Complete 10 exercises (Silver, 25 pts)
- **Consistency Pro** - Complete 25 exercises (Silver, 25 pts)
- **Half Century** - Complete 50 exercises (Gold, 50 pts)
- **Century Club** - Complete 100 exercises (Platinum, 100 pts)

### Streak Badges
- **3 Day Streak** - 3 consecutive days (Bronze, 10 pts)
- **Week Warrior** - 7 consecutive days (Silver, 25 pts)
- **Two Week Champion** - 14 consecutive days (Gold, 50 pts)
- **Monthly Master** - 30 consecutive days (Platinum, 100 pts)

### Progress Badges
- **Phase One Complete** - Complete 1 phase (Silver, 25 pts)
- **Halfway There** - 50% program completion (Gold, 50 pts)
- **Almost Done** - 75% program completion (Gold, 50 pts)
- **Full Recovery** - 100% program completion (Platinum, 100 pts)

### Exercise Badges
- **Video Learner** - Watch 5 demo videos (Bronze, 20 pts)
- **Video Enthusiast** - Watch 15 demo videos (Silver, 50 pts)
- **Video Master** - Watch 30 demo videos (Gold, 100 pts)

### Special Badges
- **Early Bird** - Complete exercise 5am-7am (Bronze, 10 pts)
- **Night Owl** - Complete exercise 10pm-midnight (Bronze, 10 pts)
- **Weekend Warrior** - Complete exercise on weekend (Bronze, 10 pts)
- **Comeback Kid** - Return after 2+ week break (Silver, 25 pts)

---

## 🔔 Badge Notifications

### Display Notification Toast

```typescript
import BadgeNotificationToast from '../components/BadgeNotificationToast';

<BadgeNotificationToast
  notification={{
    badge: unlockedBadge,
    message: "You've unlocked: First Steps!",
    showConfetti: false,
  }}
  onClose={() => handleDismiss()}
/>
```

### Notification Properties

```typescript
interface BadgeNotification {
  badge: Badge;               // The unlocked badge
  message: string;            // Notification message
  showConfetti: boolean;      // Show confetti for Gold/Platinum
}
```

---

## 🎨 UI Components

### 1. BadgesAchievements (Main Badge Display)
```typescript
import BadgesAchievements from '../components/BadgesAchievements';

<BadgesAchievements 
  userId={userId}
  currentStats={{
    exercisesCompleted: 10,
    daysActive: 5,
    currentStreak: 3,
    progressPercentage: 50,
  }}
/>
```

### 2. Badge Navigation Widget
```typescript
import { BadgesSummaryWidget } from '../examples/BadgeNavigationComponents';

<BadgesSummaryWidget 
  userId={userId}
  onViewAll={() => navigate('/badges')}
/>
```

### 3. Recent Badges Display
```typescript
import { RecentBadgesDisplay } from '../examples/BadgeNavigationComponents';

<RecentBadgesDisplay userId={userId} />
```

---

## 🐛 Debugging

### Console Logs to Watch For

```
✅ Badge data loaded from cloud
✅ Badge data migrated from localStorage to cloud
✅ Badge data saved to cloud
⚠️ Badge data saved to localStorage (fallback)
❌ Error fetching badge data from Firestore: [error]
📹 Video watched (X total): <url>
🎯 Phase completed! Total phases: X
```

### Check Badge Data (Browser Console)

```javascript
// Get badge service
const { badgeService } = await import('./services/badgeService');

// Check user's badges
const badges = await badgeService.getUserBadges('user-id');
console.log('Unlocked badges:', badges.unlockedBadges);
console.log('Total points:', badges.totalPoints);
console.log('Level:', badges.level);

// Check specific badge
const isUnlocked = await badgeService.isBadgeUnlocked('user-id', 'first-steps');
console.log('First Steps unlocked?', isUnlocked);
```

### Check Firestore Data (Firebase Console)

1. Go to: https://console.firebase.google.com/project/capstone-project-2-d0caf/firestore
2. Navigate: `users` → `{userId}` → `badges` → `data`
3. View badge data in real-time

---

## 🔥 Common Use Cases

### 1. Track Exercise Completion
```typescript
// When user completes an exercise
const exercisesCompleted = dashboardData.stats.exercisesCompleted + 1;

await checkBadges({
  exercisesCompleted,
  daysActive: dashboardData.stats.daysActive,
  // ... other stats
});
```

### 2. Track Phase Completion
```typescript
// When user advances to next phase
const phasesCompleted = parseInt(localStorage.getItem(`phases_completed_${userId}`) || '0') + 1;
localStorage.setItem(`phases_completed_${userId}`, phasesCompleted.toString());

await checkBadges({
  phasesCompleted,
  // ... other stats
});
```

### 3. Track Video Watch
```typescript
// When user watches a video
const videosWatchedStr = localStorage.getItem(`videos_watched_${userId}`) || '[]';
const videosWatched = JSON.parse(videosWatchedStr);

if (!videosWatched.includes(videoUrl)) {
  videosWatched.push(videoUrl);
  localStorage.setItem(`videos_watched_${userId}`, JSON.stringify(videosWatched));
  
  await checkBadges({
    videosWatched: videosWatched.length,
    // ... other stats
  });
}
```

### 4. Check Time-Based Badges
```typescript
// Check time-based badges
const now = new Date();
const hour = now.getHours();
const day = now.getDay();

await checkBadges({
  isEarlyMorning: hour >= 5 && hour < 7,
  isLateNight: hour >= 22 && hour < 24,
  isWeekend: day === 0 || day === 6,
  // ... other stats
});
```

---

## 📚 Documentation References

- **Full Migration Guide:** [CLOUD_STORAGE_MIGRATION.md](./CLOUD_STORAGE_MIGRATION.md)
- **Badge Fixes:** [BADGE_FIXES.md](./BADGE_FIXES.md)
- **Refresh Fix:** [REFRESH_FIX.md](./REFRESH_FIX.md)
- **Firebase Setup:** [FIREBASE_FIRESTORE_SETUP.md](./FIREBASE_FIRESTORE_SETUP.md)

---

## 🎯 Key Points to Remember

1. **Always use `await`** - All badge service methods are async
2. **Check badges frequently** - After any user action (exercise, phase, video)
3. **Track consistently** - Use same localStorage keys across app
4. **Handle notifications** - Display toast and allow dismiss
5. **Monitor console** - Watch for success/error logs
6. **Firestore first** - Badge data loads from cloud, falls back to local
7. **Automatic migration** - Old localStorage data migrates automatically

---

## ✨ Quick Test

Test the badge system in your browser console:

```javascript
// Import badge service
const { badgeService } = await import('./services/badgeService.ts');

// Test user ID
const testUserId = 'test-user-123';

// Check badges with test stats
const notifications = await badgeService.checkAndUnlockBadges(testUserId, {
  exercisesCompleted: 1,
  daysActive: 1,
});

console.log('Unlocked badges:', notifications);
```

---

**Need Help?** Check the full documentation or review the code in:
- `/src/services/badgeService.ts`
- `/src/hooks/useBadges.ts`
- `/src/data/badgesData.ts`
