/**
 * Data Loader - Supabase API Integration
 *
 * Fetches business data from Supabase backend API
 * Priority order:
 * 1. Supabase API (production database)
 * 2. localStorage (cache/offline fallback)
 */

(function() {
  const STORAGE_KEY = 'gcr_business_data';
  const API_URL = typeof CONFIG !== 'undefined' && CONFIG.API
    ? CONFIG.API.GCR_BASE_URL
    : (window.location.hostname === 'localhost'
      ? 'http://localhost:3002/api'
      : 'https://api.gulfcoastradar.com/api');

  console.log('📡 Data Loader initialized - API:', API_URL);

  // Global data loader object
  window.gcrDataLoader = {
    businesses: [],
    loading: false,
    lastFetch: null,

    /**
     * Fetch businesses from Supabase API
     */
    async fetchFromAPI() {
      console.log('🔄 Fetching businesses from Supabase API...');
      this.loading = true;

      try {
        const response = await fetch(`${API_URL}/businesses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const businesses = data.businesses || data.data || data;

        if (!Array.isArray(businesses)) {
          throw new Error('API did not return an array of businesses');
        }

        console.log(`✅ Fetched ${businesses.length} businesses from Supabase`);

        // Save to localStorage as cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        this.businesses = businesses;
        this.lastFetch = new Date().toISOString();
        this.loading = false;

        // Update global variable
        window.allBusinesses = businesses;

        // Dispatch event for pages to reload
        window.dispatchEvent(new CustomEvent('allBusinessesUpdated', { detail: { count: businesses.length } }));

        return businesses;

      } catch (error) {
        console.error('❌ Failed to fetch from Supabase:', error);
        this.loading = false;

        // Fall back to localStorage
        const cached = this.loadFromLocalStorage();
        if (cached && cached.length > 0) {
          console.log(`⚠️ Using cached data (${cached.length} businesses)`);
          this.businesses = cached;
          window.allBusinesses = cached;
          return cached;
        }

        console.error('❌ No cached data available!');
        this.businesses = [];
        window.allBusinesses = [];
        return [];
      }
    },

    /**
     * Load from localStorage (cache fallback)
     */
    loadFromLocalStorage() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const businesses = JSON.parse(stored);
          console.log(`📦 Loaded ${businesses.length} businesses from localStorage cache`);
          return businesses;
        } catch (e) {
          console.error('Failed to parse localStorage data:', e);
          return [];
        }
      }
      return [];
    },

    /**
     * Get all businesses (sync method with cache)
     */
    getAllBusinesses() {
      if (this.businesses.length > 0) {
        return this.businesses;
      }

      // Try cache first
      const cached = this.loadFromLocalStorage();
      if (cached && cached.length > 0) {
        this.businesses = cached;
        window.allBusinesses = cached;
        return cached;
      }

      // If no cache, fetch async
      this.fetchFromAPI();
      return [];
    },

    /**
     * Get single business by ID
     */
    getBusinessById(id) {
      const businesses = this.getAllBusinesses();
      return businesses.find(b => b.id === id);
    },

    /**
     * Update business (saves to Supabase)
     */
    async updateBusiness(id, updates) {
      try {
        const response = await fetch(`${API_URL}/businesses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          throw new Error(`Failed to update business: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Business updated in Supabase:', id);

        // Update local cache
        const businesses = this.getAllBusinesses();
        const index = businesses.findIndex(b => b.id === id);
        if (index !== -1) {
          businesses[index] = { ...businesses[index], ...updates };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
          this.businesses = businesses;
          window.allBusinesses = businesses;
        }

        return result;

      } catch (error) {
        console.error('❌ Failed to update business:', error);
        throw error;
      }
    },

    /**
     * Save all businesses to Supabase (CSV import, bulk updates)
     */
    async saveAllBusinesses(businesses) {
      try {
        const response = await fetch(`${API_URL}/businesses/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ businesses })
        });

        if (!response.ok) {
          throw new Error(`Failed to save businesses: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ Saved ${businesses.length} businesses to Supabase`);

        // Update local cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        this.businesses = businesses;
        window.allBusinesses = businesses;

        // Notify pages to reload
        window.dispatchEvent(new CustomEvent('allBusinessesUpdated', { detail: { count: businesses.length } }));

        return result;

      } catch (error) {
        console.error('❌ Failed to save businesses to Supabase:', error);

        // Save to localStorage anyway as fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        this.businesses = businesses;
        window.allBusinesses = businesses;
        console.log('⚠️ Saved to localStorage only (offline mode)');

        throw error;
      }
    },

    /**
     * Clear cache and reload from API
     */
    async refresh() {
      console.log('🔄 Refreshing data from Supabase...');
      localStorage.removeItem(STORAGE_KEY);
      this.businesses = [];
      await this.fetchFromAPI();
    },

    /**
     * Get sync status
     */
    getSyncStatus() {
      return {
        apiUrl: API_URL,
        hasCachedData: this.businesses.length > 0 || !!localStorage.getItem(STORAGE_KEY),
        lastFetch: this.lastFetch,
        businessCount: this.businesses.length,
        loading: this.loading
      };
    }
  };

  // Initialize with cached data OR fallback to data.js
  const cached = window.gcrDataLoader.loadFromLocalStorage();
  if (cached && cached.length > 0) {
    window.gcrDataLoader.businesses = cached;
    window.allBusinesses = cached;
    console.log('📦 Initialized with cached data:', cached.length, 'businesses');
    window.dispatchEvent(new CustomEvent('allBusinessesUpdated', { detail: { count: cached.length } }));
  } else if (typeof businessData !== 'undefined' && businessData.length > 0) {
    // Fallback to data.js if no cache
    window.gcrDataLoader.businesses = businessData;
    window.allBusinesses = businessData;
    console.log('📦 Using fallback data.js:', businessData.length, 'businesses');
    window.dispatchEvent(new CustomEvent('allBusinessesUpdated', { detail: { count: businessData.length } }));
  }

  // Fetch from API in background (async, non-blocking)
  setTimeout(() => {
    window.gcrDataLoader.fetchFromAPI().then(() => {
      console.log('🔄 Data Loader Status:', window.gcrDataLoader.getSyncStatus());
    }).catch(err => {
      console.warn('⚠️ Could not fetch from API, using fallback data:', err);
      // If API fetch fails and we have no data, use data.js
      if (window.gcrDataLoader.businesses.length === 0 && typeof businessData !== 'undefined') {
        window.gcrDataLoader.businesses = businessData;
        window.allBusinesses = businessData;
        console.log('📦 API failed, using fallback data.js:', businessData.length, 'businesses');
        window.dispatchEvent(new CustomEvent('allBusinessesUpdated', { detail: { count: businessData.length } }));
      }
    });
  }, 100);

})();
