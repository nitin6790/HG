// Patch Metro files to add URL.canParse polyfill
const fs = require('fs');
const path = require('path');

const polyfillCode = `
// Polyfill for URL.canParse (Node.js < 18.17.0)
if (typeof URL !== 'undefined' && typeof URL.canParse === 'undefined') {
  URL.canParse = function(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch (e) {
      return false;
    }
  };
}
`;

function patchFile(filePath) {
  try {
    const fullPath = path.join(__dirname, 'node_modules', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already patched
    if (content.includes('// Polyfill for URL.canParse')) {
      console.log(`Already patched: ${filePath}`);
      return true;
    }
    
    // Add polyfill at the top of the file
    content = polyfillCode + '\n' + content;
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Patched: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error.message);
    return false;
  }
}

// Patch the Metro files
const filesToPatch = [
  'metro/src/lib/parseBundleOptionsFromBundleRequestUrl.js',
  'metro/src/Server.js'
];

console.log('Patching Metro files for URL.canParse polyfill...');
filesToPatch.forEach(patchFile);
console.log('Done!');

