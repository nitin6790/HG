import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import StackNavigator from './navigation/DrawerNavigator';
import { WarehouseProvider } from './src/context/WarehouseContext';
import { CategoryProvider } from './src/context/CategoryContext';
import { ItemProvider } from './src/context/ItemContext';

export default function App() {
  return (
    <WarehouseProvider>
      <CategoryProvider>
        <ItemProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
          <StatusBar style="auto" />
        </ItemProvider>
      </CategoryProvider>
    </WarehouseProvider>
  );
}

