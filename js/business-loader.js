// GCR Business Loader
// Loads businesses from Google Sheets via API

let allBusinesses = [];
let isLoading = false;
let loadError = null;

// Load businesses from API
async function loadBusinesses() {
  if (isLoading) {
    console.log('Already loading businesses...');
    return;
  }

  isLoading = true;
  console.log('Loading businesses from Google Sheets API...');

  try {
    const response = await fetch('http://localhost:3002/api/businesses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.businesses)) {
      // Transform data to match expected field names
      allBusinesses = data.businesses.map(b => ({
        ...b,
        name: b.name || b.business_name,
        business_id: b.business_id || b.id
      }));
      console.log(`✅ Loaded ${allBusinesses.length} businesses from ${data.source || 'API'}`);

      // Trigger any callbacks waiting for data
      if (window.onBusinessesLoaded) {
        window.onBusinessesLoaded(allBusinesses);
      }

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('businessesLoaded', {
        detail: { businesses: allBusinesses, source: data.source }
      }));

      // Also dispatch allBusinessesUpdated for compatibility
      window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
        detail: { businesses: allBusinesses, source: data.source }
      }));

      return allBusinesses;
    } else {
      throw new Error(data.error || 'Failed to load businesses');
    }

  } catch (error) {
    console.error('Error loading businesses:', error);
    loadError = error.message;

    // Try to load from fallback if available
    if (window.fallbackBusinesses && Array.isArray(window.fallbackBusinesses)) {
      console.warn('⚠️ Using fallback business data');
      allBusinesses = window.fallbackBusinesses;
      window.allBusinesses = allBusinesses;

      // Dispatch events for fallback data
      window.dispatchEvent(new CustomEvent('businessesLoaded', {
        detail: { businesses: allBusinesses, source: 'fallback' }
      }));
      window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
        detail: { businesses: allBusinesses, source: 'fallback' }
      }));

      return allBusinesses;
    }

    throw error;
  } finally {
    isLoading = false;
  }
}

// Auto-load on script load
loadBusinesses()
  .then(() => {
    console.log('Business data ready');
  })
  .catch(error => {
    console.warn('Failed to load business data:', error);
    // Check fallback one more time before giving up
    if (window.fallbackBusinesses && Array.isArray(window.fallbackBusinesses)) {
      console.warn('⚠️ Using fallback business data from catch block');
      allBusinesses = window.fallbackBusinesses;
      window.allBusinesses = allBusinesses;

      // Dispatch events for fallback data
      window.dispatchEvent(new CustomEvent('businessesLoaded', {
        detail: { businesses: allBusinesses, source: 'fallback' }
      }));
      window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
        detail: { businesses: allBusinesses, source: 'fallback' }
      }));
    } else {
      // Set empty array so page can still function
      allBusinesses = [];
      window.allBusinesses = allBusinesses;
    }
  });

// Expose globally
window.allBusinesses = allBusinesses;
window.loadBusinesses = loadBusinesses;

// Make allBusinesses reactive
Object.defineProperty(window, 'allBusinesses', {
  get: function() { return allBusinesses; },
  set: function(val) { allBusinesses = val; }
});

// Compatibility: loadMasterData function for pages that expect it
window.loadMasterData = async function() {
  if (allBusinesses.length > 0) {
    return { businesses: allBusinesses };
  }
  await loadBusinesses();
  return { businesses: allBusinesses };
};
