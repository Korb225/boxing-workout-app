import type { Config } from 'tailwindcss'

export default {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        dark: '#1A1A2E',
        light: '#F7F7F7',
      }
    },
  },
} satisfies Config
