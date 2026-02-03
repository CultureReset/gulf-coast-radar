// Services Page - Gulf Coast Radar

let servicesList = [];
let selectedSubcategory = 'all';
let sortBy = 'distance';

// Get services from allBusinesses
function getServices() {
  if (typeof allBusinesses === 'undefined') {
    console.error('❌ allBusinesses not defined yet');
    return [];
  }
  return allBusinesses.filter(business => business.category === 'services');
}

// Filter services by subcategory
function filterByCategory(subcategory, targetElement) {
  selectedSubcategory = subcategory;

  // Update active filter chip
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  if (targetElement) {
    targetElement.classList.add('active');
  }

  // Filter services
  const allServices = getServices();
  if (subcategory === 'all') {
    servicesList = allServices;
  } else {
    servicesList = allServices.filter(service => service.subcategory === subcategory);
  }

  sortServices();
  renderServices();
  updateResultsTitle();
}

function updateResultsTitle() {
  const title = selectedSubcategory === 'all' ? 'All Services' : selectedSubcategory;
  document.getElementById('results-title').textContent = `${title} (${servicesList.length})`;
}

function sortServices() {
  if (sortBy === 'name') {
    servicesList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'rating') {
    servicesList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'distance' && servicesList[0]?.distanceValue !== undefined) {
    servicesList.sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));
  }
}

function renderServices() {
  const grid = document.getElementById('services-grid');

  if (servicesList.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No services found in this category</p></div>';
    return;
  }

  grid.innerHTML = servicesList.map(service => `
    <div class="business-card" data-business-id="${service.id}" onclick="window.location.href='profile.html?id=${service.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${service.name}</h3>
        ${service.subcategory ? `<span class="business-category">${service.subcategory}</span>` : ''}
      </div>

      ${((service.images && service.images[0]) || service.image) ? `
        <div class="business-card-image-centered">
          <img src="${(service.images && service.images[0]) || service.image}" alt="${service.name}" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'">
        </div>
      ` : ''}

      <div class="business-card-details">
        <div class="business-info">
          <div class="business-info-item">📍 ${service.location}</div>
          ${service.distanceText ? `<div class="business-info-item">🚗 ${service.distanceText} away</div>` : ''}
          ${service.priceLevel ? `<div class="business-info-item">💵 ${service.priceLevel}</div>` : ''}
        </div>

        <p class="business-description">${service.description}</p>

        ${service.tags && service.tags.length > 0 ? `
          <div class="business-tags">
            ${service.tags.slice(0, 4).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${service.id}'">View Details</button>
          ${service.phone ? `<a href="tel:${service.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call</a>` : ''}
          ${service.address ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${service.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Platform-aware maps function
function openMaps(address) {
  const encodedAddress = encodeURIComponent(address);
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
  } else if (/android/i.test(userAgent)) {
    window.location.href = `geo:0,0?q=${encodedAddress}`;
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }
}

function initializeServicesPage() {
  console.log('🏛️ Services page initializing...');
  console.log('📊 Total businesses available:', typeof allBusinesses !== 'undefined' ? allBusinesses.length : 0);

  servicesList = getServices();
  console.log('✅ Services found:', servicesList.length);

  // Calculate distances if geolocation available
  if (typeof distanceService !== 'undefined' && distanceService.userLocation) {
    servicesList.forEach(service => {
      if (service.coordinates) {
        const distance = distanceService.calculateDistance(
          distanceService.userLocation.lat,
          distanceService.userLocation.lng,
          service.coordinates.lat,
          service.coordinates.lng
        );
        service.distanceValue = distance;
        service.distanceText = distance < 1 ?
          `${(distance * 5280).toFixed(0)} ft` :
          `${distance.toFixed(1)} mi`;
      }
    });
  }

  sortServices();
  renderServices();
  updateResultsTitle();

  // Add filter chip click handlers
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const category = chip.getAttribute('data-category');
      filterByCategory(category, chip);
    });
  });

  // Add sort handler
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      sortServices();
      renderServices();
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeServicesPage();

  // Listen for dynamically loaded businesses
  window.addEventListener('allBusinessesUpdated', () => {
    console.log('🔄 Services page updating with new business data...');
    initializeServicesPage();
  });
});
