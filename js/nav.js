// Shared Navigation Component
// Inject this into all pages

function createNavigation(activePage = 'home') {
  return `
    <nav class="main-nav">
      <div class="nav-container">
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
        <div class="nav-links" id="nav-links">
          <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="restaurants.html" class="nav-link ${activePage === 'restaurants' ? 'active' : ''}">Restaurants</a>
          <a href="coffee-sweets.html" class="nav-link ${activePage === 'coffee' ? 'active' : ''}">Coffee & Sweets</a>
          <a href="specials.html" class="nav-link ${activePage === 'specials' ? 'active' : ''}">Specials</a>
          <a href="things-to-do.html" class="nav-link ${activePage === 'activities' ? 'active' : ''}">Things To Do</a>
        </div>
        <a href="index.html" class="nav-logo">🌊 Gulf Coast Radar</a>
      </div>
    </nav>
  `;
}

function toggleMobileMenu() {
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.toggle('active');
}

// Insert navigation on page load
document.addEventListener('DOMContentLoaded', () => {
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) {
    const activePage = navPlaceholder.getAttribute('data-page') || 'home';
    navPlaceholder.innerHTML = createNavigation(activePage);
  }
});
