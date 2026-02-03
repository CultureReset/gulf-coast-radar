/**
 * GOOGLE SHEETS LIVE LOADER
 * Loads data directly from published Google Sheets CSV URLs
 * Auto-refreshes, handles caching, merges by business_id
 *
 * NO MANUAL STEPS - Edit Google Sheets, data updates automatically!
 */

class GoogleSheetsLiveLoader {
    constructor() {
        // Your published Google Sheets CSV URLs go here
        this.sheetURLs = {
            businessInfo: '',     // 1_ALL_BUSINESS_INFO
            hours: '',            // 2_ALL_HOURS
            menuItems: '',        // 3_ALL_MENU_ITEMS
            drinks: '',           // 4_ALL_DRINKS
            happyHour: '',        // 5_ALL_HAPPY_HOUR
            events: '',           // 6_ALL_EVENTS
            specials: '',         // 7_ALL_SPECIALS
            tags: '',             // 8_ALL_TAGS
            photos: '',           // 9_ALL_PHOTOS
            coupons: '',          // 10_ALL_COUPONS
            delivery: '',         // 11_DELIVERY_TAKEOUT
            aiContext: '',        // 12_AI_CONTEXT (original)
            aiContextV2: ''       // 13_AI_CONTEXT_V2 (enhanced AI data - not displayed on profiles)
        };

        this.cache = {
            data: null,
            timestamp: null,
            ttl: 5 * 60 * 1000 // 5 minutes cache
        };

        this.loading = false;
        this.loadPromise = null;
    }

    /**
     * Set the Google Sheets URLs
     */
    setURLs(urls) {
        this.sheetURLs = { ...this.sheetURLs, ...urls };
        console.log('📊 Google Sheets URLs configured');
    }

    /**
     * Main load function - call this to get all business data
     */
    async loadAllBusinesses(forceRefresh = false) {
        // Return cached data if valid
        if (!forceRefresh && this.isCacheValid()) {
            console.log('✅ Using cached data');
            return this.cache.data;
        }

        // If already loading, return existing promise
        if (this.loading && this.loadPromise) {
            console.log('⏳ Load already in progress...');
            return this.loadPromise;
        }

        // Start new load
        this.loading = true;
        this.loadPromise = this._loadAndMerge();

        try {
            const data = await this.loadPromise;
            this.cache.data = data;
            this.cache.timestamp = Date.now();
            this.loading = false;
            return data;
        } catch (error) {
            this.loading = false;
            this.loadPromise = null;
            throw error;
        }
    }

    /**
     * Internal: Load and merge all sheets
     */
    async _loadAndMerge() {
        console.log('🚀 Loading data from Google Sheets...');

        try {
            // Load all sheets in parallel
            const [
                businessInfo,
                hours,
                menuItems,
                drinks,
                happyHour,
                events,
                specials,
                tags,
                photos,
                coupons,
                delivery,
                aiContext,
                aiContextV2
            ] = await Promise.all([
                this.fetchSheet('businessInfo'),
                this.fetchSheet('hours'),
                this.fetchSheet('menuItems'),
                this.fetchSheet('drinks'),
                this.fetchSheet('happyHour'),
                this.fetchSheet('events'),
                this.fetchSheet('specials'),
                this.fetchSheet('tags'),
                this.fetchSheet('photos'),
                this.fetchSheet('coupons'),
                this.fetchSheet('delivery'),
                this.fetchSheet('aiContext'),
                this.fetchSheet('aiContextV2')
            ]);

            console.log('📦 All sheets loaded, merging data...');

            // Merge by business_id
            const mergedData = this.mergeData({
                businessInfo,
                hours,
                menuItems,
                drinks,
                happyHour,
                events,
                specials,
                tags,
                photos,
                coupons,
                delivery,
                aiContext,
                aiContextV2
            });

            console.log(`✅ Loaded ${mergedData.length} businesses from Google Sheets`);

            return mergedData;
        } catch (error) {
            console.error('❌ Error loading Google Sheets:', error);
            throw error;
        }
    }

    /**
     * Fetch a single sheet and parse CSV
     */
    async fetchSheet(sheetName) {
        const url = this.sheetURLs[sheetName];

        if (!url) {
            console.warn(`⚠️ No URL configured for ${sheetName}, skipping`);
            return [];
        }

        try {
            // Add cache buster to ensure fresh data
            const cacheBuster = `&cache=${Date.now()}`;
            const response = await fetch(url + cacheBuster);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const csvText = await response.text();
            const parsed = this.parseCSV(csvText);

            console.log(`  ✓ ${sheetName}: ${parsed.length} rows`);
            return parsed;
        } catch (error) {
            console.error(`  ✗ ${sheetName}: ${error.message}`);
            return [];
        }
    }

    /**
     * Parse CSV text to array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            rows.push(row);
        }

        return rows;
    }

    /**
     * Parse a single CSV line handling quotes and commas
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim().replace(/^"|"$/g, ''));
        return values;
    }

    /**
     * Merge all sheets by business_id
     */
    mergeData(sheets) {
        const businessMap = new Map();

        // Start with business info as base
        sheets.businessInfo.forEach(business => {
            const id = business.business_id;
            if (!id) return;

            businessMap.set(id, {
                ...business,
                id: id,
                hours: [],
                menu: [],
                drinks: [],
                happyHours: [],
                events: [],
                specials: [],
                tags: [],
                photos: [],
                coupons: [],
                deliveryOptions: [],
                aiContext: null
            });
        });

        // Add hours
        sheets.hours.forEach(hour => {
            const business = businessMap.get(hour.business_id);
            if (business) {
                business.hours.push({
                    day: hour.day,
                    open: hour.open,
                    close: hour.close,
                    closed: hour.is_closed === 'TRUE'
                });
            }
        });

        // Add menu items
        sheets.menuItems.forEach(item => {
            const business = businessMap.get(item.business_id);
            if (business) {
                business.menu.push({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    subcategory: item.subcategory,
                    dietary_tags: item.dietary_tags,
                    signature_dish: item.signature_dish === 'TRUE',
                    image: item.image
                });
            }
        });

        // Add drinks
        sheets.drinks.forEach(drink => {
            const business = businessMap.get(drink.business_id);
            if (business) {
                business.drinks.push({
                    name: drink.drink_name,
                    description: drink.description,
                    price: drink.price,
                    category: drink.category,
                    is_alcoholic: drink.is_alcoholic === 'TRUE',
                    image: drink.image
                });
            }
        });

        // Add happy hour specials
        sheets.happyHour.forEach(special => {
            const business = businessMap.get(special.business_id);
            if (business) {
                business.happyHours.push({
                    name: special.special_name,
                    description: special.description,
                    price: special.price,
                    days: special.days,
                    start_time: special.start_time,
                    end_time: special.end_time,
                    image: special.image
                });
            }
        });

        // Add events
        sheets.events.forEach(event => {
            const business = businessMap.get(event.business_id);
            if (business) {
                business.events.push({
                    name: event.event_name,
                    description: event.description,
                    days: event.days,
                    start_time: event.start_time,
                    end_time: event.end_time,
                    artist_name: event.artist_name,
                    genre: event.genre,
                    price: event.price,
                    age_restriction: event.age_restriction,
                    image: event.image
                });
            }
        });

        // Add specials
        sheets.specials.forEach(special => {
            const business = businessMap.get(special.business_id);
            if (business) {
                business.specials.push({
                    name: special.special_name,
                    type: special.special_type,
                    description: special.description,
                    price: special.price,
                    days: special.days,
                    start_time: special.start_time,
                    end_time: special.end_time,
                    image: special.image
                });
            }
        });

        // Add tags
        sheets.tags.forEach(tagRow => {
            const business = businessMap.get(tagRow.business_id);
            if (business && tagRow.tag) {
                business.tags.push(tagRow.tag);
            }
        });

        // Add photos
        sheets.photos.forEach(photo => {
            const business = businessMap.get(photo.business_id);
            if (business) {
                business.photos.push({
                    url: photo.image_url,
                    caption: photo.caption,
                    category: photo.category,
                    is_primary: photo.is_primary === 'TRUE'
                });
            }
        });

        // Add coupons
        sheets.coupons.forEach(coupon => {
            const business = businessMap.get(coupon.business_id);
            if (business) {
                business.coupons.push({
                    code: coupon.coupon_code,
                    title: coupon.title,
                    description: coupon.description,
                    discount_type: coupon.discount_type,
                    discount_value: coupon.discount_value,
                    image: coupon.coupon_image,
                    valid_from: coupon.valid_from,
                    valid_to: coupon.valid_to
                });
            }
        });

        // Add delivery options
        sheets.delivery.forEach(delivery => {
            const business = businessMap.get(delivery.business_id);
            if (business) {
                business.deliveryOptions.push({
                    platform: delivery.platform,
                    url: delivery.url,
                    phone: delivery.phone_order,
                    delivery_fee: delivery.delivery_fee,
                    min_order: delivery.min_order
                });
            }
        });

        // Add AI context (original)
        sheets.aiContext.forEach(context => {
            const business = businessMap.get(context.business_id);
            if (business) {
                business.aiContext = context;
            }
        });

        // Add AI Context V2 (enhanced - NOT displayed on profile, AI only)
        sheets.aiContextV2.forEach(contextV2 => {
            const business = businessMap.get(contextV2.business_id);
            if (business) {
                // Merge all AI Context V2 fields directly into business object
                // These fields are ONLY for AI intelligence, not displayed on website
                business.aiContextV2 = {
                    extendedDescription: contextV2.extended_description,
                    atmosphereVibe: contextV2.atmosphere_vibe,
                    knownFor: contextV2.known_for,
                    customerFavorites: contextV2.customer_favorites,
                    bestTimeToVisit: contextV2.best_time_to_visit,
                    insiderTip: contextV2.insider_tip,
                    vibeKeywords: contextV2.vibe_keywords,
                    signatureExperience: contextV2.signature_experience,
                    comparableTo: contextV2.comparable_to,
                    perfectFor: contextV2.perfect_for,
                    avoidIf: contextV2.avoid_if,
                    localsSay: contextV2.locals_say,
                    touristsLove: contextV2.tourists_love,
                    priceExpectations: contextV2.price_expectations,
                    waitTimeNotes: contextV2.wait_time_notes,
                    parkingSituation: contextV2.parking_situation,
                    noiseLevel: contextV2.noise_level,
                    lightingMood: contextV2.lighting_mood,
                    dressCodeReality: contextV2.dress_code_reality,
                    popularWith: contextV2.popular_with,
                    hiddenGemFactor: contextV2.hidden_gem_factor,
                    instagramWorthy: contextV2.instagram_worthy,
                    celebritySightings: contextV2.celebrity_sightings,
                    historicNotes: contextV2.historic_notes,
                    sustainabilityNotes: contextV2.sustainability_notes
                };
            }
        });

        return Array.from(businessMap.values());
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        if (!this.cache.data || !this.cache.timestamp) return false;
        const age = Date.now() - this.cache.timestamp;
        return age < this.cache.ttl;
    }

    /**
     * Force refresh data from Google Sheets
     */
    async refresh() {
        console.log('🔄 Force refreshing from Google Sheets...');
        return this.loadAllBusinesses(true);
    }

    /**
     * Get cache age in seconds
     */
    getCacheAge() {
        if (!this.cache.timestamp) return null;
        return Math.floor((Date.now() - this.cache.timestamp) / 1000);
    }
}

// Create global instance
window.googleSheetsLoader = new GoogleSheetsLiveLoader();

// Auto-refresh every 5 minutes
setInterval(() => {
    if (window.googleSheetsLoader.cache.data) {
        console.log('⏰ Auto-refreshing data from Google Sheets...');
        window.googleSheetsLoader.refresh();
    }
}, 5 * 60 * 1000);

console.log('📊 Google Sheets Live Loader initialized');
