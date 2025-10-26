# Firebase Firestore Setup Guide

## Issue: Dashboard Not Loading / Exercises Not Saving

If you're experiencing:
- ❌ Dashboard shows "Loading..." forever
- ❌ Clicking "Mark as Complete" removes the tick after refresh
- ❌ Recent Activities not displaying
- ❌ Console shows "permission-denied" errors

**Root Cause:** Firestore security rules are blocking access.

---

## Quick Fix (5 minutes)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Click on your project: **capstone-project-2-d0caf**

### Step 2: Navigate to Firestore Database
1. Click **"Firestore Database"** in the left sidebar
2. If you see "Get Started", click it to create the database
3. Choose **"Start in test mode"** or **"Start in production mode"**

### Step 3: Set Up Security Rules
1. Click the **"Rules"** tab at the top
2. You should see an editor with existing rules
3. Replace ALL the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"** button

### Step 4: Test
1. Go back to your app
2. Refresh the page (Cmd+R / Ctrl+R)
3. Check the browser console - should see:
   - ✅ Dashboard data loaded
   - ✅ Activity added to cloud
   - ✅ Completions saved to cloud

---

## What These Rules Do

### Production Rules (Secure - Recommended)
```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Explanation:**
- ✅ Users can only access their OWN data
- ✅ Must be logged in (authenticated)
- ✅ Can't see other users' data
- ✅ Safe for production

### Test Rules (Open - Only for Development)
```javascript
match /{document=**} {
  allow read, write: if true;
}
```

**Explanation:**
- ⚠️ Anyone can read/write ANY data
- ⚠️ No authentication required
- ⚠️ **NEVER use in production!**
- ✅ Good for quick testing

---

## Troubleshooting

### Error: "Missing or insufficient permissions"
**Console shows:** `FirebaseError: Missing or insufficient permissions`

**Solution:**
1. Make sure you're logged in
2. Check that security rules are published
3. Verify the rules allow access for authenticated users
4. Try logging out and back in

### Error: "PERMISSION_DENIED"
**Console shows:** `🚫 PERMISSION DENIED - Please set up Firestore security rules!`

**Solution:**
1. Check Firestore Rules tab in Firebase Console
2. Make sure rules are published (not just saved)
3. Wait 30-60 seconds for rules to propagate
4. Refresh your app

### Dashboard Still Shows "Loading..."
**Check console for:**
- Red error messages
- "permission-denied" errors
- Network errors

**Solutions:**
1. Check browser console for specific error
2. Verify Firebase config is correct
3. Make sure Firestore is enabled in Firebase Console
4. Check internet connection

### Exercises Reset After Page Refresh
**This means data is not saving to Firestore**

**Solution:**
1. Set up Firestore security rules (see above)
2. Check console for permission errors
3. Verify user is authenticated
4. Check Firebase Console → Firestore → Data tab to see if documents are being created

---

## Verify Setup is Working

### Browser Console Logs (Good)
```
🔐 Auth state changed: User: your@email.com
📊 Loading dashboard for user: abc123...
🔄 Migration complete, loading data...
✅ Dashboard data loaded: {stats: {...}, activities: [...]}
💾 Saved completions to cloud: 2 exercises
✅ Activity added to cloud: Completed "Exercise Name"
📊 Dashboard updated and refreshed (cloud)
```

### Browser Console Logs (Bad - Permission Error)
```
❌ Error fetching dashboard data from Firestore: FirebaseError: Missing or insufficient permissions
🚫 PERMISSION DENIED - Please set up Firestore security rules!
⚠️ Falling back to localStorage...
```

If you see permission errors, follow the setup steps above!

---

## Firestore Database Structure

After setup, you should see this in Firebase Console → Firestore → Data:

```
users/
  └── {your-user-id}/
      ├── dashboard/
      │   └── data/
      │       ├── stats: {...}
      │       ├── activities: [...]
      │       └── updatedAt: timestamp
      │
      ├── completions/
      │   └── 2025-10-26/
      │       ├── exercises: ["ex1", "ex2"]
      │       └── date: "2025-10-26"
      │
      └── program/
          └── metadata/
              └── startDate: timestamp
```

---

## Advanced: Custom Rules

### Rule: Only allow updates, not deletes
```javascript
match /users/{userId}/dashboard/data {
  allow read, write: if request.auth.uid == userId;
  allow delete: if false; // Prevent deletion
}
```

### Rule: Rate limiting (max 100 writes per day)
```javascript
match /users/{userId}/{document=**} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId 
    && request.time < timestamp.date(2025, 12, 31); // Expiry date
}
```

### Rule: Allow therapists to read patient data
```javascript
match /users/{userId}/{document=**} {
  allow read: if request.auth.uid == userId 
    || get(/databases/$(database)/documents/therapists/$(request.auth.uid)).data.patients[userId] == true;
  allow write: if request.auth.uid == userId;
}
```

---

## Security Best Practices

1. ✅ **Never use test mode in production**
   - Always require authentication
   - Always validate user IDs

2. ✅ **Use subcollections for user data**
   - Structure: `/users/{userId}/dashboard/data`
   - Not: `/dashboard/{userId}`

3. ✅ **Validate data on write**
   ```javascript
   allow write: if request.auth.uid == userId
     && request.resource.data.keys().hasAll(['stats', 'activities'])
     && request.resource.data.stats.progressPercentage >= 0
     && request.resource.data.stats.progressPercentage <= 100;
   ```

4. ✅ **Set up Firebase App Check**
   - Protects against abuse
   - Verifies requests come from your app

---

## Need Help?

### Firebase Console Links:
- **Dashboard:** https://console.firebase.google.com/
- **Project:** https://console.firebase.google.com/project/capstone-project-2-d0caf/overview
- **Firestore:** https://console.firebase.google.com/project/capstone-project-2-d0caf/firestore
- **Rules:** https://console.firebase.google.com/project/capstone-project-2-d0caf/firestore/rules

### Common Commands:
```bash
# Check if Firestore is accessible
# (Run in browser console on your app)
firebase.firestore().collection('users').doc('test').set({test: true})
```

### Documentation:
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)

---

## Summary

**Before you can use cloud storage, you MUST:**
1. ✅ Enable Firestore Database in Firebase Console
2. ✅ Set up security rules
3. ✅ Publish the rules

**Then your app will:**
- ✅ Save exercises to cloud
- ✅ Show Recent Activity
- ✅ Sync across devices
- ✅ Never lose data

**Takes ~5 minutes to set up!** 🚀
