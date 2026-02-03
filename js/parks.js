// Parks Page - Gulf Coast Radar

let parksList = [];
let selectedSubcategory = 'all';
let sortBy = 'distance';

// Get parks from allBusinesses
function getParks() {
  if (typeof allBusinesses === 'undefined') {
    console.error('❌ allBusinesses not defined yet');
    return [];
  }
  return allBusinesses.filter(business => business.category === 'parks');
}

// Filter parks by subcategory
function filterByCategory(subcategory, targetElement) {
  selectedSubcategory = subcategory;

  // Update active filter chip
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  if (targetElement) {
    targetElement.classList.add('active');
  }

  // Filter parks
  const allParks = getParks();
  if (subcategory === 'all') {
    parksList = allParks;
  } else {
    parksList = allParks.filter(park => park.subcategory === subcategory);
  }

  sortParks();
  renderParks();
  updateResultsTitle();
}

function updateResultsTitle() {
  const title = selectedSubcategory === 'all' ? 'All Parks & Recreation' : selectedSubcategory;
  document.getElementById('results-title').textContent = `${title} (${parksList.length})`;
}

function sortParks() {
  if (sortBy === 'name') {
    parksList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'rating') {
    parksList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'distance' && parksList[0]?.distanceValue !== undefined) {
    parksList.sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));
  }
}

function renderParks() {
  const grid = document.getElementById('parks-grid');

  if (parksList.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No parks found in this category</p></div>';
    return;
  }

  grid.innerHTML = parksList.map(park => `
    <div class="business-card" data-business-id="${park.id}" onclick="window.location.href='profile.html?id=${park.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${park.name}</h3>
        ${park.subcategory ? `<span class="business-category">${park.subcategory}</span>` : ''}
      </div>

      ${((park.images && park.images[0]) || park.image) ? `
        <div class="business-card-image-centered">
          <img src="${(park.images && park.images[0]) || park.image}" alt="${park.name}" onerror="this.src='https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'">
        </div>
      ` : ''}

      <div class="business-card-details">
        <div class="business-info">
          <div class="business-info-item">📍 ${park.location}</div>
          ${park.distanceText ? `<div class="business-info-item">🚗 ${park.distanceText} away</div>` : ''}
          ${park.priceLevel ? `<div class="business-info-item">💵 ${park.priceLevel}</div>` : ''}
        </div>

        <p class="business-description">${park.description}</p>

        ${park.tags && park.tags.length > 0 ? `
          <div class="business-tags">
            ${park.tags.slice(0, 4).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${park.id}'">View Details</button>
          ${park.phone ? `<a href="tel:${park.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call</a>` : ''}
          ${park.address ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${park.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌳 Parks page initializing...');
  console.log('📊 Total businesses available:', typeof allBusinesses !== 'undefined' ? allBusinesses.length : 0);

  parksList = getParks();
  console.log('✅ Parks found:', parksList.length);

  // Calculate distances if geolocation available
  if (typeof distanceService !== 'undefined' && distanceService.userLocation) {
    parksList.forEach(park => {
      if (park.coordinates) {
        const distance = distanceService.calculateDistance(
          distanceService.userLocation.lat,
          distanceService.userLocation.lng,
          park.coordinates.lat,
          park.coordinates.lng
        );
        park.distanceValue = distance;
        park.distanceText = distance < 1 ?
          `${(distance * 5280).toFixed(0)} ft` :
          `${distance.toFixed(1)} mi`;
      }
    });
  }

  sortParks();
  renderParks();
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
      sortParks();
      renderParks();
    });
  }
});
