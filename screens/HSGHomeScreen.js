import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HSGHomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            HG
          </Text>
          <Text className="text-gray-600 mb-12">
            Hanuman Groups Management
          </Text>

          {/* Main Buttons */}
          <View className="gap-4">
            {/* Blocks Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('BlocksModule')}
              className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-8 shadow-lg active:opacity-80"
            >
              <View className="items-center">
                <Text className="text-4xl mb-4">🔧</Text>
                <Text className="text-2xl font-bold text-black text-center">
                  Blocks
                </Text>
                <Text className="text-purple-700 text-sm mt-2 text-center">
                  New feature coming soon
                </Text>
              </View>
            </TouchableOpacity>

            {/* Inventory Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('InventoryHome')}
              className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-8 shadow-lg active:opacity-80"
            >
              <View className="items-center">
                <Text className="text-4xl mb-4">📦</Text>
                <Text className="text-2xl font-bold text-black text-center">
                  Inventory
                </Text>
                <Text className="text-blue-700 text-sm mt-2 text-center">
                  Manage your stock
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View className="mt-12 pt-8 border-t border-gray-200">
            <Text className="text-center text-gray-600 text-xs">
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
