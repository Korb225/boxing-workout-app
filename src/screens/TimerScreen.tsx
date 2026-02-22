import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, Dimensions } from 'react-native';
import { useStore, useTheme } from '../store';
import { Preset, Cycle } from '../types';
import { v4 as uuidv4 } from 'uuid';
import TimerRunScreen from './TimerRunScreen';

interface QuickstartConfig {
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  prepareSeconds: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height || 500;

function RollingTimePicker({ value, onChange, label }: { value: number; onChange: (seconds: number) => void; label: string }) {
  const theme = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sc = s % 60;
    return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
  };

  const numbers = Array.from({ length: 60 }, (_, i) => i);
  
  const handleMinsChange = (newMins: number) => {
    onChange(newMins * 60 + secs);
  };
  
  const handleSecsChange = (newSecs: number) => {
    onChange(mins * 60 + newSecs);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>{label}</Text>
      <TouchableOpacity 
        onPress={() => setPickerVisible(true)}
        style={{ backgroundColor: theme.card, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignSelf: 'center' }}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text }}>{formatTime(value)}</Text>
      </TouchableOpacity>
      
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setPickerVisible(false)} activeOpacity={1}>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: SCREEN_HEIGHT * 0.5 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 20 }}>{label}</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 8 }}>MIN</Text>
                  <ScrollView style={{ height: 150 }} showsVerticalScrollIndicator={false}>
                    <View style={{ height: 30 }} />
                    {numbers.map((n) => (
                      <TouchableOpacity 
                        key={n} 
                        onPress={() => handleMinsChange(n)}
                        style={{ height: 30, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Text style={{ fontSize: 24, fontWeight: n === mins ? '700' : '400', color: n === mins ? theme.primary : theme.textSecondary }}>
                          {n.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <View style={{ height: 30 }} />
                  </ScrollView>
                </View>
                
                <Text style={{ fontSize: 32, fontWeight: '300', color: theme.text }}>:</Text>
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 8 }}>SEC</Text>
                  <ScrollView style={{ height: 150 }} showsVerticalScrollIndicator={false}>
                    <View style={{ height: 30 }} />
                    {numbers.map((n) => (
                      <TouchableOpacity 
                        key={n} 
                        onPress={() => handleSecsChange(n)}
                        style={{ height: 30, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Text style={{ fontSize: 24, fontWeight: n === secs ? '700' : '400', color: n === secs ? theme.primary : theme.textSecondary }}>
                          {n.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <View style={{ height: 30 }} />
                  </ScrollView>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => setPickerVisible(false)}
                style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12, marginTop: 20 }}
              >
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

export default function TimerScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const store = useStore();
  const presets: Preset[] = store.presets || [];
  const { addPreset, updatePreset, deletePreset } = store;
  
  const [quickstartExpanded, setQuickstartExpanded] = useState(true);
  const [quickstart, setQuickstart] = useState<QuickstartConfig>({
    rounds: 3,
    workSeconds: 180,
    restSeconds: 60,
    prepareSeconds: 5,
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [runningCycles, setRunningCycles] = useState<Cycle[]>([]);
  const [roundIncrementIndices, setRoundIncrementIndices] = useState<number[]>([]);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [setRepeatCounts, setSetRepeatCounts] = useState<number[]>([]);
  const [setBoundaries, setSetBoundaries] = useState<number[]>([]);

  const [presetOptionsVisible, setPresetOptionsVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalQuickstartDuration = quickstart.rounds * (quickstart.workSeconds + quickstart.restSeconds) + quickstart.prepareSeconds;

  const handleQuickstartStart = () => {
    const cycles: Cycle[] = [];
    const roundIncIndices: number[] = [];
    
    if (quickstart.prepareSeconds > 0) {
      cycles.push({ id: uuidv4(), name: 'PREPARE', duration: quickstart.prepareSeconds, color: '#FF8F00' });
    }
    
    for (let i = 0; i < quickstart.rounds; i++) {
      const workIndex = cycles.length;
      cycles.push({ id: uuidv4(), name: 'WORK', duration: quickstart.workSeconds, color: '#43A047' });
      roundIncIndices.push(workIndex);
      
      if (i < quickstart.rounds - 1 || quickstart.restSeconds > 0) {
        cycles.push({ id: uuidv4(), name: 'REST', duration: quickstart.restSeconds, color: '#00897B' });
      }
    }
    
    setRunningCycles(cycles);
    setRoundIncrementIndices(roundIncIndices);
    setTotalRounds(0);
    setIsTimerRunning(true);
  };

  const handlePresetStart = (preset: Preset) => {
    const cycles: Cycle[] = [];
    const roundIncIndices: number[] = [];
    const repeatCounts: number[] = [];
    const boundaries: number[] = [];
    let totalPresetRounds = 0;
    
    if (preset.sets && preset.sets.length > 0) {
      preset.sets.forEach((set, setIdx) => {
        repeatCounts.push(set.repeat);
        boundaries.push(cycles.length);
        
        for (let repeat = 0; repeat < set.repeat; repeat++) {
          set.cycles.forEach((cycle, cycleIdx) => {
            cycles.push({ ...cycle, id: uuidv4() });
            if (repeat > 0 && cycleIdx === 0) {
              roundIncIndices.push(cycles.length - 1);
            }
          });
        }
      });
      totalPresetRounds = preset.sets.reduce((sum, set) => sum + set.repeat, 0);
    } else if (preset.cycles && preset.cycles.length > 0) {
      preset.cycles.forEach(cycle => {
        cycles.push({ ...cycle, id: uuidv4() });
      });
    }
    
    setRunningCycles(cycles);
    setRoundIncrementIndices(roundIncIndices);
    setTotalRounds(totalPresetRounds);
    setSetRepeatCounts(repeatCounts);
    setSetBoundaries(boundaries);
    setIsTimerRunning(true);
  };

  const handleTimerExit = () => {
    setIsTimerRunning(false);
    setRunningCycles([]);
    setRoundIncrementIndices([]);
    setTotalRounds(0);
    setSetRepeatCounts([]);
    setSetBoundaries([]);
  };

  const openPresetOptions = (preset: Preset, e: any) => {
    e.stopPropagation();
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
        setSelectedPreset(null);
      }},
    ]);
  };

  const getPresetDuration = (preset: Preset): number => {
    if (preset.sets && preset.sets.length > 0) {
      let total = 0;
      preset.sets.forEach(set => {
        const setDuration = set.cycles.reduce((sum, c) => sum + c.duration, 0);
        total += setDuration * set.repeat;
      });
      return total;
    } else if (preset.cycles && preset.cycles.length > 0) {
      return preset.cycles.reduce((sum, c) => sum + c.duration, 0);
    }
    return 0;
  };

  if (isTimerRunning) {
    return <TimerRunScreen cycles={runningCycles} onExit={handleTimerExit} roundIncrementIndices={roundIncrementIndices} totalRounds={totalRounds} setRepeatCounts={setRepeatCounts} setBoundaries={setBoundaries} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 22, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: 0.5 }}>Timer</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginBottom: 24, overflow: 'hidden' }}>
          <TouchableOpacity 
            onPress={() => setQuickstartExpanded(!quickstartExpanded)}
            style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Quickstart</Text>
            <Text style={{ fontSize: 20, color: theme.text, transform: [{ rotate: quickstartExpanded ? '180deg' : '0deg' }] }}>▼</Text>
          </TouchableOpacity>

          {quickstartExpanded && (
            <View style={{ padding: 16, paddingTop: 0 }}>
              <RollingTimePicker label="Prepare" value={quickstart.prepareSeconds} onChange={(v) => setQuickstart({ ...quickstart, prepareSeconds: v })} />

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>Rounds</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity onPress={() => setQuickstart({ ...quickstart, rounds: Math.max(1, quickstart.rounds - 1) })} style={{ backgroundColor: theme.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                    <Text style={{ fontSize: 20, color: theme.text }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginHorizontal: 32, minWidth: 60, textAlign: 'center' }}>{quickstart.rounds}</Text>
                  <TouchableOpacity onPress={() => setQuickstart({ ...quickstart, rounds: quickstart.rounds + 1 })} style={{ backgroundColor: theme.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                    <Text style={{ fontSize: 20, color: theme.text }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <RollingTimePicker label="Work" value={quickstart.workSeconds} onChange={(v) => setQuickstart({ ...quickstart, workSeconds: v })} />
              <RollingTimePicker label="Rest" value={quickstart.restSeconds} onChange={(v) => setQuickstart({ ...quickstart, restSeconds: v })} />

              <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>Total: {formatTime(totalQuickstartDuration)}</Text>

              <TouchableOpacity onPress={handleQuickstartStart} style={{ backgroundColor: theme.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                <Text style={{ color: '#000000', fontSize: 18, fontWeight: '800', letterSpacing: 1 }}>START</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Your Presets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditPreset', {})} style={{ padding: 8 }}>
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
                const presetDuration = getPresetDuration(preset);
                const presetSets = preset.sets || [];
                const presetCycles = preset.cycles || [];
                
                return (
                  <View key={preset.id} style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: theme.card }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{preset.name}</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textSecondary, marginRight: 12 }}>{formatTime(presetDuration)}</Text>
                      <TouchableOpacity onPress={(e) => openPresetOptions(preset, e)} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 20, color: theme.textSecondary }}>⋯</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={{ padding: 14, paddingTop: 0 }}>
                      {presetSets.length > 0 ? (
                        presetSets.map((set, setIndex) => (
                          <View key={set.id} style={{ marginBottom: setIndex < presetSets.length - 1 ? 8 : 0 }}>
                            <View style={{ flexDirection: 'row', gap: 4 }}>
                              {set.cycles.map((cycle) => (
                                <View key={cycle.id} style={{ backgroundColor: cycle.color, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flex: 1 }}>
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' }}>{cycle.name}</Text>
                                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{formatTime(cycle.duration)}</Text>
                                </View>
                              ))}
                            </View>
                            {set.repeat > 1 && <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>×{set.repeat}</Text>}
                          </View>
                        ))
                      ) : presetCycles.length > 0 ? (
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {presetCycles.map((cycle) => (
                            <View key={cycle.id} style={{ backgroundColor: cycle.color, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flex: 1 }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' }}>{cycle.name}</Text>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{formatTime(cycle.duration)}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                        <TouchableOpacity onPress={() => handlePresetStart(preset)} style={{ backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 16 }}>▶</Text>
                          <Text style={{ color: '#000000', fontSize: 14, fontWeight: '700' }}>START</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={presetOptionsVisible} animationType="slide" transparent>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setPresetOptionsVisible(false)}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 20, textAlign: 'center' }}>{selectedPreset?.name}</Text>
            
            <TouchableOpacity onPress={editPreset} style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 14 }}>
              <Text style={{ color: '#000000', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setPresetOptionsVisible(false)} style={{ padding: 16, marginTop: 12 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
