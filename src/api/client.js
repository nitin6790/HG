// API Client for HSGI Backend
// Backend URL: https://hsgi-backend.onrender.com

const API_BASE_URL = 'https://hsgi-backend.onrender.com/api';

// Error handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
};

// ==================== WAREHOUSES ====================
export const warehouseAPI = {
  // Get all warehouses
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/warehouses`);
    return handleResponse(response);
  },

  // Get warehouse by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`);
    return handleResponse(response);
  },

  // Create warehouse
  create: async (name, location = '') => {
    const response = await fetch(`${API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location }),
    });
    return handleResponse(response);
  },

  // Update warehouse
  update: async (id, name, location = '') => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location }),
    });
    return handleResponse(response);
  },

  // Delete warehouse
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ==================== CATEGORIES ====================
export const categoryAPI = {
  // Get all categories
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  },

  // Get category by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    return handleResponse(response);
  },

  // Create category
  create: async (name, description = '') => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  },

  // Update category
  update: async (id, name, description = '') => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  },

  // Delete category
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ==================== ITEMS ====================
export const itemAPI = {
  // Get all items
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/items`);
    return handleResponse(response);
  },

  // Get items by warehouse
  getByWarehouse: async (warehouseId) => {
    const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}`);
    return handleResponse(response);
  },

  // Get item by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`);
    return handleResponse(response);
  },

  // Create item
  create: async (name, categoryId, warehouseId, quantity = 0, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        categoryId,
        warehouseId,
        quantity,
        notes,
      }),
    });
    return handleResponse(response);
  },

  // Update item
  update: async (id, name, categoryId, warehouseId, quantity, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        categoryId,
        warehouseId,
        quantity,
        notes,
      }),
    });
    return handleResponse(response);
  },

  // Stock In
  stockIn: async (itemId, quantity, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, notes }),
    });
    return handleResponse(response);
  },

  // Stock Out
  stockOut: async (itemId, quantity, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, notes }),
    });
    return handleResponse(response);
  },

  // Delete item
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ==================== TRANSACTIONS ====================
export const transactionAPI = {
  // Get all transactions
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    return handleResponse(response);
  },

  // Note: Transactions are created via stock-in and stock-out endpoints
};

// ==================== HEALTH CHECK ====================
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    return handleResponse(response);
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
