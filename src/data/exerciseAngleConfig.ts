// Exercise angle detection configuration
// Maps exercises to their required angle tracking and validation

export type AngleType = 'knee' | 'ankle' | 'hip' | 'elbow' | 'shoulder';
export type BodySide = 'left' | 'right' | 'both';

export interface AngleRequirement {
  joint: AngleType;
  side: BodySide;
  minAngle?: number; // Minimum angle to count as valid
  maxAngle?: number; // Maximum angle to count as valid
  targetAngle?: number; // Target angle for the exercise
  tolerance?: number; // Acceptable deviation from target (±degrees)
  description: string;
}

export interface ExerciseAngleConfig {
  exerciseId: string;
  exerciseName: string;
  requiresAngleDetection: boolean;
  cameraAngle: 'side' | 'front' | 'back'; // Best camera position
  angleRequirements: AngleRequirement[];
  repCounting?: {
    startCondition: { joint: AngleType; side: BodySide; angleThreshold: number; direction: 'above' | 'below' };
    endCondition: { joint: AngleType; side: BodySide; angleThreshold: number; direction: 'above' | 'below' };
  };
  feedback?: {
    good: string; // Message when form is good
    tooShallow: string; // Message when angle is too small
    tooDeep: string; // Message when angle is too large
  };
}

// Exercise angle configurations database
export const EXERCISE_ANGLE_CONFIGS: Record<string, ExerciseAngleConfig> = {
  // ==================== KNEE EXERCISES ====================
  
  'heel-slide': {
    exerciseId: 'heel-slide',
    exerciseName: 'Heel Slide',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 90,
        maxAngle: 145,
        targetAngle: 120,
        tolerance: 15,
        description: 'Knee should bend between 90-145°'
      }
    ],
    repCounting: {
      startCondition: { joint: 'knee', side: 'both', angleThreshold: 160, direction: 'above' },
      endCondition: { joint: 'knee', side: 'both', angleThreshold: 120, direction: 'below' }
    },
    feedback: {
      good: '✓ Great knee flexion!',
      tooShallow: '↓ Try to bend deeper (aim for 120°)',
      tooDeep: '↑ Don\'t bend too far - stop before pain'
    }
  },

  'short-arc-quad': {
    exerciseId: 'short-arc-quad',
    exerciseName: 'Short Arc Quad',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 150,
        maxAngle: 180,
        targetAngle: 170,
        tolerance: 10,
        description: 'Knee should extend to nearly straight (150-180°)'
      }
    ],
    repCounting: {
      startCondition: { joint: 'knee', side: 'both', angleThreshold: 140, direction: 'below' },
      endCondition: { joint: 'knee', side: 'both', angleThreshold: 160, direction: 'above' }
    },
    feedback: {
      good: '✓ Perfect extension!',
      tooShallow: '↑ Extend knee more (straighten leg)',
      tooDeep: '✓ Good, hold the contraction'
    }
  },

  'straight-leg-raise': {
    exerciseId: 'straight-leg-raise',
    exerciseName: 'Straight Leg Raise',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 165,
        maxAngle: 180,
        description: 'Keep leg straight throughout (165-180°)'
      },
      {
        joint: 'hip',
        side: 'both',
        minAngle: 30,
        maxAngle: 60,
        targetAngle: 45,
        tolerance: 10,
        description: 'Lift leg 30-60° from ground'
      }
    ],
    repCounting: {
      startCondition: { joint: 'hip', side: 'both', angleThreshold: 20, direction: 'below' },
      endCondition: { joint: 'hip', side: 'both', angleThreshold: 40, direction: 'above' }
    },
    feedback: {
      good: '✓ Perfect form - leg straight!',
      tooShallow: '⚠ Keep leg completely straight',
      tooDeep: '↑ Lift higher (aim for 45°)'
    }
  },

  'bridges': {
    exerciseId: 'bridges',
    exerciseName: 'Bridges / Glute Bridge',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 80,
        maxAngle: 110,
        targetAngle: 90,
        tolerance: 15,
        description: 'Knees should stay at ~90° bend'
      },
      {
        joint: 'hip',
        side: 'both',
        minAngle: 160,
        maxAngle: 180,
        targetAngle: 170,
        tolerance: 10,
        description: 'Hips should extend to near straight line (160-180°)'
      }
    ],
    repCounting: {
      startCondition: { joint: 'hip', side: 'both', angleThreshold: 90, direction: 'below' },
      endCondition: { joint: 'hip', side: 'both', angleThreshold: 160, direction: 'above' }
    },
    feedback: {
      good: '✓ Great bridge position!',
      tooShallow: '↑ Lift hips higher',
      tooDeep: '✓ Perfect height!'
    }
  },

  'mini-squats': {
    exerciseId: 'mini-squats',
    exerciseName: 'Mini Squats',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 120,
        maxAngle: 140,
        targetAngle: 130,
        tolerance: 10,
        description: 'Shallow squat with knee at ~130° (60° bend)'
      }
    ],
    repCounting: {
      startCondition: { joint: 'knee', side: 'both', angleThreshold: 160, direction: 'above' },
      endCondition: { joint: 'knee', side: 'both', angleThreshold: 135, direction: 'below' }
    },
    feedback: {
      good: '✓ Perfect mini squat depth!',
      tooShallow: '↓ Squat a bit deeper',
      tooDeep: '⚠ Too deep - keep it shallow (~60° bend)'
    }
  },

  'single-leg-squat': {
    exerciseId: 'single-leg-squat',
    exerciseName: 'Single-Leg Squat',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 100,
        maxAngle: 130,
        targetAngle: 115,
        tolerance: 10,
        description: 'Knee should bend to ~115° on standing leg'
      }
    ],
    repCounting: {
      startCondition: { joint: 'knee', side: 'both', angleThreshold: 160, direction: 'above' },
      endCondition: { joint: 'knee', side: 'both', angleThreshold: 120, direction: 'below' }
    },
    feedback: {
      good: '✓ Excellent control!',
      tooShallow: '↓ Bend deeper (aim for ~65° bend)',
      tooDeep: '↑ Not too deep - control the descent'
    }
  },

  'forward-lunge': {
    exerciseId: 'forward-lunge',
    exerciseName: 'Forward Lunge',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 80,
        maxAngle: 100,
        targetAngle: 90,
        tolerance: 10,
        description: 'Front knee should bend to ~90°'
      }
    ],
    repCounting: {
      startCondition: { joint: 'knee', side: 'both', angleThreshold: 160, direction: 'above' },
      endCondition: { joint: 'knee', side: 'both', angleThreshold: 95, direction: 'below' }
    },
    feedback: {
      good: '✓ Perfect lunge depth!',
      tooShallow: '↓ Drop deeper (aim for 90°)',
      tooDeep: '↑ Don\'t go past 90°'
    }
  },

  'lateral-step-up': {
    exerciseId: 'lateral-step-up',
    exerciseName: 'Lateral Step-Up',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 150,
        maxAngle: 180,
        targetAngle: 170,
        tolerance: 10,
        description: 'Knee should extend fully at top of step'
      }
    ],
    repCounting: {
      startCondition: { joint: 'knee', side: 'both', angleThreshold: 120, direction: 'below' },
      endCondition: { joint: 'knee', side: 'both', angleThreshold: 160, direction: 'above' }
    },
    feedback: {
      good: '✓ Full extension achieved!',
      tooShallow: '↑ Extend knee fully at top',
      tooDeep: '✓ Good'
    }
  },

  // ==================== ANKLE EXERCISES ====================

  'ankle-pumps': {
    exerciseId: 'ankle-pumps',
    exerciseName: 'Ankle Pumps',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'ankle',
        side: 'both',
        minAngle: 70,
        maxAngle: 110,
        description: 'Ankle should flex and extend through full range'
      }
    ],
    repCounting: {
      startCondition: { joint: 'ankle', side: 'both', angleThreshold: 85, direction: 'below' },
      endCondition: { joint: 'ankle', side: 'both', angleThreshold: 105, direction: 'above' }
    },
    feedback: {
      good: '✓ Full range of motion!',
      tooShallow: '← → Move through full range',
      tooDeep: '✓ Good'
    }
  },

  'calf-raise': {
    exerciseId: 'calf-raise',
    exerciseName: 'Calf Raise',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'ankle',
        side: 'both',
        minAngle: 110,
        maxAngle: 140,
        targetAngle: 125,
        tolerance: 10,
        description: 'Rise onto toes (ankle plantarflexion)'
      },
      {
        joint: 'knee',
        side: 'both',
        minAngle: 160,
        maxAngle: 180,
        description: 'Keep legs straight'
      }
    ],
    repCounting: {
      startCondition: { joint: 'ankle', side: 'both', angleThreshold: 95, direction: 'below' },
      endCondition: { joint: 'ankle', side: 'both', angleThreshold: 115, direction: 'above' }
    },
    feedback: {
      good: '✓ Perfect calf raise!',
      tooShallow: '↑ Rise higher onto toes',
      tooDeep: '✓ Great height!'
    }
  },

  'heel-raise-off-step': {
    exerciseId: 'heel-raise-off-step',
    exerciseName: 'Heel Raise - Off Step',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'ankle',
        side: 'both',
        minAngle: 70,
        maxAngle: 140,
        description: 'Full range: from dorsiflexion to plantarflexion'
      }
    ],
    repCounting: {
      startCondition: { joint: 'ankle', side: 'both', angleThreshold: 85, direction: 'below' },
      endCondition: { joint: 'ankle', side: 'both', angleThreshold: 115, direction: 'above' }
    },
    feedback: {
      good: '✓ Excellent range of motion!',
      tooShallow: '↕ Move through full range',
      tooDeep: '✓ Perfect!'
    }
  },

  'ankle-dorsiflexion': {
    exerciseId: 'ankle-dorsiflexion',
    exerciseName: 'Ankle Dorsiflexion Mobility',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'ankle',
        side: 'both',
        minAngle: 70,
        maxAngle: 85,
        targetAngle: 75,
        tolerance: 5,
        description: 'Ankle should dorsiflex (toes toward shin)'
      }
    ],
    feedback: {
      good: '✓ Good dorsiflexion!',
      tooShallow: '← Pull toes toward shin more',
      tooDeep: '✓ Good stretch'
    }
  },

  // ==================== BALANCE EXERCISES ====================

  'single-leg-balance': {
    exerciseId: 'single-leg-balance',
    exerciseName: 'Single-Leg Balance',
    requiresAngleDetection: true,
    cameraAngle: 'front',
    angleRequirements: [
      {
        joint: 'knee',
        side: 'both',
        minAngle: 165,
        maxAngle: 180,
        description: 'Standing leg should stay straight'
      }
    ],
    feedback: {
      good: '✓ Great balance!',
      tooShallow: '⚠ Keep standing leg straight',
      tooDeep: '✓ Steady!'
    }
  },

  // ==================== HIP EXERCISES ====================

  'hip-abduction': {
    exerciseId: 'hip-abduction',
    exerciseName: 'Hip Abduction / Banded Hip Abduction',
    requiresAngleDetection: true,
    cameraAngle: 'front',
    angleRequirements: [
      {
        joint: 'hip',
        side: 'both',
        minAngle: 15,
        maxAngle: 45,
        targetAngle: 30,
        tolerance: 10,
        description: 'Lift leg 15-45° from midline'
      }
    ],
    repCounting: {
      startCondition: { joint: 'hip', side: 'both', angleThreshold: 10, direction: 'below' },
      endCondition: { joint: 'hip', side: 'both', angleThreshold: 25, direction: 'above' }
    },
    feedback: {
      good: '✓ Perfect abduction!',
      tooShallow: '↗ Lift leg higher',
      tooDeep: '↙ Don\'t lift too high'
    }
  },

  'hip-flexion': {
    exerciseId: 'hip-flexion',
    exerciseName: 'Hip Flexion with Straight Leg Raise',
    requiresAngleDetection: true,
    cameraAngle: 'side',
    angleRequirements: [
      {
        joint: 'hip',
        side: 'both',
        minAngle: 30,
        maxAngle: 60,
        targetAngle: 45,
        tolerance: 10,
        description: 'Lift leg 30-60° forward'
      },
      {
        joint: 'knee',
        side: 'both',
        minAngle: 165,
        maxAngle: 180,
        description: 'Keep leg straight'
      }
    ],
    repCounting: {
      startCondition: { joint: 'hip', side: 'both', angleThreshold: 20, direction: 'below' },
      endCondition: { joint: 'hip', side: 'both', angleThreshold: 40, direction: 'above' }
    },
    feedback: {
      good: '✓ Excellent hip flexion!',
      tooShallow: '↑ Lift higher',
      tooDeep: '↓ Don\'t lift too high'
    }
  }
};

/**
 * Get angle configuration for an exercise by ID or name
 */
export function getExerciseAngleConfig(exerciseIdOrName: string): ExerciseAngleConfig | null {
  // Try direct ID match first
  if (EXERCISE_ANGLE_CONFIGS[exerciseIdOrName]) {
    return EXERCISE_ANGLE_CONFIGS[exerciseIdOrName];
  }
  
  // Try fuzzy matching by name
  const normalizedSearch = exerciseIdOrName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  for (const config of Object.values(EXERCISE_ANGLE_CONFIGS)) {
    const normalizedConfigName = config.exerciseName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (normalizedConfigName.includes(normalizedSearch) || normalizedSearch.includes(normalizedConfigName)) {
      return config;
    }
  }
  
  return null;
}

/**
 * Check if an exercise requires angle detection
 */
export function requiresAngleDetection(exerciseIdOrName: string): boolean {
  const config = getExerciseAngleConfig(exerciseIdOrName);
  return config?.requiresAngleDetection ?? false;
}

/**
 * Validate if current angles meet the exercise requirements
 */
export function validateAngles(
  config: ExerciseAngleConfig,
  currentAngles: { leftKnee: number; rightKnee: number; leftAnkle: number; rightAnkle: number; leftHip: number; rightHip: number }
): {
  valid: boolean;
  feedback: string;
  details: { requirement: AngleRequirement; currentAngle: number; valid: boolean }[];
} {
  const details = config.angleRequirements.map(req => {
    let currentAngle: number;
    
    // Determine which angle to check
    if (req.side === 'left') {
      currentAngle = req.joint === 'knee' ? currentAngles.leftKnee : 
                     req.joint === 'ankle' ? currentAngles.leftAnkle : currentAngles.leftHip;
    } else if (req.side === 'right') {
      currentAngle = req.joint === 'knee' ? currentAngles.rightKnee : 
                     req.joint === 'ankle' ? currentAngles.rightAnkle : currentAngles.rightHip;
    } else {
      // 'both' - use the average
      const left = req.joint === 'knee' ? currentAngles.leftKnee : 
                   req.joint === 'ankle' ? currentAngles.leftAnkle : currentAngles.leftHip;
      const right = req.joint === 'knee' ? currentAngles.rightKnee : 
                    req.joint === 'ankle' ? currentAngles.rightAnkle : currentAngles.rightHip;
      currentAngle = (left + right) / 2;
    }
    
    // Check if angle is within requirements
    const valid = (req.minAngle === undefined || currentAngle >= req.minAngle) &&
                  (req.maxAngle === undefined || currentAngle <= req.maxAngle);
    
    return { requirement: req, currentAngle, valid };
  });
  
  const allValid = details.every(d => d.valid);
  
  // Generate feedback
  let feedback = config.feedback?.good ?? '✓ Good form!';
  if (!allValid) {
    const firstInvalid = details.find(d => !d.valid);
    if (firstInvalid) {
      if (firstInvalid.requirement.minAngle && firstInvalid.currentAngle < firstInvalid.requirement.minAngle) {
        feedback = config.feedback?.tooShallow ?? '↓ Increase the angle';
      } else if (firstInvalid.requirement.maxAngle && firstInvalid.currentAngle > firstInvalid.requirement.maxAngle) {
        feedback = config.feedback?.tooDeep ?? '↑ Decrease the angle';
      }
    }
  }
  
  return { valid: allValid, feedback, details };
}
