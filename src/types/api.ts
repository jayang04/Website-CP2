// API response types and error handling

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Chart data types for progress visualization
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export interface ProgressChartData {
  painLevels: ChartData;
  sessionsCompleted: ChartData;
  weeklyProgress: ChartData;
}

// Event types for user interactions
export type UserEvent = 
  | 'exercise_completed'
  | 'pain_logged'
  | 'session_started'
  | 'session_paused'
  | 'session_completed'
  | 'progress_milestone'
  | 'login'
  | 'logout';

export interface EventData {
  type: UserEvent;
  timestamp: Date;
  userId: string;
  metadata?: Record<string, unknown>;
}
