import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '../../components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabsLayout() {
  return <Tabs  screenOptions={{
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    headerShown: false,
    tabBarStyle: Platform.select({
      ios: {
        position: 'absolute',
      },
      default: {},
    }),
  }}>
    <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <FontAwesome name="home" size={25} color={color} /> }} />
    <Tabs.Screen
        name="explore"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome size={25} name="clipboard" color={color} />,
        }}
      />
        <Tabs.Screen
        name="foodbank"
        options={{
          title: 'Food Bank',
          tabBarIcon: ({ color }) => <FontAwesome size={25} name="home" color={color} />,
        }}
      />
       <Tabs.Screen
        name="recipe"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => <FontAwesome size={25} name="book" color={color} />,
        }}
      /> 
  </Tabs>;
}
