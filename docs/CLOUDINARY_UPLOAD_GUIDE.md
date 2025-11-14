# Upload Videos to Cloudinary

Your Cloudinary account is ready!
**Cloud Name:** `dthuqyxmv`

## Option 1: Upload via Web Interface (Easiest - 5 minutes)

### Step 1: Go to Media Library
1. Go to: https://console.cloudinary.com/console/media_library
2. You're already logged in!

### Step 2: Create Folder Structure
1. Click "Create Folder" button
2. Create folder: `exercise-demo-videos`
3. Inside that, create subfolders:
   - `ACL`
   - `MCL`
   - `Meniscus_Tear` (use underscore, not space)
   - `Lateral_Ankle_Sprain`
   - `Medial_Ankle_Sprain`
   - `High_Ankle_Sprain`

### Step 3: Upload Videos
1. Click on each folder
2. Click "Upload" button
3. Select videos from your local folder:
   - For ACL: Select all videos from `public/exercise-demo-videos/ACL/`
   - For MCL: Select all videos from `public/exercise-demo-videos/MCL/`
   - etc.

**Important:** When uploading, Cloudinary will:
- ✅ Automatically compress videos
- ✅ Optimize for web delivery
- ✅ Generate thumbnail
- ✅ Convert to multiple formats

### Step 4: Rename Files (Important!)
Cloudinary uses underscores instead of spaces. After upload:
- Rename: `Straight Leg Raises` → `Straight_Leg_Raises`
- Or do this automatically in bulk

---

## Option 2: Bulk Upload via CLI (Faster - 10 minutes)

I can create an upload script for you!

### Quick Setup:
1. Click "View API Keys" in your Cloudinary dashboard
2. Get your **API Key** and **API Secret**
3. Give me these (or I'll create an upload script)

---

## After Upload

Your video URLs will be:
```
https://res.cloudinary.com/dthuqyxmv/video/upload/exercise-demo-videos/ACL/Straight_Leg_Raises.mp4
```

**Much faster than Git LFS!** And with automatic optimization! 🚀

---

## Video URL Format

The code is already set up to use:
```
/exercise-demo-videos/ACL/Straight Leg Raises.mp4
```

And convert to:
```
https://res.cloudinary.com/dthuqyxmv/video/upload/q_auto,f_auto/exercise-demo-videos/ACL/Straight_Leg_Raises
```

---

## Next Steps:

1. **Upload your videos** using Option 1 above (easiest)
2. **Test one video URL** in browser to verify
3. **Tell me when done** - I'll update your app to use Cloudinary
4. **Deploy to Vercel** - Videos will load much faster!

---

## Need Help?

Let me know if you want me to:
- Create an automatic upload script
- Help with video organization
- Test the URLs

**Ready to upload?** Go to Media Library and start uploading! 📹
