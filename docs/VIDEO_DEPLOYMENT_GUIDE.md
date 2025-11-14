# Video Deployment Guide for Vercel

## Problem
Exercise demo videos are too large to store in GitHub repositories and deploy to Vercel directly. Videos need to be hosted on a separate cloud storage service.

## Recommended Solutions

### Option 1: Firebase Storage (Recommended - Already Configured)

#### Step 1: Upload Videos to Firebase Storage

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: `capstone-project-2-d0caf`

2. **Navigate to Storage:**
   - Click on "Storage" in the left sidebar
   - Click "Get Started" if you haven't enabled Storage yet
   - Accept the security rules (we'll configure them next)

3. **Upload Your Videos:**
   Create this folder structure:
   ```
   exercise-demo-videos/
   ├── ACL/
   │   ├── straight-leg-raises.mp4
   │   ├── quad-sets.mp4
   │   └── ...
   ├── MCL/
   │   ├── hip-abduction.mp4
   │   └── ...
   ├── Meniscus Tear/
   │   ├── mini-squats.mp4
   │   └── ...
   ├── Lateral Ankle Sprain/
   │   └── ...
   ├── Medial Ankle Sprain/
   │   └── ...
   └── High Ankle Sprain/
       └── ...
   ```

4. **Upload Process:**
   - Click "Upload files" or "Upload folder"
   - Select your local `public/exercise-demo-videos` folder
   - Wait for upload to complete

#### Step 2: Configure Storage Rules

In Firebase Console → Storage → Rules, add these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to exercise videos
    match /exercise-demo-videos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can upload
    }
  }
}
```

#### Step 3: Get Video URLs

After uploading, you can get URLs in two ways:

**Option A: Manual (for each video):**
1. Click on a video file in Firebase Storage
2. Click "Get download URL"
3. Copy the URL

**Option B: Programmatic (recommended):**
Use the `videoService.ts` that was just created. It will automatically generate URLs.

#### Step 4: Update Your Code

The video URLs will be automatically generated using the pattern:
```
https://firebasestorage.googleapis.com/v0/b/capstone-project-2-d0caf.firebasestorage.app/o/exercise-demo-videos%2F[FOLDER]%2F[FILENAME]?alt=media
```

No code changes needed! The `videoService.ts` handles this automatically.

---

### Option 2: Cloudflare R2 (Free Alternative)

1. **Sign up for Cloudflare R2:**
   - Visit: https://www.cloudflare.com/products/r2/
   - Free tier: 10GB storage, 10 million Class A operations/month

2. **Create a Bucket:**
   - Name it something like `rehabmotion-videos`
   - Enable public access

3. **Upload Videos:**
   - Use Cloudflare dashboard or CLI
   - Maintain the same folder structure

4. **Get Public URL:**
   - Configure a custom domain or use R2 public URL
   - Update `VITE_VIDEO_BASE_URL` in `.env`

---

### Option 3: AWS S3

1. **Create S3 Bucket:**
   - Sign in to AWS Console
   - Create a new S3 bucket
   - Enable public access for videos

2. **Upload Videos:**
   - Use AWS Console or AWS CLI
   - Maintain folder structure

3. **Configure CORS:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

4. **Get Public URLs:**
   - Format: `https://[bucket-name].s3.[region].amazonaws.com/exercise-demo-videos/...`
   - Update `.env` file

---

## Environment Configuration

Create a `.env` file in your project root:

```env
# For Firebase Storage (default)
VITE_VIDEO_BASE_URL=https://firebasestorage.googleapis.com/v0/b/capstone-project-2-d0caf.firebasestorage.app/o/exercise-demo-videos

# OR for Cloudflare R2
# VITE_VIDEO_BASE_URL=https://pub-xxxxx.r2.dev/exercise-demo-videos

# OR for AWS S3
# VITE_VIDEO_BASE_URL=https://your-bucket.s3.amazonaws.com/exercise-demo-videos
```

Add `.env` to your `.gitignore`:
```
.env
.env.local
```

---

## Update Vercel Deployment

1. **Add Environment Variable in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_VIDEO_BASE_URL` with your storage URL
   - Deploy again

---

## Testing

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   Check if videos load correctly

2. **Production Testing:**
   - Deploy to Vercel
   - Open your deployed site
   - Check browser console for any video loading errors

---

## Troubleshooting

### Videos not loading?

1. **Check CORS:**
   - Firebase Storage should work automatically
   - For S3/R2, ensure CORS is configured

2. **Check URLs:**
   - Open browser DevTools → Network tab
   - Look for failed video requests
   - Verify the URL format

3. **Check Storage Rules:**
   - Ensure public read access is enabled

4. **Check File Names:**
   - Ensure file names match exactly (case-sensitive)
   - No special characters or spaces (use hyphens)

---

## Cost Comparison

| Service | Free Tier | Bandwidth | Best For |
|---------|-----------|-----------|----------|
| Firebase Storage | 5GB storage, 1GB/day download | 1GB/day free | Already using Firebase |
| Cloudflare R2 | 10GB storage | Unlimited egress | High traffic |
| AWS S3 | 5GB storage, 15GB transfer | Pay per use | Enterprise |

---

## Recommendation

**Use Firebase Storage** since:
- ✅ Already configured in your project
- ✅ Easy integration
- ✅ Free tier is sufficient for demo
- ✅ Good performance globally
- ✅ Simple security rules

If you expect high traffic, consider Cloudflare R2 for unlimited bandwidth.
