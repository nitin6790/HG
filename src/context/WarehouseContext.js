import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WarehouseContext = createContext();

const WAREHOUSES_KEY = '@hsgi_warehouses';

export function WarehouseProvider({ children }) {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load warehouses from AsyncStorage on mount
  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(WAREHOUSES_KEY);
      if (stored) {
        setWarehouses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (data) => {
    try {
      await AsyncStorage.setItem(WAREHOUSES_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving warehouses:', error);
    }
  };

  const createWarehouse = async (name, description = '') => {
    try {
      const trimmedName = name.trim();
      
      // Validate name is not empty
      if (!trimmedName) {
        throw new Error('Warehouse name is required');
      }

      // Check for duplicate names (case-insensitive)
      const isDuplicate = warehouses.some(
        (w) => w.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A warehouse with this name already exists');
      }

      const newWarehouse = {
        id: Date.now().toString(),
        name: trimmedName,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [...warehouses, newWarehouse];
      setWarehouses(updated);
      await saveToStorage(updated);
      return newWarehouse;
    } catch (error) {
      throw error;
    }
  };

  const updateWarehouse = async (id, name, description = '') => {
    try {
      const trimmedName = name.trim();

      // Validate name is not empty
      if (!trimmedName) {
        throw new Error('Warehouse name is required');
      }

      // Check for duplicate names excluding the current warehouse (case-insensitive)
      const isDuplicate = warehouses.some(
        (w) =>
          w.id !== id &&
          w.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A warehouse with this name already exists');
      }

      const updated = warehouses.map((w) =>
        w.id === id
          ? {
              ...w,
              name: trimmedName,
              description: description.trim(),
              updatedAt: new Date().toISOString(),
            }
          : w
      );

      setWarehouses(updated);
      await saveToStorage(updated);
    } catch (error) {
      throw error;
    }
  };

  const deleteWarehouse = async (id) => {
    try {
      const updated = warehouses.filter((w) => w.id !== id);
      setWarehouses(updated);
      await saveToStorage(updated);
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  };

  const value = {
    warehouses,
    isLoading,
    loadWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
}
