import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { useStore, useTheme } from '../store';
import { Category, Exercise } from '../types';
import { v4 as uuidv4 } from 'uuid';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

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

export default function CategoriesScreen({ navigation }: { navigation: any }) {
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
      color: '#BDFF2E',
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
        <View style={{ padding: 18, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <TouchableOpacity 
            onPress={() => setSelectedCategory(null)} 
            activeOpacity={0.7}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Text style={{ fontSize: 24, color: theme.primary }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, marginRight: 10 }}>{selectedCategory.icon}</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: 0.5 }}>
              {selectedCategory.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setIsEditMode(false);
              setNewExercise({ name: '', description: '', videoUri: '' });
              setModalVisible(true);
            }}
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

        <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
          {categoryExercises.length === 0 ? (
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
                <Text style={{ fontSize: 36 }}>🥊</Text>
              </View>
              <Text style={{ color: theme.text, textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                No exercises yet
              </Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 14 }}>
                Tap + to add your first exercise
              </Text>
            </View>
          ) : (
            <>
              <SectionHeader title={`${categoryExercises.length} Exercise${categoryExercises.length !== 1 ? 's' : ''}`} />
              {categoryExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  activeOpacity={0.75}
                  style={{ 
                    backgroundColor: theme.card, 
                    borderRadius: 18, 
                    padding: 18, 
                    marginBottom: 14, 
                    borderWidth: 1, 
                    borderColor: theme.border,
                    shadowColor: selectedCategory.color,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                  onPress={() => {
                    setIsEditMode(true);
                    setNewExercise({ name: exercise.name, description: exercise.description || '', videoUri: exercise.videoUri || '' });
                    setModalVisible(true);
                  }}
                  onLongPress={() => handleDeleteExercise(exercise.id)}
                >
                  <Text style={{ fontSize: 19, fontWeight: '700', color: theme.text, letterSpacing: 0.3 }}>{exercise.name}</Text>
                  {exercise.description && (
                    <Text style={{ color: theme.textSecondary, marginTop: 6, fontSize: 14, lineHeight: 20 }}>{exercise.description}</Text>
                  )}
                  {exercise.videoUri && (
                    <View style={{ marginTop: 14, height: 140, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                      <Video
                        source={{ uri: exercise.videoUri }}
                        style={{ flex: 1 }}
                        useNativeControls
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', padding: 20 }}>
            <View style={{ 
              backgroundColor: theme.card, 
              borderRadius: 24, 
              padding: 24, 
              borderWidth: 1, 
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 24, letterSpacing: 0.5 }}>
                {isEditMode ? 'Edit Exercise' : 'Add Exercise'}
              </Text>
              <TextInput
                placeholder="Exercise name"
                placeholderTextColor={theme.textSecondary}
                value={newExercise.name}
                onChangeText={(text) => setNewExercise({ ...newExercise, name: text })}
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  color: theme.text, 
                  padding: 16, 
                  borderRadius: 14, 
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  fontSize: 16,
                  fontWeight: '500',
                }}
              />
              <TextInput
                placeholder="Description (optional)"
                placeholderTextColor={theme.textSecondary}
                value={newExercise.description}
                onChangeText={(text) => setNewExercise({ ...newExercise, description: text })}
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  color: theme.text, 
                  padding: 16, 
                  borderRadius: 14, 
                  marginBottom: 18, 
                  height: 90, 
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: theme.border,
                  fontSize: 15,
                  fontWeight: '400',
                }}
                multiline
              />
              <TouchableOpacity
                onPress={pickVideo}
                activeOpacity={0.8}
                style={{ 
                  backgroundColor: theme.secondary, 
                  padding: 16, 
                  borderRadius: 14, 
                  marginBottom: 14,
                  opacity: 0.9,
                }}
              >
                <Text style={{ color: '#000', textAlign: 'center', fontWeight: '700', fontSize: 15 }}>
                  {newExercise.videoUri ? '✓ Video Attached' : 'Add Video'}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                  style={{ flex: 1, padding: 16, marginRight: 8, borderRadius: 14, borderWidth: 1.5, borderColor: theme.border }}
                >
                  <Text style={{ color: theme.text, textAlign: 'center', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveExercise}
                  activeOpacity={0.8}
                  style={{ flex: 1, padding: 16, marginLeft: 8, borderRadius: 14, backgroundColor: theme.primary }}
                >
                  <Text style={{ color: '#000', textAlign: 'center', fontWeight: '700', fontSize: 15 }}>Save</Text>
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
      <View style={{ padding: 18, paddingRight: 14, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
          style={{ padding: 6, marginRight: 6 }}
        >
          <Text style={{ fontSize: 22, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: 0.5 }}>Categories</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
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

      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.75}
            style={{ 
              backgroundColor: theme.card, 
              borderRadius: 20, 
              padding: 20, 
              marginBottom: 14, 
              borderWidth: 1, 
              borderColor: theme.border,
              shadowColor: category.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 14,
              elevation: 5,
            }}
            onPress={() => setSelectedCategory(category)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: category.color + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 28 }}>{category.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 19, fontWeight: '700', color: theme.text, letterSpacing: 0.3 }}>{category.name}</Text>
                <Text style={{ color: theme.textSecondary, marginTop: 4, fontSize: 13, fontWeight: '500' }}>
                  {exercises.filter((e) => e.categoryId === category.id).length} exercises
                </Text>
              </View>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 16, color: theme.textSecondary, fontWeight: '600' }}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', padding: 20 }}>
          <View style={{ 
            backgroundColor: theme.card, 
            borderRadius: 24, 
            padding: 24, 
            borderWidth: 1, 
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 24, letterSpacing: 0.5 }}>
              Add Category
            </Text>
            <TextInput
              placeholder="Category name"
              placeholderTextColor={theme.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.3)', 
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
                style={{ flex: 1, padding: 16, marginRight: 8, borderRadius: 14, borderWidth: 1.5, borderColor: theme.border }}
              >
                <Text style={{ color: theme.text, textAlign: 'center', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { handleAddCategory(); setModalVisible(false); }}
                activeOpacity={0.8}
                style={{ flex: 1, padding: 16, marginLeft: 8, borderRadius: 14, backgroundColor: theme.primary }}
              >
                <Text style={{ color: '#000', textAlign: 'center', fontWeight: '700', fontSize: 15 }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
