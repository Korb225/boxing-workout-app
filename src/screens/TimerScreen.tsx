import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useStore, useTheme } from '../store';
import { Interval, AudioCue } from '../types';
import { v4 as uuidv4 } from 'uuid';

type TimerState = 'idle' | 'running' | 'paused';

export default function TimerScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { timerConfig, setTimerConfig } = useStore();
  
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSetupModalVisible, setSetupModalVisible] = useState(false);
  const [setupConfig, setSetupConfig] = useState({ ...timerConfig });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (timerState === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) return 0;
          const newTime = prev - 1;
          checkAudioCues(newTime);
          return newTime;
        });
      }, 1000);
    } else if (timerState === 'running' && timeRemaining === 0) {
      playIntervalEndSound();
      moveToNextInterval();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, timeRemaining]);

  const checkAudioCues = async (time: number) => {
    const cues = timerConfig.audioCues || [];
    for (const cue of cues) {
      if (time === cue.triggerAt) {
        await playSound(cue.soundType);
      }
    }
  };

  const playSound = async (type: 'bell' | 'beep' | 'knock') => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        type === 'bell' 
          ? require('../../assets/bell.mp3')
          : type === 'beep'
          ? require('../../assets/beep.mp3')
          : require('../../assets/knock.mp3'),
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (error) {
      console.log('Sound not available');
    }
  };

  const playIntervalEndSound = async () => {
    await playSound('bell');
  };

  const moveToNextInterval = () => {
    const intervals = generateIntervals();
    const nextIndex = currentIntervalIndex + 1;
    
    if (nextIndex >= intervals.length) {
      setTimerState('idle');
      setCurrentRound(1);
      setCurrentIntervalIndex(0);
      setTimeRemaining(0);
      return;
    }

    const nextInterval = intervals[nextIndex];
    if (nextInterval.type === 'work' && nextInterval.order === 0) {
      setCurrentRound((prev) => prev + 1);
    }
    
    setCurrentIntervalIndex(nextIndex);
    setTimeRemaining(nextInterval.duration);
  };

  const generateIntervals = (): Interval[] => {
    const intervals: Interval[] = [];
    for (let round = 1; round <= setupConfig.rounds; round++) {
      intervals.push({
        id: `work-${round}`,
        name: `Round ${round}`,
        duration: setupConfig.workSeconds,
        type: 'work',
        order: (round - 1) * 2,
      });
      if (round < setupConfig.rounds || setupConfig.restSeconds > 0) {
        intervals.push({
          id: `rest-${round}`,
          name: 'Rest',
          duration: setupConfig.restSeconds,
          type: 'rest',
          order: (round - 1) * 2 + 1,
        });
      }
    }
    return intervals;
  };

  const startTimer = () => {
    const intervals = generateIntervals();
    setCurrentIntervalIndex(0);
    setCurrentRound(1);
    setTimeRemaining(intervals[0]?.duration || 0);
    setTimerState('running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeTimer = () => {
    setTimerState('running');
  };

  const stopTimer = () => {
    setTimerState('idle');
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentRound(1);
    setCurrentIntervalIndex(0);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentInterval = generateIntervals()[currentIntervalIndex];
  const isWork = currentInterval?.type === 'work';

  const addAudioCue = () => {
    const newCue: AudioCue = {
      id: uuidv4(),
      name: 'New Cue',
      triggerAt: 10,
      soundType: 'beep',
    };
    setSetupConfig({
      ...setupConfig,
      audioCues: [...setupConfig.audioCues, newCue],
    });
  };

  const removeAudioCue = (id: string) => {
    setSetupConfig({
      ...setupConfig,
      audioCues: setupConfig.audioCues.filter((c) => c.id !== id),
    });
  };

  const updateAudioCue = (id: string, updates: Partial<AudioCue>) => {
    setSetupConfig({
      ...setupConfig,
      audioCues: setupConfig.audioCues.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const saveSetup = () => {
    setTimerConfig(setupConfig);
    setSetupModalVisible(false);
  };

  const intervals = generateIntervals();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 18, paddingRight: 14, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
          style={{ padding: 6, marginRight: 6 }}
        >
          <Text style={{ fontSize: 22, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: 0.5 }}>Boxing Timer</Text>
        <TouchableOpacity 
          onPress={() => setSetupModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={{ 
            paddingHorizontal: 16, 
            paddingVertical: 8, 
            backgroundColor: theme.primary + '15',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.primary + '30',
          }}>
            <Text style={{ fontSize: 14, color: theme.primary, fontWeight: '700' }}>Setup</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View
          style={{
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: isWork ? theme.primary : theme.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: timerState === 'idle' ? 0.25 : 1,
            shadowColor: isWork ? theme.primary : theme.secondary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 40,
            elevation: 15,
          }}
        >
          <View style={{ 
            width: 220, 
            height: 220, 
            borderRadius: 110, 
            backgroundColor: 'rgba(0,0,0,0.15)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Text style={{ fontSize: 58, fontWeight: '800', color: '#000', letterSpacing: 2 }}>
              {formatTime(timeRemaining || setupConfig.workSeconds)}
            </Text>
          </View>
        </View>

        {timerState !== 'idle' && (
          <View style={{ alignItems: 'center', marginTop: 28 }}>
            <View style={{ 
              paddingHorizontal: 20, 
              paddingVertical: 8, 
              backgroundColor: isWork ? theme.primary + '20' : theme.secondary + '20',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isWork ? theme.primary + '40' : theme.secondary + '40',
              marginBottom: 10,
            }}>
              <Text style={{ 
                fontSize: 22, 
                fontWeight: '700', 
                color: isWork ? theme.primary : theme.secondary,
                letterSpacing: 1,
              }}>
                {currentInterval?.name || 'Round ' + currentRound}
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: theme.textSecondary, fontWeight: '500' }}>
              Round {currentRound} of {setupConfig.rounds}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', marginTop: 44, gap: 14 }}>
          {timerState === 'idle' && (
            <TouchableOpacity
              onPress={startTimer}
              activeOpacity={0.8}
              style={{ 
                backgroundColor: theme.primary, 
                paddingHorizontal: 48, 
                paddingVertical: 18, 
                borderRadius: 30,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text style={{ color: '#000', fontSize: 18, fontWeight: '800', letterSpacing: 1 }}>START</Text>
            </TouchableOpacity>
          )}

          {timerState === 'running' && (
            <TouchableOpacity
              onPress={pauseTimer}
              activeOpacity={0.8}
              style={{ 
                backgroundColor: theme.secondary, 
                paddingHorizontal: 44, 
                paddingVertical: 18, 
                borderRadius: 30,
                shadowColor: theme.secondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text style={{ color: '#000', fontSize: 18, fontWeight: '700', letterSpacing: 1 }}>PAUSE</Text>
            </TouchableOpacity>
          )}

          {timerState === 'paused' && (
            <>
              <TouchableOpacity
                onPress={resumeTimer}
                activeOpacity={0.8}
                style={{ 
                  backgroundColor: theme.primary, 
                  paddingHorizontal: 36, 
                  paddingVertical: 18, 
                  borderRadius: 30,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text style={{ color: '#000', fontSize: 18, fontWeight: '700', letterSpacing: 1 }}>RESUME</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={stopTimer}
                activeOpacity={0.8}
                style={{ 
                  backgroundColor: theme.card, 
                  paddingHorizontal: 32, 
                  paddingVertical: 18, 
                  borderRadius: 30, 
                  borderWidth: 1.5, 
                  borderColor: theme.border 
                }}
              >
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>STOP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {timerState === 'idle' && (
          <View style={{ marginTop: 40, alignItems: 'center', backgroundColor: theme.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600' }}>
              {setupConfig.rounds} Rounds • {formatTime(setupConfig.workSeconds)} Work • {formatTime(setupConfig.restSeconds)} Rest
            </Text>
          </View>
        )}
      </View>

      <Modal visible={isSetupModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ padding: 18, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <TouchableOpacity 
              onPress={() => setSetupModalVisible(false)}
              activeOpacity={0.7}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 24, color: theme.primary }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginLeft: 12, flex: 1, letterSpacing: 0.5 }}>
              Timer Setup
            </Text>
            <TouchableOpacity 
              onPress={saveSetup}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Rounds</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => setSetupConfig({ ...setupConfig, rounds: Math.max(1, setupConfig.rounds - 1) })}
                  activeOpacity={0.7}
                  style={{ backgroundColor: theme.card, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ fontSize: 22, color: theme.text, fontWeight: '600' }}>-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 36, fontWeight: '800', color: theme.text, marginHorizontal: 48, letterSpacing: 2 }}>
                  {setupConfig.rounds}
                </Text>
                <TouchableOpacity
                  onPress={() => setSetupConfig({ ...setupConfig, rounds: setupConfig.rounds + 1 })}
                  activeOpacity={0.7}
                  style={{ backgroundColor: theme.card, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ fontSize: 22, color: theme.text, fontWeight: '600' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Work Time (seconds)</Text>
              <TextInput
                value={String(setupConfig.workSeconds)}
                onChangeText={(text) => setSetupConfig({ ...setupConfig, workSeconds: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={{ 
                  backgroundColor: theme.card, 
                  color: theme.text, 
                  padding: 16, 
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              />
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Rest Time (seconds)</Text>
              <TextInput
                value={String(setupConfig.restSeconds)}
                onChangeText={(text) => setSetupConfig({ ...setupConfig, restSeconds: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={{ 
                  backgroundColor: theme.card, 
                  color: theme.text, 
                  padding: 16, 
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Audio Cues</Text>
                <TouchableOpacity 
                  onPress={addAudioCue}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: theme.primary, fontSize: 15, fontWeight: '700' }}>+ Add Cue</Text>
                </TouchableOpacity>
              </View>
              
              {setupConfig.audioCues.map((cue) => (
                <View key={cue.id} style={{ backgroundColor: theme.card, padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <TextInput
                      value={cue.name}
                      onChangeText={(text) => updateAudioCue(cue.id, { name: text })}
                      style={{ color: theme.text, fontWeight: '600', flex: 1, fontSize: 16 }}
                    />
                    <TouchableOpacity 
                      onPress={() => removeAudioCue(cue.id)}
                      activeOpacity={0.7}
                      style={{ padding: 4 }}
                    >
                      <Text style={{ color: '#FF6B6B', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Trigger at:</Text>
                    <TextInput
                      value={String(cue.triggerAt)}
                      onChangeText={(text) => updateAudioCue(cue.id, { triggerAt: parseInt(text) || 0 })}
                      keyboardType="numeric"
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.3)', 
                        color: theme.text, 
                        padding: 10, 
                        borderRadius: 10, 
                        width: 60,
                        borderWidth: 1,
                        borderColor: theme.border,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}
                    />
                    <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                      {(['bell', 'beep', 'knock'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => updateAudioCue(cue.id, { soundType: type })}
                          activeOpacity={0.7}
                          style={{
                            backgroundColor: cue.soundType === type ? theme.primary : 'rgba(0,0,0,0.3)',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderRadius: 10,
                            flex: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: cue.soundType === type ? '#000' : theme.text, fontSize: 12, fontWeight: '700' }}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
