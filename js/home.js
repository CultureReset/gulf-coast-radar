// Home Page JavaScript

// Display featured businesses on home page
document.addEventListener('DOMContentLoaded', () => {
  const featured = allBusinesses
    .filter(b => b.category === 'restaurants')
    .slice(0, 3);

  displayFeaturedBusinesses(featured);
});

function displayFeaturedBusinesses(businesses) {
  const container = document.getElementById('featured-businesses');

  container.innerHTML = businesses.map(business => `
    <div class="business-card" onclick="window.location.href='profile.html?id=${business.id}'">
      <div class="business-card-header">
        <h3 class="business-name">${business.name}</h3>
        <span class="business-category">${business.category}</span>
        <div class="business-cuisine">${business.cuisine || ''}</div>
      </div>

      ${((business.images && business.images[0]) || business.image) ? `
        <div class="business-card-image-centered">
          <img src="${(business.images && business.images[0]) || business.image}" alt="${business.name}" onerror="this.style.display='none'">
        </div>
      ` : ''}

      <div class="business-info">
        <div class="business-info-item">📍 ${business.location}</div>
      </div>

      <p class="business-description">${business.description}</p>

      ${business.tags.length > 0 ? `
        <div class="business-tags">
          ${business.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
        </div>
      ` : ''}

      <div class="business-actions">
        <button class="btn btn-primary btn-large" onclick="event.stopPropagation(); window.location.href='profile.html?id=${business.id}'">View Profile</button>
        <a href="tel:${business.phone}" class="btn btn-secondary" onclick="event.stopPropagation()">📞 Call Now</a>
        <button class="btn btn-secondary" onclick="event.stopPropagation(); openMaps('${business.address.replace(/'/g, "\\'")}')">🗺️ Directions</button>
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
  // Desktop or other - use Google Maps web
  else {
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }
}

// Home page search
function handleHomeSearch() {
  const query = document.getElementById('home-search').value.trim();
  if (query) {
    window.location.href = `restaurants.html?search=${encodeURIComponent(query)}`;
  }
}

// Search on Enter key
document.getElementById('home-search')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleHomeSearch();
  }
});

// Live search suggestions
document.getElementById('home-search')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('home-search-results');

  if (!query) {
    resultsContainer.classList.remove('active');
    return;
  }

  const results = [];

  allBusinesses.forEach(business => {
    if (business.name.toLowerCase().includes(query) ||
        business.description.toLowerCase().includes(query)) {
      results.push({
        type: 'business',
        name: business.name,
        description: business.description,
        id: business.id
      });
    }

    // Search menu items
    if (business.menu && business.menu.length > 0) {
      business.menu.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
          results.push({
            type: 'menu',
            businessName: business.name,
            name: item.name,
            price: item.price,
            businessId: business.id
          });
        }
      });
    }
  });

  if (results.length > 0) {
    resultsContainer.innerHTML = results.slice(0, 5).map(result => `
      <div class="search-result-item" onclick="window.location.href='profile.html?id=${result.businessId || result.id}'">
        ${result.type === 'business' ? `
          <div class="search-result-name">${result.name}</div>
          <div class="search-result-price">${result.description}</div>
        ` : `
          <div class="search-result-business">${result.businessName}</div>
          <div class="search-result-name">${result.name}</div>
          <div class="search-result-price">${result.price}</div>
        `}
      </div>
    `).join('');
    resultsContainer.classList.add('active');
  } else {
    resultsContainer.innerHTML = '<div class="search-result-item"><div class="search-result-name">No results found</div></div>';
    resultsContainer.classList.add('active');
  }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container-home')) {
    document.getElementById('home-search-results')?.classList.remove('active');
  }
});
