// Locations Page - Beach Access, Boat Launches, Parking
// Gulf Coast Radar

let allLocations = [];
let filteredLocations = [];
let currentSort = 'distance';
let selectedType = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Locations page loading...');

  // Get only location categories
  allLocations = allBusinesses.filter(b =>
    b.category === 'beach-access' ||
    b.category === 'boat-launch' ||
    b.category === 'parking'
  );
  filteredLocations = [...allLocations];
  console.log('Found locations:', allLocations.length);

  // Display immediately without distances
  displayLocations(filteredLocations);
  updateResultsTitle();

  // Calculate distances in background
  try {
    console.log('Calculating distances...');
    allLocations = await calculateDistancesForBusinesses(allLocations);
    allLocations = sortByDistance(allLocations);
    filteredLocations = [...allLocations];
    console.log('Distances calculated, refreshing display');
    // Refresh display with distances
    displayLocations(filteredLocations);
  } catch (error) {
    console.error('Error calculating distances:', error);
  }

  // Setup event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  // Location type filter chips
  const chips = document.querySelectorAll('.cuisine-filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', handleTypeFilter);
  });
}

function handleTypeFilter(e) {
  selectedType = e.target.getAttribute('data-location-type');
  console.log('Location type filter clicked:', selectedType);

  // Update active chip
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  e.target.classList.add('active');

  // Filter locations
  if (selectedType === 'all') {
    filteredLocations = [...allLocations];
  } else {
    filteredLocations = allLocations.filter(l => l.category === selectedType);
  }

  // Apply current sort
  sortLocations(currentSort);
  displayLocations(filteredLocations);
  updateResultsTitle();
}

function handleSort(e) {
  currentSort = e.target.value;
  sortLocations(currentSort);
  displayLocations(filteredLocations);
}

function sortLocations(sortBy) {
  switch(sortBy) {
    case 'name':
      filteredLocations.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'location':
      filteredLocations.sort((a, b) => a.location.localeCompare(b.location));
      break;
    case 'distance':
    default:
      filteredLocations = sortByDistance(filteredLocations);
  }
}

function sortByDistance(locations) {
  return locations.sort((a, b) => {
    const distA = a.distance || 999999;
    const distB = b.distance || 999999;
    return distA - distB;
  });
}

function displayLocations(locations) {
  const grid = document.getElementById('locations-grid');

  if (locations.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No locations found</h3>
        <p>Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = locations.map(location => `
    <div class="business-card" data-business-id="${location.id}" onclick="window.location.href='profile.html?id=${location.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${location.name}</h3>
        <span class="business-category">${getCategoryDisplay(location.category)}</span>
      </div>

      ${location.image ? `
        <div class="business-card-image-centered">
          <img src="${location.image}" alt="${location.name}" onerror="this.style.display='none'">
        </div>
      ` : ''}

      <div class="business-card-details">
        <div class="business-info">
          <div class="business-info-item">📍 ${location.location}</div>
          ${location.distanceText ? `<div class="business-info-item">🚗 ${location.distanceText} away</div>` : ''}
          ${location.hours ? `<div class="business-info-item">🕒 ${location.hours}</div>` : ''}
        </div>

        <p class="business-description">${location.description}</p>

        ${renderAmenities(location)}

        ${location.tags && location.tags.length > 0 ? `
          <div class="business-tags">
            ${location.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${location.id}'">View Details</button>
          ${location.phone ? `<a href="tel:${location.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call</a>` : ''}
          <button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${location.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>
        </div>
      </div>
    </div>
  `).join('');
}

function getCategoryDisplay(category) {
  switch(category) {
    case 'beach-access':
      return '🏖️ Beach Access';
    case 'boat-launch':
      return '⛵ Boat Launch';
    case 'parking':
      return '🅿️ Parking';
    default:
      return category;
  }
}

function renderAmenities(location) {
  if (!location.amenities) return '';

  const amenities = [];

  // Beach Access amenities
  if (location.category === 'beach-access') {
    if (location.amenities.parking) amenities.push(`🅿️ Parking: ${location.amenities.parking}`);
    if (location.amenities.restrooms) amenities.push('🚻 Restrooms');
    if (location.amenities.showers) amenities.push('🚿 Showers');
    if (location.amenities.handicapAccessible) amenities.push('♿ Accessible');
    if (location.amenities.lifeguard) amenities.push('🏊 Lifeguard');
  }

  // Boat Launch amenities
  if (location.category === 'boat-launch') {
    if (location.amenities.lanesCount) amenities.push(`🚤 ${location.amenities.lanesCount} Lane${location.amenities.lanesCount > 1 ? 's' : ''}`);
    if (location.amenities.launchFee) amenities.push(`💵 ${location.amenities.launchFee}`);
    if (location.amenities.fishingPier) amenities.push('🎣 Fishing Pier');
    if (location.amenities.boatRentals) amenities.push('⛵ Rentals');
  }

  // Parking amenities
  if (location.category === 'parking') {
    if (location.amenities.spaces) amenities.push(`🅿️ ${location.amenities.spaces} spaces`);
    if (location.amenities.cost) amenities.push(`💰 ${location.amenities.cost}`);
    if (location.amenities.evCharging) amenities.push('🔌 EV Charging');
    if (location.amenities.covered) amenities.push('🏠 Covered');
  }

  if (amenities.length === 0) return '';

  return `
    <div class="business-info" style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
      ${amenities.map(a => `<div class="business-info-item">${a}</div>`).join('')}
    </div>
  `;
}

function updateResultsTitle() {
  const count = filteredLocations.length;
  const typeLabel = selectedType === 'all' ? 'All Locations' :
                    selectedType === 'beach-access' ? 'Beach Access Points' :
                    selectedType === 'boat-launch' ? 'Boat Launches' :
                    'Parking Locations';

  document.getElementById('results-title').textContent = `${typeLabel} (${count})`;
}
