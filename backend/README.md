# HSGI Backend API

Node.js + Express backend for HSGI Inventory Management System with MongoDB Atlas integration.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**To get your MongoDB Atlas connection string:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Click "Connect" on your cluster
4. Choose "Drivers" and copy the connection string
5. Replace `<username>`, `<password>`, and `<cluster>` with your values

### 3. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get specific warehouse
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get specific item
- `GET /api/items/warehouse/:warehouseId` - Get items by warehouse
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `POST /api/items/:id/stock-in` - Add stock
- `POST /api/items/:id/stock-out` - Remove stock
- `DELETE /api/items/:id` - Delete item

## Health Checks

- `GET /` - API status
- `GET /test-db` - Database connection test

## Database Models

### Warehouse
```javascript
{
  name: String (unique, required),
  location: String,
  items: [ObjectId],
  timestamps: true
}
```

### Category
```javascript
{
  name: String (unique, required),
  description: String,
  timestamps: true
}
```

### Item
```javascript
{
  name: String (required),
  categoryId: ObjectId (required),
  warehouseId: ObjectId (required),
  quantity: Number,
  inDates: [Date],
  inQuantities: [Number],
  outDates: [Date],
  outQuantities: [Number],
  timestamps: true
}
```

## Error Handling

All errors are logged to console with `❌` prefix. API returns:
```json
{
  "message": "Error description"
}
```

## Troubleshooting

### Connection Error: "MONGODB_URI is missing in .env file"
- Ensure `.env` file exists in backend root
- Verify `MONGODB_URI` is set correctly

### Connection Error: "connect ECONNREFUSED"
- Check MongoDB Atlas cluster is running
- Verify connection string has correct credentials
- Ensure IP whitelist includes your IP (0.0.0.0 for testing)

### Port Already in Use
- Change `PORT` in `.env` to different number (e.g., 5001)

## Development

Install nodemon for development:
```bash
npm install --save-dev nodemon
npm run dev
```

## Next Steps

1. Connect React Native app to this backend
2. Update API base URL in mobile app to point to this server
3. Migrate local AsyncStorage data to MongoDB

