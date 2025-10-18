// Injury-specific rehabilitation plan types

export type InjuryType = 
  | 'acl-tear'
  | 'mcl-tear'
  | 'meniscus-tear'
  | 'ankle-sprain'
  | 'medial-ankle-sprain'
  | 'high-ankle-sprain';

export interface InjuryInfo {
  id: InjuryType;
  name: string;
  category: 'knee' | 'ankle';
  description: string;
  icon: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryTime: string;
  commonIn: string[];
}

export interface RehabPhase {
  phase: number;
  name: string;
  duration: string;
  goals: string[];
  precautions: string[];
  exercises: PhaseExercise[];
}

export interface PhaseExercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  hold?: string;
  description: string;
  image: string; // Emoji icon for quick reference
  media?: {
    images?: string[]; // Array of image URLs
    videoUrl?: string; // Primary video URL
    thumbnail?: string; // Video thumbnail URL
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredEquipment?: string[];
  painThreshold: string;
}

export interface InjuryRehabPlan {
  injuryType: InjuryType;
  injuryInfo: InjuryInfo;
  totalWeeks: number;
  phases: RehabPhase[];
  dosList: string[];
  dontsList: string[];
  whenToSeeDoctor: string[];
  progressMarkers: string[];
}

export interface UserInjuryProgress {
  userId: string;
  injuryType: InjuryType;
  startDate: Date;
  currentPhase: number;
  currentWeek: number;
  completedExercises: string[];
  painLevel: number;
  notes: string[];
  lastUpdated: Date;
}
