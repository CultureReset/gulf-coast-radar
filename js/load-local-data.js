/**
 * Load data from local JSON file instead of Google Sheets
 * This ensures data loads even when Google Sheets URLs expire
 */

console.log('📊 Loading data from local JSON...');

// Create global loader object that matches the Google Sheets loader API
window.googleSheetsLoader = {
  urls: {},

  setURLs: function(urlConfig) {
    this.urls = urlConfig;
    console.log('📊 URLs configured (using local data)');
  },

  loadAllBusinesses: async function() {
    console.log('🚀 Loading businesses from local data file...');

    try {
      // Load from local JSON file
      const response = await fetch('/data/all-business-data.json');
      if (!response.ok) {
        throw new Error('Failed to load business data');
      }

      const data = await response.json();
      const businesses = data.businesses;

      // Set global variable
      window.allBusinesses = businesses;

      console.log(`✅ Loaded ${businesses.length} businesses from local data`);

      // Dispatch event that data is ready
      window.dispatchEvent(new CustomEvent('dataReady', {
        detail: { businesses }
      }));

      return businesses;

    } catch (error) {
      console.error('❌ Error loading businesses:', error);

      // Fallback to empty array if load fails
      window.allBusinesses = [];
      return [];
    }
  },

  autoLoad: async function() {
    console.log('🚀 Auto-loading local business data...');
    await this.loadAllBusinesses();
    console.log('✅ Data auto-loaded and ready!');
  },

  getCacheAge: function() {
    return 0; // Local data is always fresh
  }
};

// Auto-load the data
window.googleSheetsLoader.autoLoad();
