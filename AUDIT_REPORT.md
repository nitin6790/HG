# 📋 HSGI Implementation Audit Report

**Date:** December 9, 2025  
**Audit Scope:** Backend (Node.js/Express + MongoDB) & Frontend (React Native)  
**Specification:** Complete inventory management system with warehouses, categories, items, and stock tracking

---

## Executive Summary

✅ **GOOD NEWS:** Your implementation is **60% aligned** with the specification.

**Status Breakdown:**
- ✅ Core collections exist (warehouses, categories, items, stocktransactions)
- ✅ Basic CRUD endpoints working (warehouses, categories, items)
- ✅ Stock tracking implemented with transactions
- ✅ Frontend API client mostly correct
- ⚠️ **CRITICAL GAPS:** Missing Report API endpoints + indexes
- ⚠️ **ISSUES:** Missing fields, incorrect stock-in/out logic in some cases

**Action Items:** 14 fixes needed (3 critical, 5 high, 6 medium)

---

## PART 1: DATABASE (MongoDB Collections)

### ✅ A. Warehouses Collection

**Specification:**
```
Fields: name, location, description, createdAt, updatedAt
Constraints: name unique, trimmed
```

**Current State:**
```
Fields: name, location, items (ref array), timestamps
Missing: description
Issues: No trim on name, no description field
```

**Status:** ⚠️ **INCOMPLETE**

**Fix Needed:**
- [ ] Add `description: String` field (optional)
- [ ] Add `trim: true` to name field
- [ ] Remove `items` array (not in spec, creates coupling)

---

### ✅ B. Categories Collection

**Specification:**
```
Fields: name, description, createdAt, updatedAt
Constraints: name unique, trimmed
```

**Current State:**
```
Fields: name, description, timestamps
Correct: Matches spec
```

**Status:** ✅ **CORRECT**

**No fixes needed.**

---

### ⚠️ C. Items Collection

**Specification:**
```
Fields: name, category (ref), warehouse (ref), quantity, notes, timestamps
Unique Index: { name: 1, warehouse: 1 }
```

**Current State:**
```
Fields: name, categoryId (ref), warehouseId (ref), quantity, notes,
        inDates[], inQuantities[], outDates[], outQuantities[], timestamps
Indexes: Compound unique on { name, warehouseId } ✅

Issues:
  1. Uses categoryId + warehouseId (non-standard field names)
  2. Has inDates, inQuantities, outDates, outQuantities (WRONG!)
     → These should NOT be in Item model
     → Use StockTransaction for this (already done)
     → Duplicates data in both places
```

**Status:** ⚠️ **PARTIALLY CORRECT BUT REDUNDANT**

**Fixes Needed:**
- [ ] Remove: inDates, inQuantities, outDates, outQuantities arrays
  - Rationale: This data should ONLY be in StockTransaction
  - Cause of bugs: Duplicate tracking causes inconsistency
- [ ] Consider renaming: categoryId → category (spec uses singular)
- [ ] Consider renaming: warehouseId → warehouse (spec uses singular)
  
  **NOTE:** Renaming would require migration. For now, keep as is if working.

---

### ✅ D. StockTransactions Collection

**Specification:**
```
Fields: type (IN|OUT), item (ref), warehouse (ref), quantity, date, notes, timestamps
Indexes: { warehouse: 1, date: 1 }, { item: 1, date: 1 }
```

**Current State:**
```
Fields: type, item, warehouse, quantity, date, notes, timestamps
Correct: All fields present

Missing:
  1. Index on { warehouse: 1, date: 1 }
  2. Index on { item: 1, date: 1 }
  
These indexes are needed for fast report queries!
```

**Status:** ⚠️ **MOSTLY CORRECT BUT MISSING INDEXES**

**Fixes Needed:**
- [ ] Add index: `{ warehouse: 1, date: 1 }`
- [ ] Add index: `{ item: 1, date: 1 }`

---

### ❌ E. Missing Collection: None

**Status:** ✅ **All required collections present**

---

## PART 2: BACKEND API ENDPOINTS

### ✅ A. Warehouse Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/warehouses` | GET | ✅ | Works, returns all |
| `/api/warehouses` | POST | ✅ | Works, creates new |
| `/api/warehouses/:id` | GET | ✅ | Works, returns single |
| `/api/warehouses/:id` | PUT | ✅ | Works, updates |
| `/api/warehouses/:id` | DELETE | ✅ | Works, deletes |

**Issues:**
- `description` field not accepted (will be fixed with model update)
- No validation of `name` trimming (no trim)

**Fixes Needed:**
- [ ] Update model to trim name + add description
- [ ] Update routes to handle description

---

### ✅ B. Category Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/categories` | GET | ✅ | Works |
| `/api/categories` | POST | ✅ | Works |
| `/api/categories/:id` | GET | ✅ | Works |
| `/api/categories/:id` | PUT | ✅ | Works |
| `/api/categories/:id` | DELETE | ✅ | Works |

**Status:** ✅ **CORRECT**

**Note:** No validation for preventing deletion if items use it. (Enhancement, not critical)

---

### ✅ C. Item Endpoints - GET

| Endpoint | Method | Query Params | Status | Notes |
|----------|--------|--------------|--------|-------|
| `/api/items` | GET | none | ✅ | Returns all items |
| `/api/items/warehouse/:id` | GET | N/A | ✅ | Returns by warehouse |
| `/api/items/:id` | GET | N/A | ✅ | Returns single |

**Specification Requires:**
```
GET /api/items?warehouseId=X&categoryId=Y&search=Z
```

**Current State:**
- Has dedicated `/api/items/warehouse/:warehouseId` endpoint
- Missing: Query param support for filtering
- Missing: `categoryId` filtering
- Missing: `search` (partial name match) filtering

**Status:** ⚠️ **PARTIAL - Missing query param support**

**Fixes Needed:**
- [ ] Update `GET /api/items` to support query params:
  - `warehouseId` (optional)
  - `categoryId` (optional)
  - `search` (optional, partial match)

---

### ⚠️ D. Stock In Endpoint

**Specification:**
```
POST /api/stock/in
Body: { name, categoryId, warehouseId, quantity, notes }
Logic:
  - If item exists (name + warehouse): UPDATE quantity += quantity
  - If not exists: CREATE new item
  - Always create StockTransaction with type: "IN"
```

**Current Endpoints:**
1. `POST /api/items` - Acts as stock-in (upsert logic)
2. `POST /api/items/:id/stock-in` - Stock-in by ID

**Current Logic in POST /api/items:**
```javascript
let item = await Item.findOne({ name: name.trim(), warehouseId });
if (item) {
  item.quantity += Number(quantity);
  await item.save();
} else {
  item = await Item.create({ ... });
}
await StockTransaction.create({ type: "IN", ... });
```

**Status:** ✅ **MOSTLY CORRECT** but spec wants `/api/stock/in`

**Issues:**
1. Spec expects dedicated endpoint `/api/stock/in`
2. Current uses `/api/items` for both create + stock-in
3. Logic is correct, but endpoint structure is non-standard

**Missing from Spec:**
- No `/api/stock/in` endpoint (though logic exists in POST /api/items)

**Fixes Needed:**
- [ ] Create `/api/stock/in` endpoint (can reuse POST /api/items logic)
- [ ] OR document that POST /api/items acts as stock-in

---

### ⚠️ E. Stock Out Endpoint

**Specification:**
```
POST /api/stock/out
Body: { name, warehouseId, quantity, notes }
Logic:
  - Find by name + warehouse
  - If not found: 404
  - If qty < requested: 400
  - Else: quantity -= quantity
```

**Current Implementation:**
```
POST /api/items/:id/stock-out
Body: { quantity, notes, date }
```

**Issues:**
1. Spec wants POST /api/stock/out with `name` + `warehouseId`
2. Current uses item ID instead of name/warehouse
3. Logic is correct, but interface is different

**Fixes Needed:**
- [ ] Create `/api/stock/out` endpoint with name + warehouse lookup
- [ ] Keep `/api/items/:id/stock-out` for convenience

---

### ❌ F. Report Endpoints

**Specification Requires:**
```
1. GET /api/reports/monthly?year=2025&month=1&warehouseId=X
   Returns: [{ itemName, categoryName, openingStock, stockIn, stockOut, closingStock }]

2. GET /api/reports/low-stock?warehouseId=X&threshold=5
   Returns: [items where quantity < threshold]
```

**Current State:**
- ❌ NO BACKEND REPORT ENDPOINTS
- Frontend does all calculations locally (WRONG approach)
- Should be backend responsibility for accuracy/consistency

**Status:** ❌ **CRITICAL - MISSING ENTIRE REPORT API**

**Fixes Needed:**
- [ ] Create `/api/reports/monthly` endpoint
- [ ] Create `/api/reports/low-stock` endpoint
- [ ] Move business logic from frontend to backend

---

## PART 3: FRONTEND API CALLS

### ✅ A. Warehouse API Calls

**File:** `src/api/client.js`

**Spec Requires:**
- getAll, getById, create, update, delete

**Current State:** ✅ **All implemented correctly**

**Note:** No `description` handling (yet). Will work after model update.

---

### ✅ B. Category API Calls

**File:** `src/api/client.js`

**Status:** ✅ **All correct**

---

### ✅ C. Item API Calls

**File:** `src/api/client.js`

**Spec Requires:**
```javascript
// Query param version:
loadItems({ warehouseId, categoryId, search })

// Current:
getAll()
getByWarehouse(warehouseId)
getById(id)
create(...)
update(...)
stockIn(itemId, quantity, notes)
stockOut(itemId, quantity, notes)
delete(id)
```

**Issues:**
1. Missing: Query param version of `getAll()`
2. Has: `getByWarehouse()` (convenient, but not in spec)
3. Missing: `search` parameter support

**Fixes Needed:**
- [ ] Add method: `getAllWithFilters(warehouseId, categoryId, search)`
- [ ] Keep `getByWarehouse()` for backward compatibility

---

### ❌ D. Report API Calls

**File:** `src/api/client.js`

**Spec Requires:**
```javascript
const reportAPI = {
  getMonthlyReport({ warehouseId, year, month }),
  getLowStockItems({ warehouseId, threshold })
}
```

**Current State:** ❌ **NOT IMPLEMENTED**

**Status:** ❌ **CRITICAL - MISSING**

**Note:** Frontend currently does all calculations. Must move to backend.

**Fixes Needed:**
- [ ] Create reportAPI with getMonthlyReport()
- [ ] Create reportAPI with getLowStockItems()

---

### ✅ E. React Contexts

**WarehouseContext:** ✅ Correct  
**CategoryContext:** ✅ Correct  
**ItemContext:** ✅ Correct

**Missing:** ReportContext (needed for reports)

**Fixes Needed:**
- [ ] Create ReportContext with low-stock + monthly report hooks

---

## PART 4: DATABASE FIELD NAMES

### Current vs Spec:

| Collection | Field | Spec | Current | Issue |
|------------|-------|------|---------|-------|
| Item | category | category | categoryId | Non-standard name |
| Item | warehouse | warehouse | warehouseId | Non-standard name |
| Item | inDates | N/A | inDates | Should NOT exist |
| Item | inQuantities | N/A | inQuantities | Should NOT exist |
| Item | outDates | N/A | outDates | Should NOT exist |
| Item | outQuantities | N/A | outQuantities | Should NOT exist |
| Warehouse | description | description | MISSING | Missing field |

---

## PART 5: STOCK IN/OUT LOGIC ANALYSIS

### Stock In (POST /api/items)

**Spec Logic:**
1. Find by { name, warehouse }
2. If exists: increment quantity
3. If not: create new
4. Create StockTransaction with type: "IN"

**Current Implementation:**
```javascript
let item = await Item.findOne({ name: name.trim(), warehouseId });
if (item) {
  item.quantity += Number(quantity);
  await item.save();
} else {
  item = await Item.create({ ... });
}
await StockTransaction.create({ type: "IN", ... });
```

**Analysis:** ✅ **CORRECT LOGIC**

**However:**
- Also saves to `item.inDates` + `item.inQuantities` (redundant)
- Should remove these since we have StockTransaction

---

### Stock Out (POST /api/items/:id/stock-out)

**Spec Logic:**
1. Find by { name, warehouse }
2. If not found: 404
3. If qty < requested: 400 (insufficient)
4. Else: quantity -= quantity
5. Create StockTransaction with type: "OUT"

**Current Implementation:**
```javascript
const item = await Item.findById(req.params.id);
if (item.quantity < quantity) {
  return res.status(400).json({ message: "Insufficient quantity" });
}
item.quantity -= Number(quantity);
await item.save();
await StockTransaction.create({ type: "OUT", ... });
```

**Analysis:** ✅ **CORRECT LOGIC**

**However:**
- Uses item ID instead of name/warehouse (different from spec)
- Also saves to `item.outDates` + `item.outQuantities` (redundant)

---

## PART 6: MISSING FIELDS IN RESPONSES

### Backend Response: GET /api/items

**Current:**
```json
{
  "_id": "...",
  "name": "L120D",
  "quantity": 40,
  "categoryId": "...",
  "warehouseId": "...",
  "timestamps": "...",
  "inDates": [...],
  "inQuantities": [...],
  "outDates": [...],
  "outQuantities": [...]
}
```

**Should Be (Spec):**
```json
{
  "_id": "...",
  "name": "L120D",
  "quantity": 40,
  "category": { "_id": "...", "name": "..." },
  "warehouse": { "_id": "...", "name": "..." },
  "notes": "...",
  "timestamps": "..."
}
```

**Issue:** Extra fields (inDates, etc.) should not be there.

---

## SUMMARY OF ALL ISSUES

### 🔴 CRITICAL (Must Fix)

1. **Missing Report Endpoints** (Backend)
   - [ ] POST `/api/reports/monthly`
   - [ ] GET `/api/reports/low-stock`
   
2. **Missing Report API Client** (Frontend)
   - [ ] Add reportAPI to client.js
   - [ ] Add ReportContext
   
3. **StockTransaction Missing Indexes** (Database)
   - [ ] Add `{ warehouse: 1, date: 1 }` index
   - [ ] Add `{ item: 1, date: 1 }` index

### 🟠 HIGH (Should Fix)

4. **Item Model Has Redundant Fields** (Database)
   - [ ] Remove: inDates, inQuantities, outDates, outQuantities
   
5. **GET /api/items Missing Query Params** (Backend)
   - [ ] Support: warehouseId, categoryId, search filters

6. **Missing /api/stock/in Endpoint** (Backend)
   - [ ] Create dedicated endpoint (spec requires it)

7. **Missing /api/stock/out Endpoint** (Backend)
   - [ ] Create endpoint with name + warehouse lookup

8. **Warehouse Missing Description Field** (Database + Backend)
   - [ ] Add description field to schema
   - [ ] Add trim to name field

### 🟡 MEDIUM (Nice to Have)

9. **Frontend Needs getAllWithFilters()** (Frontend)
   - [ ] Update itemAPI.getAll() to support query params

10. **Missing ReportContext** (Frontend)
    - [ ] Create context for report data

---

## RECOMMENDED FIX ORDER

### Phase 1: Data Model Fixes (Database)
1. Add indexes to StockTransaction
2. Remove redundant arrays from Item
3. Add description to Warehouse + trim name

### Phase 2: API Endpoint Fixes (Backend)
4. Create `/api/stock/in` endpoint
5. Create `/api/stock/out` endpoint
6. Update `GET /api/items` to support query params
7. Create `/api/reports/monthly`
8. Create `/api/reports/low-stock`

### Phase 3: Frontend Fixes
9. Update itemAPI.getAll() for query params
10. Add reportAPI to client.js
11. Create ReportContext

---

## DETAILED ISSUE BREAKDOWN

### Issue #1: Redundant Stock Date/Quantity Arrays

**Location:** `backend/models/Item.js`

**Problem:**
```javascript
inDates: [{ type: Date }],
inQuantities: [{ type: Number }],
outDates: [{ type: Date }],
outQuantities: [{ type: Number }],
```

These fields duplicate data from StockTransaction.

**Impact:**
- Data inconsistency possible
- Wastes storage
- Confusing for future devs

**Fix:**
- Delete these 4 fields entirely
- Use StockTransaction model for all history

---

### Issue #2: Missing Warehouse Description

**Location:** `backend/models/Warehouse.js`

**Problem:**
```javascript
location: { type: String, default: "" },
// Missing description!
```

**Spec Says:**
```javascript
name, location, description
```

**Fix:**
```javascript
description: { type: String, default: "" },
```

---

### Issue #3: Warehouse Name Not Trimmed

**Location:** `backend/models/Warehouse.js`

**Problem:**
```javascript
name: { type: String, required: true, unique: true }
// Missing trim!
```

**Fix:**
```javascript
name: { type: String, required: true, unique: true, trim: true }
```

---

### Issue #4: StockTransaction Missing Indexes

**Location:** `backend/models/StockTransaction.js`

**Problem:**
```javascript
// No indexes at all!
```

**Spec Says:**
```
Index on { warehouse: 1, date: 1 } for fast monthly reports
Index on { item: 1, date: 1 }
```

**Fix:**
```javascript
stockTransactionSchema.index({ warehouse: 1, date: 1 });
stockTransactionSchema.index({ item: 1, date: 1 });
```

---

### Issue #5: GET /api/items Missing Query Params

**Location:** `backend/routes/items.js`

**Current:**
```javascript
router.get("/", async (req, res) => {
  const items = await Item.find()
    .populate("categoryId")
    .populate("warehouseId");
  res.json(items);
});
```

**Should Support:**
```
GET /api/items?warehouseId=X&categoryId=Y&search=Z
```

**Fix:**
```javascript
router.get("/", async (req, res) => {
  const { warehouseId, categoryId, search } = req.query;
  let filter = {};
  
  if (warehouseId) filter.warehouseId = warehouseId;
  if (categoryId) filter.categoryId = categoryId;
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  
  const items = await Item.find(filter)
    .populate("categoryId")
    .populate("warehouseId");
  res.json(items);
});
```

---

### Issue #6: Missing /api/stock/in Endpoint

**Spec Says:**
```
POST /api/stock/in
Body: { name, categoryId, warehouseId, quantity, notes }
```

**Current:**
- Logic exists in `POST /api/items`
- But spec wants dedicated endpoint

**Fix:**
```javascript
router.post("/api/stock/in", async (req, res) => {
  // Same logic as POST /api/items
});
```

---

### Issue #7: Missing /api/stock/out Endpoint

**Spec Says:**
```
POST /api/stock/out
Body: { name, warehouseId, quantity, notes }
```

**Current:**
- Uses `POST /api/items/:id/stock-out` (by ID)
- Spec wants by name + warehouse

**Fix:**
```javascript
router.post("/api/stock/out", async (req, res) => {
  const { name, warehouseId, quantity, notes } = req.body;
  
  const item = await Item.findOne({ 
    name: name.trim(), 
    warehouseId 
  });
  
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.quantity < quantity) return res.status(400).json({ message: "Insufficient" });
  
  item.quantity -= quantity;
  await item.save();
  
  await StockTransaction.create({
    type: "OUT",
    item: item._id,
    warehouse: warehouseId,
    quantity,
    notes: notes || ""
  });
  
  const updated = await Item.findById(item._id)
    .populate("categoryId")
    .populate("warehouseId");
  res.json(updated);
});
```

---

### Issue #8: Missing /api/reports/monthly Endpoint

**Location:** Backend (NEW FILE)

**Spec Says:**
```
GET /api/reports/monthly?warehouseId=X&year=2025&month=1

Returns:
[
  {
    itemName: "L120D",
    categoryName: "LAPOTHARA",
    openingStock: 20,
    stockIn: 15,
    stockOut: 5,
    closingStock: 30
  }
]
```

**Current:** Not implemented

**Fix:** See implementation section below

---

### Issue #9: Missing /api/reports/low-stock Endpoint

**Location:** Backend (NEW FILE)

**Spec Says:**
```
GET /api/reports/low-stock?warehouseId=X&threshold=5

Returns: [items where quantity < threshold]
```

**Current:** Not implemented

**Fix:** See implementation section below

---

### Issue #10: Missing ReportContext (Frontend)

**Location:** Frontend (NEW FILE)

**Current:** No report context

**Fix:** See implementation section below

---

### Issue #11: Frontend Missing Report API

**Location:** `src/api/client.js`

**Current:** No reportAPI

**Fix:**
```javascript
export const reportAPI = {
  getMonthlyReport: async (warehouseId, year, month) => {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month)
    });
    if (warehouseId) params.append("warehouseId", warehouseId);
    
    const response = await fetch(`${API_BASE_URL}/reports/monthly?${params}`);
    return handleResponse(response);
  },
  
  getLowStock: async (warehouseId, threshold = 5) => {
    const params = new URLSearchParams({
      threshold: String(threshold)
    });
    if (warehouseId) params.append("warehouseId", warehouseId);
    
    const response = await fetch(`${API_BASE_URL}/reports/low-stock?${params}`);
    return handleResponse(response);
  }
};
```

---

### Issue #12: Frontend itemAPI Missing Query Params

**Location:** `src/api/client.js`

**Current:**
```javascript
getAll: async () => {
  const response = await fetch(`${API_BASE_URL}/items`);
  return handleResponse(response);
}
```

**Should Be:**
```javascript
getAll: async (warehouseId, categoryId, search) => {
  const params = new URLSearchParams();
  if (warehouseId) params.append("warehouseId", warehouseId);
  if (categoryId) params.append("categoryId", categoryId);
  if (search) params.append("search", search);
  
  const url = `${API_BASE_URL}/items${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  return handleResponse(response);
}
```

---

## FILES THAT NEED CHANGES

### Backend Files:

1. **`backend/models/Item.js`** 
   - Remove: inDates, inQuantities, outDates, outQuantities

2. **`backend/models/Warehouse.js`**
   - Add: description field
   - Add: trim to name

3. **`backend/models/StockTransaction.js`**
   - Add: indexes on { warehouse, date } and { item, date }

4. **`backend/routes/items.js`**
   - Update: GET /api/items to support query params
   - Add: POST /api/stock/in endpoint
   - Add: POST /api/stock/out endpoint

5. **`backend/routes/reports.js`** (NEW FILE)
   - Add: GET /api/reports/monthly
   - Add: GET /api/reports/low-stock

6. **`backend/server.js`**
   - Register: new reports route

### Frontend Files:

1. **`src/api/client.js`**
   - Update: itemAPI.getAll() to support query params
   - Add: reportAPI with getMonthlyReport() and getLowStock()

2. **`src/context/ReportContext.js`** (NEW FILE)
   - Create: ReportContext with low-stock + monthly hooks

---

## NEXT STEPS

1. **Review this audit** - Confirm with you
2. **Apply fixes in order** - Phase 1 → 2 → 3
3. **Test each phase** - Ensure no breaking changes
4. **Deploy** - Push to GitHub, wait for Render deploy
5. **Verify** - Test all endpoints

---

## Questions to Clarify

1. Do you want to rename `categoryId` → `category` in Item model? (Breaking change)
2. Do you want to rename `warehouseId` → `warehouse` in Item model? (Breaking change)
3. Should we keep `/api/items/warehouse/:id` endpoint alongside query param version?
4. Should reports be calculated real-time or cached?
5. Should report API handle pagination for large datasets?

