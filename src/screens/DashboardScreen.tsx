import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
      activeOpacity={0.75}
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 5,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: color + '15',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}>
          <Text style={{ fontSize: 26 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 19, fontWeight: '700', color: theme.text, letterSpacing: 0.3 }}>{title}</Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4, lineHeight: 18 }}>{description}</Text>
        </View>
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.primary + '15',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 20, color: theme.primary, fontWeight: '700' }}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 24, paddingTop: 28, paddingBottom: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
          style={{ padding: 8, marginRight: 12, marginTop: 4 }}
        >
          <Text style={{ fontSize: 24, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 34, fontWeight: '800', color: theme.text, letterSpacing: 0.5 }}>
            Hey, Fighter! 👊
          </Text>
          <Text style={{ fontSize: 16, color: theme.textSecondary, marginTop: 8, letterSpacing: 0.2 }}>
            Ready for your training?
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={{ marginBottom: 8 }}>
          <Text style={{ 
            fontSize: 13, 
            fontWeight: '600', 
            color: theme.textSecondary, 
            textTransform: 'uppercase', 
            letterSpacing: 1.5,
            marginBottom: 16,
            marginLeft: 4,
          }}>
            Menu
          </Text>
        </View>
        
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
