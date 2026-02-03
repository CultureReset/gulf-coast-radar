/**
 * Menu Analytics - Track Menu Item Clicks and User Behavior
 * Gulf Coast Radar - Business Intelligence Module
 */

class MenuAnalytics {
  constructor() {
    this.businessId = null;
    this.sessionId = this.generateSessionId();
    this.analytics = {
      menuViews: 0,
      itemClicks: {},
      sectionClicks: {},
      timeOnMenu: 0,
      sessionStart: Date.now()
    };
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize analytics for a specific business
   */
  init(businessId, businessName) {
    this.businessId = businessId;
    this.businessName = businessName;
    this.trackMenuView();
    this.startTimeTracking();
    console.log('📊 Menu Analytics initialized for:', businessName);
  }

  /**
   * Track menu view
   */
  trackMenuView() {
    this.analytics.menuViews++;

    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'menu_view', {
        'event_category': 'Menu Analytics',
        'event_label': this.businessName,
        'business_id': this.businessId
      });
    }

    // Send to backend
    this.sendToBackend('menu_view', {
      businessId: this.businessId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track menu item click
   */
  trackItemClick(itemId, itemName, itemPrice, category) {
    // Increment click count
    if (!this.analytics.itemClicks[itemId]) {
      this.analytics.itemClicks[itemId] = {
        name: itemName,
        price: itemPrice,
        category: category,
        clicks: 0
      };
    }
    this.analytics.itemClicks[itemId].clicks++;

    // Track category
    if (!this.analytics.sectionClicks[category]) {
      this.analytics.sectionClicks[category] = 0;
    }
    this.analytics.sectionClicks[category]++;

    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'menu_item_click', {
        'event_category': 'Menu Analytics',
        'event_label': itemName,
        'business_id': this.businessId,
        'item_id': itemId,
        'item_category': category,
        'item_price': itemPrice
      });
    }

    // Send to backend
    this.sendToBackend('item_click', {
      businessId: this.businessId,
      itemId: itemId,
      itemName: itemName,
      itemPrice: itemPrice,
      category: category,
      timestamp: new Date().toISOString()
    });

    console.log('🔍 Item clicked:', itemName, 'in', category);
  }

  /**
   * Track section/category view
   */
  trackSectionView(sectionName) {
    if (!this.analytics.sectionClicks[sectionName]) {
      this.analytics.sectionClicks[sectionName] = 0;
    }
    this.analytics.sectionClicks[sectionName]++;

    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'menu_section_view', {
        'event_category': 'Menu Analytics',
        'event_label': sectionName,
        'business_id': this.businessId
      });
    }

    // Send to backend
    this.sendToBackend('section_view', {
      businessId: this.businessId,
      sectionName: sectionName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track AI question about menu item
   */
  trackAIQuestion(itemId, itemName, question) {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'menu_ai_question', {
        'event_category': 'Menu Analytics',
        'event_label': question,
        'business_id': this.businessId,
        'item_id': itemId,
        'item_name': itemName
      });
    }

    // Send to backend
    this.sendToBackend('ai_question', {
      businessId: this.businessId,
      itemId: itemId,
      itemName: itemName,
      question: question,
      timestamp: new Date().toISOString()
    });

    console.log('💬 AI Question about:', itemName, '-', question);
  }

  /**
   * Track time spent on menu
   */
  startTimeTracking() {
    // Track when user leaves
    window.addEventListener('beforeunload', () => {
      this.analytics.timeOnMenu = (Date.now() - this.analytics.sessionStart) / 1000;
      this.sendToBackend('session_end', {
        businessId: this.businessId,
        timeOnMenu: this.analytics.timeOnMenu,
        menuViews: this.analytics.menuViews,
        itemsClicked: Object.keys(this.analytics.itemClicks).length
      });
    });

    // Send periodic updates every 30 seconds
    setInterval(() => {
      this.analytics.timeOnMenu = (Date.now() - this.analytics.sessionStart) / 1000;
      this.sendToBackend('session_update', {
        businessId: this.businessId,
        timeOnMenu: this.analytics.timeOnMenu
      });
    }, 30000);
  }

  /**
   * Get top clicked items
   */
  getTopItems(limit = 10) {
    return Object.entries(this.analytics.itemClicks)
      .sort((a, b) => b[1].clicks - a[1].clicks)
      .slice(0, limit)
      .map(([id, data]) => ({
        id,
        ...data
      }));
  }

  /**
   * Get top sections
   */
  getTopSections() {
    return Object.entries(this.analytics.sectionClicks)
      .sort((a, b) => b[1] - a[1])
      .map(([section, clicks]) => ({
        section,
        clicks
      }));
  }

  /**
   * Send data to backend
   */
  async sendToBackend(eventType, data) {
    try {
      // Check if we're on localhost or production
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/analytics/menu'
        : '/api/analytics/menu';

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          sessionId: this.sessionId,
          ...data
        })
      });
    } catch (error) {
      console.error('❌ Failed to send analytics:', error);
    }
  }

  /**
   * Get summary report
   */
  getSummary() {
    return {
      menuViews: this.analytics.menuViews,
      timeOnMenu: Math.round(this.analytics.timeOnMenu),
      topItems: this.getTopItems(5),
      topSections: this.getTopSections(),
      totalItemsViewed: Object.keys(this.analytics.itemClicks).length
    };
  }
}

// Initialize global instance
window.menuAnalytics = new MenuAnalytics();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuAnalytics;
}
