import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';
import { CategoryContext } from '../src/context/CategoryContext';

export default function HomeScreen({ navigation }) {
  const { items } = useContext(ItemContext);
  const { categories } = useContext(CategoryContext);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : '';
  };

  // Filter items based on category-specific thresholds
  useEffect(() => {
    const filtered = items.filter((item) => {
      const categoryName = getCategoryName(item.categoryId);
      const singleSegmentThreshold = 100;
      const multiSegmentThreshold = 100;
      const defaultThreshold = 5;

      if (categoryName === 'Single Segment') {
        return item.quantity < singleSegmentThreshold;
      } else if (categoryName === 'Multi Segment') {
        return item.quantity < multiSegmentThreshold;
      } else {
        return item.quantity < defaultThreshold;
      }
    });
    setLowStockItems(filtered);
  }, [items, categories]);

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

          {/* Low Stock Alert Section */}
          {lowStockItems.length > 0 && (
            <View
              style={{
                backgroundColor: '#FFF7CC',
                borderColor: '#FACC15',
                borderWidth: 2,
              }}
              className="rounded-lg p-4 mb-4"
            >
              <Text
                style={{ color: '#B45309' }}
                className="text-lg font-bold mb-3"
              >
                Low Stock Alerts
              </Text>
              <View className="gap-2">
                {lowStockItems.map((item) => (
                  <Text
                    key={item._id}
                    style={{ color: '#B45309' }}
                    className="text-base"
                  >
                    {item.name} – Only {item.quantity} left
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Modules Section */}
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Modules
            </Text>
            <View className="gap-3">
              {/* Inventory Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate('InventoryHome')}
                className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 rounded-lg flex-row items-center"
              >
                <Text className="text-white font-semibold text-center flex-1">
                  📦 Inventory
                </Text>
              </TouchableOpacity>

              {/* Blocks Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate('BlocksModule')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 rounded-lg flex-row items-center"
              >
                <Text className="text-white font-semibold text-center flex-1">
                  🔧 Blocks
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

