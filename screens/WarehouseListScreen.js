import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WarehouseContext } from '../src/context/WarehouseContext';

export default function WarehouseListScreen({ navigation }) {
  const { warehouses } = useContext(WarehouseContext);

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('WarehouseItems', { warehouseId: item._id })
      }
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200 active:bg-blue-50"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold text-gray-900">
            {item.name}
          </Text>
          {item.description ? (
            <Text className="text-sm text-gray-600 mt-1">
              {item.description}
            </Text>
          ) : null}
          <Text className="text-xs text-gray-400 mt-2">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="bg-white rounded-lg p-8 items-center justify-center mt-8">
      <Text className="text-gray-600 text-center text-base">
        No warehouses yet. Create your first warehouse in Settings &gt;
        Warehouses to get started.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        className="bg-blue-600 rounded-lg px-6 py-3 mt-4"
      >
        <Text className="text-white font-semibold">Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={warehouses}
        renderItem={renderWarehouseItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View className="px-6 py-6">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Warehouses
            </Text>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
