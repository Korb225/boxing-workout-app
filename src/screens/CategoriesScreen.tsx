import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useStore, useTheme } from '../store';
import { Category, Exercise } from '../types';
import { v4 as uuidv4 } from 'uuid';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

export default function CategoriesScreen() {
  const theme = useTheme();
  const { categories, exercises, addExercise, updateExercise, deleteExercise, addCategory } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', description: '', videoUri: '' });
  const [newCategoryName, setNewCategoryName] = useState('');

  const categoryExercises = selectedCategory
    ? exercises.filter((e) => e.categoryId === selectedCategory.id)
    : [];

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your media library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setNewExercise({ ...newExercise, videoUri: result.assets[0].uri });
    }
  };

  const handleSaveExercise = () => {
    if (!newExercise.name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    if (isEditMode && selectedCategory) {
      const existing = exercises.find(
        (e) => e.categoryId === selectedCategory.id && e.name === newExercise.name
      );
      if (existing) {
        updateExercise(existing.id, {
          name: newExercise.name,
          description: newExercise.description,
          videoUri: newExercise.videoUri,
        });
      }
    } else if (selectedCategory) {
      addExercise({
        id: uuidv4(),
        categoryId: selectedCategory.id,
        name: newExercise.name,
        description: newExercise.description,
        videoUri: newExercise.videoUri,
      });
    }

    setModalVisible(false);
    setNewExercise({ name: '', description: '', videoUri: '' });
    setIsEditMode(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    addCategory({
      id: uuidv4(),
      name: newCategoryName,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      icon: '📦',
    });
    setNewCategoryName('');
  };

  const handleDeleteExercise = (id: string) => {
    Alert.alert('Delete Exercise', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExercise(id) },
    ]);
  };

  if (selectedCategory) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={{ marginRight: 16 }}>
            <Text style={{ fontSize: 24, color: theme.text }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>
            {selectedCategory.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsEditMode(false);
              setNewExercise({ name: '', description: '', videoUri: '' });
              setModalVisible(true);
            }}
          >
            <Text style={{ fontSize: 24, color: theme.primary }}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {categoryExercises.length === 0 ? (
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              No exercises yet. Tap + to add one.
            </Text>
          ) : (
            categoryExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={{ backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}
                onPress={() => {
                  setIsEditMode(true);
                  setNewExercise({ name: exercise.name, description: exercise.description || '', videoUri: exercise.videoUri || '' });
                  setModalVisible(true);
                }}
                onLongPress={() => handleDeleteExercise(exercise.id)}
              >
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>{exercise.name}</Text>
                {exercise.description && (
                  <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{exercise.description}</Text>
                )}
                {exercise.videoUri && (
                  <View style={{ marginTop: 8, height: 150, borderRadius: 8, overflow: 'hidden' }}>
                    <Video
                      source={{ uri: exercise.videoUri }}
                      style={{ flex: 1 }}
                      useNativeControls
                      resizeMode="contain"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: theme.card, margin: 20, borderRadius: 16, padding: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>
                {isEditMode ? 'Edit Exercise' : 'Add Exercise'}
              </Text>
              <TextInput
                placeholder="Exercise name"
                placeholderTextColor={theme.textSecondary}
                value={newExercise.name}
                onChangeText={(text) => setNewExercise({ ...newExercise, name: text })}
                style={{ backgroundColor: theme.background, color: theme.text, padding: 12, borderRadius: 8, marginBottom: 12 }}
              />
              <TextInput
                placeholder="Description (optional)"
                placeholderTextColor={theme.textSecondary}
                value={newExercise.description}
                onChangeText={(text) => setNewExercise({ ...newExercise, description: text })}
                style={{ backgroundColor: theme.background, color: theme.text, padding: 12, borderRadius: 8, marginBottom: 12, height: 80, textAlignVertical: 'top' }}
                multiline
              />
              <TouchableOpacity
                onPress={pickVideo}
                style={{ backgroundColor: theme.secondary, padding: 12, borderRadius: 8, marginBottom: 16 }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
                  {newExercise.videoUri ? 'Change Video' : 'Add Video'}
                </Text>
              </TouchableOpacity>
              {newExercise.videoUri && (
                <Text style={{ color: theme.primary, marginBottom: 16 }}>Video attached</Text>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, padding: 12, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ color: theme.text, textAlign: 'center' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveExercise}
                  style={{ flex: 1, padding: 12, marginLeft: 8, borderRadius: 8, backgroundColor: theme.primary }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>Categories</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{ fontSize: 24, color: theme.primary }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={{ backgroundColor: theme.card, borderRadius: 12, padding: 20, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: category.color }}
            onPress={() => setSelectedCategory(category)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginRight: 12 }}>{category.icon}</Text>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>{category.name}</Text>
                <Text style={{ color: theme.textSecondary }}>
                  {exercises.filter((e) => e.categoryId === category.id).length} exercises
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: theme.card, margin: 20, borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>
              Add Category
            </Text>
            <TextInput
              placeholder="Category name"
              placeholderTextColor={theme.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={{ backgroundColor: theme.background, color: theme.text, padding: 12, borderRadius: 8, marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, padding: 12, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
              >
                <Text style={{ color: theme.text, textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { handleAddCategory(); setModalVisible(false); }}
                style={{ flex: 1, padding: 12, marginLeft: 8, borderRadius: 8, backgroundColor: theme.primary }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
