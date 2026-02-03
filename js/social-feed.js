/**
 * Gulf Coast Radar - Social Feed Integration
 * Handles Instagram and Facebook post fetching and display
 */

class SocialFeed {
  constructor() {
    this.apiEndpoint = '/api/social-feed';
    this.refreshInterval = 3600000; // 1 hour in milliseconds
    this.cache = {
      posts: [],
      lastFetch: null
    };
  }

  /**
   * Initialize social feed for a business profile page
   * @param {string} businessId - The business ID
   * @param {string} containerId - DOM element ID to render posts
   */
  async initBusinessFeed(businessId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    try {
      const posts = await this.fetchBusinessPosts(businessId);
      this.renderBusinessFeed(posts, container);
    } catch (error) {
      console.error('Error loading business social feed:', error);
      container.innerHTML = '<p class="error-message">Unable to load social posts</p>';
    }
  }

  /**
   * Initialize homepage universal feed (all businesses)
   * @param {string} containerId - DOM element ID to render posts
   * @param {number} limit - Maximum number of posts to show
   */
  async initUniversalFeed(containerId, limit = 20) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="feed-loading">Loading latest posts...</div>';

    try {
      const posts = await this.fetchAllPosts(limit);
      this.renderUniversalFeed(posts, container);

      // Set up auto-refresh every hour
      setInterval(() => {
        this.refreshUniversalFeed(containerId, limit);
      }, this.refreshInterval);
    } catch (error) {
      console.error('Error loading universal social feed:', error);
      container.innerHTML = '<p class="error-message">Unable to load social feed</p>';
    }
  }

  /**
   * Fetch posts for a specific business
   * @param {string} businessId - The business ID
   * @returns {Promise<Array>} Array of post objects
   */
  async fetchBusinessPosts(businessId) {
    const response = await fetch(`${this.apiEndpoint}/business/${businessId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Fetch posts from all businesses
   * @param {number} limit - Maximum number of posts
   * @returns {Promise<Array>} Array of post objects
   */
  async fetchAllPosts(limit = 20) {
    // Check cache first
    const now = Date.now();
    if (this.cache.posts.length > 0 && this.cache.lastFetch && (now - this.cache.lastFetch < this.refreshInterval)) {
      return this.cache.posts.slice(0, limit);
    }

    const response = await fetch(`${this.apiEndpoint}/all?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json();

    // Update cache
    this.cache.posts = posts;
    this.cache.lastFetch = now;

    return posts;
  }

  /**
   * Render social feed for business profile page
   * @param {Array} posts - Array of post objects
   * @param {HTMLElement} container - Container element
   */
  renderBusinessFeed(posts, container) {
    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div class="no-posts">
          <p>No recent social media posts</p>
          <p class="sub-text">Connect your Instagram or Facebook to show posts here</p>
        </div>
      `;
      return;
    }

    const html = `
      <div class="social-feed-grid">
        ${posts.map(post => this.createPostCard(post)).join('')}
      </div>
    `;

    container.innerHTML = html;
    this.attachPostClickHandlers(container);
  }

  /**
   * Render universal feed for homepage
   * @param {Array} posts - Array of post objects
   * @param {HTMLElement} container - Container element
   */
  renderUniversalFeed(posts, container) {
    if (!posts || posts.length === 0) {
      container.innerHTML = '<p class="no-posts">No recent posts available</p>';
      return;
    }

    const html = `
      <div class="universal-feed">
        ${posts.map(post => this.createUniversalPostCard(post)).join('')}
      </div>
    `;

    container.innerHTML = html;
    this.attachPostClickHandlers(container);
  }

  /**
   * Create a post card for business profile page
   * @param {Object} post - Post data
   * @returns {string} HTML string
   */
  createPostCard(post) {
    const platform = post.platform === 'instagram' ? 'Instagram' : 'Facebook';
    const icon = post.platform === 'instagram' ? '📷' : '👍';
    const timeAgo = this.getTimeAgo(post.timestamp);

    return `
      <div class="social-post-card" data-post-id="${post.id}" data-post-url="${post.permalink}">
        <div class="post-header">
          <span class="post-platform">${icon} ${platform}</span>
          <span class="post-time">${timeAgo}</span>
        </div>

        ${post.media_type === 'VIDEO' ? `
          <video class="post-media" poster="${post.thumbnail_url || ''}">
            <source src="${post.media_url}" type="video/mp4">
          </video>
          <div class="video-overlay">▶️</div>
        ` : `
          <img class="post-media" src="${post.media_url}" alt="Social media post" loading="lazy">
        `}

        ${post.caption ? `
          <div class="post-caption">
            <p>${this.truncateText(post.caption, 100)}</p>
          </div>
        ` : ''}

        <div class="post-engagement">
          ${post.like_count ? `<span>❤️ ${this.formatNumber(post.like_count)}</span>` : ''}
          ${post.comments_count ? `<span>💬 ${this.formatNumber(post.comments_count)}</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create a post card for universal feed (includes business info)
   * @param {Object} post - Post data
   * @returns {string} HTML string
   */
  createUniversalPostCard(post) {
    const platform = post.platform === 'instagram' ? 'Instagram' : 'Facebook';
    const icon = post.platform === 'instagram' ? '📷' : '👍';
    const timeAgo = this.getTimeAgo(post.timestamp);

    return `
      <div class="universal-post-card" data-post-id="${post.id}" data-post-url="${post.permalink}">
        <div class="post-business-header">
          <a href="/profile/${post.businessId}" class="business-link">
            ${post.businessLogo ? `<img src="${post.businessLogo}" alt="${post.businessName}" class="business-avatar">` : ''}
            <div class="business-info">
              <h3 class="business-name">${post.businessName}</h3>
              <span class="post-meta">${icon} ${platform} • ${timeAgo}</span>
            </div>
          </a>
        </div>

        ${post.caption ? `
          <div class="post-text">
            <p>${this.truncateText(post.caption, 150)}</p>
          </div>
        ` : ''}

        ${post.media_type === 'VIDEO' ? `
          <video class="post-media-large" poster="${post.thumbnail_url || ''}" controls>
            <source src="${post.media_url}" type="video/mp4">
          </video>
        ` : `
          <img class="post-media-large" src="${post.media_url}" alt="Social media post" loading="lazy">
        `}

        <div class="post-actions">
          <div class="post-engagement">
            ${post.like_count ? `<span>❤️ ${this.formatNumber(post.like_count)}</span>` : ''}
            ${post.comments_count ? `<span>💬 ${this.formatNumber(post.comments_count)}</span>` : ''}
          </div>
          <a href="${post.permalink}" target="_blank" class="view-original-btn">View Original Post →</a>
        </div>
      </div>
    `;
  }

  /**
   * Attach click handlers to posts
   * @param {HTMLElement} container - Container element
   */
  attachPostClickHandlers(container) {
    const postCards = container.querySelectorAll('[data-post-url]');
    postCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on business link or view original button
        if (e.target.closest('.business-link') || e.target.closest('.view-original-btn')) {
          return;
        }

        const url = card.getAttribute('data-post-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });
  }

  /**
   * Refresh universal feed silently
   * @param {string} containerId - Container element ID
   * @param {number} limit - Maximum posts
   */
  async refreshUniversalFeed(containerId, limit) {
    try {
      // Clear cache to force fresh fetch
      this.cache.lastFetch = null;

      const posts = await this.fetchAllPosts(limit);
      const container = document.getElementById(containerId);
      if (container) {
        this.renderUniversalFeed(posts, container);
      }
    } catch (error) {
      console.error('Error refreshing universal feed:', error);
    }
  }

  /**
   * Utility: Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Max length
   * @returns {string} Truncated text
   */
  truncateText(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  /**
   * Utility: Format numbers with K/M suffixes
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Utility: Get relative time string (e.g., "2 hours ago")
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Relative time string
   */
  getTimeAgo(timestamp) {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return posted.toLocaleDateString();
  }
}

// Initialize global instance
window.socialFeed = new SocialFeed();
