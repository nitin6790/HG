# Blocks Module

The Blocks module is a separate feature module within the HSG Inventory application.

## Structure

```
src/modules/blocks/
├── screens/
│   └── BlocksHomeScreen.js     # Main Blocks placeholder screen
├── context/                     # Future: Context providers for Blocks state
├── navigation/
│   └── BlocksStackNavigator.js  # Stack navigator for Blocks module
└── README.md                    # This file
```

## Current Status

This module is currently a placeholder showing "Coming Soon" message. It's ready for expansion with future features.

## Features

- Dedicated module folder structure for scalability
- Placeholder screen with friendly UI
- Integrated navigation stack
- Ready for feature development

## Navigation

Access from Home Screen → "Modules" section → "Blocks" button

## Future Development

To add features to this module:

1. Create new screens in `screens/` folder
2. Add routes to `BlocksStackNavigator.js`
3. Create context providers in `context/` folder if needed
4. Update imports in main navigation

## Integration

- Imported in: `navigation/DrawerNavigator.js`
- Accessible via: `navigation.navigate('BlocksModule')`
