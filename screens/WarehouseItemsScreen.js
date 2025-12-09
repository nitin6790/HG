import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';
import { WarehouseContext } from '../src/context/WarehouseContext';
import { CategoryContext } from '../src/context/CategoryContext';

export default function WarehouseItemsScreen({ route, navigation }) {
  const { warehouseId } = route.params;
  const { getItemsByWarehouse } = useContext(ItemContext);
  const { warehouses } = useContext(WarehouseContext);
  const { categories } = useContext(CategoryContext);

  const warehouse = warehouses.find((w) => w._id === warehouseId);
  const warehouseItems = useMemo(
    () => getItemsByWarehouse(warehouseId),
    [warehouseId, getItemsByWarehouse]
  );

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const renderItemRow = ({ item }) => (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          {item.name}
        </Text>
        <View className="bg-blue-100 rounded px-3 py-1">
          <Text className="text-blue-700 font-bold text-sm">
            Qty: {item.quantity}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-gray-600 mb-1">
        Category: {getCategoryName(item.categoryId)}
      </Text>

      {item.notes ? (
        <Text className="text-sm text-gray-500 italic">Note: {item.notes}</Text>
      ) : null}

      <Text className="text-xs text-gray-400 mt-2">
        Added: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="bg-white rounded-lg p-8 items-center justify-center mt-8">
      <Text className="text-gray-600 text-center text-base">
        No items in this warehouse yet.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="px-6 py-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          {warehouse?.name || 'Warehouse'}
        </Text>
        {warehouse?.description ? (
          <Text className="text-sm text-gray-600 mt-1">
            {warehouse.description}
          </Text>
        ) : null}
      </View>

      <View className="bg-blue-50 rounded-lg p-3 mb-6 border border-blue-200">
        <Text className="text-sm font-semibold text-blue-900">
          Total Items: {warehouseItems.length}
        </Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate('StockIn', {
            warehouseId: warehouse._id,
            warehouseName: warehouse.name,
          })}
          className="flex-1 bg-green-600 rounded-lg py-3"
        >
          <Text className="text-white font-semibold text-center">
            Stock In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('StockOut')}
          className="flex-1 bg-red-600 rounded-lg py-3"
        >
          <Text className="text-white font-semibold text-center">
            Stock Out
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('Reports', {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
        })}
        className="bg-blue-600 rounded-lg py-3 mb-6"
      >
        <Text className="text-white font-semibold text-center">
          View Report
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={warehouseItems}
        renderItem={renderItemRow}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
