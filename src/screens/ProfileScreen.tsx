import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useStore, useTheme } from '../store';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { workouts, exercises, categories } = useStore();

  const totalExercises = exercises.length;
  const totalWorkouts = workouts.length;

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

  const stats = [
    { label: 'Workouts', value: totalWorkouts, icon: '🏋️' },
    { label: 'Exercises', value: totalExercises, icon: '💪' },
    { label: 'Categories', value: categories.length, icon: '📁' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card }}>
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          style={{ position: 'absolute', left: 16, top: 16 }}
        >
          <Text style={{ fontSize: 24, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Profile</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            borderWidth: 2,
            borderColor: theme.primary,
          }}>
            <Text style={{ fontSize: 48 }}>👊</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>Fighter</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>Boxer</Text>
        </View>

        <View style={{ 
          backgroundColor: theme.card, 
          borderRadius: 20, 
          padding: 20, 
          marginBottom: 24,
          borderWidth: 1,
          borderColor: theme.border,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 16 }}>Your Stats</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {stats.map((stat, index) => (
              <View key={index} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28 }}>{stat.icon}</Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text, marginTop: 8 }}>{stat.value}</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={{ 
            backgroundColor: theme.card, 
            borderRadius: 16, 
            padding: 18, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 14 }}>⚙️</Text>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Settings</Text>
          <Text style={{ fontSize: 20, color: theme.textSecondary }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={{ 
            backgroundColor: theme.card, 
            borderRadius: 16, 
            padding: 18, 
            borderWidth: 1,
            borderColor: '#FF6B6B',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 14 }}>🚪</Text>
          <Text style={{ color: '#FF6B6B', fontSize: 16, flex: 1 }}>Clear All Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
