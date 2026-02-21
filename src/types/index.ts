export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Exercise {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  videoUri?: string;
}

export interface Workout {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: number;
}

export interface Interval {
  id: string;
  name: string;
  duration: number;
  type: 'work' | 'rest';
  order: number;
}

export interface TimerConfig {
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  intervals: Interval[];
  audioCues: AudioCue[];
}

export interface AudioCue {
  id: string;
  name: string;
  triggerAt: number;
  soundType: 'bell' | 'beep' | 'knock';
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primaryGlow: string;
}

export type ThemeMode = 'light' | 'dark' | 'custom';
