// Things to Do Page - Activities, Attractions & Shopping
let allActivities = [];
let filteredActivities = [];
let selectedCategory = 'all';
let currentSort = 'distance';
const API_URL = 'http://localhost:3002/api/gcr/businesses';

// Helper function to remove URLs from text
function stripUrls(text) {
  if (!text) return '';
  // Remove URLs (http, https, www, and common domain patterns)
  return text.replace(/(?:https?:\/\/|www\.)[^\s]+/gi, '')
    .replace(/\b[a-z0-9-]+\.(com|net|org|info|biz|us|co|io)[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function initializeThingsToDoPage() {
  console.log('🎯 Loading Things to Do from API...');

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data.success) {
      console.error('Failed to load businesses:', data.error);
      return;
    }

    // Filter to ONLY things-to-do, activities, attractions, nightlife, and entertainment
    // EXCLUDE: restaurants, coffee-sweets, beach-access, parking, hotels, shopping
    allActivities = data.businesses.filter(b => {
      const cat = (b.category || '').toLowerCase();
      const name = (b.name || '').toLowerCase();

      // Exclude restaurants and food places
      if (cat === 'restaurants' || cat === 'coffee-sweets' || cat === 'food' ||
          name.includes('restaurant') || name.includes('cafe') || name.includes('coffee')) {
        return false;
      }

      // Exclude beach access and parking (those go in "other")
      if (cat === 'beach-access' || cat === 'parking' || cat === 'boat-launch' ||
          cat === 'hotels' || cat === 'lodging' || cat === 'shopping' || cat === 'other') {
        return false;
      }

      // Include only activities, attractions, entertainment, nightlife
      return cat === 'things-to-do' ||
             cat === 'activities' ||
             cat === 'attractions' ||
             cat === 'nightlife' ||
             cat === 'entertainment';
    });
    filteredActivities = [...allActivities];

    console.log(`✅ Loaded ${allActivities.length} things to do (things-to-do: ${data.businesses.filter(b => b.category === 'things-to-do').length}, activities: ${data.businesses.filter(b => b.category === 'activities').length}, attractions: ${data.businesses.filter(b => b.category === 'attractions').length})`);

    displayActivities();
    updateTitle();

    // Setup category filter listeners
    document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
      chip.addEventListener('click', handleCategoryFilter);
    });

    // Setup sort dropdown listener
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', handleSort);
    }
  } catch (error) {
    console.error('Error loading things to do:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeThingsToDoPage();
});

function handleCategoryFilter(e) {
  const category = e.target.getAttribute('data-category');
  selectedCategory = category;

  // Update active state
  document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  e.target.classList.add('active');

  // Filter activities by tags and types
  if (category === 'all') {
    filteredActivities = [...allActivities];
  } else if (category === 'parks') {
    filteredActivities = allActivities.filter(a => {
      const tags = (a.tags || []).map(t => t.toLowerCase()).join(' ');
      const name = a.name.toLowerCase();
      return tags.includes('park') || name.includes('park');
    });
  } else if (category === 'attractions') {
    filteredActivities = allActivities.filter(a => {
      const tags = (a.tags || []).map(t => t.toLowerCase()).join(' ');
      const types = ['tourist_attraction', 'museum', 'amusement_park', 'aquarium', 'art_gallery', 'zoo'];
      return types.some(type => tags.includes(type));
    });
  } else if (category === 'activities') {
    filteredActivities = allActivities.filter(a => {
      const cat = (a.category || '').toLowerCase();
      return cat === 'activities' || cat === 'things-to-do';
    });
  } else if (category === 'nightlife') {
    filteredActivities = allActivities.filter(a => {
      const cat = (a.category || '').toLowerCase();
      return cat === 'nightlife' || cat === 'entertainment';
    });
  } else if (category === 'watersports') {
    filteredActivities = allActivities.filter(a => {
      const tags = (a.tags || []).map(t => t.toLowerCase()).join(' ');
      const name = a.name.toLowerCase();
      return tags.includes('water') || tags.includes('boat') || tags.includes('surf') ||
             name.includes('water') || name.includes('boat') || name.includes('surf');
    });
  } else if (category === 'outdoors') {
    filteredActivities = allActivities.filter(a => {
      const tags = (a.tags || []).map(t => t.toLowerCase()).join(' ');
      return tags.includes('outdoor') || tags.includes('nature') || tags.includes('hiking');
    });
  }

  sortActivities();
  displayActivities();
  updateTitle();
}

function handleSort(e) {
  currentSort = e.target.value;
  sortActivities();
  displayActivities();
}

function sortActivities() {
  filteredActivities.sort((a, b) => {
    switch(currentSort) {
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

function displayActivities() {
  const grid = document.getElementById('things-grid');

  if (filteredActivities.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No activities found</h3>
        <p>Try selecting a different category!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredActivities.map(activity => {
    const businessId = activity.id || activity.business_id;
    return `
    <div class="business-card" data-business-id="${businessId}" onclick="window.location.href='profile.html?id=${businessId}'">
      <div class="business-card-header-centered">
        <h3 class="business-name">${activity.name}</h3>
        <span class="business-category">${activity.category || 'Things to Do'}</span>
        ${activity.subcategory ? `<div class="business-cuisine">${Array.isArray(activity.subcategory) ? activity.subcategory.join(' • ') : activity.subcategory}</div>` : ''}
      </div>

      <div class="business-card-image-centered">
        ${activity.hours && typeof getBusinessStatus === 'function' ? (() => {
          const status = getBusinessStatus(activity);
          return status.isOpen ? `
            <div class="status-badge-open-now">
              <span class="pulse-dot"></span>
              <span>Open Now</span>
            </div>
          ` : '';
        })() : ''}
        <img src="${activity.profile_pic || activity.main_image || (activity.images && activity.images[0]) || activity.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E🎯 Activity%3C/text%3E%3C/svg%3E'}" alt="${activity.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E🎯 Activity%3C/text%3E%3C/svg%3E'">
      </div>

      <div class="business-card-details">
        <div class="business-info">
          ${(activity.address || activity.vicinity) ? `<div class="business-info-item">📍 ${activity.address || activity.vicinity}</div>` : ''}
          ${activity.distanceText ? `<div class="business-info-item">🚗 ${activity.distanceText} away</div>` : ''}
          ${activity.phone ? `<div class="business-info-item">📞 ${activity.phone}</div>` : ''}
          ${activity.hours ? `<div class="business-info-item">🕐 ${typeof activity.hours === 'object' ? JSON.stringify(activity.hours) : activity.hours}</div>` : ''}
          ${activity.hours && typeof getBusinessStatus === 'function' ? (() => {
            const status = getBusinessStatus(activity);
            return status.badge ? `
              <div class="business-status-badge ${status.class}">
                ${status.badge}
              </div>
              ${status.text ? `<div class="business-status-text">${status.text}</div>` : ''}
            ` : '';
          })() : ''}
          ${activity.website ? `<div class="business-info-item">🌐 Website</div>` : ''}
        </div>

        <p class="business-description">${stripUrls(activity.about || activity.description || activity.short_description || '')}</p>

        ${activity.tags && activity.tags.length > 0 ? `
          <div class="business-tags">
            ${(Array.isArray(activity.tags) ? activity.tags : activity.tags.split(',')).slice(0, 3).map(tag => `<span class="tag-chip">${tag.trim()}</span>`).join('')}
          </div>
        ` : ''}

        ${activity.rating ? `
          <div class="business-rating">
            <span class="rating-stars">⭐ ${activity.rating.toFixed(1)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  }).join('');
}

function updateTitle() {
  const title = document.getElementById('results-title');
  if (!title) return;

  const categoryLabels = {
    'all': 'All Activities & Attractions',
    'activities': 'Activities',
    'attractions': 'Attractions & Landmarks',
    'nightlife': 'Nightlife & Entertainment',
    'parks': 'Parks & Nature',
    'watersports': 'Watersports',
    'outdoors': 'Outdoor Activities'
  };

  title.textContent = `${categoryLabels[selectedCategory] || 'Activities & Attractions'} (${filteredActivities.length})`;
}

// Go back function
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
}
