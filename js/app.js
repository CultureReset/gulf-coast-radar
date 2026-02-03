// CyberCheck Inc - Application Logic
// Universal Search Engine for Orange Beach & Gulf Shores

let allBusinesses = [];
let filteredBusinesses = [];
let currentCategory = 'all';
let currentSort = 'name';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  allBusinesses = [...businessData];
  filteredBusinesses = [...allBusinesses];

  setupEventListeners();
  displayBusinesses(filteredBusinesses);
  updateResultsTitle();
});

// Setup event listeners
function setupEventListeners() {
  // Universal search input
  const searchInput = document.getElementById('universal-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleUniversalSearch, 300));
  }

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    const searchResults = document.getElementById('search-results');
    if (!e.target.closest('.search-container') && searchResults) {
      searchResults.classList.remove('active');
    }
  });

  // Category filters
  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', handleCategoryFilter);
  });

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }
}

// UNIVERSAL SEARCH - Search across businesses, menu items, drinks, everything!
function handleUniversalSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('search-results');

  if (!query) {
    resultsContainer.classList.remove('active');
    resultsContainer.innerHTML = '';
    return;
  }

  // Search across ALL data
  const results = [];

  allBusinesses.forEach(business => {
    // Search business name and description
    if (business.name.toLowerCase().includes(query) ||
        business.description.toLowerCase().includes(query) ||
        business.cuisine.toLowerCase().includes(query)) {
      results.push({
        type: 'business',
        businessName: business.name,
        name: business.name,
        description: business.description,
        business: business
      });
    }

    // Search menu items
    if (business.menu && business.menu.length > 0) {
      business.menu.forEach(item => {
        if (item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)) {
          results.push({
            type: 'menu',
            businessName: business.name,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            business: business
          });
        }
      });
    }

    // Search drinks
    if (business.drinks && business.drinks.length > 0) {
      business.drinks.forEach(drink => {
        if (drink.name.toLowerCase().includes(query) ||
            drink.description.toLowerCase().includes(query) ||
            drink.category.toLowerCase().includes(query)) {
          results.push({
            type: 'drink',
            businessName: business.name,
            name: drink.name,
            price: drink.price,
            description: drink.description,
            category: drink.category,
            business: business
          });
        }
      });
    }
  });

  // Display search results
  if (results.length > 0) {
    resultsContainer.innerHTML = results.slice(0, 10).map(result => `
      <div class="search-result-item" onclick='openBusinessDetail(${JSON.stringify(result.business).replace(/'/g, "\\'")})'  >
        <div class="search-result-business">${result.businessName}</div>
        <div class="search-result-name">${result.name}</div>
        ${result.type !== 'business' ? `
          <span class="search-result-type">${result.type}</span>
          <div class="search-result-price">${result.price} • ${result.description}</div>
        ` : `
          <div class="search-result-price">${result.description}</div>
        `}
      </div>
    `).join('');
    resultsContainer.classList.add('active');
  } else {
    resultsContainer.innerHTML = '<div class="search-result-item"><div class="search-result-name">No results found</div></div>';
    resultsContainer.classList.add('active');
  }
}

// Handle category filtering
function handleCategoryFilter(e) {
  // Update active button
  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');

  currentCategory = e.target.dataset.category;

  // Filter businesses
  if (currentCategory === 'all') {
    filteredBusinesses = [...allBusinesses];
  } else {
    filteredBusinesses = allBusinesses.filter(b => b.category === currentCategory);
  }

  sortBusinesses(currentSort);
  displayBusinesses(filteredBusinesses);
  updateResultsTitle();
}

// Handle sorting
function handleSort(e) {
  currentSort = e.target.value;
  sortBusinesses(currentSort);
  displayBusinesses(filteredBusinesses);
}

// Sort businesses
function sortBusinesses(sortBy) {
  filteredBusinesses.sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
}

// Display businesses
function displayBusinesses(businesses) {
  const grid = document.getElementById('businesses-grid');

  if (!grid) {
    console.warn('businesses-grid element not found');
    return;
  }

  if (businesses.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No businesses found</h3>
        <p>Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = businesses.map(business => `
    <div class="business-card" onclick='openBusinessDetail(${JSON.stringify(business).replace(/'/g, "\\'")})''>
      <div class="business-card-header">
        <h3 class="business-name">${business.name}</h3>
        <span class="business-category">${business.category}</span>
        <div class="business-cuisine">${business.cuisine || ''}</div>
      </div>

      <div class="business-info">
        <div class="business-info-item">📍 ${business.location}</div>
      </div>

      <p class="business-description">${business.description}</p>

      ${Array.isArray(business.tags) && business.tags.length > 0 ? `
        <div class="business-tags">
          ${business.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
        </div>
      ` : ''}

      <div class="business-actions">
        ${business.website ? `<a href="${business.website}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">Visit Website</a>` : ''}
        <a href="https://maps.google.com/?q=${encodeURIComponent(business.address)}" target="_blank" class="btn btn-secondary" onclick="event.stopPropagation()">Directions</a>
      </div>
    </div>
  `).join('');
}

// Open business detail modal
function openBusinessDetail(business) {
  const modal = document.getElementById('business-modal');
  const modalBody = document.getElementById('modal-body');

  if (!modal || !modalBody) {
    console.warn('Modal elements not found');
    return;
  }

  let menuHTML = '';
  if (business.menu && business.menu.length > 0) {
    const menuCategories = {};
    business.menu.forEach(item => {
      if (!menuCategories[item.category]) {
        menuCategories[item.category] = [];
      }
      menuCategories[item.category].push(item);
    });

    menuHTML = `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid var(--border);">
        <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 16px; color: var(--text);">Menu</h3>
        ${Object.keys(menuCategories).map(category => `
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 12px; text-transform: uppercase;">${category}</h4>
            ${menuCategories[category].map(item => `
              <div style="padding: 12px; background: var(--bg-elevated); border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: var(--text);">${item.name}</span>
                  <span style="color: var(--accent); font-weight: 700;">${item.price}</span>
                </div>
                <div style="font-size: 14px; color: var(--text-muted);">${item.description}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  let drinksHTML = '';
  if (business.drinks && business.drinks.length > 0) {
    const drinkCategories = {};
    business.drinks.forEach(drink => {
      if (!drinkCategories[drink.category]) {
        drinkCategories[drink.category] = [];
      }
      drinkCategories[drink.category].push(drink);
    });

    drinksHTML = `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid var(--border);">
        <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 16px; color: var(--text);">Drinks</h3>
        ${Object.keys(drinkCategories).map(category => `
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 12px; text-transform: uppercase;">${category}</h4>
            ${drinkCategories[category].map(drink => `
              <div style="padding: 12px; background: var(--bg-elevated); border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: var(--text);">${drink.name}</span>
                  <span style="color: var(--accent); font-weight: 700;">${drink.price}</span>
                </div>
                <div style="font-size: 14px; color: var(--text-muted);">${drink.description}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  modalBody.innerHTML = `
    <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 8px; color: var(--text); padding-right: 40px;">${business.name}</h2>
    <div style="margin-bottom: 16px;">
      <span class="business-category">${business.category}</span>
    </div>

    <div style="font-size: 18px; color: var(--text-muted); margin-bottom: 24px;">${business.cuisine || ''}</div>

    <div style="display: grid; gap: 12px; margin-bottom: 24px;">
      <div style="color: var(--text);">📍 ${business.address}</div>
      <div style="color: var(--text);">🕐 ${business.hours}</div>
      ${business.priceLevel ? `<div style="color: var(--text);">💰 ${business.priceLevel}</div>` : ''}
    </div>

    <p style="color: var(--text); line-height: 1.7; margin-bottom: 24px;">${business.description}</p>

    ${Array.isArray(business.tags) && business.tags.length > 0 ? `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
        ${business.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
      </div>
    ` : ''}

    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      ${business.website ? `<a href="${business.website}" target="_blank" class="btn btn-primary">Visit Website</a>` : ''}
      <a href="https://maps.google.com/?q=${encodeURIComponent(business.address)}" target="_blank" class="btn btn-secondary">Get Directions</a>
    </div>

    ${menuHTML}
    ${drinksHTML}
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close business detail modal
function closeBusinessModal() {
  const modal = document.getElementById('business-modal');

  if (!modal) {
    return;
  }

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Update results title
function updateResultsTitle() {
  const resultsTitle = document.getElementById('results-title');

  if (!resultsTitle) {
    return;
  }

  const count = filteredBusinesses.length;
  const categoryName = currentCategory === 'all' ? 'All Businesses' :
    currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  resultsTitle.textContent = `${categoryName} (${count})`;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
