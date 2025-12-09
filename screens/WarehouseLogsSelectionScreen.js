import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WarehouseContext } from '../src/context/WarehouseContext';

export default function WarehouseLogsSelectionScreen({ navigation }) {
  const { warehouses } = useContext(WarehouseContext);

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('WarehouseLogs', {
          warehouseId: item.id,
          warehouseName: item.name,
        })
      }
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200 border-l-4 border-l-purple-600"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {item.name}
          </Text>
          {item.description ? (
            <Text className="text-sm text-gray-600 mt-1">
              {item.description}
            </Text>
          ) : null}
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Select Warehouse
          </Text>
          <Text className="text-sm text-gray-600 mb-6">
            Choose a warehouse to view its Stock In/Out logs
          </Text>

          {warehouses.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center justify-center">
              <Text className="text-gray-600 text-center text-base">
                No warehouses available. Please create a warehouse first.
              </Text>
            </View>
          ) : (
            <FlatList
              data={warehouses}
              renderItem={renderWarehouseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
