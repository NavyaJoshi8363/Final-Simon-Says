import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import TabOneScreen from './index'; // Home screen
import GameScreen from './game'; // Game screen

const Stack = createStackNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
        headerTitleStyle: { color: 'white' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={TabOneScreen}
        options={{ title: 'Simon Says' }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: 'Simon Says - Game' }}
      />
    </Stack.Navigator>
  );
}
