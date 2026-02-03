// Profile Page JavaScript with Searchable Menus

let currentBusiness = null;

// Get today's hours for display
function getTodayHours(hours) {
  if (!hours) {
    return 'Hours not available';
  }

  // If hours is a string, return it directly
  if (typeof hours === 'string') {
    return hours;
  }

  // If hours is an object
  if (typeof hours === 'object' && !Array.isArray(hours)) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.

    // Check if it's day-by-day format
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hasDayKeys = Object.keys(hours).some(key => dayKeys.includes(key.toLowerCase()));

    if (hasDayKeys) {
      // Day-by-day format: { "monday": "5 PM–10 PM", "tuesday": "Closed", ... }
      const dayMap = {
        'Mon': 'monday',
        'Tue': 'tuesday',
        'Wed': 'wednesday',
        'Thu': 'thursday',
        'Fri': 'friday',
        'Sat': 'saturday',
        'Sun': 'sunday'
      };

      const todayKey = dayMap[currentDay];
      const todayHours = hours[todayKey];

      if (!todayHours) {
        return 'Hours not available';
      }

      // Convert to 12-hour format
      const formattedHours = typeof convertTo12Hour !== 'undefined' ? convertTo12Hour(todayHours) : todayHours;

      // Return today's hours with day name
      const dayNames = {
        'Mon': 'Today',
        'Tue': 'Today',
        'Wed': 'Today',
        'Thu': 'Today',
        'Fri': 'Today',
        'Sat': 'Today',
        'Sun': 'Today'
      };

      return `${dayNames[currentDay]}: ${formattedHours}`;
    } else {
      // Meal period format: { "Dinner (Sun-Thu)": "4 PM–9 PM", ... }
      // Find the first period that applies to today
      for (const [period, timeStr] of Object.entries(hours)) {
        // Simple check - if period includes current day or is a general period
        const periodLower = period.toLowerCase();
        const dayAbbrev = currentDay.toLowerCase();

        if (periodLower.includes(dayAbbrev) ||
            periodLower.includes('daily') ||
            periodLower.includes('lunch') ||
            periodLower.includes('dinner')) {
          const formattedTime = typeof convertTo12Hour !== 'undefined' ? convertTo12Hour(timeStr) : timeStr;
          return `${period}: ${formattedTime}`;
        }
      }

      // Return first period as fallback
      const firstPeriod = Object.entries(hours)[0];
      if (firstPeriod) {
        const formattedTime = typeof convertTo12Hour !== 'undefined' ? convertTo12Hour(firstPeriod[1]) : firstPeriod[1];
        return `${firstPeriod[0]}: ${formattedTime}`;
      }
    }
  }

  return 'See hours below';
}

// Check if business is currently open
function getBusinessStatus(hours) {
  if (!hours) {
    return { isOpen: null, text: '', class: '' };
  }

  try {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    // Handle object format (new format)
    if (typeof hours === 'object' && !Array.isArray(hours)) {
      // Check if it's day-by-day format (keys are day names)
      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const hasDayKeys = Object.keys(hours).some(key => dayKeys.includes(key.toLowerCase()));

      if (hasDayKeys) {
        // Day-by-day format: { "monday": "5 PM–10 PM", "tuesday": "Closed", ... }
        const dayMap = {
          'Mon': 'monday',
          'Tue': 'tuesday',
          'Wed': 'wednesday',
          'Thu': 'thursday',
          'Fri': 'friday',
          'Sat': 'saturday',
          'Sun': 'sunday'
        };

        const todayKey = dayMap[currentDay];
        const todayHours = hours[todayKey];

        if (!todayHours || todayHours.toLowerCase() === 'closed') {
          return { isOpen: false, text: 'Closed', class: 'status-closed' };
        }

        // Check if currently open based on today's hours
        // Handle multiple shifts: "11 AM–3 PM, 5 PM–10 PM"
        const shifts = todayHours.split(',').map(s => s.trim());

        for (const shift of shifts) {
          if (checkIfOpenDuringShift(shift, currentTime)) {
            return { isOpen: true, text: 'Open Now', class: 'status-open' };
          }
        }

        // Has hours today but not currently within them
        return { isOpen: false, text: 'Closed', class: 'status-closed' };
      } else {
        // Meal period format: { "Dinner (Sun-Thu)": "4 PM–9 PM", ... }
        for (const [period, timeStr] of Object.entries(hours)) {
          if (checkIfOpenDuringPeriod(timeStr, currentDay, currentTime, period)) {
            return { isOpen: true, text: 'Open Now', class: 'status-open' };
          }
        }
        // Not open during any period
        return { isOpen: false, text: 'Closed', class: 'status-closed' };
      }
    }

    // Handle array format (Google Sheets) - shouldn't reach here, but just in case
    if (Array.isArray(hours)) {
      console.warn('Hours is an array but got to string handler - returning default');
      return { isOpen: null, text: '', class: '' };
    }

    // Handle string format (legacy format)
    if (typeof hours !== 'string') {
      console.warn('Hours is not a string:', typeof hours);
      return { isOpen: null, text: '', class: '' };
    }

    const hoursLower = hours.toLowerCase();

    // Check if closed
    if (hoursLower.includes('closed')) {
      return { isOpen: false, text: 'Closed', class: 'status-closed' };
    }

    // Handle 24/7
    if (hoursLower.includes('24') || hoursLower.includes('24/7')) {
      return { isOpen: true, text: 'Open 24/7', class: 'status-open' };
    }

    // Parse daily hours
    if (hoursLower.includes('daily:')) {
      const timeMatch = hours.match(/(\d+)(am|pm)\s*-\s*(\d+)(am|pm)/i);
      if (timeMatch) {
        const openTime = convertToMinutes(timeMatch[1], timeMatch[2]);
        const closeTime = convertToMinutes(timeMatch[3], timeMatch[4]);
        const isOpen = currentTime >= openTime && currentTime < closeTime;
        return {
          isOpen,
          text: isOpen ? 'Open Now' : 'Closed',
          class: isOpen ? 'status-open' : 'status-closed'
        };
      }
    }

    // Default: assume open during business hours (this is a fallback)
    const businessHoursStart = 9 * 60; // 9am
    const businessHoursEnd = 21 * 60; // 9pm
    const isOpen = currentTime >= businessHoursStart && currentTime < businessHoursEnd;

    return {
      isOpen,
      text: isOpen ? 'Open Now' : 'Closed',
      class: isOpen ? 'status-open' : 'status-closed'
    };
  } catch (error) {
    console.error('Error parsing hours:', error);
    return { isOpen: null, text: '', class: '' };
  }
}

function checkIfOpenDuringShift(shift, currentTime) {
  // Parse a single time shift like "5 PM–10 PM" or "11 AM–3 PM" or "11:00–21:00" (24-hour)

  // Try 24-hour format first: "11:00–21:00" or "14:30-22:00"
  const time24Match = shift.match(/(\d+):(\d+)[–\-—]+(\d+):(\d+)/);

  if (time24Match) {
    const [, openHour, openMin, closeHour, closeMin] = time24Match;
    const openTime = parseInt(openHour) * 60 + parseInt(openMin);
    const closeTime = parseInt(closeHour) * 60 + parseInt(closeMin);

    // Check if current time is within range
    return currentTime >= openTime && currentTime < closeTime;
  }

  // Try 12-hour format with AM/PM: "5 PM–10 PM"
  const time12Match = shift.match(/(\d+)(?::(\d+))?\s*(AM|PM)[–\-—]+(\d+)(?::(\d+))?\s*(AM|PM)/i);

  if (!time12Match) {
    return false; // Can't parse, assume closed
  }

  const [, openHour, openMin = '0', openPeriod, closeHour, closeMin = '0', closePeriod] = time12Match;

  const openTime = convertToMinutes(openHour, openPeriod) + parseInt(openMin);
  const closeTime = convertToMinutes(closeHour, closePeriod) + parseInt(closeMin);

  // Check if current time is within range
  return currentTime >= openTime && currentTime < closeTime;
}

function checkIfOpenDuringPeriod(timeStr, currentDay, currentTime, period = '') {
  // Extract day restrictions from period name or time string
  // Examples: "Dinner (Sun-Thu)", "Sun 11 AM–2 PM", "11 AM–4 PM"

  // Day name mapping
  const dayMap = {
    'sun': 'Sun', 'mon': 'Mon', 'tue': 'Tue', 'wed': 'Wed',
    'thu': 'Thu', 'fri': 'Fri', 'sat': 'Sat',
    'sunday': 'Sun', 'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed',
    'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat'
  };

  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check for day restrictions in period name (e.g., "Dinner (Sun-Thu)")
  const periodDayMatch = period.match(/\(([\w\-]+)\)/);

  // Check for day at start of time string (e.g., "Sun 11 AM–2 PM")
  const timeDayMatch = timeStr.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+/i);

  let allowedDays = null;

  if (periodDayMatch) {
    const dayRange = periodDayMatch[1];
    if (dayRange.includes('-')) {
      // Day range like "Sun-Thu"
      const [start, end] = dayRange.split('-').map(d => dayMap[d.toLowerCase()] || d);
      const startIdx = dayOrder.indexOf(start);
      const endIdx = dayOrder.indexOf(end);

      if (startIdx !== -1 && endIdx !== -1) {
        allowedDays = [];
        if (startIdx <= endIdx) {
          for (let i = startIdx; i <= endIdx; i++) {
            allowedDays.push(dayOrder[i]);
          }
        } else {
          // Wrap around (e.g., Fri-Mon)
          for (let i = startIdx; i < dayOrder.length; i++) {
            allowedDays.push(dayOrder[i]);
          }
          for (let i = 0; i <= endIdx; i++) {
            allowedDays.push(dayOrder[i]);
          }
        }
      }
    } else {
      // Single day
      allowedDays = [dayMap[dayRange.toLowerCase()] || dayRange];
    }
  } else if (timeDayMatch) {
    // Single day specified in time string
    allowedDays = [timeDayMatch[1]];
  }

  // If days are restricted, check if current day is allowed
  if (allowedDays && !allowedDays.includes(currentDay)) {
    return false;
  }

  // Parse time range (handles formats like "11 AM–4 PM", "4 PM–9 PM", "Sun 11 AM–2 PM")
  const timeMatch = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)[–\-—]+(\d+)(?::(\d+))?\s*(AM|PM)/i);

  if (!timeMatch) {
    return false; // Can't parse time, assume closed
  }

  const [, openHour, openMin = '0', openPeriod, closeHour, closeMin = '0', closePeriod] = timeMatch;

  const openTime = convertToMinutes(openHour, openPeriod) + parseInt(openMin);
  const closeTime = convertToMinutes(closeHour, closePeriod) + parseInt(closeMin);

  // Check if current time is within range
  return currentTime >= openTime && currentTime < closeTime;
}

function convertToMinutes(hour, period) {
  let h = parseInt(hour);
  if (period.toLowerCase() === 'pm' && h !== 12) h += 12;
  if (period.toLowerCase() === 'am' && h === 12) h = 0;
  return h * 60;
}
let allMenuItems = [];
let filteredMenuItems = [];
let allDrinks = [];
let filteredDrinks = [];
let allPackages = [];
let selectedMenuCategories = [];
let selectedDrinkCategories = [];
let currentMenuCategory = 'all';  // Track time-based filter (All, Brunch, Lunch, Dinner)
let currentFoodType = 'all';      // Track food type filter (All, Appetizers, Seafood, etc.)
let currentDrinkCategory = 'all'; // Track drink category filter
let activeDietaryFilters = [];   // Track active dietary filters (vegetarian, vegan, gluten-free, etc.)

// Determine current meal time based on time of day
function getCurrentMealTime() {
  const hour = new Date().getHours();

  // Brunch: 7am - 11am
  if (hour >= 7 && hour < 11) {
    return 'Brunch';
  }
  // Lunch: 11am - 4pm
  else if (hour >= 11 && hour < 16) {
    return 'Lunch';
  }
  // Dinner: 4pm onwards or before 7am (late night/early morning)
  else {
    return 'Dinner';
  }
}

// Get time range display for meal categories
function getMealTimeRange(category) {
  const timeRanges = {
    'Happy Hour': currentBusiness?.happyHour || '3pm - 6pm',
    'HAPPY HOUR': currentBusiness?.happyHour || '3pm - 6pm',
    'Brunch': '7am - 11am',
    'BRUNCH': '7am - 11am',
    'Lunch': '11am - 4pm',
    'LUNCH': '11am - 4pm',
    'Dinner': '4pm - 11pm',
    'DINNER': '4pm - 11pm',
    'All': 'All Day'
  };
  return timeRanges[category] || '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');

  // Check if demo mode (window.currentBusiness set by demo.html)
  if (!businessId && window.currentBusiness) {
    console.log('📍 Demo mode detected - using pre-loaded business data');
    currentBusiness = window.currentBusiness;
    allBusinesses = window.allBusinesses || [currentBusiness];
    allMenuItems = window.allMenuItems || [];
    allDrinks = window.allDrinks || [];
    initializeProfile();
    return;
  }

  // Skip redirect if no business ID
  if (!businessId) {
    window.location.href = 'index.html';
    return;
  }

  // Use local GCR data
  console.log('📂 Loading business data...');

  // Function to load and render business
  function loadAndRenderBusiness(requireFullData = false) {
    if (typeof allBusinesses === 'undefined' || !allBusinesses || allBusinesses.length === 0) {
      console.warn('⏳ Business data not loaded yet, waiting...');
      return false; // Wait for data to load, don't redirect
    }

    currentBusiness = allBusinesses.find(b => (b.id || b.business_id) === businessId);

    if (!currentBusiness) {
      console.warn(`Business ${businessId} not found, waiting for dynamic data...`);
      return false; // Return false to indicate not found yet
    }

    // Check if this is a placeholder with no menu data
    // If requireFullData is true or business has empty menu/drinks, wait for dynamic data
    const hasMenuData = currentBusiness.menu && currentBusiness.menu.length > 0;
    const hasDrinksData = currentBusiness.drinks && currentBusiness.drinks.length > 0;
    const hasRealData = hasMenuData || hasDrinksData;

    if (requireFullData && !hasRealData) {
      console.warn(`Business ${businessId} found but has no menu data (menu: ${currentBusiness.menu?.length || 0}, drinks: ${currentBusiness.drinks?.length || 0}), waiting for full data...`);
      return false; // Wait for full data from JSON files
    }

    return true; // Found successfully
  }

  // Try to load business immediately - don't require full data, profiles can load without menus
  const foundImmediately = loadAndRenderBusiness(false);

  if (!foundImmediately) {
    // Business not found, wait for dynamic businesses to load
    console.log('⏳ Waiting for business data to load...');

    // Set up one-time listener
    const handleBusinessesUpdated = () => {
      console.log('📦 Dynamic businesses loaded, retrying...');
      const foundNow = loadAndRenderBusiness(false); // Don't require full data on retry

      if (foundNow) {
        console.log('✅ Found business in dynamic data!');
        console.log('  Menu items:', currentBusiness.menu ? currentBusiness.menu.length : 0);
        console.log('  Drinks:', currentBusiness.drinks ? currentBusiness.drinks.length : 0);
        initializeProfile();
      } else {
        console.error('❌ Business still not found after dynamic load');
        window.location.href = 'index.html';
      }

      // Remove listener after handling
      window.removeEventListener('allBusinessesUpdated', handleBusinessesUpdated);
    };

    window.addEventListener('allBusinessesUpdated', handleBusinessesUpdated);

    return; // Exit and wait for event
  }

  // Business found immediately with full data, continue with initialization
  console.log('✅ Business found immediately with menu data');
  initializeProfile();
});

// Separate initialization function
async function initializeProfile() {
  if (!currentBusiness) {
    console.error('Cannot initialize profile: currentBusiness is null');
    return;
  }

  // Debug: Check if images exist
  console.log('Current Business:', currentBusiness.name);
  console.log('Images array:', currentBusiness.images);
  console.log('Fallback image:', currentBusiness.image);

  // Filter OUT promotional/special items from menu - they belong in events section
  const menuArray = currentBusiness.menu || [];
  allMenuItems = menuArray.filter(item => {
    // Exclude items with category "Promotions", "Special Events", "Events", etc.
    const category = (item.category || '').toLowerCase();
    const isPromotion = category.includes('promotion') ||
                       category.includes('special') ||
                       category.includes('event') ||
                       category.includes('bourbon dinner') ||
                       item.name.toLowerCase().includes('special event');
    return !isPromotion;
  });

  filteredMenuItems = [...allMenuItems];
  allDrinks = currentBusiness.drinks || [];
  filteredDrinks = [...allDrinks];
  allPackages = currentBusiness.packages || [];

  // Extract promotional items and move them to events if they don't exist there
  const promotionalItems = menuArray.filter(item => {
    const category = (item.category || '').toLowerCase();
    return category.includes('promotion') ||
           category.includes('special') ||
           category.includes('event') ||
           category.includes('bourbon dinner') ||
           item.name.toLowerCase().includes('special event');
  });

  // Load reviews from localStorage
  if (!window.businessReviews) {
    window.businessReviews = JSON.parse(localStorage.getItem('businessReviews') || '[]');
  }

  // Fetch events from event-loader.js BEFORE rendering
  console.log("⏳ Waiting for events to load before rendering...");
  await fetchAndMergeEvents();
  console.log("✅ Events merged! Business now has", currentBusiness.events?.length || 0, "events");

  // DEBUG: Verify events before rendering
  if (currentBusiness.events && currentBusiness.events.length > 0) {
    console.log("🎉 CONFIRMED: currentBusiness.events has", currentBusiness.events.length, "events before renderProfile()");
    console.log("First event:", currentBusiness.events[0]);
  } else {
    console.error("❌ WARNING: currentBusiness.events is empty or undefined before renderProfile()!");
  }

  renderProfileNav();
  renderProfile();

  // Set initial filter based on current time
  setInitialMealTimeFilter();

  setupMenuSearch();
  setupDrinkSearch();
  setupMenuScrollSpy();
}

// Fetch events from event-loader.js and merge with business
async function fetchAndMergeEvents() {
  console.log('🎪 fetchAndMergeEvents() called for:', currentBusiness.id);

  // Events are now loaded from Google Sheets directly - no need to wait for event loader
  console.log('✅ Events already loaded from Google Sheets');
  console.log('  currentBusiness.events:', currentBusiness.events?.length || 0, 'events');

  // Events are already merged in the Google Sheets data, just return
  return;
}

function mergeBusinessEvents() {
  if (!currentBusiness) {
    console.error('❌ currentBusiness is null');
    return;
  }

  // Initialize events array if it doesn't exist
  if (!currentBusiness.events) {
    currentBusiness.events = [];
  }

  // Get events for this business from eventLoader
  const dynamicEvents = window.eventLoader ? window.eventLoader.getByBusiness(currentBusiness.id) : [];

  console.log(`🎸 Found ${dynamicEvents.length} dynamic events for ${currentBusiness.name} (ID: ${currentBusiness.id})`);
  if (dynamicEvents.length > 0) {
    console.log("First event:", dynamicEvents[0]);
  } else {
    console.log("⚠️ No events found! Checking eventLoader state...");
    console.log("  eventLoader exists:", !!window.eventLoader);
    console.log("  eventLoader.loaded:", window.eventLoader?.loaded);
    console.log("  Total events in loader:", window.eventLoader?.events?.length);
    console.log("  Looking for businessId:", currentBusiness.id);

    // Debug: Show all unique businessIds in the eventLoader
    if (window.eventLoader?.events) {
      const businessIds = [...new Set(window.eventLoader.events.map(e => e.businessId))];
      console.log("  All businessIds in events:", businessIds);
    }
  }

  // Convert dynamic events to the format profile.js expects
  const formattedEvents = dynamicEvents.map(event => ({
    name: event.title,
    description: event.description || '',
    day: event.recurring ? event.daysOfWeek?.join(', ') || 'See calendar' : new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    time: event.startTime ? `${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}` : 'See calendar',
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    category: event.category,
    price: event.price
  }));

  // Auto-generate events from time-based menu categories (LUNCH, DINNER, BRUNCH)
  const menuCategories = [...new Set((currentBusiness.menu || []).map(item => item.category))];
  const timingMap = {
    'LUNCH': { emoji: '🍽️', time: '11:00 AM - 3:00 PM', day: 'Daily' },
    'BRUNCH': { emoji: '🥞', time: '10:00 AM - 2:00 PM', day: 'Sunday' },
    'DINNER': { emoji: '🌙', time: '5:00 PM - 10:00 PM', day: 'Daily' }
  };

  const autoEvents = [];
  menuCategories.forEach(cat => {
    const timing = timingMap[cat];
    if (timing) {
      autoEvents.push({
        name: `${timing.emoji} ${cat.charAt(0) + cat.slice(1).toLowerCase()} Service`,
        description: `${cat.charAt(0) + cat.slice(1).toLowerCase()} menu available`,
        day: timing.day,
        time: timing.time
      });
    }
  });

  // Merge all events: dynamic + auto-generated + hardcoded
  const hardcodedEvents = currentBusiness.events || [];
  currentBusiness.events = [...formattedEvents, ...autoEvents, ...hardcodedEvents];

  console.log(`✅ Total events for ${currentBusiness.name}: ${currentBusiness.events.length} (${autoEvents.length} auto-generated from menu)`);
  console.log("Events array:", currentBusiness.events);

  // Re-render events section if page is already rendered
  const eventsContainer = document.getElementById('events-container');
  if (eventsContainer && currentBusiness.events.length > 0) {
    console.log("🔄 Re-rendering events section...");
    renderEventsSection();
  }
}

function renderEventsSection() {
  const eventsContainer = document.getElementById('events-container');
  if (!eventsContainer) return;

  if (currentBusiness.events && currentBusiness.events.length > 0) {
    eventsContainer.innerHTML = currentBusiness.events.map((event, index) => `
      <div class="event-card" data-event-index="${index}">
        <h3 class="event-card-title">${event.name}</h3>
        <p class="event-card-description">${event.description.replace(/\n/g, '<br>')}</p>
        <div class="event-card-details">
          <span>📅 ${event.day}</span>
          <span>🕐 ${event.time}</span>
          ${event.price ? `<span>💵 ${event.price}</span>` : ''}
        </div>
      </div>
    `).join('');
  } else {
    eventsContainer.innerHTML = `
      <p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">
        Click "View Events Calendar" above to see all upcoming events, specials, and live entertainment!
      </p>
    `;
  }
}

function renderProfileNav() {
  const navLinks = document.getElementById('profile-nav-links');

  // Handle tags as string or array
  const tags = currentBusiness.tags ?
    (Array.isArray(currentBusiness.tags) ? currentBusiness.tags : currentBusiness.tags.split(',').map(t => t.trim())) :
    [];

  navLinks.innerHTML = `
    ${allMenuItems.length > 0 ? '<button class="cuisine-filter-chip" onclick="location.href=\'#menu\'">Menu</button>' : ''}
    ${allDrinks.length > 0 ? '<button class="cuisine-filter-chip" onclick="location.href=\'#drinks\'">Drinks</button>' : ''}
    ${tags.includes('Happy Hour') ? '<button class="cuisine-filter-chip" onclick="location.href=\'#happy-hour\'">Happy Hour</button>' : ''}
    <button class="cuisine-filter-chip" onclick="location.href='#reviews'">Reviews</button>
    <button class="cuisine-filter-chip" onclick="location.href='#events'">Events</button>
    <button class="cuisine-filter-chip" onclick="location.href='#photo-gallery-section'">📸 Photo Gallery</button>
    <button class="cuisine-filter-chip" onclick="location.href='#social-feed'">News Feed</button>
  `;

  // Single line horizontal scroll navigation - ensure nowrap
  if (navLinks) {
    navLinks.style.display = 'flex';
    navLinks.style.flexWrap = 'nowrap';
    navLinks.style.overflowX = 'auto';
    navLinks.style.overflowY = 'hidden';
    navLinks.style.webkitOverflowScrolling = 'touch';
  }
}

function renderProfile() {
  const container = document.getElementById('profile-container');

  // DEBUG: Check events at render time
  console.log("📄 renderProfile() called - currentBusiness.events:", currentBusiness.events?.length || 0);
  if (currentBusiness.events && currentBusiness.events.length > 0) {
    console.log("  First event in renderProfile():", currentBusiness.events[0]);
  }

  // Track business profile view
  if (window.analyticsTracker) {
    const businessId = currentBusiness.id || currentBusiness.business_id;
    window.analyticsTracker.trackBusinessView(businessId, currentBusiness.name, 'direct');
  }

  // Initialize menu analytics for this business
  if (window.menuAnalytics) {
    const businessId = currentBusiness.id || currentBusiness.business_id;
    window.menuAnalytics.init(businessId, currentBusiness.name);
  }

  // Normalize tags to always be an array (handle both string and array from CSV)
  const businessTags = currentBusiness.tags ?
    (Array.isArray(currentBusiness.tags) ? currentBusiness.tags : currentBusiness.tags.split(',').map(t => t.trim())) :
    [];

  // Get unique menu categories (time-based) and filter out "Sunset Menu"
  const rawMenuCategories = [...new Set(allMenuItems.map(item => item.category))].filter(cat => cat !== 'Sunset Menu');

  // Sort menu categories in meal time order (Happy Hour, Brunch, Lunch, Dinner)
  const categoryOrder = ['Happy Hour', 'HAPPY HOUR', 'Brunch', 'BRUNCH', 'Lunch', 'LUNCH', 'Dinner', 'DINNER'];
  const menuCategories = rawMenuCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const drinkCategories = [...new Set(allDrinks.map(drink => drink.category))];

  // Get unique food types (appetizers, seafood, etc.)
  const foodTypes = [...new Set(allMenuItems.map(item => item.type).filter(Boolean))].sort();

  container.innerHTML = `
    <!-- Large Loyalty Promo Button -->
    <div class="loyalty-promo-section">
      <button class="loyalty-promo-button" onclick="openLoyaltySignup('${currentBusiness.id}', false)">
        <div class="loyalty-promo-icon">🎁</div>
        <div class="loyalty-promo-content">
          <div class="loyalty-promo-title">Sign Up for Exclusive Deals!</div>
          <div class="loyalty-promo-subtitle">Special offers sent directly to your phone</div>
        </div>
        <div class="loyalty-promo-arrow">→</div>
      </button>
    </div>

    <!-- Compact Hero Section -->
    <section class="profile-hero-compact">
      <div class="profile-hero-content-compact">
        <h1 class="profile-name-compact">${currentBusiness.name}</h1>
        <button onclick="openClaimBusinessModal('${currentBusiness.id}', '${currentBusiness.name}')" style="background: none; border: 1px solid rgba(255,255,255,0.3); color: var(--text-secondary); padding: 6px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; margin: 8px auto 16px auto; display: block; transition: all 0.2s; font-weight: 500;" onmouseover="this.style.borderColor='var(--primary)'; this.style.color='var(--primary)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.3)'; this.style.color='var(--text-secondary)';">
          👤 Claim this business
        </button>
        ${currentBusiness.images && currentBusiness.images.length > 0 ? `
          <div class="profile-image-gallery">
            <div class="gallery-container">
              ${currentBusiness.images.map((img, index) => `
                <img src="${img}" alt="${currentBusiness.name} - Image ${index + 1}" class="gallery-image ${index === 0 ? 'active' : ''}" data-index="${index}">
              `).join('')}
            </div>
            ${currentBusiness.images.length > 1 ? `
              <button class="gallery-nav gallery-prev" onclick="changeGalleryImage(-1)">‹</button>
              <button class="gallery-nav gallery-next" onclick="changeGalleryImage(1)">›</button>
              <div class="gallery-dots">
                ${currentBusiness.images.map((_, index) => `
                  <span class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="goToGalleryImage(${index})"></span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : currentBusiness.image ? `
          <div class="profile-image-hero">
            <img src="${currentBusiness.image}" alt="${currentBusiness.name}" class="profile-hero-img">
          </div>
        ` : ''}
        <!-- Row 1: Cuisine/Tags -->
        <div style="text-align: center; padding: 12px 16px; color: var(--text); font-size: 15px; font-weight: 600;">
          ${currentBusiness.tags && businessTags.length > 0 ?
            (Array.isArray(currentBusiness.tags) ? currentBusiness.tags : currentBusiness.tags.split(',')).slice(0, 3).map(t => t.trim()).join(' • ') :
            (currentBusiness.cuisine || currentBusiness.category)}
        </div>

        <!-- Row 2: Address, Hours, Status, Price, Rating -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 0 16px 12px 16px; justify-content: center; align-items: center;">
          <div class="profile-meta-compact">📍 ${currentBusiness.address}</div>
          ${currentBusiness.hours ? `<div class="profile-meta-compact">🕐 ${getTodayHours(currentBusiness.hours)}</div>` : ''}
          ${(() => {
            const status = getBusinessStatus(currentBusiness.hours);
            return status.text ? `<div class="business-status-badge ${status.class}">${status.text}</div>` : '';
          })()}
          ${currentBusiness.priceLevel ? `<div class="profile-meta-compact">💵 ${currentBusiness.priceLevel}</div>` : ''}
          ${currentBusiness.rating ? `<div class="profile-meta-compact">⭐ ${currentBusiness.rating} / 5.0</div>` : ''}
        </div>
        ${currentBusiness.description ? `
          <div class="profile-about-compact">
            <h3 style="font-size: 18px; font-weight: 700; margin: 16px 0 8px 0; color: var(--text);">About</h3>
            <p class="about-preview" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; color: var(--text-secondary);">${currentBusiness.description}</p>
            <button class="btn-read-more" onclick="openAboutModal()" style="margin-top: 8px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Read More</button>
          </div>
        ` : ''}
        ${currentBusiness.tags && businessTags.length > 0 ? `
          <div class="profile-tags-compact">
            ${businessTags.map(tag => `<span class="tag-chip-compact">${tag}</span>`).join('')}
          </div>
        ` : ''}
        ${currentBusiness.specialOffer ? `
          <div class="special-offer-banner" style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #F59E0B, #EF4444); border-radius: 12px; text-align: center; animation: pulse 2s infinite;">
            <div style="font-size: 24px; margin-bottom: 4px;">🎉</div>
            <div style="color: white; font-weight: 700; font-size: 18px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${currentBusiness.specialOffer}</div>
            ${currentBusiness.specialOfferExpiry ? `<div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 4px;">Valid until ${currentBusiness.specialOfferExpiry}</div>` : ''}
          </div>
        ` : ''}

        ${currentBusiness.paymentMethods ? `
          <div class="payment-methods" style="margin: 16px 0; padding: 12px 16px; background: var(--bg); border-radius: 12px;">
            <div style="font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 8px; text-align: center;">Payment Methods</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
              ${currentBusiness.paymentMethods.split(',').map(method => {
                const trimmed = method.trim();
                const paymentIcons = {
                  'Cash': '💵',
                  'Credit Card': '💳',
                  'Debit Card': '💳',
                  'Apple Pay': '🍎',
                  'Google Pay': '📱',
                  'Venmo': '💙',
                  'PayPal': '🅿️'
                };
                const icon = paymentIcons[trimmed] || '💳';
                return `<span style="padding: 6px 10px; background: var(--bg-elevated); border-radius: 6px; font-size: 13px; color: var(--text);">${icon} ${trimmed}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
        ${(currentBusiness.facebook || currentBusiness.instagram || currentBusiness.twitter || currentBusiness.tiktok || currentBusiness.youtube) ? `
          <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: center; flex-wrap: wrap;">
            ${currentBusiness.facebook ? `<a href="${currentBusiness.facebook}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #1877F2; border-radius: 50%; color: white; text-decoration: none; font-size: 20px;" title="Facebook" onclick="event.stopPropagation()">f</a>` : ''}
            ${currentBusiness.instagram ? `<a href="${currentBusiness.instagram}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 50%; color: white; text-decoration: none; font-size: 20px;" title="Instagram" onclick="event.stopPropagation()">📷</a>` : ''}
            ${currentBusiness.twitter ? `<a href="${currentBusiness.twitter}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #1DA1F2; border-radius: 50%; color: white; text-decoration: none; font-size: 20px;" title="Twitter/X" onclick="event.stopPropagation()">𝕏</a>` : ''}
            ${currentBusiness.tiktok ? `<a href="${currentBusiness.tiktok}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #000000; border-radius: 50%; color: white; text-decoration: none; font-size: 20px;" title="TikTok" onclick="event.stopPropagation()">🎵</a>` : ''}
            ${currentBusiness.youtube ? `<a href="${currentBusiness.youtube}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #FF0000; border-radius: 50%; color: white; text-decoration: none; font-size: 20px;" title="YouTube" onclick="event.stopPropagation()">▶</a>` : ''}
          </div>
        ` : ''}
        ${currentBusiness.reservation ? `
          <div class="reservation-badge-compact" style="margin-top: 12px;">
            📅 Reservations Available
          </div>
        ` : ''}
        <div class="profile-actions-compact">
          ${currentBusiness.reservationUrl || currentBusiness.bookingUrl ? `
            <a href="${currentBusiness.reservationUrl || currentBusiness.bookingUrl}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">📅 Reservations</a>
          ` : ''}
          ${currentBusiness.togoUrl ? `
            <a href="${currentBusiness.togoUrl}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">🥡 To-Go</a>
          ` : ''}
          ${currentBusiness.deliveryUrl ? `
            <a href="${currentBusiness.deliveryUrl}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">🚗 Delivery</a>
          ` : ''}
          ${currentBusiness.orderOnlineUrl ? `
            <a href="${currentBusiness.orderOnlineUrl}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">🍽️ Order Online</a>
          ` : ''}
          <a href="tel:${currentBusiness.phone}" class="btn btn-primary" onclick="if(window.analyticsTracker){window.analyticsTracker.trackBusinessAction('${currentBusiness.id || currentBusiness.business_id}', '${currentBusiness.name}', 'call');}">📞 Call Now</a>
          <a href="#" onclick="openMaps('${currentBusiness.address.replace(/'/g, "\\'")}'); return false;" class="btn btn-primary">🗺️ Get Directions</a>
          <button class="btn btn-loyalty" onclick="if(window.analyticsTracker){window.analyticsTracker.trackBusinessAction('${currentBusiness.id || currentBusiness.business_id}', '${currentBusiness.name}', 'loyalty');}openLoyaltySignup('${currentBusiness.id}')">🎁 Coupons</button>
          <button class="btn btn-primary" onclick="if(window.analyticsTracker){window.analyticsTracker.trackBusinessAction('${currentBusiness.id || currentBusiness.business_id}', '${currentBusiness.name}', 'share');}shareBusiness()">🔗 Share</button>
          <button class="btn-ask-ai" onclick="openBusinessAIChat()"><span class="ai-icon">🤖</span> Ask AI About ${currentBusiness.name}</button>
        </div>
      </div>
    </section>

    <!-- Photo Review Button (The Gulf only) -->
    ${(currentBusiness.id === 'the-gulf' || currentBusiness.id === 'the-gulf-restaurant') ? `
      <div class="photo-review-section" style="text-align: center; margin: 24px 0;">
        <button class="photo-review-button" onclick="openPhotoReviewModal('${currentBusiness.id}')">
          📸 Share a Photo
        </button>
      </div>
    ` : ''}

    <!-- Calendar Button -->
    <div class="calendar-button-center">
      <button class="calendar-button" onclick="openCalendarModal('${currentBusiness.id}')">
        📅 View Events Calendar
      </button>
    </div>

    <!-- Pricing Section -->
    ${currentBusiness.pricing ? `
      <section class="profile-section" style="background: var(--bg-elevated); margin: 20px 0;">
        <h2 class="profile-section-title">💵 Pricing & Fees</h2>
        <div class="pricing-info-container" style="padding: 0 16px;">
          ${currentBusiness.pricing.map(item => `
            <div class="pricing-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-primary); font-size: 15px;">${item.name}</div>
                ${item.description ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${item.description}</div>` : ''}
              </div>
              <div style="font-weight: 700; color: var(--primary-color); font-size: 16px; margin-left: 16px;">
                ${item.price}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Menu Section -->
    ${allMenuItems.length > 0 ? `
      <section id="menu" class="profile-section" style="background: var(--bg-elevated); position: relative;">
        <h2 class="profile-section-title">Menu</h2>

        <!-- Sticky Menu Header -->
        <div class="sticky-menu-header" style="position: sticky; top: 135px; z-index: 101; background: var(--bg-elevated); padding: 0; margin: 0 !important; border-bottom: 2px solid var(--border-color); width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Current Hours Banner -->
          <div class="current-hours-banner" style="margin: 0 !important; padding: 12px 20px !important; border-bottom: 1px solid var(--border-color);">
            <span class="current-time-label">Currently Serving:</span>
            <span class="current-time-info">${getCurrentMealTime()} (${getMealTimeRange(getCurrentMealTime())})</span>
          </div>

          ${(() => {
            // Check if it's happy hour time
            const now = new Date();
            const hour = now.getHours();
            const isHappyHour = (hour >= 15 && hour < 18); // 3pm-6pm

            if (isHappyHour && currentBusiness.tags && businessTags.includes('Happy Hour')) {
              return `
                <div onclick="location.href='#happy-hour'" style="background: linear-gradient(135deg, #14B8A6, #0EA5E9); color: white; padding: 8px 16px; text-align: center; font-weight: 700; margin: 0; animation: pulse 2s infinite; border-bottom: 1px solid rgba(255,255,255,0.3); cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                  🍹 HAPPY HOUR NOW! Check out our specials below
                </div>
              `;
            }
            return '';
          })()}

          <!-- Time-based Menu Categories (Brunch, Lunch, Dinner) -->
          ${menuCategories.length >= 1 ? `
            <div class="menu-categories" style="margin: 0; padding: 12px 20px; border-bottom: 1px solid var(--border-color); display: flex; gap: 8px; overflow-x: auto; scrollbar-width: thin;">
              <button class="menu-category-chip active" data-category="all">All</button>
              ${menuCategories.map(cat => `
                <button class="menu-category-chip" data-category="${cat}">${cat}</button>
              `).join('')}
            </div>
          ` : ''}

          <!-- Food Type & Dietary Filters -->
          ${foodTypes.length > 0 ? `
            <div class="food-type-filters" style="margin: 0; padding: 12px 20px; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: thin;">
              <button class="food-type-chip active" data-type="all">All</button>
              ${foodTypes.map(type => `
                <button class="food-type-chip" data-type="${type}">${type}</button>
              `).join('')}
              <button class="food-type-chip" data-dietary="vegetarian">🌱 Vegetarian</button>
              <button class="food-type-chip" data-dietary="vegan">🥬 Vegan</button>
              <button class="food-type-chip" data-dietary="gluten-free">🌾 Gluten Free</button>
              <button class="food-type-chip" data-dietary="spicy">🌶️ Spicy</button>
              <button class="food-type-chip" data-dietary="low-calorie">🔥 Low Cal</button>
              <button class="food-type-chip" data-dietary="seafood">🦐 Seafood</button>
            </div>
          ` : ''}
        </div>

        <!-- Menu Items -->
        <div id="menu-items-container" class="menu-items-grid">
          ${renderMenuItems(filteredMenuItems)}
        </div>
      </section>
    ` : ''}

    <!-- Drinks Section -->
    ${allDrinks.length > 0 ? `
      <section id="drinks" class="profile-section" style="background: var(--bg-elevated); position: relative;">
        <h2 class="profile-section-title">🍹 Drinks Menu</h2>

        <!-- Drink Items -->
        <div id="drink-items-container" class="menu-items-grid">
          ${renderDrinkItems(allDrinks)}
        </div>
      </section>
    ` : ''}

    <!-- Happy Hour Section -->
    ${currentBusiness.tags && businessTags.includes('Happy Hour') ? `
      <section id="happy-hour" class="profile-section" style="background: var(--bg-elevated);">
        <h2 class="profile-section-title">🍹 Happy Hour</h2>
        <div class="happy-hour-header">
          <h3>Happy Hours</h3>
          <p class="happy-hour-time">${currentBusiness.happyHour || 'Check with restaurant for current happy hour times and specials'}</p>
        </div>
        ${currentBusiness.happyHours && currentBusiness.happyHours.length > 0 ? `
          <div class="happy-hour-specials-grid">
            ${currentBusiness.happyHours.map(special => `
              <div class="happy-hour-card" onclick="showHappyHourDetail('${special.name.replace(/'/g, "\\'")}', '${special.description.replace(/'/g, "\\'")}', '${special.category}')">
                <h4 class="happy-hour-card-title">${special.name}</h4>
                <p class="happy-hour-card-description">${special.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Packages Section -->
    ${allPackages.length > 0 ? `
      <section id="packages" class="profile-section">
        <h2 class="profile-section-title">Packages</h2>
        <div class="menu-items-grid">
          ${renderPackages(allPackages)}
        </div>
      </section>
    ` : ''}

    <!-- Customer Reviews Section -->
    <section id="reviews" class="profile-section" style="background: var(--bg-elevated);">
      <h2 class="profile-section-title">⭐ Customer Reviews</h2>

      <!-- Write Review Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <button onclick="openReviewModal('${currentBusiness.id}')" class="btn btn-primary" style="padding: 12px 24px; font-size: 16px; font-weight: 600;">
          ✍️ Write a Review
        </button>
      </div>

      <!-- Reviews List -->
      <div id="reviews-container">
        ${renderBusinessReviews(currentBusiness.id)}
      </div>
    </section>

    <!-- Events Section -->
    <section id="events" class="profile-section" style="background: var(--bg-elevated);">
      <h2 class="profile-section-title">📅 Upcoming Events</h2>
      <div id="events-container" class="events-grid">
        ${currentBusiness.events && currentBusiness.events.length > 0 ? `
          ${currentBusiness.events.map((event, index) => `
            <div class="event-card" data-event-index="${index}">
              <h3 class="event-card-title">${event.name}</h3>
              <p class="event-card-description">${event.description.replace(/\n/g, '<br>')}</p>
              <div class="event-card-details">
                <span>📅 ${event.day}</span>
                <span>🕐 ${event.time}</span>
              </div>
            </div>
          `).join('')}
        ` : `
          <p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">
            Click "View Events Calendar" above to see all upcoming events, specials, and live entertainment!
          </p>
        `}
      </div>
    </section>

    <!-- Photo Gallery Section -->
    <section id="photo-gallery-section" class="profile-section" style="background: var(--bg-elevated);">
      <div class="photo-gallery-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 16px;">
        <div>
          <h2 class="profile-section-title" style="margin: 0;">📸 Photo Gallery</h2>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">Photos from our guests</p>
        </div>
        <div id="photo-stats" class="photo-stats" style="display: flex; gap: 16px; font-size: 14px; color: var(--text-secondary);"></div>
      </div>
      <div id="photo-gallery" class="photo-gallery" style="padding: 0 16px;"></div>
    </section>

    <!-- Social Media News Feed Section -->
    <section id="social-feed" class="profile-section news-feed-section">
      <div class="news-feed-header">
        <div>
          <h2 class="profile-section-title news-feed-title">📱 News Feed</h2>
          <p class="news-feed-subtitle">Latest updates from ${currentBusiness.name}</p>
        </div>
        ${renderSocialLinks(currentBusiness.id)}
      </div>
      <div id="social-posts-container">
        ${renderSocialFeed(currentBusiness.id)}
      </div>
    </section>

    <!-- Reviews Section -->
    ${typeof reviewsManager !== 'undefined' ? reviewsManager.renderReviewsSection(currentBusiness.id) : ''}

    <!-- You May Also Like Section -->
    ${typeof recommendationsEngine !== 'undefined' && typeof allBusinesses !== 'undefined' ? recommendationsEngine.renderSimilarBusinesses(allBusinesses, currentBusiness) : ''}

    <!-- Amenities Section (Bottom of Page) -->
    ${currentBusiness.amenities || currentBusiness.parking ? `
      <section class="profile-section" style="margin-top: 32px; padding: 24px 16px; background: var(--bg); border-radius: 12px;">
        <h2 class="profile-section-title" style="text-align: center; margin-bottom: 20px;">Amenities</h2>

        ${currentBusiness.description ? `
          <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-elevated); border-radius: 12px;">
            <div style="display: flex; align-items: start; gap: 8px;">
              <span style="font-size: 20px;">✓</span>
              <p style="color: var(--text-secondary); margin: 0; line-height: 1.6; font-size: 15px;">${currentBusiness.description}</p>
            </div>
          </div>
        ` : ''}

        ${currentBusiness.parking ? `
          <div style="margin-bottom: 16px; padding: 16px; background: var(--bg-elevated); border-radius: 12px;">
            <div style="display: flex; align-items: start; gap: 8px;">
              <span style="font-size: 20px;">🅿️</span>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 15px; color: var(--text); margin-bottom: 4px;">Parking</div>
                <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.4;">${currentBusiness.parking}</div>
              </div>
            </div>
          </div>
        ` : ''}

        ${currentBusiness.amenities ? `
          <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
            ${currentBusiness.amenities.split(',').map(amenity => {
              const trimmed = amenity.trim();
              const amenityIcons = {
                'WiFi': '📶',
                'Outdoor Seating': '🌴',
                'Pet Friendly': '🐕',
                'Live Music': '🎵',
                'Parking Available': '🅿️',
                'Wheelchair Accessible': '♿',
                'Beach View': '🌊',
                'Bar': '🍺',
                'Full Bar': '🍸',
                'Kids Menu': '👶',
                'Takeout': '🥡',
                'Delivery': '🚗',
                'Credit Cards': '💳',
                'Reservations': '📅'
              };
              const icon = amenityIcons[trimmed] || '✓';
              return `
                <div style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--bg-elevated); border-radius: 8px; color: var(--text);">
                  <span style="font-size: 20px;">${icon}</span>
                  <span style="font-size: 14px; font-weight: 600;">${trimmed}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Menu Item Modal -->
    <div id="menu-item-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" onclick="closeMenuItemModal()">&times;</button>
        <div id="modal-body"></div>
      </div>
    </div>

    <!-- About Business Modal -->
    <div id="about-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; align-items: center; justify-content: center; padding: 20px;">
      <div class="modal-content" style="background: var(--bg-elevated); border-radius: 16px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; position: relative; padding: 24px;">
        <button class="modal-close" onclick="closeAboutModal()" style="position: absolute; top: 16px; right: 16px; background: transparent; border: none; font-size: 32px; color: var(--text); cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;">&times;</button>

        <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 16px 0; color: var(--text); padding-right: 40px;">About ${currentBusiness.name}</h2>

        <div style="margin-bottom: 20px;">
          ${currentBusiness.image ? `
            <img src="${currentBusiness.image}" alt="${currentBusiness.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;">
          ` : ''}

          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--primary);">Description</h3>
            <p style="line-height: 1.6; color: var(--text-secondary); margin: 0;">${currentBusiness.description || 'No description available.'}</p>
          </div>

          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--primary);">Details</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">📍</span>
                <span style="color: var(--text-secondary);">${currentBusiness.address}</span>
              </div>
              ${currentBusiness.phone ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">📞</span>
                  <a href="tel:${currentBusiness.phone}" style="color: var(--primary); text-decoration: none;">${currentBusiness.phone}</a>
                </div>
              ` : ''}
              ${currentBusiness.hours ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">🕐</span>
                  <span style="color: var(--text-secondary);">${typeof convertTo12Hour !== 'undefined' && typeof currentBusiness.hours === 'string' ? convertTo12Hour(currentBusiness.hours) : currentBusiness.hours}</span>
                </div>
              ` : ''}
              ${currentBusiness.priceLevel ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">💵</span>
                  <span style="color: var(--text-secondary);">${currentBusiness.priceLevel}</span>
                </div>
              ` : ''}
              ${currentBusiness.rating ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">⭐</span>
                  <span style="color: var(--text-secondary);">${currentBusiness.rating} / 5.0</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${currentBusiness.cuisine ? `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--primary);">Cuisine</h3>
              <p style="color: var(--text-secondary); margin: 0;">${currentBusiness.cuisine}</p>
            </div>
          ` : ''}

          ${currentBusiness.tags && businessTags.length > 0 ? `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--primary);">Features</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${businessTags.map(tag => `
                  <span style="padding: 6px 12px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">${tag}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${currentBusiness.happyHour ? `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--primary);">Happy Hour</h3>
              <p style="color: var(--text-secondary); margin: 0;">🍹 ${currentBusiness.happyHour}</p>
            </div>
          ` : ''}
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="tel:${currentBusiness.phone}" class="btn btn-primary" style="flex: 1; min-width: 150px; text-align: center; text-decoration: none; padding: 12px 20px; border-radius: 8px;" onclick="if(window.analyticsTracker){window.analyticsTracker.trackBusinessAction('${currentBusiness.id || currentBusiness.business_id}', '${currentBusiness.name}', 'call');}">📞 Call Now</a>
          <a href="#" onclick="openMaps('${currentBusiness.address.replace(/'/g, "\\'")}'); return false;" class="btn btn-primary" style="flex: 1; min-width: 150px; text-align: center; text-decoration: none; padding: 12px 20px; border-radius: 8px;">🗺️ Directions</a>
        </div>
      </div>
    </div>
  `;

  // Setup category chip listeners
  const menuSection = document.querySelector('#menu');
  if (menuSection) {
    menuSection.querySelectorAll('.menu-category-chip').forEach(chip => {
      chip.addEventListener('click', handleMenuCategoryClick);
    });

    // Setup food type filter listeners (includes dietary filters now)
    menuSection.querySelectorAll('.food-type-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        // Check if this is a dietary filter
        if (chip.hasAttribute('data-dietary')) {
          handleDietaryFilterClick(e);
        } else {
          handleFoodTypeClick(e);
        }
      });
    });

    // Setup scroll spy for category buttons
    setupMenuScrollSpy();
  }

  const drinksSection = document.querySelector('#drinks');
  if (drinksSection) {
    drinksSection.querySelectorAll('.menu-category-chip').forEach(chip => {
      chip.addEventListener('click', handleDrinkCategoryClick);
    });
  }

  // Setup event card listeners
  document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', function() {
      const eventIndex = parseInt(this.getAttribute('data-event-index'));
      const event = currentBusiness.events[eventIndex];
      showEventDetail(event);
    });
  });

  // Setup navigation
  document.querySelectorAll('.profile-nav-link').forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // Setup scroll detection for active section highlighting
  setupScrollDetection();
}

function setInitialMealTimeFilter() {
  const menuSection = document.querySelector('#menu');
  if (!menuSection) return;

  // Get the current meal time
  const currentMealTime = getCurrentMealTime();

  // Check if this meal time exists in the menu
  const availableCategories = [...new Set(allMenuItems.map(item => item.category))];

  if (availableCategories.includes(currentMealTime)) {
    // Set the category
    currentMenuCategory = currentMealTime;

    // Find and activate the corresponding button
    const buttons = menuSection.querySelectorAll('.menu-category-chip');
    buttons.forEach(btn => {
      const category = btn.getAttribute('data-category');
      if (category === currentMealTime) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update food type filters for the initial meal time
    updateFoodTypeFilters(currentMealTime);

    // Apply the filter
    applyMenuFilters();
  }
}

function renderMenuItems(items) {
  if (items.length === 0) {
    return '<p style="color: var(--text-muted); padding: 20px;">No menu items found</p>';
  }

  // Group items by category (BRUNCH, LUNCH, DINNER) then by type
  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {};
    }
    const type = item.type || 'Other';
    if (!acc[item.category][type]) {
      acc[item.category][type] = [];
    }
    acc[item.category][type].push(item);
    return acc;
  }, {});

  let html = '';
  let globalIndex = 0;

  // Get current meal time to prioritize it
  const currentMeal = getCurrentMealTime();

  // Sort categories so current meal time is first
  const categories = Object.keys(groupedByCategory).sort((a, b) => {
    // Check if either matches current meal time (case insensitive)
    const aIsCurrent = a.toLowerCase() === currentMeal.toLowerCase();
    const bIsCurrent = b.toLowerCase() === currentMeal.toLowerCase();

    if (aIsCurrent && !bIsCurrent) return -1;  // a comes first
    if (!aIsCurrent && bIsCurrent) return 1;   // b comes first

    // Otherwise maintain order (Happy Hour, Brunch, Lunch, Dinner)
    const order = ['Happy Hour', 'HAPPY HOUR', 'Brunch', 'BRUNCH', 'Lunch', 'LUNCH', 'Dinner', 'DINNER'];
    return order.indexOf(a) - order.indexOf(b);
  });

  // Render each category section
  categories.forEach((category, catIndex) => {
    const timeRange = getMealTimeRange(category);
    const categoryDisplay = timeRange ? `${category} <span style="font-size: 18px; font-weight: 600; color: #666;">(${timeRange})</span>` : category;
    // Reduced top margin from 32px to 24px, and bottom from 24px to 12px
    html += `<h2 style="text-align: center; font-size: 28px; font-weight: 900; color: var(--primary); margin: ${catIndex === 0 ? '16px' : '24px'} 0 12px 0; text-transform: uppercase;">${categoryDisplay}</h2>`;

    const types = groupedByCategory[category];

    // Render each type section within the category
    Object.keys(types).forEach((type, typeIndex) => {
      // Reduced margins: top from 24px to 12px, bottom from 16px to 8px
      html += `<h3 style="text-align: center; font-size: 18px; font-weight: 700; color: var(--text); margin: ${typeIndex === 0 ? '8px' : '12px'} 0 8px 0; text-transform: uppercase;">${type}</h3>`;

      // Render items for this type
      html += types[type].map(item => {
        const itemHtml = `
          <div class="menu-item-card" onclick="openMenuItemModal(${globalIndex}, 'menu')">
            <div class="menu-item-header">
              <div class="menu-item-name">${item.name || ''}</div>
              <div class="menu-item-price">${item.price || ''}</div>
            </div>
            ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
          </div>
        `;
        globalIndex++;
        return itemHtml;
      }).join('');
    });
  });

  return html;
}

function renderDrinkItems(items) {
  if (items.length === 0) {
    return '<p style="color: var(--text-muted); padding: 20px;">No drinks found</p>';
  }

  // Group items by section (Cocktails, Beer, Wine, etc.)
  const groupedBySection = items.reduce((acc, item) => {
    const section = item.section || item.type || 'Other Drinks';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {});

  let html = '';
  let globalIndex = 0;

  // Define section order
  const sectionOrder = ['Cocktails', 'Beer', 'Wine', 'Non-Alcoholic', 'Specialty Drinks', 'Other Drinks'];
  const sections = Object.keys(groupedBySection).sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a);
    const bIndex = sectionOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Render each section - SAME VERTICAL LAYOUT AS MENU ITEMS
  sections.forEach((section, sectionIndex) => {
    const sectionItems = groupedBySection[section];

    html += `<h3 style="text-align: center; font-size: 22px; font-weight: 700; color: var(--text); margin: ${sectionIndex === 0 ? '16px' : '24px'} 0 12px 0; text-transform: uppercase;">${section}</h3>`;

    html += sectionItems.map(item => {
      const itemHtml = `
        <div class="menu-item-card" onclick="openMenuItemModal(${globalIndex}, 'drink')">
          <div class="menu-item-header">
            <div class="menu-item-name">${item.name || ''}</div>
            <div class="menu-item-price">${item.price || ''}</div>
          </div>
          ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
        </div>
      `;
      globalIndex++;
      return itemHtml;
    }).join('');
  });

  return html;
}

function renderPackages(items) {
  if (items.length === 0) {
    return '<p style="color: var(--text-muted); padding: 20px;">No packages available</p>';
  }

  return items.map((item, index) => `
    <div class="menu-item-card" onclick="openMenuItemModal(${index}, 'package')">
      <div class="menu-item-header">
        <div class="menu-item-name">${item.name || ''}</div>
        <div class="menu-item-price">${item.price || ''}</div>
      </div>
      ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
    </div>
  `).join('');
}

function setupMenuSearch() {
  const searchInput = document.getElementById('menu-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      // No search query - just apply the current filters
      applyMenuFilters();
    } else {
      // Start with all items
      let baseItems = [...allMenuItems];

      // Apply time-based category filter
      if (currentMenuCategory !== 'all') {
        baseItems = baseItems.filter(item => item.category === currentMenuCategory);
      }

      // Apply food type filter
      if (currentFoodType !== 'all') {
        baseItems = baseItems.filter(item => item.type === currentFoodType);
      }

      // Apply search query on filtered items
      filteredMenuItems = baseItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );

      document.getElementById('menu-items-container').innerHTML = renderMenuItems(filteredMenuItems);
    }
  }, 300));
}

function setupDrinkSearch() {
  const searchInput = document.getElementById('drink-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      filteredDrinks = currentDrinkCategory === 'all' ?
        [...allDrinks] :
        allDrinks.filter(item => item.category === currentDrinkCategory);
    } else {
      const baseItems = currentDrinkCategory === 'all' ?
        allDrinks :
        allDrinks.filter(item => item.category === currentDrinkCategory);

      filteredDrinks = baseItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    document.getElementById('drink-items-container').innerHTML = renderDrinkItems(filteredDrinks);
  }, 300));
}

function handleMenuCategoryClick(e) {
  const selectedCategory = e.target.getAttribute('data-category');
  currentMenuCategory = selectedCategory;
  const menuSection = document.querySelector('#menu');

  // Remove active class from all chips
  menuSection.querySelectorAll('.menu-category-chip').forEach(chip => {
    chip.classList.remove('active');
  });

  // Add active class to clicked chip
  e.target.classList.add('active');

  // Reset food type filter to "All Types"
  currentFoodType = 'all';

  // Update food type filters based on selected meal category
  updateFoodTypeFilters(selectedCategory);

  // Apply both filters (time category AND food type)
  applyMenuFilters();

  const searchInput = document.getElementById('menu-search');
  if (searchInput) searchInput.value = '';
}

function updateFoodTypeFilters(mealCategory) {
  const menuSection = document.querySelector('#menu');
  const foodTypeContainer = menuSection.querySelector('.food-type-filters');

  if (!foodTypeContainer) return;

  // Get items for the selected meal category
  let relevantItems = mealCategory === 'all' ?
    [...allMenuItems] :
    allMenuItems.filter(item => item.category === mealCategory);

  // Get unique food types from those items
  const foodTypes = [...new Set(relevantItems.map(item => item.type).filter(Boolean))].sort();

  // Rebuild the food type filter buttons (including dietary filters)
  if (foodTypes.length > 0) {
    foodTypeContainer.innerHTML = `
      <button class="food-type-chip active" data-type="all">All Types</button>
      ${foodTypes.map(type => `
        <button class="food-type-chip" data-type="${type}">${type}</button>
      `).join('')}
      <button class="food-type-chip" data-dietary="vegetarian">🌱 Vegetarian</button>
      <button class="food-type-chip" data-dietary="vegan">🥬 Vegan</button>
      <button class="food-type-chip" data-dietary="gluten-free">🌾 Gluten Free</button>
      <button class="food-type-chip" data-dietary="spicy">🌶️ Spicy</button>
      <button class="food-type-chip" data-dietary="low-calorie">🔥 Low Cal</button>
      <button class="food-type-chip" data-dietary="seafood">🦐 Seafood</button>
    `;

    // Re-attach event listeners to new buttons
    foodTypeContainer.querySelectorAll('.food-type-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        // Check if this is a dietary filter
        if (chip.hasAttribute('data-dietary')) {
          handleDietaryFilterClick(e);
        } else {
          handleFoodTypeClick(e);
        }
      });
    });

    foodTypeContainer.style.display = 'flex';
  } else {
    foodTypeContainer.style.display = 'none';
  }
}

function handleFoodTypeClick(e) {
  const selectedType = e.target.getAttribute('data-type');
  currentFoodType = selectedType;
  const menuSection = document.querySelector('#menu');

  // Remove active class from all food type chips
  menuSection.querySelectorAll('.food-type-chip').forEach(chip => {
    chip.classList.remove('active');
  });

  // Add active class to clicked chip
  e.target.classList.add('active');

  // Apply both filters (time category AND food type)
  applyMenuFilters();

  const searchInput = document.getElementById('menu-search');
  if (searchInput) searchInput.value = '';
}

function applyMenuFilters() {
  // Start with all items
  let items = [...allMenuItems];

  // Apply time-based category filter (Brunch, Lunch, Dinner)
  if (currentMenuCategory !== 'all') {
    items = items.filter(item => item.category === currentMenuCategory);
  }

  // Apply food type filter (Appetizers, Seafood, etc.)
  if (currentFoodType !== 'all') {
    items = items.filter(item => item.type === currentFoodType);
  }

  // Apply dietary filters if any are active
  if (activeDietaryFilters.length > 0) {
    items = items.filter(item => {
      // Check if item has dietary tags
      const itemTags = item.tags || [];
      // Item must match ALL active dietary filters
      return activeDietaryFilters.every(filter =>
        itemTags.map(tag => tag.toLowerCase()).includes(filter.toLowerCase())
      );
    });
  }

  filteredMenuItems = items;
  document.getElementById('menu-items-container').innerHTML = renderMenuItems(filteredMenuItems);
}

function handleDietaryFilterClick(e) {
  const dietary = e.target.getAttribute('data-dietary');

  // Toggle active state
  if (activeDietaryFilters.includes(dietary)) {
    // Remove filter
    activeDietaryFilters = activeDietaryFilters.filter(f => f !== dietary);
    e.target.classList.remove('active');
  } else {
    // Add filter
    activeDietaryFilters.push(dietary);
    e.target.classList.add('active');
  }

  // Reapply all filters
  applyMenuFilters();
}

function setupMenuScrollSpy() {
  let isUserScrolling = true; // Track if user is manually scrolling
  let scrollTimeout;
  let ticking = false; // Throttle scroll events

  window.addEventListener('scroll', () => {
    isUserScrolling = true;
    clearTimeout(scrollTimeout);

    // Throttle scroll events using requestAnimationFrame
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveCategory();
        ticking = false;
      });
      ticking = true;
    }

    // After scrolling stops for 150ms, do final update
    scrollTimeout = setTimeout(() => {
      updateActiveCategory();
      isUserScrolling = false;
    }, 150);
  });

  // Initial check
  setTimeout(() => updateActiveCategory(), 500);
}

function updateActiveCategory() {
  const menuSection = document.querySelector('#menu');
  if (!menuSection) return;

  const menuContainer = document.getElementById('menu-items-container');
  if (!menuContainer) return;

  // Find all category headers (h2 elements for main categories like Starter, Entrée)
  const categoryHeaders = Array.from(menuContainer.querySelectorAll('h2'));
  if (categoryHeaders.length === 0) return;

  // Get scroll position - account for sticky header (165px) + buffer
  const scrollPos = window.scrollY + 250;

  // Find which category is currently in view (closest to scroll position)
  let activeCategory = 'all';
  let closestDistance = Infinity;

  categoryHeaders.forEach(header => {
    const headerTop = header.getBoundingClientRect().top + window.scrollY;
    const distance = Math.abs(scrollPos - headerTop);

    // If this header is above or at scroll position and closer than previous
    if (scrollPos >= headerTop && distance < closestDistance) {
      closestDistance = distance;
      // Extract category name from header text (remove time range and emojis)
      const headerText = header.textContent.trim();
      // Match word before parenthesis or emoji
      const categoryMatch = headerText.match(/^([A-Za-z\s]+?)(?:\s*\(|\s*$)/);
      if (categoryMatch) {
        activeCategory = categoryMatch[1].trim();
      }
    }
  });

  // If we're at the very top, show "all"
  if (window.scrollY < 200) {
    activeCategory = 'all';
  }

  // Update active button for menu categories
  const buttons = menuSection.querySelectorAll('.menu-category-chip');
  let foundActive = false;

  buttons.forEach(btn => {
    const btnCategory = btn.getAttribute('data-category');
    const isActive =
      btnCategory === activeCategory ||
      (activeCategory !== 'all' && btnCategory && btnCategory.toLowerCase() === activeCategory.toLowerCase());

    if (isActive) {
      btn.classList.add('active');
      foundActive = true;

      // Scroll the button into view if it's in the sticky header
      const stickyHeader = btn.closest('.sticky-menu-header');
      if (stickyHeader && !isButtonVisible(btn, stickyHeader)) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    } else {
      btn.classList.remove('active');
    }
  });

  // If no category matched, activate "all"
  if (!foundActive) {
    buttons.forEach(btn => {
      if (btn.getAttribute('data-category') === 'all') {
        btn.classList.add('active');
      }
    });
  }

  // Update active button for drinks section
  const drinksSection = document.querySelector('#drinks');
  if (drinksSection) {
    const drinksContainer = document.getElementById('drink-items-container');
    if (drinksContainer) {
      const drinkHeaders = Array.from(drinksContainer.querySelectorAll('h2'));
      let activeDrinkCategory = 'all';
      let closestDrinkDistance = Infinity;

      drinkHeaders.forEach(header => {
        const headerTop = header.getBoundingClientRect().top + window.scrollY;
        const distance = Math.abs(scrollPos - headerTop);

        if (scrollPos >= headerTop && distance < closestDrinkDistance) {
          closestDrinkDistance = distance;
          const headerText = header.textContent.trim();
          const categoryMatch = headerText.match(/^([A-Za-z\s]+?)(?:\s*\(|\s*$)/);
          if (categoryMatch) {
            activeDrinkCategory = categoryMatch[1].trim();
          }
        }
      });

      const drinkButtons = drinksSection.querySelectorAll('.menu-category-chip');
      drinkButtons.forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        if (btnCategory === activeDrinkCategory ||
            (activeDrinkCategory !== 'all' && btnCategory && btnCategory.toLowerCase() === activeDrinkCategory.toLowerCase())) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }
}

// Helper function to check if button is visible in its container
function isButtonVisible(button, container) {
  const buttonRect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    buttonRect.left >= containerRect.left &&
    buttonRect.right <= containerRect.right
  );
}

function handleDrinkCategoryClick(e) {
  const selectedCategory = e.target.getAttribute('data-category');
  const drinksSection = document.querySelector('#drinks');

  // Remove active class from all chips
  drinksSection.querySelectorAll('.menu-category-chip').forEach(chip => {
    chip.classList.remove('active');
  });

  // Add active class to clicked chip
  e.target.classList.add('active');

  // Filter drinks - if "all" is selected, show everything
  filteredDrinks = selectedCategory === 'all' ?
    [...allDrinks] :
    allDrinks.filter(item => item.category === selectedCategory);

  document.getElementById('drink-items-container').innerHTML = renderDrinkItems(filteredDrinks);
  const searchInput = document.getElementById('drink-search');
  if (searchInput) searchInput.value = '';
}

function handleNavClick(e) {
  e.preventDefault();

  document.querySelectorAll('.profile-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  e.target.classList.add('active');

  const targetId = e.target.getAttribute('href').substring(1);
  const targetSection = document.getElementById(targetId);

  if (targetSection) {
    const navHeight = 140; // Approximate height of both navs
    const targetPosition = targetSection.offsetTop - navHeight;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Platform-aware maps function
function openMaps(address) {
  const encodedAddress = encodeURIComponent(address);
  const userAgent = navigator.userAgent;

  // Track analytics
  if (currentBusiness && window.analyticsTracker) {
    const businessId = currentBusiness.id || currentBusiness.business_id;
    window.analyticsTracker.trackBusinessAction(businessId, currentBusiness.name, 'directions');
  }

  // Detect iOS
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    // Open Apple Maps on iOS
    window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
  }
  // Detect Android
  else if (/android/i.test(userAgent)) {
    // Open Google Maps on Android
    window.location.href = `geo:0,0?q=${encodedAddress}`;
  }
  // Desktop or other - use Google Maps web
  else {
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }
}

// Menu Item Modal Functions
function openMenuItemModal(index, type) {
  const item = type === 'menu' ? filteredMenuItems[index] : type === 'drink' ? filteredDrinks[index] : allPackages[index];
  const modal = document.getElementById('menu-item-modal');
  const modalBody = document.getElementById('modal-body');

  // Track analytics for menu item clicks
  if (currentBusiness && window.menuAnalytics) {
    const businessId = currentBusiness.id || currentBusiness.business_id;
    const itemId = `${businessId}-${item.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    window.menuAnalytics.trackItemClick(itemId, item.name, item.price, item.category || type);
  }

  // Create placeholder image URL (using picsum with item name as seed)
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(item.name)}/600/400`;

  modalBody.innerHTML = `
    <div class="modal-item-image">
      <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
    </div>
    <div class="modal-item-details">
      <h2 class="modal-item-name">${item.name}</h2>
      <p class="modal-item-category">${item.category}</p>
      <p class="modal-item-price">${item.price}</p>
      <p class="modal-item-description">${item.description || 'No description available'}</p>
      ${item.calories ? `<p class="modal-item-calories">🔥 ${item.calories} calories</p>` : ''}
      ${item.ingredients ? `<p class="modal-item-ingredients"><strong>Ingredients:</strong> ${item.ingredients}</p>` : ''}
      ${item.allergens ? `<p class="modal-item-allergens"><strong>Allergens:</strong> ${item.allergens}</p>` : ''}
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeMenuItemModal() {
  const modal = document.getElementById('menu-item-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('menu-item-modal');
  if (e.target === modal) {
    closeMenuItemModal();
  }
});

// Happy Hour Detail Modal
function showHappyHourDetail(name, description, category) {
  const modal = document.getElementById('menu-item-modal');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = `
    <div style="padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 32px; font-weight: 900; color: #14B8A6; margin: 0 0 8px 0; text-transform: uppercase;">${name}</h2>
        <span style="display: inline-block; padding: 8px 16px; background: rgba(20, 184, 166, 0.1); color: #14B8A6; border-radius: 20px; font-size: 14px; font-weight: 700;">${category}</span>
      </div>
      <div style="background: linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(14, 165, 233, 0.1)); border: 2px solid #14B8A6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="font-size: 18px; color: var(--text); line-height: 1.7; margin: 0;">${description}</p>
      </div>
      <div style="text-align: center;">
        <p style="font-size: 16px; color: var(--text-muted); margin: 0;">Available during Happy Hour times</p>
        <p style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">See restaurant for details</p>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Event Detail Modal
function showEventDetail(event) {
  const modal = document.getElementById('menu-item-modal');
  const modalBody = document.getElementById('modal-body');

  // Check if this event has menu items
  let menuItemsHTML = '';
  if (event.menuCategory && currentBusiness.menu) {
    const menuItems = currentBusiness.menu.filter(item => item.category === event.menuCategory);

    if (menuItems.length > 0) {
      // Group by type
      const groupedByType = menuItems.reduce((acc, item) => {
        const type = item.type || 'Items';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(item);
        return acc;
      }, {});

      menuItemsHTML = `
        <div style="margin-top: 24px;">
          <h3 style="text-align: center; font-size: 24px; font-weight: 800; color: var(--primary); margin-bottom: 20px;">Menu Items</h3>
          ${Object.keys(groupedByType).map(type => `
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 12px; text-align: center;">${type}</h4>
              ${groupedByType[type].map(item => `
                <div style="background: var(--bg); border: 2px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <span style="font-size: 16px; font-weight: 700; color: var(--text);">${item.name}</span>
                    <span style="font-size: 16px; font-weight: 800; color: var(--primary); white-space: nowrap; margin-left: 12px;">${item.price}</span>
                  </div>
                  <p style="font-size: 14px; color: var(--text-muted); margin: 0; line-height: 1.5;">${item.description}</p>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  modalBody.innerHTML = `
    <div style="padding: 32px; max-height: 80vh; overflow-y: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 32px; font-weight: 900; color: #F97316; margin: 0 0 16px 0; text-transform: uppercase;">${event.name}</h2>
      </div>
      <div style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(239, 68, 68, 0.1)); border: 3px solid #F97316; border-radius: 12px; padding: 28px; margin-bottom: 24px;">
        <p style="font-size: 18px; color: var(--text); line-height: 1.8; margin: 0 0 24px 0;">${event.description}</p>
        <div style="display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; font-size: 17px; font-weight: 600; color: var(--text);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">📅</span>
            <span>${event.day}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">🕐</span>
            <span>${event.time}</span>
          </div>
        </div>
      </div>
      ${menuItemsHTML}
      <div style="text-align: center; padding: 20px; background: rgba(249, 115, 22, 0.05); border-radius: 12px; margin-top: 24px;">
        <p style="font-size: 16px; color: var(--text); margin: 0; font-weight: 600;">📞 Call to reserve or for more information</p>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Scroll Detection for Active Section Highlighting
function setupScrollDetection() {
  const sections = document.querySelectorAll('.profile-section[id]');
  const navLinks = document.querySelectorAll('.profile-nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-150px 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;

        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to corresponding link
        const activeLink = document.querySelector(`.profile-nav-link[href="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach(section => observer.observe(section));
}

// Throttle function for scroll events
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Social Media Feed Functions
function renderSocialLinks(businessId) {
  // Check if businessSocialAccounts exists (from old data source)
  if (typeof businessSocialAccounts === 'undefined') {
    return '';
  }

  const socialAccounts = businessSocialAccounts[businessId];

  if (!socialAccounts) {
    return '';
  }

  let linksHtml = '<div class="social-links">';

  if (socialAccounts.facebook) {
    linksHtml += `
      <a href="${socialAccounts.facebook.url}" target="_blank" class="social-link facebook">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </a>
    `;
  }

  if (socialAccounts.instagram) {
    linksHtml += `
      <a href="${socialAccounts.instagram.url}" target="_blank" class="social-link instagram">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        Instagram
      </a>
    `;
  }

  linksHtml += '</div>';
  return linksHtml;
}

function renderSocialFeed(businessId) {
  // Check if getBusinessPosts exists (from old data source)
  if (typeof getBusinessPosts === 'undefined') {
    return `
      <div class="feed-empty-state">
        <div class="feed-empty-state-icon">📱</div>
        <h3 class="feed-empty-state-title">No posts yet</h3>
        <p class="feed-empty-state-description">Check back soon for updates from this business!</p>
      </div>
    `;
  }

  const posts = getBusinessPosts(businessId);

  if (!posts || posts.length === 0) {
    return `
      <div class="feed-empty-state">
        <div class="feed-empty-state-icon">📱</div>
        <h3 class="feed-empty-state-title">No posts yet</h3>
        <p class="feed-empty-state-description">Check back soon for updates from this business!</p>
      </div>
    `;
  }

  let feedHtml = '<div class="feed-posts-grid">';

  posts.forEach(post => {
    const platformIcon = post.platform === 'facebook' ?
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="post-platform-icon platform-facebook"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' :
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="post-platform-icon platform-instagram"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';

    feedHtml += `
      <div class="social-post-card">
        <div class="post-header">
          <img src="${post.profileImage}" alt="${post.accountName}" class="post-profile-image">
          <div class="post-account-info">
            <div class="post-account-name">
              ${post.accountName}
              ${post.verified ? '<span class="verified-badge">✓</span>' : ''}
            </div>
            <div class="post-timestamp">${formatTimestamp(post.timestamp)}</div>
          </div>
          ${platformIcon}
        </div>

        ${post.content ? `<div class="post-content">${post.content}</div>` : ''}

        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-media">` : ''}
        ${post.videoUrl ? `<img src="${post.videoUrl}" alt="Video thumbnail" class="post-video">` : ''}

        <div class="post-stats">
          ${post.likes ? `<span class="post-stat"><span class="post-stat-icon">❤️</span> ${post.likes}</span>` : ''}
          ${post.comments ? `<span class="post-stat"><span class="post-stat-icon">💬</span> ${post.comments}</span>` : ''}
          ${post.shares ? `<span class="post-stat"><span class="post-stat-icon">🔄</span> ${post.shares}</span>` : ''}
        </div>
      </div>
    `;
  });

  feedHtml += '</div>';
  return feedHtml;
}


// Image Gallery Controls
let currentGalleryIndex = 0;

function changeGalleryImage(direction) {
  const images = document.querySelectorAll(".gallery-image");
  const dots = document.querySelectorAll(".gallery-dot");
  
  if (images.length === 0) return;
  
  // Remove active class from current image and dot
  images[currentGalleryIndex].classList.remove("active");
  dots[currentGalleryIndex].classList.remove("active");
  
  // Update index
  currentGalleryIndex += direction;
  
  // Wrap around
  if (currentGalleryIndex < 0) {
    currentGalleryIndex = images.length - 1;
  } else if (currentGalleryIndex >= images.length) {
    currentGalleryIndex = 0;
  }
  
  // Add active class to new image and dot
  images[currentGalleryIndex].classList.add("active");
  dots[currentGalleryIndex].classList.add("active");
}

function goToGalleryImage(index) {
  const images = document.querySelectorAll(".gallery-image");
  const dots = document.querySelectorAll(".gallery-dot");
  
  if (images.length === 0) return;
  
  // Remove active class from current
  images[currentGalleryIndex].classList.remove("active");
  dots[currentGalleryIndex].classList.remove("active");
  
  // Set new index
  currentGalleryIndex = index;
  
  // Add active class to new
  images[currentGalleryIndex].classList.add("active");
  dots[currentGalleryIndex].classList.add("active");
}

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".profile-image-gallery");
  if (!gallery) return;
  
  gallery.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  gallery.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left - next image
      changeGalleryImage(1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right - previous image
      changeGalleryImage(-1);
    }
  }
});

// Share Business Function
function shareBusiness() {
  const business = currentBusiness;
  const shareData = {
    title: business.name,
    text: `Check out ${business.name} on Gulf Coast Radar! ${business.description}`,
    url: window.location.href
  };

  // Check if Web Share API is supported
  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
  } else {
    // Fallback: Copy link to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('Link copied to clipboard! Share it with your friends.');
      })
      .catch((error) => {
        console.log('Error copying:', error);
        alert('Unable to share. Please copy the URL from your browser.');
      });
  }
}

// About Modal Functions
function openAboutModal() {
  const modal = document.getElementById('about-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeAboutModal() {
  const modal = document.getElementById('about-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('about-modal');
  if (e.target === modal) {
    closeAboutModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAboutModal();
  }
});

// Photo Gallery Functions
function nextGalleryImage() {
  const gallery = document.getElementById('gallery-images');
  const dots = document.querySelectorAll('.gallery-dot');
  const totalImages = currentBusiness.images.length;

  currentGalleryIndex = (currentGalleryIndex + 1) % totalImages;
  gallery.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;

  // Update dots
  dots.forEach((dot, idx) => {
    dot.style.background = idx === currentGalleryIndex ? 'white' : 'rgba(255,255,255,0.5)';
  });
}

function prevGalleryImage() {
  const gallery = document.getElementById('gallery-images');
  const dots = document.querySelectorAll('.gallery-dot');
  const totalImages = currentBusiness.images.length;

  currentGalleryIndex = (currentGalleryIndex - 1 + totalImages) % totalImages;
  gallery.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;

  // Update dots
  dots.forEach((dot, idx) => {
    dot.style.background = idx === currentGalleryIndex ? 'white' : 'rgba(255,255,255,0.5)';
  });
}

function goToGalleryImage(index) {
  const gallery = document.getElementById('gallery-images');
  const dots = document.querySelectorAll('.gallery-dot');

  currentGalleryIndex = index;
  gallery.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;

  // Update dots
  dots.forEach((dot, idx) => {
    dot.style.background = idx === currentGalleryIndex ? 'white' : 'rgba(255,255,255,0.5)';
  });
}

function openPhotoModal(index) {
  // Open full-screen photo viewer modal
  const modal = document.createElement('div');
  modal.id = 'photo-viewer-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 20px;';

  modal.innerHTML = `
    <button onclick="this.parentElement.remove()" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: white; font-size: 40px; cursor: pointer; width: 50px; height: 50px;">&times;</button>
    <img src="${currentBusiness.images[index]}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">
  `;

  document.body.appendChild(modal);

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Customer Reviews System
let reviewPhotoData = null;
let reviewVideoData = null;
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];

function renderBusinessReviews(businessId) {
  // Fetch reviews from window.businessReviews (loaded from Google Sheets)
  if (!window.businessReviews || !Array.isArray(window.businessReviews)) {
    return '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No reviews yet. Be the first to review!</p>';
  }

  const reviews = window.businessReviews.filter(r => r.businessId === businessId);

  if (reviews.length === 0) {
    return '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No reviews yet. Be the first to review!</p>';
  }

  // Calculate average rating
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return `
    <div style="text-align: center; margin-bottom: 24px; padding: 20px; background: var(--bg); border-radius: 12px;">
      <div style="font-size: 48px; font-weight: 900; color: var(--primary);">${avgRating}</div>
      <div style="display: flex; justify-content: center; margin: 8px 0;">
        ${Array(5).fill(0).map((_, i) => `<span style="font-size: 24px; color: ${i < Math.round(avgRating) ? '#FFD700' : '#ddd'};">★</span>`).join('')}
      </div>
      <div style="color: var(--text-secondary); font-size: 14px;">${reviews.length} ${reviews.length === 1 ? 'Review' : 'Reviews'}</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${reviews.map(review => `
        <div class="review-card" style="background: var(--bg); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div>
              <div style="font-weight: 700; font-size: 16px; color: var(--text);">${review.customerName}</div>
              <div style="display: flex; margin: 4px 0;">
                ${Array(5).fill(0).map((_, i) => `<span style="font-size: 18px; color: ${i < review.rating ? '#FFD700' : '#ddd'};">★</span>`).join('')}
              </div>
            </div>
            <div style="font-size: 13px; color: var(--text-secondary);">${new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <p style="color: var(--text); line-height: 1.6; margin: 12px 0;">${review.review}</p>
          ${review.photoUrl ? `
            <img src="${review.photoUrl}" alt="Review photo" style="width: 100%; max-width: 400px; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 12px; cursor: pointer;" onclick="window.open('${review.photoUrl}', '_blank')">
          ` : ''}
          ${review.videoUrl ? `
            <video controls style="width: 100%; max-width: 400px; border-radius: 8px; margin-top: 12px;">
              <source src="${review.videoUrl}" type="video/webm">
            </video>
          ` : ''}
          ${review.verified ? '<div style="margin-top: 8px; color: #10B981; font-size: 13px; font-weight: 600;">✓ Verified Purchase</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function openReviewModal(businessId) {
  // Check if user is logged into loyalty program
  const loyaltyData = localStorage.getItem('loyaltySignup');

  if (!loyaltyData) {
    alert('Please sign up for our loyalty program to leave a review!');
    openLoyaltySignup(businessId);
    return;
  }

  const user = JSON.parse(loyaltyData);

  // Create review modal
  const modal = document.createElement('div');
  modal.id = 'review-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;';

  modal.innerHTML = `
    <div style="background: var(--bg-elevated); border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; padding: 24px;">
      <button onclick="closeReviewModal()" style="position: absolute; top: 16px; right: 16px; background: transparent; border: none; font-size: 32px; color: var(--text); cursor: pointer;">&times;</button>

      <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 24px 0; color: var(--text);">Write a Review</h2>

      <form id="review-form" onsubmit="submitReview(event, '${businessId}')">
        <!-- Star Rating -->
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text);">Rating</label>
          <div class="star-rating" style="display: flex; gap: 8px; font-size: 40px;">
            ${Array(5).fill(0).map((_, i) => `
              <span class="star-input" data-rating="${i + 1}" onclick="setRating(${i + 1})" style="cursor: pointer; color: #ddd; transition: color 0.2s;">★</span>
            `).join('')}
          </div>
          <input type="hidden" id="review-rating" name="rating" required>
        </div>

        <!-- Review Text -->
        <div style="margin-bottom: 24px;">
          <label for="review-text" style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text);">Your Review</label>
          <textarea id="review-text" name="review" required
                    style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px; resize: vertical;"
                    placeholder="Share your experience..."></textarea>
        </div>

        <!-- Photo/Video Upload Section -->
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text);">Add Media (Optional)</label>

          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <button type="button" onclick="captureReviewPhoto()" class="btn btn-primary" style="flex: 1;">
              📸 Take Photo
            </button>
            <button type="button" onclick="startVideoRecording()" id="video-btn" class="btn btn-primary" style="flex: 1;">
              🎥 Record Video
            </button>
          </div>

          <!-- Video Preview -->
          <div id="video-preview-container" style="display: none; margin-top: 12px;">
            <video id="video-preview" autoplay muted style="width: 100%; max-height: 300px; border-radius: 8px; background: #000;"></video>
            <div id="recording-timer" style="text-align: center; margin-top: 8px; font-weight: 700; color: #EF4444; font-size: 18px;">00:00</div>
          </div>

          <!-- Media Preview -->
          <div id="media-preview" style="margin-top: 12px;"></div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 16px; font-weight: 700;">
          Submit Review
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeReviewModal();
    }
  });
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) {
    // Stop any active media streams
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    modal.remove();
  }
  reviewPhotoData = null;
  reviewVideoData = null;
}

function setRating(rating) {
  document.getElementById('review-rating').value = rating;

  // Update star colors
  document.querySelectorAll('.star-input').forEach((star, index) => {
    star.style.color = index < rating ? '#FFD700' : '#ddd';
  });
}

async function captureReviewPhoto() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

    // Create camera modal
    const cameraModal = document.createElement('div');
    cameraModal.id = 'camera-modal';
    cameraModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10002; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;';

    cameraModal.innerHTML = `
      <video id="camera-stream" autoplay playsinline style="width: 100%; max-width: 500px; border-radius: 12px; background: #000;"></video>
      <div style="display: flex; gap: 16px; margin-top: 20px;">
        <button onclick="takePicture()" class="btn btn-primary" style="padding: 14px 28px; font-size: 16px;">📸 Capture</button>
        <button onclick="closeCameraModal()" class="btn" style="padding: 14px 28px; font-size: 16px; background: #EF4444; color: white;">Cancel</button>
      </div>
      <canvas id="photo-canvas" style="display: none;"></canvas>
    `;

    document.body.appendChild(cameraModal);

    const video = document.getElementById('camera-stream');
    video.srcObject = stream;
    mediaStream = stream;

  } catch (error) {
    console.error('Error accessing camera:', error);
    alert('Unable to access camera. Please check permissions.');
  }
}

function closeCameraModal() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  const cameraModal = document.getElementById('camera-modal');
  if (cameraModal) {
    cameraModal.remove();
  }
}

function takePicture() {
  const video = document.getElementById('camera-stream');
  const canvas = document.getElementById('photo-canvas');
  const context = canvas.getContext('2d');

  // Set canvas size to video size
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw video frame to canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert to data URL
  reviewPhotoData = canvas.toDataURL('image/jpeg', 0.8);

  // Show preview
  const preview = document.getElementById('media-preview');
  preview.innerHTML = `
    <div style="position: relative; display: inline-block;">
      <img src="${reviewPhotoData}" style="width: 100%; max-width: 300px; border-radius: 8px;">
      <button onclick="removeReviewPhoto()" style="position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">&times;</button>
    </div>
  `;

  closeCameraModal();
}

function removeReviewPhoto() {
  reviewPhotoData = null;
  document.getElementById('media-preview').innerHTML = '';
}

let recordingStartTime = null;
let recordingTimerInterval = null;

async function startVideoRecording() {
  const btn = document.getElementById('video-btn');

  // If already recording, stop
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopVideoRecording();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });

    const preview = document.getElementById('video-preview');
    const previewContainer = document.getElementById('video-preview-container');

    preview.srcObject = stream;
    previewContainer.style.display = 'block';
    mediaStream = stream;

    // Setup media recorder
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      reviewVideoData = blob;

      // Stop stream
      stream.getTracks().forEach(track => track.stop());
      mediaStream = null;

      // Show preview
      const videoPreview = document.getElementById('media-preview');
      const videoUrl = URL.createObjectURL(blob);
      videoPreview.innerHTML = `
        <div style="position: relative; display: inline-block; width: 100%;">
          <video controls style="width: 100%; max-width: 400px; border-radius: 8px;">
            <source src="${videoUrl}" type="video/webm">
          </video>
          <button onclick="removeReviewVideo()" style="position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">&times;</button>
        </div>
      `;

      previewContainer.style.display = 'none';
      btn.textContent = '🎥 Record Video';
      btn.style.background = '';
    };

    // Start recording
    mediaRecorder.start();
    btn.textContent = '⏹️ Stop Recording';
    btn.style.background = '#EF4444';

    // Start timer
    recordingStartTime = Date.now();
    recordingTimerInterval = setInterval(updateRecordingTimer, 100);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopVideoRecording();
      }
    }, 30000);

  } catch (error) {
    console.error('Error accessing camera/microphone:', error);
    alert('Unable to access camera or microphone. Please check permissions.');
  }
}

function stopVideoRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recordingTimerInterval);
  }
}

function updateRecordingTimer() {
  const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  const timer = document.getElementById('recording-timer');
  if (timer) {
    timer.textContent = `${minutes}:${seconds}`;

    // Warning at 25 seconds
    if (elapsed >= 25) {
      timer.style.animation = 'pulse 0.5s infinite';
    }
  }
}

function removeReviewVideo() {
  reviewVideoData = null;
  document.getElementById('media-preview').innerHTML = '';
  document.getElementById('video-preview-container').style.display = 'none';
}

async function submitReview(event, businessId) {
  event.preventDefault();

  const rating = parseInt(document.getElementById('review-rating').value);
  const reviewText = document.getElementById('review-text').value;

  if (!rating) {
    alert('Please select a rating');
    return;
  }

  // Get user data from loyalty signup
  const loyaltyData = JSON.parse(localStorage.getItem('loyaltySignup'));

  // Prepare review data
  const review = {
    id: `review-${businessId}-${Date.now()}`,
    businessId: businessId,
    customerName: loyaltyData.name,
    customerPhone: loyaltyData.phone, // Private, not displayed
    rating: rating,
    review: reviewText,
    date: new Date().toISOString(),
    photoUrl: reviewPhotoData || '',
    videoUrl: reviewVideoData ? URL.createObjectURL(reviewVideoData) : '',
    verified: true // Since they're in loyalty program
  };

  // TODO: Send to backend/Google Sheets
  // For now, store locally and in global array
  if (!window.businessReviews) {
    window.businessReviews = [];
  }
  window.businessReviews.push(review);

  // Store in localStorage
  const existingReviews = JSON.parse(localStorage.getItem('businessReviews') || '[]');
  existingReviews.push(review);
  localStorage.setItem('businessReviews', JSON.stringify(existingReviews));

  alert('Thank you for your review!');
  closeReviewModal();

  // Refresh reviews display
  document.getElementById('reviews-container').innerHTML = renderBusinessReviews(businessId);
}

/**
 * CLAIM YOUR BUSINESS MODAL
 * Allows business owners to request access to their profile
 */

// Open Claim Business Modal
function openClaimBusinessModal(businessId, businessName) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('claim-business-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'claim-business-modal';
    modal.className = 'calendar-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="calendar-modal-content" style="max-width: 500px;">
        <button class="calendar-modal-close" onclick="closeClaimBusinessModal()">&times;</button>

        <div class="calendar-header">
          <h2>👤 Claim Your Business</h2>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 8px;">
            Are you the owner of <strong id="claim-business-name"></strong>?
          </p>
        </div>

        <form id="claim-business-form" onsubmit="handleClaimBusinessSubmit(event)" style="padding: 20px;">
          <input type="hidden" id="claim-business-id" name="business_id">

          <div class="form-group" style="margin-bottom: 16px;">
            <label for="claim-owner-name" style="display: block; margin-bottom: 6px; font-weight: 600; color: var(--text);">Your Full Name *</label>
            <input type="text" id="claim-owner-name" name="owner_name" required
              style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 14px;">
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label for="claim-phone" style="display: block; margin-bottom: 6px; font-weight: 600; color: var(--text);">Phone Number *</label>
            <input type="tel" id="claim-phone" name="phone" required placeholder="(251) 555-1234"
              style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 14px;">
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label for="claim-email" style="display: block; margin-bottom: 6px; font-weight: 600; color: var(--text);">Email Address *</label>
            <input type="email" id="claim-email" name="email" required
              style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 14px;">
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label for="claim-role" style="display: block; margin-bottom: 6px; font-weight: 600; color: var(--text);">Your Role *</label>
            <select id="claim-role" name="role" required
              style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 14px;">
              <option value="">Select your role...</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="marketing">Marketing Director</option>
              <option value="other">Other Authorized Representative</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label for="claim-message" style="display: block; margin-bottom: 6px; font-weight: 600; color: var(--text);">Message (Optional)</label>
            <textarea id="claim-message" name="message" rows="3" placeholder="Any additional information..."
              style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 14px; resize: vertical;"></textarea>
          </div>

          <button type="submit" id="claim-submit-btn"
            style="width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            Submit Claim Request
          </button>

          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 12px; text-align: center; line-height: 1.5;">
            We'll review your request and contact you within 1-2 business days to verify ownership.
          </p>
        </form>

        <div id="claim-success-message" style="display: none; padding: 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
          <h3 style="color: var(--text); margin-bottom: 8px;">Request Submitted!</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            Thank you! We've received your claim request and will contact you within 1-2 business days to verify ownership and set up your business dashboard.
          </p>
          <button onclick="closeClaimBusinessModal()"
            style="margin-top: 16px; padding: 10px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Set business info
  document.getElementById('claim-business-name').textContent = businessName;
  document.getElementById('claim-business-id').value = businessId;

  // Reset form
  const form = document.getElementById('claim-business-form');
  if (form) form.reset();
  document.getElementById('claim-business-form').style.display = 'block';
  document.getElementById('claim-success-message').style.display = 'none';

  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Track event
  if (window.trackBusinessClick) {
    window.trackBusinessClick(businessId, businessName, 'claim_business_opened');
  }
}

// Close Claim Business Modal
function closeClaimBusinessModal() {
  const modal = document.getElementById('claim-business-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Handle Claim Business Form Submission
async function handleClaimBusinessSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('claim-submit-btn');
  const originalText = submitBtn.textContent;

  // Show loading
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  // Get form data
  const formData = new FormData(form);
  const claimData = {
    formType: 'Business Claim Request',
    timestamp: new Date().toISOString(),
    businessId: formData.get('business_id'),
    ownerName: formData.get('owner_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    role: formData.get('role'),
    message: formData.get('message') || '',
    url: window.location.href
  };

  try {
    // Submit to Google Sheets (use same endpoint as loyalty signups)
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby-TiV-cRzrT4i4PNqwrbm3zSY4F2WnefffbJzyRo9vY0huCb6LwtztE8wcxLE8mFtugw/exec';

    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData)
    });

    // Track event
    if (window.trackBusinessClick) {
      window.trackBusinessClick(claimData.businessId, '', 'claim_business_submitted');
    }

    // Save to localStorage as backup
    try {
      const existing = JSON.parse(localStorage.getItem('gcr_business_claims') || '[]');
      existing.push(claimData);
      localStorage.setItem('gcr_business_claims', JSON.stringify(existing));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    // Show success message
    document.getElementById('claim-business-form').style.display = 'none';
    document.getElementById('claim-success-message').style.display = 'block';

    console.log('✅ Business claim request submitted:', claimData);

  } catch (error) {
    console.error('Error submitting claim:', error);
    alert('There was an error submitting your request. Please try again or call us directly.');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('claim-business-modal');
  if (e.target === modal) {
    closeClaimBusinessModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('claim-business-modal');
    if (modal && modal.style.display === 'flex') {
      closeClaimBusinessModal();
    }
  }
});

console.log('✅ Claim Your Business functionality loaded');

