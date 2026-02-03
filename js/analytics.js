// Analytics Tracking System
// Tracks business views, AI recommendations, clicks, and user behavior

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.startTime = Date.now();

    // Initialize analytics storage
    this.initStorage();

    console.log('📊 Analytics initialized - Session:', this.sessionId);
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  }

  // Initialize local storage for analytics
  initStorage() {
    if (!localStorage.getItem('gcr_analytics')) {
      localStorage.setItem('gcr_analytics', JSON.stringify({
        sessions: [],
        totalEvents: 0,
        firstVisit: Date.now()
      }));
    }
  }

  // Track AI recommendation
  trackRecommendation(businessId, businessName, source = 'ai-assistant') {
    const event = {
      type: 'recommendation',
      businessId: businessId,
      businessName: businessName,
      source: source,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.logEvent(event);
    this.updateBusinessStats(businessId, 'recommendations');

    console.log('📊 Tracked recommendation:', businessName);
  }

  // Track business profile view
  trackBusinessView(businessId, businessName, source = 'direct') {
    const event = {
      type: 'view',
      businessId: businessId,
      businessName: businessName,
      source: source, // 'ai-assistant', 'browse', 'search', 'direct'
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.logEvent(event);
    this.updateBusinessStats(businessId, 'views');

    console.log('📊 Tracked view:', businessName);
  }

  // Track when user clicks on business actions (call, directions, website)
  trackBusinessAction(businessId, businessName, action) {
    const event = {
      type: 'action',
      businessId: businessId,
      businessName: businessName,
      action: action, // 'call', 'directions', 'website', 'favorite', 'share'
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.logEvent(event);
    this.updateBusinessStats(businessId, 'actions');

    console.log('📊 Tracked action:', action, 'for', businessName);
  }

  // Track AI question asked
  trackAIQuestion(question, intent, resultsCount = 0) {
    const event = {
      type: 'ai_question',
      question: question,
      intent: intent,
      resultsCount: resultsCount,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.logEvent(event);
    console.log('📊 Tracked AI question:', intent);
  }

  // Track menu item search
  trackMenuSearch(searchQuery, resultsCount) {
    const event = {
      type: 'menu_search',
      query: searchQuery,
      resultsCount: resultsCount,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.logEvent(event);
    console.log('📊 Tracked menu search:', searchQuery, '(' + resultsCount + ' results)');
  }

  // Track page views
  trackPageView(pageName) {
    const event = {
      type: 'page_view',
      page: pageName,
      url: window.location.pathname,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.logEvent(event);
  }

  // Update business-specific statistics
  updateBusinessStats(businessId, metric) {
    const stats = this.getBusinessStats();

    if (!stats[businessId]) {
      stats[businessId] = {
        views: 0,
        recommendations: 0,
        actions: 0,
        lastInteraction: Date.now()
      };
    }

    stats[businessId][metric]++;
    stats[businessId].lastInteraction = Date.now();

    localStorage.setItem('gcr_business_stats', JSON.stringify(stats));
  }

  // Get business statistics
  getBusinessStats() {
    const stats = localStorage.getItem('gcr_business_stats');
    return stats ? JSON.parse(stats) : {};
  }

  // Get statistics for a specific business
  getStatsForBusiness(businessId) {
    const stats = this.getBusinessStats();
    return stats[businessId] || {
      views: 0,
      recommendations: 0,
      actions: 0,
      lastInteraction: null
    };
  }

  // Get top businesses by metric
  getTopBusinesses(metric = 'views', limit = 10) {
    const stats = this.getBusinessStats();

    return Object.entries(stats)
      .map(([id, data]) => ({ businessId: id, ...data }))
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, limit);
  }

  // Log event to memory (and optionally to server)
  logEvent(event) {
    this.events.push(event);

    // Store in localStorage for later analysis
    const analytics = JSON.parse(localStorage.getItem('gcr_analytics'));
    analytics.totalEvents++;

    // Keep last 100 events per session
    if (this.events.length > 100) {
      this.events.shift();
    }

    localStorage.setItem('gcr_analytics', JSON.stringify(analytics));

    // TODO: Send to backend analytics API when available
    // this.sendToServer(event);
  }

  // Get all events for current session
  getSessionEvents() {
    return this.events;
  }

  // Get summary statistics
  getSummary() {
    const stats = this.getBusinessStats();
    const analytics = JSON.parse(localStorage.getItem('gcr_analytics'));

    return {
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.startTime,
      totalEvents: this.events.length,
      eventsBreakdown: this.getEventsBreakdown(),
      topBusinesses: this.getTopBusinesses('views', 5),
      totalBusinessInteractions: Object.keys(stats).length,
      analytics: analytics
    };
  }

  // Get breakdown of events by type
  getEventsBreakdown() {
    const breakdown = {};
    this.events.forEach(event => {
      breakdown[event.type] = (breakdown[event.type] || 0) + 1;
    });
    return breakdown;
  }

  // Export analytics data (for business owners)
  exportData() {
    return {
      session: {
        id: this.sessionId,
        events: this.events,
        summary: this.getSummary()
      },
      businessStats: this.getBusinessStats(),
      timestamp: Date.now()
    };
  }

  // Clear old analytics data (privacy-friendly)
  clearOldData(daysOld = 30) {
    // TODO: Implement cleanup of old data
    console.log('Analytics cleanup not yet implemented');
  }
}

// Create global analytics instance
window.analyticsTracker = new AnalyticsTracker();

// Auto-track page views
window.addEventListener('DOMContentLoaded', () => {
  const pageName = document.title || window.location.pathname;
  window.analyticsTracker.trackPageView(pageName);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsTracker;
}
