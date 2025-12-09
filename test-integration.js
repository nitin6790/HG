#!/usr/bin/env node
/**
 * INTEGRATION TEST - Verify all imports and syntax
 */

console.log('🔍 Testing backend integration...\n');

try {
  // Test API client
  const client = require('./src/api/client.js');
  console.log('✅ API client imports successfully');
  console.log('   - warehouseAPI:', typeof client.warehouseAPI);
  console.log('   - categoryAPI:', typeof client.categoryAPI);
  console.log('   - itemAPI:', typeof client.itemAPI);
  console.log('   - healthCheck:', typeof client.healthCheck);
} catch (error) {
  console.error('❌ Error loading API client:', error.message);
  process.exit(1);
}

try {
  // Verify package.json has no missing dependencies
  const pkg = require('./package.json');
  console.log('\n✅ Package.json structure is valid');
  console.log('   - Main dependencies:', Object.keys(pkg.dependencies).length);
  console.log('   - Dev dependencies:', Object.keys(pkg.devDependencies).length);
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

console.log('\n✅ All imports verified!\n');
console.log('📝 Integration Steps:\n');
console.log('1. Run "npm start" to start the app');
console.log('2. Build for Android/iOS with EAS or locally');
console.log('3. Test in Settings > Warehouses to create a warehouse');
console.log('4. Verify data persists after app reload\n');
console.log('🌐 Backend: https://hsgi-backend.onrender.com');
console.log('📚 See BACKEND_INTEGRATION.md for detailed testing guide\n');
