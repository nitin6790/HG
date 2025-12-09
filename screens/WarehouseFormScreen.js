import React, { useContext, useState, useEffect } from 'react';
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
import { WarehouseContext } from '../src/context/WarehouseContext';

export default function WarehouseFormScreen({ navigation, route }) {
  const warehouse = route?.params?.warehouse;
  const isEditing = !!warehouse;

  const { createWarehouse, updateWarehouse, warehouses } =
    useContext(WarehouseContext);

  const [name, setName] = useState(warehouse?.name || '');
  const [description, setDescription] = useState(warehouse?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Warehouse' : 'Create Warehouse',
    });
  }, [navigation, isEditing]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Warehouse name is required');
      return false;
    }

    // Check for duplicate names
    const isDuplicate = warehouses.some(
      (w) =>
        w._id !== warehouse?._id &&
        w.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      Alert.alert(
        'Validation Error',
        'A warehouse with this name already exists'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateWarehouse(warehouse._id, name, description);
      } else {
        await createWarehouse(name, description);
      }
      Alert.alert(
        'Success',
        isEditing
          ? 'Warehouse updated successfully'
          : 'Warehouse created successfully'
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8">
            {/* Name Input */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Warehouse Name *
              </Text>
              <TextInput
                placeholder="Enter warehouse name"
                value={name}
                onChangeText={setName}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                editable={!isSubmitting}
              />
            </View>

            {/* Description Input */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Description (Optional)
              </Text>
              <TextInput
                placeholder="Enter warehouse description"
                value={description}
                onChangeText={setDescription}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                multiline
                numberOfLines={4}
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
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Warehouse'
                  : 'Create Warehouse'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
              className="rounded-lg py-4 border border-gray-300 bg-white"
            >
              <Text className="text-gray-700 font-semibold text-center text-lg">
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Info Text */}
            <Text className="text-xs text-gray-500 text-center mt-6">
              * Required fields
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
