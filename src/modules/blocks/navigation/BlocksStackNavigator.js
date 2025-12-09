import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BlocksHomeScreen from '../screens/BlocksHomeScreen';

const Stack = createStackNavigator();

export default function BlocksStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="BlocksHome"
        component={BlocksHomeScreen}
        options={{ title: 'Blocks' }}
      />
    </Stack.Navigator>
  );
}
