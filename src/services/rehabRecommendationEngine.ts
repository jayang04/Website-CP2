// Rule-Based Personalized Rehab Recommendation Engine

import type { 
  UserProfile, 
  SessionHistory, 
  PersonalizedPlan, 
  PersonalizedExercise,
  RehabPhase,
  ProgressMetrics,
  DifficultyAdjustment,
  RecommendationReason
} from '../types/personalization';

export class RehabRecommendationEngine {
  
  /**
   * Generate a personalized weekly rehab plan
   */
  generateWeeklyPlan(
    userProfile: UserProfile, 
    sessionHistory: SessionHistory[]
  ): PersonalizedPlan {
    console.log('🎯 Generating personalized plan for user:', userProfile.userId);
    
    // Calculate progress metrics
    const metrics = this.calculateProgressMetrics(userProfile, sessionHistory);
    
    // Determine current rehab phase
    const phase = this.determineRehabPhase(userProfile, metrics);
    
    // Calculate difficulty adjustment
    const difficultyAdjustment = this.calculateDifficultyAdjustment(metrics, sessionHistory);
    
    // Select personalized exercises
    const exercises = this.selectExercises(userProfile, phase, difficultyAdjustment, metrics);
    
    // Determine optimal frequency
    const sessionsPerWeek = this.calculateOptimalFrequency(userProfile, metrics);
    
    // Generate motivational content
    const motivationalMessage = this.generateMotivationalMessage(metrics, sessionHistory);
    
    // Calculate next milestone
    const nextMilestone = this.calculateNextMilestone(phase, metrics);
    
    // Generate warnings if needed
    const warnings = this.generateWarnings(metrics, userProfile);
    
    const plan: PersonalizedPlan = {
      phase,
      weekNumber: this.calculateProgramWeek(sessionHistory), // Program week starts at 1
      exercises,
      estimatedDuration: this.estimateDuration(exercises),
      sessionsPerWeek,
      difficultyLevel: this.calculateOverallDifficulty(exercises),
      focusAreas: this.determineFocusAreas(phase, userProfile),
      warnings,
      motivationalMessage,
      nextMilestone
    };
    
    console.log('✅ Generated plan:', plan);
    return plan;
  }
  
  /**
   * Calculate comprehensive progress metrics
   */
  calculateProgressMetrics(
    userProfile: UserProfile, 
    sessionHistory: SessionHistory[]
  ): ProgressMetrics {
    const weeksSinceInjury = this.getWeeksSince(userProfile.injuryDate);
    
    // Get recent sessions (last 2 weeks)
    const recentSessions = this.getRecentSessions(sessionHistory, 14);
    
    // Calculate average pain level
    const averagePainLevel = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.postPainLevel, 0) / recentSessions.length
      : userProfile.currentPainLevel;
    
    // Determine pain trend
    const painTrend = this.calculatePainTrend(sessionHistory);
    
    // Calculate average completion rate
    const averageCompletionRate = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.completionRate, 0) / recentSessions.length
      : 0;
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(sessionHistory, userProfile.availableDays);
    
    // Calculate form quality trend
    const formQualityTrend = this.calculateFormTrend(sessionHistory);
    
    // Estimate recovery progress
    const estimatedRecoveryProgress = this.estimateRecoveryProgress(
      weeksSinceInjury,
      averagePainLevel,
      averageCompletionRate,
      userProfile.injuryType
    );
    
    return {
      weeksSinceInjury,
      averagePainLevel,
      painTrend,
      averageCompletionRate,
      consistencyScore,
      formQualityTrend,
      estimatedRecoveryProgress
    };
  }
  
  /**
   * Determine current rehab phase based on injury timeline and progress
   */
  determineRehabPhase(userProfile: UserProfile, metrics: ProgressMetrics): RehabPhase {
    const { weeksSinceInjury, averagePainLevel, averageCompletionRate } = metrics;
    
    // ACUTE PHASE: First 0-2 weeks OR high pain
    if (weeksSinceInjury <= 2 || averagePainLevel > 6) {
      console.log('📍 Phase: ACUTE - Focus on pain management and gentle movement');
      return 'ACUTE';
    }
    
    // SUBACUTE PHASE: 2-6 weeks AND moderate pain
    if (weeksSinceInjury <= 6 || averagePainLevel > 4) {
      console.log('📍 Phase: SUBACUTE - Focus on restoring range of motion');
      return 'SUBACUTE';
    }
    
    // STRENGTHENING PHASE: 6-12 weeks AND low pain AND good compliance
    if (weeksSinceInjury <= 12 || averagePainLevel > 2) {
      console.log('📍 Phase: STRENGTHENING - Focus on building strength');
      return 'STRENGTHENING';
    }
    
    // RETURN TO SPORT: 12+ weeks AND minimal pain AND excellent performance
    if (averagePainLevel <= 2 && averageCompletionRate > 80) {
      console.log('📍 Phase: RETURN_TO_SPORT - Focus on sport-specific movements');
      return 'RETURN_TO_SPORT';
    }
    
    // MAINTENANCE: Fully recovered
    console.log('📍 Phase: MAINTENANCE - Focus on injury prevention');
    return 'MAINTENANCE';
  }
  
  /**
   * Calculate difficulty adjustment based on recent performance
   */
  calculateDifficultyAdjustment(
    metrics: ProgressMetrics,
    sessionHistory: SessionHistory[]
  ): DifficultyAdjustment {
    const recentSessions = this.getRecentSessions(sessionHistory, 7); // Last week
    
    if (recentSessions.length < 2) {
      return 'MAINTAIN'; // Not enough data
    }
    
    const avgCompletion = recentSessions.reduce((sum, s) => sum + s.completionRate, 0) / recentSessions.length;
    const avgPostPain = recentSessions.reduce((sum, s) => sum + s.postPainLevel, 0) / recentSessions.length;
    
    // INCREASE difficulty if:
    // - High completion rate (>90%)
    // - Low pain (<3)
    // - Good consistency
    if (avgCompletion > 90 && avgPostPain < 3 && metrics.consistencyScore > 70) {
      console.log('📈 INCREASING difficulty - User is excelling!');
      return 'INCREASE';
    }
    
    // DECREASE difficulty if:
    // - Low completion rate (<60%)
    // - High pain (>6)
    // - Poor form quality
    if (avgCompletion < 60 || avgPostPain > 6 || metrics.formQualityTrend === 'DECLINING') {
      console.log('📉 DECREASING difficulty - User needs more time');
      return 'DECREASE';
    }
    
    // MAINTAIN otherwise
    console.log('➡️ MAINTAINING difficulty - User progressing well');
    return 'MAINTAIN';
  }
  
  /**
   * Select personalized exercises based on phase, profile, and performance
   */
  selectExercises(
    userProfile: UserProfile,
    phase: RehabPhase,
    difficultyAdjustment: DifficultyAdjustment,
    metrics: ProgressMetrics
  ): PersonalizedExercise[] {
    // Get exercise pool for this phase and injury type
    const availableExercises = this.getExercisePool(userProfile.injuryType, phase);
    
    // Filter based on limitations
    const filteredExercises = availableExercises.filter(ex => 
      !userProfile.limitations.some(limit => ex.name.toLowerCase().includes(limit.toLowerCase()))
    );
    
    // Adjust difficulty based on performance
    const difficultyMultiplier = this.getDifficultyMultiplier(
      difficultyAdjustment,
      userProfile.fitnessLevel
    );
    
    // Select 5-8 exercises
    const selectedExercises = this.prioritizeExercises(
      filteredExercises,
      userProfile,
      phase,
      metrics
    ).slice(0, this.getExerciseCount(phase, userProfile.preferredSessionDuration));
    
    // Apply difficulty adjustments
    return selectedExercises.map(ex => ({
      ...ex,
      sets: Math.round(ex.sets * difficultyMultiplier),
      reps: ex.reps ? Math.round(ex.reps * difficultyMultiplier) : undefined,
      reasoning: this.generateExerciseReasoning(ex, userProfile, phase, metrics)
    }));
  }
  
  /**
   * Get exercise pool for specific injury type and phase
   */
  private getExercisePool(injuryType: string, phase: RehabPhase): PersonalizedExercise[] {
    console.log('🎯 Getting exercise pool for:', { injuryType, phase });
    
    // This would connect to your existing exercise database
    // For now, returning structured examples
    
    const exerciseDatabase: Record<string, Record<RehabPhase, PersonalizedExercise[]>> = {
      'ACL': {
        'ACUTE': [
          {
            exerciseId: 'ankle-pumps',
            name: 'Ankle Pumps',
            sets: 3,
            reps: 20,
            restTime: 30,
            difficulty: 1,
            modifications: ['Can do in bed', 'Use pillows for elevation'],
            reasoning: 'Reduces swelling and maintains ankle mobility',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'quad-set',
            name: 'Quad Set',
            sets: 3,
            reps: 10,
            holdTime: 5,
            restTime: 30,
            difficulty: 2,
            modifications: ['Start with 3 second holds', 'Place towel under knee'],
            reasoning: 'Reactivates quad muscle and prevents atrophy',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'heel-slide',
            name: 'Heel Slide',
            sets: 2,
            reps: 10,
            restTime: 45,
            difficulty: 3,
            modifications: ['Use towel to assist', 'Stop before pain'],
            reasoning: 'Gently improves knee flexion range of motion',
            expectedPainLevel: 'mild'
          }
        ],
        'SUBACUTE': [
          {
            exerciseId: 'heel-slide',
            name: 'Heel Slide',
            sets: 3,
            reps: 15,
            restTime: 45,
            difficulty: 4,
            modifications: ['Use towel to assist', 'Stop before pain'],
            reasoning: 'Improves knee flexion range of motion',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'straight-leg-raise',
            name: 'Straight Leg Raises',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 5,
            modifications: ['Bend opposite knee', 'Support with hands'],
            reasoning: 'Strengthens quad without knee stress',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'bridges',
            name: 'Bridges',
            sets: 3,
            reps: 12,
            restTime: 45,
            difficulty: 4,
            modifications: ['Single-leg progression', 'Add resistance band'],
            reasoning: 'Strengthens glutes and hamstrings safely',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'short-arc-quad',
            name: 'Short Arc Quad',
            sets: 3,
            reps: 15,
            holdTime: 3,
            restTime: 30,
            difficulty: 3,
            modifications: ['Use towel roll under knee', 'Progress to ankle weights'],
            reasoning: 'Strengthens quadriceps with minimal joint stress',
            expectedPainLevel: 'mild'
          }
        ],
        'STRENGTHENING': [
          {
            exerciseId: 'mini-squats',
            name: 'Mini Squats',
            sets: 3,
            reps: 15,
            restTime: 60,
            difficulty: 6,
            modifications: ['Use chair for support', 'Limit depth to 60°'],
            reasoning: 'Builds quad and glute strength functionally',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'bridges',
            name: 'Bridges',
            sets: 3,
            reps: 15,
            restTime: 45,
            difficulty: 5,
            modifications: ['Single-leg progression', 'Add resistance band'],
            reasoning: 'Strengthens glutes and hamstrings',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'step-ups',
            name: 'Step-Ups',
            sets: 3,
            reps: 10,
            restTime: 60,
            difficulty: 7,
            modifications: ['Start with low step', 'Use rail for balance'],
            reasoning: 'Functional leg strengthening for daily activities',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'wall-sits',
            name: 'Wall Sits',
            sets: 3,
            holdTime: 20,
            restTime: 60,
            difficulty: 6,
            modifications: ['Adjust depth based on comfort', 'Progress hold time'],
            reasoning: 'Builds quad endurance and knee stability',
            expectedPainLevel: 'moderate'
          }
        ],
        'RETURN_TO_SPORT': [
          {
            exerciseId: 'single-leg-squat',
            name: 'Single-Leg Squat',
            sets: 3,
            reps: 10,
            restTime: 90,
            difficulty: 8,
            modifications: ['Use TRX for balance', 'Start with shallow depth'],
            reasoning: 'Sport-specific strength and stability',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'lateral-lunges',
            name: 'Lateral Lunges',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 7,
            modifications: ['Reduce range', 'Add resistance'],
            reasoning: 'Multi-directional strength for sport movements',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'box-jumps',
            name: 'Box Jumps',
            sets: 3,
            reps: 8,
            restTime: 90,
            difficulty: 9,
            modifications: ['Start with low box', 'Focus on landing technique'],
            reasoning: 'Plyometric power for return to sports',
            expectedPainLevel: 'mild'
          }
        ],
        'MAINTENANCE': [
          {
            exerciseId: 'full-squats',
            name: 'Full Squats',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 7,
            modifications: ['Add weight', 'Increase tempo'],
            reasoning: 'Maintains strength and prevents re-injury',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'single-leg-deadlift',
            name: 'Single-Leg Deadlift',
            sets: 3,
            reps: 10,
            restTime: 60,
            difficulty: 8,
            modifications: ['Use dumbbells', 'Focus on balance'],
            reasoning: 'Hamstring strength and balance maintenance',
            expectedPainLevel: 'none'
          }
        ]
      },
      'MCL': {
        'ACUTE': [
          {
            exerciseId: 'quad-set',
            name: 'Quad Set',
            sets: 3,
            reps: 10,
            holdTime: 5,
            restTime: 30,
            difficulty: 2,
            modifications: ['Start with 3 second holds', 'Place towel under knee'],
            reasoning: 'Maintains quad activation without stressing MCL',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'ankle-pumps',
            name: 'Ankle Pumps',
            sets: 3,
            reps: 20,
            restTime: 30,
            difficulty: 1,
            modifications: ['Can do in bed', 'Use pillows for elevation'],
            reasoning: 'Reduces swelling and maintains circulation',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'hip-adduction-squeeze',
            name: 'Hip Adduction (Pillow Squeeze)',
            sets: 3,
            reps: 10,
            holdTime: 5,
            restTime: 30,
            difficulty: 2,
            modifications: ['Use soft pillow', 'Gentle pressure only'],
            reasoning: 'Engages inner thigh muscles supporting MCL',
            expectedPainLevel: 'mild'
          }
        ],
        'SUBACUTE': [
          {
            exerciseId: 'heel-slide',
            name: 'Wall Heel Slide',
            sets: 3,
            reps: 12,
            restTime: 45,
            difficulty: 4,
            modifications: ['Use wall for support', 'Stop before pain'],
            reasoning: 'Improves knee flexion while protecting MCL',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'short-arc-quad',
            name: 'Short Arc Quad',
            sets: 3,
            reps: 15,
            holdTime: 3,
            restTime: 30,
            difficulty: 3,
            modifications: ['Use towel roll', 'Progress slowly'],
            reasoning: 'Rebuilds quad strength safely',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'straight-leg-raise',
            name: 'Hip Flexion with Straight Leg Raise',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 5,
            modifications: ['Bend opposite knee', 'Use ankle weights when ready'],
            reasoning: 'Strengthens hip flexors and quads',
            expectedPainLevel: 'mild'
          }
        ],
        'STRENGTHENING': [
          {
            exerciseId: 'hip-abduction',
            name: 'Banded Hip Abduction',
            sets: 3,
            reps: 15,
            restTime: 45,
            difficulty: 6,
            modifications: ['Adjust band resistance', 'Stand near wall'],
            reasoning: 'Strengthens hip stabilizers to protect knee',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'lateral-step-up',
            name: 'Lateral Step-Up',
            sets: 3,
            reps: 10,
            restTime: 60,
            difficulty: 7,
            modifications: ['Start with low step', 'Progress height gradually'],
            reasoning: 'Functional strengthening in frontal plane',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'mini-squats',
            name: 'Mini Squats',
            sets: 3,
            reps: 15,
            restTime: 60,
            difficulty: 6,
            modifications: ['Control depth', 'Avoid valgus stress'],
            reasoning: 'Builds overall leg strength safely',
            expectedPainLevel: 'mild'
          }
        ],
        'RETURN_TO_SPORT': [
          {
            exerciseId: 'lateral-lunges',
            name: 'Lateral Lunges',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 8,
            modifications: ['Control movement', 'Add resistance gradually'],
            reasoning: 'Sport-specific lateral movement strength',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'agility-drills',
            name: 'Lateral Agility Drills',
            sets: 3,
            reps: 10,
            restTime: 90,
            difficulty: 9,
            modifications: ['Start slow', 'Progress speed gradually'],
            reasoning: 'Prepares MCL for sport demands',
            expectedPainLevel: 'mild'
          }
        ],
        'MAINTENANCE': [
          {
            exerciseId: 'full-squats',
            name: 'Full Squats',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 7,
            modifications: ['Monitor form', 'Progress load'],
            reasoning: 'Maintains leg strength',
            expectedPainLevel: 'none'
          }
        ]
      },
      'MENISCUS': {
        'ACUTE': [
          {
            exerciseId: 'ankle-pumps',
            name: 'Ankle Pumps',
            sets: 3,
            reps: 20,
            restTime: 30,
            difficulty: 1,
            modifications: ['Gentle movement', 'Elevate leg'],
            reasoning: 'Reduces swelling without knee stress',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'quad-set',
            name: 'Quad Set',
            sets: 3,
            reps: 10,
            holdTime: 5,
            restTime: 30,
            difficulty: 2,
            modifications: ['Avoid deep flexion', 'Focus on control'],
            reasoning: 'Maintains quad activation',
            expectedPainLevel: 'mild'
          }
        ],
        'SUBACUTE': [
          {
            exerciseId: 'heel-slide',
            name: 'Heel Slide',
            sets: 3,
            reps: 12,
            restTime: 45,
            difficulty: 4,
            modifications: ['Avoid catching or locking', 'Stop at discomfort'],
            reasoning: 'Gently restores range of motion',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'straight-leg-raise',
            name: 'Straight Leg Raises',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 5,
            modifications: ['All directions', 'Progress with weights'],
            reasoning: 'Strengthens without meniscus compression',
            expectedPainLevel: 'mild'
          }
        ],
        'STRENGTHENING': [
          {
            exerciseId: 'mini-squats',
            name: 'Mini Squats',
            sets: 3,
            reps: 15,
            restTime: 60,
            difficulty: 6,
            modifications: ['Limited range', 'No twisting'],
            reasoning: 'Builds strength in safe range',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'bridges',
            name: 'Bridges',
            sets: 3,
            reps: 15,
            restTime: 45,
            difficulty: 5,
            modifications: ['Single-leg progression', 'Avoid rotation'],
            reasoning: 'Strengthens posterior chain safely',
            expectedPainLevel: 'none'
          }
        ],
        'RETURN_TO_SPORT': [
          {
            exerciseId: 'controlled-squats',
            name: 'Controlled Full Squats',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 7,
            modifications: ['Monitor for catching', 'Progress gradually'],
            reasoning: 'Tests meniscus tolerance to full range',
            expectedPainLevel: 'mild'
          }
        ],
        'MAINTENANCE': [
          {
            exerciseId: 'full-squats',
            name: 'Full Squats',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 7,
            modifications: ['Maintain form', 'Progress load'],
            reasoning: 'Maintains knee strength',
            expectedPainLevel: 'none'
          }
        ]
      },
      'LATERAL_ANKLE': {
        'ACUTE': [
          {
            exerciseId: 'ankle-pumps',
            name: 'Ankle Pumps',
            sets: 3,
            reps: 20,
            restTime: 30,
            difficulty: 1,
            modifications: ['Gentle range', 'Ice after'],
            reasoning: 'Reduces swelling and maintains circulation',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'ankle-circles',
            name: 'Ankle Circles',
            sets: 3,
            reps: 10,
            restTime: 30,
            difficulty: 2,
            modifications: ['Both directions', 'Slow and controlled'],
            reasoning: 'Gentle mobility in all planes',
            expectedPainLevel: 'mild'
          }
        ],
        'SUBACUTE': [
          {
            exerciseId: 'ankle-dorsiflexion',
            name: 'Ankle Dorsiflexion Mobility',
            sets: 3,
            reps: 15,
            restTime: 30,
            difficulty: 3,
            modifications: ['Use wall or band', 'Progress range'],
            reasoning: 'Restores upward ankle mobility',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'ankle-strengthening',
            name: 'Ankle Strengthening (Isometric Eversion)',
            sets: 3,
            reps: 10,
            holdTime: 5,
            restTime: 30,
            difficulty: 4,
            modifications: ['Use band or wall', 'Progress to movement'],
            reasoning: 'Strengthens lateral ankle stabilizers',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'calf-raise',
            name: 'Calf Raise Exercise',
            sets: 3,
            reps: 15,
            restTime: 45,
            difficulty: 4,
            modifications: ['Both legs initially', 'Progress to single-leg'],
            reasoning: 'Rebuilds calf strength and ankle stability',
            expectedPainLevel: 'mild'
          }
        ],
        'STRENGTHENING': [
          {
            exerciseId: 'single-leg-balance',
            name: 'Single-Leg Balance',
            sets: 3,
            holdTime: 30,
            restTime: 30,
            difficulty: 5,
            modifications: ['Eyes open/closed', 'Unstable surface progression'],
            reasoning: 'Improves proprioception and balance',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'single-leg-squat',
            name: 'Single-Leg Squat',
            sets: 3,
            reps: 10,
            restTime: 60,
            difficulty: 7,
            modifications: ['Shallow depth initially', 'Use support'],
            reasoning: 'Builds single-leg strength and control',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'forward-lunge',
            name: 'Forward Lunge',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 6,
            modifications: ['Control landing', 'Progress to dynamic'],
            reasoning: 'Functional strengthening for walking/running',
            expectedPainLevel: 'mild'
          }
        ],
        'RETURN_TO_SPORT': [
          {
            exerciseId: 'hop-to-landing',
            name: 'Hop to Landing',
            sets: 3,
            reps: 10,
            restTime: 90,
            difficulty: 8,
            modifications: ['Start bilateral', 'Progress to single-leg'],
            reasoning: 'Tests ankle stability in dynamic movements',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'agility-drills',
            name: 'Agility Drills',
            sets: 3,
            reps: 10,
            restTime: 90,
            difficulty: 9,
            modifications: ['Start slow', 'Progress speed and complexity'],
            reasoning: 'Sport-specific ankle preparation',
            expectedPainLevel: 'mild'
          }
        ],
        'MAINTENANCE': [
          {
            exerciseId: 'balance-maintenance',
            name: 'Balance Maintenance Exercises',
            sets: 3,
            holdTime: 30,
            restTime: 30,
            difficulty: 6,
            modifications: ['Various surfaces', 'Add perturbations'],
            reasoning: 'Prevents re-injury',
            expectedPainLevel: 'none'
          }
        ]
      },
      'MEDIAL_ANKLE': {
        'ACUTE': [
          {
            exerciseId: 'ankle-pumps',
            name: 'Ankle Pumps',
            sets: 3,
            reps: 20,
            restTime: 30,
            difficulty: 1,
            modifications: ['Gentle movement', 'Elevated position'],
            reasoning: 'Reduces swelling',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'ankle-circles',
            name: 'Ankle Circles',
            sets: 3,
            reps: 10,
            restTime: 30,
            difficulty: 2,
            modifications: ['Slow circles', 'Both directions'],
            reasoning: 'Gentle mobility',
            expectedPainLevel: 'mild'
          }
        ],
        'SUBACUTE': [
          {
            exerciseId: 'ankle-eversion',
            name: 'Ankle Eversion – Band',
            sets: 3,
            reps: 15,
            restTime: 30,
            difficulty: 4,
            modifications: ['Progress resistance', 'Control movement'],
            reasoning: 'Strengthens lateral ankle muscles',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'ankle-inversion',
            name: 'Ankle Inversion – Band',
            sets: 3,
            reps: 15,
            restTime: 30,
            difficulty: 4,
            modifications: ['Gentle resistance', 'Avoid pain'],
            reasoning: 'Strengthens medial ankle carefully',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'heel-raise',
            name: 'Heel Raise – Off Step',
            sets: 3,
            reps: 12,
            restTime: 45,
            difficulty: 5,
            modifications: ['Full range', 'Progress to single-leg'],
            reasoning: 'Builds calf strength and ankle stability',
            expectedPainLevel: 'mild'
          }
        ],
        'STRENGTHENING': [
          {
            exerciseId: 'single-leg-balance',
            name: 'Single-Leg Balance',
            sets: 3,
            holdTime: 30,
            restTime: 30,
            difficulty: 6,
            modifications: ['Progress to unstable surface', 'Eyes closed'],
            reasoning: 'Improves ankle proprioception',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'single-leg-hops',
            name: 'Single-Leg Hops',
            sets: 3,
            reps: 10,
            restTime: 60,
            difficulty: 7,
            modifications: ['Start small', 'Progress height and distance'],
            reasoning: 'Dynamic ankle strengthening',
            expectedPainLevel: 'mild'
          }
        ],
        'RETURN_TO_SPORT': [
          {
            exerciseId: 'lateral-bound',
            name: 'Lateral Bound',
            sets: 3,
            reps: 10,
            restTime: 90,
            difficulty: 9,
            modifications: ['Control landing', 'Progress distance'],
            reasoning: 'Sport-specific lateral power',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'double-leg-jump',
            name: 'Double-Leg Jump',
            sets: 3,
            reps: 10,
            restTime: 90,
            difficulty: 8,
            modifications: ['Focus on landing', 'Soft knees'],
            reasoning: 'Prepares for sport demands',
            expectedPainLevel: 'mild'
          }
        ],
        'MAINTENANCE': [
          {
            exerciseId: 'balance-exercises',
            name: 'Balance Exercises',
            sets: 3,
            holdTime: 30,
            restTime: 30,
            difficulty: 6,
            modifications: ['Challenge balance', 'Various surfaces'],
            reasoning: 'Prevents re-injury',
            expectedPainLevel: 'none'
          }
        ]
      },
      'HIGH_ANKLE': {
        'ACUTE': [
          {
            exerciseId: 'elevated-ankle-pumps',
            name: 'Elevated Ankle Pumps',
            sets: 3,
            reps: 20,
            restTime: 30,
            difficulty: 1,
            modifications: ['Very gentle', 'Ice regularly'],
            reasoning: 'Reduces swelling without syndesmosis stress',
            expectedPainLevel: 'none'
          },
          {
            exerciseId: 'ankle-circles',
            name: 'Ankle Circles',
            sets: 3,
            reps: 10,
            restTime: 30,
            difficulty: 2,
            modifications: ['Small circles only', 'Avoid rotation stress'],
            reasoning: 'Gentle mobility',
            expectedPainLevel: 'mild'
          }
        ],
        'SUBACUTE': [
          {
            exerciseId: 'progressive-weight-bearing',
            name: 'Progressive Weight Bearing',
            sets: 3,
            reps: 10,
            restTime: 45,
            difficulty: 3,
            modifications: ['Increase weight gradually', 'Monitor pain'],
            reasoning: 'Gradually loads healing syndesmosis',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'double-leg-calf-raise',
            name: 'Double-Leg Calf Raises',
            sets: 3,
            reps: 12,
            restTime: 45,
            difficulty: 4,
            modifications: ['Support available', 'Avoid rotation'],
            reasoning: 'Strengthens calf without rotation stress',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'glute-bridge',
            name: 'Glute Bridge',
            sets: 3,
            reps: 15,
            restTime: 45,
            difficulty: 4,
            modifications: ['Feet flat', 'No ankle movement'],
            reasoning: 'Maintains leg strength without ankle stress',
            expectedPainLevel: 'none'
          }
        ],
        'STRENGTHENING': [
          {
            exerciseId: 'proprioceptive-control',
            name: 'Proprioceptive Control (Clock Reaches)',
            sets: 3,
            reps: 12,
            restTime: 60,
            difficulty: 6,
            modifications: ['All directions', 'Progress range'],
            reasoning: 'Improves ankle stability and control',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'single-leg-balance',
            name: 'Single-Leg Balance',
            sets: 3,
            holdTime: 30,
            restTime: 30,
            difficulty: 6,
            modifications: ['Progress to unstable', 'No rotation initially'],
            reasoning: 'Builds ankle proprioception safely',
            expectedPainLevel: 'none'
          }
        ],
        'RETURN_TO_SPORT': [
          {
            exerciseId: 'light-jogging',
            name: 'Light Jogging',
            sets: 1,
            reps: 10,
            restTime: 120,
            difficulty: 7,
            modifications: ['Straight lines only', 'Progress distance'],
            reasoning: 'Tests syndesmosis under sport loads',
            expectedPainLevel: 'mild'
          },
          {
            exerciseId: 'cutting-drills',
            name: 'Cutting Drills',
            sets: 3,
            reps: 8,
            restTime: 90,
            difficulty: 9,
            modifications: ['Start with gentle cuts', 'Progress angle'],
            reasoning: 'Prepares for rotational sport demands',
            expectedPainLevel: 'mild'
          }
        ],
        'MAINTENANCE': [
          {
            exerciseId: 'balance-exercises',
            name: 'Balance Exercises',
            sets: 3,
            holdTime: 30,
            restTime: 30,
            difficulty: 6,
            modifications: ['Challenge stability', 'Add rotation gradually'],
            reasoning: 'Prevents re-injury',
            expectedPainLevel: 'none'
          }
        ]
      }
      // Note: This is a comprehensive starter database. In production, connect to your full exercise library
    };
    
    const injuryExercises = exerciseDatabase[injuryType];
    if (!injuryExercises) {
      console.warn(`⚠️ No exercises found for injury type: ${injuryType}`);
      console.warn(`📋 Available injury types:`, Object.keys(exerciseDatabase));
      return [];
    }
    
    const exercises = injuryExercises[phase] || [];
    console.log(`✅ Found ${exercises.length} exercises for ${injuryType} - ${phase}`);
    return exercises;
  }
  
  /**
   * Prioritize exercises based on user goals and needs
   */
  private prioritizeExercises(
    exercises: PersonalizedExercise[],
    userProfile: UserProfile,
    phase: RehabPhase,
    metrics: ProgressMetrics
  ): PersonalizedExercise[] {
    // Sort exercises by priority score
    return exercises.sort((a, b) => {
      const scoreA = this.calculateExercisePriorityScore(a, userProfile, phase, metrics);
      const scoreB = this.calculateExercisePriorityScore(b, userProfile, phase, metrics);
      return scoreB - scoreA;
    });
  }
  
  private calculateExercisePriorityScore(
    exercise: PersonalizedExercise,
    userProfile: UserProfile,
    phase: RehabPhase,
    metrics: ProgressMetrics
  ): number {
    let score = 0;
    
    // Prioritize by fitness level match
    if (userProfile.fitnessLevel === 'BEGINNER' && exercise.difficulty <= 4) score += 10;
    if (userProfile.fitnessLevel === 'INTERMEDIATE' && exercise.difficulty >= 4 && exercise.difficulty <= 7) score += 10;
    if (userProfile.fitnessLevel === 'ADVANCED' && exercise.difficulty >= 6) score += 10;
    
    // Prioritize by pain level
    if (metrics.averagePainLevel > 5 && exercise.expectedPainLevel === 'none') score += 15;
    if (metrics.averagePainLevel <= 3 && exercise.expectedPainLevel === 'mild') score += 5;
    
    // Prioritize by goals
    userProfile.goals.forEach(goal => {
      if (exercise.reasoning.toLowerCase().includes(goal.toLowerCase())) {
        score += 8;
      }
    });
    
    return score;
  }
  
  /**
   * Calculate optimal session frequency
   */
  private calculateOptimalFrequency(userProfile: UserProfile, metrics: ProgressMetrics): number {
    // Start with user availability
    let frequency = userProfile.availableDays;
    
    // Adjust based on consistency
    if (metrics.consistencyScore < 50) {
      frequency = Math.max(2, frequency - 1); // Reduce to build habit
    }
    
    // Adjust based on pain
    if (metrics.averagePainLevel > 6) {
      frequency = Math.max(2, frequency - 1); // More rest needed
    }
    
    // Adjust based on phase
    if (metrics.weeksSinceInjury <= 2) {
      frequency = Math.min(frequency, 3); // Limit early phase
    }
    
    return Math.min(6, Math.max(2, frequency)); // Between 2-6 sessions/week
  }
  
  /**
   * Generate motivational message based on progress
   */
  private generateMotivationalMessage(metrics: ProgressMetrics, sessionHistory: SessionHistory[]): string {
    const recentSessions = this.getRecentSessions(sessionHistory, 7);
    const streak = this.calculateStreak(sessionHistory);
    
    // Struggling
    if (metrics.averageCompletionRate < 60 || metrics.painTrend === 'WORSENING') {
      const messages = [
        "💪 Recovery isn't linear - every small effort counts!",
        "🌟 You're doing great by showing up. Progress takes time!",
        "🎯 Focus on what you CAN do today. Small wins add up!",
        "💙 It's okay to have tough days. Rest is part of healing."
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Improving
    if (metrics.painTrend === 'IMPROVING' || metrics.formQualityTrend === 'IMPROVING') {
      const messages = [
        `🚀 Fantastic! Your pain levels are improving - down ${Math.round((10 - metrics.averagePainLevel) * 10)}%!`,
        "⭐ Your form is getting better! Quality over quantity!",
        `🔥 ${streak} day streak! Your consistency is paying off!`,
        `💯 ${Math.round(metrics.estimatedRecoveryProgress)}% recovered! Keep up the amazing work!`
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Milestone reached
    if (metrics.estimatedRecoveryProgress >= 50 && metrics.estimatedRecoveryProgress < 55) {
      return "🎉 MILESTONE: Halfway to full recovery! You're unstoppable!";
    }
    
    if (streak >= 7) {
      return `🔥 ${streak} DAY STREAK! You're building an incredible habit!`;
    }
    
    // Default encouraging
    return "💪 You're making progress! Keep trusting the process!";
  }
  
  /**
   * Calculate next milestone
   */
  private calculateNextMilestone(phase: RehabPhase, metrics: ProgressMetrics): string {
    if (phase === 'ACUTE') {
      return `Complete 7 days with pain <5 to move to next phase`;
    }
    if (phase === 'SUBACUTE') {
      return `Achieve 80% completion rate to advance to strengthening`;
    }
    if (phase === 'STRENGTHENING') {
      return `Maintain pain <3 for 2 weeks to start sport-specific training`;
    }
    if (phase === 'RETURN_TO_SPORT') {
      return `Complete all exercises at target difficulty to return to full activity`;
    }
    return `Maintain consistency to prevent re-injury`;
  }
  
  /**
   * Generate warnings if needed
   */
  private generateWarnings(metrics: ProgressMetrics, userProfile: UserProfile): string[] {
    const warnings: string[] = [];
    
    if (metrics.painTrend === 'WORSENING') {
      warnings.push('⚠️ Pain levels increasing - consider reducing intensity');
    }
    
    if (metrics.consistencyScore < 40) {
      warnings.push('📅 Low consistency detected - try scheduling sessions in advance');
    }
    
    if (metrics.averageCompletionRate < 50) {
      warnings.push('🎯 Many incomplete sessions - exercises may be too challenging');
    }
    
    if (metrics.formQualityTrend === 'DECLINING') {
      warnings.push('⚡ Form quality declining - focus on technique over speed');
    }
    
    return warnings;
  }
  
  // Helper methods
  private getWeeksSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  }
  
  /**
   * Calculate program week number (starts at 1 when user begins rehab)
   * This is different from weeksSinceInjury - it tracks rehab program progress
   */
  private calculateProgramWeek(sessionHistory: SessionHistory[]): number {
    if (sessionHistory.length === 0) {
      return 1; // First week of program
    }
    
    // Find the first session date
    const firstSessionDate = new Date(
      Math.min(...sessionHistory.map(s => new Date(s.date).getTime()))
    );
    
    // Calculate weeks since first session
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstSessionDate.getTime());
    const weeksSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    // Ensure it's at least week 1
    return Math.max(1, weeksSinceStart);
  }

  private getRecentSessions(sessions: SessionHistory[], days: number): SessionHistory[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return sessions.filter(s => new Date(s.date) >= cutoff);
  }
  
  private calculatePainTrend(sessions: SessionHistory[]): 'IMPROVING' | 'STABLE' | 'WORSENING' {
    if (sessions.length < 3) return 'STABLE';
    
    const recent = sessions.slice(-5);
    const older = sessions.slice(-10, -5);
    
    if (older.length === 0) return 'STABLE';
    
    const recentAvg = recent.reduce((sum, s) => sum + s.postPainLevel, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.postPainLevel, 0) / older.length;
    
    if (recentAvg < olderAvg - 0.5) return 'IMPROVING';
    if (recentAvg > olderAvg + 0.5) return 'WORSENING';
    return 'STABLE';
  }
  
  private calculateConsistencyScore(sessions: SessionHistory[], targetDays: number): number {
    if (sessions.length === 0) return 0;
    
    const last4Weeks = this.getRecentSessions(sessions, 28);
    const expectedSessions = targetDays * 4;
    const actualSessions = last4Weeks.length;
    
    return Math.min(100, (actualSessions / expectedSessions) * 100);
  }
  
  private calculateFormTrend(sessions: SessionHistory[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (sessions.length < 3) return 'STABLE';
    
    const recent = sessions.slice(-5);
    const older = sessions.slice(-10, -5);
    
    if (older.length === 0) return 'STABLE';
    
    const recentAvg = recent.reduce((sum, s) => sum + s.formQualityScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.formQualityScore, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'IMPROVING';
    if (recentAvg < olderAvg - 5) return 'DECLINING';
    return 'STABLE';
  }
  
  private estimateRecoveryProgress(
    weeks: number,
    pain: number,
    completion: number,
    injuryType: string
  ): number {
    // Simple formula - can be refined
    const timeProgress = Math.min(100, (weeks / 12) * 100);
    const painProgress = Math.min(100, ((10 - pain) / 10) * 100);
    const performanceProgress = completion;
    
    return Math.round((timeProgress + painProgress + performanceProgress) / 3);
  }
  
  private calculateStreak(sessions: SessionHistory[]): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasSession) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  private getDifficultyMultiplier(
    adjustment: DifficultyAdjustment,
    fitnessLevel: string
  ): number {
    const baseMultiplier = {
      'BEGINNER': 0.8,
      'INTERMEDIATE': 1.0,
      'ADVANCED': 1.2
    }[fitnessLevel] || 1.0;
    
    if (adjustment === 'INCREASE') return baseMultiplier * 1.15;
    if (adjustment === 'DECREASE') return baseMultiplier * 0.85;
    return baseMultiplier;
  }
  
  private getExerciseCount(phase: RehabPhase, duration: number): number {
    // Estimate exercises based on duration
    const exercisesPerMinute = 0.15; // Rough estimate
    const baseCount = Math.floor(duration * exercisesPerMinute);
    
    if (phase === 'ACUTE') return Math.min(5, baseCount);
    if (phase === 'SUBACUTE') return Math.min(7, baseCount);
    return Math.min(8, baseCount);
  }
  
  private estimateDuration(exercises: PersonalizedExercise[]): number {
    return exercises.reduce((total, ex) => {
      const exerciseTime = (ex.sets * (((ex.reps || 1) * 2) + (ex.holdTime || 0) + ex.restTime));
      return total + exerciseTime;
    }, 0) / 60; // Convert to minutes
  }
  
  private calculateOverallDifficulty(exercises: PersonalizedExercise[]): number {
    if (exercises.length === 0) return 1;
    const avg = exercises.reduce((sum, ex) => sum + ex.difficulty, 0) / exercises.length;
    return Math.round(avg);
  }
  
  private determineFocusAreas(phase: RehabPhase, userProfile: UserProfile): string[] {
    const focusMap: Record<RehabPhase, string[]> = {
      'ACUTE': ['Pain Management', 'Swelling Control', 'Gentle Movement'],
      'SUBACUTE': ['Range of Motion', 'Flexibility', 'Light Strengthening'],
      'STRENGTHENING': ['Muscle Building', 'Functional Strength', 'Balance'],
      'RETURN_TO_SPORT': ['Sport-Specific Drills', 'Power', 'Agility'],
      'MAINTENANCE': ['Injury Prevention', 'Consistent Training', 'Overall Fitness']
    };
    
    return focusMap[phase] || [];
  }
  
  private generateExerciseReasoning(
    exercise: PersonalizedExercise,
    userProfile: UserProfile,
    phase: RehabPhase,
    metrics: ProgressMetrics
  ): string {
    const reasons: string[] = [exercise.reasoning];
    
    // Add personalized context
    if (metrics.averagePainLevel > 5) {
      reasons.push('Selected for low pain impact');
    }
    
    if (userProfile.fitnessLevel === 'BEGINNER') {
      reasons.push('Suitable for beginners');
    }
    
    if (phase === 'ACUTE' && exercise.difficulty <= 2) {
      reasons.push('Early-phase safe exercise');
    }
    
    return reasons.join('. ');
  }
}

// Export singleton instance
export const rehabEngine = new RehabRecommendationEngine();
