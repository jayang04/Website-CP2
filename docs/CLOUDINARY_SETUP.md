# Cloudinary Setup Guide - FREE Video Hosting

## 📚 Quick Links

**Already uploaded videos?** 👉 See [`CLOUDINARY_QUICK_SETUP.md`](./CLOUDINARY_QUICK_SETUP.md) - What you need to fix!

**Need detailed naming guide?** 👉 See [`CLOUDINARY_NAMING_GUIDE.md`](./CLOUDINARY_NAMING_GUIDE.md) - All 45 video names

**Want folder structure details?** 👉 See [`CLOUDINARY_FOLDER_STRUCTURE.md`](./CLOUDINARY_FOLDER_STRUCTURE.md) - Complete structure

**Ready to test?** 👉 See [`CLOUDINARY_VERIFICATION.md`](./CLOUDINARY_VERIFICATION.md) - Testing guide

---

## Why Cloudinary?
- ✅ **25GB bandwidth/month FREE** (vs 1GB with Git LFS)
- ✅ **25GB storage FREE**
- ✅ Automatic video compression & optimization
- ✅ Global CDN for fast loading
- ✅ No credit card needed
- ✅ Better than Git LFS for production apps

---

## Step-by-Step Setup

### 1. Create Cloudinary Account (2 minutes)

1. Go to: https://cloudinary.com/users/register/free
2. Sign up with your email (no credit card needed)
3. Verify your email
4. You'll get your **Cloud Name**, **API Key**, and **API Secret**

### 2. Get Your Credentials

After signup, go to Dashboard:
- **Cloud Name**: (e.g., `dxxxx`)
- **API Key**: (numbers)
- **API Secret**: (keep this private)

Copy these - you'll need them!

---

## 3. Upload Videos to Cloudinary

### Option A: Web Interface (Easy)

1. Login to Cloudinary Dashboard
2. Click "Media Library"
3. Click "Upload" button
4. Select your `public/exercise-demo-videos` folder
5. Upload all videos (maintain folder structure)

### Option B: Command Line (Fast)

I can help you do this automatically! Just provide your credentials.

---

## 4. Update Your App to Use Cloudinary

Once videos are uploaded, your URLs will be:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/exercise-demo-videos/ACL/Straight_Leg_Raises.mp4
```

---

## Next Steps

1. **Sign up for Cloudinary** (link above)
2. **Copy your Cloud Name**
3. **Let me know** and I'll update your app to use Cloudinary URLs
4. **Upload videos** via web interface or I'll help with CLI

---

## Benefits You'll Get:

✅ **25x more bandwidth** than Git LFS (25GB vs 1GB)
✅ **Faster video loading** with global CDN
✅ **Automatic compression** - smaller file sizes
✅ **No Git LFS issues** on Vercel
✅ **Truly FREE** - no hidden costs

---

## Ready to Switch?

Let me know your Cloud Name and I'll:
1. Update your app to use Cloudinary URLs
2. Help you upload videos
3. Remove Git LFS (cleaner repo)
4. Deploy to Vercel with Cloudinary

🚀 **Much better solution than Git LFS!**
