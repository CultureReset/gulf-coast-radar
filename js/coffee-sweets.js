// Coffee & Sweets Page JavaScript

let allCoffeeSweets = [];
let filteredCoffeeSweets = [];
let currentSort = 'distance';
let selectedCategories = [];

// Helper function to remove URLs from text
function stripUrls(text) {
  if (!text) return '';
  // Remove URLs (http, https, www, and common domain patterns)
  return text.replace(/(?:https?:\/\/|www\.)[^\s]+/gi, '')
    .replace(/\b[a-z0-9-]+\.(com|net|org|info|biz|us|co|io)[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function initializeCoffeeSweetsPage() {
  console.log('Coffee & Sweets page loading...');

  // Get coffee and sweets businesses
  allCoffeeSweets = allBusinesses.filter(b =>
    b.category === 'coffee' ||
    b.category === 'sweets' ||
    b.category === 'coffee-sweets'
  );
  filteredCoffeeSweets = [...allCoffeeSweets];
  console.log('Found coffee & sweets:', allCoffeeSweets.length);

  // Display immediately without distances
  displayCoffeeSweets(filteredCoffeeSweets);
  updateResultsTitle();

  // Calculate distances in background
  try {
    console.log('Calculating distances...');
    allCoffeeSweets = await calculateDistancesForBusinesses(allCoffeeSweets);
    allCoffeeSweets = sortByDistance(allCoffeeSweets);
    filteredCoffeeSweets = [...allCoffeeSweets];
    console.log('Distances calculated, refreshing display');
    // Refresh display with distances
    displayCoffeeSweets(filteredCoffeeSweets);
  } catch (error) {
    console.error('Error calculating distances:', error);
  }

  // Setup event listeners
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeCoffeeSweetsPage();

  // Listen for dynamically loaded businesses
  window.addEventListener('allBusinessesUpdated', () => {
    console.log('🔄 Coffee & Sweets page updating with new business data...');
    initializeCoffeeSweetsPage();
  });
});

function setupEventListeners() {
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  // Category filter chips
  const chips = document.querySelectorAll('.cuisine-filter-chip');
  console.log('Found filter chips:', chips.length);
  chips.forEach((chip, index) => {
    console.log(`Adding listener to chip ${index}:`, chip.getAttribute('data-category'));
    chip.addEventListener('click', handleCategoryFilter);
  });
}

function handleCategoryFilter(e) {
  const selectedCategory = e.target.getAttribute('data-category');
  console.log('Category filter clicked:', selectedCategory);

  // Handle "All" button
  if (selectedCategory === 'all') {
    selectedCategories = [];
    document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    e.target.classList.add('active');
  } else {
    // Remove "All" active state
    document.querySelector('.cuisine-filter-chip[data-category="all"]')?.classList.remove('active');

    // Toggle this category
    if (selectedCategories.includes(selectedCategory)) {
      selectedCategories = selectedCategories.filter(c => c !== selectedCategory);
      e.target.classList.remove('active');
    } else {
      selectedCategories.push(selectedCategory);
      e.target.classList.add('active');
    }

    // If no categories selected, activate "All"
    if (selectedCategories.length === 0) {
      document.querySelector('.cuisine-filter-chip[data-category="all"]')?.classList.add('active');
    }
  }

  // Filter businesses
  if (selectedCategories.length === 0) {
    filteredCoffeeSweets = [...allCoffeeSweets];
  } else {
    filteredCoffeeSweets = allCoffeeSweets.filter(b => {
      const category = (b.category || '').toLowerCase();
      const cuisine = (b.cuisine || '').toLowerCase();
      const tags = (b.tags || []).map(t => t.toLowerCase());

      return selectedCategories.some(searchTerm => {
        const term = searchTerm.toLowerCase();
        // Filter by category first (coffee or sweets), then by cuisine/tags
        return category.includes(term) || cuisine.includes(term) || tags.some(tag => tag.includes(term));
      });
    });
  }

  // Apply current sort
  sortCoffeeSweets(currentSort);
  displayCoffeeSweets(filteredCoffeeSweets);
  updateResultsTitle();
}

function handleSort(e) {
  currentSort = e.target.value;
  sortCoffeeSweets(currentSort);
  displayCoffeeSweets(filteredCoffeeSweets);
}

function sortCoffeeSweets(sortBy) {
  filteredCoffeeSweets.sort((a, b) => {
    switch(sortBy) {
      case 'distance':
        if (a.distance === null || a.distance === undefined) return 1;
        if (b.distance === null || b.distance === undefined) return -1;
        return a.distance - b.distance;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
}

function displayCoffeeSweets(businesses) {
  const grid = document.getElementById('coffee-sweets-grid');

  if (businesses.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No coffee shops or sweet shops found</h3>
        <p>Check back soon for updates!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = businesses.map(business => `
    <div class="business-card" data-business-id="${business.id}" onclick="window.location.href='profile.html?id=${business.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${business.name}</h3>
        <span class="business-category">${business.category === 'coffee' ? '☕ Coffee' : '🍰 Sweets'}</span>
        <div class="business-cuisine">${business.cuisine || ''}</div>
      </div>

      <div class="business-card-image-centered">
        <img src="${(business.images && business.images[0]) || business.image || business.profile_pic || business.main_image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23fef3c7%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23a16207%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E☕ Coffee %26 Sweets%3C/text%3E%3C/svg%3E'}" alt="${business.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23fef3c7%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23a16207%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E☕ Coffee %26 Sweets%3C/text%3E%3C/svg%3E'">
      </div>

      <div class="business-card-details">
        <div class="business-info">
          ${(business.address || business.vicinity) ? `<div class="business-info-item">📍 ${business.address || business.vicinity}</div>` : ''}
          ${business.distanceText ? `<div class="business-info-item">🚗 ${business.distanceText} away</div>` : ''}
          ${business.phone ? `<div class="business-info-item">📞 ${business.phone}</div>` : ''}
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

        <p class="business-description">${stripUrls(business.about || business.description || business.short_description || "")}</p>

        ${business.tags && business.tags.length > 0 ? `
          <div class="business-tags">
            ${business.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${business.id}'">View Profile</button>
          ${business.phone ? `<a href="tel:${business.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call Now</a>` : ''}
          ${(business.address || business.vicinity) ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${(business.address || business.vicinity).replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function updateResultsTitle() {
  const count = filteredCoffeeSweets.length;
  let title = 'Coffee & Sweets';
  if (selectedCategories.length > 0) {
    title = selectedCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ');
  }
  document.getElementById('results-title').textContent = `${title} (${count})`;
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
