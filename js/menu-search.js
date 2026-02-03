// Menu Search Results Page JavaScript

class MenuSearchPage {
  constructor() {
    this.allResults = [];
    this.query = '';
    this.type = 'menu'; // 'menu' or 'drinks'
    this.userLocation = null;
    this.businessDistances = new Map();

    this.init();
  }

  init() {
    // Get query and type from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.query = urlParams.get('q') || '';
    this.type = urlParams.get('type') || 'menu';

    if (!this.query) {
      window.location.href = 'index.html';
      return;
    }

    // Update search input with query
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.value = this.query;
    }

    // Update page title
    const titleElement = document.getElementById('search-title');
    if (titleElement) {
      const typeLabel = this.type === 'drinks' ? 'Drinks' : 'Menu Items';
      titleElement.textContent = `${typeLabel} Search Results`;
    }

    // Request user location
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
        const distance = this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          business.coordinates.lat,
          business.coordinates.lng
        );
        this.businessDistances.set(business.id, distance);
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
    this.allResults = [];

    allBusinesses.forEach(business => {
      const items = this.type === 'drinks' ? business.drinks : business.menu;
      if (!items || items.length === 0) return;

      const businessDistance = this.businessDistances.get(business.id);

      items.forEach(item => {
        let matchScore = 0;

        // Name match
        if (item.name.toLowerCase().includes(lowerQuery)) {
          matchScore += 10;
        }

        // Description match
        if (item.description?.toLowerCase().includes(lowerQuery)) {
          matchScore += 5;
        }

        // Category match
        if (item.category?.toLowerCase().includes(lowerQuery)) {
          matchScore += 3;
        }

        if (matchScore > 0) {
          this.allResults.push({
            ...item,
            businessId: business.id,
            businessName: business.name,
            businessLocation: business.location,
            businessCoordinates: business.coordinates,
            businessImage: (business.images && business.images[0]) || business.image,
            businessCuisine: business.cuisine,
            distance: businessDistance,
            matchScore
          });
        }
      });
    });

    // Sort by distance first (nearest first), then by match score
    this.allResults.sort((a, b) => {
      // If both have distance, sort by distance
      if (a.distance !== undefined && b.distance !== undefined) {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        // If same distance, sort by match score
        return b.matchScore - a.matchScore;
      }
      // If only one has distance, prioritize it
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      // If neither has distance, sort by match score
      return b.matchScore - a.matchScore;
    });

    // Display results
    this.displayResults();
  }

  displayResults() {
    const grid = document.getElementById('menu-results-grid');
    const emptyState = document.getElementById('empty-state');
    const countElement = document.getElementById('results-count');

    // Update count
    const count = this.allResults.length;
    const typeLabel = this.type === 'drinks' ? 'drinks' : 'menu items';

    if (countElement) {
      countElement.textContent = `Found ${count} ${typeLabel} matching "${this.query}"`;
    }

    // Show/hide empty state
    if (count === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Render results
    grid.innerHTML = this.allResults.map(item => this.createItemCard(item)).join('');
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
      const maxLength = 120;
      descriptionPreview = item.description.length > maxLength
        ? item.description.substring(0, maxLength) + '...'
        : item.description;
    }

    const itemIndex = this.allResults.indexOf(item);

    return `
      <div class="menu-item-result" onclick="menuSearchPage.showItemModal(${itemIndex})">
        <div class="result-header">
          <span class="result-restaurant">${this.highlightMatch(item.businessName)}</span>
          ${distanceText}
        </div>
        <div class="result-item-name">${this.highlightMatch(item.name)}</div>
        <div class="result-meta">
          <span class="result-price">${item.price}</span>
          ${item.category ? `<span>${item.category}</span>` : ''}
        </div>
        ${descriptionPreview ? `
          <div class="result-description">${this.highlightMatch(descriptionPreview)}</div>
        ` : ''}
      </div>
    `;
  }

  showItemModal(index) {
    const item = this.allResults[index];
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

    const regex = new RegExp(`(${this.escapeRegex(this.query)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Close modal function
function closeItemModal() {
  const modal = document.getElementById('item-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Global instance
let menuSearchPage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  menuSearchPage = new MenuSearchPage();

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
