import React, { createContext, useState, useEffect } from 'react';
import { itemAPI } from '../api/client';

export const ItemContext = createContext();

export function ItemProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load items from backend on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemAPI.getAll();
      setItems(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Failed to load items:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load items filtered by warehouse
  const loadItemsByWarehouse = async (warehouseId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemAPI.getAll(warehouseId);
      setItems(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Failed to load items for warehouse:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
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

    try {
      const trimmedName = name.trim();
      const newItem = await itemAPI.create(
        trimmedName,
        categoryId,
        warehouseId,
        Number(quantity),
        notes.trim()
      );
      
      // Check if item already exists and merge if needed
      const existingItem = items.find(
        (item) =>
          item.name.toLowerCase() === trimmedName.toLowerCase() &&
          item.warehouse === warehouseId
      );

      if (existingItem) {
        // Item already exists in our context, update the list
        const updatedItems = items.map((item) =>
          item._id === existingItem._id
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        );
        setItems(updatedItems);
        return { ...existingItem, quantity: existingItem.quantity + Number(quantity) };
      } else {
        // New item, add to list
        setItems([...items, newItem]);
        return newItem;
      }
    } catch (err) {
      throw err;
    }
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

    try {
      const updated = await itemAPI.update(
        id,
        name.trim(),
        categoryId,
        warehouseId,
        Number(quantity),
        notes.trim()
      );
      
      setItems(items.map((item) => (item._id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await itemAPI.delete(id);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const getItemsByWarehouse = (warehouseId) => {
    return items.filter((item) => item.warehouse === warehouseId);
  };

  const getItemsByCategory = (categoryId) => {
    return items.filter((item) => item.category === categoryId);
  };

  const getItemById = (id) => {
    return items.find((item) => item._id === id);
  };

  const stockOutItem = async (id, quantityToRemove) => {
    if (!id) {
      throw new Error('Item ID is required');
    }
    if (!quantityToRemove || quantityToRemove <= 0) {
      throw new Error('Quantity to stock out must be greater than 0');
    }

    try {
      const updated = await itemAPI.stockOut(id, Number(quantityToRemove));
      setItems(items.map((item) => (item._id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const stockInItem = async (id, quantityToAdd, notes = '') => {
    if (!id) {
      throw new Error('Item ID is required');
    }
    if (!quantityToAdd || quantityToAdd <= 0) {
      throw new Error('Quantity to stock in must be greater than 0');
    }

    try {
      const updated = await itemAPI.stockIn(id, Number(quantityToAdd), notes.trim());
      setItems(items.map((item) => (item._id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        loading,
        error,
        createItem,
        updateItem,
        deleteItem,
        getItemsByWarehouse,
        getItemsByCategory,
        getItemById,
        stockOutItem,
        stockInItem,
        loadItems,
        loadItemsByWarehouse,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}
