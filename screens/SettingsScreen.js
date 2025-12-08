import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';

export default function SettingsScreen({ navigation }) {
  const { clearItems } = useContext(ItemContext);

  const handleClearItems = () => {
    Alert.alert(
      'Clear All Items',
      'Are you sure you want to remove all items? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearItems();
              Alert.alert('Success', 'All items have been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear items');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Settings
          </Text>

          {/* Warehouses Option */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Warehouses')}
            className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-600"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Warehouses
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Manage warehouse locations
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </View>
          </TouchableOpacity>

          {/* Categories Option */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Categories')}
            className="bg-white rounded-lg p-4 mb-4 border-l-4 border-green-600"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Categories
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Manage item categories
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </View>
          </TouchableOpacity>

          {/* Clear Items Option */}
          
          {/* <TouchableOpacity
            onPress={handleClearItems}
            className="bg-white rounded-lg p-4 mb-4 border-l-4 border-red-600"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Clear All Items
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Remove all items from inventory
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </View>
          </TouchableOpacity>
          */}

          {/* Other Settings */}
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-gray-600">
              More app settings and preferences coming soon.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

