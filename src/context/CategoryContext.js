import React, { createContext, useState, useEffect } from 'react';
import { categoryAPI } from '../api/client';

export const CategoryContext = createContext();

const DEFAULT_CATEGORIES = [
  'LAPOTHARA',
  'Single Segment',
  'Multi Segment',
];

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories from backend on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryAPI.getAll();
      const fetchedCategories = Array.isArray(data) ? data : (data.data || []);
      
      // If no categories exist on backend, create defaults
      if (fetchedCategories.length === 0) {
        await initializeDefaultCategories();
      } else {
        setCategories(fetchedCategories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message);
      // Fall back to empty array if API fails
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      const created = [];
      for (const name of DEFAULT_CATEGORIES) {
        const category = await categoryAPI.create(name, '');
        created.push(category);
      }
      setCategories(created);
    } catch (err) {
      console.error('Error initializing default categories:', err);
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

      const newCategory = await categoryAPI.create(trimmedName, description.trim());
      const updated = [...categories, newCategory];
      setCategories(updated);
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
          c._id !== id &&
          c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A category with this name already exists');
      }

      const updated = await categoryAPI.update(id, trimmedName, description.trim());
      setCategories(categories.map((c) => (c._id === id ? updated : c)));
      return updated;
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const value = {
    categories,
    isLoading,
    error,
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
