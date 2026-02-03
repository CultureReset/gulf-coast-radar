// Rentals Page - Gulf Coast Radar

let rentalsList = [];
let selectedSubcategory = 'all';
let sortBy = 'distance';

// Get rentals from allBusinesses
function getRentals() {
  if (typeof allBusinesses === 'undefined') {
    console.error('❌ allBusinesses not defined yet');
    return [];
  }
  return allBusinesses.filter(business => business.category === 'rentals');
}

// Filter rentals by subcategory
function filterByCategory(subcategory, targetElement) {
  selectedSubcategory = subcategory;

  // Update active filter chip
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  if (targetElement) {
    targetElement.classList.add('active');
  }

  // Filter rentals
  const allRentals = getRentals();
  if (subcategory === 'all') {
    rentalsList = allRentals;
  } else {
    rentalsList = allRentals.filter(rental => rental.subcategory === subcategory);
  }

  sortRentals();
  renderRentals();
  updateResultsTitle();
}

function updateResultsTitle() {
  const title = selectedSubcategory === 'all' ? 'All Rentals' : selectedSubcategory;
  document.getElementById('results-title').textContent = `${title} (${rentalsList.length})`;
}

function sortRentals() {
  if (sortBy === 'name') {
    rentalsList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'rating') {
    rentalsList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'distance' && rentalsList[0]?.distanceValue !== undefined) {
    rentalsList.sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));
  }
}

function renderRentals() {
  const grid = document.getElementById('rentals-grid');

  if (rentalsList.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No rentals found in this category</p></div>';
    return;
  }

  grid.innerHTML = rentalsList.map(rental => `
    <div class="business-card" data-business-id="${rental.id}" onclick="window.location.href='profile.html?id=${rental.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${rental.name}</h3>
        ${rental.subcategory ? `<span class="business-category">${rental.subcategory}</span>` : ''}
      </div>

      ${((rental.images && rental.images[0]) || rental.image) ? `
        <div class="business-card-image-centered">
          <img src="${(rental.images && rental.images[0]) || rental.image}" alt="${rental.name}" onerror="this.src='https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'">
        </div>
      ` : ''}

      <div class="business-card-details">
        <div class="business-info">
          <div class="business-info-item">📍 ${rental.location}</div>
          ${rental.distanceText ? `<div class="business-info-item">🚗 ${rental.distanceText} away</div>` : ''}
          ${rental.priceLevel ? `<div class="business-info-item">💵 ${rental.priceLevel}</div>` : ''}
        </div>

        <p class="business-description">${rental.description}</p>

        ${rental.tags && rental.tags.length > 0 ? `
          <div class="business-tags">
            ${rental.tags.slice(0, 4).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${rental.id}'">View Details</button>
          ${rental.phone ? `<a href="tel:${rental.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call</a>` : ''}
          ${rental.address ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${rental.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
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
  console.log('🚴 Rentals page initializing...');
  console.log('📊 Total businesses available:', typeof allBusinesses !== 'undefined' ? allBusinesses.length : 0);

  rentalsList = getRentals();
  console.log('✅ Rentals found:', rentalsList.length);

  // Calculate distances if geolocation available
  if (typeof distanceService !== 'undefined' && distanceService.userLocation) {
    rentalsList.forEach(rental => {
      if (rental.coordinates) {
        const distance = distanceService.calculateDistance(
          distanceService.userLocation.lat,
          distanceService.userLocation.lng,
          rental.coordinates.lat,
          rental.coordinates.lng
        );
        rental.distanceValue = distance;
        rental.distanceText = distance < 1 ?
          `${(distance * 5280).toFixed(0)} ft` :
          `${distance.toFixed(1)} mi`;
      }
    });
  }

  sortRentals();
  renderRentals();
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
      sortRentals();
      renderRentals();
    });
  }
});
