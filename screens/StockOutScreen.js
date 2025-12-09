import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';
import { WarehouseContext } from '../src/context/WarehouseContext';

export default function StockOutScreen({ navigation }) {
  const { items, stockOutItem } = useContext(ItemContext);
  const { warehouses } = useContext(WarehouseContext);
  
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockOutQuantity, setStockOutQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // Filter items by warehouse
  const warehouseItems = useMemo(() => {
    if (!selectedWarehouse) return items;
    return items.filter((item) => item.warehouse === selectedWarehouse._id);
  }, [items, selectedWarehouse]);

  // Filter items based on search text (unique names only)
  const uniqueItemNames = useMemo(() => {
    return Array.from(
      new Map(warehouseItems.map((item) => [item.name.toLowerCase(), item])).values()
    ).filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [warehouseItems, searchText]);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setSearchText(item.name);
    setShowDropdown(false);
    setErrorMessage('');
  };

  const validateStockOut = () => {
    setErrorMessage('');

    if (!selectedWarehouse) {
      setErrorMessage('Please select a warehouse');
      return false;
    }

    if (!selectedItem) {
      setErrorMessage('Please select an item');
      return false;
    }

    if (!stockOutQuantity || Number(stockOutQuantity) <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return false;
    }

    if (Number(stockOutQuantity) > selectedItem.quantity) {
      setErrorMessage(
        `Cannot stock out ${stockOutQuantity}. Only ${selectedItem.quantity} available.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStockOut()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await stockOutItem(selectedItem._id, Number(stockOutQuantity));
      Alert.alert(
        'Success',
        `Stocked out ${stockOutQuantity} units of ${selectedItem.name}`
      );
      // Reset form
      setSelectedItem(null);
      setSearchText('');
      setStockOutQuantity('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to stock out item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDropdownItem = (item) => (
    <TouchableOpacity
      onPress={() => handleItemSelect(item)}
      className="bg-white px-4 py-3 border-b border-gray-200"
      pointerEvents="auto"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text className="text-gray-900 font-medium">{item.name}</Text>
      <Text className="text-sm text-gray-500">
        Available: {item.quantity} units
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Warehouse Selector */}
        <View className="px-6 pt-6 pb-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Select Warehouse *
          </Text>
          <View style={{ zIndex: 2000, elevation: 2000 }}>
            <TouchableOpacity
              onPress={() => setShowWarehouseDropdown(!showWarehouseDropdown)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
              disabled={isSubmitting}
            >
              <Text className="text-base text-gray-900 font-medium">
                {selectedWarehouse ? selectedWarehouse.name : 'Choose warehouse...'}
              </Text>
              <Text className="text-xl text-gray-400">
                {showWarehouseDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {/* Warehouse Dropdown */}
            {showWarehouseDropdown && (
              <View
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  maxHeight: 250,
                  zIndex: 9999,
                  elevation: 9999,
                  overflow: 'hidden',
                }}
                pointerEvents="box-none"
              >
                <View pointerEvents="auto">
                  {warehouses.length === 0 ? (
                    <View className="p-4">
                      <Text className="text-gray-500 text-center">
                        No warehouses available
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={warehouses}
                      keyExtractor={(w) => w._id}
                      renderItem={({ item: warehouse }) => (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedWarehouse(warehouse);
                            setShowWarehouseDropdown(false);
                            setSearchText('');
                            setSelectedItem(null);
                          }}
                          className="bg-white px-4 py-3 border-b border-gray-200"
                          pointerEvents="auto"
                        >
                          <Text className="text-gray-900 font-medium">
                            {warehouse.name}
                          </Text>
                          {warehouse.location && (
                            <Text className="text-sm text-gray-500">
                              {warehouse.location}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                      scrollEnabled={warehouses.length > 4}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Item Search Input - OUTSIDE ScrollView so dropdown renders on top */}
        <View className="px-6 pt-6 pb-2 bg-gray-50 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Search Item *
          </Text>
          <View style={{ zIndex: 1000, elevation: 1000 }}>
            <TextInput
              placeholder="Type item name..."
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setShowDropdown(text.length > 0);
                if (!text) {
                  setSelectedItem(null);
                  setErrorMessage('');
                }
              }}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
              editable={!isSubmitting}
            />

            {/* Dropdown List - positioned absolutely on top */}
            {showDropdown && searchText.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  maxHeight: 300,
                  zIndex: 9999,
                  elevation: 9999,
                  overflow: 'hidden',
                }}
                pointerEvents="box-none"
              >
                <View pointerEvents="auto">
                  {uniqueItemNames.length === 0 ? (
                    <View className="p-4">
                      <Text className="text-gray-500 text-center">
                        No items found
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {uniqueItemNames.map((item) => (
                        <View key={item._id}>
                          {renderDropdownItem(item)}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!showDropdown}
        >
          <View className="px-6 py-8">
            {/* Selected Item Info */}
            {selectedItem && (
              <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <Text className="text-sm font-semibold text-blue-900 mb-2">
                  Selected Item
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  {selectedItem.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Current Quantity: {selectedItem.quantity} units
                </Text>
              </View>
            )}
            {selectedItem && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Quantity to Stock Out *
                </Text>
                <TextInput
                  placeholder="Enter quantity"
                  value={stockOutQuantity}
                  onChangeText={setStockOutQuantity}
                  keyboardType="number-pad"
                  className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                  editable={!isSubmitting}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Maximum: {selectedItem.quantity} units
                </Text>
              </View>
            )}

            {/* Error Message */}
            {errorMessage && (
              <View className="bg-red-50 rounded-lg p-3 mb-6 border border-red-200">
                <Text className="text-red-700 text-sm">{errorMessage}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedItem || isSubmitting}
              className={`rounded-lg py-4 mb-3 ${
                selectedItem && !isSubmitting ? 'bg-red-600' : 'bg-gray-400'
              }`}
            >
              <Text className="text-white font-bold text-center text-lg">
                {isSubmitting ? 'Processing...' : 'Stock Out'}
              </Text>
            </TouchableOpacity>

            {/* Info Text */}
            <Text className="text-xs text-gray-500 text-center">
              * Required fields
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
