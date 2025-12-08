import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WarehouseContext } from '../src/context/WarehouseContext';

export default function WarehousesScreen({ navigation }) {
  const { warehouses, deleteWarehouse } = useContext(WarehouseContext);

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Warehouse',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteWarehouse(id);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete warehouse');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderWarehouseItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('WarehouseForm', { warehouse: item })}
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
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
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          className="bg-red-50 rounded px-3 py-2"
        >
          <Text className="text-red-600 font-semibold text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              Warehouses
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('WarehouseForm')}
              className="bg-blue-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-semibold">+ Add</Text>
            </TouchableOpacity>
          </View>

          {warehouses.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center justify-center">
              <Text className="text-gray-600 text-center text-base">
                No warehouses yet. Create your first warehouse to get started.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('WarehouseForm')}
                className="bg-blue-600 rounded-lg px-6 py-3 mt-4"
              >
                <Text className="text-white font-semibold">Create Warehouse</Text>
              </TouchableOpacity>
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
