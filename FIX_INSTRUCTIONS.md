# Fix Instructions for Worklets Mismatch

## Problem
Expo Go has Worklets 0.5.1 built-in (native part), but `react-native-reanimated@4.1.5` requires Worklets 0.6.1 (JavaScript part), causing a version mismatch error.

## Root Cause
- `react-native-reanimated@~4.1.1` (installed as 4.1.5) uses `react-native-worklets-core@0.6.1`
- Expo Go SDK 54 has Worklets 0.5.1 built-in and cannot be changed
- This creates a mismatch: JavaScript 0.6.1 vs Native 0.5.1

## Solution Applied
Downgraded `react-native-reanimated` from `~4.1.1` to `~3.16.1` which uses Worklets 0.5.1 and is compatible with Expo Go.

## Commands to Run (PowerShell)

```powershell
# 1. Remove node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 2. Reinstall packages
npm install

# 3. Clear Expo cache and start
npx expo start --clear
```

## What Changed
- ✅ `react-native-reanimated`: `~4.1.1` → `~3.16.1` (uses Worklets 0.5.1, compatible with Expo Go)
- ✅ `babel.config.js`: Already correctly configured with `react-native-reanimated/plugin` as the last plugin
- ✅ All other dependencies remain compatible with Expo SDK 54

## After Running Commands
1. **Close Expo Go app completely** on your device (swipe away from recent apps)
2. **Reopen Expo Go**
3. **Scan QR code** or reload the app
4. The Worklets mismatch error should be **resolved**

## Verification
The app should now run without the Worklets error. The drawer navigation will work with react-native-reanimated 3.16.1.

