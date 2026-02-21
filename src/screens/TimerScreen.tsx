import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Alert, StyleSheet } from 'react-native';
import { useStore, useTheme } from '../store';
import { Preset, Cycle, TimerColor, COLOR_PALETTE } from '../types';
import { v4 as uuidv4 } from 'uuid';
import TimerRunScreen from './TimerRunScreen';

interface QuickstartConfig {
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  prepareSeconds: number;
}

export default function TimerScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { presets, addPreset, updatePreset, deletePreset } = useStore();
  
  // Quickstart state
  const [quickstartExpanded, setQuickstartExpanded] = useState(true);
  const [quickstart, setQuickstart] = useState<QuickstartConfig>({
    rounds: 3,
    workSeconds: 180,
    restSeconds: 60,
    prepareSeconds: 5,
  });

  // Timer running state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [runningCycles, setRunningCycles] = useState<Cycle[]>([]);

  // Preset modal state
  const [presetOptionsVisible, setPresetOptionsVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalQuickstartDuration = quickstart.rounds * (quickstart.workSeconds + quickstart.restSeconds) + quickstart.prepareSeconds;

  const buildQuickstartCycles = (): Cycle[] => {
    const cycles: Cycle[] = [];
    
    // Add prepare if > 0
    if (quickstart.prepareSeconds > 0) {
      cycles.push({
        id: uuidv4(),
        name: 'PREPARE',
        duration: quickstart.prepareSeconds,
        color: '#FF8F00', // Orange
      });
    }
    
    // Add work/rest rounds
    for (let i = 0; i < quickstart.rounds; i++) {
      cycles.push({
        id: uuidv4(),
        name: 'WORK',
        duration: quickstart.workSeconds,
        color: '#43A047', // Green
      });
      if (i < quickstart.rounds - 1 || quickstart.restSeconds > 0) {
        cycles.push({
          id: uuidv4(),
          name: 'REST',
          duration: quickstart.restSeconds,
          color: '#00897B', // Teal
        });
      }
    }
    
    return cycles;
  };

  const handleQuickstartStart = () => {
    const cycles = buildQuickstartCycles();
    setRunningCycles(cycles);
    setIsTimerRunning(true);
  };

  const handlePresetStart = (preset: Preset) => {
    setRunningCycles(preset.cycles);
    setIsTimerRunning(true);
  };

  const handleTimerExit = () => {
    setIsTimerRunning(false);
    setRunningCycles([]);
  };

  const openPresetOptions = (preset: Preset) => {
    setSelectedPreset(preset);
    setPresetOptionsVisible(true);
  };

  const editPreset = () => {
    setPresetOptionsVisible(false);
    navigation.navigate('EditPreset', { preset: selectedPreset });
  };

  const deletePresetConfirm = () => {
    if (!selectedPreset) return;
    Alert.alert('Delete Preset', `Delete "${selectedPreset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deletePreset(selectedPreset.id);
        setPresetOptionsVisible(false);
      }},
    ]);
  };

  // Render timer run screen
  if (isTimerRunning) {
    return <TimerRunScreen cycles={runningCycles} onExit={handleTimerExit} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 22, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: 0.5 }}>Timer</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Quickstart Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginBottom: 24, overflow: 'hidden' }}>
          {/* Quickstart Header */}
          <TouchableOpacity 
            onPress={() => setQuickstartExpanded(!quickstartExpanded)}
            style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Quickstart</Text>
            <Text style={{ fontSize: 20, color: theme.text, transform: [{ rotate: quickstartExpanded ? '180deg' : '0deg' }] }}>▼</Text>
          </TouchableOpacity>

          {/* Quickstart Content */}
          {quickstartExpanded && (
            <View style={{ padding: 16, paddingTop: 0 }}>
              {/* Prepare Control */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>Prepare</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, prepareSeconds: Math.max(0, quickstart.prepareSeconds - 5) })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginHorizontal: 32, minWidth: 80, textAlign: 'center' }}>
                    {quickstart.prepareSeconds}s
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, prepareSeconds: quickstart.prepareSeconds + 5 })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Rounds Control */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>Rounds</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, rounds: Math.max(1, quickstart.rounds - 1) })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginHorizontal: 32, minWidth: 60, textAlign: 'center' }}>
                    {quickstart.rounds}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, rounds: quickstart.rounds + 1 })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Work Control */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>Work</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, workSeconds: Math.max(0, quickstart.workSeconds - 15) })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginHorizontal: 24, minWidth: 100, textAlign: 'center' }}>
                    {formatTime(quickstart.workSeconds)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, workSeconds: quickstart.workSeconds + 15 })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Rest Control */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>Rest</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, restSeconds: Math.max(0, quickstart.restSeconds - 15) })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginHorizontal: 24, minWidth: 100, textAlign: 'center' }}>
                    {formatTime(quickstart.restSeconds)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setQuickstart({ ...quickstart, restSeconds: quickstart.restSeconds + 15 })}
                    style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                  >
                    <Text style={{ fontSize: 20, color: theme.text }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total Duration */}
              <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>
                Total: {formatTime(totalQuickstartDuration)}
              </Text>

              {/* Start Button */}
              <TouchableOpacity 
                onPress={handleQuickstartStart}
                style={{ 
                  backgroundColor: theme.primary, 
                  paddingVertical: 18, 
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ color: '#000000', fontSize: 18, fontWeight: '800', letterSpacing: 1 }}>START</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Presets Section */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
              Your Presets
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditPreset', {})}
              style={{ padding: 8 }}
            >
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>+ New</Text>
            </TouchableOpacity>
          </View>

          {presets.length === 0 ? (
            <View style={{ backgroundColor: theme.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>No presets yet</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Tap + New to create one</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {presets.map((preset) => {
                const presetDuration = preset.cycles.reduce((sum, c) => sum + c.duration, 0);
                return (
                  <TouchableOpacity 
                    key={preset.id}
                    style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}
                    onPress={() => openPresetOptions(preset)}
                  >
                    {/* Top Row: Name + Duration */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: preset.color }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>{preset.name}</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{formatTime(presetDuration)}</Text>
                    </View>
                    
                    {/* Cycles Preview */}
                    <View style={{ padding: 14 }}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {preset.cycles.map((cycle) => (
                            <View 
                              key={cycle.id}
                              style={{ 
                                backgroundColor: cycle.color, 
                                paddingHorizontal: 16, 
                                paddingVertical: 8, 
                                borderRadius: 8,
                                minWidth: 80,
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' }}>{cycle.name}</Text>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>{formatTime(cycle.duration)}</Text>
                            </View>
                          ))}
                        </View>
                      </ScrollView>

                      {/* Start Button */}
                      <TouchableOpacity 
                        onPress={() => handlePresetStart(preset)}
                        style={{ 
                          backgroundColor: theme.primary, 
                          paddingVertical: 14, 
                          borderRadius: 12, 
                          alignItems: 'center',
                          marginTop: 12,
                        }}
                      >
                        <Text style={{ color: '#000000', fontSize: 14, fontWeight: '700' }}>START</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Preset Options Modal */}
      <Modal visible={presetOptionsVisible} animationType="slide" transparent>
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
          activeOpacity={1}
          onPress={() => setPresetOptionsVisible(false)}
        >
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 20, textAlign: 'center' }}>
              {selectedPreset?.name}
            </Text>
            
            <TouchableOpacity 
              onPress={editPreset}
              style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 14, marginBottom: 12 }}
            >
              <Text style={{ color: '#000000', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={deletePresetConfirm}
              style={{ backgroundColor: '#FF6B6B', padding: 16, borderRadius: 14 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setPresetOptionsVisible(false)}
              style={{ padding: 16, marginTop: 12 }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
