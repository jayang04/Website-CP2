# Trigger Vercel Deployment

Your changes have been pushed to GitHub, but Vercel might not have auto-deployed yet.

## Option 1: Manual Redeploy (Easiest)

1. Go to your Vercel dashboard: https://vercel.com/jayang04s-projects/website-cp-2
2. Click "Deployments" tab
3. Find the latest deployment (should be commit `9102692` or `c642fbf`)
4. If it's not there, click the "..." menu on any deployment
5. Click "Redeploy" → Use existing Build Cache: **NO** (important!)
6. This will trigger a fresh build with Git LFS videos

## Option 2: Check Vercel Git Integration

1. Go to Project Settings → Git
2. Ensure your GitHub repo is connected: `jayang04/Website-CP2`
3. Make sure "Auto-deploy" is enabled for the `main` branch
4. If not connected, reconnect your GitHub repository

## Option 3: Force Push (Nuclear Option)

If nothing works, force a new deployment:

```bash
# Make a small change to trigger deployment
echo "\n# Force deployment" >> README.md
git add README.md
git commit -m "Trigger Vercel deployment"
git push origin main
```

## ✅ What Should Happen:

When Vercel starts building with Git LFS:
- Build logs should show: "Git LFS: Downloading files..."
- Videos will be included in the build
- Deployment size will be larger (~2.3GB)
- Videos will work at: `your-domain.vercel.app/exercise-demo-videos/...`

## 🔍 Check Build Logs:

1. Click on a deployment in Vercel
2. Go to "Build Logs" 
3. Look for Git LFS messages
4. Should see lines like:
   ```
   Downloading exercise-demo-videos/ACL/video.mp4
   Git LFS: (47 of 47 files) 2.3 GB / 2.3 GB
   ```

## ⚠️ Important:

The deployment shown in your screenshot (ae9e3d6) is from **BEFORE** you added videos. 
You need the deployment from commit `c642fbf` or `9102692` which includes the Git LFS setup.

---

**Next Step:** Refresh Vercel dashboard and look for the new deployment! 🚀
