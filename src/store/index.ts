import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Exercise, Workout, TimerConfig, ThemeMode, ThemeColors, Preset } from '../types';
import { defaultCategories, defaultExercises, defaultTimerConfig, defaultPresets, lightTheme, darkTheme } from '../data/defaults';

interface AppState {
  categories: Category[];
  exercises: Exercise[];
  workouts: Workout[];
  timerConfig: TimerConfig;
  themeMode: ThemeMode;
  customTheme: ThemeColors | null;
  presets: Preset[];
  
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  
  setWorkouts: (workouts: Workout[]) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  
  setTimerConfig: (config: TimerConfig) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: ThemeColors | null) => void;
  // Presets CRUD
  setPresets: (presets: Preset[]) => void;
  addPreset: (preset: Preset) => void;
  updatePreset: (id: string, updates: Partial<Preset>) => void;
  deletePreset: (id: string) => void;
  
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  categories: defaultCategories,
  exercises: defaultExercises,
  workouts: [],
  timerConfig: defaultTimerConfig,
  presets: defaultPresets,
  themeMode: 'dark',
  customTheme: null,

  setCategories: (categories) => {
    set({ categories });
    get().saveData();
  },
  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }));
    get().saveData();
  },
  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().saveData();
  },
  deleteCategory: (id) => {
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
    get().saveData();
  },

  setExercises: (exercises) => {
    set({ exercises });
    get().saveData();
  },
  addExercise: (exercise) => {
    set((state) => ({ exercises: [...state.exercises, exercise] }));
    get().saveData();
  },
  updateExercise: (id, updates) => {
    set((state) => ({
      exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    get().saveData();
  },
  deleteExercise: (id) => {
    set((state) => ({ exercises: state.exercises.filter((e) => e.id !== id) }));
    get().saveData();
  },

  setWorkouts: (workouts) => {
    set({ workouts });
    get().saveData();
  },
  addWorkout: (workout) => {
    set((state) => ({ workouts: [...state.workouts, workout] }));
    get().saveData();
  },
  updateWorkout: (id, updates) => {
    set((state) => ({
      workouts: state.workouts.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
    get().saveData();
  },
  deleteWorkout: (id) => {
    set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }));
    get().saveData();
  },

  setTimerConfig: (config) => {
    set({ timerConfig: config });
    get().saveData();
  },
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    get().saveData();
  },
  setCustomTheme: (theme) => {
    set({ customTheme: theme });
    get().saveData();
  },

  // Presets CRUD
  setPresets: (presets) => { set({ presets }); get().saveData(); },
  addPreset: (preset) => { set((state) => ({ presets: [...state.presets, preset] })); get().saveData(); },
  updatePreset: (id, updates) => {
    set((state) => ({
      presets: state.presets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    get().saveData();
  },
  deletePreset: (id) => {
    set((state) => ({ presets: state.presets.filter((p) => p.id !== id) }));
    get().saveData();
  },

  loadData: async () => {
    try {
      const [categories, exercises, workouts, timerConfig, themeMode, customTheme, presets] = await Promise.all([
        AsyncStorage.getItem('categories'),
        AsyncStorage.getItem('exercises'),
        AsyncStorage.getItem('workouts'),
        AsyncStorage.getItem('timerConfig'),
        AsyncStorage.getItem('themeMode'),
        AsyncStorage.getItem('customTheme'),
        AsyncStorage.getItem('presets'),
      ]);

      set({
        categories: categories ? JSON.parse(categories) : defaultCategories,
        exercises: exercises ? JSON.parse(exercises) : defaultExercises,
        workouts: workouts ? JSON.parse(workouts) : [],
        timerConfig: timerConfig ? JSON.parse(timerConfig) : defaultTimerConfig,
        themeMode: themeMode ? JSON.parse(themeMode) : 'dark',
        customTheme: customTheme ? JSON.parse(customTheme) : null,
        presets: presets && JSON.parse(presets).length > 0 ? JSON.parse(presets) : defaultPresets,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({
        themeMode: 'dark',
      });
    }
  },

  saveData: async () => {
    try {
      const { categories, exercises, workouts, timerConfig, themeMode, customTheme, presets } = get();
      await Promise.all([
        AsyncStorage.setItem('categories', JSON.stringify(categories)),
        AsyncStorage.setItem('exercises', JSON.stringify(exercises)),
        AsyncStorage.setItem('workouts', JSON.stringify(workouts)),
        AsyncStorage.setItem('timerConfig', JSON.stringify(timerConfig)),
        AsyncStorage.setItem('themeMode', JSON.stringify(themeMode)),
        AsyncStorage.setItem('customTheme', JSON.stringify(customTheme)),
        AsyncStorage.setItem('presets', JSON.stringify(presets)),
      ]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },
}));

export const useTheme = () => {
  const { themeMode, customTheme } = useStore();
  
  if (themeMode === 'custom' && customTheme) {
    return customTheme;
  }
  if (themeMode === 'dark') {
    return darkTheme;
  }
  return lightTheme;
};
