// Shared Header Component
document.addEventListener('DOMContentLoaded', () => {
  // Inject the sticky header at the beginning of body if not on home page
  if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
    const header = document.createElement('div');
    header.className = 'gcr-header';
    header.innerHTML = `
      <div class="site-title">
        <a href="index.html">🌊 GULF COAST RADAR</a>
      </div>

      <div class="category-tabs">
        <a href="restaurants.html" class="category-tab" data-page="restaurants">🍽️ Restaurants</a>
        <a href="coffee-sweets.html" class="category-tab" data-page="coffee">☕ Coffee</a>
        <a href="specials.html" class="category-tab" data-page="specials">🎉 Specials</a>
        <a href="things-to-do.html" class="category-tab" data-page="things">🎯 Things To Do</a>
      </div>

      <div class="header-search-row">
        <div class="header-search-bar">
          <span>🔍</span>
          <input
            id="header-search-input"
            type="search"
            placeholder="Search restaurants, menu items, drinks..."
            autocomplete="off"
          >
        </div>
        <div id="header-search-results" class="header-search-results" style="display:none;"></div>
      </div>
    `;

    // Insert header after back button
    const backButton = document.querySelector('.back-button');
    if (backButton && backButton.nextSibling) {
      document.body.insertBefore(header, backButton.nextSibling);
    } else {
      document.body.insertBefore(header, document.body.firstChild);
    }

    // Set active tab based on current page
    const currentPage = window.location.pathname;
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
      const href = tab.getAttribute('href');
      if (currentPage.includes(href)) {
        tab.classList.add('active');
      }
    });

    // Setup header search functionality
    setupHeaderSearch();
  }
});

function setupHeaderSearch() {
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchResults = document.getElementById('header-search-results');

  if (!headerSearchInput || typeof allBusinesses === 'undefined') return;

  headerSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      headerSearchResults.style.display = 'none';
      return;
    }

    const results = allBusinesses.filter(b =>
      b.name.toLowerCase().includes(query) ||
      (b.cuisine && b.cuisine.toLowerCase().includes(query)) ||
      (b.description && b.description.toLowerCase().includes(query))
    ).slice(0, 8);

    headerSearchResults.innerHTML = results.map(item => `
      <a href="profile.html?id=${item.id}" class="header-search-result-item">
        <div class="header-result-name">${item.name}</div>
        <div class="header-result-meta">${item.cuisine || item.category} • ${item.location}</div>
      </a>
    `).join('');
    headerSearchResults.style.display = results.length > 0 ? 'block' : 'none';
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-search-row')) {
      headerSearchResults.style.display = 'none';
    }
  });
}
