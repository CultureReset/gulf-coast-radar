// ============================================
// GCR Supabase Loader
// Replaces Google Sheets loader
// Reads directly from the same Supabase database
// as the business dashboards (Circle Boats, etc.)
// Sets window.allBusinesses in the format GCR expects
// ============================================

(function() {
  var SUPABASE_URL = 'https://mhafixflyffflwjhcgfn.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYWZpeGZseWZmZmx3amhjZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTA4MzUsImV4cCI6MjA4NzM4NjgzNX0.3KW-rGnLhJQ1u3IsSeoGFfgQpcoJNdBGFOGnhc88tHw';

  // Price level number → symbol
  function priceSymbol(n) {
    if (!n) return '$$';
    return '$'.repeat(Math.min(Math.max(n, 1), 4));
  }

  // Map business type → GCR category (fallback if gcr_category not set)
  function typeToCategory(type) {
    var map = {
      restaurant: 'restaurants',
      bakery:     'coffee-sweets',
      rental:     'things-to-do',
      fishing:    'things-to-do',
      jetski:     'things-to-do',
      cruise:     'things-to-do',
      bigboat:    'things-to-do',
      kayak:      'things-to-do',
      salon:      'shopping',
      retail:     'shopping'
    };
    return map[type] || 'other';
  }

  // Convert a gcr_directory row → format every GCR page script expects
  function mapRow(row) {
    var lat = parseFloat(row.lat) || 0;
    var lng = parseFloat(row.lng) || 0;

    var hours = row.hours;
    // hours may be stored as JSONB string from site_content
    if (hours && typeof hours === 'object') {
      // convert {monday: "9am-9pm", ...} to readable string
      var days = Object.entries(hours).map(function(e) {
        return e[0].slice(0,3) + ': ' + e[1];
      }).join(' | ');
      hours = days;
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
      location:          { lat: lat, lng: lng },
      tags:              row.tags || [],
      hours:             hours || '',
      social:            row.social_links || {},
      gallery:           row.gallery || [],
      // GCR content sections
      specials:          row.specials || [],
      events:            row.events || [],
      happyHour:         row.happy_hour || {},
      happyHourSpecials: (row.happy_hour || {}).items || [],
      menu:              row.menu || []
    };
  }

  // Main load function
  async function loadFromSupabase() {
    try {
      console.log('[GCR] Loading from Supabase...');

      // Query the gcr_directory view directly — no auth needed, public
      var url = SUPABASE_URL + '/rest/v1/gcr_directory?select=*';
      var res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      });

      if (!res.ok) {
        throw new Error('Supabase returned ' + res.status);
      }

      var rows = await res.json();

      if (!Array.isArray(rows) || rows.length === 0) {
        console.warn('[GCR] No listed businesses found in Supabase');
        return false;
      }

      window.allBusinesses = rows.map(mapRow);
      console.log('[GCR] Loaded ' + window.allBusinesses.length + ' businesses from Supabase');

      // Cache for offline use
      try {
        localStorage.setItem('gcr_businesses', JSON.stringify(window.allBusinesses));
        localStorage.setItem('gcr_businesses_ts', Date.now().toString());
      } catch(e) {}

      // Notify all page scripts
      window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
        detail: { count: window.allBusinesses.length, source: 'supabase' }
      }));
      window.dispatchEvent(new CustomEvent('businessDataLoaded', {
        detail: { count: window.allBusinesses.length, source: 'supabase' }
      }));

      return true;

    } catch(err) {
      console.warn('[GCR] Supabase load failed:', err.message);
      return false;
    }
  }

  // Try localStorage cache (max 10 min old)
  function loadFromCache() {
    try {
      var ts = parseInt(localStorage.getItem('gcr_businesses_ts') || '0');
      if (Date.now() - ts > 10 * 60 * 1000) return false; // stale
      var cached = localStorage.getItem('gcr_businesses');
      if (!cached) return false;
      var data = JSON.parse(cached);
      if (!data.length) return false;
      window.allBusinesses = data;
      console.log('[GCR] Loaded ' + data.length + ' businesses from cache');
      window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
        detail: { count: data.length, source: 'cache' }
      }));
      window.dispatchEvent(new CustomEvent('businessDataLoaded', {
        detail: { count: data.length, source: 'cache' }
      }));
      return true;
    } catch(e) { return false; }
  }

  // Boot sequence: cache first (instant display), then refresh from Supabase
  async function boot() {
    var hadCache = loadFromCache();
    var ok = await loadFromSupabase();
    if (!ok && !hadCache) {
      console.error('[GCR] No data available. Add businesses and mark them gcr_listed=true in Supabase.');
      window.allBusinesses = [];
    }
  }

  // Expose for pages that call loadMasterData()
  window.loadMasterData = function() { return boot(); };
  window.gcrLoader = { reload: loadFromSupabase };

  // Auto-boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
