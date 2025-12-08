import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ItemContext = createContext();

// Simple UUID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function ItemProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load items from AsyncStorage on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem('items');
      if (storedItems) {
        let parsedItems = JSON.parse(storedItems);
        // Consolidate duplicate items by name within each warehouse
        parsedItems = consolidateDuplicateItems(parsedItems);
        // Save consolidated items back to storage
        await AsyncStorage.setItem('items', JSON.stringify(parsedItems));
        setItems(parsedItems);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load items:', error);
      setLoading(false);
    }
  };

  // Consolidate duplicate items with same name in same warehouse
  const consolidateDuplicateItems = (itemsList) => {
    const consolidatedMap = new Map();

    itemsList.forEach((item) => {
      const key = `${item.warehouseId}-${item.name.toLowerCase()}`;

      if (consolidatedMap.has(key)) {
        // Item already exists, merge quantities
        const existing = consolidatedMap.get(key);
        existing.quantity += item.quantity;
        existing.updatedAt = new Date().toISOString();
      } else {
        // First occurrence of this item
        consolidatedMap.set(key, { ...item });
      }
    });

    return Array.from(consolidatedMap.values());
  };

  const saveItems = async (updatedItems) => {
    try {
      await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.error('Failed to save items:', error);
      throw error;
    }
  };

  const createItem = async (name, quantity, categoryId, warehouseId, notes = '') => {
    if (!name || !name.trim()) {
      throw new Error('Item name is required');
    }
    if (!warehouseId) {
      throw new Error('Warehouse must be selected');
    }
    if (!categoryId) {
      throw new Error('Category must be selected');
    }
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const trimmedName = name.trim();
    
    // Check if item with same name already exists in this warehouse
    const existingItem = items.find(
      (item) => 
        item.name.toLowerCase() === trimmedName.toLowerCase() &&
        item.warehouseId === warehouseId
    );

    let updatedItems;
    if (existingItem) {
      // Merge quantities with existing item
      updatedItems = items.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              quantity: item.quantity + Number(quantity),
              categoryId, // Update category if needed
              notes: notes.trim() || item.notes, // Keep old notes if new notes are empty
              updatedAt: new Date().toISOString(),
            }
          : item
      );
    } else {
      // Create new item
      const newItem = {
        id: generateId(),
        name: trimmedName,
        quantity: Number(quantity),
        categoryId,
        warehouseId,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedItems = [...items, newItem];
    }

    await saveItems(updatedItems);
    return existingItem ? { ...existingItem, quantity: existingItem.quantity + Number(quantity) } : updatedItems[updatedItems.length - 1];
  };

  const updateItem = async (id, name, quantity, categoryId, warehouseId, notes = '') => {
    if (!name || !name.trim()) {
      throw new Error('Item name is required');
    }
    if (!warehouseId) {
      throw new Error('Warehouse must be selected');
    }
    if (!categoryId) {
      throw new Error('Category must be selected');
    }
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      name: name.trim(),
      quantity: Number(quantity),
      categoryId,
      warehouseId,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    await saveItems(updatedItems);
    return updatedItems[itemIndex];
  };

  const deleteItem = async (id) => {
    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const updatedItems = items.filter((item) => item.id !== id);
    await saveItems(updatedItems);
  };

  const getItemsByWarehouse = (warehouseId) => {
    return items.filter((item) => item.warehouseId === warehouseId);
  };

  const getItemsByCategory = (categoryId) => {
    return items.filter((item) => item.categoryId === categoryId);
  };

  const getItemById = (id) => {
    return items.find((item) => item.id === id);
  };

  const stockOutItem = async (id, quantityToRemove) => {
    if (!id) {
      throw new Error('Item ID is required');
    }
    if (!quantityToRemove || quantityToRemove <= 0) {
      throw new Error('Quantity to stock out must be greater than 0');
    }

    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const item = items[itemIndex];
    const newQuantity = item.quantity - Number(quantityToRemove);

    if (newQuantity < 0) {
      throw new Error(
        `Cannot stock out ${quantityToRemove}. Only ${item.quantity} available.`
      );
    }

    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...item,
      quantity: newQuantity,
      // Track stock out events
      outQuantity: (item.outQuantity || 0) + Number(quantityToRemove),
      outDates: [
        ...(item.outDates || []),
        new Date().toISOString(),
      ],
      updatedAt: new Date().toISOString(),
    };

    await saveItems(updatedItems);
    return updatedItems[itemIndex];
  };

  const clearItems = async () => {
    try {
      await AsyncStorage.setItem('items', JSON.stringify([]));
      setItems([]);
    } catch (error) {
      console.error('Failed to clear items:', error);
      throw error;
    }
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        loading,
        createItem,
        updateItem,
        deleteItem,
        getItemsByWarehouse,
        getItemsByCategory,
        getItemById,
        stockOutItem,
        clearItems,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}
