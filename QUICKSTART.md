# Quick Start - Backend Integration Testing

## 🚀 Get Started in 3 Steps

### Step 1: Start the App
```bash
cd D:\HSGI
npm start
```
Choose your platform (Android/iOS) or scan QR code with Expo Go.

### Step 2: Create Your First Warehouse
1. Tap the **navigation menu** (hamburger icon)
2. Go to **Settings** → **Warehouses**
3. Tap **+ Add Warehouse**
4. Enter:
   - Name: "Main Warehouse"
   - Location: "Building 1"
5. Tap **Create**
6. ✅ Warehouse appears immediately
7. **Close and reopen the app** - warehouse should still be there! (This means it's using the backend)

### Step 3: Add Your First Item
1. Go to **Warehouses**
2. Tap **Main Warehouse**
3. Tap **Stock In**
4. Enter:
   - Item Name: "CPU Cooler"
   - Category: "Single Segment" (auto-selected)
   - Quantity: "50"
   - Notes: "Test item"
5. Tap **Add Item**
6. ✅ Item appears in the warehouse
7. **Close and reopen the app** - item persists! (Backend working!)

---

## 🔄 Data Flow

```
React Native App
       ↓
   API Client (src/api/client.js)
       ↓
Backend API (https://hsgi-backend.onrender.com)
       ↓
MongoDB Atlas (hsgi-db)
```

---

## ✅ What's Changed

| Feature | Before | After |
|---------|--------|-------|
| Storage | Local AsyncStorage | MongoDB Cloud |
| Scale | Device only | Cloud database |
| Multi-device | ❌ No | ✅ Yes (with auth) |
| Data persistence | Reset on uninstall | Permanent in cloud |
| Reports | Local calculations | Server-backed |

---

## 🌐 Backend Status

Check if backend is running:
```
https://hsgi-backend.onrender.com/
```
Should show: `{"status": "ok"}`

---

## 📊 Test Scenarios

### Scenario 1: Create and Persist Data
- [ ] Create a warehouse
- [ ] Close and reopen app
- [ ] Verify warehouse still exists

### Scenario 2: Stock Operations
- [ ] Create an item in a warehouse
- [ ] Click "Stock Out"
- [ ] Reduce quantity
- [ ] Verify quantity updated

### Scenario 3: Reports
- [ ] Add several items to warehouse
- [ ] Go to "View Report"
- [ ] Verify opening/closing stock calculations
- [ ] Export to Excel

### Scenario 4: Multi-Warehouse
- [ ] Create 2 warehouses
- [ ] Add different items to each
- [ ] Switch between warehouses
- [ ] Verify items are separate per warehouse

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Network error" | Check internet, wait 10 sec for Render to start |
| Items not showing | Close app completely, reopen |
| API timeout | Backend may be sleeping, wait and retry |
| Categories empty | App auto-creates defaults on first run |

---

## 📝 Documentation

For detailed information, see:
- **INTEGRATION_COMPLETE.md** - Full integration guide
- **BACKEND_INTEGRATION.md** - Testing and troubleshooting
- **src/api/client.js** - API client code

---

## 💡 Pro Tips

1. **Monitor network requests**: Open React Native Debugger to see API calls
2. **Check MongoDB**: Visit MongoDB Atlas to verify data is being saved
3. **Test offline**: Turn off internet, see that forms warn you about connection
4. **Performance**: First load may take 5-10 seconds (Render spinup)

---

## 🎯 Next Steps

1. ✅ Test the integration by creating warehouses and items
2. ✅ Verify data persists by closing and reopening app
3. ✅ Test all inventory operations (Stock In, Stock Out)
4. ✅ Export reports to Excel
5. 🚀 Deploy APK when satisfied with backend behavior

---

**Backend URL**: https://hsgi-backend.onrender.com
**Database**: MongoDB Atlas (hsgi-db)
**Status**: ✅ Live and Ready
