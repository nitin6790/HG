import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlocksHomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8 justify-center items-center">
          {/* Coming Soon Card */}
          <View className="w-full bg-white rounded-2xl p-8 shadow-lg items-center">
            {/* Icon */}
            <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6">
              <Text className="text-5xl">🔧</Text>
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
              Blocks Module
            </Text>

            {/* Subtitle */}
            <Text className="text-4xl font-bold text-purple-600 text-center mb-4">
              Coming Soon
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center text-base leading-6 mb-8">
              The Blocks module is currently under development. Exciting new features are on the way!
            </Text>

            {/* Go Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-full bg-purple-600 rounded-lg py-3"
            >
              <Text className="text-white font-bold text-center text-base">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
