import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getCleanName } from '../data/masterItems';

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    elevation: 1000,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  dropdown: {
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
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  itemCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default function ItemAutocompleteInput({
  masterItems,
  value,
  onChangeText,
  onSelectItem,
  placeholder = 'Search item...',
  editable = true,
  onDropdownStateChange = () => {},
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Clean the current input
  const cleanInput = useMemo(() => {
    return getCleanName(value);
  }, [value]);

  // Filter items based on cleaned input
  const filteredItems = useMemo(() => {
    if (!cleanInput || cleanInput.trim() === '') {
      return [];
    }

    return masterItems.filter((item) => {
      const itemCleanName = item.cleanName || getCleanName(item.name);
      return itemCleanName.includes(cleanInput);
    });
  }, [cleanInput, masterItems]);

  const handleSelectItem = (item) => {
    // Update TextInput
    onChangeText(item.name);
    
    // Hide dropdown
    setShowDropdown(false);
    onDropdownStateChange(false);
    
    // Call parent callback with full item object
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const handleTextChange = (text) => {
    onChangeText(text);
    // Show dropdown if there's input
    if (text.trim().length > 0) {
      setShowDropdown(true);
      onDropdownStateChange(true);
    } else {
      setShowDropdown(false);
      onDropdownStateChange(false);
    }
  };

  const handleFocus = () => {
    if (value.trim().length > 0) {
      setShowDropdown(true);
      onDropdownStateChange(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      onDropdownStateChange(false);
    }, 150);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Text Input */}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#d1d5db"
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
          editable={editable}
        />

        {/* Dropdown using simple View + items directly */}
        {showDropdown && filteredItems.length > 0 && (
          <View style={[styles.dropdown, { overflow: 'hidden' }]} pointerEvents="box-none">
            <View style={{ maxHeight: 300 }} pointerEvents="auto">
              {filteredItems.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.name}-${idx}`}
                  onPress={() => handleSelectItem(item)}
                  style={styles.dropdownItem}
                  activeOpacity={0.6}
                  pointerEvents="auto"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </>

  );
}
