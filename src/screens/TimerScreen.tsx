import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useStore, useTheme } from '../store';
import { Interval, AudioCue } from '../types';
import { v4 as uuidv4 } from 'uuid';

type TimerState = 'idle' | 'running' | 'paused';

export default function TimerScreen() {
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
          if (prev <= 1) {
            return 0;
          }
          
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
      <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>Boxing Timer</Text>
        <TouchableOpacity onPress={() => setSetupModalVisible(true)}>
          <Text style={{ fontSize: 16, color: theme.primary }}>Setup</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View
          style={{
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: isWork ? theme.primary : theme.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: timerState === 'idle' ? 0.3 : 1,
          }}
        >
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#fff' }}>
            {formatTime(timeRemaining || setupConfig.workSeconds)}
          </Text>
        </View>

        {timerState !== 'idle' && (
          <>
            <Text style={{ fontSize: 32, fontWeight: '600', color: theme.text, marginTop: 24 }}>
              {currentInterval?.name || 'Round ' + currentRound}
            </Text>
            <Text style={{ fontSize: 18, color: theme.textSecondary, marginTop: 8 }}>
              Round {currentRound} of {setupConfig.rounds}
            </Text>
          </>
        )}

        <View style={{ flexDirection: 'row', marginTop: 40, gap: 16 }}>
          {timerState === 'idle' && (
            <TouchableOpacity
              onPress={startTimer}
              style={{ backgroundColor: theme.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Start</Text>
            </TouchableOpacity>
          )}

          {timerState === 'running' && (
            <TouchableOpacity
              onPress={pauseTimer}
              style={{ backgroundColor: theme.secondary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Pause</Text>
            </TouchableOpacity>
          )}

          {timerState === 'paused' && (
            <>
              <TouchableOpacity
                onPress={resumeTimer}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={stopTimer}
                style={{ backgroundColor: theme.card, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, borderWidth: 1, borderColor: theme.border }}
              >
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>Stop</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {timerState === 'idle' && (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ color: theme.textSecondary }}>Rounds: {setupConfig.rounds}</Text>
            <Text style={{ color: theme.textSecondary }}>Work: {formatTime(setupConfig.workSeconds)}</Text>
            <Text style={{ color: theme.textSecondary }}>Rest: {formatTime(setupConfig.restSeconds)}</Text>
          </View>
        )}
      </View>

      <Modal visible={isSetupModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setSetupModalVisible(false)}>
              <Text style={{ fontSize: 24, color: theme.text }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginLeft: 16, flex: 1 }}>
              Timer Setup
            </Text>
            <TouchableOpacity onPress={saveSetup}>
              <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>Rounds</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setSetupConfig({ ...setupConfig, rounds: Math.max(1, setupConfig.rounds - 1) })}
                  style={{ backgroundColor: theme.card, padding: 12, borderRadius: 8 }}
                >
                  <Text style={{ fontSize: 20, color: theme.text }}>-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: '600', color: theme.text, marginHorizontal: 24 }}>
                  {setupConfig.rounds}
                </Text>
                <TouchableOpacity
                  onPress={() => setSetupConfig({ ...setupConfig, rounds: setupConfig.rounds + 1 })}
                  style={{ backgroundColor: theme.card, padding: 12, borderRadius: 8 }}
                >
                  <Text style={{ fontSize: 20, color: theme.text }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>Work Time (seconds)</Text>
              <TextInput
                value={String(setupConfig.workSeconds)}
                onChangeText={(text) => setSetupConfig({ ...setupConfig, workSeconds: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={{ backgroundColor: theme.card, color: theme.text, padding: 12, borderRadius: 8 }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>Rest Time (seconds)</Text>
              <TextInput
                value={String(setupConfig.restSeconds)}
                onChangeText={(text) => setSetupConfig({ ...setupConfig, restSeconds: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={{ backgroundColor: theme.card, color: theme.text, padding: 12, borderRadius: 8 }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Audio Cues</Text>
                <TouchableOpacity onPress={addAudioCue}>
                  <Text style={{ color: theme.primary, fontSize: 16 }}>+ Add Cue</Text>
                </TouchableOpacity>
              </View>
              
              {setupConfig.audioCues.map((cue) => (
                <View key={cue.id} style={{ backgroundColor: theme.card, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <TextInput
                      value={cue.name}
                      onChangeText={(text) => updateAudioCue(cue.id, { name: text })}
                      style={{ color: theme.text, fontWeight: '600', flex: 1 }}
                    />
                    <TouchableOpacity onPress={() => removeAudioCue(cue.id)}>
                      <Text style={{ color: '#FF6B6B' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: theme.textSecondary }}>Trigger at (sec):</Text>
                    <TextInput
                      value={String(cue.triggerAt)}
                      onChangeText={(text) => updateAudioCue(cue.id, { triggerAt: parseInt(text) || 0 })}
                      keyboardType="numeric"
                      style={{ backgroundColor: theme.background, color: theme.text, padding: 8, borderRadius: 4, width: 60 }}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['bell', 'beep', 'knock'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => updateAudioCue(cue.id, { soundType: type })}
                          style={{
                            backgroundColor: cue.soundType === type ? theme.primary : theme.background,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ color: cue.soundType === type ? '#fff' : theme.text, fontSize: 12 }}>
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
