import { Category, Exercise, TimerConfig, Preset, Cycle, COLOR_PALETTE } from '../types';

export const defaultCategories: Category[] = [
  { id: 'explosiveness', name: 'Explosiveness', color: '#BDFF2E', icon: '⚡' },
  { id: 'endurance', name: 'Endurance', color: '#4ECDC4', icon: '🏃' },
  { id: 'strength', name: 'Strength', color: '#45B7D1', icon: '💪' },
  { id: 'stability', name: 'Stability', color: '#96CEB4', icon: '🎯' },
  { id: 'technique', name: 'Technique', color: '#FFEAA7', icon: '🥊' },
];

// Default presets with cycles
export const defaultPresets: Preset[] = [
  {
    id: 'preset-1',
    name: 'Prepare',
    color: '#FF8F00', // Amber/Orange
    cycles: [
      {
        id: 'cycle-1',
        name: 'PREPARE',
        duration: 5,
        color: '#FF8F00',
      },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'preset-2',
    name: 'Boxing',
    color: '#43A047', // Green
    cycles: [
      {
        id: 'cycle-1',
        name: 'WORK',
        duration: 180, // 3 minutes
        color: '#43A047',
      },
      {
        id: 'cycle-2',
        name: 'REST',
        duration: 60, // 1 minute
        color: '#00897B', // Teal
      },
    ],
    createdAt: Date.now(),
  },
];

export const defaultExercises: Exercise[] = [
  { id: 'ex1', categoryId: 'explosiveness', name: 'Speed Bag', description: '3 min rounds, focus on speed' },
  { id: 'ex2', categoryId: 'explosiveness', name: 'Double End Bag', description: 'Improve accuracy and timing' },
  { id: 'ex3', categoryId: 'explosiveness', name: 'Shadow Boxing', description: 'Fast combinations' },
  { id: 'ex4', categoryId: 'endurance', name: 'Heavy Bag', description: '5 min rounds, power punches' },
  { id: 'ex5', categoryId: 'endurance', name: 'Jump Rope', description: '10 min continuous' },
  { id: 'ex6', categoryId: 'strength', name: 'Bench Press', description: '4x8 reps' },
  { id: 'ex7', categoryId: 'strength', name: 'Push Ups', description: '4x20 reps' },
  { id: 'ex8', categoryId: 'stability', name: 'Plank', description: '3x60 seconds' },
  { id: 'ex9', categoryId: 'stability', name: 'Russian Twists', description: '3x20 each side' },
  { id: 'ex10', categoryId: 'technique', name: 'Focus Mitts', description: 'With partner' },
];

export const defaultTimerConfig: TimerConfig = {
  rounds: 3,
  workSeconds: 180,
  restSeconds: 60,
  intervals: [
    { id: 'work1', name: 'Work', duration: 180, type: 'work', order: 0 },
    { id: 'rest1', name: 'Rest', duration: 60, type: 'rest', order: 1 },
    { id: 'work2', name: 'Work', duration: 180, type: 'work', order: 2 },
    { id: 'rest2', name: 'Rest', duration: 60, type: 'rest', order: 3 },
    { id: 'work3', name: 'Work', duration: 180, type: 'work', order: 4 },
  ],
  audioCues: [],
};

export const lightTheme = {
  primary: '#BDFF2E',
  secondary: '#4ECDC4',
  background: '#F5F5F5',
  card: 'rgba(255, 255, 255, 0.9)',
  text: '#1A1A2E',
  textSecondary: '#666666',
  border: 'rgba(0, 0, 0, 0.08)',
  primaryGlow: 'rgba(189, 255, 46, 0.25)',
};

export const darkTheme = {
  primary: '#BDFF2E',
  secondary: '#4ECDC4',
  background: '#0A0A0A',
  card: 'rgba(30, 30, 30, 0.7)',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: 'rgba(255, 255, 255, 0.08)',
  primaryGlow: 'rgba(189, 255, 46, 0.35)',
};
