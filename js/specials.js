// Specials Page JavaScript

let allSpecials = [];
let specialsByDay = {};
let filteredSpecialsByDay = {};
let selectedCategory = 'all';

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

// Helper function to convert military time to regular time
function formatTime(timeString) {
  if (!timeString) return '';

  // If it already has AM/PM and a range, return as-is
  if (/am|pm/i.test(timeString) && timeString.includes('-')) return timeString;

  // Handle time ranges like "16:00-18:00", "4pm-6pm", "1600-1800"
  if (timeString.includes('-') || timeString.includes('–') || timeString.includes('to')) {
    const separator = timeString.includes('-') ? '-' : (timeString.includes('–') ? '–' : 'to');
    const parts = timeString.split(separator);
    if (parts.length === 2) {
      const startTime = formatTime(parts[0].trim());
      const endTime = formatTime(parts[1].trim());
      return `${startTime} - ${endTime}`;
    }
  }

  // If already has AM/PM, return as-is
  if (/am|pm/i.test(timeString)) return timeString;

  // Match patterns like "16:00", "1600", "4", "16"
  const match = timeString.match(/(\d{1,2}):?(\d{2})?/);
  if (!match) return timeString;

  let hours = parseInt(match[1]);
  const minutes = match[2] || '00';

  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11

  return `${hours}:${minutes} ${period}`;
}

// Generate events for next 7 days
function generateSpecialsByDay() {
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

  // Add ONLY PRICE DEAL SPECIALS (from business.specials array - NOT events!)
  // Group items by business + day + time to avoid duplicates
  allSpecials.forEach(business => {
    // Read from the dedicated specials array (price deals like Wine Wednesday, Taco Tuesday)
    if (business.specials && business.specials.length > 0) {
      // Group specials by day + time (e.g., all "Monday 5pm" items together)
      const specialsByDayTime = {};

      business.specials.forEach(special => {
        // Create a key from day + time to group related items
        const groupKey = `${special.day || 'daily'}_${special.time || 'anytime'}`;

        if (!specialsByDayTime[groupKey]) {
          // Determine special name based on patterns
          let specialTitle = special.category || special.name || 'Daily Special';

          // Detect common special types from time/day
          const day = (special.day || '').toLowerCase();
          const time = (special.time || '').toLowerCase();

          if (time.includes('sunset') || time.includes('early bird') || (time.includes('4') && time.includes('pm'))) {
            specialTitle = '🌅 Sunset Special';
          } else if (day.includes('monday') && specialTitle.toLowerCase().includes('wing')) {
            specialTitle = 'Wing Monday';
          } else if (day.includes('tuesday') && specialTitle.toLowerCase().includes('taco')) {
            specialTitle = 'Taco Tuesday';
          } else if (day.includes('wednesday') && specialTitle.toLowerCase().includes('wing')) {
            specialTitle = 'Wing Wednesday';
          } else if (day.includes('thursday')) {
            specialTitle = day.includes('taco') ? 'Taco Thursday' : 'Thursday Special';
          } else if (day.includes('friday')) {
            specialTitle = 'Friday Special';
          }

          // Get time range - check for separate start/end or combined time field
          let timeDisplay = special.time || '';
          if (special.startTime && special.endTime) {
            timeDisplay = `${special.startTime} - ${special.endTime}`;
          } else if (special.start_time && special.end_time) {
            timeDisplay = `${special.start_time} - ${special.end_time}`;
          }

          specialsByDayTime[groupKey] = {
            title: specialTitle,
            day: special.day,
            time: timeDisplay,
            items: []
          };
        }

        // Add this item to the special group
        specialsByDayTime[groupKey].items.push({
          name: special.name,
          description: special.description,
          price: special.price
        });
      });

      // Now create ONE event per day/time group (not per item)
      Object.values(specialsByDayTime).forEach(special => {
        const recurringDays = parseRecurringDays(special.day);

        Object.keys(dayMap).forEach(dateString => {
          const dayInfo = dayMap[dateString];
          if (recurringDays.includes(dayInfo.dayName)) {
            dayMap[dateString].events.push({
              type: 'special',
              businessName: business.name,
              businessId: business.id,
              title: special.title,
              time: special.time,
              items: special.items, // Array of items with name, description and price
              location: business.address || business.vicinity || business.location,
              phone: business.phone,
              address: business.address
            });
          }
        });
      });
    }
  });

  return dayMap;
}

function initializeSpecialsPage() {
  console.log('Specials page loading...');

  // Get ONLY restaurants/bars with PRICE DEAL SPECIALS (from specials array)
  allSpecials = allBusinesses.filter(b => {
    // ONLY show restaurants, bars, and food places - NOT coffee shops, entertainment, etc.
    const isRestaurantOrBar =
      b.display_category === 'restaurants' ||
      b.category === 'restaurants' ||
      (b.category && b.category.toLowerCase().includes('restaurant')) ||
      (b.category && b.category.toLowerCase().includes('bar')) ||
      (b.name && b.name.toLowerCase().includes('grill')) ||
      (b.name && b.name.toLowerCase().includes('pub'));

    // Skip non-restaurant businesses
    if (!isRestaurantOrBar) return false;

    // Include ONLY if has SPECIALS array (price deals like Wine Wednesday, Taco Tuesday)
    if (b.specials && b.specials.length > 0) {
      return true;
    }

    return false;
  });

  // Generate specials by day
  specialsByDay = generateSpecialsByDay();
  filteredSpecialsByDay = { ...specialsByDay };

  console.log('Found specials:', allSpecials.length);

  // Display by day
  displaySpecialsByDay();
  updateTitle();

  // Setup category filter listeners
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.addEventListener('click', handleCategoryFilter);
  });
}

// Initialize when data is ready
window.addEventListener('allBusinessesUpdated', () => {
  console.log('✅ Data loaded, initializing Specials page...');
  initializeSpecialsPage();
});

// Also check if data already loaded (in case event already fired)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof allBusinesses !== 'undefined' && allBusinesses.length > 0) {
    console.log('✅ Data already loaded, initializing Specials page...');
    initializeSpecialsPage();
  }
});

function handleCategoryFilter(e) {
  const category = e.target.getAttribute('data-category');
  selectedCategory = category;

  // Update active state
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  e.target.classList.add('active');

  // Filter events by category (ONLY food specials - no happy hours)
  if (category === 'all') {
    filteredSpecialsByDay = { ...specialsByDay };
  } else {
    filteredSpecialsByDay = {};

    Object.keys(specialsByDay).forEach(dateString => {
      const dayInfo = specialsByDay[dateString];
      const filteredEvents = dayInfo.events.filter(event => {
        switch(category) {
          case 'brunch':
            return event.title.toLowerCase().includes('brunch');
          case 'lunch':
            return event.title.toLowerCase().includes('lunch');
          case 'dinner':
            return event.title.toLowerCase().includes('dinner') || event.title.toLowerCase().includes('sunset');
          case 'other':
            return !event.title.toLowerCase().includes('brunch') &&
                   !event.title.toLowerCase().includes('lunch') &&
                   !event.title.toLowerCase().includes('dinner') &&
                   !event.title.toLowerCase().includes('sunset');
          default:
            return true;
        }
      });

      if (filteredEvents.length > 0) {
        filteredSpecialsByDay[dateString] = {
          ...dayInfo,
          events: filteredEvents
        };
      }
    });
  }

  displaySpecialsByDay();
  updateTitle();
}

function displaySpecialsByDay() {
  const list = document.getElementById('specials-list');

  // Sort day keys by date (earliest to latest)
  const dayKeys = Object.keys(filteredSpecialsByDay).sort((a, b) => {
    return filteredSpecialsByDay[a].date - filteredSpecialsByDay[b].date;
  });

  if (dayKeys.length === 0) {
    list.innerHTML = `
      <div class="special-empty-state">
        <div class="special-empty-icon">🎉</div>
        <h3 class="special-empty-title">No specials found</h3>
        <p class="special-empty-description">Check back soon for new deals!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = dayKeys.map(dateString => {
    const dayInfo = filteredSpecialsByDay[dateString];
    const events = dayInfo.events;

    if (events.length === 0) return '';

    return `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 28px; font-weight: 900; color: var(--primary); margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 3px solid var(--primary);">
          ${dateString}
        </h2>

        ${events.map((event, index) => {
          const eventId = `special-${dateString.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
          return `
          <div class="special-item" style="margin-bottom: 20px;" data-event-id="${eventId}">
            <div class="special-header" style="cursor: default;">
              <div class="special-info">
                <div class="special-title">
                  <h3 class="special-business-name">${event.businessName}</h3>
                  <span class="special-badge">${event.type === 'happy-hour' ? 'Happy Hour' : 'Special'}</span>
                </div>
                <div class="special-meta">
                  <div class="special-meta-item">
                    <span class="special-meta-icon">🎯</span>
                    <span>${event.title}</span>
                  </div>
                  ${event.time ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">🕐</span>
                      <span>${formatTime(event.time)}</span>
                    </div>
                  ` : ''}
                  <div class="special-meta-item">
                    <span class="special-meta-icon">📍</span>
                    <span>${event.location}</span>
                  </div>
                  ${event.items && event.items.length > 0 ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">🍽️</span>
                      <span>${event.items.length} item${event.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" style="font-size: 14px; padding: 8px 16px;" onclick="toggleSpecialDetails('${eventId}')">View Details</button>
              <a href="profile.html?id=${event.businessId}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">View Profile</a>
              ${event.phone ? `<a href="tel:${event.phone}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">📞 Call</a>` : ''}
              ${event.address ? `<a href="#" onclick="event.preventDefault(); openMaps('${event.address.replace(/'/g, "\\'")}');" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">🗺️ Directions</a>` : ''}
            </div>

            <!-- Expandable Details Section -->
            <div class="special-details" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              ${event.items && event.items.length > 0 ? `
                <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">${event.title} Items</h4>
                <div style="display: grid; gap: 12px;">
                  ${event.items.map(item => `
                    <div style="background: var(--bg); border: 2px solid var(--border); border-radius: 8px; padding: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: 4px;">
                        <span style="font-size: 15px; font-weight: 700; color: var(--text);">${item.name || 'Special item'}</span>
                        ${item.price ? `<span style="font-size: 15px; font-weight: 700; color: var(--primary); white-space: nowrap;">${item.price}</span>` : ''}
                      </div>
                      ${item.description ? `<p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">${item.description}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${event.type === 'happy-hour' && event.specials && event.specials.length > 0 ? `
                <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">Happy Hour Menu</h4>
                <div style="display: grid; gap: 12px;">
                  ${event.specials.map(special => `
                    <div style="background: var(--bg); border: 2px solid var(--border); border-radius: 8px; padding: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                        <span style="font-size: 15px; font-weight: 700; color: var(--text);">${special.name}</span>
                      </div>
                      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">${special.category}</div>
                      <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">${special.description}</p>
                    </div>
                  `).join('')}
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
                  `;
                }
                return '';
              })() : ''}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;
  }).join('');
}

function displaySpecials(businesses) {
  const list = document.getElementById('specials-list');

  if (businesses.length === 0) {
    list.innerHTML = `
      <div class="special-empty-state">
        <div class="special-empty-icon">🎉</div>
        <h3 class="special-empty-title">No specials found</h3>
        <p class="special-empty-description">Check back soon for new deals!</p>
      </div>
    `;
    return;
  }

  // Get current day of week for filtering
  const today = new Date();
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  list.innerHTML = businesses.map(business => {
    // Determine special type badge
    let specialBadge = 'Specials';
    if (business.tags && business.tags.includes('Happy Hour')) specialBadge = 'Happy Hour';
    else if (business.tags && business.tags.includes('Brunch')) specialBadge = 'Brunch';
    else if (business.tags && business.tags.includes('Early Bird')) specialBadge = 'Early Bird';

    // Get SPECIALS (price deals like Wine Wednesday, Taco Tuesday) - NOT events
    const specials = (business.specials || []).filter(special => {
      // If special has a specific day, check if it matches today
      if (special.day) {
        const recurringDays = parseRecurringDays(special.day);
        if (recurringDays.length > 0) {
          return recurringDays.includes(todayDayName);
        }
      }

      // If no day specified, show it (assume daily or always available)
      return true;
    });

    const hasEvents = specials.length > 0;

    return `
      <div class="special-item" data-business-id="${business.id}">
        <div class="special-header" onclick="toggleSpecialDetails('${business.id}')">
          <div class="special-info">
            <div class="special-title">
              <h3 class="special-business-name">${business.name}</h3>
              <span class="special-badge">${specialBadge}</span>
            </div>
            <div class="special-meta">
              <div class="special-meta-item">
                <span class="special-meta-icon">📍</span>
                <span>${business.location}</span>
              </div>
              ${business.distanceText ? `
                <div class="special-meta-item">
                  <span class="special-meta-icon">🚗</span>
                  <span>${business.distanceText} away</span>
                </div>
              ` : ''}
              ${hasEvents ? `
                <div class="special-meta-item">
                  <span class="special-meta-icon">🎯</span>
                  <span>${specials.length} Special${specials.length !== 1 ? 's' : ''}</span>
                </div>
              ` : ''}
              ${business.hours && typeof getBusinessStatus === 'function' ? (() => {
                const status = getBusinessStatus(business);
                return status.badge ? `
                  <div class="special-meta-item" style="margin-top: 8px;">
                    <div class="business-status-badge ${status.class}">
                      ${status.badge}
                    </div>
                    ${status.text ? `<div class="business-status-text" style="font-size: 13px; color: #6B7280; margin-top: 4px;">${status.text}</div>` : ''}
                  </div>
                ` : '';
              })() : ''}
            </div>
          </div>
          <div class="special-toggle">↓</div>
        </div>

        <div class="special-details">
          ${hasEvents ? `
            <h4 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px;">Price Deal Specials</h4>
            <div class="special-items-grid">
              ${specials.map(special => `
                <div class="special-detail-item">
                  <div class="special-detail-header">
                    <div class="special-detail-name">${special.name}</div>
                  </div>
                  ${special.day || special.time ? `
                    <div style="display: flex; gap: 12px; margin-bottom: 8px;">
                      ${special.day ? `<div class="special-detail-category">${special.day}</div>` : ''}
                      ${special.time ? `<div class="special-detail-category">${formatTime(special.time)}</div>` : ''}
                    </div>
                  ` : ''}
                  <p class="special-detail-description">${special.description}</p>
                  ${special.price ? `<div style="font-weight: 600; color: var(--primary); margin-top: 8px;">${special.price}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${!hasEvents ? `
            <p style="color: #6b7280; font-size: 14px;">Contact ${business.name} for current special offers and deals.</p>
          ` : ''}

          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="profile.html?id=${business.id}" class="btn btn-primary" style="text-decoration: none;">View Full Profile</a>
              <a href="tel:${business.phone}" class="btn btn-secondary" style="text-decoration: none;">📞 Call</a>
              <a href="#" onclick="event.preventDefault(); openMaps('${business.address.replace(/'/g, "\\'")}');" class="btn btn-secondary" style="text-decoration: none;">🗺️ Directions</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleSpecialDetails(eventId) {
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

function updateTitle() {
  const totalEvents = Object.values(filteredSpecialsByDay).reduce((sum, day) => sum + day.events.length, 0);

  const titleMap = {
    'all': 'All Specials',
    'happy-hour': 'Happy Hours',
    'daily-specials': 'Daily Specials',
    'brunch': 'Brunch Specials',
    'other': 'Other Specials'
  };

  const title = titleMap[selectedCategory] || 'Specials';
  document.getElementById('results-title').textContent = `${title} This Week (${totalEvents})`;
}

// Platform-aware maps function
function openMaps(address) {
  const encodedAddress = encodeURIComponent(address);
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

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
