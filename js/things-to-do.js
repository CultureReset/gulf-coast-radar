// Things to Do Page - Activities, Attractions & Shopping
let allActivities = [];
let filteredActivities = [];
let selectedCategory = 'all';
const API_URL = 'http://localhost:3002/api/businesses';

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

    // Filter to things-to-do, activities, and attractions categories
    allActivities = data.businesses.filter(b =>
      b.category === 'things-to-do' ||
      b.category === 'activities' ||
      b.category === 'attractions'
    );
    filteredActivities = [...allActivities];

    console.log(`✅ Loaded ${allActivities.length} things to do (things-to-do: ${data.businesses.filter(b => b.category === 'things-to-do').length}, activities: ${data.businesses.filter(b => b.category === 'activities').length}, attractions: ${data.businesses.filter(b => b.category === 'attractions').length})`);

    displayActivities();
    updateTitle();

    // Setup category filter listeners (if they exist)
    document.querySelectorAll('.cuisine-filter-chip').forEach(chip => {
      chip.addEventListener('click', handleCategoryFilter);
    });
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
  } else if (category === 'pet-friendly') {
    filteredActivities = allActivities.filter(a => {
      const tags = (a.tags || []).map(t => t.toLowerCase()).join(' ');
      const name = a.name.toLowerCase();
      return tags.includes('pet') || tags.includes('dog') || name.includes('dog park');
    });
  }

  displayActivities();
  updateTitle();
}

function displayActivities() {
  const list = document.getElementById('events-list');

  if (filteredActivities.length === 0) {
    list.innerHTML = `
      <div class="special-empty-state">
        <div class="special-empty-icon">🎯</div>
        <h3 class="special-empty-title">No activities found</h3>
        <p class="special-empty-description">Try selecting a different category!</p>
      </div>
    `;
    return;
  }

  // Sort by name
  const sortedActivities = [...filteredActivities].sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = sortedActivities.map((activity) => {
          const activityId = `activity-${activity.id}`;

          return `
          <div class="special-item" style="margin-bottom: 20px; display: flex; gap: 16px;" data-activity-id="${activityId}">
            ${activity.image || activity.profile_pic || activity.main_image ? `
              <div style="flex-shrink: 0;">
                <img src="${activity.image || activity.profile_pic || activity.main_image}"
                     alt="${activity.name}"
                     style="width: 120px; height: 120px; object-fit: cover; border-radius: 12px;"
                     onerror="this.style.display='none'">
              </div>
            ` : ''}
            <div style="flex: 1;">
              <div class="special-header" style="cursor: ${activity.website ? 'pointer' : 'default'};" ${activity.website ? `onclick="window.open('${activity.website}', '_blank')"` : ''}>
                <div class="special-info">
                  <div class="special-title">
                    <h3 class="special-business-name">${activity.name}</h3>
                    ${activity.rating ? `<span style="color: #F59E0B; font-size: 14px; font-weight: 600;">⭐ ${activity.rating.toFixed(1)}</span>` : ''}
                  </div>
                <div class="special-meta">
                  ${activity.location ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">📍</span>
                      <span>${activity.location}</span>
                    </div>
                  ` : ''}
                  ${activity.address ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">🗺️</span>
                      <span>${activity.address}</span>
                    </div>
                  ` : ''}
                  ${activity.phone ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">📞</span>
                      <span><a href="tel:${activity.phone.replace(/\D/g, '')}" style="color: inherit; text-decoration: none;">${activity.phone}</a></span>
                    </div>
                  ` : ''}
                  ${activity.hours && activity.hours !== 'See website for hours' ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">⏰</span>
                      <span>${activity.hours}</span>
                    </div>
                  ` : ''}
                  ${activity.priceLevel && activity.priceLevel !== 'Varies' ? `
                    <div class="special-meta-item">
                      <span class="special-meta-icon">💵</span>
                      <span>${activity.priceLevel.length > 100 ? activity.priceLevel.substring(0, 100) + '...' : activity.priceLevel}</span>
                    </div>
                  ` : ''}
                </div>
                </div>
                ${activity.website ? '<div class="special-arrow">→</div>' : ''}
              </div>
              ${activity.description || activity.about ? `
                <div class="special-description" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); color: #6B7280;">
                  ${stripUrls(activity.about || activity.description || "")}
                </div>
              ` : ''}
              ${activity.tags && activity.tags.length > 0 ? `
                <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                  ${activity.tags.map(tag => `
                    <span style="background: #EFF6FF; color: #1E40AF; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                      ${tag}
                    </span>
                  `).join('')}
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
    'parks': 'Parks & Nature',
    'rentals': 'Activity Rentals',
    'attractions': 'Attractions & Landmarks',
    'shopping': 'Shopping & Supplies',
    'pet-friendly': '🐾 Pet Friendly Activities'
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
