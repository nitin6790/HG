import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const navButtons = [
    { label: 'Warehouses', screen: 'WarehouseList' },
    { label: 'Reports', screen: 'Reports' },
    { label: 'Settings', screen: 'Settings' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          <Text className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to HSG Inventory
          </Text>
          
          

          <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Quick Navigation
            </Text>
            <View className="gap-3">
              {navButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.screen}
                  onPress={() => navigation.navigate(btn.screen)}
                  className="bg-blue-600 px-4 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

