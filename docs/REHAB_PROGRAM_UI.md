# 🏃 Rehab Program UI Documentation

## Overview

The rehabilitation program UI provides a comprehensive interface for users to follow their injury-specific recovery plan, track progress, and perform exercises safely.

## Main Components

### 1. Injury Selection Page
**File**: `src/pages/InjurySelection.tsx`

**Features:**
- Grid display of all available injuries
- Categories: Knee injuries and Ankle injuries
- Visual cards with icons and descriptions
- Click to select injury and start rehab program

### 2. Injury Rehab Program Page
**File**: `src/pages/InjuryRehabProgram.tsx`

**Main Sections:**

#### A. Header Section
- Injury name and icon
- Recovery time estimate
- Severity indicator
- Return to previous page

#### B. Stats Dashboard
- Current phase number and name
- Week progress tracker
- Total exercises count
- Completed exercises count
- Overall progress percentage

#### C. Phase Navigation
- Tab-based phase selector
- Visual indicators for:
  - Current active phase
  - Completed phases
  - Upcoming phases
- Phase details (goals, precautions)

#### D. Exercise Grid
- Horizontal scrollable card layout
- Each exercise card shows:
  - Exercise name and icon
  - Difficulty badge
  - Video/image or placeholder
  - Short description
  - Sets, reps, hold time
  - Required equipment
  - Pain threshold guidance
  - Completion toggle button
  - "Need more explanation?" button

#### E. Guidelines Sidebar
- **Do's List**: Best practices
- **Don'ts List**: Things to avoid
- **Pain Log**: Track pain levels (1-10 scale)
- **See Doctor If**: Warning signs

### 3. Exercise Detail Modal
**Features:**
- Full-screen overlay
- Large video/image display
- Complete exercise specifications
- Step-by-step instructions (bullet points)
- Equipment list
- Pain guidance
- Close button and click-outside-to-close

## User Flow

```
1. Dashboard → 2. Injury Selection → 3. Rehab Program
                                           ↓
                                    4. Select Phase
                                           ↓
                                    5. View Exercises
                                           ↓
                                    6. Complete Exercises
                                           ↓
                                    7. Track Progress
```

## State Management

### Local Storage Keys
```typescript
{
  'rehabmotion-user': userId,
  'rehabmotion-progress-{userId}-{injuryType}': {
    currentPhase: number,
    currentWeek: number,
    startDate: string,
    completedExercises: string[],
    painLevel: number,
    notes: string[],
    lastUpdated: string
  }
}
```

### Progress Tracking
- Per-user, per-injury basis
- Automatic save on exercise completion
- Persists across sessions
- Reset option available

## Styling

### Color Scheme
- **Primary Blue**: `#007bff` - Actions, progress
- **Success Green**: `#28a745` - Completed items
- **Warning Orange**: `#fd7e14` - Cautions
- **Danger Red**: `#dc3545` - Warnings
- **Info Blue**: `#17a2b8` - Information

### Responsive Design
- **Desktop**: 1600px max-width container
- **Tablet**: Adjusted grid columns
- **Mobile**: Single column layout, optimized cards

### CSS Classes

#### Main Containers
- `.injury-rehab-program` - Main wrapper
- `.rehab-header` - Top section
- `.rehab-stats-grid` - Progress stats
- `.phase-navigation` - Phase tabs
- `.exercises-grid` - Exercise cards
- `.guidelines-sidebar` - Side panel

#### Exercise Cards
- `.exercise-card` - Individual exercise
- `.exercise-card.completed` - Completed state
- `.difficulty-badge` - Difficulty indicator
- `.exercise-media` - Video/image area
- `.exercise-toggle-btn` - Completion button

#### Modal
- `.exercise-modal-overlay` - Background overlay
- `.exercise-modal-content` - Modal container
- `.modal-video-container` - Video player
- `.modal-description` - Instruction text

## Interactions

### Exercise Completion
```typescript
const handleToggleExercise = (exerciseId: string) => {
  if (completed) {
    // Remove from completed list
  } else {
    // Add to completed list
  }
  // Save to localStorage
  // Update UI
};
```

### Phase Navigation
```typescript
const handlePhaseChange = (phaseNumber: number) => {
  setCurrentPhase(phaseNumber);
  // Load phase exercises
  // Update progress
};
```

### Pain Logging
```typescript
const handleLogPain = (level: number) => {
  // Save pain level (1-10)
  // Add timestamp
  // Update progress data
};
```

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Alt text for images

## Performance

- Lazy loading for videos/images
- Optimized re-renders with React hooks
- Local storage for quick data access
- Minimal API calls
- Smooth animations with CSS transitions

## Future Enhancements

### Planned Features
1. **Progress Charts**
   - Visual progress over time
   - Exercise completion trends
   - Pain level tracking graph

2. **Reminders**
   - Push notifications
   - Email reminders
   - Daily exercise alerts

3. **Social Features**
   - Share progress
   - Community support
   - Therapist collaboration

4. **Advanced Tracking**
   - Pose detection integration
   - Form analysis
   - Real-time feedback

5. **Customization**
   - Adjust exercise difficulty
   - Modify rep counts
   - Personalized plans

## Troubleshooting

### Common Issues

**Exercise not marking as complete:**
- Check localStorage permissions
- Verify userId is set
- Clear browser cache

**Phase not changing:**
- Ensure valid phase number
- Check progress data structure
- Reload page

**Videos not playing:**
- Check file format (MP4 recommended)
- Verify file path
- Check browser compatibility

---

**Status**: Fully functional UI with phase-based rehabilitation tracking
**Last Updated**: October 2025
