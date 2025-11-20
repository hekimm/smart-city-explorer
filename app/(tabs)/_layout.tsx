import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          paddingHorizontal: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'compass' : 'compass-outline'} 
              size={26} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'Keşfet sekmesi',
          tabBarTestID: 'tab-home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Ara',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'search' : 'search-outline'} 
              size={26} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'Arama sekmesi',
          tabBarTestID: 'tab-search',
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="auto-awesome" 
              size={28} 
              color={focused ? '#1E40AF' : color} 
            />
          ),
          tabBarAccessibilityLabel: 'AI Asistan sekmesi',
          tabBarTestID: 'tab-ai',
          tabBarBadge: undefined,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'heart' : 'heart-outline'} 
              size={26} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'Favoriler sekmesi',
          tabBarTestID: 'tab-library',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={26} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'Profil sekmesi',
          tabBarTestID: 'tab-profile',
        }}
      />
    </Tabs>
  );
}
