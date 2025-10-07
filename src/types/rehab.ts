// Type definitions for rehabilitation exercises and tracking

export interface JointAngles {
  leftKnee: number;
  rightKnee: number;
  leftAnkle: number;
  rightAnkle: number;
}

export interface ExerciseSession {
  id: string;
  userId: string;
  exerciseType: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  reps: number;
  angleData: AngleDataPoint[];
  notes?: string;
}

export interface AngleDataPoint {
  timestamp: number;
  angles: JointAngles;
}

export type ExerciseType = 
  | 'squat'
  | 'lunge'
  | 'calf-raise'
  | 'heel-slide'
  | 'ankle-pump'
  | 'leg-raise'
  | 'knee-extension'
  | 'ankle-rotation'
  | 'custom';

export interface ExerciseConfig {
  type: ExerciseType;
  name: string;
  description: string;
  targetAngles: {
    joint: keyof JointAngles;
    min: number;
    max: number;
  }[];
  targetReps?: number;
  duration?: number; // in seconds
  restPeriod?: number; // seconds between reps
}

export interface ExerciseProgress {
  sessionId: string;
  exerciseType: ExerciseType;
  date: Date;
  reps: number;
  maxAngle: number;
  minAngle: number;
  avgAngle: number;
  formScore?: number; // 0-100
}

export interface PatientProfile {
  uid: string;
  name: string;
  age: number;
  injuryType?: string;
  surgeryDate?: Date;
  assignedExercises: ExerciseConfig[];
  goals?: string[];
}

// Helper type for form validation
export interface FormFeedback {
  isGoodForm: boolean;
  messages: string[];
  score: number; // 0-100
}

// Rep counting state machine
export type RepPhase = 'starting' | 'eccentric' | 'bottom' | 'concentric' | 'top';

export interface RepState {
  phase: RepPhase;
  currentAngle: number;
  targetReached: boolean;
  repCount: number;
}
