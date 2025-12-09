import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';
import HSGHomeScreen from '../screens/HSGHomeScreen';
import HomeScreen from '../screens/HomeScreen';
import WarehousesScreen from '../screens/WarehousesScreen';
import WarehouseFormScreen from '../screens/WarehouseFormScreen';
import WarehouseListScreen from '../screens/WarehouseListScreen';
import WarehouseItemsScreen from '../screens/WarehouseItemsScreen';
import WarehouseLogsScreen from '../screens/WarehouseLogsScreen';
import WarehouseLogsSelectionScreen from '../screens/WarehouseLogsSelectionScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryFormScreen from '../screens/CategoryFormScreen';
import StockInScreen from '../screens/StockInScreen';
import StockOutScreen from '../screens/StockOutScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BlocksStackNavigator from '../src/modules/blocks/navigation/BlocksStackNavigator';
import InventoryHomeScreen from '../screens/InventoryHomeScreen';

const Stack = createStackNavigator();

function SettingsStackNavigator() {
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
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Warehouses"
        component={WarehousesScreen}
        options={{ title: 'Warehouses' }}
      />
      <Stack.Screen
        name="WarehouseForm"
        component={WarehouseFormScreen}
        options={{}}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={{}}
      />
      <Stack.Screen
        name="WarehouseLogsSelection"
        component={WarehouseLogsSelectionScreen}
        options={{ title: 'Warehouse Logs' }}
      />
      <Stack.Screen
        name="WarehouseLogs"
        component={WarehouseLogsScreen}
        options={({ route }) => ({
          title: route.params?.warehouseName || 'Warehouse Logs',
        })}
      />
    </Stack.Navigator>
  );
}

export default function StackNavigator() {
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
        name="Home"
        component={HSGHomeScreen}
        options={{ title: 'HG' }}
      />
      <Stack.Screen
        name="WarehouseList"
        component={WarehouseListScreen}
        options={{ title: 'Warehouses' }}
      />
      <Stack.Screen
        name="WarehouseItems"
        component={WarehouseItemsScreen}
        options={({ route }) => ({
          title: 'Items',
        })}
      />
      <Stack.Screen
        name="Inventory"
        component={WarehousesScreen}
        options={{ title: 'Warehouses' }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="StockIn"
        component={StockInScreen}
        options={{ title: 'Stock In' }}
      />
      <Stack.Screen
        name="StockOut"
        component={StockOutScreen}
        options={{ title: 'Stock Out' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportScreen}
        options={{ title: 'Stock Report' }}
      />
      <Stack.Screen
        name="InventoryHome"
        component={InventoryHomeScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen
        name="BlocksModule"
        component={BlocksStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

