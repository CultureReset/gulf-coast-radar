// Restaurants Page JavaScript

let allRestaurants = [];
let filteredRestaurants = [];
let currentSort = 'distance';
let selectedCuisines = [];

// Helper function to remove URLs from text
function stripUrls(text) {
  if (!text) return '';
  // Remove URLs (http, https, www, and common domain patterns)
  return text.replace(/(?:https?:\/\/|www\.)[^\s]+/gi, '')
    .replace(/\b[a-z0-9-]+\.(com|net|org|info|biz|us|co|io)[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function initializeRestaurantsPage() {
  console.log('Restaurants page loading...');

  // Wait for master data to load if it hasn't yet
  if (typeof loadMasterData === 'function' && (!window.allBusinesses || window.allBusinesses.length === 0)) {
    try {
      await loadMasterData();
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  }

  // Check if data is loaded (check window.allBusinesses for merged data)
  const businesses = window.allBusinesses || [];
  if (!businesses || businesses.length === 0) {
    console.error('❌ No business data available!');
    document.getElementById('restaurants-grid').innerHTML = `
      <div class="no-results">
        <h3>Error Loading Data</h3>
        <p>Please refresh the page or contact support.</p>
      </div>
    `;
    return;
  }

  console.log(`✅ Total businesses available: ${businesses.length}`);

  // Get only restaurants
  allRestaurants = businesses.filter(b => b.category === 'restaurants');
  filteredRestaurants = [...allRestaurants];
  console.log('✅ Found restaurants:', allRestaurants.length);

  // Generate subcategory chips dynamically
  generateSubcategoryChips();

  // Display immediately without distances
  displayRestaurants(filteredRestaurants);
  updateResultsTitle();

  // Calculate distances in background
  try {
    console.log('Calculating distances...');
    allRestaurants = await calculateDistancesForBusinesses(allRestaurants);
    allRestaurants = sortByDistance(allRestaurants);
    filteredRestaurants = [...allRestaurants];
    console.log('Distances calculated, refreshing display');
    // Refresh display with distances
    displayRestaurants(filteredRestaurants);
  } catch (error) {
    console.error('Error calculating distances:', error);
  }

  // Setup event listeners
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeRestaurantsPage();

  // Listen for dynamically loaded businesses
  window.addEventListener('allBusinessesUpdated', (event) => {
    console.log('🔄 Restaurants page updating with new business data...');
    initializeRestaurantsPage();
  });
});

function generateSubcategoryChips() {
  const subcategorySet = new Set();

  // Known valid restaurant categories/cuisines
  const validCategories = new Set([
    'seafood', 'american', 'mexican', 'italian', 'asian', 'pizza', 'bar', 'grill',
    'chinese', 'japanese', 'thai', 'sushi', 'bbq', 'steakhouse', 'breakfast',
    'brunch', 'lunch', 'dinner', 'cafe', 'diner', 'burgers', 'sandwiches',
    'cajun', 'creole', 'southern', 'mediterranean', 'greek', 'french', 'indian',
    'vietnamese', 'korean', 'fusion', 'vegan', 'vegetarian', 'wings', 'tacos',
    'fine dining', 'casual dining', 'fast food', 'family friendly', 'sports bar',
    'pub', 'gastropub', 'tapas', 'soul food', 'comfort food', 'bistro'
  ]);

  // Smart filter function
  function isValidSubcategory(sub) {
    if (!sub || typeof sub !== 'string') return false;

    const cleaned = sub.toLowerCase().trim();

    // Filter out URLs
    if (cleaned.includes('http') || cleaned.includes('www.') || cleaned.includes('.com') || cleaned.includes('.net')) {
      return false;
    }

    // Filter out very long strings (likely descriptions, not categories)
    if (cleaned.length > 30) return false;

    // Filter out strings with suspicious characters
    if (/[<>{}[\]\\\/]/.test(cleaned)) return false;

    // Filter out sentences (contain multiple spaces or punctuation)
    if ((cleaned.match(/\s/g) || []).length > 2) return false;

    // Check if it matches known valid categories or contains restaurant-related keywords
    const keywords = ['food', 'grill', 'bar', 'cuisine', 'kitchen', 'dining', 'restaurant'];
    const matchesValid = validCategories.has(cleaned) ||
                        keywords.some(keyword => cleaned.includes(keyword));

    return matchesValid;
  }

  // Collect all unique subcategories from restaurants
  allRestaurants.forEach(restaurant => {
    if (restaurant.subcategory) {
      // Handle both string and array formats
      const subcategories = Array.isArray(restaurant.subcategory)
        ? restaurant.subcategory
        : restaurant.subcategory.split(',').map(s => s.trim());

      subcategories.forEach(sub => {
        if (isValidSubcategory(sub)) {
          // Normalize the category name
          const normalized = sub.trim();
          subcategorySet.add(normalized);
        }
      });
    }
    // Also check cuisine field for backward compatibility
    if (restaurant.cuisine) {
      const cuisineTypes = restaurant.cuisine.split('•').map(c => c.trim()).filter(c => c);
      cuisineTypes.forEach(c => {
        if (isValidSubcategory(c)) {
          subcategorySet.add(c.trim());
        }
      });
    }
  });

  // Sort subcategories alphabetically
  const subcategories = Array.from(subcategorySet).sort();

  console.log('✅ Valid subcategories found:', subcategories);

  // Generate chips HTML
  const chipContainer = document.querySelector('.cuisine-filter-scroll');
  if (chipContainer) {
    chipContainer.innerHTML = `
      <button class="cuisine-filter-chip active" data-cuisine="all">All</button>
      ${subcategories.map(sub => `
        <button class="cuisine-filter-chip" data-cuisine="${sub.toLowerCase()}">${sub}</button>
      `).join('')}
    `;
  }
}

function setupEventListeners() {
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  // Cuisine filter chips
  const chips = document.querySelectorAll('.cuisine-filter-chip');
  console.log('Found cuisine filter chips:', chips.length);
  chips.forEach((chip, index) => {
    console.log(`Adding listener to chip ${index}:`, chip.getAttribute('data-cuisine'));
    chip.addEventListener('click', handleCuisineFilter);
  });
}

function handleCuisineFilter(e) {
  const selectedCuisine = e.target.getAttribute('data-cuisine');
  console.log('Subcategory filter clicked:', selectedCuisine);

  // Handle "All" button
  if (selectedCuisine === 'all') {
    selectedCuisines = [];
    document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    e.target.classList.add('active');
  } else {
    // Remove "All" active state
    document.querySelector('.cuisine-filter-chip[data-cuisine="all"]')?.classList.remove('active');

    // Toggle this subcategory (multi-select)
    if (selectedCuisines.includes(selectedCuisine)) {
      selectedCuisines = selectedCuisines.filter(c => c !== selectedCuisine);
      e.target.classList.remove('active');
    } else {
      selectedCuisines.push(selectedCuisine);
      e.target.classList.add('active');
    }

    // If no subcategories selected, activate "All"
    if (selectedCuisines.length === 0) {
      document.querySelector('.cuisine-filter-chip[data-cuisine="all"]')?.classList.add('active');
    }
  }

  // Filter restaurants by multiple selected subcategories
  if (selectedCuisines.length === 0) {
    filteredRestaurants = [...allRestaurants];
  } else {
    filteredRestaurants = allRestaurants.filter(r => {
      const cuisine = (r.cuisine || '').toLowerCase();
      const tags = (r.tags || []).map(t => t.toLowerCase());

      // Get subcategories as array
      let subcategories = [];
      if (r.subcategory) {
        subcategories = Array.isArray(r.subcategory)
          ? r.subcategory.map(s => s.toLowerCase())
          : r.subcategory.split(',').map(s => s.trim().toLowerCase());
      }

      // Match against selected subcategories
      return selectedCuisines.some(searchTerm => {
        const term = searchTerm.toLowerCase();
        return (
          cuisine.includes(term) ||
          subcategories.some(sub => sub.includes(term)) ||
          tags.some(tag => tag.includes(term))
        );
      });
    });
  }

  // Apply current sort
  sortRestaurants(currentSort);
  displayRestaurants(filteredRestaurants);
  updateResultsTitle();
}

// Removed search and filter functions - not needed without UI elements

function handleSort(e) {
  currentSort = e.target.value;
  sortRestaurants(currentSort);
  displayRestaurants(filteredRestaurants);
}

function sortRestaurants(sortBy) {
  filteredRestaurants.sort((a, b) => {
    switch(sortBy) {
      case 'distance':
        if (a.distance === null || a.distance === undefined) return 1;
        if (b.distance === null || b.distance === undefined) return -1;
        return a.distance - b.distance;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price':
        const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
        return (priceOrder[a.priceLevel] || 0) - (priceOrder[b.priceLevel] || 0);
      default:
        return 0;
    }
  });
}

function displayRestaurants(restaurants) {
  const grid = document.getElementById('restaurants-grid');

  if (restaurants.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No restaurants found</h3>
        <p>Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  // Debug: Check if restaurants have hours field
  console.log('Sample restaurant hours data:', restaurants.slice(0, 3).map(r => ({
    name: r.name,
    hours: r.hours,
    hasHours: !!r.hours
  })));

  grid.innerHTML = restaurants.map(restaurant => {
    const businessId = restaurant.id || restaurant.business_id;
    return `
    <div class="business-card" data-business-id="${businessId}" onclick="window.location.href='profile.html?id=${businessId}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${restaurant.name}</h3>
        <span class="business-category">${restaurant.category}</span>
        <div class="business-cuisine">${restaurant.cuisine || ''}</div>
      </div>

      <div class="business-card-image-centered">
        ${restaurant.hours ? (() => {
          const status = getBusinessStatus(restaurant);
          return status.isOpen ? `
            <div class="status-badge-open-now">
              <span class="pulse-dot"></span>
              <span>Open Now</span>
            </div>
          ` : '';
        })() : ''}
        <img src="${restaurant.profile_pic || restaurant.main_image || (restaurant.images && restaurant.images[0]) || restaurant.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E🍽️ Restaurant%3C/text%3E%3C/svg%3E'}" alt="${restaurant.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E🍽️ Restaurant%3C/text%3E%3C/svg%3E'">
      </div>

      <div class="business-card-details">
        <div class="business-info">
          ${(restaurant.address || restaurant.vicinity) ? `<div class="business-info-item">📍 ${restaurant.address || restaurant.vicinity}</div>` : ''}
          ${restaurant.distanceText ? `<div class="business-info-item">🚗 ${restaurant.distanceText} away</div>` : ''}
          ${restaurant.phone ? `<div class="business-info-item">📞 ${restaurant.phone}</div>` : ''}
          ${restaurant.hours ? `<div class="business-info-item">🕐 ${typeof restaurant.hours === 'object' ? JSON.stringify(restaurant.hours) : restaurant.hours}</div>` : ''}
          ${restaurant.hours ? (() => {
            const status = getBusinessStatus(restaurant);
            return status.badge ? `
              <div class="business-status-badge ${status.class}">
                ${status.badge}
              </div>
              ${status.text ? `<div class="business-status-text">${status.text}</div>` : ''}
            ` : '';
          })() : ''}
          ${restaurant.reservation ? `
            <div class="reservation-badge">
              📅 Reservations Available
            </div>
          ` : ''}
        </div>

        <p class="business-description">${stripUrls(restaurant.about || restaurant.description || restaurant.short_description || '')}</p>

        ${restaurant.tags && restaurant.tags.length > 0 ? `
          <div class="business-tags">
            ${(Array.isArray(restaurant.tags) ? restaurant.tags : restaurant.tags.split(',')).slice(0, 3).map(tag => `<span class="tag-chip">${tag.trim()}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${businessId}'">View Profile</button>
          ${restaurant.phone ? `<a href="tel:${restaurant.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call Now</a>` : ''}
          ${(restaurant.address || restaurant.vicinity) ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${(restaurant.address || restaurant.vicinity).replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function updateResultsTitle() {
  const count = filteredRestaurants.length;
  document.getElementById('results-title').textContent = `Restaurants Directory (${count})`;
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
