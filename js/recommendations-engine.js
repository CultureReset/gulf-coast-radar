// Personalized Recommendations Engine
// Tracks user behavior and provides personalized business suggestions

class RecommendationsEngine {
  constructor() {
    this.storageKey = 'gulfCoastRadar_userPreferences';
    this.preferences = this.loadPreferences();
  }

  /**
   * Load user preferences from localStorage
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        viewedBusinesses: [],
        favoritedCategories: {},
        searchQueries: [],
        lastVisit: Date.now()
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {
        viewedBusinesses: [],
        favoritedCategories: {},
        searchQueries: [],
        lastVisit: Date.now()
      };
    }
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Track when user views a business profile
   */
  trackBusinessView(businessId, category, cuisine) {
    // Add to viewed businesses (keep last 50)
    this.preferences.viewedBusinesses = this.preferences.viewedBusinesses || [];
    this.preferences.viewedBusinesses.unshift({
      id: businessId,
      category,
      cuisine,
      timestamp: Date.now()
    });
    this.preferences.viewedBusinesses = this.preferences.viewedBusinesses.slice(0, 50);

    // Track category interest
    this.preferences.favoritedCategories[category] =
      (this.preferences.favoritedCategories[category] || 0) + 1;

    if (cuisine) {
      this.preferences.favoritedCategories[cuisine] =
        (this.preferences.favoritedCategories[cuisine] || 0) + 1;
    }

    this.preferences.lastVisit = Date.now();
    this.savePreferences();
  }

  /**
   * Track user search query
   */
  trackSearch(query) {
    this.preferences.searchQueries = this.preferences.searchQueries || [];
    this.preferences.searchQueries.unshift({
      query: query.toLowerCase(),
      timestamp: Date.now()
    });
    this.preferences.searchQueries = this.preferences.searchQueries.slice(0, 20);
    this.savePreferences();
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations(allBusinesses, currentBusinessId = null, limit = 10) {
    if (!allBusinesses || allBusinesses.length === 0) {
      return [];
    }

    // Score each business based on user preferences
    const scoredBusinesses = allBusinesses
      .filter(b => b.id !== currentBusinessId) // Exclude current business
      .map(business => {
        let score = 0;

        // Score based on category interest
        const categoryScore = this.preferences.favoritedCategories[business.category] || 0;
        score += categoryScore * 3;

        // Score based on cuisine interest
        if (business.cuisine) {
          const cuisineScore = this.preferences.favoritedCategories[business.cuisine] || 0;
          score += cuisineScore * 2;
        }

        // Boost if similar to recently viewed
        const recentViews = this.preferences.viewedBusinesses.slice(0, 5);
        const similarViews = recentViews.filter(v =>
          v.category === business.category || v.cuisine === business.cuisine
        ).length;
        score += similarViews * 5;

        // Boost by rating
        if (business.rating) {
          score += business.rating * 2;
        }

        // Boost if nearby (has distance calculated)
        if (business.distanceValue && business.distanceValue < 5) {
          score += (5 - business.distanceValue) * 2;
        }

        // Boost popular tags
        if (Array.isArray(business.tags)) {
          const popularTags = ['Happy Hour', 'Live Music', 'Waterfront', 'Family Friendly'];
          const hasPopularTag = business.tags.some(tag => popularTags.includes(tag));
          if (hasPopularTag) score += 3;
        }

        return { business, score };
      })
      .filter(({ score }) => score > 0) // Only businesses with some relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ business }) => business);

    // If no recommendations based on preferences, return top-rated nearby businesses
    if (scoredBusinesses.length === 0) {
      return allBusinesses
        .filter(b => b.id !== currentBusinessId)
        .sort((a, b) => {
          // Sort by rating first
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
          // Then by distance
          return (a.distanceValue || 999) - (b.distanceValue || 999);
        })
        .slice(0, limit);
    }

    return scoredBusinesses;
  }

  /**
   * Get recommendations for homepage
   */
  getHomepageRecommendations(allBusinesses, limit = 15) {
    return this.getRecommendations(allBusinesses, null, limit);
  }

  /**
   * Get "You May Also Like" for a specific business
   */
  getSimilarBusinesses(allBusinesses, currentBusiness, limit = 6) {
    if (!currentBusiness) return [];

    const similar = allBusinesses
      .filter(b => b.id !== currentBusiness.id)
      .map(business => {
        let similarity = 0;

        // Same category = high similarity
        if (business.category === currentBusiness.category) {
          similarity += 10;
        }

        // Same cuisine = very high similarity
        if (business.cuisine && business.cuisine === currentBusiness.cuisine) {
          similarity += 15;
        }

        // Shared tags
        if (Array.isArray(currentBusiness.tags) && Array.isArray(business.tags)) {
          const sharedTags = currentBusiness.tags.filter(tag =>
            business.tags.includes(tag)
          ).length;
          similarity += sharedTags * 3;
        }

        // Similar price level
        if (currentBusiness.priceLevel === business.priceLevel) {
          similarity += 5;
        }

        // Nearby (within 2 miles)
        if (business.distanceValue && business.distanceValue < 2) {
          similarity += 8;
        }

        // Boost by rating
        if (business.rating) {
          similarity += business.rating;
        }

        return { business, similarity };
      })
      .filter(({ similarity }) => similarity > 5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ business }) => business);

    return similar;
  }

  /**
   * Render recommendations section for homepage
   */
  renderHomepageRecommendations(allBusinesses) {
    // Only show if user has some activity
    if (!this.preferences.viewedBusinesses || this.preferences.viewedBusinesses.length < 3) {
      return ''; // Don't show recommendations for new users
    }

    const recommendations = this.getHomepageRecommendations(allBusinesses);

    if (recommendations.length === 0) {
      return '';
    }

    return `
      <section class="carousel-section">
        <div class="carousel-header">
          <h2>✨ Recommended For You</h2>
          <span class="see-all" style="color: var(--text-secondary); font-size: 13px;">Based on your activity</span>
        </div>
        <div class="scroller-wrapper">
          <div class="scroller" id="recommendations-carousel"></div>
        </div>
      </section>
    `;
  }

  /**
   * Render "You May Also Like" section for profile page
   */
  renderSimilarBusinesses(allBusinesses, currentBusiness) {
    const similar = this.getSimilarBusinesses(allBusinesses, currentBusiness);

    if (similar.length === 0) {
      return '';
    }

    return `
      <section class="profile-section" style="background: var(--bg-elevated); margin: 20px 0;">
        <h2 class="profile-section-title">✨ You May Also Like</h2>
        <div class="similar-businesses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 16px;">
          ${similar.map(business => `
            <div class="business-card-compact" onclick="window.location.href='profile.html?id=${business.id}'" style="cursor: pointer;">
              ${business.image ? `
                <img src="${business.image}" alt="${business.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0;">
              ` : ''}
              <div style="padding: 12px;">
                <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700;">${business.name}</h3>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: var(--text-secondary);">${business.cuisine || business.category}</p>
                ${business.rating ? `<div style="font-size: 13px; color: #f59e0b;">⭐ ${business.rating}</div>` : ''}
                ${business.distanceText ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">📍 ${business.distanceText} away</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
}

// Initialize recommendations engine
const recommendationsEngine = new RecommendationsEngine();

// Auto-track on profile page load
if (window.location.pathname.includes('profile.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('id');

    // Wait for currentBusiness to be loaded
    setTimeout(() => {
      if (typeof currentBusiness !== 'undefined' && currentBusiness) {
        recommendationsEngine.trackBusinessView(
          currentBusiness.id,
          currentBusiness.category,
          currentBusiness.cuisine
        );
      }
    }, 500);
  });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationsEngine;
}
