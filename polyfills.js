// Polyfill for URL.canParse (Node.js < 18.17.0)
// This must be loaded before Metro bundler starts

(function() {
  'use strict';
  
  // Patch URL.canParse if it doesn't exist
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

  // Also patch on global object
  if (typeof global !== 'undefined' && global.URL && typeof global.URL.canParse === 'undefined') {
    global.URL.canParse = URL.canParse;
  }

  // Patch on globalThis for modern environments
  if (typeof globalThis !== 'undefined' && globalThis.URL && typeof globalThis.URL.canParse === 'undefined') {
    globalThis.URL.canParse = URL.canParse;
  }
})();
