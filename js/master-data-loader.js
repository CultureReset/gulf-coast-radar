/**
 * GCR Master Data Loader
 * Loads data directly from Google Sheets in real-time
 * Falls back to local merged-business-data.js if Google Sheets unavailable
 */

// Global variables
let masterData = null;
let businessesById = {};

// Load master data
async function loadMasterData() {
    if (masterData) {
        return masterData;
    }

    try {
        console.log('📊 Loading from Google Sheets...');

        // Try loading from Google Sheets first
        if (window.googleSheetsLoader) {
            window.allBusinesses = await window.googleSheetsLoader.loadAllBusinesses();

            console.log(`✅ Loaded ${window.allBusinesses.length} businesses from Google Sheets`);

            // Create masterData object
            masterData = {
                businesses: window.allBusinesses,
                lastUpdated: new Date().toISOString(),
                source: 'Google Sheets Live',
                cacheAge: window.googleSheetsLoader.getCacheAge()
            };

        } else {
            // Google Sheets is the ONLY data source
            console.error('❌ Google Sheets loader not available! No fallback.');
            window.allBusinesses = [];
        }

        // Create lookup by ID for fast access
        businessesById = {};
        window.allBusinesses.forEach(business => {
            if (business.id || business.business_id) {
                const id = business.id || business.business_id;
                businessesById[id] = business;
            }
        });

        // Dispatch event to notify other scripts (including search bar, AI)
        window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
            detail: {
                count: window.allBusinesses.length,
                businesses: window.allBusinesses,
                source: masterData.source
            }
        }));

        return masterData;

    } catch (error) {
        console.error('❌ Error loading master data:', error);
        // NO FALLBACK - Google Sheets is the ONLY data source
        window.allBusinesses = [];
        businessesById = {};
        throw error;
    }
}

// Load from local merged-business-data.js (fallback)
async function loadFromLocal() {
    const script = document.createElement('script');
    script.src = 'data/merged-business-data.js';

    await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    // Wait for script to execute
    await new Promise(resolve => setTimeout(resolve, 100));

    if (typeof allBusinesses === 'undefined' || !Array.isArray(allBusinesses)) {
        throw new Error('allBusinesses not loaded from merged-business-data.js');
    }

    window.allBusinesses = allBusinesses;

    masterData = {
        businesses: window.allBusinesses,
        lastUpdated: new Date().toISOString(),
        source: 'Local File (Fallback)'
    };

    console.log(`✅ Loaded ${window.allBusinesses.length} businesses from local data`);
}

// Force refresh from Google Sheets
async function refreshData() {
    if (window.googleSheetsLoader) {
        console.log('🔄 Force refreshing from Google Sheets...');
        masterData = null; // Clear cache
        window.allBusinesses = await window.googleSheetsLoader.refresh();

        // Update lookup
        businessesById = {};
        window.allBusinesses.forEach(business => {
            const id = business.id || business.business_id;
            if (id) businessesById[id] = business;
        });

        // Notify listeners
        window.dispatchEvent(new CustomEvent('allBusinessesUpdated', {
            detail: {
                count: window.allBusinesses.length,
                businesses: window.allBusinesses,
                source: 'Google Sheets Live (Refreshed)'
            }
        }));

        console.log(`✅ Refreshed: ${window.allBusinesses.length} businesses`);
        return window.allBusinesses;
    } else {
        console.warn('⚠️ Google Sheets loader not available for refresh');
        return window.allBusinesses || [];
    }
}

// Get business by ID
function getBusinessById(id) {
    return businessesById[id] || null;
}

// Get businesses by category
function getBusinessesByCategory(category) {
    return (window.allBusinesses || []).filter(b =>
        b.category === category || b.display_category === category
    );
}

// Get businesses with happy hours
function getBusinessesWithHappyHours() {
    return (window.allBusinesses || []).filter(b =>
        (b.happyHours && b.happyHours.length > 0) ||
        (b.scrapedData?.happyHour?.found)
    );
}

// Get businesses with specials
function getBusinessesWithSpecials() {
    return (window.allBusinesses || []).filter(b =>
        (b.specials && b.specials.length > 0) ||
        (b.scrapedData?.specials?.found)
    );
}

// Get businesses with events
function getBusinessesWithEvents() {
    return (window.allBusinesses || []).filter(b =>
        b.events && b.events.length > 0
    );
}

// Get all categories
function getAllCategories() {
    const categories = new Set();
    (window.allBusinesses || []).forEach(b => {
        if (b.category) categories.add(b.category);
        if (b.display_category) categories.add(b.display_category);
    });
    return Array.from(categories).sort();
}

// Get data source info
function getDataSource() {
    return masterData ? masterData.source : 'Not loaded';
}

// Auto-load on script load
loadMasterData().catch(err => {
    console.error('Failed to auto-load master data:', err);
});

// Auto-refresh every 5 minutes if using Google Sheets
setInterval(() => {
    if (window.googleSheetsLoader && masterData?.source?.includes('Google Sheets')) {
        console.log('⏰ Auto-refresh timer triggered');
        refreshData().catch(err => console.error('Auto-refresh failed:', err));
    }
}, 5 * 60 * 1000);

console.log('✅ Master Data Loader initialized');
