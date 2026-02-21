import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTheme } from '../store';
import CategoriesScreen from '../screens/CategoriesScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import TimerScreen from '../screens/TimerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused, color }: { icon: string; focused: boolean; color: string }) => (
  <Text style={{ fontSize: focused ? 26 : 24 }}>{icon}</Text>
);

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.text,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon icon="🏠" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon icon="📁" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Workouts"
          component={WorkoutsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon icon="🏋️" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon icon="⏱️" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon icon="⚙️" focused={focused} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
