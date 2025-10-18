// Comprehensive injury-specific rehabilitation plans database

import { type InjuryInfo, type InjuryRehabPlan, type InjuryType } from '../types/injuries';

// All supported injuries
export const INJURIES: Record<InjuryType, InjuryInfo> = {
  'acl-tear': {
    id: 'acl-tear',
    name: 'ACL Tear',
    category: 'knee',
    description: 'Anterior Cruciate Ligament tear - common in sports with sudden stops and direction changes',
    icon: '🦵',
    severity: 'severe',
    recoveryTime: '6-12 months',
    commonIn: ['Athletes', 'Soccer players', 'Basketball players', 'Skiers']
  },
  'mcl-tear': {
    id: 'mcl-tear',
    name: 'MCL Tear',
    category: 'knee',
    description: 'Medial Collateral Ligament tear - caused by impact to outer knee',
    icon: '🦵',
    severity: 'moderate',
    recoveryTime: '4-8 weeks',
    commonIn: ['Contact sport athletes', 'Football players', 'Hockey players']
  },
  'meniscus-tear': {
    id: 'meniscus-tear',
    name: 'Meniscus Tear',
    category: 'knee',
    description: 'Tear in knee cartilage - often from twisting motion while bearing weight',
    icon: '🦵',
    severity: 'moderate',
    recoveryTime: '6-12 weeks',
    commonIn: ['Athletes', 'Older adults', 'Manual laborers']
  },
  'ankle-sprain': {
    id: 'ankle-sprain',
    name: 'Lateral Ankle Sprain (Inversion Sprain)',
    category: 'ankle',
    description: 'Most common ankle sprain involving lateral ligaments (ATFL and CFL) from rolling ankle inward',
    icon: '🦶',
    severity: 'mild',
    recoveryTime: '2-8 weeks',
    commonIn: ['Athletes', 'Dancers', 'General population']
  },
  'medial-ankle-sprain': {
    id: 'medial-ankle-sprain',
    name: 'Medial Ankle Sprain (Deltoid Ligament)',
    category: 'ankle',
    description: 'Deltoid ligament injury on inner ankle - less common but often takes longer to heal',
    icon: '🦶',
    severity: 'moderate',
    recoveryTime: '3-8 weeks',
    commonIn: ['Football players', 'Soccer players', 'Basketball players']
  },
  'high-ankle-sprain': {
    id: 'high-ankle-sprain',
    name: 'High Ankle Sprain',
    category: 'ankle',
    description: 'Injury to ligaments above the ankle joint, more severe than regular sprain',
    icon: '🦶',
    severity: 'severe',
    recoveryTime: '6-12 weeks',
    commonIn: ['Football players', 'Soccer players', 'Hockey players']
  }
};

// ACL Tear Rehabilitation Plan
export const ACL_REHAB_PLAN: InjuryRehabPlan = {
  injuryType: 'acl-tear',
  injuryInfo: INJURIES['acl-tear'],
  totalWeeks: 24,
  phases: [
    {
      phase: 1,
      name: 'Immediate Post-Op / Protection Phase',
      duration: 'Weeks 1-2',
      goals: [
        'Reduce swelling and pain',
        'Protect the graft',
        'Restore knee extension',
        'Activate quadriceps muscle'
      ],
      precautions: [
        'Use crutches as directed',
        'Wear brace when walking',
        'No twisting or pivoting',
        'Ice regularly'
      ],
      exercises: [
        {
          id: 'acl-1-1',
          name: 'Ankle Pumps',
          sets: 3,
          reps: 20,
          hold: '2 seconds each direction',
          description: 'Point toes up and down to improve circulation and reduce swelling',
          image: '👣',
          // Example: Add your video/images here
          media: {
            // Option 1: Video URL
            // videoUrl: '/videos/ankle-pumps.mp4',
            // thumbnail: '/images/ankle-pumps-thumb.jpg',
            
            // Option 2: Multiple images showing steps
            // images: [
            //   '/images/ankle-pumps-step1.jpg',
            //   '/images/ankle-pumps-step2.jpg',
            //   '/images/ankle-pumps-step3.jpg'
            // ]
          },
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'acl-1-2',
          name: 'Quad Sets',
          sets: 3,
          reps: 15,
          hold: '5 seconds',
          description: 'Tighten thigh muscle while keeping leg straight',
          image: '🦵',
          difficulty: 'beginner',
          painThreshold: 'Mild discomfort OK'
        },
        {
          id: 'acl-1-3',
          name: 'Heel Slides',
          sets: 3,
          reps: 10,
          description: 'Slowly bend knee by sliding heel towards buttocks',
          image: '🦵',
          difficulty: 'beginner',
          requiredEquipment: ['Towel or slider'],
          painThreshold: 'Stop if sharp pain'
        }
      ]
    },
    {
      phase: 2,
      name: 'Motion & Strength Phase',
      duration: 'Weeks 3-6',
      goals: [
        'Achieve full range of motion',
        'Improve quadriceps strength',
        'Reduce swelling completely',
        'Walk without crutches'
      ],
      precautions: [
        'Continue wearing brace as directed',
        'Avoid deep squats',
        'No running or jumping',
        'Gradual weight-bearing progression'
      ],
      exercises: [
        {
          id: 'acl-2-1',
          name: 'Straight Leg Raises',
          sets: 3,
          reps: 15,
          hold: '3 seconds at top',
          description: 'Lift straight leg while lying down, strengthens quadriceps',
          image: '🦵',
          difficulty: 'beginner',
          painThreshold: 'Muscle fatigue OK, joint pain not OK'
        },
        {
          id: 'acl-2-2',
          name: 'Mini Squats (0-45°)',
          sets: 3,
          reps: 12,
          description: 'Partial squat keeping knees behind toes',
          image: '🧍',
          difficulty: 'intermediate',
          painThreshold: 'Stop if knee pain occurs'
        },
        {
          id: 'acl-2-3',
          name: 'Hamstring Curls',
          sets: 3,
          reps: 15,
          hold: '2 seconds',
          description: 'Bend knee bringing heel toward buttocks',
          image: '🏋️',
          difficulty: 'intermediate',
          requiredEquipment: ['Resistance band (optional)'],
          painThreshold: 'Mild discomfort OK'
        },
        {
          id: 'acl-2-4',
          name: 'Stationary Bike',
          sets: 1,
          reps: 1,
          hold: '10-15 minutes',
          description: 'Low resistance cycling for range of motion',
          image: '🚴',
          difficulty: 'beginner',
          requiredEquipment: ['Stationary bike'],
          painThreshold: 'Should be comfortable'
        }
      ]
    },
    {
      phase: 3,
      name: 'Progressive Strengthening Phase',
      duration: 'Weeks 7-12',
      goals: [
        'Build strength and endurance',
        'Improve balance and proprioception',
        'Begin light jogging',
        'Return to normal daily activities'
      ],
      precautions: [
        'Avoid contact sports',
        'No sudden direction changes',
        'Listen to your body',
        'Progress gradually'
      ],
      exercises: [
        {
          id: 'acl-3-1',
          name: 'Step-Ups',
          sets: 3,
          reps: 12,
          description: 'Step up onto platform with surgical leg leading',
          image: '📦',
          difficulty: 'intermediate',
          requiredEquipment: ['Step or platform (4-6 inches)'],
          painThreshold: 'Mild fatigue OK'
        },
        {
          id: 'acl-3-2',
          name: 'Single Leg Balance',
          sets: 3,
          reps: 1,
          hold: '30-60 seconds',
          description: 'Stand on surgical leg, progress to eyes closed',
          image: '🧍',
          difficulty: 'intermediate',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'acl-3-3',
          name: 'Wall Squats',
          sets: 3,
          reps: 15,
          hold: '30 seconds',
          description: 'Squat with back against wall, knees at 90 degrees',
          image: '🧱',
          difficulty: 'intermediate',
          painThreshold: 'Muscle burn OK'
        },
        {
          id: 'acl-3-4',
          name: 'Calf Raises',
          sets: 3,
          reps: 20,
          hold: '2 seconds at top',
          description: 'Rise up on toes, lower slowly',
          image: '🦶',
          difficulty: 'intermediate',
          painThreshold: 'Calf fatigue expected'
        }
      ]
    },
    {
      phase: 4,
      name: 'Return to Sport Phase',
      duration: 'Weeks 13-24',
      goals: [
        'Regain full strength and power',
        'Return to sport-specific training',
        'Pass functional tests',
        'Build confidence in knee'
      ],
      precautions: [
        'Wear brace during sports initially',
        'Start with non-contact drills',
        'Gradual return to full activity',
        'Continue strengthening exercises'
      ],
      exercises: [
        {
          id: 'acl-4-1',
          name: 'Box Jumps',
          sets: 3,
          reps: 10,
          description: 'Jump onto box and step down, builds power',
          image: '📦',
          difficulty: 'advanced',
          requiredEquipment: ['Plyometric box'],
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'acl-4-2',
          name: 'Lateral Bounds',
          sets: 3,
          reps: 12,
          description: 'Hop side to side on one leg',
          image: '🏃',
          difficulty: 'advanced',
          painThreshold: 'Mild discomfort after exercise OK'
        },
        {
          id: 'acl-4-3',
          name: 'Agility Drills (Figure 8s)',
          sets: 3,
          reps: 5,
          description: 'Run in figure 8 pattern around cones',
          image: '🏃',
          difficulty: 'advanced',
          requiredEquipment: ['Cones'],
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'acl-4-4',
          name: 'Single Leg Squats',
          sets: 3,
          reps: 10,
          description: 'Squat on one leg maintaining balance',
          image: '🦵',
          difficulty: 'advanced',
          painThreshold: 'Muscle fatigue OK'
        }
      ]
    }
  ],
  dosList: [
    'Follow PT instructions exactly',
    'Ice knee after exercises (15-20 min)',
    'Keep incisions clean and dry',
    'Do exercises daily as prescribed',
    'Progress gradually through phases',
    'Communicate pain levels to PT',
    'Maintain overall fitness (swimming, cycling)',
    'Stay patient - healing takes time'
  ],
  dontsList: [
    'Don\'t return to sports too early',
    'Don\'t skip strengthening exercises',
    'Don\'t ignore pain signals',
    'Don\'t pivot or twist on knee early on',
    'Don\'t do impact activities until cleared',
    'Don\'t compare your progress to others',
    'Don\'t stop exercises after feeling better',
    'Don\'t forget to warm up before exercises'
  ],
  whenToSeeDoctor: [
    'Sudden increase in pain or swelling',
    'Knee gives way unexpectedly',
    'Incision shows signs of infection',
    'Loss of range of motion',
    'Severe pain not controlled by medication',
    'Clicking or locking sensation',
    'Unable to bear weight on leg'
  ],
  progressMarkers: [
    'Week 2: Full knee extension achieved',
    'Week 4: Walking without crutches',
    'Week 6: 90° knee flexion',
    'Week 8: Full range of motion',
    'Week 12: Light jogging possible',
    'Week 16: Sport-specific drills begin',
    'Week 20: Passing functional tests',
    'Week 24+: Return to sport consideration'
  ]
};

// MCL Tear Rehabilitation Plan
export const MCL_REHAB_PLAN: InjuryRehabPlan = {
  injuryType: 'mcl-tear',
  injuryInfo: INJURIES['mcl-tear'],
  totalWeeks: 8,
  phases: [
    {
      phase: 1,
      name: 'Pain and Swelling Control',
      duration: 'Week 1-2',
      goals: [
        'Reduce pain and control swelling',
        'Maintain gentle knee mobility',
        'Avoid stress on the MCL',
        'Regain knee flexion up to 135-145° pain-free'
      ],
      precautions: [
        'Avoid valgus stress (knee inward collapse)',
        'No twisting or pivoting',
        'Ice regularly (15-20 min)',
        'Use brace if prescribed'
      ],
      exercises: [
        {
          id: 'mcl-1-1',
          name: 'Heel Slide',
          sets: 4,
          reps: 15,
          description: 'Start with knee straight. Slowly slide heel towards buttock until gentle stretch is felt. Use both arms as support. Stop before pain.',
          image: '🦵',
          difficulty: 'beginner',
          painThreshold: 'Stop before pain, gentle stretch OK'
        },
        {
          id: 'mcl-1-2',
          name: 'Wall Heel Slide',
          sets: 3,
          reps: 1,
          hold: '15-30 seconds',
          description: 'Lie on floor with hips close to wall, feet resting on it. Allow injured foot to slide slowly down wall until stretch is felt. Keep hips relaxed and flat.',
          image: '🧱',
          difficulty: 'beginner',
          painThreshold: 'Gentle stretch, no sharp pain'
        }
      ]
    },
    {
      phase: 2,
      name: 'Quadriceps Activation and Strength Restoration',
      duration: 'Week 2-4',
      goals: [
        'Regain quadriceps control',
        'Improve knee stability',
        'Maintain full range of motion',
        'Reduce muscle atrophy'
      ],
      precautions: [
        'Continue to avoid valgus stress',
        'Progress exercises as tolerated',
        'Monitor for increased swelling'
      ],
      exercises: [
        {
          id: 'mcl-2-1',
          name: 'Quad Set',
          sets: 4,
          reps: 10,
          hold: '6 seconds',
          description: 'Place foam roller (or rolled towel 10-15cm high) under injured knee. Push back of knee down into roller. Hold contraction.',
          image: '🦵',
          difficulty: 'beginner',
          requiredEquipment: ['Foam roller or towel'],
          painThreshold: 'Muscle contraction, no joint pain'
        },
        {
          id: 'mcl-2-2',
          name: 'Short Arc Quad Activation',
          sets: 4,
          reps: 10,
          hold: '6 seconds',
          description: 'Lie on back with roller under knee. Straighten lower leg by lifting heel while keeping knee in contact with roller. Hold, then lower slowly.',
          image: '🦵',
          difficulty: 'beginner',
          requiredEquipment: ['Foam roller or towel'],
          painThreshold: 'Mild discomfort OK'
        }
      ]
    },
    {
      phase: 3,
      name: 'Hip Strength and Functional Stability',
      duration: 'Week 5-8',
      goals: [
        'Improve hip stability',
        'Enhance knee joint control',
        'Prepare for functional recovery',
        'Return to normal activities'
      ],
      precautions: [
        'Avoid contact sports until cleared',
        'Progress step height gradually',
        'Maintain proper knee alignment'
      ],
      exercises: [
        {
          id: 'mcl-3-1',
          name: 'Banded Hip Abduction',
          sets: 3,
          reps: 12,
          description: 'Loop band above knees. Stand on injured leg with hands on hips. Move uninjured leg outward (abduction) and return. Perform on both sides.',
          image: '🏋️',
          difficulty: 'intermediate',
          requiredEquipment: ['Resistance loop band'],
          painThreshold: 'Hip muscle fatigue expected'
        },
        {
          id: 'mcl-3-2',
          name: 'Hip Flexion with Straight Leg Raise',
          sets: 3,
          reps: 10,
          hold: '6 seconds',
          description: 'Lie on back with injured leg straight. Press back of knee gently into floor. Lift leg about 30cm off floor, hold, then lower slowly.',
          image: '🦵',
          difficulty: 'intermediate',
          painThreshold: 'Hip flexor and quad fatigue OK'
        },
        {
          id: 'mcl-3-3',
          name: 'Hip Adduction (Seated Pillow Squeeze)',
          sets: 3,
          reps: 12,
          hold: '6 seconds',
          description: 'Sit with knees bent, pillow or folded towel between them. Squeeze gently, hold, then relax.',
          image: '💺',
          difficulty: 'beginner',
          requiredEquipment: ['Pillow or towel'],
          painThreshold: 'Inner thigh activation'
        },
        {
          id: 'mcl-3-4',
          name: 'Lateral Step-Up',
          sets: 3,
          reps: 10,
          description: 'Stand sideways on low step with injured leg on step. Lean slightly forward and step up using top leg, then slowly lower. Progress by increasing step height.',
          image: '📦',
          difficulty: 'intermediate',
          requiredEquipment: ['Step or platform (start 4-6 inches)'],
          painThreshold: 'Muscle fatigue OK, no sharp pain'
        }
      ]
    }
  ],
  dosList: [
    'Ice knee regularly (15-20 min, 3-4x daily)',
    'Maintain range of motion daily',
    'Strengthen hip and thigh muscles',
    'Progress exercises gradually',
    'Wear brace if prescribed during activity',
    'Communicate with PT about pain levels'
  ],
  dontsList: [
    'Don\'t apply heat in early phases',
    'Don\'t force range of motion',
    'Don\'t allow knee to collapse inward',
    'Don\'t return to sports too early',
    'Don\'t skip strengthening exercises'
  ],
  whenToSeeDoctor: [
    'Significant increase in pain or swelling',
    'Knee instability or giving way',
    'Loss of range of motion',
    'Unable to bear weight',
    'No improvement after 2 weeks'
  ],
  progressMarkers: [
    'Week 2: Pain-free ROM to 135°',
    'Week 4: Quad strength returning',
    'Week 6: Normal walking pattern',
    'Week 8: Return to light activity'
  ]
};

// Meniscus Tear Rehabilitation Plan
export const MENISCUS_REHAB_PLAN: InjuryRehabPlan = {
  injuryType: 'meniscus-tear',
  injuryInfo: INJURIES['meniscus-tear'],
  totalWeeks: 8,
  phases: [
    {
      phase: 1,
      name: 'Acute Phase',
      duration: 'Weeks 0-2',
      goals: [
        'Reduce pain and swelling',
        'Begin gentle motion',
        'Re-activate quadriceps',
        'Regain knee flexion up to 135-145° pain-free'
      ],
      precautions: [
        'Avoid deep squatting',
        'No twisting on planted foot',
        'Use crutches if limping',
        'Ice regularly'
      ],
      exercises: [
        {
          id: 'men-1-1',
          name: 'Heel Slide',
          sets: 4,
          reps: 12,
          description: 'Start with knee as straight as possible. Use both arms as support. Slowly slide heel towards buttock until gentle stretch is felt. Stop before pain.',
          image: '🦵',
          difficulty: 'beginner',
          painThreshold: 'Stop before pain'
        },
        {
          id: 'men-1-2',
          name: 'Quadriceps Set',
          sets: 3,
          reps: 10,
          hold: '10 seconds',
          description: 'Sit or lie with injured leg straight (other leg bent or straight). Tighten quadriceps by pressing back of knee toward floor. Place towel under knee if needed.',
          image: '🦵',
          difficulty: 'beginner',
          painThreshold: 'Muscle contraction, no joint pain'
        },
        {
          id: 'men-1-3',
          name: 'Ankle Pumps',
          sets: 5,
          reps: 1,
          hold: '3-5 minutes',
          description: 'Sit or lie with injured leg straight. Move foot up and down by flexing and extending ankle. Helps improve circulation and reduce swelling.',
          image: '👣',
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        }
      ]
    },
    {
      phase: 2,
      name: 'Early Strengthening Phase',
      duration: 'Weeks 2-4',
      goals: [
        'Develop quadriceps, hamstrings, and hip strength',
        'Stabilize the knee',
        'Maintain pain-free range of motion',
        'Improve functional movement'
      ],
      precautions: [
        'Avoid activities causing pain or swelling',
        'Progress gradually',
        'Monitor for increased symptoms'
      ],
      exercises: [
        {
          id: 'men-2-1',
          name: 'Straight Leg Raise',
          sets: 3,
          reps: 12,
          description: 'Lie flat with injured leg straight, other leg bent. Pull ankle up slightly, lift straight leg until parallel with bent leg, hold briefly, then lower slowly.',
          image: '🦵',
          difficulty: 'intermediate',
          painThreshold: 'Quad fatigue OK, no knee pain'
        },
        {
          id: 'men-2-2',
          name: 'Hip Abduction',
          sets: 3,
          reps: 12,
          description: 'Lie on side with uninjured leg bent, injured leg straight. Fire up hip side muscles to raise heel toward ceiling (2 sec up, 2 sec down). Keep hip pushed forward.',
          image: '🦵',
          difficulty: 'intermediate',
          painThreshold: 'Hip muscle burn expected'
        },
        {
          id: 'men-2-3',
          name: 'Hip Adduction',
          sets: 3,
          reps: 12,
          description: 'Lie on side with injured leg on bottom and straight, other leg crossed in front. Raise injured leg up toward ceiling (2 sec up, 2 sec down).',
          image: '🦵',
          difficulty: 'intermediate',
          painThreshold: 'Inner thigh activation'
        },
        {
          id: 'men-2-4',
          name: 'Isometric Hamstring Curl (Glute Bridge)',
          sets: 3,
          reps: 12,
          description: 'Lie on back with knees bent, toes facing upward. Push heels down into floor, then lift hips toward ceiling (2 sec up, 2 sec down).',
          image: '🏋️',
          difficulty: 'intermediate',
          painThreshold: 'Glute and hamstring fatigue'
        }
      ]
    },
    {
      phase: 3,
      name: 'Functional Strengthening & Control',
      duration: 'Weeks 4-6+',
      goals: [
        'Restore full strength',
        'Improve balance and movement control',
        'Prepare for return to daily activities',
        'Build confidence in knee'
      ],
      precautions: [
        'Avoid deep squats initially',
        'Progress step height gradually',
        'Stop if pain increases'
      ],
      exercises: [
        {
          id: 'men-3-1',
          name: 'Mini Squats (~60° Knee Bend)',
          sets: 3,
          reps: 12,
          description: 'Stand with feet shoulder-width apart. Drop into quarter squat (~60° bend). Don\'t let knees move too far over toes. Keep knees aligned with toes.',
          image: '🧍',
          difficulty: 'intermediate',
          painThreshold: 'Muscle burn OK, no sharp pain'
        },
        {
          id: 'men-3-2',
          name: 'Lateral Step-Up',
          sets: 3,
          reps: 10,
          description: 'Stand sideways on low step with injured leg on step. Lean slightly forward and use top leg to step up, bringing other foot to meet it. Slowly lower back down.',
          image: '📦',
          difficulty: 'intermediate',
          requiredEquipment: ['Step or platform (start 4-6 inches)'],
          painThreshold: 'Muscle fatigue OK'
        }
      ]
    }
  ],
  dosList: [
    'Ice knee after activities',
    'Progress exercises gradually',
    'Maintain ROM daily',
    'Strengthen supporting muscles',
    'Listen to your body'
  ],
  dontsList: [
    'Don\'t deep squat early on',
    'Don\'t twist on planted foot',
    'Don\'t ignore pain signals',
    'Don\'t rush return to sports'
  ],
  whenToSeeDoctor: [
    'Knee locking or catching',
    'Significant swelling',
    'Inability to straighten knee',
    'Pain not improving after 2 weeks',
    'Knee giving way'
  ],
  progressMarkers: [
    'Week 2: Pain-free daily activities',
    'Week 4: Normal walking pattern',
    'Week 6: Light sport activity',
    'Week 8: Return to full activity'
  ]
};

// Lateral Ankle Sprain (Inversion Sprain) Rehabilitation Plan
export const LATERAL_ANKLE_SPRAIN_PLAN: InjuryRehabPlan = {
  injuryType: 'ankle-sprain',
  injuryInfo: INJURIES['ankle-sprain'],
  totalWeeks: 8,
  phases: [
    {
      phase: 1,
      name: 'Acute / Mobility Phase',
      duration: 'Week 1-2',
      goals: [
        'Reduce pain and swelling',
        'Restore gentle ankle mobility',
        'Begin early muscle activation',
        'Protect healing ligaments'
      ],
      precautions: [
        'Use crutches if limping',
        'RICE protocol (Rest, Ice, Compression, Elevation)',
        'No running or jumping',
        'Avoid walking on uneven surfaces'
      ],
      exercises: [
        {
          id: 'las-1-1',
          name: 'Ankle Dorsiflexion Mobility',
          sets: 3,
          reps: 12,
          description: 'Find a wall and measure how far toes can go from wall while keeping knee touching wall without lifting heel. Compare both legs. Hold or oscillate near limit (pain-free).',
          image: '🧱',
          difficulty: 'beginner',
          painThreshold: 'Gentle stretch, no sharp pain'
        },
        {
          id: 'las-1-2',
          name: 'Ankle Strengthening (Eversion Band Work)',
          sets: 3,
          reps: 15,
          description: 'Use elastic band looped around foot. Slowly pull ankle outward (eversion) against band and return slowly. Keep motion pain-free.',
          image: '🏋️',
          difficulty: 'beginner',
          requiredEquipment: ['Resistance band'],
          painThreshold: 'Mild resistance, no pain'
        }
      ]
    },
    {
      phase: 2,
      name: 'Strengthening & Balance Phase',
      duration: 'Week 3-4',
      goals: [
        'Improve calf and ankle strength',
        'Reintroduce balance and proprioception',
        'Maintain mobility without swelling',
        'Progress weight-bearing'
      ],
      precautions: [
        'Progress gradually to full weight-bearing',
        'Avoid sudden movements',
        'Use support for balance exercises initially'
      ],
      exercises: [
        {
          id: 'las-2-1',
          name: 'Calf Raise Exercise',
          sets: 3,
          reps: 22,
          description: 'Hold onto stable object for balance. Stand on injured leg with other leg lifted. Rise slowly onto ball of big toe, then lower down.',
          image: '🦶',
          difficulty: 'intermediate',
          painThreshold: 'Calf fatigue expected'
        },
        {
          id: 'las-2-2',
          name: 'Proprioceptive Control (Clock Reaches)',
          sets: 3,
          reps: 10,
          description: 'Stand on injured leg and reach free leg toward 12, 9, and 6 o\'clock directions. Keep balance without wobbling. Builds ankle stability.',
          image: '🕐',
          difficulty: 'intermediate',
          painThreshold: 'Should be pain-free'
        }
      ]
    },
    {
      phase: 3,
      name: 'Functional Strength Phase',
      duration: 'Week 5-6',
      goals: [
        'Strengthen functional movement patterns',
        'Improve single-leg control',
        'Increase lower limb endurance',
        'Prepare for return to activity'
      ],
      precautions: [
        'Progress depth and difficulty gradually',
        'Maintain proper ankle alignment'
      ],
      exercises: [
        {
          id: 'las-3-1',
          name: 'Single-Leg Squat',
          sets: 3,
          reps: 12,
          description: 'Stand on injured leg. Sit back as if on chair and perform squat as deep as comfortable, avoiding knee collapse inward.',
          image: '🧍',
          difficulty: 'advanced',
          painThreshold: 'Muscle fatigue OK, no ankle pain'
        },
        {
          id: 'las-3-2',
          name: 'Forward Lunge',
          sets: 3,
          reps: 12,
          description: 'Step forward with injured leg, land softly, and push back up. Keep ankle stable (avoid rolling).',
          image: '🏃',
          difficulty: 'advanced',
          painThreshold: 'Should be controlled'
        }
      ]
    },
    {
      phase: 4,
      name: 'Advanced / Return-to-Activity Phase',
      duration: 'Week 7-8',
      goals: [
        'Restore dynamic stability',
        'Prepare for sports or full activity',
        'Prevent re-injury through control',
        'Build confidence'
      ],
      precautions: [
        'Use ankle brace during sports initially',
        'Progress jump height gradually',
        'Avoid high-risk activities until fully confident'
      ],
      exercises: [
        {
          id: 'las-4-1',
          name: 'Hop to Landing',
          sets: 3,
          reps: 8,
          description: 'Two-legged hop → land on injured leg. Maintain balance and control on landing. Progressively increase jump height.',
          image: '🏃',
          difficulty: 'advanced',
          painThreshold: 'Should be pain-free'
        }
      ]
    }
  ],
  dosList: [
    'Ice regularly (15-20 min)',
    'Elevate ankle when resting',
    'Wear ankle brace during activity',
    'Progress exercises gradually',
    'Practice balance daily'
  ],
  dontsList: [
    'Don\'t walk on uneven surfaces early',
    'Don\'t return to sports too soon',
    'Don\'t ignore pain signals',
    'Don\'t skip balance exercises'
  ],
  whenToSeeDoctor: [
    'Severe pain not improving',
    'Ankle instability persists',
    'Significant swelling after 1 week',
    'Unable to bear weight',
    'Suspected fracture'
  ],
  progressMarkers: [
    'Week 2: Walking without limp',
    'Week 4: Balance on injured leg 30+ sec',
    'Week 6: Jogging pain-free',
    'Week 8: Return to sport'
  ]
};

// Medial Ankle Sprain (Eversion Sprain) Rehabilitation Plan
export const MEDIAL_ANKLE_SPRAIN_PLAN: InjuryRehabPlan = {
  injuryType: 'medial-ankle-sprain',
  injuryInfo: INJURIES['medial-ankle-sprain'],
  totalWeeks: 8,
  phases: [
    {
      phase: 1,
      name: 'Acute / Mobility Phase',
      duration: 'Week 1-2',
      goals: [
        'Reduce pain and swelling',
        'Maintain gentle mobility',
        'Prevent stiffness and muscle atrophy',
        'Protect deltoid ligament'
      ],
      precautions: [
        'Avoid eversion stress (foot turning outward)',
        'Use crutches as needed',
        'RICE protocol',
        'No weight-bearing initially if severe'
      ],
      exercises: [
        {
          id: 'mas-1-1',
          name: 'Ankle Pumps',
          sets: 5,
          reps: 20,
          description: 'Sit or lie with injured leg straight. Move ankle up and down by flexing and extending. Promotes blood circulation and reduces swelling.',
          image: '👣',
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'mas-1-2',
          name: 'Ankle Circles',
          sets: 3,
          reps: 15,
          description: 'Sit or lie with injured leg straight. Move ankle in circular motions through larger range of movement. Only if ankle pumps are pain-free.',
          image: '🔄',
          difficulty: 'beginner',
          painThreshold: 'Gentle stretch OK'
        }
      ]
    },
    {
      phase: 2,
      name: 'Strengthening & Balance Phase',
      duration: 'Week 3-5',
      goals: [
        'Restore inner ankle strength',
        'Improve proprioception and dynamic control',
        'Regain normal walking and balance',
        'Progress weight-bearing'
      ],
      precautions: [
        'Avoid excessive eversion',
        'Progress resistance gradually',
        'Stop if inner ankle pain increases'
      ],
      exercises: [
        {
          id: 'mas-2-1',
          name: 'Single-Leg Balance',
          sets: 3,
          reps: 1,
          hold: '60 seconds',
          description: 'Stand on injured leg, lift other leg off floor. Maintain tripod foot (base of big toe, base of little toe, heel). Use back leg for light support if needed.',
          image: '🧍',
          difficulty: 'intermediate',
          painThreshold: 'Should be stable and pain-free'
        },
        {
          id: 'mas-2-2',
          name: 'Ankle Inversion - Band',
          sets: 3,
          reps: 15,
          description: 'Loop band around injured foot, anchor with opposite leg. Pull foot inward (towards midline) slowly through full range. Avoid pain.',
          image: '🏋️',
          difficulty: 'intermediate',
          requiredEquipment: ['Resistance band'],
          painThreshold: 'Mild resistance, no pain'
        },
        {
          id: 'mas-2-3',
          name: 'Ankle Eversion - Band',
          sets: 3,
          reps: 15,
          description: 'Loop band around injured foot, step on band with opposite leg. Move foot outward slowly without moving entire leg. Avoid inner ankle discomfort.',
          image: '🏋️',
          difficulty: 'intermediate',
          requiredEquipment: ['Resistance band'],
          painThreshold: 'Mild resistance OK'
        },
        {
          id: 'mas-2-4',
          name: 'Heel Raise - Off Step',
          sets: 3,
          reps: 15,
          description: 'Stand on step edge with injured leg straight, other leg bent. Lift heel up as high as possible, then lower slowly through full range. Use wall/rail for support.',
          image: '📦',
          difficulty: 'intermediate',
          requiredEquipment: ['Step or platform'],
          painThreshold: 'Calf fatigue expected'
        },
        {
          id: 'mas-2-5',
          name: 'Ankle Dorsiflexion - Wall Support',
          sets: 3,
          reps: 15,
          description: 'Stand with back against wall. Step feet slightly forward and lift both toes up toward you, keeping knees straight. Further feet = harder.',
          image: '🧱',
          difficulty: 'intermediate',
          painThreshold: 'Shin muscle activation'
        }
      ]
    },
    {
      phase: 3,
      name: 'Functional / Return-to-Sport Phase',
      duration: 'Week 6-8',
      goals: [
        'Build power and landing control',
        'Restore confidence in single-leg dynamic tasks',
        'Prepare for sports or daily activity',
        'Prevent re-injury'
      ],
      precautions: [
        'Use ankle brace during sports initially',
        'Progress jump difficulty gradually',
        'Check for any asymmetry'
      ],
      exercises: [
        {
          id: 'mas-3-1',
          name: 'Double-Leg Jump',
          sets: 3,
          reps: 10,
          description: 'Perform small squat, jump slightly upward, land softly on both legs. Focus on controlled landing with even weight distribution. Use mirror to check symmetry.',
          image: '🏃',
          difficulty: 'advanced',
          painThreshold: 'Should be controlled and pain-free'
        },
        {
          id: 'mas-3-2',
          name: 'Lateral Bound',
          sets: 3,
          reps: 10,
          description: 'Jump laterally from one leg to other and back. Push off, land softly, maintain balance before returning. Gradually increase distance and height.',
          image: '🏃',
          difficulty: 'advanced',
          painThreshold: 'Controlled landing essential'
        },
        {
          id: 'mas-3-3',
          name: 'Single-Leg Hops',
          sets: 3,
          reps: 10,
          description: 'Stand on injured leg, bend slightly, hop upward. Land gently and control motion each time.',
          image: '🏃',
          difficulty: 'advanced',
          painThreshold: 'Should be pain-free'
        }
      ]
    }
  ],
  dosList: [
    'Ice regularly',
    'Elevate ankle frequently',
    'Strengthen all ankle muscles',
    'Practice balance daily',
    'Progress systematically'
  ],
  dontsList: [
    'Don\'t force painful movements',
    'Don\'t return to sports prematurely',
    'Don\'t neglect strengthening',
    'Don\'t skip balance training'
  ],
  whenToSeeDoctor: [
    'Severe pain not improving after 1 week',
    'Persistent instability',
    'Significant swelling after 2 weeks',
    'Unable to progress weight-bearing',
    'Suspected fracture or severe tear'
  ],
  progressMarkers: [
    'Week 2: Pain-free ROM',
    'Week 4: Normal walking pattern',
    'Week 6: Single-leg balance 60+ sec',
    'Week 8: Return to activity'
  ]
};

// High Ankle Sprain (Syndesmotic Sprain) Rehabilitation Plan
export const HIGH_ANKLE_SPRAIN_PLAN: InjuryRehabPlan = {
  injuryType: 'high-ankle-sprain',
  injuryInfo: INJURIES['high-ankle-sprain'],
  totalWeeks: 8,
  phases: [
    {
      phase: 1,
      name: 'Acute Phase',
      duration: 'Week 1-2',
      goals: [
        'Reduce swelling',
        'Maintain blood circulation',
        'Protect syndesmosis',
        'Gentle mobility work'
      ],
      precautions: [
        'No weight-bearing initially if severe',
        'Avoid external rotation of foot',
        'Use crutches and boot/brace if prescribed',
        'RICE protocol critical'
      ],
      exercises: [
        {
          id: 'has-1-1',
          name: 'Elevated Ankle Pumps',
          sets: 5,
          reps: 1,
          hold: '1-2 minutes',
          description: 'Lie with injured foot elevated (resting on couch or pillows). Move ankle up and down by flexing and extending. Keep elevated for 10-15 min, perform pumps for 1-2 min.',
          image: '👣',
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'has-1-2',
          name: 'Ankle Circles',
          sets: 3,
          reps: 15,
          description: 'Sit or lie with injured leg straight. Move ankle in circular motions through full pain-free range. Only if ankle pumps are pain-free.',
          image: '🔄',
          difficulty: 'beginner',
          painThreshold: 'Gentle movement, no pain'
        }
      ]
    },
    {
      phase: 2,
      name: 'Subacute / Strengthening Phase',
      duration: 'Week 2-4',
      goals: [
        'Gradually restore weight-bearing',
        'Strengthen calf muscles',
        'Improve ankle control',
        'Reduce swelling completely'
      ],
      precautions: [
        'Progress weight-bearing very gradually',
        'Avoid twisting motions',
        'Stop if increased pain or swelling'
      ],
      exercises: [
        {
          id: 'has-2-1',
          name: 'Progressive Weight Bearing',
          sets: 3,
          reps: 1,
          hold: 'Several minutes',
          description: 'Stand near wall/counter for support. Slowly shift weight from uninjured to injured leg, back and forth. Start 5-10% body weight, increase to full as tolerated. Try standing fully on injured leg.',
          image: '🧍',
          difficulty: 'beginner',
          painThreshold: 'Mild discomfort OK, no sharp pain'
        },
        {
          id: 'has-2-2',
          name: 'Double-Leg Calf Raises',
          sets: 3,
          reps: 18,
          description: 'Stand on both legs with hands on wall/chair. Raise heels off ground, putting equal weight (50-50) on both legs. Stop before pain; work through comfortable range.',
          image: '🦶',
          difficulty: 'intermediate',
          painThreshold: 'Calf fatigue OK'
        }
      ]
    },
    {
      phase: 3,
      name: 'Functional / Return to Activity Phase',
      duration: 'Week 4-6',
      goals: [
        'Build ankle stability and proprioception',
        'Restore neuromuscular coordination',
        'Strengthen supporting muscles',
        'Prepare for return to activity'
      ],
      precautions: [
        'Continue to avoid external rotation stress',
        'Progress exercises cautiously',
        'May need longer recovery than standard sprain'
      ],
      exercises: [
        {
          id: 'has-3-1',
          name: 'Proprioceptive Control (Clock Reaches)',
          sets: 3,
          reps: 10,
          description: 'Stand on injured leg. With other leg, reach toward imaginary clock positions — 12, 9, and 6 o\'clock — while maintaining balance.',
          image: '🕐',
          difficulty: 'intermediate',
          painThreshold: 'Should be stable and controlled'
        },
        {
          id: 'has-3-2',
          name: 'Glute Bridge',
          sets: 3,
          reps: 12,
          description: 'Lie on back with knees bent, feet flat. Press feet into floor, lift hips toward ceiling, hold briefly, then lower slowly. Progress by slightly lifting heels after raising hips.',
          image: '🏋️',
          difficulty: 'intermediate',
          painThreshold: 'Glute activation, no ankle pain'
        }
      ]
    }
  ],
  dosList: [
    'Follow medical advice strictly',
    'Ice and elevate regularly',
    'Progress weight-bearing very gradually',
    'Be patient - this injury takes time',
    'Use ankle brace when returning to activity'
  ],
  dontsList: [
    'Don\'t rush weight-bearing',
    'Don\'t twist or externally rotate ankle',
    'Don\'t return to sports prematurely',
    'Don\'t ignore pain signals'
  ],
  whenToSeeDoctor: [
    'Severe pain not improving after 2 weeks',
    'Unable to progress weight-bearing',
    'Persistent instability',
    'Significant swelling after 3 weeks',
    'Suspected syndesmotic disruption'
  ],
  progressMarkers: [
    'Week 2: Partial weight-bearing',
    'Week 4: Full weight-bearing',
    'Week 6: Single-leg balance',
    'Week 8: Light sport activity'
  ]
};

// Export all plans in a registry
export const REHAB_PLANS: Partial<Record<InjuryType, InjuryRehabPlan>> = {
  'acl-tear': ACL_REHAB_PLAN,
  'mcl-tear': MCL_REHAB_PLAN,
  'meniscus-tear': MENISCUS_REHAB_PLAN,
  'ankle-sprain': LATERAL_ANKLE_SPRAIN_PLAN,
  'medial-ankle-sprain': MEDIAL_ANKLE_SPRAIN_PLAN,
  'high-ankle-sprain': HIGH_ANKLE_SPRAIN_PLAN,
};
