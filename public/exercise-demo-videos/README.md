# Exercise Demo Videos

## ⚠️ Important: Videos Not in Git Repository

The exercise demonstration videos are **not included** in the Git repository due to their large file size (~2GB total).

## 📁 Expected Structure

```
exercise-demo-videos/
├── ACL/
│   ├── Ankle Pumps.mp4
│   ├── Bridges.mp4
│   ├── Heel Slide.mp4
│   ├── Quad Set.mp4
│   ├── Short Arc Quad.mp4
│   └── Straight Leg Raises.mp4
├── MCL/
│   ├── Banded Hip Abduction.mp4
│   ├── Heel Slide.mp4
│   ├── Hip Adduction (Seated Pillow:Towel Squeeze).mp4
│   ├── Hip Flexion with Straight Leg Raise.mp4
│   ├── Lateral Step-Up.mp4
│   ├── Quad Set.mp4
│   ├── Short Arc Quad.mp4
│   └── Wall Heel Slide.mp4
├── Meniscus Tear/
│   ├── Heel Slide.mp4
│   ├── Hip Abduction.mp4
│   ├── Hip Adduction.mp4
│   ├── Isometric Hamstring Curl (Glute Bridge).mp4
│   ├── Lateral Step-Up.mp4
│   ├── Mini Squats.mp4
│   ├── Quad Set.mp4
│   └── Straight Leg Raises.mp4
├── Lateral Ankle Sprain/
│   ├── Ankle Dorsiflexion Mobility.mp4
│   ├── Ankle Strengthening (Isometric:Eversion Band Work).mp4
│   ├── Calf Raise Exercise.mp4
│   ├── Forward Lunge.mp4
│   ├── Hop to Landing.mp4
│   ├── Proprioceptive Control (Clock Reaches).mp4
│   └── Single-Leg Squat.mp4
├── High Ankle Sprain/
│   ├── Ankle Circles.mp4
│   ├── Double-Leg Calf Raises.mp4
│   ├── Elevated Ankle Pumps.mp4
│   ├── Glute Bridge.mp4
│   ├── Progressive Weight Bearing.mp4
│   └── Proprioceptive Control (Clock Reaches).mp4
└── Medial Ankle Sprain/
    ├── Ankle Circles.mp4
    ├── Ankle Dorsiflexion – Wall Support.mp4
    ├── Ankle Eversion – Band.mp4
    ├── Ankle Inversion – Band.mp4
    ├── Ankle Pumps.mp4
    ├── Double-Leg Jump.mp4
    └── ...
```

## 🚀 For New Team Members

### Option 1: Local Videos
1. Obtain the video files from the project lead
2. Extract them to `public/exercise-demo-videos/`
3. Ensure folder structure matches above

### Option 2: Cloud Storage (Recommended for Production)
Store videos on:
- **AWS S3**
- **Azure Blob Storage**
- **Cloudinary**
- **Vimeo/YouTube (private)**

Update video URLs in `src/data/injuryPlans.ts`:
```typescript
media: {
  videoUrl: 'https://your-cdn.com/videos/ACL/Quad Set.mp4'
}
```

## 📊 Video Statistics

- **Total Videos**: 41+ demonstration videos
- **Total Size**: ~2GB
- **Format**: MP4 (H.264)
- **Injury Types**: 6 different injuries covered

## 🔒 Security Note

If videos contain proprietary content or licensed material:
- Store in private cloud storage
- Use signed URLs with expiration
- Implement access control
- Add watermarks if needed

## 📝 Adding New Videos

1. Record/obtain video in MP4 format
2. Place in appropriate injury folder
3. Update `src/data/injuryPlans.ts`:
```typescript
{
  id: 'exercise-id',
  name: 'Exercise Name',
  // ...other properties
  media: {
    videoUrl: '/exercise-demo-videos/[Injury]/[Filename].mp4'
  }
}
```
4. Test locally before deployment

## ⚙️ Development Without Videos

The app gracefully handles missing videos by showing a placeholder:
```
🎥 Demo Coming Soon
```

You can develop without videos - the UI will still work perfectly!
