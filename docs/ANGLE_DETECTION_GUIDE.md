# Exercise Angle Detection Implementation

## Overview
This document describes the AI-powered angle detection system that has been integrated into the rehabilitation platform. The system uses computer vision (MediaPipe Pose) to track joint angles in real-time and provide instant feedback on exercise form.

## How It Works

### 1. Angle Detection Configuration
Each exercise that supports angle detection has a configuration in `src/data/exerciseAngleConfig.ts` that defines:
- **Required joints**: knee, ankle, hip
- **Target angles**: Min, max, and optimal angles for each joint
- **Camera position**: Best viewing angle (side, front, back)
- **Rep counting logic**: When to count a repetition based on angle thresholds
- **Real-time feedback**: Messages for proper form, too shallow, or too deep

### 2. Available Features
- ✅ **Real-time angle measurement**: Live tracking of joint angles
- ✅ **Automatic rep counting**: Counts repetitions based on movement patterns
- ✅ **Form feedback**: Instant visual and text feedback on exercise form
- ✅ **Audio cues**: Sound effects when completing a rep
- ✅ **Visual indicators**: Color-coded feedback (green = good, red = needs adjustment)

## Exercises with Angle Detection

### Knee Exercises

#### 1. **Heel Slide**
- **Angle Tracked**: Knee flexion (90-145°)
- **Target**: 120° bend
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Real-time guidance on knee flexion depth

#### 2. **Short Arc Quad**
- **Angle Tracked**: Knee extension (150-180°)
- **Target**: 170° (nearly straight)
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Ensures full knee extension

#### 3. **Straight Leg Raise**
- **Angles Tracked**: 
  - Knee: 165-180° (must stay straight)
  - Hip: 30-60° (lift height)
- **Target**: 45° hip flexion with straight leg
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Monitors both leg straightness and lift height

#### 4. **Bridges / Glute Bridge**
- **Angles Tracked**:
  - Knee: 80-110° (should stay at ~90°)
  - Hip: 160-180° (full extension)
- **Target**: 90° knee, 170° hip
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Ensures proper bridge height and knee angle

#### 5. **Mini Squats**
- **Angle Tracked**: Knee bend (120-140°)
- **Target**: 130° (shallow squat)
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Prevents going too deep for rehabilitation

#### 6. **Single-Leg Squat**
- **Angle Tracked**: Knee bend (100-130°)
- **Target**: 115° on standing leg
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Monitors depth control on one leg

#### 7. **Forward Lunge**
- **Angle Tracked**: Front knee (80-100°)
- **Target**: 90° perfect lunge
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Ensures proper lunge depth

#### 8. **Lateral Step-Up**
- **Angle Tracked**: Knee extension (150-180°)
- **Target**: 170° full extension at top
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Confirms full knee extension at step top

### Ankle Exercises

#### 9. **Ankle Pumps**
- **Angle Tracked**: Ankle flexion/extension (70-110°)
- **Target**: Full range of motion
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Ensures complete ankle movement

#### 10. **Calf Raise**
- **Angles Tracked**:
  - Ankle: 110-140° (plantarflexion)
  - Knee: 160-180° (stay straight)
- **Target**: 125° ankle rise
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Monitors heel height and leg straightness

#### 11. **Heel Raise - Off Step**
- **Angle Tracked**: Ankle (70-140°)
- **Target**: Full range from dorsiflexion to plantarflexion
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Ensures complete range of motion

#### 12. **Ankle Dorsiflexion Mobility**
- **Angle Tracked**: Ankle dorsiflexion (70-85°)
- **Target**: 75° (toes toward shin)
- **Best Camera**: Side view
- **Rep Counting**: Manual
- **Feedback**: Monitors stretch depth

### Balance Exercises

#### 13. **Single-Leg Balance**
- **Angle Tracked**: Standing leg knee (165-180°)
- **Target**: Maintain straight leg
- **Best Camera**: Front view
- **Rep Counting**: Time-based
- **Feedback**: Ensures standing leg stays straight

### Hip Exercises

#### 14. **Hip Abduction / Banded Hip Abduction**
- **Angle Tracked**: Hip abduction (15-45°)
- **Target**: 30° from midline
- **Best Camera**: Front view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Guides leg lift height

#### 15. **Hip Flexion with Straight Leg Raise**
- **Angles Tracked**:
  - Hip: 30-60° (forward lift)
  - Knee: 165-180° (stay straight)
- **Target**: 45° hip flexion with straight leg
- **Best Camera**: Side view
- **Rep Counting**: ✅ Automatic
- **Feedback**: Monitors both hip lift and leg straightness

## How to Use

### For Users:
1. Navigate to your injury rehabilitation program
2. Find an exercise with the **🤖 AI Form Check** button
3. Click the button to open the angle detection interface
4. Follow the on-screen instructions:
   - Position camera at the recommended angle (side/front)
   - Ensure your full body is visible
   - Stand 3-5 feet from camera
   - Click "Start Tracking"
5. Perform the exercise while watching real-time feedback
6. System automatically counts reps and provides form guidance
7. Click "Stop & Save" when complete

### Setup Tips:
- **Lighting**: Face a window or light source for best detection
- **Background**: Plain background works best
- **Distance**: Stand 3-5 feet from camera
- **Angle**: Turn to the side for most exercises
- **Field of View**: Adjust camera to see full body
- **Clothing**: Wear form-fitting clothes for better landmark detection

## Technical Implementation

### Components:
1. **exerciseAngleConfig.ts**: Configuration database for all exercises
2. **ExerciseAngleTracker.tsx**: Real-time tracking component
3. **PoseDetector.tsx**: MediaPipe pose detection wrapper
4. **angleCalculations.ts**: Angle calculation utilities

### Key Functions:
- `getExerciseAngleConfig()`: Retrieves configuration for an exercise
- `requiresAngleDetection()`: Checks if exercise supports angle tracking
- `validateAngles()`: Validates current angles against requirements
- `calculateAngle()`: Calculates angle between three 3D points

## Future Enhancements
- [ ] Add more exercises (quad sets, hip adduction, etc.)
- [ ] Save angle history for progress tracking
- [ ] Export workout data to PDF reports
- [ ] Add video comparison with proper form
- [ ] Implement machine learning for better form detection
- [ ] Multi-angle camera support
- [ ] Voice feedback option
- [ ] Integration with wearable devices

## Benefits
✅ **Immediate feedback**: No waiting for PT appointments to check form
✅ **Injury prevention**: Catches poor form before it causes problems
✅ **Motivation**: Gamified rep counting and achievements
✅ **Consistency**: Standardized form checking across all sessions
✅ **Progress tracking**: Objective measurements over time
✅ **Accessibility**: Practice exercises safely at home

## Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Firefox
- ✅ Safari (iOS 14+)
- ⚠️ Requires camera permissions

## Privacy
- All processing happens locally in the browser
- No video or images are uploaded to servers
- Camera feed is used only for real-time analysis
- No data is stored without user consent
