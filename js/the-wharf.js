// The Wharf District Page - Business Directory with Modal Profile View

const DISTRICT_NAME = 'The Wharf';
let wharfBusinesses = [];
let currentBusinessId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadWharfBusinesses();
  setupHistoryListener();
  checkURLForBusiness();
});

// Load all businesses at The Wharf
function loadWharfBusinesses() {
  // Filter businesses by district
  wharfBusinesses = allBusinesses.filter(b =>
    b.district === DISTRICT_NAME ||
    (b.tags && b.tags.includes('The Wharf')) ||
    (b.name && b.name.includes('Wharf'))
  );

  console.log(`Found ${wharfBusinesses.length} businesses at ${DISTRICT_NAME}`);

  // Categorize businesses
  const restaurants = wharfBusinesses.filter(b => b.display_category === 'Restaurants' || b.category === 'restaurant');
  const shops = wharfBusinesses.filter(b => b.display_category === 'Coffee & Sweets' || (b.tags && b.tags.includes('Shopping')));
  const attractions = wharfBusinesses.filter(b => b.display_category === 'Other' || (b.tags && b.tags.includes('Entertainment')));

  // Count events
  let totalEvents = 0;
  wharfBusinesses.forEach(b => {
    if (b.events && b.events.length > 0) {
      totalEvents += b.events.length;
    }
  });

  // Update stats
  document.getElementById('stat-restaurants').textContent = restaurants.length;
  document.getElementById('stat-shops').textContent = shops.length;
  document.getElementById('stat-attractions').textContent = attractions.length;
  document.getElementById('stat-events').textContent = totalEvents;

  // Display businesses
  displayBusinesses('restaurants-grid', restaurants);
  if (shops.length > 0) {
    document.getElementById('shopping-section').style.display = 'block';
    displayBusinesses('shopping-grid', shops);
  }
  if (attractions.length > 0) {
    document.getElementById('attractions-section').style.display = 'block';
    displayBusinesses('attractions-grid', attractions);
  }
}

// Display businesses in grid
function displayBusinesses(gridId, businesses) {
  const grid = document.getElementById(gridId);

  if (businesses.length === 0) {
    grid.innerHTML = '<p style="color: #6B7280;">Coming soon...</p>';
    return;
  }

  grid.innerHTML = businesses.map(business => {
    const tags = business.tags ? business.tags.slice(0, 3) : [];

    return `
      <div class="directory-item" onclick="openBusinessModal('${business.id}')">
        <h3 class="directory-item-name">${business.name}</h3>
        <div class="directory-item-category">${business.display_category || business.category || 'Business'}</div>
        ${tags.length > 0 ? `
          <div class="directory-item-tags">
            ${tags.map(tag => `<span class="directory-item-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Open business modal
function openBusinessModal(businessId) {
  const business = wharfBusinesses.find(b => b.id === businessId);
  if (!business) {
    console.error('Business not found:', businessId);
    return;
  }

  currentBusinessId = businessId;

  // Update URL without page reload
  history.pushState({ businessId }, '', `#${businessId}`);

  // Render modal content
  renderModalContent(business);

  // Show modal
  const modal = document.getElementById('businessModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close business modal
function closeBusinessModal() {
  const modal = document.getElementById('businessModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  currentBusinessId = null;

  // Update URL
  history.pushState({}, '', window.location.pathname);
}

// Render modal content
function renderModalContent(business) {
  const modalBody = document.getElementById('modalBody');

  // Format hours
  let hoursHTML = '';
  if (business.hours && business.hours.length > 0) {
    hoursHTML = business.hours.map(h => {
      if (h.is_closed) {
        return `<div>${h.day}: <strong>Closed</strong></div>`;
      }
      return `<div>${h.day}: ${h.open_time} - ${h.close_time}</div>`;
    }).join('');
  } else {
    hoursHTML = '<div>Hours not available</div>';
  }

  // Format events
  let eventsHTML = '';
  if (business.events && business.events.length > 0) {
    eventsHTML = `
      <div class="business-modal-section">
        <h3 class="business-modal-section-title">
          <span>🎵</span>
          <span>Upcoming Events</span>
        </h3>
        ${business.events.slice(0, 5).map(event => `
          <div style="margin-bottom: 16px; padding: 16px; background: #F9FAFB; border-radius: 12px;">
            <div style="font-weight: 700; color: #1F2937; margin-bottom: 4px;">${event.name}</div>
            <div style="font-size: 14px; color: #6B7280;">
              ${event.day} ${event.time ? `• ${event.time}` : ''}
            </div>
            ${event.description ? `<div style="font-size: 14px; color: #4B5563; margin-top: 8px;">${event.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Format tags
  let tagsHTML = '';
  if (business.tags && business.tags.length > 0) {
    tagsHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px;">
        ${business.tags.map(tag => `
          <span style="background: #EFF6FF; color: #1E40AF; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;">
            ${tag}
          </span>
        `).join('')}
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="business-modal-header">
      <div class="business-modal-name">${business.name}</div>
      <div class="business-modal-category">${business.display_category || business.category}</div>
    </div>

    ${business.description ? `
      <div class="business-modal-section">
        <div class="business-modal-description">${business.description}</div>
      </div>
    ` : ''}

    <div class="business-modal-section">
      <h3 class="business-modal-section-title">
        <span>📍</span>
        <span>Contact & Location</span>
      </h3>
      <div class="business-modal-info-grid">
        ${business.address ? `
          <div class="business-modal-info-item">
            <span class="business-modal-info-icon">🗺️</span>
            <div class="business-modal-info-text">${business.address}</div>
          </div>
        ` : ''}
        ${business.phone ? `
          <div class="business-modal-info-item">
            <span class="business-modal-info-icon">📞</span>
            <div class="business-modal-info-text"><a href="tel:${business.phone}" style="color: inherit; text-decoration: none;">${business.phone}</a></div>
          </div>
        ` : ''}
        ${business.website ? `
          <div class="business-modal-info-item">
            <span class="business-modal-info-icon">🌐</span>
            <div class="business-modal-info-text"><a href="${business.website}" target="_blank" style="color: #14B8A6; text-decoration: none;">Visit Website</a></div>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="business-modal-section">
      <h3 class="business-modal-section-title">
        <span>⏰</span>
        <span>Hours</span>
      </h3>
      <div class="business-modal-info-text">
        ${hoursHTML}
      </div>
    </div>

    ${eventsHTML}

    ${tagsHTML}

    <div class="business-modal-cta">
      <a href="profile.html?id=${business.id}" class="business-modal-button business-modal-button-primary">
        View Full Profile
      </a>
      ${business.phone ? `
        <a href="tel:${business.phone}" class="business-modal-button business-modal-button-secondary">
          📞 Call Now
        </a>
      ` : ''}
      ${business.website ? `
        <a href="${business.website}" target="_blank" class="business-modal-button business-modal-button-secondary">
          🌐 Website
        </a>
      ` : ''}
    </div>
  `;
}

// Setup history listener for back button
function setupHistoryListener() {
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.businessId) {
      openBusinessModal(event.state.businessId);
    } else {
      closeBusinessModal();
    }
  });
}

// Check URL for business on page load
function checkURLForBusiness() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    // Small delay to ensure businesses are loaded
    setTimeout(() => {
      openBusinessModal(hash);
    }, 100);
  }
}

// Handle ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentBusinessId) {
    closeBusinessModal();
  }
});
