import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useStore, useTheme } from '../store';
import { ThemeMode, ThemeColors } from '../types';

const SectionHeader = ({ title }: { title: string }) => {
  const theme = useTheme();
  return (
    <Text style={{ 
      fontSize: 13, 
      fontWeight: '600', 
      color: theme.textSecondary, 
      textTransform: 'uppercase', 
      letterSpacing: 1.5,
      marginBottom: 14,
      marginLeft: 4,
    }}>
      {title}
    </Text>
  );
};

const ThemeOption = ({ label, icon, value, currentValue, onPress }: {
  label: string;
  icon: string;
  value: ThemeMode;
  currentValue: ThemeMode;
  onPress: () => void;
}) => {
  const theme = useTheme();
  const isSelected = value === currentValue;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: isSelected ? theme.primary + '12' : theme.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: isSelected ? theme.primary : theme.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, marginRight: 14 }}>{icon}</Text>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: isSelected ? '600' : '500' }}>{label}</Text>
        {isSelected && (
          <View style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: 11, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { themeMode, setThemeMode, customTheme, setCustomTheme } = useStore();
  const [customColor, setCustomColor] = useState(customTheme?.primary || '#BDFF2E');

  const handleLogout = () => {
    Alert.alert('Clear All Data', 'This will clear all your data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        const { loadData } = useStore.getState();
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.clear();
        loadData();
        Alert.alert('Done', 'All data has been cleared');
      }},
    ]);
  };

  const colorOptions = ['#BDFF2E', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#87CEEB', '#F0E68C'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 18, paddingRight: 14, paddingTop: 20, paddingBottom: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
          style={{ padding: 6, marginRight: 8 }}
        >
          <Text style={{ fontSize: 22, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: 0.5 }}>Settings</Text>
      </View>

      <ScrollView 
        style={{ flex: 1, padding: 20 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <SectionHeader title="Appearance" />
        
        <ThemeOption
          label="Light"
          icon="☀️"
          value="light"
          currentValue={themeMode}
          onPress={() => setThemeMode('light')}
        />

        <ThemeOption
          label="Dark"
          icon="🌙"
          value="dark"
          currentValue={themeMode}
          onPress={() => setThemeMode('dark')}
        />

        <ThemeOption
          label="Custom"
          icon="🎨"
          value="custom"
          currentValue={themeMode}
          onPress={() => setThemeMode('custom')}
        />

        {themeMode === 'custom' && (
          <View style={{ marginTop: 8, marginBottom: 24 }}>
            <SectionHeader title="Accent Color" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    setCustomColor(color);
                    setCustomTheme({
                      ...customTheme || theme,
                      primary: color,
                      primaryGlow: color + '66',
                    });
                  }}
                  activeOpacity={0.8}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: color,
                    borderWidth: customColor === color ? 3 : 0,
                    borderColor: theme.text,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                />
              ))}
            </View>
          </View>
        )}

        <SectionHeader title="Data" />
        
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: '#FF6B6B40',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, marginRight: 14 }}>🗑️</Text>
            <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: '500' }}>Clear All Data</Text>
          </View>
        </TouchableOpacity>

        <SectionHeader title="About" />
        <View style={{ 
          backgroundColor: theme.card, 
          padding: 20, 
          borderRadius: 20, 
          borderWidth: 1, 
          borderColor: theme.border 
        }}>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', letterSpacing: 0.3 }}>Boxing Workout App</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 6, fontSize: 14, fontWeight: '500' }}>Version 1.0.0</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 14, fontSize: 14, lineHeight: 22 }}>
            A personal workout planning app for boxing training. Plan your fights, track your drills, and train like a champion.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
