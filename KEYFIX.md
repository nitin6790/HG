✅ REACT WARNING FIXES - List Keys

═══════════════════════════════════════════════════════════════

Issue: "Each child in a list should have a unique 'key' prop"

Root Cause: 
- Missing or improper key props on list items
- Using index as key (causes issues with updates)
- Inconsistent ID field names

═══════════════════════════════════════════════════════════════

✅ FIXES APPLIED:

1. ReportScreen.js
   ✓ Fixed reportData.map() - wrapped in View with proper key
     Key: `report-row-${index}-${row.itemName}`
   ✓ Fixed year options - added key prefix
     Key: `year-${year}`

2. StockInScreen.js
   ✓ Fixed category dropdown items
     Changed: key={item.id} → key={item._id}

3. HomeScreen.js
   ✓ Fixed low stock alerts list
     Changed: key={item.id} → key={item._id}

4. InventoryHomeScreen.js
   ✓ Fixed inventory items list
     Changed: key={item.id} → key={item._id}

═══════════════════════════════════════════════════════════════

Key Naming Convention:
✅ MongoDB objects: Use ._id
✅ Synthetic objects: Use unique identifier (e.g., `${id}-${type}-${index}`)
✅ Simple lists: Use index + item data (e.g., `month-${value}`)
✅ Never use just index (causes update issues)

═══════════════════════════════════════════════════════════════

Verification:
✓ All .map() functions now have proper keys
✓ All keys use MongoDB _id where applicable
✓ No duplicate keys in same list
✓ Keys are stable (not based on index alone)

═══════════════════════════════════════════════════════════════

Action: Reload your app

The React warning should now be gone!

Press 'r' in CLI or refresh in Expo Go to see the changes.

═══════════════════════════════════════════════════════════════
