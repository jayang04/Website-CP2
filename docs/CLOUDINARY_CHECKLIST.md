# Cloudinary Organization Checklist

Use this as you organize your videos in Cloudinary!

---

## 🎯 Step 1: Rename Folders

Log into https://cloudinary.com/console → Media Library

- [ ] Found `exercise-demo-videos` folder
- [ ] Folder: `Meniscus Tear` → renamed to `Meniscus_Tear`
- [ ] Folder: `Lateral Ankle Sprain` → renamed to `Lateral_Ankle_Sprain`
- [ ] Folder: `Medial Ankle Sprain` → renamed to `Medial_Ankle_Sprain`
- [ ] Folder: `High Ankle Sprain` → renamed to `High_Ankle_Sprain`
- [ ] Verified: `ACL` and `MCL` folders exist (no changes needed)

---

## 🎯 Step 2: Rename Videos (or check they're correct)

### ACL Folder (6 videos)
- [ ] `Quad_Set`
- [ ] `Heel_Slide`
- [ ] `Ankle_Pumps`
- [ ] `Short_Arc_Quad`
- [ ] `Straight_Leg_Raises`
- [ ] `Bridges`

### MCL Folder (7 videos)
- [ ] `Heel_Slide`
- [ ] `Wall_Heel_Slide`
- [ ] `Quad_Set`
- [ ] `Short_Arc_Quad`
- [ ] `Banded_Hip_Abduction`
- [ ] `Hip_Flexion_with_Straight_Leg_Raise`
- [ ] `Hip_Adduction_(Seated_Pillow:Towel_Squeeze)`
- [ ] `Lateral_Step-Up`

### Meniscus_Tear Folder (9 videos)
- [ ] `Heel_Slide`
- [ ] `Quad_Set`
- [ ] `Ankle_Pumps`
- [ ] `Straight_Leg_Raise`
- [ ] `Hip_Abduction`
- [ ] `Hip_Adduction`
- [ ] `Isometric_Hamstring_Curl_(Glute_Bridge)`
- [ ] `Mini_Squats`
- [ ] `Lateral_Step-Up`

### Lateral_Ankle_Sprain Folder (7 videos)
- [ ] `Ankle_Dorsiflexion_Mobility`
- [ ] `Ankle_Strengthening_(Isometric:Eversion_Band_Work)`
- [ ] `Calf_Raise_Exercise`
- [ ] `Proprioceptive_Control_(Clock_Reaches)`
- [ ] `Single-Leg_Squat`
- [ ] `Forward_Lunge`
- [ ] `Hop_to_Landing`

### Medial_Ankle_Sprain Folder (10 videos)
- [ ] `Ankle_Pumps`
- [ ] `Ankle_Circles`
- [ ] `Single-Leg_Balance`
- [ ] `Ankle_Inversion_–_Band`
- [ ] `Ankle_Eversion_–_Band`
- [ ] `Heel_Raise_–_Off_Step`
- [ ] `Ankle_Dorsiflexion_–_Wall_Support`
- [ ] `Double-Leg_Jump`
- [ ] `Lateral_Bound`
- [ ] `Single-Leg_Hops`

### High_Ankle_Sprain Folder (6 videos)
- [ ] `Elevated_Ankle_Pumps`
- [ ] `Ankle_Circles`
- [ ] `Progressive_Weight_Bearing`
- [ ] `Double-Leg_Calf_Raises`
- [ ] `Proprioceptive_Control_(Clock_Reaches)`
- [ ] `Glute_Bridge`

---

## 🎯 Step 3: Test URLs

Open these in your browser (should play video):

- [ ] https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/ACL/Quad_Set.mp4
- [ ] https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/MCL/Heel_Slide.mp4
- [ ] https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Meniscus_Tear/Ankle_Pumps.mp4
- [ ] https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Lateral_Ankle_Sprain/Calf_Raise_Exercise.mp4
- [ ] https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Medial_Ankle_Sprain/Ankle_Circles.mp4
- [ ] https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/High_Ankle_Sprain/Glute_Bridge.mp4

✅ All test URLs work? Great! Move to Step 4.

---

## 🎯 Step 4: Test in Your App

- [ ] Run `npm run dev` in terminal
- [ ] Open app in browser
- [ ] Navigate to "Injury Rehab Program"
- [ ] Select "ACL Tear"
- [ ] View exercise videos - they should load!
- [ ] Click on an exercise card to open modal
- [ ] Video should play in modal
- [ ] Check browser console - no 404 errors
- [ ] Try another injury type (e.g., MCL Tear)
- [ ] Videos load correctly there too

✅ All videos load in app? **You're done!** 🎉

---

## 📊 Final Count

Total videos organized: _____ / 45

---

## ✅ Completion

- [ ] All folders renamed (4 folders)
- [ ] All videos renamed (45 videos)
- [ ] Test URLs work (6 tested)
- [ ] App loads videos correctly
- [ ] No console errors

**Status**: ⬜ In Progress / ✅ Complete

---

## 🆘 Troubleshooting

If a video doesn't load:
1. Copy the failing URL from browser console
2. Paste it directly in browser
3. Check what's different between URL and Cloudinary
4. Fix the folder/file name in Cloudinary
5. Refresh your app

---

*Save this file and check off items as you go!*
