// Shopping Page - Gulf Coast Radar

let shoppingList = [];
let selectedCategories = [];

// Get shopping locations from allBusinesses
function getShoppingLocations() {
  return allBusinesses.filter(business => {
    const shoppingTags = ['Shopping', 'Boutique', 'Souvenir', 'Outlet', 'Retail', 'Store', 'Gift Shop'];
    return Array.isArray(business.tags) && business.tags.some(tag =>
      shoppingTags.some(stag => tag.includes(stag))
    );
  });
}

// Filter locations by category
function filterByCategory(category) {
  // Handle "All" button
  if (category === 'all') {
    selectedCategories = [];
    document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    event.target.classList.add('active');
  } else {
    // Remove "All" active state
    document.querySelector('.cuisine-filter-chip[data-category="all"]')?.classList.remove('active');

    // Toggle this category
    if (selectedCategories.includes(category)) {
      selectedCategories = selectedCategories.filter(c => c !== category);
      event.target.classList.remove('active');
    } else {
      selectedCategories.push(category);
      event.target.classList.add('active');
    }

    // If no categories selected, activate "All"
    if (selectedCategories.length === 0) {
      document.querySelector('.cuisine-filter-chip[data-category="all"]')?.classList.add('active');
    }
  }

  // Filter shopping locations
  if (selectedCategories.length === 0) {
    shoppingList = getShoppingLocations();
  } else {
    const allShops = getShoppingLocations();
    const categoryMap = {
      'boutiques': ['Boutique'],
      'souvenirs': ['Souvenir'],
      'outlets': ['Outlet'],
      'gifts': ['Gift'],
      'beachwear': ['Beachwear', 'Swimwear']
    };

    shoppingList = allShops.filter(shop => {
      return selectedCategories.some(category => {
        const searchTags = categoryMap[category] || [];
        return Array.isArray(shop.tags) && shop.tags.some(tag =>
          searchTags.some(searchTag => tag.includes(searchTag))
        );
      });
    });
  }

  renderShopping();
  updateResultsTitle();
}

function updateResultsTitle() {
  let title = 'All Shopping';
  if (selectedCategories.length === 1) {
    const titleMap = {
      'boutiques': 'Boutiques',
      'souvenirs': 'Souvenir Shops',
      'outlets': 'Outlets',
      'gifts': 'Gift Shops',
      'beachwear': 'Beachwear'
    };
    title = titleMap[selectedCategories[0]];
  } else if (selectedCategories.length > 1) {
    title = 'Shopping';
  }

  document.getElementById('results-title').textContent =
    `${title} (${shoppingList.length})`;
}

function renderShopping() {
  const grid = document.getElementById('shopping-grid');

  if (shoppingList.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No shopping locations found</p></div>';
    return;
  }

  grid.innerHTML = shoppingList.map(shop => `
    <div class="business-card" data-business-id="${shop.id}" onclick="window.location.href='profile.html?id=${shop.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${shop.name}</h3>
        <span class="business-category">${shop.category}</span>
        ${shop.cuisine ? `<div class="business-cuisine">${shop.cuisine}</div>` : ''}
      </div>

      ${((shop.images && shop.images[0]) || shop.image) ? `
        <div class="business-card-image-centered">
          <img src="${(shop.images && shop.images[0]) || shop.image}" alt="${shop.name}" onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'">
        </div>
      ` : ''}

      <div class="business-card-details">
        <div class="business-info">
          <div class="business-info-item">📍 ${shop.location}</div>
          ${shop.distanceText ? `<div class="business-info-item">🚗 ${shop.distanceText} away</div>` : ''}
        </div>

        <p class="business-description">${shop.description}</p>

        ${Array.isArray(shop.tags) && shop.tags.length > 0 ? `
          <div class="business-tags">
            ${shop.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${shop.id}'">View Profile</button>
          ${shop.phone ? `<a href="tel:${shop.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call Now</a>` : ''}
          ${shop.address ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${shop.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
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

function initializeShoppingPage() {
  shoppingList = getShoppingLocations();
  renderShopping();
  updateResultsTitle();

  // Add filter chip click handlers
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const category = chip.getAttribute('data-category');
      filterByCategory(category);
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeShoppingPage();

  // Listen for dynamically loaded businesses
  window.addEventListener('allBusinessesUpdated', () => {
    console.log('🔄 Shopping page updating with new business data...');
    initializeShoppingPage();
  });
});
