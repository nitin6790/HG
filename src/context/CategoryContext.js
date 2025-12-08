import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CategoryContext = createContext();

const CATEGORIES_KEY = '@hsgi_categories';

const DEFAULT_CATEGORIES = [
  'LAPOTHARA',
  'Single Segment',
  'Multi Segment',
];

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories from AsyncStorage on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(CATEGORIES_KEY);
      
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        // Initialize with default categories
        const defaultCategories = DEFAULT_CATEGORIES.map((name, index) => ({
          id: (index + 1).toString(),
          name,
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setCategories(defaultCategories);
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (data) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const createCategory = async (name, description = '') => {
    try {
      const trimmedName = name.trim();

      // Validate name is not empty
      if (!trimmedName) {
        throw new Error('Category name is required');
      }

      // Check for duplicate names (case-insensitive)
      const isDuplicate = categories.some(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A category with this name already exists');
      }

      const newCategory = {
        id: Date.now().toString(),
        name: trimmedName,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [...categories, newCategory];
      setCategories(updated);
      await saveToStorage(updated);
      return newCategory;
    } catch (error) {
      throw error;
    }
  };

  const updateCategory = async (id, name, description = '') => {
    try {
      const trimmedName = name.trim();

      // Validate name is not empty
      if (!trimmedName) {
        throw new Error('Category name is required');
      }

      // Check for duplicate names excluding the current category (case-insensitive)
      const isDuplicate = categories.some(
        (c) =>
          c.id !== id &&
          c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A category with this name already exists');
      }

      const updated = categories.map((c) =>
        c.id === id
          ? {
              ...c,
              name: trimmedName,
              description: description.trim(),
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      setCategories(updated);
      await saveToStorage(updated);
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      await saveToStorage(updated);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const value = {
    categories,
    isLoading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}
