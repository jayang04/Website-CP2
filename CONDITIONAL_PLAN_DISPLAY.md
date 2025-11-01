# Conditional Plan Display Feature - Summary

## What Was Implemented

A smart system that **automatically detects which type of rehabilitation plan** the user has chosen and displays the appropriate view in their dashboard.

## How It Works

### Plan Type Detection

The system now tracks two types of plans:
1. **Personalized Plan** - Created through the smart intake form
2. **General Program** - Selected from injury-specific rehab programs (ACL, MCL, Ankle Sprains, etc.)

### Automatic Dashboard Switching

**Dashboard now shows:**
- ✅ **Personalized Plan View** - If user completed intake form
- ✅ **General Rehab Program** - If user selected an injury-specific program  
- ✅ **Choice Screen** - If user hasn't selected either type yet

## User Flow

### Scenario 1: User Chooses Personalized Plan
1. User clicks "Create Personalised Rehab Plan" from dashboard
2. Completes smart intake form
3. Dashboard automatically shows **PersonalizedPlanView** with tailored exercises
4. General program section is hidden

### Scenario 2: User Chooses General Program
1. User clicks "Rehabilitation Programs" from quick actions
2. Selects specific injury (ACL, MCL, Ankle Sprain, etc.)
3. Dashboard automatically shows **InjuryRehabProgram** embedded in the plan section
4. Personalized plan intake is hidden

### Scenario 3: No Plan Selected Yet
1. User sees both options:
   - **✨ Personalized Plan** button → Opens intake form
   - **🦵 General Program** button → Opens program selection
2. After choosing either, dashboard updates automatically

## Technical Implementation

### State Management
```typescript
const [activePlanType, setActivePlanType] = useState<'personalized' | 'general' | null>(null);
```

### Detection Logic
- Checks `localStorage` for intake data (personalized)
- Checks `injuryRehabService` for selected injury (general)
- Updates automatically when user makes a selection

### Priority
If a user somehow has both:
- **Personalized plan takes priority** (assumed to be more recent/preferred)

## Code Changes

### Modified Files:
1. **`/src/App.tsx`**
   - Added `activePlanType` state
   - Added detection `useEffect` hook
   - Updated `DashboardPage` to accept `activePlanType` prop
   - Conditional rendering based on plan type
   - Added "General Program" button when no plan exists

## Benefits

✅ **Cleaner UI** - Only shows relevant plan type  
✅ **No confusion** - User sees what they chose  
✅ **Automatic switching** - No manual toggle needed  
✅ **Embedded general program** - Seamless experience in dashboard  
✅ **Flexible** - Can switch between plan types  

## Testing Checklist

- [ ] Start with no plan → See both options
- [ ] Choose personalized plan → See only personalized view
- [ ] Reset personalized plan → Options reappear
- [ ] Choose general program → See only general program
- [ ] Reset general program → Options reappear
- [ ] Have both types → Personalized takes priority

## Future Enhancements (Optional)

- Toggle button to switch between plan types if both exist
- Comparison view showing both plans side-by-side
- Ability to "favorite" one plan type
- Dashboard widget showing progress from both plan types

## Important Notes

- **Reset buttons work independently** - Resetting one plan type doesn't affect the other
- **localStorage is used for detection** - Plans persist across sessions
- **Auto-detection on load** - System checks on dashboard mount
- **Responsive to changes** - Updates when `dashboardRefreshKey` changes
