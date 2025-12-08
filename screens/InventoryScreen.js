import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Warehouses
          </Text>
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-gray-600">
              Your warehouse locations will be displayed here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

