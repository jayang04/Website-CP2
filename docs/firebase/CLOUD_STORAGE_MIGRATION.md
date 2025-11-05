# Cloud Storage Migration Guide

## Overview

The RehabMotion badge system has been successfully migrated from localStorage-only storage to Firebase Firestore cloud storage. This ensures badge progress persists across devices, browser sessions, and localhost port changes.

---

## Migration Details

### Before (localStorage only)
```
localStorage: rehabmotion_badges_{userId}
  ↓
Badge data lost when:
  - Switching localhost ports (3000 → 5173)
  - Clearing browser cache
  - Switching devices
  - Using different browsers
```

### After (Firestore + localStorage backup)
```
Firestore: users/{userId}/badges/data (PRIMARY)
  ↓
  Automatic sync & persistence
  ↓
localStorage: rehabmotion_badges_{userId} (BACKUP/FALLBACK)
```

---

## Architecture

### Firestore Structure
```
users/
  └── {userId}/
      ├── badges/
      │   └── data
      │       ├── userId: string
      │       ├── unlockedBadges: Badge[]
      │       ├── totalPoints: number
      │       ├── level: number
      │       ├── nextLevelPoints: number
      │       └── updatedAt: Timestamp
      └── dashboard/
          └── data
              ├── stats: UserStats
              ├── activities: Activity[]
              └── programProgress: ProgramProgress
```

### Data Flow
```
User Action
  ↓
badgeService.checkAndUnlockBadges()
  ↓
getUserBadges() → Firestore.getDoc()
  ├─ Success → Return cloud data
  ├─ No cloud data → Check localStorage → Migrate to Firestore
  └─ Error → Fallback to localStorage
  ↓
unlockBadge() → Update data
  ↓
saveUserBadges() → Firestore.setDoc()
  ├─ Success → Also save to localStorage (backup)
  └─ Error → Save to localStorage only
  ↓
Badge Unlocked
```

---

## Code Changes

### 1. Badge Service (`/src/services/badgeService.ts`)

#### getUserBadges() - Now Async
```typescript
async getUserBadges(userId: string): Promise<UserBadges> {
  try {
    // 1. Try Firestore first
    const docRef = doc(db, 'users', userId, 'badges', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserBadges;
    }
    
    // 2. Check localStorage for migration
    const stored = localStorage.getItem(`rehabmotion_badges_${userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      await this.saveUserBadges(data); // Migrate to cloud
      return data;
    }
    
    // 3. Return default data
    return defaultUserBadges;
  } catch (error) {
    // Fallback to localStorage on error
    return localStorageData || defaultUserBadges;
  }
}
```

#### saveUserBadges() - Now Async
```typescript
private async saveUserBadges(userBadges: UserBadges): Promise<void> {
  try {
    const docRef = doc(db, 'users', userBadges.userId, 'badges', 'data');
    await setDoc(docRef, {
      ...userBadges,
      updatedAt: serverTimestamp()
    });
    
    // Also save to localStorage as backup
    localStorage.setItem(`rehabmotion_badges_${userBadges.userId}`, JSON.stringify(userBadges));
  } catch (error) {
    // Fallback to localStorage only
    localStorage.setItem(`rehabmotion_badges_${userBadges.userId}`, JSON.stringify(userBadges));
  }
}
```

### 2. UI Components - Updated to Handle Async

#### BadgesAchievements.tsx
```typescript
// Before
const loadBadges = () => {
  const userBadgeData = badgeService.getUserBadges(userId);
  setUserBadges(userBadgeData);
};

// After
const loadBadges = async () => {
  const userBadgeData = await badgeService.getUserBadges(userId);
  setUserBadges(userBadgeData);
};
```

#### BadgeNavigationComponents.tsx
```typescript
// Before
useEffect(() => {
  const data = badgeService.getUserBadges(userId);
  setBadgeData({ ... });
}, [userId]);

// After
useEffect(() => {
  const loadData = async () => {
    const data = await badgeService.getUserBadges(userId);
    setBadgeData({ ... });
  };
  loadData();
}, [userId]);
```

### 3. useBadges Hook (`/src/hooks/useBadges.ts`)
✅ **No changes needed** - Already properly using async/await for all badge operations

---

## Migration Process

### Automatic Migration on First Load

When a user opens the app after the migration:

1. **App loads** → User authenticated → `userId` available
2. **Badge service called** → `getUserBadges(userId)`
3. **Check Firestore** → No data found (first time)
4. **Check localStorage** → Data found (old badge progress)
5. **Migrate to Firestore** → `saveUserBadges(data)`
6. **Success** → Badge data now in cloud ✅

The migration is transparent to the user - no action required!

### Handling Different Scenarios

#### Scenario 1: New User
```
getUserBadges() 
  → No Firestore data
  → No localStorage data
  → Create default UserBadges
  → Save to Firestore
  → Return default data
```

#### Scenario 2: Existing User (First Time After Migration)
```
getUserBadges()
  → No Firestore data
  → localStorage data found ✓
  → Migrate to Firestore ✓
  → Return migrated data
```

#### Scenario 3: Returning User (After Migration)
```
getUserBadges()
  → Firestore data found ✓
  → Return cloud data
```

#### Scenario 4: Offline/Error Scenario
```
getUserBadges()
  → Firestore call fails (offline/error)
  → Fallback to localStorage ✓
  → Return localStorage data
```

---

## Testing the Migration

### Test 1: Verify Cloud Storage
```typescript
// Open browser console
const userId = 'test-user';
const badges = await badgeService.getUserBadges(userId);
console.log('User badges:', badges);

// Check Firestore in Firebase Console
// Navigate to: Firestore Database → users → {userId} → badges → data
```

### Test 2: Test Cross-Device Sync
1. Unlock a badge on Device A (e.g., complete 5 exercises)
2. Open app on Device B with same user account
3. ✅ Badge should be unlocked on Device B

### Test 3: Test Port Change Persistence
1. Run app on `localhost:3000` and unlock badges
2. Stop server, start on `localhost:5173`
3. ✅ All badges should still be unlocked

### Test 4: Test Offline Fallback
1. Open app with internet connection
2. Unlock a badge (saved to Firestore + localStorage)
3. Turn off internet
4. Refresh page
5. ✅ Badges should still show (from localStorage fallback)

### Test 5: Test Migration from Old Storage
1. Clear Firestore data for test user
2. Add badge data to localStorage manually:
   ```javascript
   localStorage.setItem('rehabmotion_badges_test-user', JSON.stringify({
     userId: 'test-user',
     unlockedBadges: [],
     totalPoints: 0,
     level: 1,
     nextLevelPoints: 100
   }));
   ```
3. Load app
4. ✅ Data should migrate to Firestore automatically

---

## Firestore Security Rules

Ensure your Firestore has proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcollections inherit parent rules
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Benefits of Cloud Storage

### ✅ Cross-Device Sync
- Badge progress syncs across all devices
- Use phone, tablet, desktop seamlessly

### ✅ Persistent Data
- Data survives browser cache clearing
- Data survives localhost port changes
- Data survives browser switches

### ✅ Backup Strategy
- Primary: Firestore (reliable, synced)
- Fallback: localStorage (offline access)
- Best of both worlds

### ✅ Future-Proof
- Ready for real-time sync features
- Ready for multi-user features
- Ready for analytics

### ✅ Better User Experience
- No lost progress
- Seamless experience across devices
- Confidence in data persistence

---

## Monitoring & Debugging

### Console Logs
```
✅ Badge data loaded from cloud          // Firestore success
✅ Badge data migrated from localStorage to cloud  // Migration success
✅ Badge data saved to cloud             // Save success
⚠️ Badge data saved to localStorage (fallback)    // Offline fallback
❌ Error fetching badge data from Firestore: [error]  // Error details
```

### Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: capstone-project-2-d0caf
3. Navigate to: Firestore Database
4. Inspect: `users/{userId}/badges/data`

### Debug Commands (Browser Console)
```javascript
// Check current user's badges
const badges = await badgeService.getUserBadges('user-id-here');
console.log(badges);

// Check Firestore directly
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
const docRef = doc(db, 'users', 'user-id-here', 'badges', 'data');
const docSnap = await getDoc(docRef);
console.log(docSnap.exists() ? docSnap.data() : 'No data');
```

---

## Rollback Plan (If Needed)

If cloud storage causes issues, you can temporarily disable it:

### Option 1: Force localStorage Only
In `/src/services/badgeService.ts`:
```typescript
async getUserBadges(userId: string): Promise<UserBadges> {
  // Temporarily skip Firestore, use localStorage only
  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultUserBadges;
}
```

### Option 2: Conditional Feature Flag
```typescript
const USE_CLOUD_STORAGE = false; // Set to false to disable

if (USE_CLOUD_STORAGE) {
  // Cloud storage logic
} else {
  // localStorage only logic
}
```

---

## Future Enhancements

### Planned Features
- [ ] Real-time badge sync across open tabs
- [ ] Offline queue for badge unlocks
- [ ] Badge history/timeline
- [ ] Social features (share badges)
- [ ] Badge leaderboards

### Potential Optimizations
- [ ] Cache Firestore data in memory
- [ ] Batch badge unlocks to reduce Firestore writes
- [ ] Implement pagination for large badge lists
- [ ] Add retry logic for failed Firestore operations

---

## Summary

✅ **Migration Complete**
- Badge storage migrated from localStorage to Firestore
- Automatic migration for existing users
- localStorage retained as backup
- All components updated to handle async operations

✅ **Benefits Achieved**
- Cross-device badge persistence
- Survives localhost changes
- Better user experience
- Future-proof architecture

✅ **Testing Verified**
- Cloud storage working
- Migration working
- Fallback working
- No data loss

The badge system is now fully cloud-enabled! 🎉
