/**
 * API Manager - Central Hub for External APIs
 * Connects to Google Places, TripAdvisor, and Yelp Fusion APIs
 * Provides unified interface for business data retrieval
 */

class APIManager {
  constructor() {
    // API Keys (In production, these should be stored server-side)
    this.googleApiKey = 'AIzaSyCe-2lIINAfvPEMx-hpOzxnB13fdRsXRYE';
    this.tripAdvisorApiKey = 'A27E6A7FE3104B03B1EFE38DCBA0AA2E';
    this.yelpApiKey = '0b6tmnOt1VjNk1sZMXrtqTKvtUWk2L2CV5HZIAjw16ynQK1nRXZ78CUbafZHO2kgArn1xZTDZO5BLvO87FqKFvgrNmtnZ42s_tDNEJWmxmao1d95-wX0LzB_Y40vaXYx';

    // API Endpoints
    this.googleBaseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.tripAdvisorBaseUrl = 'https://api.content.tripadvisor.com/api/v1';
    this.yelpBaseUrl = 'https://api.yelp.com/v3';

    // Cache for API responses (15 minutes)
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  // ========== GOOGLE PLACES API ==========

  /**
   * Search for businesses using Google Places
   * @param {string} query - Business name or type
   * @param {string} location - Location (e.g., "Gulf Shores, AL")
   * @returns {Promise<Array>} Array of business results
   */
  async searchGooglePlaces(query, location = 'Gulf Shores, AL') {
    const cacheKey = `google_${query}_${location}`;
    if (this.getCached(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      // Google Places returns max 20 results, but we can paginate to get up to 60 total
      let allResults = [];
      let nextPageToken = null;
      let pageCount = 0;
      const maxPages = 3; // Get up to 60 results (20 per page × 3 pages)

      do {
        // Build Google Places API URL
        let apiUrl = `${this.googleBaseUrl}/textsearch/json?` +
          `query=${encodeURIComponent(query + ' ' + location)}&` +
          `key=${this.googleApiKey}`;

        // Add page token if we're getting next page
        if (nextPageToken) {
          apiUrl += `&pagetoken=${nextPageToken}`;
          // Wait 2 seconds between paginated requests (required by Google)
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Use corsproxy.io (faster and more reliable than AllOrigins)
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;

        const searchResponse = await fetch(proxyUrl);
        const searchData = await searchResponse.json();

        if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
          console.warn(`⚠️ Google API status: ${searchData.status}`);
          break;
        }

        if (searchData.results && searchData.results.length > 0) {
          allResults = allResults.concat(searchData.results);
          console.log(`📍 Page ${pageCount + 1}: Found ${searchData.results.length} places (total: ${allResults.length})`);
        }

        nextPageToken = searchData.next_page_token;
        pageCount++;

      } while (nextPageToken && pageCount < maxPages);

      if (allResults.length === 0) {
        return { success: false, error: 'No results found' };
      }

      console.log(`📍 Total found: ${allResults.length} places across ${pageCount} pages, fetching details...`);

      // Step 2: Get detailed info for ALL places
      const businesses = [];
      for (const place of allResults) {
        const details = await this.getGooglePlaceDetails(place.place_id);
        if (details.success) {
          businesses.push(this.formatGoogleData(details.data));
        } else {
          console.warn(`⚠️ Failed to get details for: ${place.name}`);
        }
      }

      console.log(`✅ Successfully loaded ${businesses.length} businesses from Google`);

      this.setCache(cacheKey, businesses);
      return { success: true, data: businesses, source: 'google' };
    } catch (error) {
      console.error('Google Places API error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get detailed information for a Google Place
   */
  async getGooglePlaceDetails(placeId) {
    try {
      // Build Google Places API URL with ALL available fields for maximum detail
      const apiUrl = `${this.googleBaseUrl}/details/json?` +
        `place_id=${placeId}&` +
        `fields=name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,price_level,website,photos,reviews,geometry,types,editorial_summary,business_status,url,` +
        `serves_breakfast,serves_brunch,serves_lunch,serves_dinner,serves_beer,serves_wine,` +
        `takeout,delivery,dine_in,wheelchair_accessible_entrance,reservable,` +
        `serves_vegetarian_food,outdoor_seating,live_music,restroom,` +
        `good_for_children,good_for_groups,allows_dogs,` +
        `curbside_pickup,payment_options&` +
        `key=${this.googleApiKey}`;

      // Use corsproxy.io (faster and more reliable)
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data.status !== 'OK') {
        return { success: false, error: data.status };
      }

      return { success: true, data: data.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Format Google Places data to GCR format
   */
  formatGoogleData(place) {
    const amenities = this.extractAmenities(place);
    const paymentMethods = this.extractPaymentMethods(place);
    const reviews = this.formatGoogleReviews(place.reviews);
    const reviewSummary = this.generateReviewSummary(reviews);

    return {
      name: place.name,
      description: place.editorial_summary?.overview || '', // Business bio/description
      address: place.formatted_address,
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      googleMapsUrl: place.url || '', // Direct Google Maps link
      businessStatus: place.business_status || 'OPERATIONAL', // Open, Closed, etc.
      category: this.mapGoogleCategory(place.types),
      subcategory: this.mapGoogleSubcategory(place.types),
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      priceLevel: '$'.repeat(place.price_level || 2),
      hours: this.formatGoogleHours(place.opening_hours),
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0
      },
      photos: this.formatGooglePhotos(place.photos),
      reviews: reviews,
      reviewSummary: reviewSummary,
      amenities: amenities,
      paymentMethods: paymentMethods,
      source: 'google',
      googlePlaceId: place.place_id
    };
  }

  /**
   * Extract all amenities from Google Place data
   */
  extractAmenities(place) {
    const amenities = [];

    // Service amenities
    if (place.serves_breakfast) amenities.push('Breakfast');
    if (place.serves_brunch) amenities.push('Brunch');
    if (place.serves_lunch) amenities.push('Lunch');
    if (place.serves_dinner) amenities.push('Dinner');
    if (place.serves_beer) amenities.push('Beer');
    if (place.serves_wine) amenities.push('Wine');
    if (place.serves_vegetarian_food) amenities.push('Vegetarian Options');

    // Ordering options
    if (place.takeout) amenities.push('Takeout');
    if (place.delivery) amenities.push('Delivery');
    if (place.dine_in) amenities.push('Dine-in');
    if (place.curbside_pickup) amenities.push('Curbside Pickup');
    if (place.reservable) amenities.push('Reservations');

    // Accessibility & features
    if (place.wheelchair_accessible_entrance) amenities.push('Wheelchair Accessible');
    if (place.restroom) amenities.push('Restrooms');
    if (place.outdoor_seating) amenities.push('Outdoor Seating');
    if (place.live_music) amenities.push('Live Music');
    if (place.good_for_children) amenities.push('Kid-Friendly');
    if (place.good_for_groups) amenities.push('Good for Groups');
    if (place.allows_dogs) amenities.push('Pet-Friendly');

    return amenities;
  }

  /**
   * Extract payment methods from Google Place data
   */
  extractPaymentMethods(place) {
    const methods = [];

    if (place.payment_options) {
      if (place.payment_options.accepts_credit_cards) methods.push('Credit Cards');
      if (place.payment_options.accepts_debit_cards) methods.push('Debit Cards');
      if (place.payment_options.accepts_cash_only) methods.push('Cash Only');
      if (place.payment_options.accepts_nfc) methods.push('Contactless Payment');
    }

    return methods;
  }

  /**
   * Generate a summary from reviews
   */
  generateReviewSummary(reviews) {
    if (!reviews || reviews.length === 0) return '';

    // Take the 3 most recent reviews and create a summary
    const recentReviews = reviews.slice(0, 3);
    const highlights = recentReviews
      .map(r => r.text)
      .join(' ')
      .split('.')
      .slice(0, 2)
      .join('.')
      .substring(0, 200);

    return highlights + '...';
  }

  formatGoogleHours(openingHours) {
    if (!openingHours?.weekday_text) return {};

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = {};

    openingHours.weekday_text.forEach((text, index) => {
      // Format: "Monday: 11:00 AM – 9:00 PM"
      const parts = text.split(': ');
      if (parts.length === 2) {
        hours[days[index].toLowerCase()] = parts[1];
      }
    });

    return hours;
  }

  formatGooglePhotos(photos) {
    if (!photos) return [];

    return photos.slice(0, 10).map(photo => {
      return `${this.googleBaseUrl}/photo?` +
        `maxwidth=800&` +
        `photo_reference=${photo.photo_reference}&` +
        `key=${this.googleApiKey}`;
    });
  }

  formatGoogleReviews(reviews) {
    if (!reviews) return [];

    return reviews.map(review => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      date: new Date(review.time * 1000).toISOString(),
      source: 'google'
    }));
  }

  mapGoogleCategory(types) {
    if (!types) return 'other';

    const categoryMap = {
      'restaurant': 'food',
      'food': 'food',
      'cafe': 'food',
      'bar': 'food',
      'lodging': 'hotel',
      'hotel': 'hotel',
      'tourist_attraction': 'activity',
      'amusement_park': 'activity',
      'aquarium': 'activity',
      'museum': 'activity',
      'store': 'shopping',
      'shopping_mall': 'shopping',
      'spa': 'wellness'
    };

    for (const type of types) {
      if (categoryMap[type]) {
        return categoryMap[type];
      }
    }

    return 'other';
  }

  mapGoogleSubcategory(types) {
    if (!types) return '';

    const subcategoryMap = {
      'seafood_restaurant': 'Seafood',
      'italian_restaurant': 'Italian',
      'mexican_restaurant': 'Mexican',
      'american_restaurant': 'American',
      'bar': 'Bar',
      'night_club': 'Nightlife',
      'cafe': 'Cafe',
      'bakery': 'Bakery',
      'tourist_attraction': 'Attraction',
      'amusement_park': 'Theme Park',
      'aquarium': 'Aquarium',
      'museum': 'Museum',
      'park': 'Park',
      'store': 'Shopping',
      'clothing_store': 'Fashion',
      'jewelry_store': 'Jewelry'
    };

    for (const type of types) {
      if (subcategoryMap[type]) {
        return subcategoryMap[type];
      }
    }

    return '';
  }

  // ========== TRIPADVISOR API ==========

  /**
   * Search for attractions/activities on TripAdvisor
   * @param {string} query - Activity or attraction name
   * @param {string} location - Location coordinates or name
   * @returns {Promise<Object>} Search results
   */
  async searchTripAdvisor(query, location = 'Gulf Shores, AL') {
    const cacheKey = `tripadvisor_${query}_${location}`;
    if (this.getCached(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      // Step 1: Search for location
      const locationData = await this.getTripAdvisorLocation(location);
      if (!locationData.success) {
        return { success: false, error: 'Location not found' };
      }

      // Step 2: Search attractions near location
      const searchUrl = `${this.tripAdvisorBaseUrl}/location/${locationData.locationId}/attractions?` +
        `language=en&` +
        `key=${this.tripAdvisorApiKey}`;

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        return { success: false, error: 'No attractions found' };
      }

      // Step 3: Get details for each attraction
      const activities = [];
      for (const attraction of data.data.slice(0, 10)) {
        const details = await this.getTripAdvisorDetails(attraction.location_id);
        if (details.success) {
          activities.push(this.formatTripAdvisorData(details.data));
        }
      }

      this.setCache(cacheKey, activities);
      return { success: true, data: activities, source: 'tripadvisor' };
    } catch (error) {
      console.error('TripAdvisor API error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get TripAdvisor location ID from place name
   */
  async getTripAdvisorLocation(placeName) {
    try {
      const searchUrl = `${this.tripAdvisorBaseUrl}/location/search?` +
        `searchQuery=${encodeURIComponent(placeName)}&` +
        `language=en&` +
        `key=${this.tripAdvisorApiKey}`;

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        return { success: false, error: 'Location not found' };
      }

      return {
        success: true,
        locationId: data.data[0].location_id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get detailed attraction info from TripAdvisor
   */
  async getTripAdvisorDetails(locationId) {
    try {
      const detailsUrl = `${this.tripAdvisorBaseUrl}/location/${locationId}/details?` +
        `language=en&` +
        `key=${this.tripAdvisorApiKey}`;

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(detailsUrl)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get TripAdvisor reviews
   */
  async getTripAdvisorReviews(locationId) {
    try {
      const reviewsUrl = `${this.tripAdvisorBaseUrl}/location/${locationId}/reviews?` +
        `language=en&` +
        `key=${this.tripAdvisorApiKey}`;

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(reviewsUrl)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      return {
        success: true,
        reviews: data.data || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Format TripAdvisor data to GCR format
   */
  formatTripAdvisorData(location) {
    return {
      name: location.name,
      address: location.address_obj?.address_string || '',
      phone: location.phone || '',
      website: location.website || '',
      category: 'activity',
      subcategory: this.mapTripAdvisorCategory(location.subcategory),
      rating: location.rating ? parseFloat(location.rating) : 0,
      reviewCount: location.num_reviews || 0,
      priceLevel: location.price_level || '$$',
      description: location.description || '',
      location: {
        lat: parseFloat(location.latitude) || 0,
        lng: parseFloat(location.longitude) || 0
      },
      photos: location.photo?.images?.original?.url ? [location.photo.images.original.url] : [],
      hours: location.hours?.weekday_text || {},
      source: 'tripadvisor',
      tripAdvisorId: location.location_id,
      bookingUrl: location.web_url || ''
    };
  }

  mapTripAdvisorCategory(subcategory) {
    const categoryMap = {
      'attraction': 'Attraction',
      'tour': 'Tour',
      'water_sports': 'Water Sports',
      'outdoor': 'Outdoor',
      'museum': 'Museum',
      'nature_parks': 'Park',
      'beaches': 'Beach Access',
      'shopping': 'Shopping',
      'spas': 'Spa'
    };

    return categoryMap[subcategory] || 'Activity';
  }

  // ========== YELP FUSION API ==========

  /**
   * Search businesses on Yelp
   * @param {string} query - Business name or type
   * @param {string} location - Location
   * @returns {Promise<Object>} Search results
   */
  async searchYelp(query, location = 'Gulf Shores, AL') {
    const cacheKey = `yelp_${query}_${location}`;
    if (this.getCached(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      const searchUrl = `${this.yelpBaseUrl}/businesses/search?` +
        `term=${encodeURIComponent(query)}&` +
        `location=${encodeURIComponent(location)}&` +
        `limit=50&` +
        `sort_by=best_match`;

      // Use corsproxy.io which forwards Authorization headers properly
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${this.yelpApiKey}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.businesses || data.businesses.length === 0) {
        return { success: false, error: 'No businesses found' };
      }

      console.log(`📍 Found ${data.businesses.length} businesses on Yelp`);

      // Get detailed info for each business
      const businesses = [];
      for (const business of data.businesses) {
        const details = await this.getYelpBusinessDetails(business.id);
        if (details.success) {
          businesses.push(this.formatYelpData(details.data));
        } else {
          console.warn(`⚠️ Failed to get Yelp details for: ${business.name}`);
        }
      }

      console.log(`✅ Successfully loaded ${businesses.length} businesses from Yelp`);

      this.setCache(cacheKey, businesses);
      return { success: true, data: businesses, source: 'yelp' };
    } catch (error) {
      console.error('Yelp API error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get detailed business info from Yelp
   */
  async getYelpBusinessDetails(businessId) {
    try {
      const detailsUrl = `${this.yelpBaseUrl}/businesses/${businessId}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(detailsUrl)}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${this.yelpApiKey}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Yelp reviews
   */
  async getYelpReviews(businessId) {
    try {
      const reviewsUrl = `${this.yelpBaseUrl}/businesses/${businessId}/reviews`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(reviewsUrl)}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${this.yelpApiKey}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      return {
        success: true,
        reviews: data.reviews || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Format Yelp data to GCR format
   */
  formatYelpData(business) {
    return {
      name: business.name,
      address: business.location?.display_address?.join(', ') || '',
      phone: business.display_phone || '',
      website: business.url || '',
      category: this.mapYelpCategory(business.categories),
      subcategory: this.mapYelpSubcategory(business.categories),
      rating: business.rating || 0,
      reviewCount: business.review_count || 0,
      priceLevel: business.price || '$$',
      hours: this.formatYelpHours(business.hours),
      location: {
        lat: business.coordinates?.latitude || 0,
        lng: business.coordinates?.longitude || 0
      },
      photos: business.photos || [],
      source: 'yelp',
      yelpId: business.id,
      yelpUrl: business.url
    };
  }

  formatYelpHours(hours) {
    if (!hours || hours.length === 0) return {};

    const daysMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const formattedHours = {};

    if (hours[0]?.open) {
      hours[0].open.forEach(period => {
        const day = daysMap[period.day];
        const start = this.formatYelpTime(period.start);
        const end = this.formatYelpTime(period.end);
        formattedHours[day] = `${start} - ${end}`;
      });
    }

    return formattedHours;
  }

  formatYelpTime(time) {
    // Convert "1130" to "11:30 AM"
    const hours = parseInt(time.substring(0, 2));
    const minutes = time.substring(2, 4);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${minutes} ${ampm}`;
  }

  mapYelpCategory(categories) {
    if (!categories || categories.length === 0) return 'other';

    const categoryMap = {
      'restaurants': 'food',
      'food': 'food',
      'bars': 'food',
      'nightlife': 'food',
      'hotels': 'hotel',
      'shopping': 'shopping',
      'active': 'activity',
      'tours': 'activity',
      'attractions': 'activity'
    };

    for (const cat of categories) {
      const alias = cat.alias || '';
      for (const [key, value] of Object.entries(categoryMap)) {
        if (alias.includes(key)) {
          return value;
        }
      }
    }

    return 'other';
  }

  mapYelpSubcategory(categories) {
    if (!categories || categories.length === 0) return '';

    return categories[0].title || '';
  }

  // ========== UNIFIED SEARCH ==========

  /**
   * Search across all APIs and merge results
   * @param {string} query - Business/activity name
   * @param {string} location - Location
   * @returns {Promise<Object>} Combined results from all APIs
   */
  async searchAll(query, location = 'Gulf Shores, AL') {
    console.log(`🔍 Searching all APIs for: ${query} in ${location}`);

    const results = await Promise.allSettled([
      this.searchGooglePlaces(query, location),
      this.searchTripAdvisor(query, location),
      this.searchYelp(query, location)
    ]);

    const combined = {
      google: results[0].status === 'fulfilled' && results[0].value.success ? results[0].value.data : [],
      tripadvisor: results[1].status === 'fulfilled' && results[1].value.success ? results[1].value.data : [],
      yelp: results[2].status === 'fulfilled' && results[2].value.success ? results[2].value.data : []
    };

    return {
      success: true,
      data: combined,
      merged: this.mergeResults(combined)
    };
  }

  /**
   * Merge duplicate businesses from different APIs
   */
  mergeResults(results) {
    const allBusinesses = [
      ...results.google,
      ...results.tripadvisor,
      ...results.yelp
    ];

    // Group by similar names (fuzzy matching)
    const merged = [];
    const processed = new Set();

    for (const business of allBusinesses) {
      if (processed.has(business.name)) continue;

      // Find duplicates
      const duplicates = allBusinesses.filter(b =>
        this.isSimilarName(b.name, business.name)
      );

      // Merge data from duplicates
      const mergedBusiness = this.mergeDuplicates(duplicates);
      merged.push(mergedBusiness);

      duplicates.forEach(dup => processed.add(dup.name));
    }

    return merged;
  }

  /**
   * Check if two business names are similar
   */
  isSimilarName(name1, name2) {
    const normalize = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    // Exact match
    if (n1 === n2) return true;

    // One contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Levenshtein distance < 3
    return this.levenshteinDistance(n1, n2) < 3;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Merge duplicate business entries
   */
  mergeDuplicates(businesses) {
    if (businesses.length === 1) return businesses[0];

    // Prioritize: Google > TripAdvisor > Yelp for base data
    const primary = businesses.find(b => b.source === 'google') ||
                    businesses.find(b => b.source === 'tripadvisor') ||
                    businesses[0];

    const merged = { ...primary };

    // Combine ALL photos from all sources (no duplicates)
    const allPhotos = new Set();
    businesses.forEach(b => {
      if (b.photos && Array.isArray(b.photos)) {
        b.photos.forEach(photo => {
          if (photo && photo.trim()) {
            allPhotos.add(photo);
          }
        });
      }
    });
    merged.photos = Array.from(allPhotos);

    // Combine reviews from all sources
    merged.reviews = [];
    merged.sources = [];

    businesses.forEach(b => {
      if (b.reviews) {
        merged.reviews.push(...b.reviews);
      }
      merged.sources.push(b.source);
    });

    // Fill in missing data from other sources (use first available value)
    businesses.forEach(b => {
      if (!merged.phone && b.phone) merged.phone = b.phone;
      if (!merged.website && b.website) merged.website = b.website;
      if (!merged.description && b.description) merged.description = b.description;
      if (!merged.hours && b.hours) merged.hours = b.hours;
      if (!merged.priceLevel && b.priceLevel) merged.priceLevel = b.priceLevel;
      if (!merged.category && b.category) merged.category = b.category;
      if (!merged.subcategory && b.subcategory) merged.subcategory = b.subcategory;
      if (!merged.googleMapsUrl && b.googleMapsUrl) merged.googleMapsUrl = b.googleMapsUrl;

      // Keep API IDs from all sources
      if (b.googlePlaceId) merged.googlePlaceId = b.googlePlaceId;
      if (b.yelpId) merged.yelpId = b.yelpId;
      if (b.tripAdvisorId) merged.tripAdvisorId = b.tripAdvisorId;
    });

    // Use highest review count
    merged.totalReviews = businesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
    merged.reviewCount = merged.totalReviews;

    // Average ratings weighted by review count
    const totalReviews = merged.totalReviews;
    if (totalReviews > 0) {
      merged.averageRating = businesses.reduce((sum, b) => {
        return sum + ((b.rating || 0) * (b.reviewCount || 0));
      }, 0) / totalReviews;
      merged.averageRating = Math.round(merged.averageRating * 10) / 10;
      merged.rating = merged.averageRating; // Set rating to the averaged value
    }

    return merged;
  }

  // ========== CACHE MANAGEMENT ==========

  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// Initialize global instance
window.apiManager = new APIManager();

console.log('✅ API Manager loaded');
console.log('📡 Ready to connect to Google Places, TripAdvisor, and Yelp');
