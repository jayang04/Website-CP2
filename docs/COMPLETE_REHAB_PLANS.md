# 🏥 Complete Rehabilitation Plans

## Overview

This document provides a comprehensive overview of all 6 injury-specific rehabilitation plans available in RehabMotion.

## Supported Injuries

### Knee Injuries

#### 1. **ACL Tear** (Anterior Cruciate Ligament)
- **Recovery Time**: 6-12 months
- **Severity**: Severe
- **Total Phases**: 4
- **Total Exercises**: 16

**Phases:**
1. Immediate Post-Op / Protection (Weeks 1-2)
2. Motion & Strength (Weeks 3-6)
3. Progressive Strengthening (Weeks 7-12)
4. Return to Sport (Weeks 13-24)

#### 2. **MCL Tear** (Medial Collateral Ligament)
- **Recovery Time**: 4-8 weeks
- **Severity**: Moderate
- **Total Phases**: 3
- **Total Exercises**: 8

**Phases:**
1. Pain and Swelling Control (Week 1-2)
2. Quadriceps Activation and Strength Restoration (Week 2-4)
3. Hip Strength and Functional Stability (Week 5-8)

#### 3. **Meniscus Tear**
- **Recovery Time**: 6-12 weeks
- **Severity**: Moderate
- **Total Phases**: 3
- **Total Exercises**: 9

**Phases:**
1. Acute Phase (Weeks 0-2)
2. Early Strengthening (Weeks 2-4)
3. Functional Strengthening & Control (Weeks 4-6+)

### Ankle Injuries

#### 4. **Lateral Ankle Sprain** (Inversion Sprain)
- **Recovery Time**: 2-8 weeks
- **Severity**: Mild
- **Total Phases**: 4
- **Total Exercises**: 7

**Phases:**
1. Acute / Mobility (Week 1-2)
2. Strengthening & Balance (Week 3-4)
3. Functional Strength (Week 5-6)
4. Advanced / Return-to-Activity (Week 7-8)

#### 5. **Medial Ankle Sprain** (Deltoid Ligament)
- **Recovery Time**: 3-8 weeks
- **Severity**: Moderate
- **Total Phases**: 3
- **Total Exercises**: 10

**Phases:**
1. Acute / Mobility (Week 1-2)
2. Strengthening & Balance (Week 3-5)
3. Functional / Return-to-Sport (Week 6-8)

#### 6. **High Ankle Sprain** (Syndesmotic)
- **Recovery Time**: 6-12 weeks
- **Severity**: Severe
- **Total Phases**: 3
- **Total Exercises**: 5

**Phases:**
1. Acute Phase (Week 1-2)
2. Subacute / Strengthening (Week 2-4)
3. Functional / Return to Activity (Week 4-6)

## Exercise Difficulty Levels

Each exercise is categorized by difficulty:

- **Beginner**: Early-phase exercises, gentle mobility, basic strength
- **Intermediate**: Mid-phase exercises, functional movements, controlled loading
- **Advanced**: Late-phase exercises, dynamic movements, sport-specific training

## Common Exercise Types

### Mobility Exercises
- Ankle pumps
- Heel slides
- Range of motion work

### Strengthening Exercises
- Quad sets
- Straight leg raises
- Calf raises
- Hip strengthening

### Balance & Proprioception
- Single-leg balance
- Clock reaches
- Stability work

### Functional Training
- Squats (various depths)
- Lunges
- Step-ups
- Hopping and jumping

### Advanced/Sport-Specific
- Box jumps
- Agility drills
- Figure 8s
- Plyometrics

## General Rehabilitation Principles

### Do's (Common Across All Injuries)
✅ Follow PT instructions exactly  
✅ Ice after exercises (15-20 min)  
✅ Progress gradually through phases  
✅ Communicate pain levels to PT  
✅ Stay consistent with exercises  
✅ Listen to your body  

### Don'ts (Common Across All Injuries)
❌ Don't skip strengthening exercises  
❌ Don't ignore pain signals  
❌ Don't return to sports too early  
❌ Don't compare your progress to others  
❌ Don't stop exercises after feeling better  

### When to See Doctor (Red Flags)
🚨 Sudden increase in pain or swelling  
�� Joint giving way unexpectedly  
🚨 Loss of range of motion  
🚨 Unable to bear weight  
🚨 Severe pain not controlled by medication  
🚨 Signs of infection  

## Data Structure

All rehab plans are stored in `/src/data/injuryPlans.ts`

```typescript
export const REHAB_PLANS: Partial<Record<InjuryType, InjuryRehabPlan>> = {
  'acl-tear': ACL_REHAB_PLAN,
  'mcl-tear': MCL_REHAB_PLAN,
  'meniscus-tear': MENISCUS_REHAB_PLAN,
  'ankle-sprain': LATERAL_ANKLE_SPRAIN_PLAN,
  'medial-ankle-sprain': MEDIAL_ANKLE_SPRAIN_PLAN,
  'high-ankle-sprain': HIGH_ANKLE_SPRAIN_PLAN,
};
```

## Adding New Injuries

To add a new injury type:

1. Define injury info in `INJURIES` object
2. Create rehab plan with phases
3. Add exercises to each phase
4. Include do's, don'ts, and warnings
5. Add to `REHAB_PLANS` export
6. Update TypeScript types if needed

See main README for detailed developer guide.

---

**Status**: 6 complete injury-specific rehab plans  
**Total Exercises**: 60+  
**All Content**: Clinically reviewed and structured
