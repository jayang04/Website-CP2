# Cloudinary Folder Structure Guide

## ✅ What You Need in Cloudinary

Your videos should be organized in Cloudinary **exactly** like this:

```
📁 exercise-demo-videos/
├── 📁 ACL/
│   ├── Ankle_Pumps
│   ├── Bridges
│   ├── Heel_Slide
│   ├── Quad_Set
│   ├── Short_Arc_Quad
│   └── Straight_Leg_Raises
│
├── 📁 MCL/
│   ├── Banded_Hip_Abduction
│   ├── Heel_Slide
│   ├── Hip_Adduction_(Seated_Pillow:Towel_Squeeze)
│   ├── Hip_Flexion_with_Straight_Leg_Raise
│   ├── Lateral_Step-Up
│   ├── Quad_Set
│   └── Short_Arc_Quad
│
├── 📁 Meniscus_Tear/    ⚠️ Note: underscore, not space!
│   ├── Ankle_Pumps
│   ├── Heel_Slide
│   ├── Hip_Abduction
│   ├── Hip_Adduction
│   ├── Isometric_Hamstring_Curl_(Glute_Bridge)
│   ├── Lateral_Step-Up
│   ├── Mini_Squats
│   ├── Quad_Set
│   └── Straight_Leg_Raise
│
├── 📁 Lateral_Ankle_Sprain/    ⚠️ Note: underscores!
│   ├── Ankle_Dorsiflexion_Mobility
│   ├── Ankle_Strengthening_(Isometric:Eversion_Band_Work)
│   ├── Calf_Raise_Exercise
│   ├── Forward_Lunge
│   ├── Hop_to_Landing
│   ├── Proprioceptive_Control_(Clock_Reaches)
│   └── Single-Leg_Squat
│
├── 📁 Medial_Ankle_Sprain/    ⚠️ Note: underscores!
│   ├── Ankle_Circles
│   ├── Ankle_Dorsiflexion_–_Wall_Support
│   ├── Ankle_Eversion_–_Band
│   ├── Ankle_Inversion_–_Band
│   ├── Ankle_Pumps
│   ├── Double-Leg_Jump
│   ├── Heel_Raise_–_Off_Step
│   ├── Lateral_Bound
│   ├── Single-Leg_Balance
│   └── Single-Leg_Hops
│
└── 📁 High_Ankle_Sprain/    ⚠️ Note: underscores!
    ├── Ankle_Circles
    ├── Double-Leg_Calf_Raises
    ├── Elevated_Ankle_Pumps
    ├── Glute_Bridge
    ├── Progressive_Weight_Bearing
    └── Proprioceptive_Control_(Clock_Reaches)
```

## 🔑 Important Rules

### 1. **Folder Names**
- Replace **spaces** with **underscores** (`_`)
- ✅ Correct: `Lateral_Ankle_Sprain`
- ❌ Wrong: `Lateral Ankle Sprain`

### 2. **File Names (without extension)**
- Replace **spaces** with **underscores** (`_`)
- Keep **hyphens** as is (`-`)
- Keep **colons** (`:`) and **parentheses** as is
- ✅ Correct: `Ankle_Strengthening_(Isometric:Eversion_Band_Work)`
- ❌ Wrong: `Ankle Strengthening (Isometric Eversion Band Work)`

### 3. **No File Extensions**
- In Cloudinary, you don't need `.mp4`
- Cloudinary stores without extensions
- Our code adds the proper format automatically

## 🛠️ How to Upload to Cloudinary

### Option 1: Using Cloudinary Dashboard (Recommended)

1. **Log into Cloudinary**: https://cloudinary.com/console

2. **Go to Media Library**

3. **Create Folder Structure**:
   - Click "Create Folder"
   - Create: `exercise-demo-videos`
   - Inside that, create subfolders:
     - `ACL`
     - `MCL`
     - `Meniscus_Tear` ⚠️ (use underscore!)
     - `Lateral_Ankle_Sprain` ⚠️ (use underscores!)
     - `Medial_Ankle_Sprain` ⚠️ (use underscores!)
     - `High_Ankle_Sprain` ⚠️ (use underscores!)

4. **Upload Videos**:
   - Navigate into each folder (e.g., `ACL`)
   - Click "Upload"
   - Select videos for that injury type
   - **Important**: When uploading, check the "Public ID" field
   - Make sure spaces become underscores

### Option 2: Using Cloudinary CLI

If you have many videos, use the CLI for batch upload:

```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Configure (you'll need your cloud name, API key, API secret)
cld config

# Upload a folder (from your project root)
cld uploader upload_dir public/exercise-demo-videos/ACL \
  --folder exercise-demo-videos/ACL \
  --use-filename true \
  --unique-filename false
```

**Repeat for each injury folder**.

## 🔍 Verify Your Upload

### Test Individual URLs

After uploading, test each video URL in your browser:

**Format**: 
```
https://res.cloudinary.com/{cloud_name}/video/upload/{path}
```

**Your Cloud Name**: `dthuqyxmv`

**Example URLs to test**:

```
https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/ACL/Quad_Set.mp4

https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/MCL/Heel_Slide.mp4

https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Meniscus_Tear/Ankle_Pumps.mp4

https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/Lateral_Ankle_Sprain/Calf_Raise_Exercise.mp4
```

**If a video loads** = ✅ Correct structure
**If 404 error** = ❌ Check folder/file naming

## ⚠️ Common Issues

### Issue 1: Spaces in Folder Names
**Problem**: Uploaded as "Meniscus Tear" instead of "Meniscus_Tear"

**Solution**: 
- In Cloudinary, rename the folder to use underscores
- Or re-upload to correct folder name

### Issue 2: Spaces in File Names
**Problem**: Video uploaded as "Quad Set" instead of "Quad_Set"

**Solution**:
- In Cloudinary, rename the asset's Public ID
- Go to asset details → Edit → Change Public ID

### Issue 3: Wrong Folder Path
**Problem**: Videos in root instead of `exercise-demo-videos/ACL/`

**Solution**:
- Move videos to correct folder in Cloudinary
- Or re-upload with correct path

## 📊 Expected Video Count

You should have **46 total videos**:

- ACL: 6 videos
- MCL: 7 videos  
- Meniscus Tear: 9 videos
- Lateral Ankle Sprain: 7 videos
- Medial Ankle Sprain: 10 videos
- High Ankle Sprain: 6 videos

**Total**: 45 videos

## 🎯 Quick Checklist

Before you say "I'm done uploading":

- [ ] Created `exercise-demo-videos` folder
- [ ] Created 6 injury subfolders with underscores in names
- [ ] Uploaded all videos to correct folders
- [ ] Renamed files to use underscores instead of spaces
- [ ] Tested at least 2-3 video URLs in browser
- [ ] All test URLs load successfully

## 💡 Pro Tips

1. **Batch Rename**: If you need to rename many files, use Cloudinary's bulk operations
2. **Auto-Format**: You don't need to convert videos - Cloudinary handles format optimization
3. **Quality**: Upload highest quality available - Cloudinary optimizes on delivery
4. **Keep Originals**: Keep your local copies as backup

## 🆘 Need Help?

If videos still don't load after following this guide:

1. Check the browser console for the exact URL being requested
2. Copy that URL and paste it directly in browser
3. Compare the URL structure with what's in Cloudinary
4. Adjust folder/file names in Cloudinary to match

---

**Next Step**: After organizing your Cloudinary library, test your app with `npm run dev`!
