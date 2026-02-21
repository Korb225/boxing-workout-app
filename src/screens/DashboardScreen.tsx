import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../store';

const MenuCard = ({ title, icon, description, onPress, color }: {
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
  color: string;
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: color + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}>
          <Text style={{ fontSize: 28 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>{title}</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>{description}</Text>
        </View>
        <Text style={{ fontSize: 20, color: theme.textSecondary }}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.text }}>
          Hey, Fighter! 👊
        </Text>
        <Text style={{ fontSize: 16, color: theme.textSecondary, marginTop: 8 }}>
          Ready for your training?
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <MenuCard
          title="Categories"
          icon="📁"
          description="Browse workout categories"
          color={theme.primary}
          onPress={() => navigation.navigate('Categories')}
        />
        <MenuCard
          title="Workouts"
          icon="🏋️"
          description="View and manage your workouts"
          color={theme.secondary}
          onPress={() => navigation.navigate('Workouts')}
        />
        <MenuCard
          title="Timer"
          icon="⏱️"
          description="Start your training timer"
          color="#45B7D1"
          onPress={() => navigation.navigate('Timer')}
        />
        <MenuCard
          title="Settings"
          icon="⚙️"
          description="Customize your app"
          color="#96CEB4"
          onPress={() => navigation.navigate('Settings')}
        />
      </ScrollView>
    </View>
  );
}
