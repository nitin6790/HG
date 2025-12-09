# Quick Testing Guide

## What Changed & How to Test

### Problem 1: E11000 Duplicate Key Error ❌ → ✅ FIXED

**Before:**
```
POST /api/items { name: "Single Segment", quantity: 50 }
→ Item created ✓

POST /api/items { name: "Single Segment", quantity: 50 }
→ E11000 duplicate key error ✗
```

**After:**
```
POST /api/items { name: "Single Segment", quantity: 50 }
→ Item created with qty: 50 ✓

POST /api/items { name: "Single Segment", quantity: 50 }
→ Same item updated to qty: 100 ✓ (no error!)
```

**Test Now:**
1. In mobile app: Stock In → "Single Segment", Category: Single Segment, Warehouse: Warehouse 1, Qty: 50
2. Stock In again with same details
3. ✅ Should work! Qty should be 100 (not duplicate key error)

---

### Problem 2: populate(...).populate is not a function ❌ → ✅ FIXED

**Before:**
```javascript
const newItem = await item.save();
const populated = await newItem.populate("categoryId").populate("warehouseId");
// Error: populate(...).populate is not a function
```

**After:**
```javascript
const newItem = await item.save();
const populatedItem = await Item.findById(newItem._id)
  .populate("categoryId")
  .populate("warehouseId");
// Works! Returns complete item with category and warehouse details
```

**Result:** Backend now returns complete item data with no errors

---

### Problem 3: No Transaction Tracking ❌ → ✅ IMPLEMENTED

**New StockTransaction Collection:**
Every stock-in and stock-out is now logged:

```javascript
{
  type: "IN",                    // or "OUT"
  item: "6937f...",              // Item ID
  warehouse: "6937f...",         // Warehouse ID
  quantity: 50,                  // Quantity moved
  date: "2025-01-15T04:15:00",  // When
  notes: "Initial stock"         // Optional notes
}
```

**Benefits:**
- Full audit trail of all movements
- Can query movement history
- Reports can show what happened when
- No data loss

---

## Test Scenarios

### Scenario 1: Create New Item
```
POST /api/items
{
  "name": "Single Segment",
  "categoryId": "63f...",
  "warehouseId": "63f...",
  "quantity": 50,
  "notes": "Initial stock"
}
```

**Expected:**
- ✅ Item created with qty: 50
- ✅ StockTransaction created with type: "IN", qty: 50
- ✅ Response includes populated category and warehouse

### Scenario 2: Stock In Existing Item (UPSERT)
```
POST /api/items
{
  "name": "Single Segment",
  "categoryId": "63f...",
  "warehouseId": "63f...",
  "quantity": 30,
  "notes": "More stock arrived"
}
```

**Expected:**
- ✅ NO duplicate key error
- ✅ Same item updated (qty: 50 → 80)
- ✅ StockTransaction created with type: "IN", qty: 30
- ✅ inDates and inQuantities arrays updated

### Scenario 3: Stock In via Explicit Endpoint
```
POST /api/items/{itemId}/stock-in
{
  "quantity": 25,
  "notes": "Restock"
}
```

**Expected:**
- ✅ Item qty incremented
- ✅ StockTransaction created
- ✅ Fully populated item returned

### Scenario 4: Stock Out
```
POST /api/items/{itemId}/stock-out
{
  "quantity": 15,
  "notes": "Sold 15 units"
}
```

**Expected:**
- ✅ Item qty decremented (qty: 80 → 65)
- ✅ StockTransaction created with type: "OUT"
- ✅ outDates and outQuantities updated
- ✅ Error if qty insufficient

### Scenario 5: Stock Out Too Much
```
POST /api/items/{itemId}/stock-out
{
  "quantity": 100
}
```

**Expected:**
- ✅ Error: "Insufficient quantity in stock. Available: 65, Requested: 100"
- ✅ Item NOT updated
- ✅ StockTransaction NOT created

---

## Verification in MongoDB

### Check Items Collection
```javascript
db.items.findOne({ name: "Single Segment" })
```

**Should see:**
```javascript
{
  _id: ObjectId("..."),
  name: "Single Segment",
  categoryId: ObjectId("..."),
  warehouseId: ObjectId("..."),
  quantity: 80,              // Updated by all operations
  inDates: [Date, Date],     // Multiple entries
  inQuantities: [50, 30],    // Corresponding amounts
  outDates: [Date],          // Out operations
  outQuantities: [15],       // Amounts removed
  createdAt: Date,
  updatedAt: Date
}
```

### Check StockTransaction Collection
```javascript
db.stocktransactions.find({ item: ObjectId("...") })
```

**Should see:**
```javascript
[
  { type: "IN", quantity: 50, date: Date(...) },
  { type: "IN", quantity: 30, date: Date(...) },
  { type: "OUT", quantity: 15, date: Date(...) }
]
```

---

## Deployment Steps

1. **Code is ready** - All changes committed
2. **Push to GitHub** - Changes pushed to backend repo
3. **Wait for Render** - Auto-deploys (30-60 seconds)
4. **Reload mobile app** - Press `r` in Expo CLI
5. **Test in app** - Try Stock In with duplicate item name

---

## Error Messages (Now Clearer)

| Scenario | Error Message |
|----------|---------------|
| Missing required field | `"name, categoryId, and warehouseId are required"` |
| Qty ≤ 0 | `"quantity must be greater than 0"` |
| Qty too high on stock-out | `"Insufficient quantity in stock. Available: 65, Requested: 100"` |
| Item not found | `"Item not found"` |
| Unknown error | `"Failed to create/stock in item"` with stack trace |

---

## What's Different for Frontend?

**Good news: NOTHING!** 

Your React Native app doesn't need any changes:
- Same endpoint URLs
- Same response format
- Same data structure
- Just now it works without errors! ✅

The backend improvements are transparent to the frontend.

---

## Common Issues & Solutions

**Q: I'm still getting E11000 error**
- A: Make sure Render has deployed the latest code
  - Check: https://hsgi-backend.onrender.com/api/items (should respond)
  - Restart Expo: `expo start` again
  - Reload app: Press `r`

**Q: Item was created but not returned**
- A: That was the `.populate()` error (now fixed)
  - Backend created the item but failed to return it
  - All items created before are safe in MongoDB
  - Just can't retrieve them with category/warehouse data

**Q: I see "warehouse: null" in error**
- A: warehouseId might not be sent from app
  - Check StockInScreen.js passes warehouseId correctly
  - Validation now requires it

---

## Next Steps

1. ✅ Deploy backend changes (Render auto-deploys)
2. ✅ Test Stock In with duplicate names
3. ✅ Check MongoDB for StockTransaction records
4. ✅ Run through all scenarios above
5. ✅ Create Reports screen to show transaction history

Good luck! The system is much more robust now. 🚀
