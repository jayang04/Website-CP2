# 🔧 Notification Not Working - Debug Guide

## Issue: Clicked Test Notification Button - Nothing Happens

I've added detailed logging to help diagnose the issue. Follow these steps:

---

## Step 1: Open Browser Console

1. Press **F12** (or **Cmd+Option+I** on Mac)
2. Click the **Console** tab
3. Clear any old messages (trash icon)

---

## Step 2: Try Test Notification Again

1. Go to **Settings** page
2. Scroll to **Exercise Reminders**
3. Click **"🔔 Test Notification"** button
4. **Watch the console** for messages

---

## Step 3: Check Console Messages

### ✅ If You See These Messages:
```
🔔 Test notification button clicked
Notification support: true
Current permission: granted
Permission granted: true
✅ Test notification sent successfully
```

**This means:** Code is working, but notification might be blocked by:
- OS notification settings
- Browser notification settings
- Do Not Disturb mode

**Solution:** See [OS Settings](#check-os-notification-settings) below

---

### ⚠️ If You See:
```
🔔 Test notification button clicked
Notification support: true
Current permission: default
```

**This means:** Permission not yet granted

**You should see:** Browser popup asking "Allow notifications?"

**If popup doesn't appear:**
- Browser might have auto-denied due to past interaction
- Try different browser
- See [Reset Permission](#reset-browser-permission) below

---

### ❌ If You See:
```
🔔 Test notification button clicked
Notification support: false
```

**This means:** Browser doesn't support notifications

**Solution:**
- Try Chrome, Firefox, or Edge (Safari has limited support)
- Make sure you're on **http://localhost:5173/** (not file://)
- Update your browser to latest version

---

### 🚨 If You See Error:
```
❌ Error sending notification: [error message]
```

**Copy the error** and check common issues below

---

## Common Issues & Solutions

### Issue 1: Nothing in Console

**Problem:** Button click not registering

**Check:**
1. Is the page fully loaded?
2. Any JavaScript errors in console?
3. Try hard refresh: **Ctrl+Shift+R** (Cmd+Shift+R on Mac)

**Solution:**
```bash
# Restart dev server
npm run dev
```

---

### Issue 2: "Permission denied"

**Problem:** User previously blocked notifications

**Solution - Reset Browser Permission:**

**Chrome:**
1. Click lock icon (left of address bar)
2. Click "Site settings"
3. Find "Notifications" → Change to "Allow"
4. Refresh page
5. Try test button again

**Firefox:**
1. Click info icon (left of address bar)
2. Click "Permissions" tab
3. Find "Receive Notifications" → Change to "Allow"
4. Refresh page
5. Try test button again

**Safari:**
1. Safari → Preferences → Websites
2. Click "Notifications" in left sidebar
3. Find localhost → Change to "Allow"
4. Refresh page
5. Try test button again

---

### Issue 3: Notification Sends But Doesn't Show

**Problem:** OS or browser blocking display

**Check OS Notification Settings:**

**macOS:**
1. System Preferences → Notifications & Focus
2. Find your browser (Chrome/Firefox/Safari)
3. Enable "Allow Notifications"
4. Turn off "Do Not Disturb" mode

**Windows:**
1. Settings → System → Notifications
2. Find your browser
3. Enable notifications
4. Turn off "Focus Assist"

**Linux:**
1. Settings → Notifications
2. Enable notifications for your browser
3. Check "Do Not Disturb" is off

---

### Issue 4: Alert Box Appears Instead

**If you see alert saying:**
- "Your browser does not support notifications"
  → Try different browser (Chrome recommended)

- "Notification permission denied"
  → Reset permission (see above)

- "Please enable notifications in your browser settings"
  → Follow browser-specific steps above

---

## Quick Test in Console

Run these commands directly in browser console:

### Test 1: Check Support
```javascript
console.log('Notifications supported:', 'Notification' in window);
```
**Expected:** `true`

### Test 2: Check Permission
```javascript
console.log('Current permission:', Notification.permission);
```
**Expected:** `"granted"` (or `"default"` if not asked yet)

### Test 3: Request Permission Manually
```javascript
Notification.requestPermission().then(permission => {
  console.log('Permission result:', permission);
});
```
**Expected:** Browser popup appears

### Test 4: Send Test Manually
```javascript
if (Notification.permission === 'granted') {
  new Notification('Manual Test', {
    body: 'This is a manual test notification',
    icon: '/logo.png'
  });
  console.log('✅ Manual notification sent');
} else {
  console.log('❌ Permission not granted');
}
```
**Expected:** Notification appears

---

## Still Not Working?

### Try This Checklist:

1. **Browser Check:**
   - [ ] Using Chrome, Firefox, or Edge (not Safari on Mac)
   - [ ] Browser is up to date
   - [ ] Not in incognito/private mode

2. **URL Check:**
   - [ ] On http://localhost:5173/ (not file://)
   - [ ] Page is fully loaded
   - [ ] No JavaScript errors in console

3. **Permission Check:**
   - [ ] Notification.permission is "granted"
   - [ ] No alert boxes appearing
   - [ ] Can see permission request popup

4. **OS Check:**
   - [ ] OS notifications enabled for browser
   - [ ] Do Not Disturb is OFF
   - [ ] Focus Assist is OFF (Windows)

5. **Console Check:**
   - [ ] See "Test notification button clicked" message
   - [ ] See "✅ Test notification sent successfully"
   - [ ] No error messages

---

## Working Solution: Manual Permission

If button doesn't work, grant permission manually:

```javascript
// In browser console:
Notification.requestPermission().then(result => {
  if (result === 'granted') {
    new Notification('Manual Test', {
      body: 'Notifications are now enabled!',
      icon: '/logo.png'
    });
  }
});
```

Then try the button again.

---

## What Should Happen (Video Walkthrough)

**Expected Flow:**
1. Click "🔔 Test Notification"
2. Browser shows: "localhost:5173 wants to send notifications" → Click "Allow"
3. Notification appears (top-right on desktop, varies by OS)
4. Notification says: "🎉 Notifications are working!"
5. Console shows: "✅ Test notification sent successfully"

**Screenshot of Working Notification:**
```
┌────────────────────────────────┐
│  RehabMotion Test              │
│                                │
│  🎉 Notifications are working! │
│  You will receive exercise     │
│  reminders.                    │
└────────────────────────────────┘
```

---

## Alternative Test Method

If the button doesn't work, try this:

1. Open **browser console** (F12)
2. Paste and run:
```javascript
(async () => {
  console.log('Starting manual test...');
  
  if (!('Notification' in window)) {
    alert('Notifications not supported');
    return;
  }
  
  const permission = await Notification.requestPermission();
  console.log('Permission:', permission);
  
  if (permission === 'granted') {
    new Notification('Manual Test', {
      body: 'This test was run from console',
      icon: '/logo.png'
    });
    console.log('✅ Notification sent!');
  } else {
    console.log('❌ Permission denied');
  }
})();
```

---

## Report Back

After trying the test button, please check console and tell me:

1. **What messages appear in console?**
2. **Any alert boxes?**
3. **Did permission popup appear?**
4. **Current browser and OS?**

This will help me diagnose the exact issue!

---

## Quick Fix

The updated code now includes:
- ✅ Detailed console logging
- ✅ Better error messages
- ✅ Permission status checks
- ✅ User-friendly alerts

**Refresh your browser and try again!** The console will now tell you exactly what's happening.

---

**Test URL:** http://localhost:5173/ → Settings → Exercise Reminders → 🔔 Test Notification

**Watch console for:** 🔔 messages and ✅/❌ status indicators
