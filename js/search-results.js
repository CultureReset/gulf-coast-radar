// Search Results Page JavaScript

class SearchResultsPage {
  constructor() {
    this.itemsOnlyResults = [];
    this.advancedResults = [];
    this.businessesOnlyResults = [];
    this.currentMode = 'items'; // 'items', 'advanced', or 'businesses'
    this.query = '';
    this.userLocation = null;
    this.businessDistances = new Map();

    this.init();
  }

  init() {
    // Get query from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.query = urlParams.get('q') || '';

    if (!this.query) {
      window.location.href = 'index.html';
      return;
    }

    // Update search input with query
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.value = this.query;
    }

    // Listen for data updates and perform search when data is ready
    window.addEventListener('allBusinessesUpdated', () => {
      console.log('Received allBusinessesUpdated event, performing search...');
      this.performSearch();
    });

    // Request user location (which will trigger performSearch when done)
    this.requestLocation();
  }

  requestLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.calculateDistances();
          this.performSearch();
        },
        (error) => {
          console.log('Location not available, proceeding without distance sorting');
          this.performSearch();
        }
      );
    } else {
      this.performSearch();
    }
  }

  calculateDistances() {
    if (!this.userLocation) return;

    allBusinesses.forEach(business => {
      if (business.coordinates) {
        const businessId = business.id || business.business_id;
        const distance = this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          business.coordinates.lat,
          business.coordinates.lng
        );
        this.businessDistances.set(businessId, distance);
      }
    });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  performSearch() {
    const lowerQuery = this.query.toLowerCase();
    this.itemsOnlyResults = [];
    this.advancedResults = [];
    this.businessesOnlyResults = [];

    // Check if data is loaded
    if (typeof allBusinesses === 'undefined' || !allBusinesses || allBusinesses.length === 0) {
      console.error('allBusinesses not loaded yet, retrying...');
      // Show loading message and retry in a moment
      setTimeout(() => this.performSearch(), 500);
      return;
    }

    console.log(`Searching for "${this.query}" in ${allBusinesses.length} businesses...`);

    // Search through all businesses and their menu items
    allBusinesses.forEach(business => {
      const businessId = business.id || business.business_id;
      const businessDistance = this.businessDistances.get(businessId);

      // Check if business itself matches the search
      let businessMatches = false;

      if (business.name?.toLowerCase().includes(lowerQuery) ||
          business.description?.toLowerCase().includes(lowerQuery) ||
          business.category?.toLowerCase().includes(lowerQuery) ||
          business.display_category?.toLowerCase().includes(lowerQuery) ||
          business.cuisine?.toLowerCase().includes(lowerQuery) ||
          business.location?.toLowerCase().includes(lowerQuery) ||
          business.district?.toLowerCase().includes(lowerQuery) ||
          (Array.isArray(business.tags) && business.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))) {
        businessMatches = true;

        // Add business as a result
        const businessResult = {
          name: business.name,
          description: business.description,
          businessId: businessId,
          businessName: business.name,
          businessLocation: business.location,
          district: business.district,
          category: business.display_category || business.category,
          cuisine: business.cuisine,
          distance: businessDistance,
          type: 'business',
          profile_pic: business.profile_pic || business.image
        };

        this.itemsOnlyResults.push(businessResult);
        this.advancedResults.push(businessResult);
        this.businessesOnlyResults.push(businessResult);
      }

      // Include ALL menu items in search (don't filter promotions - users should find everything)
      const menuItems = business.menu || [];
      const drinkItems = business.drinks || [];
      const allItems = [...menuItems, ...drinkItems];

      allItems.forEach(item => {
        let nameMatch = false;
        let descMatch = false;

        // Check name match
        if (item.name.toLowerCase().includes(lowerQuery)) {
          nameMatch = true;
        }

        // Check description match
        if (item.description?.toLowerCase().includes(lowerQuery)) {
          descMatch = true;
        }

        const itemData = {
          ...item,
          businessId: businessId,
          businessName: business.name,
          businessLocation: business.location,
          distance: businessDistance,
          type: 'menu-item'
        };

        // Items mode: Only name matches
        if (nameMatch) {
          this.itemsOnlyResults.push(itemData);
        }

        // Advanced mode: Name OR description matches
        if (nameMatch || descMatch) {
          this.advancedResults.push(itemData);
        }
      });
    });

    console.log(`Found ${this.itemsOnlyResults.length} items (name match) and ${this.advancedResults.length} items (advanced)`);

    // Sort both by distance
    this.sortByDistance(this.itemsOnlyResults);
    this.sortByDistance(this.advancedResults);

    // Display results based on mode
    this.displayResults();
  }

  sortByDistance(results) {
    results.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return 0;
    });
  }

  setMode(mode) {
    this.currentMode = mode;

    // Update button states
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      }
    });

    this.displayResults();
  }

  displayResults() {
    const grid = document.getElementById('search-results-grid');
    const noResults = document.getElementById('no-results');
    const countElement = document.querySelector('.search-results-count');

    let resultsToShow = [];
    let countText = '';

    if (this.currentMode === 'items') {
      // Show items that match by name only
      resultsToShow = this.itemsOnlyResults;
      const count = resultsToShow.length;
      countText = `Found ${count} item${count !== 1 ? 's' : ''} matching "${this.query}" in name`;
    } else if (this.currentMode === 'businesses') {
      // Show only businesses that match
      resultsToShow = this.businessesOnlyResults;
      const count = resultsToShow.length;
      countText = `Found ${count} business${count !== 1 ? 'es' : ''} matching "${this.query}"`;
    } else {
      // Show items that match by name OR description
      resultsToShow = this.advancedResults;
      const count = resultsToShow.length;
      countText = `Found ${count} item${count !== 1 ? 's' : ''} matching "${this.query}" (advanced search)`;
    }

    // Update count
    if (countElement) {
      countElement.textContent = countText;
    }

    // Show/hide no results
    if (resultsToShow.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    grid.style.display = 'flex';
    noResults.style.display = 'none';

    // Render results - use appropriate card type based on item type
    grid.innerHTML = resultsToShow.map(item => {
      if (item.type === 'business') {
        return this.createBusinessCard(item);
      } else {
        return this.createItemCard(item);
      }
    }).join('');
  }

  createBusinessCard(business) {
    // Format distance
    let distanceText = '';
    if (business.distance !== undefined) {
      const formattedDistance = business.distance < 0.1 ? '< 0.1' : business.distance.toFixed(1);
      distanceText = `<span class="result-distance">${formattedDistance} mi away</span>`;
    }

    // Truncate description for preview
    let descriptionPreview = '';
    if (business.description) {
      const maxLength = 150;
      descriptionPreview = business.description.length > maxLength
        ? business.description.substring(0, maxLength) + '...'
        : business.description;
    }

    const categoryDisplay = business.cuisine || business.category || 'Business';
    const businessIdToUse = business.businessId || business.id || business.business_id;

    return `
      <div class="business-result" onclick="window.location.href='profile.html?id=${businessIdToUse}'">
        <div class="result-header">
          <span class="result-category">${categoryDisplay}</span>
          ${distanceText}
        </div>
        <div class="result-name">${this.highlightMatch(business.name)}</div>
        <div class="result-meta">
          ${business.rating ? `<span class="result-cuisine">⭐ ${business.rating}</span>` : ''}
          ${business.priceLevel ? `<span class="result-cuisine">${business.priceLevel}</span>` : ''}
          <span>📍 ${this.highlightMatch(business.businessLocation || business.location)}</span>
        </div>
        ${descriptionPreview ? `
          <div class="result-description">${this.highlightMatch(descriptionPreview)}</div>
        ` : ''}
      </div>
    `;
  }

  createItemCard(item) {
    // Format distance
    let distanceText = '';
    if (item.distance !== undefined) {
      const formattedDistance = item.distance < 0.1 ? '< 0.1' : item.distance.toFixed(1);
      distanceText = `<span class="result-distance">${formattedDistance} mi away</span>`;
    }

    // Truncate description for preview
    let descriptionPreview = '';
    if (item.description) {
      const maxLength = 150;
      descriptionPreview = item.description.length > maxLength
        ? item.description.substring(0, maxLength) + '...'
        : item.description;
    }

    const itemIndex = this.getCurrentResults().indexOf(item);

    return `
      <div class="business-result" onclick="searchResultsPage.showItemModal(${itemIndex})">
        <div class="result-header">
          <span class="result-category">${this.highlightMatch(item.businessName)}</span>
          ${distanceText}
        </div>
        <div class="result-name">${this.highlightMatch(item.name)}</div>
        <div class="result-meta">
          <span class="result-cuisine">${item.price}</span>
          ${item.category ? `<span> • ${item.category}</span>` : ''}
        </div>
        ${descriptionPreview ? `
          <div class="result-description">${this.highlightMatch(descriptionPreview)}</div>
        ` : ''}
      </div>
    `;
  }

  getCurrentResults() {
    if (this.currentMode === 'items') {
      return this.itemsOnlyResults;
    } else if (this.currentMode === 'businesses') {
      return this.businessesOnlyResults;
    } else {
      return this.advancedResults;
    }
  }

  showItemModal(index) {
    const item = this.getCurrentResults()[index];
    if (!item) return;

    const modal = document.getElementById('item-modal');
    const restaurantName = document.getElementById('modal-restaurant-name');
    const restaurantLink = document.getElementById('modal-restaurant-link');
    const modalBody = document.getElementById('modal-body');

    // Set restaurant info
    restaurantName.textContent = item.businessName;
    restaurantLink.href = `profile.html?id=${item.businessId}`;

    // Build modal content
    let modalContent = '';

    // Image (if available)
    if (item.image || item.businessImage) {
      const imageUrl = item.image || item.businessImage;
      modalContent += `<img src="${imageUrl}" alt="${item.name}" class="modal-item-image" onerror="this.style.display='none'">`;
    }

    // Item name
    modalContent += `<h2 class="modal-item-name">${item.name}</h2>`;

    // Price
    modalContent += `<div class="modal-item-price">${item.price}</div>`;

    // Category
    if (item.category) {
      modalContent += `<span class="modal-item-category">${item.category}</span>`;
    }

    // Description
    if (item.description) {
      modalContent += `<div class="modal-item-description">${item.description}</div>`;
    }

    // Calories
    if (item.calories) {
      modalContent += `<div class="modal-item-calories">🔥 ${item.calories} calories</div>`;
    }

    // Additional details
    if (item.details) {
      modalContent += `<div class="modal-item-description">${item.details}</div>`;
    }

    modalBody.innerHTML = modalContent;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  highlightMatch(text) {
    if (!this.query || !text) return text;

    const regex = new RegExp(`(${this.query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }
}

// Close modal function
function closeItemModal() {
  const modal = document.getElementById('item-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Global instance
let searchResultsPage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  searchResultsPage = new SearchResultsPage();

  // Close modal when clicking outside (only after DOM is ready)
  const modal = document.getElementById('item-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeItemModal();
      }
    });
  }
});
