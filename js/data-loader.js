/**
 * Data Loader - Sync system for GCR and CyberCheck
 *
 * This file ensures both platforms read from the same data source.
 * Priority order:
 * 1. localStorage (edited data from CyberCheck)
 * 2. data.js (original data)
 *
 * When businesses edit their profile in CyberCheck, changes are saved to localStorage.
 * GCR reads from localStorage first, so edits appear immediately on tourist-facing profiles.
 */

(function() {
  const STORAGE_KEY = 'gcr_business_data';

  // Check if we have data in localStorage
  const storedData = localStorage.getItem(STORAGE_KEY);

  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);

      // Only use localStorage if it has reasonable data
      // Check if localStorage has services data (should have businesses from multiple categories)
      const categories = new Set(parsedData.map(b => b.category));
      const hasServicesCategory = parsedData.some(b => b.category === 'services');
      const currentCategories = new Set(allBusinesses.map(b => b.category));
      const currentHasServices = allBusinesses.some(b => b.category === 'services');

      // If current allBusinesses has more categories than localStorage, use current
      if (currentCategories.size > categories.size || (currentHasServices && !hasServicesCategory)) {
        console.log('📡 Current data is more complete than localStorage, updating storage');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allBusinesses));
      } else {
        // Use localStorage data
        window.allBusinesses = parsedData;
        console.log('📡 Loaded business data from localStorage (CyberCheck edits active)', parsedData.length, 'businesses');
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      // Fall back to current allBusinesses
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allBusinesses));
      console.log('📡 Using current allBusinesses data');
    }
  } else {
    // First load - initialize localStorage with current allBusinesses
    if (typeof allBusinesses !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allBusinesses));
      console.log('📡 Initialized localStorage with', allBusinesses.length, 'businesses');
    }
  }

  // Provide helper functions globally
  window.gcrDataLoader = {
    // Get all businesses (from localStorage or fallback)
    getAllBusinesses: function() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return typeof allBusinesses !== 'undefined' ? allBusinesses : [];
        }
      }
      return typeof allBusinesses !== 'undefined' ? allBusinesses : [];
    },

    // Get single business by ID
    getBusinessById: function(id) {
      const businesses = this.getAllBusinesses();
      return businesses.find(b => b.id === id);
    },

    // Update business (used by CyberCheck)
    updateBusiness: function(id, updates) {
      const businesses = this.getAllBusinesses();
      const index = businesses.findIndex(b => b.id === id);

      if (index !== -1) {
        businesses[index] = { ...businesses[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));

        // Update global variable for immediate effect
        if (typeof window !== 'undefined') {
          window.allBusinesses = businesses;
        }

        console.log('✅ Business updated:', id);
        return true;
      }
      return false;
    },

    // Reset to original data (admin only)
    resetData: function() {
      if (confirm('⚠️ This will reset all business data to original values. Are you sure?')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    },

    // Get sync status
    getSyncStatus: function() {
      const stored = localStorage.getItem(STORAGE_KEY);
      return {
        hasSyncedData: !!stored,
        lastModified: stored ? 'User modified' : 'Original data',
        businessCount: this.getAllBusinesses().length
      };
    }
  };

  // Log sync status
  console.log('🔄 Data Loader Status:', window.gcrDataLoader.getSyncStatus());
})();
