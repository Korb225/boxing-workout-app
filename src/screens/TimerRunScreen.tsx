import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { useTheme } from '../store';
import { Cycle } from '../types';

let Audio: any = null;
if (Platform.OS !== 'web') {
  Audio = require('expo-av').Audio;
}

type TimerState = 'idle' | 'running' | 'paused';

interface TimerRunScreenProps {
  cycles: Cycle[];
  onExit: () => void;
}

export default function TimerRunScreen({ cycles, onExit }: TimerRunScreenProps) {
  const theme = useTheme();
  const [timerState, setTimerState] = useState<TimerState>('running');
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(cycles[0]?.duration || 0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const currentCycle = cycles[currentCycleIndex];
  const totalCycles = cycles.length;
  const progress = totalCycles > 1 ? (currentCycleIndex + 1) / totalCycles : 1;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (timerState === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    } else if (timerState === 'running' && timeRemaining === 0) {
      playSound();
      moveToNextCycle();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, timeRemaining]);

  const playSound = async () => {
    if (!Audio) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/bell.mp3'),
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (error) {
      console.log('Sound not available');
    }
  };

  const moveToNextCycle = () => {
    const nextIndex = currentCycleIndex + 1;
    if (nextIndex >= totalCycles) {
      setTimerState('idle');
      playSound();
      return;
    }
    setCurrentCycleIndex(nextIndex);
    setTimeRemaining(cycles[nextIndex].duration);
  };

  const previousCycle = () => {
    if (currentCycleIndex > 0) {
      setCurrentCycleIndex(currentCycleIndex - 1);
      setTimeRemaining(cycles[currentCycleIndex - 1].duration);
    }
  };

  const nextCycle = () => {
    moveToNextCycle();
  };

  const togglePause = () => {
    if (timerState === 'running') {
      setTimerState('paused');
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setTimerState('running');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldProgress(0);
    holdTimerRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current!);
          onExit();
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
  };

  if (!currentCycle) {
    return (
      <View style={[styles.container, { backgroundColor: '#212121' }]}>
        <Text style={styles.completeText}>Complete!</Text>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentCycle.color }]}>
      {/* Hold to exit indicator at top */}
      <Pressable
        onPressIn={handleHoldStart}
        onPressOut={handleHoldEnd}
        style={styles.holdArea}
      >
        <View style={[styles.holdButton, { borderColor: 'rgba(255,255,255,0.3)' }]}>
          <Text style={styles.holdText}>Hold to exit</Text>
          {isHolding && (
            <View style={[styles.holdProgress, { width: `${holdProgress}%` }]} />
          )}
        </View>
      </Pressable>

      {/* Cycle name */}
      <Text style={styles.cycleName}>{currentCycle.name}</Text>

      {/* Countdown */}
      <Text style={styles.countdown}>{formatTime(timeRemaining)}</Text>

      {/* Progress */}
      <Text style={styles.progress}>
        {currentCycleIndex + 1} / {totalCycles}
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
          onPress={previousCycle}
          disabled={currentCycleIndex === 0}
        >
          <Text style={[styles.controlIcon, { opacity: currentCycleIndex === 0 ? 0.3 : 1 }]}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
          onPress={togglePause}
        >
          <Text style={styles.playIcon}>{timerState === 'running' ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
          onPress={nextCycle}
        >
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Cycle indicators */}
      <View style={styles.cycleIndicators}>
        {cycles.map((cycle, index) => (
          <View
            key={cycle.id}
            style={[
              styles.cycleDot,
              { backgroundColor: index <= currentCycleIndex ? cycle.color : 'rgba(255,255,255,0.3)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  holdArea: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  holdButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 140,
    alignItems: 'center',
  },
  holdText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  holdProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cycleName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countdown: {
    fontSize: 120,
    fontWeight: '200',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginVertical: 20,
  },
  progress: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  cycleIndicators: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 8,
  },
  cycleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completeText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  exitButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
