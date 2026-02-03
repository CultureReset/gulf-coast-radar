// Activities Page - Gulf Coast Radar

let activitiesList = [];
let selectedCategories = [];

// Get activities from allBusinesses
function getActivities() {
  return allBusinesses.filter(business => {
    // Include all businesses with display_category === "Activities"
    if (business.display_category === 'Activities' ||
        business.category === 'activities' ||
        business.category === 'attractions') {
      return true;
    }

    const activityTags = ['Water Sports', 'Outdoor', 'Family Friendly', 'Beach', 'Tours', 'Golf', 'Fishing', 'Recreation', 'Attraction', 'Entertainment District'];
    const excludeTags = ['Restaurant', 'Coffee', 'Bar', 'Nightlife', 'Hotel', 'Shopping'];

    const hasActivityTag = business.tags && business.tags.some(tag =>
      activityTags.some(atag => tag.includes(atag))
    );

    const hasExcludeTag = business.tags && business.tags.some(tag =>
      excludeTags.some(etag => tag.includes(etag))
    );

    return hasActivityTag && !hasExcludeTag;
  });
}

// Filter activities by category
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

  // Filter activities
  if (selectedCategories.length === 0) {
    activitiesList = getActivities();
  } else {
    const allActivities = getActivities();
    const categoryMap = {
      'water-sports': ['Water Sports', 'Jet Ski', 'Kayak', 'Parasailing', 'Boat'],
      'outdoor': ['Outdoor', 'Nature', 'Park'],
      'attractions': ['Attraction', 'Zoo', 'Museum'],
      'family': ['Family Friendly', 'Kids'],
      'beach': ['Beach'],
      'tours': ['Tours', 'Excursion']
    };

    activitiesList = allActivities.filter(activity => {
      return selectedCategories.some(category => {
        const searchTags = categoryMap[category] || [];
        return activity.tags && activity.tags.some(tag =>
          searchTags.some(searchTag => tag.includes(searchTag))
        );
      });
    });
  }

  renderActivities();
  updateResultsTitle();
}

function updateResultsTitle() {
  let title = 'All Activities';
  if (selectedCategories.length === 1) {
    const titleMap = {
      'water-sports': 'Water Sports',
      'outdoor': 'Outdoor Activities',
      'attractions': 'Attractions',
      'family': 'Family Fun',
      'beach': 'Beach Activities',
      'tours': 'Tours & Excursions'
    };
    title = titleMap[selectedCategories[0]];
  } else if (selectedCategories.length > 1) {
    title = 'Activities';
  }

  document.getElementById('results-title').textContent =
    `${title} (${activitiesList.length})`;
}

function renderActivities() {
  const grid = document.getElementById('activities-grid');

  if (activitiesList.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No activities found</p></div>';
    return;
  }

  grid.innerHTML = activitiesList.map(activity => `
    <div class="business-card" data-business-id="${activity.id}" onclick="window.location.href='profile.html?id=${activity.id}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${activity.name}</h3>
        <span class="business-category">${activity.category}</span>
        ${activity.cuisine ? `<div class="business-cuisine">${activity.cuisine}</div>` : ''}
      </div>

      ${((activity.images && activity.images[0]) || activity.image) ? `
        <div class="business-card-image-centered">
          <img src="${(activity.images && activity.images[0]) || activity.image}" alt="${activity.name}" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'">
        </div>
      ` : ''}

      <div class="business-card-details">
        <div class="business-info">
          <div class="business-info-item">📍 ${activity.location}</div>
          ${activity.distanceText ? `<div class="business-info-item">🚗 ${activity.distanceText} away</div>` : ''}
        </div>

        <p class="business-description">${activity.about || activity.description || activity.short_description || ""}</p>

        ${activity.tags ? `
          <div class="business-tags">
            ${activity.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>
        ` : ''}

        <div class="business-actions">
          <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${activity.id}'">View Profile</button>
          ${activity.phone ? `<a href="tel:${activity.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call Now</a>` : ''}
          ${activity.address ? `<button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${activity.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>` : ''}
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  activitiesList = getActivities();
  renderActivities();
  updateResultsTitle();

  // Listen for data updates
  window.addEventListener('allBusinessesUpdated', () => {
    activitiesList = getActivities();
    renderActivities();
    updateResultsTitle();
  });

  // Add filter chip click handlers
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const category = chip.getAttribute('data-category');
      filterByCategory(category);
    });
  });
});
