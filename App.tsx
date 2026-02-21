import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore, useTheme } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const lightTheme = { primary: '#BDFF2E', secondary: '#4ECDC4', background: '#F7F7F7', card: '#FFFFFF', text: '#1A1A2E', textSecondary: '#666666', border: '#E0E0E0', primaryGlow: 'rgba(189, 255, 46, 0.3)' };
const darkTheme = { primary: '#BDFF2E', secondary: '#4ECDC4', background: '#0A0A0A', card: 'rgba(20, 20, 20, 0.8)', text: '#F7F7F7', textSecondary: '#888888', border: 'rgba(255, 255, 255, 0.1)', primaryGlow: 'rgba(189, 255, 46, 0.4)' };

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const loadData = useStore((state) => state.loadData);
  const themeMode = useStore((state) => state.themeMode);
  const customTheme = useStore((state) => state.customTheme);

  const theme = themeMode === 'custom' && customTheme ? customTheme : themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const init = async () => {
      try {
        await loadData();
      } catch (e) {
        console.log('Load error', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkTheme.background }}>
          <ActivityIndicator size="large" color={darkTheme.primary} />
          <Text style={{ marginTop: 16, color: darkTheme.text }}>Loading...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
