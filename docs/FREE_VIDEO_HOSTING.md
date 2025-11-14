# Free Video Hosting Solutions

## The Problem
Firebase Storage charges after 1GB/day bandwidth, which isn't truly free for a live app.

---

## ✅ BEST FREE OPTIONS

### **Option 1: GitHub LFS + jsDelivr CDN (RECOMMENDED - 100% FREE)**

GitHub LFS allows large files, and jsDelivr provides FREE CDN delivery.

#### Setup Steps:

1. **Install Git LFS:**
```bash
# On macOS
brew install git-lfs

# Initialize in your repo
cd /Users/azx/Desktop/Website-CP2
git lfs install
```

2. **Track video files:**
```bash
# Track all MP4 files
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.webm"

# This creates/updates .gitattributes
git add .gitattributes
```

3. **Add and push videos:**
```bash
git add public/exercise-demo-videos/
git commit -m "Add exercise videos via LFS"
git push origin main
```

4. **Use jsDelivr CDN URLs:**
```
https://cdn.jsdelivr.net/gh/[YOUR-USERNAME]/[REPO-NAME]@main/public/exercise-demo-videos/ACL/video.mp4
```

**Limits:** 
- ✅ FREE bandwidth via jsDelivr CDN
- ✅ Unlimited traffic
- ✅ Global CDN distribution
- ⚠️ Files up to 100MB per file (compress videos if needed)

---

### **Option 2: Cloudinary (FREE Tier - Best for Videos)**

FREE tier includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Video transformations & optimization
- ✅ Automatic compression

#### Setup:

1. **Sign up:**
   - Go to: https://cloudinary.com/users/register/free
   - Free account, no credit card needed

2. **Upload videos:**
   - Use their web interface or CLI
   - Videos are automatically optimized

3. **Get URLs:**
   - Format: `https://res.cloudinary.com/[your-cloud-name]/video/upload/[video-id].mp4`

4. **Update .env:**
```env
VITE_VIDEO_BASE_URL=https://res.cloudinary.com/your-cloud-name/video/upload
```

---

### **Option 3: Bunny CDN (FREE $1 credit = ~100GB bandwidth)**

Cheapest CDN option with generous free credit.

#### Setup:

1. **Sign up:** https://bunny.net/
   - Get $1 free credit (no card needed)
   - $1 = ~100GB bandwidth

2. **Create Storage Zone:**
   - Create a new storage zone
   - Upload videos via FTP or web interface

3. **Enable Pull Zone:**
   - Get CDN URL
   - Format: `https://[your-zone].b-cdn.net/exercise-demo-videos/...`

4. **Update .env:**
```env
VITE_VIDEO_BASE_URL=https://your-zone.b-cdn.net/exercise-demo-videos
```

**Cost after free credit:** ~$0.01/GB bandwidth (very cheap!)

---

### **Option 4: Internet Archive (100% FREE - Unlimited)**

Truly free and unlimited hosting!

#### Setup:

1. **Create account:** https://archive.org/account/signup
   - Completely free, no limits

2. **Upload videos:**
   - Create a new item/collection
   - Upload your exercise videos
   - Make them public

3. **Get URLs:**
   - Format: `https://archive.org/download/[item-name]/[video-name].mp4`

4. **Update .env:**
```env
VITE_VIDEO_BASE_URL=https://archive.org/download/rehabmotion-exercises
```

**Benefits:**
- ✅ 100% FREE forever
- ✅ Unlimited bandwidth
- ✅ Permanent hosting
- ⚠️ Slower speeds than CDNs
- ⚠️ Best for non-profit/educational use

---

### **Option 5: YouTube (100% FREE)**

Host videos on YouTube as unlisted/public videos.

#### Setup:

1. **Upload to YouTube:**
   - Create a YouTube channel
   - Upload all exercise videos as "Unlisted"
   - Get video IDs

2. **Embed in your app:**
   - Use YouTube iframe player
   - Or use youtube-dl/yt-dlp for direct video URLs

**Benefits:**
- ✅ 100% FREE
- ✅ Unlimited bandwidth
- ✅ Global CDN
- ⚠️ Requires iframe embed (not direct video URLs)

---

## 🎯 MY RECOMMENDATION: GitHub LFS + jsDelivr

**Why:**
1. ✅ Completely FREE forever
2. ✅ No bandwidth limits
3. ✅ Fast global CDN
4. ✅ Already using GitHub
5. ✅ Easy to set up

**Setup time:** 5 minutes

---

## Quick Start Guide (GitHub LFS + jsDelivr)

### Step 1: Install Git LFS
```bash
brew install git-lfs
cd /Users/azx/Desktop/Website-CP2
git lfs install
```

### Step 2: Track videos
```bash
git lfs track "*.mp4"
git add .gitattributes
```

### Step 3: Compress videos (optional but recommended)
```bash
# Install ffmpeg if you don't have it
brew install ffmpeg

# Compress videos to reduce size (one-time operation)
cd public/exercise-demo-videos
find . -name "*.mp4" -exec sh -c 'ffmpeg -i "$1" -vcodec libx264 -crf 28 "${1%.mp4}_compressed.mp4" && mv "${1%.mp4}_compressed.mp4" "$1"' _ {} \;
```

### Step 4: Push to GitHub
```bash
git add public/exercise-demo-videos/
git commit -m "Add exercise videos via LFS"
git push origin main
```

### Step 5: Update video URLs in your code

Videos will be available at:
```
https://cdn.jsdelivr.net/gh/[YOUR-GITHUB-USERNAME]/Website-CP2@main/public/exercise-demo-videos/ACL/video.mp4
```

---

## Need Help Choosing?

| Option | Speed | Reliability | Bandwidth | Setup Time | Best For |
|--------|-------|-------------|-----------|------------|----------|
| GitHub LFS + jsDelivr | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Unlimited | 5 min | **Recommended** |
| Cloudinary | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 25GB/month | 10 min | Video optimization |
| Bunny CDN | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~100GB (then cheap) | 15 min | Scaling later |
| Internet Archive | ⭐⭐⭐ | ⭐⭐⭐⭐ | Unlimited | 20 min | 100% free forever |
| YouTube | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Unlimited | 30 min | Iframe embeds |

---

## Let me know which option you want, and I'll help you set it up! 🚀
