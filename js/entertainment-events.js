// Entertainment Events Page JavaScript
// Shows live music, karaoke, trivia, bingo organized by day

let allEntertainment = [];
let entertainmentByDay = {};
let currentFilter = 'all'; // Current entertainment type filter

// Helper function to parse recurring days from event
function parseRecurringDays(dayString) {
  if (!dayString) return [];

  const lower = dayString.toLowerCase();

  // Handle "daily"
  if (lower.includes('daily') || lower.includes('every day')) {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  }

  // Handle specific days
  const days = [];
  if (lower.includes('sunday') || lower.includes('sun')) days.push('sunday');
  if (lower.includes('monday') || lower.includes('mon')) days.push('monday');
  if (lower.includes('tuesday') || lower.includes('tue')) days.push('tuesday');
  if (lower.includes('wednesday') || lower.includes('wed')) days.push('wednesday');
  if (lower.includes('thursday') || lower.includes('thu')) days.push('thursday');
  if (lower.includes('friday') || lower.includes('fri')) days.push('friday');
  if (lower.includes('saturday') || lower.includes('sat')) days.push('saturday');

  return days;
}

// Generate entertainment events for next 7 days (with optional filter)
function generateEntertainmentByDay(filterType = 'all') {
  const dayMap = {};
  const today = new Date();

  // Generate next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const isToday = i === 0;

    dayMap[dateString] = {
      date: date,
      dayName: dayName,
      isToday: isToday,
      events: []
    };
  }

  // Add events from ALL businesses (restaurants + activities)
  allEntertainment.forEach(business => {
    if (business.events && business.events.length > 0) {
      business.events.forEach(event => {
        // Only include entertainment events
        const eventName = (event.name || '').toLowerCase();
        const isEntertainment =
          eventName.includes('live music') ||
          eventName.includes('karaoke') ||
          eventName.includes('trivia') ||
          eventName.includes('bingo') ||
          eventName.includes('dj') ||
          eventName.includes('band') ||
          eventName.includes('singer') ||
          eventName.includes('open mic');

        if (!isEntertainment) return;

        // Get event type
        const eventType = getEventType(event.name);

        // Apply filter if not 'all'
        if (filterType !== 'all' && eventType !== filterType) {
          return; // Skip this event if it doesn't match the filter
        }

        const recurringDays = parseRecurringDays(event.day);

        Object.keys(dayMap).forEach(dateString => {
          const dayInfo = dayMap[dateString];
          if (recurringDays.includes(dayInfo.dayName)) {
            dayMap[dateString].events.push({
              type: eventType,
              businessName: business.name,
              businessId: business.id,
              title: event.name,
              artist: event.artist || event.artistName,
              artistBio: event.artistBio || event.artist_bio || event.bio,
              time: event.time,
              description: event.description,
              location: business.location,
              phone: business.phone,
              address: business.address,
              price: event.price
            });
          }
        });
      });
    }
  });

  return dayMap;
}

// Determine event type from name
function getEventType(eventName) {
  const lower = eventName.toLowerCase();
  if (lower.includes('live music') || lower.includes('band') || lower.includes('singer')) return 'live-music';
  if (lower.includes('karaoke')) return 'karaoke';
  if (lower.includes('trivia')) return 'trivia';
  if (lower.includes('bingo')) return 'bingo';
  if (lower.includes('dj')) return 'dj';
  if (lower.includes('open mic')) return 'open-mic';
  return 'entertainment';
}

// Get icon for event type
function getEventIcon(type) {
  const icons = {
    'live-music': '🎵',
    'karaoke': '🎤',
    'trivia': '🎲',
    'bingo': '🎯',
    'dj': '🎧',
    'open-mic': '🎙️',
    'entertainment': '🎭'
  };
  return icons[type] || '🎉';
}

// Initialize entertainment events page
async function initializeEntertainmentPage() {
  console.log('📅 Loading entertainment events...');

  // Get ALL businesses
  if (typeof allBusinesses === 'undefined' || !allBusinesses || allBusinesses.length === 0) {
    console.error('❌ No business data available!');
    document.getElementById('entertainment-list').innerHTML = `
      <div class="no-results">
        <h3>Error Loading Data</h3>
        <p>Please refresh the page or contact support.</p>
      </div>
    `;
    return;
  }

  // Filter for businesses with entertainment events
  allEntertainment = allBusinesses.filter(b => {
    if (!b.events || b.events.length === 0) return false;

    return b.events.some(event => {
      const eventName = (event.name || '').toLowerCase();
      return eventName.includes('live music') ||
             eventName.includes('karaoke') ||
             eventName.includes('trivia') ||
             eventName.includes('bingo') ||
             eventName.includes('dj') ||
             eventName.includes('band') ||
             eventName.includes('singer') ||
             eventName.includes('open mic');
    });
  });

  console.log(`✅ Found ${allEntertainment.length} venues with entertainment events`);

  // Generate events by day
  entertainmentByDay = generateEntertainmentByDay();

  // Display events
  displayEntertainmentByDay(entertainmentByDay);
}

// Display entertainment events organized by day
function displayEntertainmentByDay(dayMap) {
  const container = document.getElementById('entertainment-list');
  if (!container) return;

  let html = '';
  let totalEvents = 0;

  Object.keys(dayMap).forEach(dateString => {
    const day = dayMap[dateString];

    if (day.events.length === 0) return; // Skip days with no events

    totalEvents += day.events.length;

    html += `
      <div class="day-section">
        <div class="day-header">
          <h3 class="day-title">
            ${day.isToday ? '🔥 Today - ' : '📅 '}${dateString}
          </h3>
          <span class="event-count">${day.events.length} event${day.events.length > 1 ? 's' : ''}</span>
        </div>
        <div class="events-list">
          ${day.events.map(event => createEventCard(event)).join('')}
        </div>
      </div>
    `;
  });

  if (totalEvents === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div style="font-size: 64px; margin-bottom: 20px;">🎵</div>
        <h3>No Entertainment Events This Week</h3>
        <p>Check back soon for updates on live music, karaoke, trivia, and more!</p>
      </div>
    `;
  } else {
    container.innerHTML = html;
  }

  // Update page title
  const titleElement = document.getElementById('results-title');
  if (titleElement) {
    titleElement.textContent = `This Week's Entertainment (${totalEvents} Events)`;
  }
}

// Create event card HTML with FULL details (artist, time, price, etc.)
function createEventCard(event) {
  const icon = getEventIcon(event.type);

  return `
    <div class="event-card" onclick="window.location.href='profile.html?id=${event.businessId}'">
      <div class="event-icon">${icon}</div>
      <div class="event-details">
        <div class="event-title">${event.title}</div>
        <div class="event-business">
          <strong>${event.businessName}</strong>
          ${event.location ? `<span style="color: #6B7280; margin-left: 8px;">• ${event.location}</span>` : ''}
        </div>

        <!-- Full Event Details -->
        <div class="event-info-grid" style="margin-top: 12px; display: grid; gap: 8px;">
          ${event.artist ? `
            <div class="event-info-item">
              <span style="font-weight: 600; color: #1F2937;">🎤 Artist:</span>
              <span style="color: #4B5563;">${event.artist}</span>
            </div>
          ` : ''}

          ${event.artistBio ? `
            <div class="event-info-item">
              <span style="font-weight: 600; color: #1F2937;">ℹ️ Bio:</span>
              <span style="color: #4B5563;">${event.artistBio}</span>
            </div>
          ` : ''}

          ${event.time ? `
            <div class="event-info-item">
              <span style="font-weight: 600; color: #1F2937;">🕐 Time:</span>
              <span style="color: #4B5563;">${event.time}</span>
            </div>
          ` : ''}

          ${event.description ? `
            <div class="event-info-item">
              <span style="font-weight: 600; color: #1F2937;">📋 Details:</span>
              <span style="color: #4B5563;">${event.description}</span>
            </div>
          ` : ''}

          ${event.price ? `
            <div class="event-info-item">
              <span style="font-weight: 600; color: #1F2937;">💵 Price:</span>
              <span style="color: #4B5563;">${event.price}</span>
            </div>
          ` : ''}

          ${event.address ? `
            <div class="event-info-item">
              <span style="font-weight: 600; color: #1F2937;">📍 Address:</span>
              <span style="color: #4B5563;">${event.address}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="event-actions">
        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); window.location.href='profile.html?id=${event.businessId}'">View Details</button>
        ${event.phone ? `<a href="tel:${event.phone}" class="btn btn-sm btn-secondary" onclick="event.stopPropagation()">📞 Call to Reserve</a>` : ''}
        ${event.address ? `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openMaps('${event.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
      </div>
    </div>
  `;
}

// Platform-aware maps function
function openMaps(address) {
  if (!address) return;
  const encodedAddress = encodeURIComponent(address);
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Detect iOS
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
  }
  // Detect Android
  else if (/android/i.test(userAgent)) {
    window.location.href = `geo:0,0?q=${encodedAddress}`;
  }
  // Desktop or other - use Google Maps web
  else {
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }
}

// Filter events by type
window.filterEntertainmentEvents = function(filterType) {
  console.log('Filtering entertainment by:', filterType);
  currentFilter = filterType;

  // Regenerate events with filter
  entertainmentByDay = generateEntertainmentByDay(filterType);

  // Display filtered events
  displayEntertainmentByDay(entertainmentByDay);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeEntertainmentPage();
});
