import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NavigationContainer, DrawerContentComponentProps } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../store';
import ExercisesScreen from '../screens/ExercisesScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import TimerScreen from '../screens/TimerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EditPresetScreen from '../screens/EditPresetScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const currentRoute = props.state.routes[props.state.index].name;

  const navItems = [
    { name: 'Dashboard', icon: '🏠', label: 'Dashboard' },
    { name: 'Exercises', icon: '📁', label: 'Exercises' },
    { name: 'Workouts', icon: '🏋️', label: 'Workouts' },
    { name: 'Timer', icon: '⏱️', label: 'Timer' },
    { name: 'Profile', icon: '👤', label: 'Profile' },
    { name: 'Settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ padding: 0 }}>
      <View style={[styles.drawerHeader, { backgroundColor: theme.card }]}>
        <Text style={[styles.logoText, { color: theme.primary }]}>PLANER</Text>
      </View>

      <View style={styles.navSection}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => props.navigation.navigate(item.name)}
              style={[
                styles.navItem,
                { backgroundColor: isActive ? theme.primary + '15' : 'transparent' },
                isActive && { borderLeftWidth: 3, borderLeftColor: theme.primary },
              ]}
            >
              <Text style={{ fontSize: 20, marginRight: 14 }}>{item.icon}</Text>
              <Text 
                style={[
                  styles.navLabel, 
                  { color: isActive ? theme.primary : theme.textSecondary }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

function TimerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimerMain" component={TimerScreen} />
      <Stack.Screen 
        name="EditPreset" 
        component={EditPresetScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: {
            width: 280,
            backgroundColor: 'transparent',
          },
          overlayColor: 'rgba(0,0,0,0.7)',
          swipeEnabled: true,
          swipeEdgeWidth: 50,
        }}
      >
        <Drawer.Screen name="Dashboard" component={DashboardScreen} />
        <Drawer.Screen name="Exercises" component={ExercisesScreen} />
        <Drawer.Screen name="Workouts" component={WorkoutsScreen} />
        <Drawer.Screen name="Timer" component={TimerStack} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 24,
    paddingTop: 50,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
  },
  navSection: {
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
