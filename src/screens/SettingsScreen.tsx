import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useStore, useTheme } from '../store';
import { ThemeMode, ThemeColors } from '../types';

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeMode, setThemeMode, customTheme, setCustomTheme } = useStore();
  const [customColor, setCustomColor] = useState(customTheme?.primary || '#FF6B6B');

  const handleLogout = () => {
    Alert.alert('Logout', 'This will clear all your data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        const { loadData } = useStore.getState();
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.clear();
        loadData();
        Alert.alert('Done', 'All data has been cleared');
      }},
    ]);
  };

  const colorOptions = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#87CEEB', '#F0E68C'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, backgroundColor: theme.card }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Settings</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 16 }}>Theme</Text>
          
          <TouchableOpacity
            onPress={() => setThemeMode('light')}
            style={{
              backgroundColor: themeMode === 'light' ? theme.primary + '20' : theme.card,
              padding: 16,
              borderRadius: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: themeMode === 'light' ? theme.primary : theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>☀️</Text>
              <Text style={{ color: theme.text, fontSize: 16 }}>Light</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setThemeMode('dark')}
            style={{
              backgroundColor: themeMode === 'dark' ? theme.primary + '20' : theme.card,
              padding: 16,
              borderRadius: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: themeMode === 'dark' ? theme.primary : theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🌙</Text>
              <Text style={{ color: theme.text, fontSize: 16 }}>Dark</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setThemeMode('custom')}
            style={{
              backgroundColor: themeMode === 'custom' ? theme.primary + '20' : theme.card,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeMode === 'custom' ? theme.primary : theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🎨</Text>
              <Text style={{ color: theme.text, fontSize: 16 }}>Custom</Text>
            </View>
          </TouchableOpacity>
        </View>

        {themeMode === 'custom' && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 16 }}>Custom Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    setCustomColor(color);
                    setCustomTheme({
                      ...customTheme || theme,
                      primary: color,
                    });
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: color,
                    borderWidth: customColor === color ? 3 : 0,
                    borderColor: theme.text,
                  }}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 16 }}>Data</Text>
          
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.card,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#FF6B6B',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🚪</Text>
              <Text style={{ color: '#FF6B6B', fontSize: 16 }}>Clear All Data</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 16 }}>About</Text>
          <View style={{ backgroundColor: theme.card, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Boxing Workout App</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Version 1.0.0</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
              A personal workout planning app for boxing training.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
