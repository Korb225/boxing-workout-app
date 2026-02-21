import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { useStore, useTheme } from '../store';
import { Preset, Cycle, COLOR_PALETTE, TimerColor } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface EditPresetScreenProps {
  navigation: any;
  route: {
    params?: {
      preset?: Preset;
    };
  };
}

export default function EditPresetScreen({ navigation, route }: EditPresetScreenProps) {
  const theme = useTheme();
  const { addPreset, updatePreset, deletePreset } = useStore();
  
  const existingPreset = route.params?.preset;
  const isEditing = !!existingPreset;

  const [presetName, setPresetName] = useState(existingPreset?.name || '');
  const [presetColor, setPresetColor] = useState<TimerColor>(existingPreset?.color || COLOR_PALETTE[0]);
  const [cycles, setCycles] = useState<Cycle[]>(existingPreset?.cycles || []);

  const totalDuration = cycles.reduce((sum, c) => sum + c.duration, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addCycle = () => {
    const newCycle: Cycle = {
      id: uuidv4(),
      name: 'NEW',
      duration: 60,
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    };
    setCycles([...cycles, newCycle]);
  };

  const updateCycle = (cycleId: string, updates: Partial<Cycle>) => {
    setCycles(cycles.map(c => c.id === cycleId ? { ...c, ...updates } : c));
  };

  const deleteCycle = (cycleId: string) => {
    Alert.alert('Delete Cycle', 'Are you sure you want to delete this cycle?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setCycles(cycles.filter(c => c.id !== cycleId));
      }},
    ]);
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }
    if (cycles.length === 0) {
      Alert.alert('Error', 'Please add at least one cycle');
      return;
    }

    if (isEditing && existingPreset) {
      updatePreset(existingPreset.id, {
        name: presetName,
        color: presetColor,
        cycles,
      });
    } else {
      const newPreset: Preset = {
        id: uuidv4(),
        name: presetName,
        color: presetColor,
        cycles,
        createdAt: Date.now(),
      };
      addPreset(newPreset);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingPreset) return;
    
    Alert.alert('Delete Preset', `Are you sure you want to delete "${existingPreset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deletePreset(existingPreset.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24, color: theme.primary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginLeft: 12, flex: 1 }}>
          {isEditing ? 'Edit Preset' : 'New Preset'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Preset Name */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Preset Name</Text>
          <TextInput
            value={presetName}
            onChangeText={setPresetName}
            placeholder="Enter preset name"
            placeholderTextColor={theme.textSecondary}
            style={{
              backgroundColor: theme.card,
              color: theme.text,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              fontSize: 16,
            }}
          />
        </View>

        {/* Preset Color */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Preset Color</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setPresetColor(color)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: color,
                  borderWidth: presetColor === color ? 3 : 0,
                  borderColor: theme.text,
                }}
              />
            ))}
          </View>
        </View>

        {/* Total Duration */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase' }}>Total Duration</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: theme.text, marginTop: 4 }}>
            {formatTime(totalDuration)}
          </Text>
        </View>

        {/* Cycles */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase' }}>Cycles</Text>
            <TouchableOpacity onPress={addCycle}>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>+ Add Cycle</Text>
            </TouchableOpacity>
          </View>

          {cycles.length === 0 ? (
            <View style={{ backgroundColor: theme.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>No cycles yet</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Tap + Add Cycle to create one</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {cycles.map((cycle, index) => (
                <View key={cycle.id} style={{ marginRight: 12, width: 160 }}>
                  <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
                    {/* Cycle Header */}
                    <View style={{ padding: 12, backgroundColor: cycle.color, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' }}>Cycle {index + 1}</Text>
                      <TouchableOpacity onPress={() => deleteCycle(cycle.id)}>
                        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Cycle Name */}
                    <View style={{ padding: 12 }}>
                      <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4, textTransform: 'uppercase' }}>Name</Text>
                      <TextInput
                        value={cycle.name}
                        onChangeText={(text) => updateCycle(cycle.id, { name: text })}
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          color: theme.text,
                          padding: 8,
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: '600',
                          textAlign: 'center',
                        }}
                      />
                    </View>

                    {/* Duration */}
                    <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
                      <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4, textTransform: 'uppercase' }}>Duration</Text>
                      <TextInput
                        value={String(cycle.duration)}
                        onChangeText={(text) => updateCycle(cycle.id, { duration: parseInt(text) || 0 })}
                        keyboardType="numeric"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          color: theme.text,
                          padding: 8,
                          borderRadius: 8,
                          fontSize: 18,
                          fontWeight: '700',
                          textAlign: 'center',
                        }}
                      />
                      <Text style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'center', marginTop: 2 }}>seconds</Text>
                    </View>

                    {/* Color Picker */}
                    <View style={{ padding: 12, paddingTop: 0 }}>
                      <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Color</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {COLOR_PALETTE.map((color) => (
                            <TouchableOpacity
                              key={color}
                              onPress={() => updateCycle(cycle.id, { color })}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: color,
                                borderWidth: cycle.color === color ? 2 : 0,
                                borderColor: '#FFFFFF',
                              }}
                            />
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Delete Button (only for existing presets) */}
        {isEditing && (
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              backgroundColor: theme.card,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#FF6B6B',
              marginTop: 20,
            }}
          >
            <Text style={{ color: '#FF6B6B', textAlign: 'center', fontWeight: '600' }}>Delete Preset</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
