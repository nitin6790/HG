# HSG Inventory - Navigation Structure

## Overview

The application now follows a clear hierarchical navigation structure with HSG as the main entry point.

## Navigation Hierarchy

```
HSG HOME SCREEN (Main)
│
├─ BLOCK DETAILS
│  │
│  └─ Blocks Module
│     └─ Coming Soon Placeholder
│
└─ INVENTORY
   │
   ├─ Quick Navigation
   │  ├─ Warehouses
   │  ├─ Reports
   │  └─ Settings
   │
   └─ Low Stock Alerts
      └─ Shows items with quantity below threshold
```

## File Structure

```
screens/
├── HSGHomeScreen.js          (NEW - Main entry point)
├── HomeScreen.js             (Legacy - kept for reference)
├── InventoryHomeScreen.js    (Inventory module home)
├── BlocksHomeScreen.js       (Block module home)
└── [other existing screens]

src/modules/blocks/
├── screens/
│  └── BlocksHomeScreen.js
├── navigation/
│  └── BlocksStackNavigator.js
├── context/
└── README.md
```

## Key Features

### HSG Home Screen (Main)
- **Block Details Section**: Card with navigation to Blocks module
- **Inventory Section**: 
  - Quick Navigation buttons (Warehouses, Reports, Settings)
  - Low Stock Alerts with count and top 5 items
  - Professional blue gradient header

### Block Details
- Navigation to BlocksStackNavigator
- Currently shows "Coming Soon" placeholder
- Ready for future feature development

### Inventory
- Access to warehouse management
- Access to reports
- Access to settings
- Real-time low stock alerts
- Shows most critical low-stock items first

## Navigation Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| Home | HSGHomeScreen | Main entry point |
| WarehouseList | WarehouseListScreen | Warehouse management |
| Reports | ReportScreen | Stock reports |
| Settings | SettingsScreen | App settings |
| BlocksModule | BlocksStackNavigator | Block management |
| InventoryHome | InventoryHomeScreen | Inventory overview |

## Color Scheme

- **HSG Header**: Gray with blue accents
- **Block Details**: Purple gradient background
- **Inventory Section**: Blue gradient header
- **Low Stock Alerts**: Yellow/Orange warning theme

## State Management

- Items context for inventory data
- Category context for item classification
- Warehouse context for location management

All low stock calculations are based on:
- Single Segment items: threshold < 100
- Multi Segment items: threshold < 100
- All other items: threshold < 5
