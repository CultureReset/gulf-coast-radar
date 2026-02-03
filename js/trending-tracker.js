// Trending & Heatmap Tracker
// Tracks business views, clicks, and activity to show what's popular

class TrendingTracker {
  constructor() {
    this.analytics = this.loadAnalytics();
    this.sessionStart = Date.now();
    this.init();
  }

  // Initialize tracker
  init() {
    // Track page views automatically
    this.trackPageView();

    // Set up auto-save interval
    setInterval(() => {
      this.saveAnalytics();
    }, 30000); // Save every 30 seconds

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveAnalytics();
    });
  }

  // Load analytics from localStorage
  loadAnalytics() {
    try {
      const stored = localStorage.getItem('gcr_trending_analytics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }

    // Default analytics structure with enhanced tracking
    return {
      businesses: {}, // businessId: { detailed metrics below }
      pageViews: {}, // page: count
      dailyStats: {}, // date: { totalViews, topBusinesses }
      lastCleanup: Date.now()
    };
  }

  // Initialize business analytics object with all tracking fields
  initBusinessAnalytics(businessId) {
    if (!this.analytics.businesses[businessId]) {
      this.analytics.businesses[businessId] = {
        // Basic metrics
        views: 0,
        clicks: 0,
        favorites: 0,
        calls: 0,
        directions: 0,
        websiteClicks: 0,

        // Search metrics
        searchAppearances: 0,
        searchClicks: 0,

        // Menu metrics
        menuViews: 0,
        menuItemClicks: {},  // itemName: clickCount
        mostPopularMenuItem: null,

        // Photo metrics
        photoViews: 0,
        photoClicks: {},  // photoIndex: clickCount
        userPhotoUploads: 0,

        // Engagement metrics
        loyaltySignups: 0,
        reservationAttempts: 0,
        shareClicks: 0,

        // Time-based metrics
        lastActivity: Date.now(),
        firstSeen: Date.now(),
        peakHours: {},  // hour: activityCount

        // Daily breakdown
        dailyMetrics: {}  // date: { views, clicks, etc }
      };
    }
    return this.analytics.businesses[businessId];
  }

  // Save analytics to localStorage
  saveAnalytics() {
    try {
      // Clean old data (keep last 7 days)
      this.cleanupOldData();

      localStorage.setItem('gcr_trending_analytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  // Clean up data older than 7 days
  cleanupOldData() {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Only clean once per day
    if (this.analytics.lastCleanup > Date.now() - (24 * 60 * 60 * 1000)) {
      return;
    }

    // Remove old daily stats
    Object.keys(this.analytics.dailyStats).forEach(date => {
      const timestamp = new Date(date).getTime();
      if (timestamp < sevenDaysAgo) {
        delete this.analytics.dailyStats[date];
      }
    });

    this.analytics.lastCleanup = Date.now();
  }

  // Track page view
  trackPageView() {
    const page = window.location.pathname;

    if (!this.analytics.pageViews[page]) {
      this.analytics.pageViews[page] = 0;
    }

    this.analytics.pageViews[page]++;
  }

  // Track business view
  trackBusinessView(businessId) {
    if (!businessId) return;

    const business = this.initBusinessAnalytics(businessId);
    business.views++;
    business.lastActivity = Date.now();

    // Track peak hour
    const hour = new Date().getHours();
    business.peakHours[hour] = (business.peakHours[hour] || 0) + 1;

    this.updateDailyStats(businessId, 'view');
    this.updateDailyMetrics(businessId, 'views');
  }

  // Track business click (e.g., clicking on card to go to profile)
  trackBusinessClick(businessId) {
    if (!businessId) return;

    if (!this.analytics.businesses[businessId]) {
      this.trackBusinessView(businessId);
    }

    this.analytics.businesses[businessId].clicks++;
    this.analytics.businesses[businessId].lastActivity = Date.now();

    this.updateDailyStats(businessId, 'click');
  }

  // Track favorite
  trackFavorite(businessId) {
    if (!businessId) return;

    if (!this.analytics.businesses[businessId]) {
      this.trackBusinessView(businessId);
    }

    this.analytics.businesses[businessId].favorites++;
    this.analytics.businesses[businessId].lastActivity = Date.now();

    this.updateDailyStats(businessId, 'favorite');
  }

  // Track phone call
  trackCall(businessId) {
    if (!businessId) return;

    if (!this.analytics.businesses[businessId]) {
      this.trackBusinessView(businessId);
    }

    this.analytics.businesses[businessId].calls++;
    this.analytics.businesses[businessId].lastActivity = Date.now();

    this.updateDailyStats(businessId, 'call');
  }

  // Track directions request
  trackDirections(businessId) {
    if (!businessId) return;

    if (!this.analytics.businesses[businessId]) {
      this.trackBusinessView(businessId);
    }

    this.analytics.businesses[businessId].directions++;
    this.analytics.businesses[businessId].lastActivity = Date.now();

    this.updateDailyStats(businessId, 'directions');
  }

  // Update daily stats
  updateDailyStats(businessId, actionType) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (!this.analytics.dailyStats[today]) {
      this.analytics.dailyStats[today] = {
        totalViews: 0,
        topBusinesses: {}
      };
    }

    if (!this.analytics.dailyStats[today].topBusinesses[businessId]) {
      this.analytics.dailyStats[today].topBusinesses[businessId] = {
        views: 0,
        clicks: 0,
        favorites: 0,
        calls: 0,
        directions: 0
      };
    }

    this.analytics.dailyStats[today].topBusinesses[businessId][actionType === 'view' ? 'views' : actionType]++;

    if (actionType === 'view') {
      this.analytics.dailyStats[today].totalViews++;
    }
  }

  // Calculate trending score for a business
  calculateTrendingScore(businessId) {
    const data = this.analytics.businesses[businessId];
    if (!data) return 0;

    const now = Date.now();
    const hoursSinceLastActivity = (now - data.lastActivity) / (1000 * 60 * 60);

    // Recent activity gets much higher weight
    const recencyBoost = hoursSinceLastActivity < 1 ? 3 :
                         hoursSinceLastActivity < 6 ? 2 :
                         hoursSinceLastActivity < 24 ? 1.5 : 1;

    // Weighted scoring
    const score = (
      (data.views * 1) +
      (data.clicks * 3) +
      (data.favorites * 5) +
      (data.calls * 7) +
      (data.directions * 6)
    ) * recencyBoost;

    return score;
  }

  // Get trending businesses
  getTrendingBusinesses(limit = 10) {
    const scores = {};

    // Calculate scores for all businesses
    Object.keys(this.analytics.businesses).forEach(businessId => {
      scores[businessId] = this.calculateTrendingScore(businessId);
    });

    // Sort by score
    const sorted = Object.entries(scores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit);

    return sorted.map(([businessId, score]) => ({
      businessId,
      score,
      data: this.analytics.businesses[businessId]
    }));
  }

  // Check if a business is trending
  isTrending(businessId, threshold = 50) {
    const score = this.calculateTrendingScore(businessId);
    return score >= threshold;
  }

  // Get trending badge HTML
  getTrendingBadge(businessId) {
    if (this.isTrending(businessId)) {
      return `<div class="trending-badge">🔥 Trending Now</div>`;
    }
    return '';
  }

  // Get today's top businesses
  getTodayTopBusinesses(limit = 5) {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.analytics.dailyStats[today];

    if (!todayStats || !todayStats.topBusinesses) {
      return [];
    }

    // Calculate activity score for today
    const scores = {};
    Object.entries(todayStats.topBusinesses).forEach(([businessId, data]) => {
      scores[businessId] = (
        (data.views * 1) +
        (data.clicks * 3) +
        (data.favorites * 5) +
        (data.calls * 7) +
        (data.directions * 6)
      );
    });

    // Sort by score
    return Object.entries(scores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([businessId, score]) => ({
        businessId,
        score,
        data: todayStats.topBusinesses[businessId]
      }));
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const trending = this.getTrendingBusinesses(10);
    const today = this.getTodayTopBusinesses(5);

    return {
      totalBusinessesTracked: Object.keys(this.analytics.businesses).length,
      totalViews: Object.values(this.analytics.businesses).reduce((sum, b) => sum + b.views, 0),
      totalClicks: Object.values(this.analytics.businesses).reduce((sum, b) => sum + b.clicks, 0),
      trending: trending,
      today: today
    };
  }

  // Show trending dashboard (admin view)
  showTrendingDashboard() {
    const summary = this.getAnalyticsSummary();

    const modal = document.createElement('div');
    modal.className = 'trending-dashboard-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="trending-dashboard-content">
        <div class="dashboard-header">
          <h3>📊 Trending Dashboard</h3>
          <button class="dashboard-close" onclick="this.closest('.trending-dashboard-modal').remove()">×</button>
        </div>

        <div class="dashboard-body">
          <div class="dashboard-summary">
            <div class="summary-card">
              <div class="summary-value">${summary.totalBusinessesTracked}</div>
              <div class="summary-label">Businesses Tracked</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${summary.totalViews}</div>
              <div class="summary-label">Total Views</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${summary.totalClicks}</div>
              <div class="summary-label">Total Clicks</div>
            </div>
          </div>

          <div class="dashboard-section">
            <h4>🔥 Trending Now</h4>
            ${this.renderTrendingList(summary.trending)}
          </div>

          <div class="dashboard-section">
            <h4>📈 Today's Top</h4>
            ${this.renderTrendingList(summary.today)}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  renderTrendingList(items) {
    if (items.length === 0) {
      return '<p class="no-data">No trending data yet</p>';
    }

    return `
      <div class="trending-list">
        ${items.map((item, index) => {
          const business = typeof allBusinesses !== 'undefined' ?
            allBusinesses.find(b => b.id === item.businessId) : null;

          const name = business ? business.name : item.businessId;

          return `
            <div class="trending-item">
              <div class="trending-rank">#${index + 1}</div>
              <div class="trending-info">
                <div class="trending-name">${name}</div>
                <div class="trending-stats">
                  ${item.data.views || 0} views • ${item.data.clicks || 0} clicks
                </div>
              </div>
              <div class="trending-score">${Math.round(item.score)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ========== ENHANCED TRACKING METHODS ==========

  // Track when business appears in search results
  trackSearchAppearance(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.searchAppearances++;
    this.updateDailyMetrics(businessId, 'searchAppearances');
  }

  // Track when user clicks business from search results
  trackSearchClick(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.searchClicks++;
    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'searchClicks');
  }

  // Track website link clicks
  trackWebsiteClick(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.websiteClicks++;
    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'websiteClicks');
  }

  // Track menu item clicks
  trackMenuItemClick(businessId, menuItemName) {
    if (!businessId || !menuItemName) return;
    const business = this.initBusinessAnalytics(businessId);

    business.menuViews++;

    if (!business.menuItemClicks[menuItemName]) {
      business.menuItemClicks[menuItemName] = 0;
    }
    business.menuItemClicks[menuItemName]++;

    // Update most popular menu item
    const topItem = Object.entries(business.menuItemClicks)
      .sort(([, a], [, b]) => b - a)[0];
    business.mostPopularMenuItem = topItem ? topItem[0] : null;

    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'menuItemClicks');
  }

  // Track photo views
  trackPhotoView(businessId, photoIndex = 0) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);

    business.photoViews++;

    if (!business.photoClicks[photoIndex]) {
      business.photoClicks[photoIndex] = 0;
    }
    business.photoClicks[photoIndex]++;

    this.updateDailyMetrics(businessId, 'photoViews');
  }

  // Track user photo uploads (user-generated content)
  trackUserPhotoUpload(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.userPhotoUploads++;
    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'userPhotoUploads');
  }

  // Track loyalty program signups
  trackLoyaltySignup(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.loyaltySignups++;
    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'loyaltySignups');
  }

  // Track reservation attempts
  trackReservationAttempt(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.reservationAttempts++;
    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'reservationAttempts');
  }

  // Track share button clicks
  trackShareClick(businessId) {
    if (!businessId) return;
    const business = this.initBusinessAnalytics(businessId);
    business.shareClicks++;
    business.lastActivity = Date.now();
    this.updateDailyMetrics(businessId, 'shareClicks');
  }

  // Update daily metrics for detailed day-by-day tracking
  updateDailyMetrics(businessId, metricName) {
    const business = this.analytics.businesses[businessId];
    if (!business) return;

    const today = new Date().toISOString().split('T')[0];

    if (!business.dailyMetrics[today]) {
      business.dailyMetrics[today] = {
        views: 0,
        clicks: 0,
        searchAppearances: 0,
        searchClicks: 0,
        menuItemClicks: 0,
        photoViews: 0,
        websiteClicks: 0,
        calls: 0,
        directions: 0,
        favorites: 0,
        loyaltySignups: 0,
        reservationAttempts: 0,
        shareClicks: 0,
        userPhotoUploads: 0
      };
    }

    business.dailyMetrics[today][metricName] =
      (business.dailyMetrics[today][metricName] || 0) + 1;
  }

  // Get detailed analytics for a specific business
  getBusinessAnalytics(businessId) {
    const business = this.analytics.businesses[businessId];
    if (!business) {
      return null;
    }

    // Calculate conversion rates
    const clickThroughRate = business.searchAppearances > 0
      ? ((business.searchClicks / business.searchAppearances) * 100).toFixed(1)
      : 0;

    const viewToCallRate = business.views > 0
      ? ((business.calls / business.views) * 100).toFixed(1)
      : 0;

    const viewToReservationRate = business.views > 0
      ? ((business.reservationAttempts / business.views) * 100).toFixed(1)
      : 0;

    // Find peak hour
    const peakHour = Object.entries(business.peakHours || {})
      .sort(([, a], [, b]) => b - a)[0];

    // Get top 5 menu items
    const topMenuItems = Object.entries(business.menuItemClicks || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, clicks]) => ({ name, clicks }));

    // Calculate total engagement score
    const engagementScore = (
      (business.views * 1) +
      (business.clicks * 2) +
      (business.websiteClicks * 3) +
      (business.calls * 5) +
      (business.reservationAttempts * 7) +
      (business.loyaltySignups * 10)
    );

    return {
      businessId,
      metrics: business,
      insights: {
        clickThroughRate: `${clickThroughRate}%`,
        viewToCallRate: `${viewToCallRate}%`,
        viewToReservationRate: `${viewToReservationRate}%`,
        peakHour: peakHour ? `${peakHour[0]}:00` : 'N/A',
        peakHourActivity: peakHour ? peakHour[1] : 0,
        topMenuItems,
        engagementScore,
        daysSinceFirstSeen: Math.floor((Date.now() - business.firstSeen) / (1000 * 60 * 60 * 24))
      }
    };
  }

  // Get all businesses sorted by engagement
  getAllBusinessesRanked() {
    return Object.keys(this.analytics.businesses)
      .map(businessId => {
        const analytics = this.getBusinessAnalytics(businessId);
        return {
          businessId,
          engagementScore: analytics.insights.engagementScore,
          views: analytics.metrics.views,
          clicks: analytics.metrics.clicks
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }
}

// Initialize global trending tracker
const trendingTracker = new TrendingTracker();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrendingTracker;
}
