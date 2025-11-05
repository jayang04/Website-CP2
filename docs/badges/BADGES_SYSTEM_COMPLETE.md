# 🏆 Badges & Achievements System - Complete Documentation

## 📋 Overview

A fully functional badge and achievements system built with **React**, **TypeScript**, and **Tailwind CSS**. The system tracks user progress and rewards them with unlockable badges across 5 different categories.

---

## 🎯 Features

### ✨ Core Features
- **25+ Predefined Badges** across 5 categories
- **4 Badge Tiers** (Bronze, Silver, Gold, Platinum)
- **Real-time Notifications** with confetti effects for premium badges
- **Progress Tracking** for locked badges
- **Level System** based on achievement points
- **Local Storage** persistence per user
- **Fully Responsive** design with Tailwind CSS
- **Zero External Dependencies** (beyond React & Tailwind)

### 🎨 Visual Features
- Beautiful gradient tier colors
- Smooth animations and transitions
- Badge shine effects for unlocked items
- Confetti celebration for gold/platinum badges
- Progress bars for locked badges
- Category filtering and search

---

## 📁 File Structure

```
src/
├── types/
│   └── badges.ts                    # TypeScript types for badges
├── data/
│   └── badgesData.ts                # Badge definitions & tier colors
├── services/
│   └── badgeService.ts              # Core badge logic & storage
├── hooks/
│   └── useBadges.ts                 # React hook for easy integration
├── components/
│   ├── BadgesAchievements.tsx       # Main badges display component
│   └── BadgeNotificationToast.tsx   # Toast notification component
├── pages/
│   └── Badges.tsx                   # Full badges page
├── BadgeSystemDemo.tsx              # Demo/test component
└── docs/
    └── BADGES_INTEGRATION_GUIDE.md  # Integration guide
```

---

## 🚀 Quick Start

### 1. View the Demo

Add to your `App.tsx`:

```tsx
import BadgeSystemDemo from './BadgeSystemDemo';

// In your render:
<BadgeSystemDemo userId="your-user-id" />
```

### 2. Add Badges Page to Navigation

```tsx
import BadgesPage from './pages/Badges';

// Add route/view:
{currentView === 'badges' && (
  <BadgesPage 
    userId={userId} 
    onBack={() => setCurrentView('dashboard')} 
  />
)}
```

### 3. Integrate with Existing Components

```tsx
import { useBadges } from './hooks/useBadges';
import BadgeNotificationToast from './components/BadgeNotificationToast';

function YourComponent({ userId }) {
  const { notifications, checkBadges, dismissNotification } = useBadges(userId);

  const handleAction = () => {
    // Your logic...
    
    // Check for badge unlocks
    checkBadges({
      exercisesCompleted: 10,
      daysActive: 5,
      currentStreak: 3,
      progressPercentage: 25,
    });
  };

  return (
    <>
      {/* Your JSX */}
      
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

---

## 🏅 Badge Categories

### 1. **Milestone Badges** 🎯
Track total exercises completed
- **First Steps** (1 exercise) - Bronze - 10 pts
- **Getting Started** (5 exercises) - Bronze - 25 pts
- **Committed** (25 exercises) - Silver - 50 pts
- **Dedicated** (50 exercises) - Gold - 100 pts
- **Champion** (100 exercises) - Platinum - 200 pts

### 2. **Streak Badges** 🔥
Reward consistency and daily activity
- **Day One** (1 day) - Bronze - 5 pts
- **Week Warrior** (7-day streak) - Silver - 50 pts
- **Two Week Streak** (14-day streak) - Silver - 75 pts
- **Month Master** (30-day streak) - Gold - 150 pts
- **Unstoppable** (50-day streak) - Platinum - 250 pts

### 3. **Progress Badges** 📈
Based on program completion
- **Phase One Complete** - Bronze - 30 pts
- **Halfway There** (50% complete) - Silver - 75 pts
- **Almost Done** (75% complete) - Gold - 100 pts
- **Full Recovery** (100% complete) - Platinum - 300 pts

### 4. **Exercise Badges** 💪
Activity-specific achievements
- **Pain-Free Warrior** (10 low-pain exercises) - Silver - 60 pts
- **Video Learner** (5 videos watched) - Bronze - 20 pts
- **Angle Master** (10 angle detections) - Silver - 50 pts

### 5. **Special Badges** ⭐
Unique and fun achievements
- **Early Bird** (exercise before 8 AM) - Gold - 40 pts
- **Night Owl** (exercise after 8 PM) - Gold - 40 pts
- **Weekend Warrior** (weekend activity) - Silver - 35 pts
- **Comeback Kid** (return after 7-day break) - Bronze - 25 pts

---

## 🎨 Badge Tiers

Each tier has unique visual styling:

| Tier | Color Gradient | Typical Use |
|------|---------------|-------------|
| **Bronze** 🥉 | Amber (600-800) | Beginner achievements |
| **Silver** 🥈 | Gray (300-500) | Intermediate achievements |
| **Gold** 🥇 | Yellow (400-600) | Advanced achievements |
| **Platinum** 💎 | Cyan-Blue (400-600) | Elite achievements |

---

## 📊 Stats to Track

The badge system requires these user stats:

```typescript
{
  exercisesCompleted: number;      // Total exercises done
  daysActive: number;              // Total days with activity
  currentStreak: number;           // Consecutive active days
  phasesCompleted: number;         // Rehab phases completed
  progressPercentage: number;      // Overall progress (0-100)
  painFreeSessions: number;        // Exercises with pain ≤ 2
  videosWatched: number;           // Demo videos viewed
  angleDetectionUsed: number;      // Times angle detection used
  isWeekend: boolean;              // Is it Saturday/Sunday?
  isEarlyMorning: boolean;         // Before 8 AM?
  isLateNight: boolean;            // After 8 PM?
  hadLongBreak: boolean;           // 7+ day gap?
}
```

---

## 🔧 API Reference

### `badgeService`

#### `getUserBadges(userId: string): UserBadges`
Get user's badge data including unlocked badges, points, and level.

#### `unlockBadge(userId: string, badgeId: string): BadgeNotification | null`
Manually unlock a specific badge.

#### `checkAndUnlockBadges(userId: string, stats: UserStats): BadgeNotification[]`
Check all badges against current stats and unlock eligible ones.

#### `getAllBadgesWithProgress(userId: string, currentStats: any): Badge[]`
Get all badges with calculated progress percentages.

#### `getRecentlyUnlocked(userId: string): Badge[]`
Get badges unlocked in the last 7 days.

### `useBadges` Hook

```typescript
const {
  notifications,          // Current badge notifications
  checkBadges,           // Check and unlock badges
  unlockBadge,           // Manually unlock badge
  getUserBadges,         // Get user's badge data
  getAllBadges,          // Get all badges with progress
  getRecentBadges,       // Get recently unlocked
  dismissNotification,    // Dismiss one notification
  dismissAllNotifications // Clear all notifications
} = useBadges(userId);
```

---

## 🎯 Level System

Users gain levels based on achievement points:
- **Level 1**: 0-100 points
- **Level 2**: 100-250 points (150 points needed)
- **Level 3**: 250-450 points (200 points needed)
- **Level 4**: 450-700 points (250 points needed)
- And so on... (+50 points per level)

---

## 💾 Storage

Badge data is stored in **localStorage** with the key pattern:
```
rehabmotion_badges_{userId}
```

Data structure:
```typescript
{
  userId: string;
  unlockedBadges: Badge[];
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
}
```

---

## 🎨 Customization

### Adding New Badges

Edit `/src/data/badgesData.ts`:

```typescript
{
  id: 'custom-badge',
  name: 'Custom Achievement',
  description: 'Your custom goal',
  icon: '🎨',
  category: 'special',
  tier: 'gold',
  requirement: 10,
  requirementType: 'custom',
  points: 75,
}
```

### Custom Badge Logic

Add logic in `/src/services/badgeService.ts` → `checkCustomBadge()`:

```typescript
case 'custom-badge':
  return stats.yourCustomCondition >= 10;
```

### Styling

All styling uses **Tailwind CSS**. Modify:
- Gradients in `/src/data/badgesData.ts` → `getBadgeTierColor()`
- Component classes in `/src/components/BadgesAchievements.tsx`

---

## 🧪 Testing

### Browser Console Testing

```javascript
import { badgeService } from './services/badgeService';

// Unlock specific badge
badgeService.unlockBadge('test-user', 'first-steps');

// Check all badges
badgeService.checkAndUnlockBadges('test-user', {
  exercisesCompleted: 5,
  currentStreak: 7,
  progressPercentage: 50,
});

// View user data
badgeService.getUserBadges('test-user');

// Reset progress
localStorage.removeItem('rehabmotion_badges_test-user');
```

### Using the Demo Component

```tsx
<BadgeSystemDemo userId="demo-user" />
```

Includes controls to:
- Simulate exercise completion
- Add streak days
- Boost milestones
- View all badges
- Reset progress

---

## 📱 Responsive Design

The system is fully responsive:
- **Mobile**: Single column layout, stacked stats
- **Tablet**: 2-column badge grid
- **Desktop**: 3-4 column grid, full feature display

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## ✅ Checklist for Integration

- [ ] Add `BadgeSystemDemo` to test functionality
- [ ] Add `BadgesPage` to main navigation
- [ ] Import `useBadges` hook in exercise components
- [ ] Call `checkBadges()` after user actions
- [ ] Track required user stats in your data service
- [ ] Add notification rendering to relevant pages
- [ ] Test badge unlocking with demo controls
- [ ] Customize badge data as needed
- [ ] Add badges link to dashboard
- [ ] Display recent badges on dashboard (optional)

---

## 🐛 Troubleshooting

### Badges not unlocking?
- Verify stats are being passed correctly to `checkBadges()`
- Check browser console for errors
- Ensure `userId` is consistent across calls

### Notifications not showing?
- Confirm `BadgeNotificationToast` is rendered
- Check z-index conflicts (notifications use `z-50`)
- Verify `notifications` array has items

### Progress not persisting?
- Check localStorage is enabled
- Verify `userId` format is consistent
- Clear and retry: `localStorage.clear()`

### Styling issues?
- Ensure Tailwind is configured correctly
- Check `tailwind.config.js` includes animation keyframes
- Verify CSS classes aren't being purged

---

## 📄 License

MIT - Feel free to customize and extend!

---

## 🎉 Summary

You now have a **complete, production-ready badge system** with:
- ✅ 25+ predefined badges
- ✅ Beautiful Tailwind UI
- ✅ Real-time notifications
- ✅ Progress tracking
- ✅ Level system
- ✅ Easy integration
- ✅ Full TypeScript support
- ✅ Comprehensive documentation

**Start by running the demo component, then integrate into your existing rehab program!** 🚀
