// Entertainment Page - Gulf Coast Radar

let entertainmentList = [];
let entertainmentByDay = {};
let selectedCategories = [];

// Helper function to parse recurring days from event
function parseRecurringDays(dayString) {
  if (!dayString) return [];

  const lower = dayString.toLowerCase();

  // Handle "daily"
  if (lower.includes('daily') || lower.includes('every day')) {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  }

  // Handle day ranges like "Thu-Sun" or "Fri-Sun"
  if (lower.includes('-')) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayAbbrevs = { 'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6 };

    const parts = lower.split('-');
    if (parts.length === 2) {
      const startAbbrev = parts[0].trim().substring(0, 3);
      const endAbbrev = parts[1].trim().substring(0, 3);

      const startIdx = dayAbbrevs[startAbbrev];
      const endIdx = dayAbbrevs[endAbbrev];

      if (startIdx !== undefined && endIdx !== undefined) {
        const days = [];
        let idx = startIdx;
        while (true) {
          days.push(daysOfWeek[idx]);
          if (idx === endIdx) break;
          idx = (idx + 1) % 7;
        }
        return days;
      }
    }
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

// Generate entertainment events for next 7 days
function generateEntertainmentByDay() {
  const dayMap = {};
  const today = new Date();

  // Generate next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    dayMap[dateString] = {
      date: date,
      dayName: dayName,
      events: []
    };
  }

  // Add ALL events from all venues (but filter out food specials)
  entertainmentList.forEach(venue => {
    if (venue.events && venue.events.length > 0) {
      venue.events.forEach(event => {
        // Filter out food/menu specials - only show entertainment events
        const eventNameLower = event.name.toLowerCase();
        const isFoodSpecial =
          eventNameLower.includes('menu') ||
          eventNameLower.includes('special') ||
          eventNameLower.includes('sunset') ||
          eventNameLower.includes('brunch') ||
          eventNameLower.includes('breakfast') ||
          eventNameLower.includes('lunch') ||
          eventNameLower.includes('dinner') ||
          eventNameLower.includes('happy hour');

        // Skip food specials
        if (isFoodSpecial) return;

        const recurringDays = parseRecurringDays(event.day);

        Object.keys(dayMap).forEach(dateString => {
          const dayInfo = dayMap[dateString];
          if (recurringDays.includes(dayInfo.dayName)) {
            dayMap[dateString].events.push({
              businessName: venue.name,
              businessId: venue.id,
              title: event.name,
              time: event.time,
              description: event.description,
              location: venue.location,
              phone: venue.phone,
              address: venue.address,
              artist: event.artist,
              menuCategory: event.menuCategory,
              menu: venue.menu
            });
          }
        });
      });
    }
  });

  return dayMap;
}

// Get entertainment venues from allBusinesses
function getEntertainmentVenues() {
  // Return entertainment and attractions businesses
  return allBusinesses.filter(business => {
    return business.category === 'entertainment' ||
           business.category === 'attractions' ||
           (business.events && business.events.length > 0);
  });
}


function renderEntertainmentByDay() {
  const list = document.getElementById('entertainment-list');

  // Sort day keys by date (earliest to latest)
  const dayKeys = Object.keys(entertainmentByDay).sort((a, b) => {
    return entertainmentByDay[a].date - entertainmentByDay[b].date;
  });

  if (dayKeys.length === 0) {
    list.innerHTML = `
      <div class="special-empty-state">
        <div class="special-empty-icon">🎭</div>
        <h3 class="special-empty-title">No entertainment events found</h3>
        <p class="special-empty-description">Check back soon for new events and shows!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = dayKeys.map(dateString => {
    const dayInfo = entertainmentByDay[dateString];
    const events = dayInfo.events;

    if (events.length === 0) return '';

    return `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 28px; font-weight: 900; color: var(--primary); margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 3px solid var(--primary);">
          ${dateString}
        </h2>

        ${events.map((event, index) => {
          const eventId = `entertainment-${dateString.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
          return `
          <div class="special-item" style="margin-bottom: 20px;" data-event-id="${eventId}">
            <div class="special-header" style="cursor: default;">
              <div class="special-info">
                <div class="special-title">
                  <h3 class="special-business-name">${event.businessName}</h3>
                  <span class="special-badge">Event</span>
                </div>
                <div class="special-meta">
                  <div class="special-meta-item">
                    <span class="special-meta-icon">🎵</span>
                    <span><strong>${event.title}</strong></span>
                  </div>
                  ${event.time ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">🕐</span>
                      <span><strong>${event.time}</strong></span>
                    </div>
                  ` : ''}
                  <div class="special-meta-item">
                    <span class="special-meta-icon">📍</span>
                    <span>${event.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" style="font-size: 14px; padding: 8px 16px;" onclick="toggleEntertainmentDetails('${eventId}')">View Details</button>
              <a href="profile.html?id=${event.businessId}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">View Profile</a>
              ${event.phone ? `<a href="tel:${event.phone}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">📞 Call</a>` : ''}
              ${event.address ? `<a href="#" onclick="event.preventDefault(); openMaps('${event.address.replace(/'/g, "\\'")}');" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">🗺️ Directions</a>` : ''}
            </div>

            <!-- Expandable Details Section -->
            <div class="special-details" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              ${event.description ? `
                <div style="margin-bottom: 16px;">
                  <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">Event Details</h4>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">${event.description}</p>
                </div>
              ` : ''}

              ${event.artist ? `
                <div style="margin-bottom: 16px;">
                  <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">Featured Artist</h4>
                  <p style="color: #14B8A6; font-size: 15px; font-weight: 600;">${event.artist}</p>
                </div>
              ` : ''}

              ${event.menuCategory && event.menu ? (() => {
                const menuItems = event.menu.filter(item => item.category === event.menuCategory);
                if (menuItems.length > 0) {
                  const groupedByType = menuItems.reduce((acc, item) => {
                    const type = item.type || 'Items';
                    if (!acc[type]) {
                      acc[type] = [];
                    }
                    acc[type].push(item);
                    return acc;
                  }, {});

                  return `
                    <div style="margin-bottom: 16px;">
                      <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">${event.menuCategory} Menu</h4>
                      ${Object.keys(groupedByType).map(type => `
                        <div style="margin-bottom: 16px;">
                          <h5 style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">${type}</h5>
                          <div style="display: grid; gap: 12px;">
                            ${groupedByType[type].map(item => `
                              <div style="background: var(--bg); border: 2px solid var(--border); border-radius: 8px; padding: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                                  <span style="font-size: 15px; font-weight: 700; color: var(--text);">${item.name}</span>
                                  <span style="font-size: 15px; font-weight: 700; color: var(--primary);">${item.price}</span>
                                </div>
                                ${item.description ? `<p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">${item.description}</p>` : ''}
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  `;
                }
                return '';
              })() : ''}

              <div style="background: var(--bg); border: 2px solid var(--border); border-radius: 8px; padding: 16px;">
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">🎵</span>
                    <div>
                      <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Event</div>
                      <div style="font-size: 14px; color: var(--text);">${event.title}</div>
                    </div>
                  </div>
                  ${event.time ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 18px;">🕐</span>
                      <div>
                        <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Time</div>
                        <div style="font-size: 14px; color: var(--text);">${event.time}</div>
                      </div>
                    </div>
                  ` : ''}
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">📍</span>
                    <div>
                      <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Location</div>
                      <div style="font-size: 14px; color: var(--text);">${event.businessName} - ${event.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;
  }).join('');
}

function renderEntertainment() {
  const list = document.getElementById('entertainment-list');

  if (entertainmentList.length === 0) {
    list.innerHTML = `
      <div class="special-empty-state">
        <div class="special-empty-icon">🎭</div>
        <h3 class="special-empty-title">No entertainment venues found</h3>
        <p class="special-empty-description">Check back soon for new events and shows!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = entertainmentList.map(venue => {
    // Determine entertainment type badge
    let entertainmentBadge = 'Entertainment';
    if (venue.tags && venue.tags.includes('Live Music')) entertainmentBadge = 'Live Music';
    else if (venue.tags && venue.tags.includes('Nightlife')) entertainmentBadge = 'Nightlife';
    else if (venue.tags && venue.tags.includes('Bars')) entertainmentBadge = 'Bar';
    else if (venue.tags && venue.tags.includes('Shows & Theater')) entertainmentBadge = 'Shows';

    // Get events if available
    const events = venue.events || [];
    const hasEvents = events.length > 0;

    return `
      <div class="special-item" data-business-id="${venue.id}">
        <div class="special-header" onclick="toggleSpecialDetails('${venue.id}')">
          <div class="special-info">
            <div class="special-title">
              <h3 class="special-business-name">${venue.name}</h3>
              <span class="special-badge">${entertainmentBadge}</span>
            </div>
            <div class="special-meta">
              <div class="special-meta-item">
                <span class="special-meta-icon">📍</span>
                <span>${venue.location}</span>
              </div>
              ${venue.distanceText ? `
                <div class="special-meta-item">
                  <span class="special-meta-icon">🚗</span>
                  <span>${venue.distanceText} away</span>
                </div>
              ` : ''}
              ${hasEvents ? `
                <div class="special-meta-item">
                  <span class="special-meta-icon">🎫</span>
                  <span>${events.length} Event${events.length !== 1 ? 's' : ''}</span>
                </div>
              ` : ''}
              ${venue.hours ? `
                <div class="special-meta-item">
                  <span class="special-meta-icon">🕐</span>
                  <span>${venue.hours}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="special-toggle">↓</div>
        </div>

        <div class="special-details">
          ${hasEvents ? `
            <h4 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px;">Events & Schedule</h4>
            <div class="special-items-grid">
              ${events.map(event => `
                <div class="special-detail-item">
                  <div class="special-detail-header">
                    <div class="special-detail-name">${event.name}</div>
                  </div>
                  ${event.day ? `
                    <div style="display: flex; gap: 12px; margin-bottom: 8px;">
                      ${event.day ? `<div class="special-detail-category">${event.day}</div>` : ''}
                      ${event.time ? `<div class="special-detail-category">${event.time}</div>` : ''}
                    </div>
                  ` : ''}
                  <p class="special-detail-description">${event.description}</p>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: #6b7280; font-size: 14px;">${venue.description || 'Check with venue for upcoming events and entertainment.'}</p>
          `}

          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="profile.html?id=${venue.id}" class="btn btn-primary" style="text-decoration: none;">View Full Profile</a>
              ${venue.phone ? `<a href="tel:${venue.phone}" class="btn btn-secondary" style="text-decoration: none;">📞 Call</a>` : ''}
              ${venue.address ? `<a href="#" onclick="event.preventDefault(); openMaps('${venue.address.replace(/'/g, "\\'")}');" class="btn btn-secondary" style="text-decoration: none;">🗺️ Directions</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleEntertainmentDetails(eventId) {
  const item = document.querySelector(`.special-item[data-event-id="${eventId}"]`);
  if (item) {
    const details = item.querySelector('.special-details');
    const button = item.querySelector('button.btn-primary');

    if (details.style.display === 'none') {
      details.style.display = 'block';
      button.textContent = 'Hide Details';
    } else {
      details.style.display = 'none';
      button.textContent = 'View Details';
    }
  }
}

// Platform-aware maps function
function openMaps(address) {
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
  // Desktop/other - use Google Maps
  else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }
}

function initializeEntertainmentPage() {
  entertainmentList = getEntertainmentVenues();
  entertainmentByDay = generateEntertainmentByDay();
  renderEntertainmentByDay();
  updateResultsTitle();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEntertainmentPage();

  // Listen for dynamically loaded businesses
  window.addEventListener('allBusinessesUpdated', () => {
    console.log('🔄 Entertainment page updating with new business data...');
    initializeEntertainmentPage();
  });
});

function updateResultsTitle() {
  const totalEvents = Object.values(entertainmentByDay).reduce((sum, day) => sum + day.events.length, 0);
  document.getElementById('results-title').textContent = `Events This Week (${totalEvents})`;
}
