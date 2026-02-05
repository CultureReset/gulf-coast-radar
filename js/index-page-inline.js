    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y1X3LN2FSB', {
      'send_page_view': true,
      'page_title': document.title,
      'page_location': window.location.href
    });

    // Custom event tracking functions
    window.trackBusinessView = function(businessId, businessName) {
      gtag('event', 'business_view', {
        'event_category': 'Business',
        'event_label': businessName,
        'business_id': businessId,
        'page_path': window.location.pathname
      });
    };

    window.trackBusinessClick = function(businessId, businessName, action) {
      gtag('event', action, {
        'event_category': 'Business Interaction',
        'event_label': businessName,
        'business_id': businessId,
        'action_type': action
      });
    };

    window.trackSearch = function(query, resultCount) {
      gtag('event', 'search', {
        'event_category': 'Search',
        'search_term': query,
        'result_count': resultCount
      });
    };

    window.trackMenuItemView = function(businessId, menuItem) {
      gtag('event', 'menu_item_view', {
        'event_category': 'Menu',
        'event_label': menuItem,
        'business_id': businessId
      });
    };

    window.trackQRScan = function(businessId, businessName) {
      gtag('event', 'qr_scan', {
        'event_category': 'QR Code',
        'event_label': businessName,
        'business_id': businessId
      });
    };
    // Verify data loaded correctly
    console.log('📊 Total businesses loaded:', allBusinesses ? allBusinesses.length : 0);
    console.log('✅ Business data ready');
    // Data loader removed - using master-data-loader.js instead
    console.log('🔄 Using master-data-loader.js for data management');
    // PWA Install
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('install-button').style.display = 'inline-flex';
    });

    function installApp() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('App installed');
          }
          deferredPrompt = null;
          document.getElementById('install-button').style.display = 'none';
        });
      }
    }

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('Service Worker update found');

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New Service Worker installed, refresh to update');
                }
              });
            });
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }

    // Location Services
    let userLocation = null;

    function requestLocation() {
      const btn = document.getElementById('location-prompt');
      const text = document.getElementById('location-text');

      if ('geolocation' in navigator) {
        text.textContent = 'Getting your location...';

        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            btn.classList.add('enabled');
            text.textContent = '✓ Location Enabled';
            loadCarousels();
          },
          (error) => {
            text.textContent = 'Enable Location for Nearby Results';
            console.error('Location error:', error);
            loadCarousels();
          }
        );
      } else {
        text.textContent = 'Location not supported';
        loadCarousels();
      }
    }

    // Load Carousels
    function loadCarousels() {
      const businesses = allBusinesses || [];

      // Featured Restaurants (random selection)
      const featured = businesses
        .filter(b => b.category === 'restaurants')
        .sort(() => Math.random() - 0.5)
        .slice(0, 15);
      renderCarousel('featured-carousel', featured);

      // Popular Near You (based on distance and rating)
      if (distanceService && distanceService.userLocation) {
        const nearbyBusinesses = businesses
          .filter(b => b.distanceValue && b.distanceValue <= 5) // Within 5 miles
          .sort((a, b) => {
            // Sort by rating first, then distance
            const ratingDiff = (b.rating || 0) - (a.rating || 0);
            if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
            return (a.distanceValue || 999) - (b.distanceValue || 999);
          })
          .slice(0, 15);

        if (nearbyBusinesses.length > 0) {
          document.getElementById('popular-near-you-section').style.display = 'block';
          renderCarousel('popular-near-you-carousel', nearbyBusinesses);
        }
      }

      // Seafood
      const seafood = businesses.filter(b =>
        b.cuisine && b.cuisine.toLowerCase().includes('seafood')
      );
      renderCarousel('seafood-carousel', seafood.slice(0, 15));

      // Coffee & Sweets - check both tags and cuisine
      const coffee = businesses.filter(b => {
        const hasCoffeeTag = b.tags && (
          b.tags.includes('Coffee') ||
          b.tags.includes('Dessert') ||
          b.tags.includes('Ice Cream') ||
          b.tags.includes('Cafe')
        );
        const hasCoffeeCuisine = b.cuisine && (
          b.cuisine.toLowerCase().includes('coffee') ||
          b.cuisine.toLowerCase().includes('dessert') ||
          b.cuisine.toLowerCase().includes('cafe') ||
          b.cuisine.toLowerCase().includes('bakery') ||
          b.cuisine.toLowerCase().includes('ice cream')
        );
        return hasCoffeeTag || hasCoffeeCuisine;
      });
      renderCarousel('coffee-carousel', coffee.slice(0, 15));

      // Mexican
      const mexican = businesses.filter(b =>
        b.cuisine && b.cuisine.toLowerCase().includes('mexican')
      );
      renderCarousel('mexican-carousel', mexican.slice(0, 15));
    }

    function renderCarousel(containerId, items) {
      const container = document.getElementById(containerId);

      if (items.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No items found</p></div>';
        return;
      }

      container.innerHTML = items.map(item => {
        // Check multiple image fields in order: main_image, profile_pic, images array, image, then fallback to placeholder
        let imageSrc = item.main_image || item.profile_pic || (item.images && item.images[0]) || item.image;

        // If no image or image is empty string, use placeholder
        if (!imageSrc || imageSrc.trim() === '') {
          imageSrc = `https://via.placeholder.com/200x200/0EA5E9/FFFFFF?text=${encodeURIComponent(item.name.substring(0, 15))}`;
        }

        // Use business_id or id for profile link
        const businessId = item.business_id || item.id;

        return `
        <a href="profile.html?id=${businessId}" class="carousel-card">
          <img
            srcset="${imageSrc} 1x, ${imageSrc} 2x"
            alt="${item.name}"
            loading="lazy"
            decoding="async"
          >
          <div class="body">
            <div class="name">${item.name}</div>
            <div class="cuisine">${item.cuisine || ''}</div>
          </div>
        </a>
      `;
      }).join('');
    }

    // Search is now handled by js/search.js

    // Calendar Modal Functions
    let allCalendarEvents = [];

    function openCalendarModal() {
      const modal = document.getElementById('calendar-modal');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Collect all events from all businesses
      collectAllEvents();
      renderCalendarList();
    }

    function closeCalendarModal() {
      const modal = document.getElementById('calendar-modal');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Filter calendar events by type
    function filterCalendarByType(eventType) {
      console.log('Filtering calendar by type:', eventType);

      // Update current event type
      currentEventType = eventType;

      // Update active button state
      const filterButtons = document.querySelectorAll('[data-event-type]');
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      const activeButton = document.querySelector(`[data-event-type="${eventType}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }

      // Re-render the calendar list with the filter
      renderCalendarList();

      console.log(`Filtered to show ${eventType === 'all' ? 'all events' : eventType + ' events'}`);
    }

    // Update event count badges
    function updateEventCounts() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count events by type for next 30 days
      const counts = {
        all: 0,
        'happy-hour': 0,
        'live-music': 0,
        'special': 0
      };

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const events = getEventsForDate(date);

        events.forEach(event => {
          counts.all++;
          if (event.type && counts.hasOwnProperty(event.type)) {
            counts[event.type]++;
          }
        });
      }

      // Update count displays
      Object.keys(counts).forEach(type => {
        const countElement = document.getElementById(`event-count-${type}`);
        if (countElement) {
          countElement.textContent = `(${counts[type]})`;
        }
      });

      console.log('Event counts:', counts);
    }

    function collectAllEvents() {
      allCalendarEvents = [];

      allBusinesses.forEach(business => {
        // Collect Happy Hour events
        if (business.happyHour && business.happyHours && business.happyHours.length > 0) {
          allCalendarEvents.push({
            type: 'happy-hour',
            title: 'Happy Hour',
            eventName: 'Happy Hour',
            businessName: business.name,
            businessId: business.id,
            time: business.happyHour,
            recurring: 'daily',
            description: 'Happy Hours',
            location: business.location,
            address: business.address,
            phone: business.phone
          });
        }

        // Collect special events
        if (business.events && business.events.length > 0) {
          business.events.forEach(event => {
            const eventType = event.name.toLowerCase().includes('live music') ? 'live-music' : 'special';

            allCalendarEvents.push({
              type: eventType,
              title: event.name,
              eventName: event.name,
              businessName: business.name,
              businessId: business.id,
              time: event.time,
              day: event.day,
              description: event.description,
              location: business.location,
              address: business.address,
              phone: business.phone
            });
          });
        }
      });
    }

    function parseRecurringPattern(dayString) {
      if (!dayString) return [];

      const lower = dayString.toLowerCase();

      // Handle "daily"
      if (lower.includes('daily') || lower.includes('every day')) {
        return [0, 1, 2, 3, 4, 5, 6]; // All days
      }

      // Handle specific days
      const days = [];
      if (lower.includes('sunday') || lower.includes('sun')) days.push(0);
      if (lower.includes('monday') || lower.includes('mon')) days.push(1);
      if (lower.includes('tuesday') || lower.includes('tue')) days.push(2);
      if (lower.includes('wednesday') || lower.includes('wed')) days.push(3);
      if (lower.includes('thursday') || lower.includes('thu')) days.push(4);
      if (lower.includes('friday') || lower.includes('fri')) days.push(5);
      if (lower.includes('saturday') || lower.includes('sat')) days.push(6);

      // Handle ranges like "Thu-Sun" or "Friday-Saturday"
      if (lower.includes('-')) {
        const dayMap = { 'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6 };
        const parts = lower.split('-');
        if (parts.length === 2) {
          const start = parts[0].trim().substring(0, 3);
          const end = parts[1].trim().substring(0, 3);
          const startIdx = dayMap[start];
          const endIdx = dayMap[end];

          if (startIdx !== undefined && endIdx !== undefined) {
            let idx = startIdx;
            while (true) {
              days.push(idx);
              if (idx === endIdx) break;
              idx = (idx + 1) % 7;
            }
          }
        }
      }

      return days;
    }

    function getEventsForDate(date) {
      const dayOfWeek = date.getDay();
      const events = [];

      allCalendarEvents.forEach(event => {
        let shouldShow = false;

        if (event.recurring === 'daily') {
          shouldShow = true;
        } else if (event.day) {
          const recurringDays = parseRecurringPattern(event.day);
          shouldShow = recurringDays.includes(dayOfWeek);
        }

        if (shouldShow) {
          events.push(event);
        }
      });

      return events;
    }

    function renderCalendarList() {
      const container = document.getElementById('calendar-events-list');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Generate next 30 days
      const eventsByDay = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        eventsByDay[dateString] = {
          date: date,
          events: getEventsForDate(date)
        };
      }

      // Filter out days with no events and sort
      const daysWithEvents = Object.keys(eventsByDay)
        .filter(dateString => eventsByDay[dateString].events.length > 0)
        .sort((a, b) => eventsByDay[a].date - eventsByDay[b].date);

      if (daysWithEvents.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <h3>No events scheduled</h3>
            <p>Check back later for upcoming events!</p>
          </div>
        `;
        return;
      }

      // Render events by day
      container.innerHTML = daysWithEvents.map(dateString => {
        const dayInfo = eventsByDay[dateString];
        let events = dayInfo.events;

        // Filter events by current event type
        if (currentEventType !== 'all') {
          events = events.filter(event => event.type === currentEventType);
        }

        // Skip days with no events after filtering
        if (events.length === 0) {
          return '';
        }

        // Group events by business
        const eventsByBusiness = {};
        events.forEach(event => {
          if (!eventsByBusiness[event.businessId]) {
            eventsByBusiness[event.businessId] = [];
          }
          eventsByBusiness[event.businessId].push(event);
        });

        return `
          <div class="calendar-day-section">
            <h2 class="calendar-day-header">${dateString}</h2>
            ${Object.entries(eventsByBusiness).map(([businessId, businessEvents]) => {
              // Use first event for the card display
              const mainEvent = businessEvents[0];
              const eventCount = businessEvents.length;

              // Create summary of all event types
              const eventTypes = [...new Set(businessEvents.map(e => e.type))];
              const badgeText = eventCount > 1 ? `${eventCount} Events` :
                                mainEvent.type === 'happy-hour' ? 'Happy Hour' :
                                mainEvent.type === 'live-music' ? 'Live Music' : 'Special';

              return `
                <div class="calendar-event-card">
                  <div class="calendar-event-header">
                    <div class="calendar-event-title">
                      <h3 class="calendar-event-business">${mainEvent.businessName}</h3>
                      ${eventCount === 1 ? `
                        <div class="calendar-event-name">${mainEvent.eventName}</div>
                      ` : `
                        <div class="calendar-event-name">${businessEvents.map(e => e.eventName).join(' • ')}</div>
                      `}
                    </div>
                    <span class="calendar-event-badge ${mainEvent.type}">${badgeText}</span>
                  </div>

                  ${eventCount === 1 ? `
                    <div class="calendar-event-meta">
                      ${mainEvent.time ? `
                        <div class="calendar-event-meta-item">
                          <span>🕐</span>
                          <span>${mainEvent.time}</span>
                        </div>
                      ` : ''}
                      ${mainEvent.location ? `
                        <div class="calendar-event-meta-item">
                          <span>📍</span>
                          <span>${mainEvent.location}</span>
                        </div>
                      ` : ''}
                    </div>

                    ${mainEvent.description ? `
                      <div class="calendar-event-description">${mainEvent.description}</div>
                    ` : ''}
                  ` : `
                    <div class="calendar-event-description" style="color: var(--text-muted); font-style: italic;">
                      Multiple events today - Click "View Details" to see all
                    </div>
                  `}

                  <div class="calendar-event-actions">
                    <button class="btn btn-primary" onclick="showEventDetailsModal(${JSON.stringify(businessEvents).replace(/"/g, '&quot;')}, '${dateString.replace(/'/g, "\\'")}')" style="font-size: 14px; padding: 8px 16px;">View Details</button>
                    ${mainEvent.phone ? `<a href="tel:${mainEvent.phone}" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">📞 Call</a>` : ''}
                    ${mainEvent.address ? `<a href="#" onclick="event.preventDefault(); openMapsFromCalendar('${mainEvent.address.replace(/'/g, "\\'")}');" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">🗺️ Directions</a>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).filter(html => html !== '').join('');

      // Update event counts
      updateEventCounts();

      // Show message if no events match filter
      if (container.innerHTML.trim() === '') {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <h3>No events found</h3>
            <p>Try selecting a different category filter</p>
          </div>
        `;
      }
    }

    function openMapsFromCalendar(address) {
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

    // Show event details modal
    function showEventDetailsModal(events, dateString) {
      const modal = document.getElementById('event-details-modal');
      const modalTitle = document.getElementById('event-details-title');
      const modalContent = document.getElementById('event-details-content');

      if (!modal || !modalTitle || !modalContent) {
        console.error('Event details modal elements not found');
        return;
      }

      // Set modal title
      const businessName = events[0].businessName;
      modalTitle.textContent = `${businessName} - ${dateString}`;

      // Render all events
      modalContent.innerHTML = events.map(event => {
        const badgeText = event.type === 'happy-hour' ? 'Happy Hour' :
                          event.type === 'live-music' ? 'Live Music' :
                          event.type === 'trivia' ? 'Trivia Night' :
                          event.type === 'karaoke' ? 'Karaoke' :
                          event.type === 'bingo' ? 'Bingo' : 'Special';

        return `
          <div style="background: var(--bg-card); border: 2px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
              <div>
                <h3 style="margin: 0 0 8px 0; color: var(--text); font-size: 18px;">${event.eventName}</h3>
                ${event.time ? `
                  <div style="color: var(--text-muted); margin-bottom: 4px;">
                    <span style="margin-right: 8px;">🕐</span>${event.time}
                  </div>
                ` : ''}
                ${event.location ? `
                  <div style="color: var(--text-muted);">
                    <span style="margin-right: 8px;">📍</span>${event.location}
                  </div>
                ` : ''}
              </div>
              <span style="background: var(--primary); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap;">${badgeText}</span>
            </div>
            ${event.description ? `
              <div style="color: var(--text); margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
                ${event.description}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      // Add action buttons
      const firstEvent = events[0];
      const actionsHtml = `
        <div style="display: flex; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border);">
          <a href="profile.html?id=${firstEvent.businessId}" class="btn btn-primary" style="text-decoration: none; flex: 1; text-align: center;">View Business Profile</a>
          ${firstEvent.phone ? `<a href="tel:${firstEvent.phone}" class="btn btn-secondary" style="text-decoration: none; flex: 1; text-align: center;">📞 Call</a>` : ''}
          ${firstEvent.address ? `<button class="btn btn-secondary" onclick="openMapsFromCalendar('${firstEvent.address.replace(/'/g, "\\'")}')" style="flex: 1;">🗺️ Directions</button>` : ''}
        </div>
      `;
      modalContent.innerHTML += actionsHtml;

      // Show modal
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    // Close event details modal
    function closeEventDetailsModal() {
      const modal = document.getElementById('event-details-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('event-details-modal');
      if (e.target === modal) {
        closeEventDetailsModal();
      }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeEventDetailsModal();
      }
    });

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      loadCarousels();

      // Initialize notifications
      if (typeof notificationsManager !== 'undefined') {
        notificationsManager.init(allBusinesses);
        const notificationsHtml = notificationsManager.renderNotificationBanner();
        if (notificationsHtml) {
          document.getElementById('notifications-container').innerHTML = notificationsHtml;
        }
      }

      // Initialize and render recommendations
      if (typeof recommendationsEngine !== 'undefined') {
        const recommendations = recommendationsEngine.getHomepageRecommendations(allBusinesses);
        if (recommendations.length > 0) {
          document.getElementById('recommendations-section').style.display = 'block';
          renderCarousel('recommendations-carousel', recommendations);
        }
      }
    });

    // Hamburger Menu Toggle
    function toggleMenu() {
      const hamburger = document.getElementById('hamburger-btn');
      const dropdown = document.getElementById('nav-dropdown');
      hamburger.classList.toggle('active');
      dropdown.classList.toggle('active');
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const hamburger = document.getElementById('hamburger-btn');
      const dropdown = document.getElementById('nav-dropdown');
      if (!hamburger.contains(e.target) && !dropdown.contains(e.target)) {
        hamburger.classList.remove('active');
        dropdown.classList.remove('active');
      }
    });

    // Map functionality
    let map;
    let markers = [];
    let userMarker = null;
    let currentCategory = 'all';
    let heatLayer = null;
    let heatMapVisible = false;

    // Calendar functionality
    let currentEventType = 'all';

    function openMapModal() {
      console.log('openMapModal called');

      const modal = document.getElementById('map-modal');

      if (!modal) {
        console.error('Map modal not found!');
        alert('Map modal element not found!');
        return;
      }

      console.log('Modal found, adding active class');
      modal.style.display = 'flex';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('Modal should now be visible');

      // Check if Leaflet is loaded
      if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded!');
        alert('Map library not loaded. Please refresh the page and try again.');
        return;
      }

      console.log('Leaflet loaded, version:', L.version);

      // Initialize map only once
      if (!map) {
        try {
          console.log('Initializing map...');
          console.log('Leaflet version:', L.version);
          // Center on Gulf Coast area (Orange Beach, Gulf Shores, Perdido Key)
          map = L.map('map-container').setView([30.27, -87.60], 11);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(map);

        // Add markers for all businesses with coordinates
        allBusinesses.forEach(business => {
          if (business.coordinates) {
            // Create custom icon with category color
            const categoryColors = {
              'restaurants': '#FF6B35',
              'coffee-sweets': '#F7931E',
              'shopping': '#C1328E',
              'activities': '#00A8E1',
              'entertainment': '#8B5CF6'
            };

            const iconColor = categoryColors[business.category] || '#FF6B35';

            // Create marker
            const marker = L.marker([business.coordinates.lat, business.coordinates.lng], {
              icon: L.divIcon({
                className: 'custom-map-marker',
                html: `<div style="background-color: ${iconColor}; width: 30px; height: 30px;  border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })
            }).addTo(map);

            // Create popup content
            const popupContent = `
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: var(--text);">${business.name}</h3>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: var(--text-muted);">${business.cuisine || business.category}</p>
                ${business.address ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: var(--text-muted);">📍 ${business.address}</p>` : ''}
                <a href="profile.html?id=${business.id}" style="display: inline-block; padding: 6px 12px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">View Profile</a>
              </div>
            `;

            marker.bindPopup(popupContent);
            // Store category with marker for filtering
            marker.businessCategory = business.category;
            markers.push(marker);
          }
        });

        console.log(`Map initialized with ${markers.length} markers`);

        // Generate and add heat map layer
        generateHeatMap();

        // Update category counts
        updateCategoryCounts();

        // Initialize business list
        setTimeout(() => {
          updateBusinessList();
        }, 100);
        } catch (error) {
          console.error('Error initializing map:', error);
          alert('Error loading map. Please check the console for details.');
        }
      } else {
        // If map already exists, just invalidate size to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    }

    function closeMapModal() {
      console.log('closeMapModal called');
      const modal = document.getElementById('map-modal');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('Modal closed');
      }
    }

    // Generate heat map data based on business locations and popularity
    function generateHeatMap() {
      if (!map) return;

      const heatData = [];

      allBusinesses.forEach(business => {
        if (business.coordinates) {
          // Calculate popularity weight based on business features
          let weight = 1.0; // Base weight

          // Increase weight for businesses with events
          if (business.events && business.events.length > 0) {
            weight += business.events.length * 0.5;
          }

          // Increase weight for businesses with happy hour
          if (business.happyHour) {
            weight += 0.8;
          }

          // Increase weight for popular categories
          if (business.category === 'restaurants') {
            weight += 0.5;
          } else if (business.category === 'entertainment') {
            weight += 0.7;
          }

          // Increase weight for businesses with multiple images (more established)
          if (business.images && business.images.length > 3) {
            weight += 0.3;
          }

          // Add the point with its weight (intensity)
          heatData.push([
            business.coordinates.lat,
            business.coordinates.lng,
            weight
          ]);
        }
      });

      // Create heat layer (but don't add to map yet)
      heatLayer = L.heatLayer(heatData, {
        radius: 35,
        blur: 40,
        maxZoom: 17,
        max: 5.0,
        gradient: {
          0.0: '#0EA5E9',  // Blue (low activity)
          0.2: '#14B8A6',  // Teal
          0.4: '#F59E0B',  // Orange
          0.6: '#F97316',  // Coral
          0.8: '#EF4444',  // Red
          1.0: '#DC2626'   // Dark Red (hot spot)
        }
      });

      console.log(`Heat map generated with ${heatData.length} data points`);
    }

    // Toggle heat map visibility
    function toggleHeatMap() {
      if (!map || !heatLayer) {
        console.error('Map or heat layer not initialized');
        return;
      }

      const toggleBtn = document.getElementById('heatmap-toggle');
      const toggleText = document.getElementById('heatmap-toggle-text');

      if (heatMapVisible) {
        // Hide heat map
        map.removeLayer(heatLayer);
        heatMapVisible = false;
        toggleText.textContent = 'Show Heat Map';
        toggleBtn.style.background = 'rgba(255, 107, 53, 0.1)';
        toggleBtn.style.color = '#FF6B35';
        console.log('Heat map hidden');
      } else {
        // Show heat map
        heatLayer.addTo(map);
        heatMapVisible = true;
        toggleText.textContent = 'Hide Heat Map';
        toggleBtn.style.background = '#FF6B35';
        toggleBtn.style.color = 'white';
        console.log('Heat map shown');
      }
    }

    // Filter map markers by category
    function filterMapByCategory(category) {
      console.log('Filtering map by category:', category);

      // Update current category
      currentCategory = category;

      // Update active button state
      const filterButtons = document.querySelectorAll('.map-category-filter');
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      const activeButton = document.querySelector(`[data-category="${category}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }

      // Show/hide markers based on category
      if (map && markers) {
        markers.forEach(marker => {
          if (category === 'all') {
            // Show all markers
            marker.addTo(map);
          } else {
            // Show only markers matching the selected category
            if (marker.businessCategory === category) {
              marker.addTo(map);
            } else {
              map.removeLayer(marker);
            }
          }
        });
      }

      // Update business list to show filtered category
      updateBusinessList();

      console.log(`Filtered to show ${category === 'all' ? 'all' : category} businesses`);
    }

    // Update category counts in filter buttons
    function updateCategoryCounts() {
      try {
        const counts = {
          all: markers.length,
          restaurants: 0,
          'coffee-sweets': 0,
          activities: 0,
          entertainment: 0,
          shopping: 0
        };

        // Count markers by category
        markers.forEach(marker => {
          if (marker.businessCategory && counts.hasOwnProperty(marker.businessCategory)) {
            counts[marker.businessCategory]++;
          }
        });

        // Update count displays
        Object.keys(counts).forEach(category => {
          const countElement = document.getElementById(`count-${category}`);
          if (countElement) {
            countElement.textContent = `(${counts[category]})`;
          }
        });

        console.log('Category counts:', counts);
      } catch (error) {
        console.error('Error updating category counts:', error);
      }
    }

    // Share My Location - Get user's geolocation
    function shareMyLocation() {
      const btn = document.getElementById('share-location-btn');
      const statusElement = document.getElementById('location-status');

      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      // Update button to show loading
      btn.textContent = 'Getting Location...';
      btn.disabled = true;
      statusElement.textContent = 'Getting your location...';

      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          console.log('User location:', userLocation);

          // Update button
          btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
            </svg>
            Location Shared ✓
          `;
          btn.disabled = false;
          btn.style.background = '#10B981';
          btn.style.borderColor = '#10B981';

          statusElement.textContent = 'Sorted by distance from you';

          // Add user marker to map
          addUserMarkerToMap();

          // Update business list with distances
          updateBusinessList();
        },
        // Error callback
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location';

          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out.';
          }

          alert(errorMessage);

          // Reset button
          btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Share My Location
          `;
          btn.disabled = false;
          statusElement.textContent = '';
        },
        // Options
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    // Add user location marker to map
    function addUserMarkerToMap() {
      if (!map || !userLocation) return;

      // Remove existing user marker if present
      if (userMarker) {
        map.removeLayer(userMarker);
      }

      // Create blue user marker
      userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `<div style="background-color: #3B82F6; width: 20px; height: 20px;  border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); position: relative;">
                   <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: white; "></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="text-align: center;">
          <strong>Your Location</strong>
        </div>
      `);

      // Center map on user location
      map.setView([userLocation.lat, userLocation.lng], 12);
    }

    // Calculate distance between two coordinates using Haversine formula
    // Returns distance in miles
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 3959; // Earth's radius in miles
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance;
    }

    function toRad(degrees) {
      return degrees * (Math.PI / 180);
    }

    // Update business list sorted by distance
    function updateBusinessList() {
      const listContainer = document.getElementById('business-list');
      const titleElement = document.getElementById('business-list-title');

      // Check if allBusinesses is available
      if (typeof allBusinesses === 'undefined') {
        console.error('allBusinesses not loaded yet');
        return;
      }

      // Get businesses with coordinates for current category
      let businessesToShow = allBusinesses.filter(business => {
        if (!business.coordinates) return false;
        if (currentCategory === 'all') return true;
        return business.category === currentCategory;
      });

      // If user location is available, calculate distances and sort
      if (userLocation) {
        businessesToShow = businessesToShow.map(business => ({
          ...business,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            business.coordinates.lat,
            business.coordinates.lng
          )
        })).sort((a, b) => a.distance - b.distance);
      }

      // Update title
      const categoryName = currentCategory === 'all' ? 'All Businesses' :
        currentCategory === 'restaurants' ? 'Restaurants' :
        currentCategory === 'coffee-sweets' ? 'Coffee & Sweets' :
        currentCategory === 'activities' ? 'Activities' :
        currentCategory === 'entertainment' ? 'Entertainment' :
        currentCategory === 'shopping' ? 'Shopping' : 'Businesses';

      titleElement.textContent = categoryName;

      // Render business list
      if (businessesToShow.length === 0) {
        listContainer.innerHTML = `
          <p style="font-size: 14px; color: var(--text-muted); padding: 20px; text-align: center;">
            No businesses with map coordinates in this category yet.
          </p>
        `;
        return;
      }

      listContainer.innerHTML = businessesToShow.map(business => `
        <a href="profile.html?id=${business.id}" class="business-list-item">
          ${userLocation && business.distance !== undefined ? `
            <div class="business-list-item-distance">
              ${business.distance < 0.1 ? '< 0.1' : business.distance.toFixed(1)} mi
            </div>
          ` : ''}
          <div class="business-list-item-info">
            <h4 class="business-list-item-name">${business.name}</h4>
            <p class="business-list-item-cuisine">${business.cuisine || business.category}</p>
            ${business.address ? `<p class="business-list-item-address">📍 ${business.address}</p>` : ''}
          </div>
        </a>
      `).join('');
    }

    // Close modals when clicking outside content
    document.addEventListener('DOMContentLoaded', () => {
      // Load carousels on page load
      loadCarousels();

      // Calendar modal close on outside click
      const calendarModal = document.getElementById('calendar-modal');
      if (calendarModal) {
        calendarModal.addEventListener('click', (e) => {
          if (e.target === calendarModal) {
            closeCalendarModal();
          }
        });
      }

      // Map modal close on outside click
      const mapModal = document.getElementById('map-modal');
      if (mapModal) {
        mapModal.addEventListener('click', (e) => {
          if (e.target === mapModal) {
            closeMapModal();
          }
        });
      }
    });
    // Admin login modal functionality
    const adminLoginTrigger = document.getElementById('admin-login-trigger');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminQuickLoginForm = document.getElementById('admin-quick-login-form');
    const adminQuickPassword = document.getElementById('admin-quick-password');
    const adminErrorMessage = document.getElementById('admin-error-message');

    // Initialize admin auth (but don't require auth on main site)
    const adminAuthQuick = new AdminAuth({ requireAuth: false });

    // Open modal
    adminLoginTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      adminLoginModal.style.display = 'flex';
      setTimeout(() => {
        adminQuickPassword.focus();
      }, 100);
    });

    // Close modal
    function closeAdminModal() {
      adminLoginModal.style.display = 'none';
      adminQuickPassword.value = '';
      adminErrorMessage.style.display = 'none';
    }

    // Close on outside click
    adminLoginModal.addEventListener('click', (e) => {
      if (e.target === adminLoginModal) {
        closeAdminModal();
      }
    });

    // Handle login
    adminQuickLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const password = adminQuickPassword.value;

      if (!adminAuthQuick.isPasswordSet()) {
        // Redirect to setup page
        window.location.href = 'admin.html';
        return;
      }

      // Try to login
      const result = adminAuthQuick.login(password);

      if (result.success) {
        // Success! Redirect to dashboard
        window.location.href = 'admin-dashboard.html';
      } else {
        // Show error
        adminErrorMessage.textContent = result.error || 'Incorrect password';
        adminErrorMessage.style.display = 'block';
        adminQuickPassword.value = '';
        adminQuickPassword.focus();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && adminLoginModal.style.display === 'flex') {
        closeAdminModal();
      }
    });
    // Perform home page search
    function performHomeSearch(event) {
      event.preventDefault();
      const searchInput = document.getElementById('home-search-input');
      const query = searchInput.value.trim();

      if (query) {
        // Redirect to search results page with query
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
      }
    }

    // ===== MASTER CALENDAR FUNCTION =====
    function showMasterCalendar() {
      // Open calendar modal for all businesses (null = master calendar)
      if (typeof openCalendarModal === 'function') {
        openCalendarModal(null);
      } else {
        console.error('Calendar modal function not loaded yet');
      }
    }

    // ===== BUSINESS INQUIRY MODAL =====
    function openBusinessInquiry() {
      document.getElementById('business-inquiry-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeBusinessInquiry() {
      document.getElementById('business-inquiry-modal').classList.remove('active');
      document.body.style.overflow = '';

      setTimeout(() => {
        document.getElementById('form-view').style.display = 'block';
        document.getElementById('success-view').classList.remove('active');
        document.getElementById('business-inquiry-form').reset();
        document.getElementById('submit-btn').disabled = false;
      }, 300);
    }

    document.getElementById('business-inquiry-modal').addEventListener('click', (e) => {
      if (e.target.id === 'business-inquiry-modal') {
        closeBusinessInquiry();
      }
    });

    async function submitBusinessInquiry(e) {
      e.preventDefault();

      const submitBtn = document.getElementById('submit-btn');
      const formData = {
        businessName: document.getElementById('business-name').value,
        contactName: document.getElementById('contact-name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString(),
        source: 'GCR Website - Homepage CTA'
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('business_inquiries') || '[]');
        existing.push(formData);
        localStorage.setItem('business_inquiries', JSON.stringify(existing));

        console.log('✅ New Business Inquiry:', formData);

        // Send to backend API
        await fetch(`${CONFIG.getApiUrl('gcr')}/business/inquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        document.getElementById('submitted-email').textContent = formData.email;
        document.getElementById('form-view').style.display = 'none';
        document.getElementById('success-view').classList.add('active');

      } catch (error) {
        console.error('Error:', error);
        alert('Sorry, there was an error. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry →';
      }
    }

    // Phone number formatting
    document.getElementById('phone').addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);

      if (value.length >= 6) {
        e.target.value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
      } else if (value.length >= 3) {
        e.target.value = `(${value.slice(0,3)}) ${value.slice(3)}`;
      } else {
        e.target.value = value;
      }
    });

    // ===== LOCATION PERMISSION POPUP =====
    function showLocationPopup() {
      const popup = document.getElementById('location-permission-popup');
      const hasSeenPopup = localStorage.getItem('gcr_location_popup_seen');

      // Only show if not seen before and geolocation is available
      if (!hasSeenPopup && 'geolocation' in navigator) {
        setTimeout(() => {
          popup.classList.add('active');
        }, 2000); // Show 2 seconds after page load
      }
    }

    function acceptLocationPermission() {
      localStorage.setItem('gcr_location_popup_seen', 'true');
      document.getElementById('location-permission-popup').classList.remove('active');
      requestLocation(); // Call existing location request function
    }

    function declineLocationPermission() {
      localStorage.setItem('gcr_location_popup_seen', 'true');
      document.getElementById('location-permission-popup').classList.remove('active');
    }

    // Show popup on page load
    window.addEventListener('load', () => {
      showLocationPopup();
    });

    // ===== SCROLL TO CATEGORIES =====
    function scrollToCategories() {
      const categories = document.querySelector('.carousel-section');
      if (categories) {
        categories.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Make functions globally accessible
    window.openBusinessInquiry = openBusinessInquiry;
    window.closeBusinessInquiry = closeBusinessInquiry;
    window.submitBusinessInquiry = submitBusinessInquiry;
    window.acceptLocationPermission = acceptLocationPermission;
    window.declineLocationPermission = declineLocationPermission;
    window.scrollToCategories = scrollToCategories;
    // Show/hide date fields based on user type
    document.querySelectorAll('input[name="userType"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const datesGroup = document.getElementById('datesGroup');
        const checkInInput = document.getElementById('signupCheckIn');
        const checkOutInput = document.getElementById('signupCheckOut');

        if (this.value === 'local') {
          // Locals don't need dates
          datesGroup.style.display = 'none';
          checkInInput.removeAttribute('required');
          checkOutInput.removeAttribute('required');
          checkInInput.value = '';
          checkOutInput.value = '';
        } else {
          // Tourists and snowbirds need dates
          datesGroup.style.display = 'block';
          checkInInput.setAttribute('required', 'required');
          checkOutInput.setAttribute('required', 'required');
        }
      });
    });

    // Validate at least one interest is checked
    document.getElementById('loyaltySignupForm').addEventListener('submit', function(e) {
      const interestsChecked = document.querySelectorAll('input[name="interests"]:checked').length;
      if (interestsChecked === 0) {
        e.preventDefault();
        alert('Please select at least one interest to continue.');
        return false;
      }
    });
