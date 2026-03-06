// GCR Business Loader
// Loads businesses DIRECTLY from Supabase — no backend server needed
// Same database as the business dashboards (Circle Boats, etc.)

const SUPABASE_URL  = 'https://mhafixflyffflwjhcgfn.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYWZpeGZseWZmZmx3amhjZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTA4MzUsImV4cCI6MjA4NzM4NjgzNX0.3KW-rGnLhJQ1u3IsSeoGFfgQpcoJNdBGFOGnhc88tHw';

let isLoading = false;
let loadError = null;

function priceSymbol(n) {
  return '$'.repeat(Math.min(Math.max(parseInt(n) || 2, 1), 4));
}

function typeToCategory(type) {
  const map = {
    restaurant: 'restaurants', bakery: 'coffee-sweets',
    rental: 'things-to-do', fishing: 'things-to-do',
    jetski: 'things-to-do', cruise: 'things-to-do',
    bigboat: 'things-to-do', kayak: 'things-to-do',
    salon: 'shopping', retail: 'shopping'
  };
  return map[type] || 'other';
}

function mapRow(row) {
  let hours = row.hours;
  if (hours && typeof hours === 'object') {
    hours = Object.entries(hours).map(([d, h]) => d.slice(0,3) + ': ' + h).join(' | ');
  }
  return {
    id:                row.id,
    business_id:       row.id,
    name:              row.name || '',
    category:          row.category || typeToCategory(row.type),
    subcategory:       row.subcategory || [],
    cuisine:           (row.subcategory || []).join(' • '),
    description:       row.description || row.about_text || '',
    address:           [row.address, row.city, row.state].filter(Boolean).join(', '),
    phone:             row.phone || '',
    website:           row.website || '',
    image:             row.image || '',
    profile_pic:       row.image || '',
    rating:            parseFloat(row.rating) || 0,
    user_ratings_total: parseInt(row.user_ratings_total) || 0,
    priceLevel:        priceSymbol(row.price_level),
    price_level:       parseInt(row.price_level) || 2,
    location:          { lat: parseFloat(row.lat) || 0, lng: parseFloat(row.lng) || 0 },
    tags:              row.tags || [],
    hours:             hours || '',
    social:            row.social_links || {},
    gallery:           row.gallery || [],
    specials:          row.specials || [],
    events:            row.events || [],
    happyHour:         row.happy_hour || {},
    happyHourSpecials: (row.happy_hour || {}).items || [],
    menu:              row.menu || []
  };
}

// Load businesses directly from Supabase gcr_directory view
async function loadBusinesses() {
  if (isLoading) return;
  isLoading = true;
  console.log('[GCR] Loading from Supabase...');

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/gcr_directory?select=*', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });

    if (!res.ok) throw new Error('Supabase ' + res.status);

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('No listed businesses');

    allBusinesses = rows.map(mapRow);
    window.allBusinesses = allBusinesses;
    console.log('[GCR] Loaded ' + allBusinesses.length + ' businesses');

    try { localStorage.setItem('gcr_biz_cache', JSON.stringify(allBusinesses)); } catch(e) {}

    if (window.onBusinessesLoaded) window.onBusinessesLoaded(allBusinesses);
    ['businessesLoaded','allBusinessesUpdated','businessDataLoaded'].forEach(evt =>
      window.dispatchEvent(new CustomEvent(evt, { detail: { businesses: allBusinesses, source: 'supabase' } }))
    );

    return allBusinesses;

  } catch (error) {
    console.warn('[GCR] Supabase load failed:', error.message);
    loadError = error.message;

    // Try localStorage cache
    try {
      const cached = JSON.parse(localStorage.getItem('gcr_biz_cache') || '[]');
      if (cached.length) {
        allBusinesses = cached;
        window.allBusinesses = allBusinesses;
        console.warn('[GCR] Using cached data (' + cached.length + ' businesses)');
        ['businessesLoaded','allBusinessesUpdated'].forEach(evt =>
          window.dispatchEvent(new CustomEvent(evt, { detail: { businesses: allBusinesses, source: 'cache' } }))
        );
        return allBusinesses;
      }
    } catch(e) {}

    allBusinesses = [];
    window.allBusinesses = [];
    return [];
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

// Make allBusinesses reactive - use internal storage to avoid infinite recursion
let _allBusinessesInternal = allBusinesses;
Object.defineProperty(window, 'allBusinesses', {
  get: function() { return _allBusinessesInternal; },
  set: function(val) {
    _allBusinessesInternal = val;
  }
});

// Compatibility: loadMasterData function for pages that expect it
window.loadMasterData = async function() {
  if (allBusinesses.length > 0) {
    return { businesses: allBusinesses };
  }
  await loadBusinesses();
  return { businesses: allBusinesses };
};
