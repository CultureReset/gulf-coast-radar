// Real-time Business Updates and Notifications System
// Shows latest updates from businesses across the platform

class NotificationsManager {
  constructor() {
    this.storageKey = 'gulfCoastRadar_notifications';
    this.dismissedKey = 'gulfCoastRadar_dismissedNotifications';
    this.notifications = this.loadNotifications();
    this.dismissed = this.loadDismissed();
  }

  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  /**
   * Load dismissed notification IDs
   */
  loadDismissed() {
    try {
      const stored = localStorage.getItem(this.dismissedKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  /**
   * Save dismissed notification IDs
   */
  saveDismissed() {
    try {
      localStorage.setItem(this.dismissedKey, JSON.stringify(this.dismissed));
    } catch (error) {
      console.error('Error saving dismissed notifications:', error);
    }
  }

  /**
   * Add a notification (for businesses to use via CyberCheck)
   */
  addNotification(businessId, notification) {
    const newNotification = {
      id: `${businessId}-${Date.now()}`,
      businessId,
      type: notification.type || 'update', // update, special, event, alert
      title: notification.title,
      message: notification.message,
      link: notification.link || `profile.html?id=${businessId}`,
      timestamp: Date.now(),
      expiresAt: notification.expiresAt || (Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days default
    };

    this.notifications.unshift(newNotification);
    // Keep only last 100 notifications
    this.notifications = this.notifications.slice(0, 100);
    this.saveNotifications();

    return newNotification;
  }

  /**
   * Get active notifications (not dismissed, not expired)
   */
  getActiveNotifications() {
    const now = Date.now();
    return this.notifications.filter(notification =>
      !this.dismissed.includes(notification.id) &&
      notification.expiresAt > now
    );
  }

  /**
   * Dismiss a notification
   */
  dismissNotification(notificationId) {
    if (!this.dismissed.includes(notificationId)) {
      this.dismissed.push(notificationId);
      this.saveDismissed();
    }
  }

  /**
   * Generate sample notifications from business data
   */
  generateSampleNotifications(allBusinesses) {
    // Clear existing sample notifications
    this.notifications = [];

    // Add sample notifications for demonstration
    const sampleNotifications = [
      {
        businessId: 'lulu-buffet',
        type: 'special',
        title: '🦐 Weekend Seafood Special',
        message: 'Fresh Gulf Shrimp Boil this weekend only! Call ahead to reserve.',
        timestamp: Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        businessId: 'cobalt',
        type: 'event',
        title: '🎵 Live Music Tonight',
        message: 'Join us for live acoustic music on the deck starting at 7 PM!',
        timestamp: Date.now() - (1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        businessId: 'the-hangout',
        type: 'update',
        title: '🎉 New Menu Items',
        message: 'Check out our new summer cocktail menu featuring tropical favorites!',
        timestamp: Date.now() - (30 * 60 * 1000) // 30 minutes ago
      }
    ];

    sampleNotifications.forEach(notification => {
      this.addNotification(notification.businessId, notification);
    });
  }

  /**
   * Render notification banner for homepage
   */
  renderNotificationBanner() {
    const activeNotifications = this.getActiveNotifications();

    if (activeNotifications.length === 0) {
      return '';
    }

    // Show only the most recent 3 notifications
    const recentNotifications = activeNotifications.slice(0, 3);

    return `
      <section class="notifications-banner" style="margin: 16px 16px 0 16px;">
        ${recentNotifications.map(notification => this.renderNotificationCard(notification)).join('')}
      </section>
    `;
  }

  /**
   * Render a single notification card
   */
  renderNotificationCard(notification) {
    const timeAgo = this.getTimeAgo(notification.timestamp);
    const typeColors = {
      update: 'linear-gradient(135deg, #667eea, #764ba2)',
      special: 'linear-gradient(135deg, #f093fb, #f5576c)',
      event: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      alert: 'linear-gradient(135deg, #fa709a, #fee140)'
    };

    const bgColor = typeColors[notification.type] || typeColors.update;

    return `
      <div class="notification-card" style="background: ${bgColor}; padding: 16px; border-radius: 12px; margin-bottom: 12px; position: relative; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" onclick="window.location.href='${notification.link}'">
        <button class="notification-dismiss" onclick="event.stopPropagation(); notificationsManager.dismissNotification('${notification.id}'); this.closest('.notification-card').remove();" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center;">×</button>
        <div style="display: flex; gap: 12px; align-items: start;">
          <div style="flex: 1;">
            <h3 style="color: white; margin: 0 0 4px 0; font-size: 16px; font-weight: 700; padding-right: 30px;">${notification.title}</h3>
            <p style="color: rgba(255,255,255,0.95); margin: 0 0 8px 0; font-size: 14px; line-height: 1.4;">${notification.message}</p>
            <div style="font-size: 12px; color: rgba(255,255,255,0.8);">${timeAgo}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get human-readable time ago
   */
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  /**
   * Render notification bell icon with badge
   */
  renderNotificationBell() {
    const count = this.getActiveNotifications().length;

    if (count === 0) {
      return '';
    }

    return `
      <button class="notification-bell-btn" onclick="notificationsManager.showNotificationsModal()" style="position: relative; background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 8px;">
        🔔
        <span class="notification-badge" style="position: absolute; top: 4px; right: 4px; background: #ef4444; color: white; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${count > 9 ? '9+' : count}</span>
      </button>
    `;
  }

  /**
   * Show notifications modal
   */
  showNotificationsModal() {
    const activeNotifications = this.getActiveNotifications();

    const modal = document.createElement('div');
    modal.id = 'notifications-modal';
    modal.className = 'notifications-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="document.getElementById('notifications-modal').remove()"></div>
      <div class="modal-content" style="background: var(--bg-elevated); width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; border-radius: 16px; position: relative;">
        <div class="modal-header" style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: var(--text-primary);">Notifications</h3>
          <button onclick="document.getElementById('notifications-modal').remove()" style="background: none; border: none; font-size: 32px; color: var(--text-secondary); cursor: pointer;">×</button>
        </div>
        <div class="modal-body" style="padding: 16px;">
          ${activeNotifications.length > 0 ? `
            ${activeNotifications.map(notification => `
              <div class="notification-item" onclick="window.location.href='${notification.link}'" style="padding: 16px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-base)'" onmouseout="this.style.background='transparent'">
                <h4 style="margin: 0 0 4px 0; font-size: 15px; color: var(--text-primary);">${notification.title}</h4>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: var(--text-secondary); line-height: 1.4;">${notification.message}</p>
                <div style="font-size: 12px; color: var(--text-muted);">${this.getTimeAgo(notification.timestamp)}</div>
              </div>
            `).join('')}
          ` : `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
              <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
              <p>No new notifications</p>
            </div>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Initialize - generate sample notifications if none exist
   */
  init(allBusinesses) {
    if (this.notifications.length === 0 && allBusinesses) {
      this.generateSampleNotifications(allBusinesses);
    }
  }
}

// Initialize notifications manager
const notificationsManager = new NotificationsManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationsManager;
}
