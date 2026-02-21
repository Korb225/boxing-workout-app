import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet, Dimensions } from 'react-native';
import { useStore, useTheme } from '../store';
import { Preset, WorkoutSet, Cycle, COLOR_PALETTE, TimerColor } from '../types';
import { v4 as uuidv4 } from 'uuid';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditPresetScreenProps {
  navigation: any;
  route: {
    params?: {
      preset?: Preset;
    };
  };
}

function TimeInput({ value, onChange, label }: { value: number; onChange: (seconds: number) => void; label: string }) {
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sc = s % 60;
    return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 50 }}>{label}</Text>
      <TextInput
        value={formatTime(value)}
        onChangeText={(text) => {
          const parts = text.split(':');
          if (parts.length === 2) {
            const m = parseInt(parts[0]) || 0;
            const s = parseInt(parts[1]) || 0;
            onChange(m * 60 + s);
          }
        }}
        keyboardType="numbers-and-punctuation"
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          color: '#FFFFFF',
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderRadius: 6,
          fontSize: 14,
          fontWeight: '600',
          minWidth: 60,
          textAlign: 'center',
        }}
      />
    </View>
  );
}

function CycleEditor({ cycle, onUpdate, onDelete }: { cycle: Cycle; onUpdate: (updates: Partial<Cycle>) => void; onDelete: () => void }) {
  return (
    <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          value={cycle.name}
          onChangeText={(text) => onUpdate({ name: text })}
          placeholder="Cycle name"
          placeholderTextColor="rgba(255,255,255,0.5)"
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '700',
            flex: 1,
            padding: 0,
          }}
        />
        <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
          <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: '600' }}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <TimeInput 
          label="" 
          value={cycle.duration} 
          onChange={(v) => onUpdate({ duration: v })} 
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {COLOR_PALETTE.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => onUpdate({ color })}
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
  );
}

function SetEditor({ set, setIndex, onUpdate, onDelete }: { set: WorkoutSet; setIndex: number; onUpdate: (updates: Partial<WorkoutSet>) => void; onDelete: () => void }) {
  const theme = useTheme();
  
  const setDuration = set.cycles.reduce((sum, c) => sum + c.duration, 0);

  const addCycle = () => {
    const newCycle: Cycle = {
      id: uuidv4(),
      name: 'CYCLE',
      duration: 60,
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    };
    onUpdate({ cycles: [...set.cycles, newCycle] });
  };

  const updateCycle = (cycleId: string, updates: Partial<Cycle>) => {
    onUpdate({
      cycles: set.cycles.map(c => c.id === cycleId ? { ...c, ...updates } : c),
    });
  };

  const deleteCycle = (cycleId: string) => {
    if (set.cycles.length <= 1) {
      Alert.alert('Cannot Delete', 'A set must have at least one cycle');
      return;
    }
    onUpdate({
      cycles: set.cycles.filter(c => c.id !== cycleId),
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ backgroundColor: '#2A2A2A', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      {/* Set Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Set {setIndex + 1}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{formatTime(setDuration)}</Text>
          <TouchableOpacity onPress={onDelete}>
            <Text style={{ color: '#FF6B6B', fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cycles */}
      {set.cycles.map((cycle) => (
        <CycleEditor
          key={cycle.id}
          cycle={cycle}
          onUpdate={(updates) => updateCycle(cycle.id, updates)}
          onDelete={() => deleteCycle(cycle.id)}
        />
      ))}

      {/* Add Cycle Button */}
      <TouchableOpacity 
        onPress={addCycle}
        style={{ 
          borderWidth: 1, 
          borderColor: 'rgba(255,255,255,0.2)', 
          borderRadius: 10, 
          padding: 10,
          alignItems: 'center',
          borderStyle: 'dashed'
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>+ Add Cycle</Text>
      </TouchableOpacity>

      {/* Repeat Count */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 12 }}>
        <TouchableOpacity 
          onPress={() => onUpdate({ repeat: Math.max(1, set.repeat - 1) })}
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>-</Text>
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>×{set.repeat}</Text>
        <TouchableOpacity 
          onPress={() => onUpdate({ repeat: set.repeat + 1 })}
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EditPresetScreen({ navigation, route }: EditPresetScreenProps) {
  const theme = useTheme();
  const { addPreset, updatePreset, deletePreset } = useStore();
  
  const existingPreset = route.params?.preset;
  const isEditing = !!existingPreset;

  const [presetName, setPresetName] = useState(existingPreset?.name || '');
  const [sets, setSets] = useState<WorkoutSet[]>(existingPreset?.sets || []);

  const getTotalDuration = (): number => {
    let total = 0;
    sets.forEach(set => {
      const setDuration = set.cycles.reduce((sum, c) => sum + c.duration, 0);
      total += setDuration * set.repeat;
    });
    return total;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addSet = () => {
    const newSet: WorkoutSet = {
      id: uuidv4(),
      repeat: 1,
      cycles: [
        {
          id: uuidv4(),
          name: 'CYCLE',
          duration: 60,
          color: COLOR_PALETTE[0],
        },
      ],
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    setSets(sets.map(s => s.id === setId ? { ...s, ...updates } : s));
  };

  const deleteSet = (setId: string) => {
    if (sets.length <= 1) {
      Alert.alert('Cannot Delete', 'A preset must have at least one set');
      return;
    }
    Alert.alert('Delete Set', 'Are you sure you want to delete this set?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setSets(sets.filter(s => s.id !== setId));
      }},
    ]);
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }
    if (sets.length === 0 || sets.some(s => s.cycles.length === 0)) {
      Alert.alert('Error', 'Please add at least one set with one cycle');
      return;
    }

    if (isEditing && existingPreset) {
      updatePreset(existingPreset.id, {
        name: presetName,
        sets,
      });
    } else {
      const newPreset: Preset = {
        id: uuidv4(),
        name: presetName,
        sets,
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

        {/* Total Duration */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase' }}>Total Duration</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: theme.text, marginTop: 4 }}>
            {formatTime(getTotalDuration())}
          </Text>
        </View>

        {/* Sets */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase' }}>Sets</Text>
            <TouchableOpacity onPress={addSet}>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>+ Add Set</Text>
            </TouchableOpacity>
          </View>

          {sets.length === 0 ? (
            <View style={{ backgroundColor: theme.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>No sets yet</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Tap + Add Set to create one</Text>
            </View>
          ) : (
            sets.map((set, index) => (
              <SetEditor
                key={set.id}
                set={set}
                setIndex={index}
                onUpdate={(updates) => updateSet(set.id, updates)}
                onDelete={() => deleteSet(set.id)}
              />
            ))
          )}
        </View>

        {/* Delete Button */}
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
