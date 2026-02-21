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

// Color palette for timer cycles
export const COLOR_PALETTE = [
  '#E53935', // Red
  '#FF8F00', // Amber
  '#FDD835', // Yellow
  '#43A047', // Green
  '#00897B', // Teal
  '#1E88E5', // Blue
  '#3949AB', // Indigo
  '#8E24AA', // Purple
  '#D81B60', // Pink
  '#6D4C41', // Brown
  '#546E7A', // Blue Grey
  '#212121', // Near Black
] as const;

export type TimerColor = typeof COLOR_PALETTE[number];

export interface Cycle {
  id: string;
  name: string;
  duration: number; // in seconds
  color: TimerColor;
}

export interface Preset {
  id: string;
  name: string;
  color: TimerColor;
  cycles: Cycle[];
  createdAt?: number;
}
