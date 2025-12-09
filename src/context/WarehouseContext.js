import React, { createContext, useState, useEffect } from 'react';
import { warehouseAPI } from '../api/client';

export const WarehouseContext = createContext();

export function WarehouseProvider({ children }) {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load warehouses from backend on mount
  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await warehouseAPI.getAll();
      setWarehouses(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Error loading warehouses:', err);
      setError(err.message);
      // Fall back to empty array if API fails
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createWarehouse = async (name, location = '') => {
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

      const newWarehouse = await warehouseAPI.create(trimmedName, location.trim());
      const updated = [...warehouses, newWarehouse];
      setWarehouses(updated);
      return newWarehouse;
    } catch (error) {
      throw error;
    }
  };

  const updateWarehouse = async (id, name, location = '') => {
    try {
      const trimmedName = name.trim();

      // Validate name is not empty
      if (!trimmedName) {
        throw new Error('Warehouse name is required');
      }

      // Check for duplicate names excluding the current warehouse (case-insensitive)
      const isDuplicate = warehouses.some(
        (w) =>
          w._id !== id &&
          w.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A warehouse with this name already exists');
      }

      const updated = await warehouseAPI.update(id, trimmedName, location.trim());
      setWarehouses(warehouses.map((w) => (w._id === id ? updated : w)));
      return updated;
    } catch (error) {
      throw error;
    }
  };

  const deleteWarehouse = async (id) => {
    try {
      await warehouseAPI.delete(id);
      setWarehouses(warehouses.filter((w) => w._id !== id));
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  };

  const value = {
    warehouses,
    isLoading,
    error,
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
