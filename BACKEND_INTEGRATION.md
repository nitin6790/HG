/**
 * HSGI REACT NATIVE - BACKEND INTEGRATION GUIDE
 * 
 * Your React Native app is now fully integrated with the backend API!
 * This document outlines the integration and how to test it.
 */

// ==================== BACKEND API ENDPOINT ====================
// Backend URL: https://hsgi-backend.onrender.com/api
// 
// Available Endpoints:
// 
// WAREHOUSES:
// - GET    /api/warehouses                      - Get all warehouses
// - POST   /api/warehouses                      - Create warehouse
// - PUT    /api/warehouses/:id                  - Update warehouse
// - DELETE /api/warehouses/:id                  - Delete warehouse
//
// CATEGORIES:
// - GET    /api/categories                      - Get all categories
// - POST   /api/categories                      - Create category
// - PUT    /api/categories/:id                  - Update category
// - DELETE /api/categories/:id                  - Delete category
//
// ITEMS:
// - GET    /api/items                           - Get all items
// - GET    /api/items/warehouse/:warehouseId    - Get items by warehouse
// - POST   /api/items                           - Create item
// - PUT    /api/items/:id                       - Update item
// - POST   /api/items/:id/stock-in              - Stock in item
// - POST   /api/items/:id/stock-out             - Stock out item
// - DELETE /api/items/:id                       - Delete item

// ==================== INTEGRATION CHANGES ====================
// 
// 1. NEW FILE: src/api/client.js
//    - All API calls are centralized here
//    - Functions for warehouses, categories, and items
//    - Handles errors and responses automatically
//
// 2. UPDATED CONTEXTS:
//    - src/context/WarehouseContext.js   (now uses API instead of AsyncStorage)
//    - src/context/CategoryContext.js    (now uses API instead of AsyncStorage)
//    - src/context/ItemContext.js        (now uses API instead of AsyncStorage)
//
// 3. ID CHANGES:
//    - MongoDB uses '_id' field instead of 'id'
//    - All screens updated to use item._id instead of item.id
//    - Affected screens:
//      - WarehouseListScreen
//      - WarehouseLogsSelectionScreen
//      - WarehouseItemsScreen
//      - WarehouseLogsScreen
//      - WarehouseFormScreen
//      - CategoriesScreen
//      - CategoryFormScreen
//      - StockInScreen
//      - StockOutScreen

// ==================== TESTING STEPS ====================
//
// 1. BUILD AND RUN THE APP:
//    npm start
//    (Then run on your device/emulator)
//
// 2. TEST WAREHOUSE CREATION:
//    - Navigate to Settings > Warehouses
//    - Create a new warehouse
//    - Check MongoDB to verify it was saved
//    - Reload app to confirm data persists
//
// 3. TEST CATEGORY CREATION:
//    - Navigate to Settings > Categories
//    - Verify default categories are loaded (LAPOTHARA, Single Segment, Multi Segment)
//    - Try to create a duplicate (should fail)
//    - Create a new category
//
// 4. TEST ITEM CREATION (STOCK IN):
//    - Go to Warehouses list
//    - Select a warehouse
//    - Click "Stock In"
//    - Select category and add item
//    - Verify item appears in warehouse items list
//    - Reload app - item should still be there
//
// 5. TEST STOCK OUT:
//    - From warehouse items, click "Stock Out"
//    - Select an item
//    - Reduce quantity
//    - Verify quantity updates in warehouse items list
//
// 6. TEST REPORTS:
//    - From warehouse items, click "View Report"
//    - Select month/year
//    - Verify opening stock, stock in, stock out, closing stock calculations
//    - Export to Excel (should work with backend data)
//
// 7. TEST LOW STOCK ALERTS:
//    - Set item quantity below threshold
//    - Go to home screen
//    - Verify low stock alert appears
//
// 8. VERIFY DATA PERSISTENCE:
//    - Force close app
//    - Reopen app
//    - Verify all data (warehouses, categories, items) is still there
//    - This means API is working correctly

// ==================== TROUBLESHOOTING ====================
//
// ISSUE: API calls failing with "Network Error"
// SOLUTION: 
//   - Check internet connection
//   - Verify backend is running: https://hsgi-backend.onrender.com/
//   - Check console logs for actual error message
//   - Backend may be sleeping on Render free tier (starts on first request)
//
// ISSUE: Data not syncing between app and backend
// SOLUTION:
//   - Force reload app contexts: Close and reopen app
//   - Check network tab in React Native Debugger
//   - Verify MongoDB Atlas connection is active
//
// ISSUE: IDs showing as undefined
// SOLUTION:
//   - All MongoDB objects use '_id' field, not 'id'
//   - Check screens are using item._id not item.id
//   - Look for any remaining item.id references in custom code
//
// ISSUE: Categories not showing
// SOLUTION:
//   - App auto-creates defaults on first load if none exist
//   - Check MongoDB: hsgi-db.categories collection
//   - Try manually creating a category

// ==================== API CLIENT USAGE ====================
//
// Import in any component:
//   import { itemAPI, warehouseAPI, categoryAPI } from '../api/client';
//
// Create item:
//   const newItem = await itemAPI.create(
//     'Item Name',
//     categoryId,
//     warehouseId,
//     quantity,
//     'optional notes'
//   );
//
// Stock in item:
//   const updated = await itemAPI.stockIn(itemId, quantity, 'notes');
//
// Stock out item:
//   const updated = await itemAPI.stockOut(itemId, quantity, 'notes');
//
// Get all items:
//   const items = await itemAPI.getAll();
//
// Get items by warehouse:
//   const warehouseItems = await itemAPI.getByWarehouse(warehouseId);
//
// Update item:
//   const updated = await itemAPI.update(
//     itemId,
//     'new name',
//     categoryId,
//     warehouseId,
//     newQuantity,
//     'notes'
//   );
//
// Delete item:
//   await itemAPI.delete(itemId);

// ==================== DATABASE STRUCTURE ====================
//
// MongoDB Collections:
//
// 1. warehouses
//    {
//      _id: ObjectId,
//      name: String (unique),
//      location: String,
//      createdAt: Date,
//      updatedAt: Date
//    }
//
// 2. categories
//    {
//      _id: ObjectId,
//      name: String (unique),
//      description: String,
//      createdAt: Date,
//      updatedAt: Date
//    }
//
// 3. items
//    {
//      _id: ObjectId,
//      name: String,
//      quantity: Number,
//      categoryId: ObjectId (ref: categories),
//      warehouseId: ObjectId (ref: warehouses),
//      notes: String,
//      createdAt: Date,
//      updatedAt: Date
//    }
//
// 4. transactions
//    {
//      _id: ObjectId,
//      type: String ('in' or 'out'),
//      itemId: ObjectId (ref: items),
//      warehouseId: ObjectId (ref: warehouses),
//      quantity: Number,
//      date: Date,
//      notes: String
//    }

// ==================== WHAT'S NEXT ====================
//
// 1. Deploy backend to paid tier (optional):
//    - Current setup uses Render free tier (may sleep after 15 min inactivity)
//    - Consider upgrading for production use
//
// 2. Add authentication:
//    - Users should login before accessing data
//    - Store user preferences server-side
//
// 3. Add offline support:
//    - Cache API responses locally with AsyncStorage
//    - Sync when connection is restored
//    - Implement sync queue for operations done offline
//
// 4. Add data validation:
//    - Server-side validation for all inputs
//    - Unique constraints on warehouse/category names
//    - Check stock before allowing stock out
//
// 5. Add error tracking:
//    - Implement Sentry or similar for production monitoring
//    - Track failed API calls and user errors
//
// 6. Performance optimizations:
//    - Implement pagination for large datasets
//    - Add search/filter endpoints on backend
//    - Cache frequently accessed data

export default {};
