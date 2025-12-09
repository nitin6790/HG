import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemContext } from '../src/context/ItemContext';
import { WarehouseContext } from '../src/context/WarehouseContext';
import { CategoryContext } from '../src/context/CategoryContext';
import ItemAutocompleteInput from '../src/components/ItemAutocompleteInput';
import { ENRICHED_MASTER_ITEMS } from '../src/data/masterItems';

export default function StockInScreen({ route, navigation }) {
  const { createItem } = useContext(ItemContext);
  const { categories } = useContext(CategoryContext);
  
  // Get warehouse from route params
  const { warehouseId, warehouseName } = route.params || {};

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);

  // Validate warehouse is provided
  useEffect(() => {
    if (!warehouseId || !warehouseName) {
      Alert.alert('Error', 'No warehouse selected. Please go back and select a warehouse.');
      navigation.goBack();
    }
  }, [warehouseId, warehouseName, navigation]);

  // Check if selected category is Single Segment or Multi Segment
  const isSpecialCategory = selectedCategory && 
    (selectedCategory.name === 'Single Segment' || selectedCategory.name === 'Multi Segment');

  // Auto-set item name when Single Segment or Multi Segment is selected
  useEffect(() => {
    if (isSpecialCategory) {
      setName(selectedCategory.name);
    }
  }, [isSpecialCategory, selectedCategory]);

  // Normalize function for case-insensitive comparison
  const normalize = (str) =>
    (str || '').toString().trim().toUpperCase();

  // Auto-select category when item is selected from autocomplete
  const handleSelectItem = useCallback(
    (item) => {
      if (!item) return;

      // 1. Set the item name in the form
      setName(item.name);

      // 2. Use the item.category directly (e.g. "LAPOTHARA")
      const itemCatName = normalize(item.category);

      if (!itemCatName) return;

      // 3. Find matching category in CategoryContext by NAME (case-insensitive)
      const matchedCategory = categories.find(
        (cat) => normalize(cat.name) === itemCatName
      );

      if (matchedCategory) {
        setSelectedCategoryId(matchedCategory._id);
      }
    },
    [categories]
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
      return;
    }
    if (!quantity || quantity <= 0) {
      Alert.alert('Validation Error', 'Quantity must be greater than 0');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      await createItem(name, Number(quantity), selectedCategoryId, warehouseId, notes);
      Alert.alert('Success', 'Item created successfully');
      setName('');
      setQuantity('');
      setNotes('');
      setSelectedCategoryId(null);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render category dropdown options
  const renderCategoryOptions = () => {
    if (!showCategoryDropdown) return null;
    if (categories.length === 0) {
      return (
        <View className="mt-2 bg-white rounded-lg border border-gray-300 p-4">
          <Text className="text-gray-500 text-center">
            No categories available
          </Text>
        </View>
      );
    }
    return (
      <ScrollView className="mt-2 bg-white rounded-lg border border-gray-300 max-h-48">
        {categories.map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => {
              setSelectedCategoryId(item._id);
              setShowCategoryDropdown(false);
            }}
            className="px-4 py-3 border-b border-gray-200"
          >
            <Text className="text-gray-900">{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Item Autocomplete - OUTSIDE ScrollView so dropdown renders on top */}
        {!isSpecialCategory && (
          <View className="px-6 pt-6 pb-2 bg-gray-50 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Item Name *
            </Text>
            <ItemAutocompleteInput
              masterItems={ENRICHED_MASTER_ITEMS}
              value={name}
              onChangeText={setName}
              onSelectItem={handleSelectItem}
              onDropdownStateChange={setShowItemDropdown}
              placeholder="Search or type item name..."
              editable={!isSubmitting}
            />
          </View>
        )}

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          scrollEnabled={!showCategoryDropdown && !showItemDropdown}
        >
          <View className="px-6 py-8">
            {/* Category Dropdown */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Category *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={isSubmitting}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              >
                <Text
                  className={`text-base ${
                    selectedCategory ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {selectedCategory?.name || 'Select category...'}
                </Text>
              </TouchableOpacity>

              {renderCategoryOptions()}
            </View>

            {/* Quantity */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Quantity *
              </Text>
              <TextInput
                placeholder="Enter quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                editable={!isSubmitting}
              />
            </View>

            {/* Warehouse Label (Read-only) */}
            <View className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <Text className="text-sm font-semibold text-blue-900">
                Warehouse: {warehouseName}
              </Text>
            </View>

            {/* Notes */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                placeholder="Enter notes"
                value={notes}
                onChangeText={setNotes}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`rounded-lg py-4 mb-3 ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white font-bold text-center text-lg">
                {isSubmitting ? 'Creating...' : 'Create Item'}
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

