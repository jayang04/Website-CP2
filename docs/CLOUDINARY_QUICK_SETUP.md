# 🎯 Cloudinary Setup - Quick Visual Guide

## What You Need To Do

### ✅ YES - You Need to Organize Your Videos in Cloudinary

Since you already uploaded them, here's what to check/fix:

---

## 📋 3-Step Checklist

### Step 1: Check Your Folder Structure

Your Cloudinary folders should look like this:

```
exercise-demo-videos/
├── ACL/
├── MCL/
├── Meniscus_Tear/          ← Use UNDERSCORE not space!
├── Lateral_Ankle_Sprain/   ← Use UNDERSCORES not spaces!
├── Medial_Ankle_Sprain/    ← Use UNDERSCORES not spaces!
└── High_Ankle_Sprain/      ← Use UNDERSCORES not spaces!
```

**🔍 If you see spaces in folder names** → Rename them to use underscores

---

### Step 2: Check Your File Names

Each video's "Public ID" should have underscores instead of spaces:

**❌ Wrong**:
- `Quad Set`
- `Heel Slide`
- `Straight Leg Raises`

**✅ Correct**:
- `Quad_Set`
- `Heel_Slide`
- `Straight_Leg_Raises`

**🔍 If you see spaces in video names** → Rename them to use underscores

---

### Step 3: Test Your URLs

Open these URLs in your browser (replace with your actual videos):

```
https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/ACL/Quad_Set.mp4

https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Meniscus_Tear/Heel_Slide.mp4

https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Lateral_Ankle_Sprain/Calf_Raise_Exercise.mp4
```

**✅ Video plays?** → You're good!
**❌ 404 error?** → Check folder/file naming

---

## 🎨 Visual Example

### Before (Wrong) ❌
```
Cloudinary Media Library:
├── exercise-demo-videos/
    ├── ACL/
    │   └── Quad Set        ← Space is WRONG
    ├── Meniscus Tear/      ← Space is WRONG
    └── Lateral Ankle Sprain/  ← Spaces are WRONG
```

### After (Correct) ✅
```
Cloudinary Media Library:
├── exercise-demo-videos/
    ├── ACL/
    │   └── Quad_Set        ← Underscore is CORRECT
    ├── Meniscus_Tear/      ← Underscore is CORRECT
    └── Lateral_Ankle_Sprain/  ← Underscores are CORRECT
```

---

## 🛠️ How to Fix in Cloudinary Dashboard

### Fix Folder Names:
1. Log into https://cloudinary.com/console
2. Go to **Media Library**
3. Find folders with spaces
4. Right-click → **Rename**
5. Replace spaces with underscores

### Fix File Names:
1. Click on a video
2. Click **Edit** button
3. Change the **Public ID** field
4. Replace spaces with underscores
5. Click **Save**

### Batch Rename (if you have many):
1. Select multiple videos (checkbox)
2. Click **Actions** → **Rename**
3. Use bulk rename pattern

---

## 💡 The One Rule

### **Replace ALL spaces with underscores `_`**

That's literally it! Everything else stays the same:
- Keep hyphens: `Step-Up` stays `Step-Up`
- Keep parentheses: `(Glute Bridge)` stays `(Glute_Bridge)`
- Keep colons: `:` stays `:`

---

## 🧪 Test Your App

After organizing Cloudinary:

```bash
npm run dev
```

Then:
1. Go to **Injury Rehab Program**
2. Select **ACL Tear** (or any injury)
3. View the exercises
4. Click on any exercise card
5. **Video should load from Cloudinary!**

---

## ❓ FAQ

**Q: Do I need to convert videos to a specific format?**
A: No! Upload as MP4. Cloudinary handles optimization.

**Q: Do I need to remove .mp4 extension?**
A: In the Public ID, yes. But you can keep it in the URL - Cloudinary handles both.

**Q: What if some videos work but others don't?**
A: Check the browser console. Copy the failing URL and compare with what's in Cloudinary.

**Q: Can I just rename my local files and re-upload?**
A: Yes! That works too. Rename local files (spaces → underscores), then upload to Cloudinary.

---

## 📊 Inventory Check

You should have **45 total videos**:

| Injury Type | Count | Folder Name in Cloudinary |
|-------------|-------|---------------------------|
| ACL | 6 | `ACL` |
| MCL | 7 | `MCL` |
| Meniscus Tear | 9 | `Meniscus_Tear` ⚠️ |
| Lateral Ankle Sprain | 7 | `Lateral_Ankle_Sprain` ⚠️ |
| Medial Ankle Sprain | 10 | `Medial_Ankle_Sprain` ⚠️ |
| High Ankle Sprain | 6 | `High_Ankle_Sprain` ⚠️ |

---

## 🎉 Done Checklist

Mark these off as you complete them:

- [ ] Logged into Cloudinary dashboard
- [ ] Found my uploaded videos
- [ ] Renamed folders with underscores (4 folders need this)
- [ ] Renamed video Public IDs with underscores (all 45 videos)
- [ ] Tested 2-3 video URLs in browser - they work!
- [ ] Ran `npm run dev` and tested in app
- [ ] Videos load and play correctly! 🎉

---

**Need more details?** See:
- `CLOUDINARY_FOLDER_STRUCTURE.md` - Complete folder structure
- `CLOUDINARY_NAMING_GUIDE.md` - Detailed naming reference with all 45 videos
- `CLOUDINARY_VERIFICATION.md` - Testing and troubleshooting guide
