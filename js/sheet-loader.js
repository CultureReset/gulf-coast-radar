// Gulf Coast Radar - Google Sheets Data Loader
// Fetches all data from Google Sheets via Google Apps Script API

class SheetLoader {
  constructor() {
    // IMPORTANT: Replace this URL with your Google Apps Script web app URL
    // Get this URL from: Extensions > Apps Script > Deploy > Web app URL
    this.GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

    // Cache settings
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.cache = {};
    this.cacheTimestamps = {};

    // Data storage
    this.businesses = [];
    this.events = [];
    this.calendar = [];
    this.social = [];
    this.beach = null;
    this.arHunts = [];

    this.loaded = false;
    this.loadPromise = null;
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(key) {
    if (!this.cacheTimestamps[key]) return false;
    const age = Date.now() - this.cacheTimestamps[key];
    return age < this.CACHE_DURATION;
  }

  /**
   * Set cache
   */
  setCache(key, data) {
    this.cache[key] = data;
    this.cacheTimestamps[key] = Date.now();
  }

  /**
   * Get cache
   */
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache[key];
    }
    return null;
  }

  /**
   * Load all data from Google Sheets
   */
  async loadAllData() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadData();
    return this.loadPromise;
  }

  /**
   * Internal load function
   */
  async _loadData() {
    try {
      // Check if URL is configured
      if (this.GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.warn('⚠️ Google Sheets not configured. Using local data files.');
        return this.loadFallbackData();
      }

      // Check cache first
      const cachedData = this.getCache('allData');
      if (cachedData) {
        console.log('✅ Loaded data from cache');
        this.populateData(cachedData);
        return;
      }

      console.log('📊 Loading data from Google Sheets...');

      // Fetch all data at once
      const response = await fetch(`${this.GOOGLE_APPS_SCRIPT_URL}?sheet=all`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Cache the data
      this.setCache('allData', data);

      // Populate internal storage
      this.populateData(data);

      this.loaded = true;
      console.log(`✅ Loaded from Google Sheets:
        - ${this.businesses.length} businesses
        - ${this.events.length} events
        - ${this.calendar.length} calendar events
        - ${this.social.length} social posts
        - ${this.arHunts.length} AR hunts`);

      // Dispatch loaded event
      window.dispatchEvent(new CustomEvent('sheetsDataLoaded', {
        detail: {
          businesses: this.businesses,
          events: this.events,
          calendar: this.calendar,
          social: this.social,
          beach: this.beach,
          arHunts: this.arHunts
        }
      }));

    } catch (error) {
      console.error('❌ Error loading from Google Sheets:', error);
      console.log('🔄 Falling back to local data files...');
      await this.loadFallbackData();
    }
  }

  /**
   * Populate internal data from fetched data
   */
  populateData(data) {
    this.businesses = data.businesses || [];
    this.events = data.events || [];
    this.calendar = data.calendar || [];
    this.social = data.social || [];
    this.beach = data.beach || null;
    this.arHunts = data.arhunts || [];
  }

  /**
   * Fallback to local JSON files if Google Sheets fails
   */
  async loadFallbackData() {
    try {
      // Load businesses
      const businessIds = ['the-hangout', 'the-gulf-restaurant', 'cobalt', 'gts-on-the-bay', 'sea-n-suds', 'lulus-gulf-shores'];
      const businessPromises = businessIds.map(id =>
        fetch(`/data/businesses/${id}.json`)
          .then(r => r.json())
          .catch(() => null)
      );
      this.businesses = (await Promise.all(businessPromises)).filter(b => b !== null);

      // Merge with legacy data.js if window.businesses exists
      if (window.businesses && Array.isArray(window.businesses)) {
        this.businesses = [...this.businesses, ...window.businesses];
      }

      // Load events using existing event-loader
      if (window.eventLoader) {
        await window.eventLoader.loadAllEvents();
        this.events = window.eventLoader.getEvents();
      }

      // Load calendar
      if (window.calendarData && Array.isArray(window.calendarData)) {
        this.calendar = window.calendarData;
      }

      // Load social
      if (window.socialFeedData && Array.isArray(window.socialFeedData)) {
        this.social = window.socialFeedData;
      }

      this.loaded = true;
      console.log(`✅ Loaded from local files:
        - ${this.businesses.length} businesses
        - ${this.events.length} events`);

      window.dispatchEvent(new CustomEvent('sheetsDataLoaded', {
        detail: {
          businesses: this.businesses,
          events: this.events,
          calendar: this.calendar,
          social: this.social
        }
      }));

    } catch (error) {
      console.error('❌ Error loading fallback data:', error);
    }
  }

  /**
   * Get all businesses
   */
  getBusinesses() {
    return this.businesses;
  }

  /**
   * Get business by ID
   */
  getBusinessById(id) {
    return this.businesses.find(b => b.id === id);
  }

  /**
   * Get businesses by category
   */
  getBusinessesByCategory(category) {
    return this.businesses.filter(b => b.category === category);
  }

  /**
   * Get businesses by location
   */
  getBusinessesByLocation(location) {
    return this.businesses.filter(b => b.location === location);
  }

  /**
   * Get businesses by tag
   */
  getBusinessesByTag(tag) {
    return this.businesses.filter(b =>
      b.tags && b.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  /**
   * Search businesses
   */
  searchBusinesses(query) {
    const lowerQuery = query.toLowerCase();
    return this.businesses.filter(b => {
      if (b.name.toLowerCase().includes(lowerQuery)) return true;
      if (b.description && b.description.toLowerCase().includes(lowerQuery)) return true;
      if (b.cuisine && b.cuisine.toLowerCase().includes(lowerQuery)) return true;
      if (b.tags && b.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
      return false;
    });
  }

  /**
   * Get all events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Get event by ID
   */
  getEventById(id) {
    return this.events.find(e => e.id === id);
  }

  /**
   * Get events by business
   */
  getEventsByBusiness(businessId) {
    return this.events.filter(e => e.businessId === businessId);
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category) {
    return this.events.filter(e => e.category === category);
  }

  /**
   * Get events by date
   */
  getEventsByDate(date) {
    return this.events.filter(e => {
      if (e.recurring) {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return e.daysOfWeek && e.daysOfWeek.includes(dayName);
      } else {
        return e.date === date;
      }
    });
  }

  /**
   * Get calendar events
   */
  getCalendarEvents() {
    return this.calendar;
  }

  /**
   * Get calendar events by date range
   */
  getCalendarEventsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.calendar.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= start && eventDate <= end;
    });
  }

  /**
   * Get social posts
   */
  getSocialPosts() {
    return this.social;
  }

  /**
   * Get social posts by business
   */
  getSocialPostsByBusiness(businessId) {
    return this.social.filter(p => p.businessId === businessId);
  }

  /**
   * Get beach conditions
   */
  getBeachConditions() {
    return this.beach;
  }

  /**
   * Get AR hunts
   */
  getARHunts() {
    return this.arHunts;
  }

  /**
   * Get active AR hunts
   */
  getActiveARHunts() {
    return this.arHunts.filter(h => h.active === true);
  }

  /**
   * Get AR hunt by ID
   */
  getARHuntById(id) {
    return this.arHunts.find(h => h.id === id);
  }

  /**
   * Reload data from Google Sheets (bypass cache)
   */
  async reload() {
    this.cache = {};
    this.cacheTimestamps = {};
    this.loadPromise = null;
    this.loaded = false;
    return await this.loadAllData();
  }
}

// Create global instance
window.sheetLoader = new SheetLoader();

// Auto-load on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sheetLoader.loadAllData();
  });
} else {
  window.sheetLoader.loadAllData();
}

// Listen for sheets data loaded event and update legacy global variables
window.addEventListener('sheetsDataLoaded', (event) => {
  // Update legacy global arrays for backward compatibility
  if (event.detail.businesses) {
    window.businesses = event.detail.businesses;
  }
  if (event.detail.events) {
    window.gulfCoastEvents = event.detail.events;
  }
  if (event.detail.calendar) {
    window.calendarData = event.detail.calendar;
  }
  if (event.detail.social) {
    window.socialFeedData = event.detail.social;
  }

  console.log('✅ Global data variables updated for backward compatibility');
});
