// Happy Hour Page JavaScript

let allHappyHourBusinesses = [];
let happyHoursByDay = {};
let filteredHappyHoursByDay = {};
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

// Generate happy hours for next 7 days
function generateHappyHoursByDay() {
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

  // Add happy hour deals from all businesses
  allHappyHourBusinesses.forEach(business => {
    // Normalize happy hour data - check all possible field names
    const happyHourData = business.happyHourSpecials || business.happy_hour || business.happyHours || [];
    const happyHourArray = Array.isArray(happyHourData) ? happyHourData : (happyHourData.items || []);

    // ALSO get menu items with category "Happy Hour" (detailed appetizers, drinks, etc.)
    let menuHappyHourItems = [];

    // Handle BOTH flat array menu AND nested object menu structure
    if (Array.isArray(business.menu)) {
      // OLD FORMAT: flat array
      menuHappyHourItems = business.menu.filter(item =>
        item.category && item.category.toLowerCase().includes('happy hour')
      );
    } else if (business.menu && typeof business.menu === 'object') {
      // NEW FORMAT: nested object { happyhour: { sections: { ... } } }
      if (business.menu.happyhour && business.menu.happyhour.sections) {
        // Extract all items from happy hour sections
        Object.values(business.menu.happyhour.sections).forEach(section => {
          if (section.items && Array.isArray(section.items)) {
            menuHappyHourItems.push(...section.items);
          }
        });
      }
    }

    const drinksHappyHourItems = (business.drinks || []).filter(item =>
      item.category && item.category.toLowerCase().includes('happy hour')
    );

    // Combine all happy hour items
    const allHappyHourItems = [...happyHourArray, ...menuHappyHourItems, ...drinksHappyHourItems];

    // Add happy hour specials
    if (allHappyHourItems.length > 0) {
      allHappyHourItems.forEach(special => {
        // Use business.happyHourDays if it's already an array, otherwise parse special.days
        let recurringDays;
        if (Array.isArray(business.happyHourDays) && business.happyHourDays.length > 0) {
          recurringDays = business.happyHourDays;
        } else if (special.days) {
          recurringDays = parseRecurringDays(special.days);
        } else if (typeof business.happyHourDays === 'string') {
          recurringDays = parseRecurringDays(business.happyHourDays);
        } else if (business.happyHour) {
          recurringDays = parseRecurringDays(business.happyHour);
        } else {
          // If no days field, default to everyday
          recurringDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        }

        Object.keys(dayMap).forEach(dateString => {
          const dayInfo = dayMap[dateString];
          if (recurringDays && recurringDays.includes(dayInfo.dayName)) {
            // Extract title and description from new structure
            let title;
            let description = '';
            let priceDisplay = '';

            if (special.name) {
              // NEW FORMAT: Has explicit name field with detailed pricing
              title = special.name;
              description = special.description || '';

              // Build price display
              if (special.happy_hour_price && special.regular_price) {
                priceDisplay = `${special.happy_hour_price} (reg. ${special.regular_price})`;
              } else if (special.happy_hour_price) {
                priceDisplay = special.happy_hour_price;
              } else if (special.discount) {
                priceDisplay = special.discount;
              } else if (special.price_range) {
                priceDisplay = special.price_range;
              } else if (special.price) {
                priceDisplay = special.price;
              }
            } else if (special.item) {
              // Has explicit item field (old format)
              title = special.item;
              description = special.description || '';
              priceDisplay = special.price || '';
            } else if (special.deals) {
              // Cosmo's old format: deals is the item description
              title = special.deals;
              priceDisplay = special.price || '';
            } else if (special.description) {
              // OLD FORMAT: Parse item name from description
              const desc = special.description;

              if (desc.match(/oyster/i)) {
                title = 'Oysters';
                description = desc;
              } else if (desc.match(/wine/i)) {
                title = 'Wines by the Glass';
                description = desc;
              } else if (desc.match(/beer/i)) {
                title = 'Draft Beers';
                description = desc;
              } else if (desc.match(/appetizer/i)) {
                title = 'Select Appetizers';
                description = desc;
              } else if (desc.match(/cocktail/i)) {
                title = 'Cocktails';
                description = desc;
              } else if (desc.match(/drink/i)) {
                title = 'Drink Special';
                description = desc;
              } else {
                title = desc;
              }
              priceDisplay = special.price || '';
            } else {
              // Fallback
              title = 'Happy Hour Special';
              priceDisplay = special.price || '';
            }

            // Extract time - check multiple sources
            let time = special.time || special.days || business.happyHour;

            // Check for separate start/end time fields
            if (special.startTime && special.endTime) {
              time = `${special.startTime} - ${special.endTime}`;
            } else if (special.start_time && special.end_time) {
              time = `${special.start_time} - ${special.end_time}`;
            } else if (business.happyHourStartTime && business.happyHourEndTime) {
              time = `${business.happyHourStartTime} - ${business.happyHourEndTime}`;
            } else if (business.happy_hour_start && business.happy_hour_end) {
              time = `${business.happy_hour_start} - ${business.happy_hour_end}`;
            }

            // Check nested menu structure for time
            if ((!time || time === 'Available Daily') && business.menu && typeof business.menu === 'object') {
              if (business.menu.happyhour) {
                // Check for schedule field first (e.g., "Daily 16:00 – 18:00")
                if (business.menu.happyhour.schedule) {
                  time = business.menu.happyhour.schedule;
                }
                // Or build from startTime/endTime
                else if (business.menu.happyhour.startTime && business.menu.happyhour.endTime) {
                  time = `${business.menu.happyhour.startTime} - ${business.menu.happyhour.endTime}`;
                }
              }
            }

            // Check if dict has description or title with time info
            if (!time && !Array.isArray(happyHourData)) {
              time = happyHourData.description || happyHourData.title;
            }
            // Default to "Available Daily"
            if (!time) {
              time = 'Available Daily';
            }

            dayMap[dateString].events.push({
              type: 'happyhour',
              businessName: business.name,
              businessId: business.id,
              title: title,
              time: time,
              description: description,
              price: priceDisplay || special.price || '',
              location: business.address || business.vicinity || business.location,
              phone: business.phone,
              address: business.address,
              hours: business.hours
            });
          }
        });
      });
    } else if (business.happyHour || business.happy_hour) {
      // If no specific specials but has happy hour info, show general happy hour
      const hhInfo = business.happyHour || (typeof business.happy_hour === 'string' ? business.happy_hour : JSON.stringify(business.happy_hour));
      let recurringDays;
      if (Array.isArray(business.happyHourDays) && business.happyHourDays.length > 0) {
        recurringDays = business.happyHourDays;
      } else if (typeof business.happyHourDays === 'string') {
        recurringDays = parseRecurringDays(business.happyHourDays);
      } else {
        recurringDays = parseRecurringDays(hhInfo);
      }

      // If no days parsed, default to everyday
      if (!recurringDays || recurringDays.length === 0) {
        recurringDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      }

      Object.keys(dayMap).forEach(dateString => {
        const dayInfo = dayMap[dateString];
        if (recurringDays && recurringDays.includes(dayInfo.dayName)) {
          // Use hhInfo if it looks like time info, otherwise default
          const timeDisplay = (hhInfo && hhInfo.length < 100 && !hhInfo.includes('{')) ? hhInfo : 'Available Daily';

          dayMap[dateString].events.push({
            type: 'happyhour',
            businessName: business.name,
            businessId: business.id,
            title: 'Happy Hour',
            time: timeDisplay,
            description: 'Special drink and food pricing',
            price: '',
            location: business.location,
            phone: business.phone,
            address: business.address,
            hours: business.hours
          });
        }
      });
    }
  });

  return dayMap;
}

function initializeHappyHourPage() {
  console.log('Happy Hour page loading...');

  // Get ONLY businesses with happy hours
  allHappyHourBusinesses = allBusinesses.filter(b => {
    // Exclude theaters/cinemas (they belong on things-to-do page)
    const name = (b.name || '').toLowerCase();
    const category = (b.category || '').toLowerCase();
    // Handle subcategory as string or array
    const subcategory = Array.isArray(b.subcategory)
      ? b.subcategory.join(' ').toLowerCase()
      : (b.subcategory || '').toLowerCase();

    if (name.includes('amc') || name.includes('cinema') || name.includes('theater') ||
        category.includes('theater') || category.includes('cinema') || category.includes('movie') ||
        subcategory.includes('theater') || subcategory.includes('cinema')) {
      return false;
    }

    // Check old formats
    if (b.happyHourSpecials || b.happy_hour || b.happyHour || b.has_happy_hour || (b.happyHours && b.happyHours.length > 0)) {
      return true;
    }

    // Check NEW nested menu format: menu.happyhour exists
    if (b.menu && typeof b.menu === 'object' && b.menu.happyhour) {
      return true;
    }

    return false;
  });

  // Generate happy hours by day
  happyHoursByDay = generateHappyHoursByDay();
  filteredHappyHoursByDay = { ...happyHoursByDay };

  console.log('Found businesses with happy hours:', allHappyHourBusinesses.length);

  // Display by day
  displayHappyHoursByDay();
  updateTitle();
}

function displayHappyHoursByDay() {
  const container = document.getElementById('results-container');
  if (!container) return;

  let html = '';
  const sortedDates = Object.keys(filteredHappyHoursByDay).sort((a, b) =>
    filteredHappyHoursByDay[a].date - filteredHappyHoursByDay[b].date
  );

  sortedDates.forEach(dateString => {
    const dayData = filteredHappyHoursByDay[dateString];
    const events = dayData.events;

    if (events.length === 0) return;

    const isToday = dateString.includes(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    // Group events by business to avoid duplicates
    const businessMap = {};
    events.forEach(event => {
      if (!businessMap[event.businessId]) {
        businessMap[event.businessId] = {
          businessName: event.businessName,
          businessId: event.businessId,
          location: event.location,
          phone: event.phone,
          address: event.address,
          time: event.time,
          hours: event.hours,
          specials: []
        };
      }
      businessMap[event.businessId].specials.push({
        title: event.title,
        description: event.description,
        price: event.price
      });
    });

    const businesses = Object.values(businessMap);

    html += `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 28px; font-weight: 900; color: var(--primary); margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 3px solid var(--primary);">
          ${isToday ? '🍹 Today - ' : ''}${dateString}
        </h2>
    `;

    businesses.forEach((business, index) => {
      const eventId = `happyhour-${dateString.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
      html += `
        <div class="special-item" style="margin-bottom: 20px;" data-event-id="${eventId}">
          <div class="special-header" style="cursor: default;">
            <div class="special-info">
              <div class="special-title">
                <h3 class="special-business-name">
                  ${business.businessName}
                  ${business.time ? `<span style="font-size: 14px; font-weight: 600; color: #ff6b35; margin-left: 12px;">⏰ ${formatTime(business.time)}</span>` : ''}
                </h3>
                <span class="special-badge" style="background: #ff6b35;">🍹 Happy Hour</span>
              </div>
              <div class="special-meta">
                ${business.time ? `
                  <div class="special-meta-item">
                    <span class="special-meta-icon">🕐</span>
                    <span>${formatTime(business.time)}</span>
                  </div>
                ` : ''}
                <div class="special-meta-item">
                  <span class="special-meta-icon">📍</span>
                  <span>${business.location}</span>
                </div>
                <div class="special-meta-item">
                  <span class="special-meta-icon">🎯</span>
                  <span>${business.specials.length} Deal${business.specials.length !== 1 ? 's' : ''}</span>
                </div>
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
          </div>
          <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" style="font-size: 14px; padding: 8px 16px;" onclick="toggleSpecialDetails('${eventId}')">View Details</button>
            <a href="profile.html?id=${business.businessId}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">View Profile</a>
            ${business.phone ? `<a href="tel:${business.phone}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">📞 Call</a>` : ''}
            ${business.address ? `<a href="#" onclick="event.preventDefault(); openMaps('${business.address.replace(/'/g, "\\'")}');" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">🗺️ Directions</a>` : ''}
          </div>

          <!-- Expandable Details Section -->
          <div class="special-details" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">Happy Hour Menu</h4>
            <div style="display: grid; gap: 12px;">
              ${business.specials.map(special => `
                <div style="background: var(--bg); border: 2px solid var(--border); border-radius: 8px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                    <span style="font-size: 15px; font-weight: 700; color: var(--text);">${special.title}</span>
                    ${special.price ? `<span style="font-size: 15px; font-weight: 700; color: var(--primary);">${special.price}</span>` : ''}
                  </div>
                  ${special.description ? `<p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">${special.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    });

    html += `
      </div>
    `;
  });

  if (html === '') {
    html = `
      <div class="special-empty-state">
        <div class="special-empty-icon">🍹</div>
        <h3 class="special-empty-title">No happy hours found</h3>
        <p class="special-empty-description">Check back soon for new deals!</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Toggle function for expandable details
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
  // Desktop or other - use Google Maps web
  else {
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }
}

function updateTitle() {
  const titleElement = document.getElementById('results-title');
  if (titleElement) {
    // Count unique businesses instead of individual deals
    const allBusinessIds = new Set();
    Object.values(filteredHappyHoursByDay).forEach(day => {
      day.events.forEach(event => allBusinessIds.add(event.businessId));
    });
    titleElement.textContent = `🍹 Happy Hours (${allBusinessIds.size} place${allBusinessIds.size !== 1 ? 's' : ''})`;
  }
}

// Initialize when data is ready
window.addEventListener('allBusinessesUpdated', () => {
  console.log('✅ Data loaded, initializing Happy Hour page...');
  initializeHappyHourPage();
});

// Also check if data already loaded (in case event already fired)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof allBusinesses !== 'undefined' && allBusinesses.length > 0) {
    console.log('✅ Data already loaded, initializing Happy Hour page...');
    initializeHappyHourPage();
  }
});
