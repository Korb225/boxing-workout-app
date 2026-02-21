import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useStore, useTheme } from '../store';
import { Workout, Exercise } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function WorkoutsScreen() {
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
      <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>Workouts</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Text style={{ fontSize: 24, color: theme.primary }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {workouts.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No workouts yet. Tap + to create one.
          </Text>
        ) : (
          workouts
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((workout) => {
              const workoutExercises = workout.exerciseIds
                .map((id) => exercises.find((e) => e.id === id))
                .filter(Boolean) as Exercise[];

              return (
                <TouchableOpacity
                  key={workout.id}
                  style={{ backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}
                  onPress={() => handleEditWorkout(workout)}
                  onLongPress={() => handleDeleteWorkout(workout.id)}
                >
                  <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>{workout.name}</Text>
                  <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                    {workout.exerciseIds.length} exercises
                  </Text>
                  <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {workoutExercises.slice(0, 5).map((ex, index) => (
                      <View key={index} style={{ backgroundColor: theme.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 4, marginBottom: 4 }}>
                        <Text style={{ color: theme.text, fontSize: 12 }}>{ex.name}</Text>
                      </View>
                    ))}
                    {workoutExercises.length > 5 && (
                      <Text style={{ color: theme.textSecondary, fontSize: 12, alignSelf: 'center' }}>
                        +{workoutExercises.length - 5} more
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
        )}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 24, color: theme.text }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginLeft: 16, flex: 1 }}>
              {isEditMode ? 'Edit Workout' : 'Create Workout'}
            </Text>
            <TouchableOpacity onPress={handleCreateWorkout}>
              <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16 }}>
            <TextInput
              placeholder="Workout name"
              placeholderTextColor={theme.textSecondary}
              value={newWorkout.name}
              onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
              style={{ backgroundColor: theme.card, color: theme.text, padding: 12, borderRadius: 8, marginBottom: 16 }}
            />

            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 }}>
              Select Exercises ({newWorkout.exerciseIds.length} selected)
            </Text>

            {categories.map((category) => {
              const categoryExercises = exercises.filter((e) => e.categoryId === category.id);
              if (categoryExercises.length === 0) return null;
              return (
                <View key={category.id} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{category.icon}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: category.color }}>{category.name}</Text>
                  </View>
                  {categoryExercises.map((exercise) => {
                    const isSelected = newWorkout.exerciseIds.includes(exercise.id);
                    return (
                      <TouchableOpacity
                        key={exercise.id}
                        onPress={() => toggleExercise(exercise.id)}
                        style={{
                          backgroundColor: isSelected ? theme.primary + '20' : theme.card,
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: isSelected ? theme.primary : theme.border,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor: isSelected ? theme.primary : theme.border,
                              backgroundColor: isSelected ? theme.primary : 'transparent',
                              marginRight: 12,
                            }}
                          />
                          <Text style={{ color: theme.text }}>{exercise.name}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
