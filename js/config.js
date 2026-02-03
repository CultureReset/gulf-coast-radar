// Gulf Coast Radar - Configuration
// Central configuration for API endpoints and environment settings

const CONFIG = {
  // Environment (development, production)
  ENV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'development'
    : 'production',

  // API Endpoints
  API: {
    // Main GCR API (business data, Supabase backend)
    GCR_BASE_URL: window.location.hostname === 'localhost'
      ? 'http://localhost:3002/api'
      : 'https://api.gulfcoastradar.com/api', // Update with your production API

    // CyberCheck API (social media integration)
    CYBERCHECK_URL: window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://cybercheckinc.com',

    // Social Feed API
    SOCIAL_FEED_URL: window.location.hostname === 'localhost'
      ? 'http://localhost:3001/api'
      : 'https://api.gulfcoastradar.com/social',
  },

  // Feature Flags
  FEATURES: {
    ENABLE_SOCIAL_FEED: true,
    ENABLE_AI_ASSISTANT: true,
    ENABLE_RESERVATIONS: true,
    ENABLE_SMS_LOYALTY: false, // Coming soon
    ENABLE_AR_HUNT: false, // Coming soon
  },

  // App Settings
  APP: {
    NAME: 'Gulf Coast Radar',
    VERSION: '1.0.0',
    DEFAULT_LOCATION: {
      lat: 30.2835,
      lng: -87.5996
    },
    SEARCH_RADIUS_MILES: 25,
    ITEMS_PER_PAGE: 20,
  },

  // Authentication
  AUTH: {
    SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
    REQUIRE_ADMIN_AUTH: true,
  },

  // Google Services (if using)
  GOOGLE: {
    MAPS_API_KEY: '', // Add your Google Maps API key
    ANALYTICS_ID: '', // Add your Google Analytics ID
  },

  // Debug Mode
  DEBUG: window.location.hostname === 'localhost',
};

// Helper functions
CONFIG.getApiUrl = function(service = 'gcr') {
  switch (service) {
    case 'gcr':
      return this.API.GCR_BASE_URL;
    case 'cybercheck':
      return this.API.CYBERCHECK_URL;
    case 'social':
      return this.API.SOCIAL_FEED_URL;
    default:
      return this.API.GCR_BASE_URL;
  }
};

CONFIG.isProduction = function() {
  return this.ENV === 'production';
};

CONFIG.isDevelopment = function() {
  return this.ENV === 'development';
};

CONFIG.log = function(...args) {
  if (this.DEBUG) {
    console.log('[GCR]', ...args);
  }
};

CONFIG.error = function(...args) {
  console.error('[GCR Error]', ...args);
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
