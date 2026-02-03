/**
 * Sticky Navigation Helper
 * Dynamically calculates and sets CSS variables for sticky navigation positioning
 */

function updateStickyNavHeights() {
  const header = document.querySelector('.gcr-header');
  const filterNav = document.querySelector('.cuisine-filter-section, .profile-nav');

  if (header) {
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }

  if (filterNav) {
    const filterNavHeight = filterNav.offsetHeight;
    document.documentElement.style.setProperty('--filter-nav-height', `${filterNavHeight}px`);
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateStickyNavHeights);

// Run after window load (images, fonts loaded)
window.addEventListener('load', updateStickyNavHeights);

// Recalculate on window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(updateStickyNavHeights, 250);
});
