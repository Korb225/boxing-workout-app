import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useStore } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const loadData = useStore((state) => state.loadData);
  const theme = useStore((state) => {
    const mode = state.themeMode;
    if (mode === 'custom' && state.customTheme) return state.customTheme;
    if (mode === 'dark') {
      return { primary: '#FF6B6B', secondary: '#4ECDC4', background: '#1A1A2E', card: '#2D2D44', text: '#F7F7F7', textSecondary: '#AAAAAA', border: '#3D3D5C' };
    }
    return { primary: '#FF6B6B', secondary: '#4ECDC4', background: '#F7F7F7', card: '#FFFFFF', text: '#1A1A2E', textSecondary: '#666666', border: '#E0E0E0' };
  });

  useEffect(() => {
    const init = async () => {
      await loadData();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}
