import { Category, Exercise, TimerConfig } from '../types';

export const defaultCategories: Category[] = [
  { id: 'explosiveness', name: 'Explosiveness', color: '#FF6B6B', icon: '⚡' },
  { id: 'endurance', name: 'Endurance', color: '#4ECDC4', icon: '🏃' },
  { id: 'strength', name: 'Strength', color: '#45B7D1', icon: '💪' },
  { id: 'stability', name: 'Stability', color: '#96CEB4', icon: '🎯' },
  { id: 'technique', name: 'Technique', color: '#FFEAA7', icon: '🥊' },
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
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#F7F7F7',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#666666',
  border: '#E0E0E0',
};

export const darkTheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#1A1A2E',
  card: '#2D2D44',
  text: '#F7F7F7',
  textSecondary: '#AAAAAA',
  border: '#3D3D5C',
};
