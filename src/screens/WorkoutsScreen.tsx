import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { useStore, useTheme } from '../store';
import { Workout, Exercise } from '../types';
import { v4 as uuidv4 } from 'uuid';

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

export default function WorkoutsScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { workouts, exercises, categories, addWorkout, updateWorkout, deleteWorkout } = useStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [newWorkout, setNewWorkout] = useState({ name: '', exerciseIds: [] as string[] });

  const handleCreateWorkout = () => {
    if (!newWorkout.name.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    if (newWorkout.exerciseIds.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    if (isEditMode && selectedWorkout) {
      updateWorkout(selectedWorkout.id, {
        name: newWorkout.name,
        exerciseIds: newWorkout.exerciseIds,
      });
    } else {
      addWorkout({
        id: uuidv4(),
        name: newWorkout.name,
        exerciseIds: newWorkout.exerciseIds,
        createdAt: Date.now(),
      });
    }

    setModalVisible(false);
    setNewWorkout({ name: '', exerciseIds: [] });
    setIsEditMode(false);
    setSelectedWorkout(null);
  };

  const handleEditWorkout = (workout: Workout) => {
    setIsEditMode(true);
    setSelectedWorkout(workout);
    setNewWorkout({ name: workout.name, exerciseIds: [...workout.exerciseIds] });
    setModalVisible(true);
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert('Delete Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWorkout(id) },
    ]);
  };

  const toggleExercise = (exerciseId: string) => {
    if (newWorkout.exerciseIds.includes(exerciseId)) {
      setNewWorkout({
        ...newWorkout,
        exerciseIds: newWorkout.exerciseIds.filter((id) => id !== exerciseId),
      });
    } else {
      setNewWorkout({
        ...newWorkout,
        exerciseIds: [...newWorkout.exerciseIds, exerciseId],
      });
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedWorkout(null);
    setNewWorkout({ name: '', exerciseIds: [] });
    setModalVisible(true);
  };

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
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: 0.5 }}>Workouts</Text>
        <TouchableOpacity 
          onPress={openCreateModal}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 24, color: theme.primary, fontWeight: '700' }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1, padding: 20 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {workouts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <View style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: theme.card, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{ fontSize: 36 }}>🏋️</Text>
            </View>
            <Text style={{ color: theme.text, textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
              No workouts yet
            </Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 14 }}>
              Tap + to create your first workout
            </Text>
          </View>
        ) : (
          <>
            <SectionHeader title={`${workouts.length} Workout${workouts.length !== 1 ? 's' : ''}`} />
            {workouts
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((workout) => {
                const workoutExercises = workout.exerciseIds
                  .map((id) => exercises.find((e) => e.id === id))
                  .filter(Boolean) as Exercise[];

                return (
                  <TouchableOpacity
                    key={workout.id}
                    activeOpacity={0.75}
                    style={{ 
                      backgroundColor: theme.card, 
                      borderRadius: 18, 
                      padding: 18, 
                      marginBottom: 14, 
                      borderWidth: 1, 
                      borderColor: theme.border,
                      shadowColor: theme.primary,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                    onPress={() => handleEditWorkout(workout)}
                    onLongPress={() => handleDeleteWorkout(workout.id)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 19, fontWeight: '700', color: theme.text, letterSpacing: 0.3 }}>{workout.name}</Text>
                        <Text style={{ color: theme.textSecondary, marginTop: 4, fontSize: 13, fontWeight: '500' }}>
                          {workout.exerciseIds.length} exercise{workout.exerciseIds.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: theme.primary + '15',
                        borderRadius: 12,
                      }}>
                        <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>EDIT</Text>
                      </View>
                    </View>
                    <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap' }}>
                      {workoutExercises.slice(0, 4).map((ex, index) => (
                        <View key={index} style={{ 
                          backgroundColor: 'rgba(0,0,0,0.3)', 
                          paddingHorizontal: 12, 
                          paddingVertical: 8, 
                          borderRadius: 10, 
                          marginRight: 8, 
                          marginBottom: 8, 
                          borderWidth: 1, 
                          borderColor: theme.border 
                        }}>
                          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '500' }}>{ex.name}</Text>
                        </View>
                      ))}
                      {workoutExercises.length > 4 && (
                        <View style={{ alignSelf: 'center', paddingHorizontal: 8 }}>
                          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                            +{workoutExercises.length - 4} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
          </>
        )}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ padding: 18, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 24, color: theme.primary }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginLeft: 12, flex: 1, letterSpacing: 0.5 }}>
              {isEditMode ? 'Edit Workout' : 'Create Workout'}
            </Text>
            <TouchableOpacity 
              onPress={handleCreateWorkout}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Workout name"
              placeholderTextColor={theme.textSecondary}
              value={newWorkout.name}
              onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
              style={{ 
                backgroundColor: theme.card, 
                color: theme.text, 
                padding: 16, 
                borderRadius: 14, 
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.border,
                fontSize: 16,
                fontWeight: '500',
              }}
            />

            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              Select Exercises ({newWorkout.exerciseIds.length})
            </Text>

            {categories.map((category) => {
              const categoryExercises = exercises.filter((e) => e.categoryId === category.id);
              if (categoryExercises.length === 0) return null;
              return (
                <View key={category.id} style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{category.icon}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: category.color }}>{category.name}</Text>
                  </View>
                  {categoryExercises.map((exercise) => {
                    const isSelected = newWorkout.exerciseIds.includes(exercise.id);
                    return (
                      <TouchableOpacity
                        key={exercise.id}
                        onPress={() => toggleExercise(exercise.id)}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: isSelected ? theme.primary + '12' : theme.card,
                          padding: 14,
                          borderRadius: 12,
                          marginBottom: 8,
                          borderWidth: 1.5,
                          borderColor: isSelected ? theme.primary : theme.border,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: isSelected ? theme.primary : theme.border,
                              backgroundColor: isSelected ? theme.primary : 'transparent',
                              marginRight: 14,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {isSelected && <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>✓</Text>}
                          </View>
                          <Text style={{ color: theme.text, fontSize: 15, fontWeight: isSelected ? '600' : '500' }}>{exercise.name}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
