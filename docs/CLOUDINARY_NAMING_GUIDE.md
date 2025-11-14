# Cloudinary Video Naming Reference

## Quick Answer: What to Change in Cloudinary

**Yes, you need to adjust folder and file names!** Here's exactly what to do:

## 📁 Folder Name Changes

Your local folders → Cloudinary folder names:

| ❌ Local Name (with spaces) | ✅ Cloudinary Name (with underscores) |
|------------------------------|---------------------------------------|
| `Meniscus Tear`             | `Meniscus_Tear`                       |
| `Lateral Ankle Sprain`      | `Lateral_Ankle_Sprain`                |
| `Medial Ankle Sprain`       | `Medial_Ankle_Sprain`                 |
| `High Ankle Sprain`         | `High_Ankle_Sprain`                   |
| `ACL`                       | `ACL` (no change)                     |
| `MCL`                       | `MCL` (no change)                     |

## 📄 File Name Changes (Examples)

### ACL Videos
| ❌ Local Name | ✅ Cloudinary Public ID |
|--------------|------------------------|
| `Quad Set.mp4` | `Quad_Set` |
| `Heel Slide.mp4` | `Heel_Slide` |
| `Ankle Pumps.mp4` | `Ankle_Pumps` |
| `Short Arc Quad.mp4` | `Short_Arc_Quad` |
| `Straight Leg Raises.mp4` | `Straight_Leg_Raises` |
| `Bridges.mp4` | `Bridges` |

### MCL Videos
| ❌ Local Name | ✅ Cloudinary Public ID |
|--------------|------------------------|
| `Heel Slide.mp4` | `Heel_Slide` |
| `Wall Heel Slide.mp4` | `Wall_Heel_Slide` |
| `Quad Set.mp4` | `Quad_Set` |
| `Short Arc Quad.mp4` | `Short_Arc_Quad` |
| `Banded Hip Abduction.mp4` | `Banded_Hip_Abduction` |
| `Hip Flexion with Straight Leg Raise.mp4` | `Hip_Flexion_with_Straight_Leg_Raise` |
| `Hip Adduction (Seated Pillow:Towel Squeeze).mp4` | `Hip_Adduction_(Seated_Pillow:Towel_Squeeze)` |
| `Lateral Step-Up.mp4` | `Lateral_Step-Up` |

### Meniscus Tear Videos
| ❌ Local Name | ✅ Cloudinary Public ID |
|--------------|------------------------|
| `Heel Slide.mp4` | `Heel_Slide` |
| `Quad Set.mp4` | `Quad_Set` |
| `Ankle Pumps.mp4` | `Ankle_Pumps` |
| `Straight Leg Raise.mp4` | `Straight_Leg_Raise` |
| `Hip Abduction.mp4` | `Hip_Abduction` |
| `Hip Adduction.mp4` | `Hip_Adduction` |
| `Isometric Hamstring Curl (Glute Bridge).mp4` | `Isometric_Hamstring_Curl_(Glute_Bridge)` |
| `Mini Squats.mp4` | `Mini_Squats` |
| `Lateral Step-Up.mp4` | `Lateral_Step-Up` |

### Lateral Ankle Sprain Videos
| ❌ Local Name | ✅ Cloudinary Public ID |
|--------------|------------------------|
| `Ankle Dorsiflexion Mobility.mp4` | `Ankle_Dorsiflexion_Mobility` |
| `Ankle Strengthening (Isometric:Eversion Band Work).mp4` | `Ankle_Strengthening_(Isometric:Eversion_Band_Work)` |
| `Calf Raise Exercise.mp4` | `Calf_Raise_Exercise` |
| `Proprioceptive Control (Clock Reaches).mp4` | `Proprioceptive_Control_(Clock_Reaches)` |
| `Single-Leg Squat.mp4` | `Single-Leg_Squat` |
| `Forward Lunge.mp4` | `Forward_Lunge` |
| `Hop to Landing.mp4` | `Hop_to_Landing` |

### Medial Ankle Sprain Videos
| ❌ Local Name | ✅ Cloudinary Public ID |
|--------------|------------------------|
| `Ankle Pumps.mp4` | `Ankle_Pumps` |
| `Ankle Circles.mp4` | `Ankle_Circles` |
| `Single-Leg Balance.mp4` | `Single-Leg_Balance` |
| `Ankle Inversion – Band.mp4` | `Ankle_Inversion_–_Band` |
| `Ankle Eversion – Band.mp4` | `Ankle_Eversion_–_Band` |
| `Heel Raise – Off Step.mp4` | `Heel_Raise_–_Off_Step` |
| `Ankle Dorsiflexion – Wall Support.mp4` | `Ankle_Dorsiflexion_–_Wall_Support` |
| `Double-Leg Jump.mp4` | `Double-Leg_Jump` |
| `Lateral Bound.mp4` | `Lateral_Bound` |
| `Single-Leg Hops.mp4` | `Single-Leg_Hops` |

### High Ankle Sprain Videos
| ❌ Local Name | ✅ Cloudinary Public ID |
|--------------|------------------------|
| `Elevated Ankle Pumps.mp4` | `Elevated_Ankle_Pumps` |
| `Ankle Circles.mp4` | `Ankle_Circles` |
| `Progressive Weight Bearing.mp4` | `Progressive_Weight_Bearing` |
| `Double-Leg Calf Raises.mp4` | `Double-Leg_Calf_Raises` |
| `Proprioceptive Control (Clock Reaches).mp4` | `Proprioceptive_Control_(Clock_Reaches)` |
| `Glute Bridge.mp4` | `Glute_Bridge` |

## 🔧 How to Rename in Cloudinary

### Method 1: Rename During Upload
When uploading, Cloudinary shows a "Public ID" field. Edit it before saving:
- Replace spaces with `_`
- Remove `.mp4` extension
- Keep hyphens and special characters

### Method 2: Rename After Upload
1. Find the video in Media Library
2. Click on it to open details
3. Click "Edit" button
4. Change the "Public ID" field
5. Save

### Method 3: Organize in Folders First
1. Create folders with correct names (using underscores)
2. Upload videos into those folders
3. Cloudinary will suggest Public IDs - edit them to replace spaces

## 🎯 The Rule is Simple

**Replace EVERY space with an underscore `_`**

That's it! Keep everything else the same:
- ✅ Keep hyphens: `Single-Leg`
- ✅ Keep colons: `Pillow:Towel`
- ✅ Keep parentheses: `(Glute Bridge)`
- ✅ Keep special dashes: `–`

## ✅ Verification

After uploading and renaming, your Cloudinary Media Library should look like:

```
📂 exercise-demo-videos
   📂 ACL
      🎬 Quad_Set
      🎬 Heel_Slide
      🎬 Ankle_Pumps
      🎬 Short_Arc_Quad
      🎬 Straight_Leg_Raises
      🎬 Bridges
   📂 MCL
      🎬 (7 videos with underscores)
   📂 Meniscus_Tear ← underscore!
      🎬 (9 videos with underscores)
   📂 Lateral_Ankle_Sprain ← underscores!
      🎬 (7 videos with underscores)
   📂 Medial_Ankle_Sprain ← underscores!
      🎬 (10 videos with underscores)
   📂 High_Ankle_Sprain ← underscores!
      🎬 (6 videos with underscores)
```

## 🚀 After You're Done

1. Save all changes in Cloudinary
2. Run your app: `npm run dev`
3. Navigate to an injury rehab plan
4. Videos should load from Cloudinary!

---

**Summary**: Replace all spaces with underscores in both folder and file names on Cloudinary.
