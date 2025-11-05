# 🎥 Adding Exercise Videos and Images

This guide explains how to add demonstration videos and images to rehabilitation exercises.

---

## 📁 Directory Structure

Create these folders in your `public` directory:

```
public/
├── exercise-videos/
│   ├── knee/
│   │   ├── ankle-pumps.mp4
│   │   ├── quad-sets.mp4
│   │   └── ...
│   └── ankle/
│       ├── ankle-circles.mp4
│       └── ...
├── exercise-images/
│   ├── knee/
│   │   ├── ankle-pumps-1.jpg
│   │   ├── ankle-pumps-2.jpg
│   │   └── ...
│   └── ankle/
│       └── ...
└── thumbnails/
    ├── ankle-pumps-thumb.jpg
    └── ...
```

---

## 🎬 Adding Videos

### Step 1: Add video file to public folder
```
public/exercise-videos/knee/ankle-pumps.mp4
```

### Step 2: Update exercise in `src/data/injuryPlans.ts`

```typescript
{
  id: 'acl-1-1',
  name: 'Ankle Pumps',
  sets: 3,
  reps: 20,
  description: 'Point toes up and down...',
  image: '👣',
  media: {
    videoUrl: '/exercise-videos/knee/ankle-pumps.mp4',
    thumbnail: '/thumbnails/ankle-pumps-thumb.jpg' // optional
  },
  difficulty: 'beginner',
  painThreshold: 'No pain allowed'
}
```

### Video Requirements
- **Format:** MP4 (H.264 codec recommended)
- **Resolution:** 1280x720 (720p) or 1920x1080 (1080p)
- **Duration:** 10-30 seconds (short and clear)
- **File Size:** < 10MB per video
- **Content:** 
  - Show full body or focused area
  - Demonstrate proper form
  - Loop 2-3 repetitions
  - No audio required (but helpful)

---

## 🖼️ Adding Images

### Step 1: Add image files to public folder
```
public/exercise-images/knee/ankle-pumps-1.jpg
public/exercise-images/knee/ankle-pumps-2.jpg
public/exercise-images/knee/ankle-pumps-3.jpg
```

### Step 2: Update exercise in `src/data/injuryPlans.ts`

```typescript
{
  id: 'acl-1-1',
  name: 'Ankle Pumps',
  sets: 3,
  reps: 20,
  description: 'Point toes up and down...',
  image: '👣',
  media: {
    images: [
      '/exercise-images/knee/ankle-pumps-1.jpg',  // Starting position
      '/exercise-images/knee/ankle-pumps-2.jpg',  // Mid position
      '/exercise-images/knee/ankle-pumps-3.jpg'   // End position
    ]
  },
  difficulty: 'beginner',
  painThreshold: 'No pain allowed'
}
```

### Image Requirements
- **Format:** JPG, PNG, or WebP
- **Resolution:** 800x600 minimum, 1200x900 recommended
- **File Size:** < 500KB per image
- **Content:**
  - Clear, well-lit photos
  - Show proper form and positioning
  - 2-4 images showing exercise progression
  - Consistent background and angle

---

## 🎯 Complete Example

Here's a complete exercise with video:

```typescript
{
  id: 'acl-1-2',
  name: 'Quadriceps Sets',
  sets: 3,
  reps: 15,
  hold: '5 seconds',
  description: 'Tighten thigh muscle by pushing knee down into the floor/bed. Hold the contraction.',
  image: '🦵',
  media: {
    videoUrl: '/exercise-videos/knee/quad-sets.mp4',
    thumbnail: '/thumbnails/quad-sets-thumb.jpg'
  },
  difficulty: 'beginner',
  requiredEquipment: ['Mat or bed'],
  painThreshold: 'Mild discomfort acceptable'
}
```

And one with images:

```typescript
{
  id: 'acl-2-5',
  name: 'Mini Squats',
  sets: 3,
  reps: '10-12',
  description: 'Partial squat with feet shoulder-width apart. Do not bend knees past 60 degrees.',
  image: '🏋️',
  media: {
    images: [
      '/exercise-images/knee/mini-squat-start.jpg',
      '/exercise-images/knee/mini-squat-down.jpg',
      '/exercise-images/knee/mini-squat-up.jpg'
    ]
  },
  difficulty: 'intermediate',
  painThreshold: 'Stop if pain > 3/10'
}
```

---

## 🎨 What Users See

### With Video:
- Video player with controls
- Play/pause functionality
- Optional thumbnail before playback
- Full-screen option

### With Images:
- Grid gallery of images
- Hover to enlarge effect
- Shows exercise progression steps
- Lazy loading for performance

### Without Media (Placeholder):
- Dashed border box
- Camera icon (🎥)
- "Demo Coming Soon" text
- Encourages future additions

---

## 📋 Recommended Workflow

### 1. Record/Capture Content
- **For Videos:** Use smartphone or camera
  - Good lighting
  - Stable camera (tripod recommended)
  - Clear view of movement
  - 2-3 repetitions shown

- **For Images:** Professional photos or screenshots
  - Multiple angles if needed
  - Start, middle, and end positions
  - Clear body positioning

### 2. Edit Content
- **Videos:** 
  - Trim to 10-30 seconds
  - Compress to < 10MB
  - Export as MP4 (H.264)
  - Tools: iMovie, Adobe Premiere, HandBrake

- **Images:**
  - Crop to focus on exercise
  - Resize to ~1200x900
  - Compress to < 500KB
  - Tools: Photoshop, GIMP, online compressors

### 3. Organize Files
```
public/
└── exercise-videos/
    ├── knee/
    │   ├── phase1/
    │   ├── phase2/
    │   ├── phase3/
    │   └── phase4/
    └── ankle/
        ├── phase1/
        ├── phase2/
        └── phase3/
```

### 4. Update Code
Add media URLs to corresponding exercises in:
- `src/data/injuryPlans.ts`

### 5. Test
- Load page with new exercise
- Verify video plays correctly
- Check images display properly
- Test on mobile devices

---

## 🚀 Priority Exercises for Media

Start with these high-priority exercises (most viewed):

### Knee Injuries
1. Ankle Pumps
2. Quadriceps Sets
3. Straight Leg Raises
4. Mini Squats
5. Wall Slides

### Ankle Injuries
1. Ankle Circles
2. Towel Scrunches
3. Heel Raises
4. Single Leg Balance
5. Resistance Band Work

---

## 💡 Best Practices

### ✅ DO
- Keep videos short (10-30 sec)
- Show 2-3 full repetitions
- Use good lighting
- Demonstrate proper form
- Include starting position clearly
- Show common mistakes (optional separate video)
- Use consistent backgrounds

### ❌ DON'T
- Upload huge files (keep < 10MB)
- Use portrait orientation
- Have cluttered backgrounds
- Show unsafe techniques
- Include copyrighted music
- Use low-quality footage

---

## 🔧 Technical Notes

### Video Format Support
```typescript
Supported formats:
- MP4 (H.264) - RECOMMENDED
- WebM
- OGG

The video player will show:
<video controls poster={thumbnail}>
  <source src={videoUrl} type="video/mp4" />
</video>
```

### Image Format Support
```typescript
Supported formats:
- JPG/JPEG - RECOMMENDED for photos
- PNG - for graphics/diagrams
- WebP - for best compression

Images use lazy loading:
<img loading="lazy" />
```

---

## 📊 Performance Tips

1. **Compress videos** - Use HandBrake or FFmpeg
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow output.mp4
   ```

2. **Optimize images** - Use online tools
   - TinyPNG.com
   - Squoosh.app
   - ImageOptim (Mac)

3. **Use lazy loading** - Already implemented
   - Videos load only when card is visible
   - Images load as user scrolls

4. **Consider CDN** - For production
   - Upload to AWS S3 + CloudFront
   - Or use services like Cloudinary

---

## 🎯 Example Directory After Adding Media

```
public/
├── exercise-videos/
│   ├── knee/
│   │   ├── acl/
│   │   │   ├── ankle-pumps.mp4          (1.2 MB)
│   │   │   ├── quad-sets.mp4            (1.5 MB)
│   │   │   ├── straight-leg-raise.mp4   (2.1 MB)
│   │   │   └── mini-squats.mp4          (2.3 MB)
│   │   ├── mcl/
│   │   └── meniscus/
│   └── ankle/
│       ├── lateral/
│       ├── medial/
│       └── high/
├── exercise-images/
│   └── (organized similarly)
└── thumbnails/
    └── (video thumbnails)
```

---

## 📝 Checklist: Adding Media to an Exercise

- [ ] Record/capture quality video or images
- [ ] Edit and compress media files
- [ ] Save to appropriate `public/` subfolder
- [ ] Update exercise in `src/data/injuryPlans.ts`
- [ ] Add `media` object with URLs
- [ ] Test in development (npm run dev)
- [ ] Verify playback/display works
- [ ] Check responsive behavior on mobile
- [ ] Optimize file sizes if needed
- [ ] Commit changes to git

---

## 🆘 Troubleshooting

**Video not playing?**
- Check file path is correct (case-sensitive)
- Verify file is in `public/` directory
- Try a different browser
- Check video format (MP4 H.264 works best)

**Images not showing?**
- Verify image paths are correct
- Check image files exist in `public/`
- Look for console errors (F12)
- Ensure image formats are supported

**Placeholder shows instead of media?**
- Check `media` object exists in data
- Verify `videoUrl` or `images` array has values
- Check for typos in file paths

---

**Ready to add your first exercise video?** Follow the steps above and enhance your rehab program! 🎉
