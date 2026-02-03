/**
 * Category Tabs Auto-Scroll
 * Automatically scrolls the active category tab into view when page loads
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollActiveTabIntoView);
  } else {
    scrollActiveTabIntoView();
  }

  function scrollActiveTabIntoView() {
    // Find the category tabs container
    const categoryTabsContainer = document.querySelector('.category-tabs');

    if (!categoryTabsContainer) {
      return; // No category tabs on this page
    }

    // Find the active tab
    const activeTab = categoryTabsContainer.querySelector('.category-tab.active');

    if (!activeTab) {
      return; // No active tab found
    }

    // Small delay to ensure layout is complete
    setTimeout(() => {
      // Scroll the active tab into view
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center' // Center the active tab horizontally
      });
    }, 100);
  }
})();
