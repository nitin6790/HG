import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';
import { CategoryContext } from '../src/context/CategoryContext';

export default function InventoryHomeScreen({ navigation }) {
  const { items } = useContext(ItemContext);
  const { categories } = useContext(CategoryContext);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    return items.filter((item) => {
      const category = categories.find((cat) => cat._id === item.categoryId);
      const categoryName = category?.name || '';
      const threshold =
        categoryName === 'Single Segment' || categoryName === 'Multi Segment'
          ? 100
          : 5;
      return item.quantity < threshold;
    });
  }, [items, categories]);

  const quickActions = [
    { label: 'Warehouses', screen: 'WarehouseList', icon: '🏢' },
    { label: 'Reports', screen: 'Reports', icon: '📊' },
    { label: 'Settings', screen: 'Settings', icon: '⚙️' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Inventory
          </Text>
          <Text className="text-gray-600 mb-6">
            Manage your warehouse stock and operations
          </Text>

          {/* Quick Actions */}
          <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Quick Navigation
            </Text>
            <View className="gap-2">
              {quickActions.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  onPress={() => navigation.navigate(item.screen)}
                  className="flex-row items-center bg-blue-500 px-4 py-3 rounded-lg"
                >
                  <Text className="text-2xl mr-3">{item.icon}</Text>
                  <Text className="text-white font-semibold text-base flex-1">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <View className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
              <View className="flex-row items-center mb-4">
                <Text className="text-lg font-semibold text-gray-800 flex-1">
                  ⚠️ Low Stock Alerts
                </Text>
                <Text className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">
                  {lowStockItems.length}
                </Text>
              </View>

              <View className="gap-2">
                {lowStockItems.slice(0, 5).map((item) => {
                  const category = categories.find(
                    (cat) => cat._id === item.categoryId
                  );
                  return (
                    <View
                      key={item._id}
                      className="bg-red-50 p-3 rounded-lg border border-red-200"
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-gray-900 font-semibold">
                            {item.name}
                          </Text>
                          <Text className="text-xs text-gray-600 mt-1">
                            {category?.name || 'Unknown Category'}
                          </Text>
                        </View>
                        <Text className="text-red-600 font-bold text-lg">
                          {item.quantity}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {lowStockItems.length > 5 && (
                <Text className="text-gray-600 text-sm mt-3 text-center">
                  +{lowStockItems.length - 5} more items
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
