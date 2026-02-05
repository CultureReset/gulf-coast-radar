// Other Category Page JavaScript
let allItems = [];
let filteredItems = [];
let currentSort = 'distance';
let selectedFilter = 'all';

// Helper function to remove URLs from text
function stripUrls(text) {
  if (!text) return '';
  // Remove URLs (http, https, www, and common domain patterns)
  return text.replace(/(?:https?:\/\/|www\.)[^\s]+/gi, '')
    .replace(/\b[a-z0-9-]+\.(com|net|org|info|biz|us|co|io)[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Define categories to INCLUDE in "Other" - Shopping, Hotels, Services, Beach Access, Parking, etc.
const otherCategories = [
  'other', 'shopping', 'hotels', 'lodging', 'boat-launch', 'parking', 'beach-access', 'beach access'
];

async function initializeOtherPage() {
  console.log('Other category page loading...');

  // Check if data is loaded
  if (typeof allBusinesses === 'undefined' || !allBusinesses || allBusinesses.length === 0) {
    console.log('⏳ Waiting for business data to load...');
    return;
  }

  // Get businesses IN "Other" categories (shopping, hotels, services, etc.)
  // Exclude restaurants, coffee-sweets, things-to-do, activities, attractions, nightlife
  allItems = allBusinesses.filter(b => {
    const cat = (b.category || '').toLowerCase();

    // Include only specific "other" categories
    return otherCategories.includes(cat);
  });

  filteredItems = [...allItems];

  // Log breakdown by category
  const breakdown = {};
  allItems.forEach(b => {
    const cat = b.category || 'uncategorized';
    breakdown[cat] = (breakdown[cat] || 0) + 1;
  });
  console.log('✅ Found "other" businesses:', allItems.length, breakdown);

  // Display immediately without distances
  displayBusinesses(filteredItems);
  updateResultsTitle();

  // Calculate distances in background
  try {
    console.log('Calculating distances...');
    allItems = await calculateDistancesForBusinesses(allItems);
    allItems = sortByDistance(allItems);
    filteredItems = [...allItems];
    console.log('Distances calculated, refreshing display');
    displayBusinesses(filteredItems);
  } catch (error) {
    console.error('Error calculating distances:', error);
  }

  setupEventListeners();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeOtherPage();
});

// Listen for Google Sheets data to load
window.addEventListener('allBusinessesUpdated', () => {
  console.log('🔄 Other page updating with new business data...');
  initializeOtherPage();
});

function setupEventListeners() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  const chips = document.querySelectorAll('.cuisine-filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedFilter = chip.getAttribute('data-filter');
      applyFilters();
    });
  });
}

function applyFilters() {
  if (selectedFilter === 'all') {
    filteredItems = [...allItems];
  } else {
    filteredItems = allItems.filter(b => {
      const cat = (b.category || '').toLowerCase();
      const subcat = (b.subcategory || '').toLowerCase();
      const tags = (b.tags || []).map(t => t.toLowerCase());
      const filter = selectedFilter.toLowerCase();

      return cat.includes(filter) || subcat.includes(filter) || tags.some(tag => tag.includes(filter));
    });
  }

  applySorting(currentSort);
  displayBusinesses(filteredItems);
  updateResultsTitle();
}

function handleSort(e) {
  currentSort = e.target.value;
  applySorting(currentSort);
  displayBusinesses(filteredItems);
}

function applySorting(sortBy) {
  filteredItems.sort((a, b) => {
    switch(sortBy) {
      case 'distance':
        if (a.distance === null || a.distance === undefined) return 1;
        if (b.distance === null || b.distance === undefined) return -1;
        return a.distance - b.distance;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

function displayBusinesses(businesses) {
  const grid = document.getElementById('businesses-grid');

  if (businesses.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No businesses found in this category</h3>
        <p>Check back soon for updates!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = businesses.map(business => `
    <div class="business-card" data-business-id="${business.id}" onclick="window.location.href='profile.html?id=${business.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${business.name}</h3>
        ${business.category ? `<span class="business-category">${business.category}</span>` : ''}
        ${business.subcategory ? `<div class="business-cuisine">${business.subcategory}</div>` : ''}
      </div>

      <div class="business-card-image-centered">
        <img src="${(business.images && business.images[0]) || business.image || business.profile_pic || business.main_image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23dbeafe%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%232563eb%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E🎯 Activity%3C/text%3E%3C/svg%3E'}" alt="${business.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23dbeafe%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%232563eb%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E🎯 Activity%3C/text%3E%3C/svg%3E'">
      </div>

      <div class="business-card-details">
        <div class="business-info">
          ${(business.address || business.vicinity) ? `<div class="business-info-item">📍 ${business.address || business.vicinity}</div>` : ''}
          ${business.distanceText ? `<div class="business-info-item">🚗 ${business.distanceText} away</div>` : ''}
          ${business.phone ? `<div class="business-info-item">📞 ${business.phone}</div>` : ''}
          ${business.hours ? `<div class="business-info-item">🕐 ${typeof business.hours === 'object' ? JSON.stringify(business.hours) : business.hours}</div>` : ''}
          ${business.hours && typeof getBusinessStatus === 'function' ? (() => {
            const status = getBusinessStatus(business);
            return status.badge ? `
              <div class="business-status-badge ${status.class}">
                ${status.badge}
              </div>
              ${status.text ? `<div class="business-status-text">${status.text}</div>` : ''}
            ` : '';
          })() : ''}
        </div>

        <p class="business-description">${stripUrls(business.description || '')}</p>

        ${business.tags && business.tags.length > 0 ? `
          <div class="business-tags">
            ${business.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${business.id}'">View Profile</button>
          ${business.phone ? `<a href="tel:${business.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call Now</a>` : ''}
          ${business.address ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${business.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function updateResultsTitle() {
  const count = filteredItems.length;
  let title = selectedFilter === 'all' ? 'All Other' : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);
  document.getElementById('results-title').textContent = `${title} (${count})`;
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

// Go back function
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
}
