# Boxing Workout App

A personal mobile app for boxing workout planning with categories, exercises, workouts, and a customizable boxing timer.

## Features

- **Categories**: Organize exercises into categories (Explosiveness, Endurance, Strength, Stability, Technique)
- **Exercises**: Add exercises with optional video demonstrations
- **Workouts**: Create custom workouts by selecting exercises from categories
- **Boxing Timer**: Fully customizable interval timer with:
  - Configurable number of rounds
  - Work and rest interval durations
  - Audio cues (bell, beep, knock) at specific times
- **Theme Settings**: Light/Dark/Custom color themes

## Tech Stack

- React Native with Expo
- TypeScript
- TailwindCSS via NativeWind
- Zustand for state management
- AsyncStorage for local data persistence

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on Android:
   ```bash
   npx expo run:android
   ```

## Building APK

To build a standalone APK:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Build:
   ```bash
   eas build -p android --profile development
   ```

## GitHub Setup

To connect this project to GitHub:

1. Install GitHub CLI (if not already):
   ```bash
   winget install GitHub.cli
   ```

2. Authenticate:
   ```bash
   gh auth login
   ```

3. Create a new repository:
   ```bash
   gh repo create boxing-workout-app --public
   ```

4. Add the remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/boxing-workout-app.git
   git push -u origin main
   ```

## Project Structure

```
/src
  /components    # Reusable UI components
  /screens       # All app screens
  /store         # Zustand state management
  /data          # Default data
  /types         # TypeScript types
  /navigation    # React Navigation setup
```

## License

Personal use only.
