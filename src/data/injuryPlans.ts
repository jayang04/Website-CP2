// Comprehensive injury-specific rehabilitation plans database

import { type InjuryInfo, type InjuryRehabPlan, type InjuryType } from '../types/injuries';

// All supported injuries
export const INJURIES: Record<InjuryType, InjuryInfo> = {
  'acl-tear': {
    id: 'acl-tear',
    name: 'ACL Tear',
    category: 'knee',
    description: '• Anterior Cruciate Ligament tear - common in sports with sudden stops and direction changes',
    icon: '🦵',
    severity: 'severe',
    recoveryTime: '6-12 months',
    commonIn: ['Athletes', 'Soccer players', 'Basketball players', 'Skiers']
  },
  'mcl-tear': {
    id: 'mcl-tear',
    name: 'MCL Tear',
    category: 'knee',
    description: '• Medial Collateral Ligament tear - caused by impact to outer knee',
    icon: '🦵',
    severity: 'moderate',
    recoveryTime: '4-8 weeks',
    commonIn: ['Contact sport athletes', 'Football players', 'Hockey players']
  },
  'meniscus-tear': {
    id: 'meniscus-tear',
    name: 'Meniscus Tear',
    category: 'knee',
    description: '• Tear in knee cartilage - often from twisting motion while bearing weight',
    icon: '🦵',
    severity: 'moderate',
    recoveryTime: '6-12 weeks',
    commonIn: ['Athletes', 'Older adults', 'Manual laborers']
  },
  'ankle-sprain': {
    id: 'ankle-sprain',
    name: 'Lateral Ankle Sprain (Inversion Sprain)',
    category: 'ankle',
    description: '• Most common ankle sprain involving lateral ligaments (ATFL and CFL) from rolling ankle inward',
    icon: '🦶',
    severity: 'mild',
    recoveryTime: '2-8 weeks',
    commonIn: ['Athletes', 'Dancers', 'General population']
  },
  'medial-ankle-sprain': {
    id: 'medial-ankle-sprain',
    name: 'Medial Ankle Sprain',
    category: 'ankle',
    description: '• Deltoid ligament injury on inner ankle - less common but often takes longer to heal',
    icon: '🦶',
    severity: 'moderate',
    recoveryTime: '3-8 weeks',
    commonIn: ['Football players', 'Soccer players', 'Basketball players']
  },
  'high-ankle-sprain': {
    id: 'high-ankle-sprain',
    name: 'High Ankle Sprain',
    category: 'ankle',
    description: '• Injury to ligaments above the ankle joint, more severe than regular sprain',
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
  totalWeeks: 6,
  phases: [
    {
      phase: 1,
      name: 'Reduce Pain and Swelling',
      duration: 'Week 1',
      goals: [
        'Minimize swelling',
        'Maintain mobility',
        'Promote quadriceps activation'
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
          name: 'Quad Set',
          sets: 5,
          reps: 10,
          hold: '5-10 seconds',
          summary: 'Tighten quadriceps by pressing knee toward floor',
          description: '• Lie or sit with the injured leg straight (other leg bent or straight)\n• Tighten the quadriceps by pressing the back of the knee toward the floor\n• Hold for 5-10 seconds\n• Frequency: 3-5 sets x 10 repetitions daily',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/ACL/Quad Set.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'acl-1-2',
          name: 'Heel Slide',
          sets: 3,
          reps: 10,
          summary: 'Slide heel toward buttocks to bend knee',
          description: '• Lie down or sit with both legs straight\n• Slide the heel of the injured leg toward the buttocks, stopping before pain\n• Frequency: 3 sets x 10 repetitions daily',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/ACL/Heel Slide.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Stop before pain'
        },
        {
          id: 'acl-1-3',
          name: 'Ankle Pumps',
          sets: 3,
          reps: 30,
          summary: 'Flex and extend ankle to improve circulation',
          description: '• Place a rolled towel under the ankle\n• Flex and extend the ankle (pull toes toward you, then point away)\n• Frequency: 3 sets x 20-30 repetitions daily or for 2-3 minutes continuously',
          image: '👣',
          media: {
            videoUrl: '/exercise-demo-videos/ACL/Ankle Pumps.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        }
      ]
    },
    {
      phase: 2,
      name: 'Quadriceps Activation and Strength Recovery',
      duration: 'Weeks 2-4',
      goals: [
        'Restore knee extension',
        'Activate quadriceps',
        'Begin gentle strength work'
      ],
      precautions: [
        'Continue wearing brace as directed',
        'Avoid deep squats',
        'No running or jumping',
        'Discontinue if pain occurs'
      ],
      exercises: [
        {
          id: 'acl-2-1',
          name: 'Short Arc Quad',
          sets: 3,
          reps: 20,
          hold: '3 seconds',
          summary: 'Lift lower leg by contracting quadriceps',
          description: '• Place a foam roller or rolled towel (10-15 cm high) under the knee\n• Lift the lower leg by contracting the quadriceps, keeping the knee in contact with the support\n• Hold for 3 seconds, then lower slowly\n• Frequency: 3 sets x 15-20 repetitions daily\n• Discontinue if pain occurs',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/ACL/Short Arc Quad.mp4'
          },
          difficulty: 'beginner',
          requiredEquipment: ['Foam roller or towel'],
          painThreshold: 'Stop if pain occurs'
        },
        {
          id: 'acl-2-2',
          name: 'Straight Leg Raise',
          sets: 3,
          reps: 20,
          hold: 'Brief hold at top',
          summary: 'Lift straight leg to strengthen quadriceps',
          description: '• Keep injured leg straight and the other leg bent\n• Pull your ankle up for a bit, then lift the straight leg until it\'s parallel with the bent leg\n• Hold briefly, then lower slowly\n• Frequency: 3 sets × 10–20 repetitions daily',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/ACL/Straight Leg Raises.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Muscle fatigue OK, joint pain not OK'
        }
      ]
    },
    {
      phase: 3,
      name: 'Functional Strength and Hip Activation',
      duration: 'Weeks 5-6+',
      goals: [
        'Improve hip and core strength',
        'Enhance joint stability',
        'Prepare for functional movement'
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
          name: 'Bridges',
          sets: 3,
          reps: 20,
          summary: 'Lift hips to strengthen glutes and hamstrings',
          description: '• Lie on your back with both knees bent and arms by your sides\n• Push through your heels to lift your hips, forming a straight line from shoulders to knees\n• Hold briefly, then lower slowly\n• Frequency: 3 sets × 10–20 repetitions daily',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/ACL/Bridges.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Muscle burn OK'
        }
      ]
    }
  ],
  dosList: [
    'Follow PT instructions exactly',
    'Ice knee after exercises (15-20 min)',
    'Do exercises daily as prescribed',
    'Progress gradually through phases',
    'Communicate pain levels to PT',
    'Maintain overall fitness',
    'Stay patient - healing takes time'
  ],
  dontsList: [
    'Don\'t return to sports too early',
    'Don\'t skip strengthening exercises',
    'Don\'t ignore pain signals',
    'Don\'t pivot or twist on knee early on',
    'Don\'t do impact activities until cleared',
    'Don\'t compare your progress to others',
    'Don\'t stop exercises after feeling better'
  ],
  whenToSeeDoctor: [
    'Sudden increase in pain or swelling',
    'Knee gives way unexpectedly',
    'Loss of range of motion',
    'Severe pain not controlled by medication',
    'Clicking or locking sensation',
    'Unable to bear weight on leg'
  ],
  progressMarkers: [
    'Week 1: Minimal swelling, good quad activation',
    'Week 2: Improved knee extension',
    'Week 4: Better strength and control',
    'Week 6: Ready for advanced rehabilitation'
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
          sets: 5,
          reps: 15,
          summary: 'Slide heel towards buttocks to restore knee flexion',
          description: '• Start with the knee as straight as possible\n• Use both arms as support\n• Slowly slide the heel towards the buttock until a gentle stretch is felt\n• Stop before pain, then return to start\n• Goal: Regain knee flexion up to 135-145° pain-free',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Heel Slide.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Stop before pain, gentle stretch OK'
        },
        {
          id: 'mcl-1-2',
          name: 'Wall Heel Slide',
          sets: 3,
          reps: 4,
          hold: '15-30 seconds',
          summary: 'Slide foot down wall for gentle knee stretch',
          description: '• Lie on the floor with hips close to a wall, both feet resting on it\n• Allow the injured foot to slide slowly down the wall until a stretch is felt\n• Hold for 15–30 seconds, then return\n• Keep hips relaxed and flat on the floor',
          image: '🧱',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Wall Heel Slide.mp4'
          },
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
          summary: 'Press knee into roller to activate quadriceps',
          description: '• Place a foam roller under the injured knee. If unavailable, use a rolled-up towel or blanket (10-15 cm high)\n• Push the back of the knee down into the roller and hold for 6 seconds\n• 3-5 sessions per day x 8-12 repetitions',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Quad Set.mp4'
          },
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
          summary: 'Straighten leg while keeping knee on roller',
          description: '• Lie on your back with the roller (or rolled towel) under the knee\n• Straighten the lower leg by lifting the heel while keeping the knee in contact with the roller\n• Hold for 6 seconds, then lower slowly\n• Continue for 1-2 weeks as tolerated',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Short Arc Quad.mp4'
          },
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
          summary: 'Move leg outward against resistance band',
          description: '• Use a loop band placed just above the knees\n• Stand on the injured leg with hands on hips\n• Move the uninjured leg outward (abduction) and return\n• Perform on both sides\n• 3 sets x 10-15 repetitions daily',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Banded Hip Abduction.mp4'
          },
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
          summary: 'Lift straight leg to strengthen hip flexors',
          description: '• Lie on your back with the injured leg straight\n• Press the back of the knee gently into the floor\n• Lift the leg about 30 cm off the floor\n• Hold for 6 seconds, then lower slowly\n• 3 sets x 8-12 repetitions daily',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Hip Flexion with Straight Leg Raise.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Hip flexor and quad fatigue OK'
        },
        {
          id: 'mcl-3-3',
          name: 'Hip Adduction (Seated Pillow Squeeze)',
          sets: 3,
          reps: 12,
          hold: '6 seconds',
          summary: 'Squeeze pillow between knees',
          description: '• Sit with knees bent and a pillow or folded towel between them\n• Squeeze gently, hold for 6 seconds, then relax\n• 8-12 repetitions daily',
          image: '💺',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Hip Adduction (Seated Pillow:Towel Squeeze).mp4'
          },
          difficulty: 'beginner',
          requiredEquipment: ['Pillow or towel'],
          painThreshold: 'Inner thigh activation'
        },
        {
          id: 'mcl-3-4',
          name: 'Lateral Step-Up',
          sets: 3,
          reps: 10,
          summary: 'Step up sideways onto platform',
          description: '• Stand sideways on a low step with the injured leg on the step\n• Lean slightly forward and step up\n• Slowly lower back down\n• 8-12 repetitions daily\n• Progress by increasing step height as tolerated',
          image: '📦',
          media: {
            videoUrl: '/exercise-demo-videos/MCL/Lateral Step Up.mp4'
          },
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
          sets: 5,
          reps: 15,
          summary: 'Slide heel towards buttocks for gentle knee flexion',
          description: '• Start with knee as straight as possible\n• Slowly slide heel towards buttock\n• Use both arms for support\n• Stop before pain, return to start\n• Goal: Regain knee flexion up to 135-145° pain-free',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Heel Slide.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Stop before pain'
        },
        {
          id: 'men-1-2',
          name: 'Quad Set',
          sets: 3,
          reps: 10,
          hold: '10 seconds',
          summary: 'Tighten quad by pressing knee down',
          description: '• Sit or lie with injured leg straight\n• Tighten quadriceps by pressing knee toward floor\n• Place towel under knee if needed\n• Hold for 10 seconds, rest 10 seconds\n• Goal: Strengthen quadriceps and improve stability',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Quad Set.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Muscle contraction, no joint pain'
        },
        {
          id: 'men-1-3',
          name: 'Ankle Pumps',
          sets: 3,
          reps: 30,
          summary: 'Flex and extend ankle to improve circulation',
          description: '• Place a rolled towel under the ankle\n• Flex and extend the ankle (pull toes toward you, then point away)\n• Frequency: 3 sets x 20-30 repetitions daily or for 2-3 minutes continuously',
          image: '👣',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Ankle Pumps.mp4'
          },
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
          reps: 15,
          summary: 'Lift straight leg to strengthen quadriceps',
          description: '• Lie flat with injured leg straight, other leg bent\n• Pull ankle up slightly\n• Lift straight leg until parallel with bent leg\n• Hold briefly at top\n• Lower slowly with control',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Straight Leg Raise.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Quad fatigue OK, no knee pain'
        },
        {
          id: 'men-2-2',
          name: 'Hip Abduction',
          sets: 3,
          reps: 15,
          summary: 'Raise leg sideways to strengthen hip',
          description: '• Lie on side with uninjured leg bent, injured leg straight\n• Raise heel toward ceiling (2 sec up, 2 sec down)\n• Keep hip pushed forward, avoid rolling backward\n• Keep toes facing forward, not upward\n• Can do against wall for better form',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Hip Abduction.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Hip muscle burn expected'
        },
        {
          id: 'men-2-3',
          name: 'Hip Adduction',
          sets: 3,
          reps: 15,
          summary: 'Raise bottom leg to strengthen inner thigh',
          description: '• Lie on side with injured leg on bottom (straight)\n• Cross other leg in front\n• Raise injured leg toward ceiling\n• Use 2 seconds up, 2 seconds down timing\n• Strengthens inner thigh muscles',
          image: '🦵',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Hip Adduction.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Inner thigh activation'
        },
        {
          id: 'men-2-4',
          name: 'Isometric Hamstring Curl (Glute Bridge)',
          sets: 3,
          reps: 15,
          summary: 'Bridge exercise to strengthen hamstrings and glutes',
          description: '• Lie on back with knees bent, toes facing up\n• Push heels down into floor\n• Lift hips toward ceiling (2 sec up, 2 sec down)\n• Hold briefly at top\n• Strengthens hamstrings and glutes',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Isometric Hamstring Curl (Glute Bridge).mp4'
          },
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
          reps: 15,
          summary: 'Partial squat with 60 degree knee bend',
          description: '• Stand with feet shoulder-width apart\n• Drop into squat with 60° knee bend (quarter squat)\n• Keep knees behind toes\n• Keep knees aligned with toes (no collapse inward/outward)\n• Return to standing with control',
          image: '🧍',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Mini Squats.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Muscle burn OK, no sharp pain'
        },
        {
          id: 'men-3-2',
          name: 'Lateral Step-Up',
          sets: 3,
          reps: 12,
          summary: 'Step up sideways onto platform',
          description: '• Stand sideways on low step with injured leg on top\n• Lean slightly forward\n• Use top leg to step up\n• Bring other foot to meet it\n• Lower slowly back down\n• Progress: Gradually increase step height',
          image: '📦',
          media: {
            videoUrl: '/exercise-demo-videos/Meniscus Tear/Lateral Step-Up.mp4'
          },
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
          reps: 15,
          summary: 'Knee-to-wall test for ankle dorsiflexion',
          description: '• Find a wall and face it\n• Measure how far your toes can go from wall\n• Keep knee touching wall without lifting heel\n• Compare both legs, work near your limit (pain-free)\n• Hold or oscillate to mobilize joint and restore dorsiflexion',
          image: '🧱',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Ankle Dorsiflexion Mobility.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Gentle stretch, no sharp pain'
        },
        {
          id: 'las-1-2',
          name: 'Ankle Strengthening (Eversion Band Work)',
          sets: 3,
          reps: 15,
          summary: 'Pull ankle outward against resistance band',
          description: '• Loop elastic band around your foot\n• Slowly pull ankle outward (eversion) against band\n• Return slowly with control\n• Keep motion pain-free\n• Gradually increase to 20-25 reps as tolerated',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Ankle Strengthening (Isometric:Eversion Band Work).mp4'
          },
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
          reps: 25,
          summary: 'Single-leg calf raises for strength',
          description: '• Hold stable object for balance\n• Stand on injured leg only, other leg lifted\n• Rise slowly onto ball of big toe\n• Lower down with control\n• Focus on smooth, controlled movement',
          image: '🦶',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Calf Raise Exercise.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Calf fatigue expected'
        },
        {
          id: 'las-2-2',
          name: 'Proprioceptive Control (Clock Reaches)',
          sets: 3,
          reps: 10,
          summary: 'Balance on one leg reaching in different directions',
          description: '• Stand on injured leg only\n• Reach free leg toward 12, 9, and 6 o\'clock directions\n• Keep balance without wobbling\n• Focus on ankle stability and control\n• Perform each direction smoothly',
          image: '🕐',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Proprioceptive Control (Clock Reaches).mp4'
          },
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
          reps: 15,
          summary: 'Squat on one leg with control',
          description: '• Stand on injured leg only\n• Sit back as if sitting on a chair\n• Squat as deep as comfortable\n• Avoid knee collapse inward\n• Return to standing with control',
          image: '🧍',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Single-Leg Squat.mp4'
          },
          difficulty: 'advanced',
          painThreshold: 'Muscle fatigue OK, no ankle pain'
        },
        {
          id: 'las-3-2',
          name: 'Forward Lunge',
          sets: 3,
          reps: 15,
          summary: 'Step forward into lunge position',
          description: '• Step forward with injured leg\n• Land softly on forefoot\n• Lower into lunge position\n• Keep ankle stable (avoid rolling)\n• Push back to standing',
          image: '🏃',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Forward Lunge.mp4'
          },
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
          reps: 10,
          summary: 'Jump and land on injured leg',
          description: '• Start with both feet on ground\n• Jump with both legs\n• Land on injured leg only\n• Maintain balance and control on landing\n• Progressively increase jump height as tolerated',
          image: '🦘',
          media: {
            videoUrl: '/exercise-demo-videos/Lateral Ankle Sprain/Hop to Landing.mp4'
          },
          difficulty: 'advanced',
          painThreshold: 'Should be stable'
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
          summary: 'Move ankle up and down to reduce swelling',
          description: '• Sit or lie with injured leg straight\n• Move ankle up (dorsiflexion)\n• Move ankle down (plantarflexion)\n• Repeat rhythmically\n• Promotes blood circulation and reduces swelling',
          image: '👣',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Ankle Pumps.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'mas-1-2',
          name: 'Ankle Circles',
          sets: 3,
          reps: 15,
          summary: 'Circle ankle in both directions',
          description: '• Sit or lie with injured leg straight\n• Move ankle in circular motions clockwise\n• Then move counterclockwise\n• Use full range of movement\n• Only perform if ankle pumps are pain-free',
          image: '🔄',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Ankle Circles.mp4'
          },
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
          summary: 'Balance on one leg for stability',
          description: '• Stand on injured leg only\n• Lift other leg off floor\n• Maintain tripod foot position (big toe, little toe, heel)\n• Use back leg for light support if needed\n• Progress to no support when able',
          image: '🧍',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Single-Leg Balance.mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Should be stable and pain-free'
        },
        {
          id: 'mas-2-2',
          name: 'Ankle Inversion – Band',
          sets: 3,
          reps: 15,
          summary: 'Pull foot inward with resistance band',
          description: '• Loop resistance band around injured foot\n• Anchor with opposite leg or stable object\n• Pull foot inward towards midline\n• Move slowly through full range\n• Avoid pain during movement',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Ankle Inversion – Band.mp4'
          },
          difficulty: 'intermediate',
          requiredEquipment: ['Resistance band'],
          painThreshold: 'Mild resistance, no pain'
        },
        {
          id: 'mas-2-3',
          name: 'Ankle Eversion – Band',
          sets: 3,
          reps: 15,
          summary: 'Push foot outward with resistance band',
          description: '• Loop band around injured foot\n• Step on band with opposite leg\n• Move foot outward away from midline\n• Keep entire leg stable\n• Avoid inner ankle discomfort',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Ankle Eversion – Band.mp4'
          },
          difficulty: 'intermediate',
          requiredEquipment: ['Resistance band'],
          painThreshold: 'Mild resistance OK'
        },
        {
          id: 'mas-2-4',
          name: 'Heel Raise – Off Step',
          sets: 3,
          reps: 15,
          summary: 'Raise heel on step edge',
          description: '• Stand on step edge with injured leg straight\n• Keep other leg bent\n• Lift heel up as high as possible\n• Lower slowly through full range below step level\n• Use wall or rail for balance support',
          image: '📦',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Heel Raise – Off Step.mp4'
          },
          difficulty: 'intermediate',
          requiredEquipment: ['Step or platform'],
          painThreshold: 'Calf fatigue expected'
        },
        {
          id: 'mas-2-5',
          name: 'Ankle Dorsiflexion – Wall Support',
          sets: 3,
          reps: 15,
          summary: 'Lift toes against wall for ankle strength',
          description: '• Stand with back against wall\n• Step feet slightly forward\n• Lift both toes up toward you\n• Keep knees straight\n• Further feet position makes exercise harder',
          image: '🧱',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Ankle Dorsiflexion – Wall Support.mp4'
          },
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
          name: 'Double Leg Jump',
          sets: 3,
          reps: 10,
          summary: 'Jump and land on both legs',
          description: '• Perform small squat to prepare\n• Jump slightly upward\n• Land softly on both legs\n• Focus on controlled landing with even weight\n• Use mirror to check symmetry',
          image: '🏃',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Double-Leg Jump.mp4'
          },
          difficulty: 'advanced',
          painThreshold: 'Should be controlled and pain-free'
        },
        {
          id: 'mas-3-2',
          name: 'Lateral Bound',
          sets: 3,
          reps: 10,
          summary: 'Jump side to side between legs',
          description: '• Jump laterally from one leg to other\n• Push off powerfully\n• Land softly on opposite leg\n• Maintain balance before returning\n• Gradually increase distance and height',
          image: '🏃',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Lateral Bound.mp4'
          },
          difficulty: 'advanced',
          painThreshold: 'Controlled landing essential'
        },
        {
          id: 'mas-3-3',
          name: 'Single-Leg Hops',
          sets: 3,
          reps: 10,
          summary: 'Hop in place on injured leg',
          description: '• Stand on injured leg only\n• Bend knee slightly to prepare\n• Hop upward in place\n• Land gently with control\n• Maintain balance on each landing',
          image: '🏃',
          media: {
            videoUrl: '/exercise-demo-videos/Medial Ankle Sprain/Single-Leg Hops.mp4'
          },
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
          summary: 'Pump ankle while elevated to reduce swelling',
          description: '• Lie down with injured foot elevated on couch or pillows\n• Move ankle up and down by flexing and extending\n• Keep foot elevated for 10-15 minutes\n• Perform pumping motion for 1-2 minutes\n• Reduces swelling and improves circulation',
          image: '👣',
          media: {
            videoUrl: '/exercise-demo-videos/High Ankle Sprain/Elevated Ankle Pumps.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Should be pain-free'
        },
        {
          id: 'has-1-2',
          name: 'Ankle Circles',
          sets: 3,
          reps: 15,
          summary: 'Circle ankle through pain-free range',
          description: '• Sit or lie with injured leg straight\n• Move ankle in circular motions clockwise\n• Then move counterclockwise\n• Use full pain-free range of motion\n• Only perform if ankle pumps are pain-free',
          image: '🔄',
          media: {
            videoUrl: '/exercise-demo-videos/High Ankle Sprain/Ankle Circles.mp4'
          },
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
          summary: 'Gradually increase weight on injured leg',
          description: '• Stand near wall or counter for support\n• Slowly shift weight from uninjured to injured leg\n• Start with 5-10% body weight on injured leg\n• Gradually increase weight as tolerated to full weight\n• Try standing fully on injured leg when ready',
          image: '🧍',
          media: {
            videoUrl: '/exercise-demo-videos/High Ankle Sprain/Progressive Weight Bearing.mp4'
          },
          difficulty: 'beginner',
          painThreshold: 'Mild discomfort OK, no sharp pain'
        },
        {
          id: 'has-2-2',
          name: 'Double-Leg Calf Raises',
          sets: 3,
          reps: 18,
          summary: 'Raise heels with weight on both legs',
          description: '• Stand on both legs with hands on wall or chair\n• Raise heels off ground with equal weight on both legs (50-50)\n• Rise as high as comfortable\n• Lower slowly with control\n• Stop before pain, work through comfortable range',
          image: '🦶',
          media: {
            videoUrl: '/exercise-demo-videos/High Ankle Sprain/Double-Leg Calf Raises.mp4'
          },
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
          summary: 'Balance on one leg with reaching movements',
          description: '• Stand on injured leg only\n• Reach free leg toward 12 o\'clock position\n• Then reach toward 9 o\'clock\n• Then reach toward 6 o\'clock\n• Maintain balance and control throughout',
          image: '🕐',
          media: {
            videoUrl: '/exercise-demo-videos/High Ankle Sprain/Proprioceptive Control (Clock Reaches).mp4'
          },
          difficulty: 'intermediate',
          painThreshold: 'Should be stable and controlled'
        },
        {
          id: 'has-3-2',
          name: 'Glute Bridge',
          sets: 3,
          reps: 12,
          summary: 'Lift hips off ground in bridge position',
          description: '• Lie on back with knees bent and feet flat\n• Press feet into floor\n• Lift hips toward ceiling\n• Hold briefly at top\n• Lower slowly with control\n• Progress by slightly lifting heels after raising hips',
          image: '🏋️',
          media: {
            videoUrl: '/exercise-demo-videos/High Ankle Sprain/Glute Bridge.mp4'
          },
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
