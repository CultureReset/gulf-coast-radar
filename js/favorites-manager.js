// Favorites/Wishlist Manager
// Saves user's favorite businesses to localStorage (no account required)

class FavoritesManager {
  constructor() {
    this.storageKey = 'gulfCoastRadar_favorites';
    this.favorites = this.loadFavorites();
    this.initializeUI();
  }

  /**
   * Load favorites from localStorage
   */
  loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  /**
   * Save favorites to localStorage
   */
  saveFavorites() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
      this.updateFavoritesCount();
      this.dispatchFavoritesChangedEvent();
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  /**
   * Check if business is favorited
   */
  isFavorite(businessId) {
    return this.favorites.includes(businessId);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(businessId) {
    const index = this.favorites.indexOf(businessId);

    if (index > -1) {
      // Remove from favorites
      this.favorites.splice(index, 1);
      this.showToast('Removed from favorites', 'remove');
    } else {
      // Add to favorites
      this.favorites.push(businessId);
      this.showToast('Added to favorites!', 'add');
    }

    this.saveFavorites();
    this.updateAllHeartIcons();

    return this.isFavorite(businessId);
  }

  /**
   * Get all favorite businesses with full details
   */
  getFavoriteBusinesses() {
    if (typeof allBusinesses === 'undefined') {
      console.error('allBusinesses not loaded');
      return [];
    }

    return this.favorites
      .map(id => allBusinesses.find(b => b.id === id))
      .filter(b => b !== undefined); // Remove any that no longer exist
  }

  /**
   * Get favorites count
   */
  getCount() {
    return this.favorites.length;
  }

  /**
   * Clear all favorites (with confirmation)
   */
  clearAll() {
    if (confirm('Are you sure you want to clear all your saved places?')) {
      this.favorites = [];
      this.saveFavorites();
      this.updateAllHeartIcons();
      this.showToast('All favorites cleared', 'remove');

      // Refresh favorites page if we're on it
      if (window.location.pathname.includes('favorites.html')) {
        window.location.reload();
      }
    }
  }

  /**
   * Export favorites as list (for sharing or backup)
   */
  exportFavorites() {
    const businesses = this.getFavoriteBusinesses();
    const text = businesses.map(b =>
      `${b.name}\n${b.category}\n${b.location}\n${b.phone || ''}\n`
    ).join('\n---\n\n');

    // Create downloadable text file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-gulf-coast-favorites.txt';
    link.click();

    this.showToast('Favorites exported!', 'add');
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    // Update count on page load
    this.updateFavoritesCount();

    // Add heart icons to all business cards
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.addHeartIconsToCards();
      });
    } else {
      this.addHeartIconsToCards();
    }
  }

  /**
   * Add heart icons to all business cards
   */
  addHeartIconsToCards() {
    const businessCards = document.querySelectorAll('[data-business-id]');

    businessCards.forEach(card => {
      const businessId = card.dataset.businessId;

      // Check if heart icon already exists
      if (card.querySelector('.favorite-heart')) return;

      // Create heart icon
      const heartBtn = document.createElement('button');
      heartBtn.className = 'favorite-heart';
      heartBtn.innerHTML = this.isFavorite(businessId) ? '❤️' : '🤍';
      heartBtn.setAttribute('aria-label', 'Add to favorites');
      heartBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent card click
        this.toggleFavorite(businessId);
      };

      // Add to card (position in top-right corner)
      card.style.position = 'relative';
      card.appendChild(heartBtn);
    });
  }

  /**
   * Update all heart icons on page
   */
  updateAllHeartIcons() {
    const hearts = document.querySelectorAll('.favorite-heart');

    hearts.forEach(heart => {
      const card = heart.closest('[data-business-id]');
      if (card) {
        const businessId = card.dataset.businessId;
        heart.innerHTML = this.isFavorite(businessId) ? '❤️' : '🤍';
      }
    });
  }

  /**
   * Update favorites count badge in navigation
   */
  updateFavoritesCount() {
    const countBadge = document.querySelector('.favorites-count');
    if (countBadge) {
      const count = this.getCount();
      countBadge.textContent = count;
      countBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'add') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.favorites-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `favorites-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Dispatch custom event when favorites change
   */
  dispatchFavoritesChangedEvent() {
    const event = new CustomEvent('favoritesChanged', {
      detail: {
        count: this.getCount(),
        favorites: [...this.favorites]
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get favorites summary for AI assistant
   */
  getSummaryForAI() {
    const count = this.getCount();

    if (count === 0) {
      return "You haven't saved any places yet.";
    }

    const businesses = this.getFavoriteBusinesses();
    const byCategory = {};

    businesses.forEach(b => {
      if (!byCategory[b.category]) {
        byCategory[b.category] = [];
      }
      byCategory[b.category].push(b.name);
    });

    let summary = `You have ${count} saved place${count !== 1 ? 's' : ''}:\n\n`;

    for (const [category, names] of Object.entries(byCategory)) {
      summary += `${category}: ${names.join(', ')}\n`;
    }

    return summary.trim();
  }
}

// Initialize favorites manager
const favoritesManager = new FavoritesManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FavoritesManager;
}
