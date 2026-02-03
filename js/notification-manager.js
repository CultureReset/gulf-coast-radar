// Push Notification Manager
// Handles notification permissions, preferences, and sending notifications
// NO user accounts required - preferences saved to localStorage

class NotificationManager {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.preferences = this.loadPreferences();
    this.init();
  }

  // Initialize notification manager
  async init() {
    // Check if service worker and notifications are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    // Register service worker if not already registered
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
      console.log('Notification Manager initialized');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Load notification preferences from localStorage
  loadPreferences() {
    try {
      const stored = localStorage.getItem('gcr_notification_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }

    // Default preferences
    return {
      enabled: false,
      types: {
        happyHour: true,
        specials: true,
        events: true,
        businessUpdates: true,
        reservationReminders: true,
        nearby: false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      location: {
        enabled: false,
        radius: 5 // miles
      }
    };
  }

  // Save preferences to localStorage
  savePreferences() {
    try {
      localStorage.setItem('gcr_notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  // Check if notifications are currently enabled
  isEnabled() {
    return this.preferences.enabled && Notification.permission === 'granted';
  }

  // Get current permission state
  getPermissionState() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission; // 'default', 'granted', or 'denied'
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      return { success: false, reason: 'unsupported' };
    }

    if (Notification.permission === 'granted') {
      this.preferences.enabled = true;
      this.savePreferences();
      return { success: true, permission: 'granted' };
    }

    if (Notification.permission === 'denied') {
      return { success: false, reason: 'denied' };
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        this.preferences.enabled = true;
        this.savePreferences();
        this.showWelcomeNotification();
        return { success: true, permission: 'granted' };
      } else {
        return { success: false, reason: 'denied' };
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return { success: false, reason: 'error', error };
    }
  }

  // Show welcome notification after enabling
  showWelcomeNotification() {
    this.sendNotification({
      title: '🌊 Notifications Enabled!',
      body: 'You\'ll now receive updates about specials, happy hours, and events near you.',
      type: 'general'
    });
  }

  // Update notification preferences
  updatePreferences(newPreferences) {
    this.preferences = {
      ...this.preferences,
      ...newPreferences
    };
    this.savePreferences();
  }

  // Enable/disable specific notification type
  setNotificationType(type, enabled) {
    if (this.preferences.types.hasOwnProperty(type)) {
      this.preferences.types[type] = enabled;
      this.savePreferences();
    }
  }

  // Check if in quiet hours
  isInQuietHours() {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const start = this.preferences.quietHours.start;
    const end = this.preferences.quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    } else {
      return currentTime >= start && currentTime < end;
    }
  }

  // Check if notification type is allowed
  isTypeAllowed(type) {
    return this.preferences.types[type] !== false;
  }

  // Send notification
  async sendNotification(data) {
    if (!this.isEnabled()) {
      console.log('Notifications not enabled');
      return false;
    }

    // Check quiet hours
    if (this.isInQuietHours()) {
      console.log('In quiet hours, notification suppressed');
      return false;
    }

    // Check if type is allowed
    const typeMap = {
      'happy-hour': 'happyHour',
      'special': 'specials',
      'event': 'events',
      'business-update': 'businessUpdates',
      'reservation-reminder': 'reservationReminders',
      'nearby': 'nearby'
    };

    const prefType = typeMap[data.type];
    if (prefType && !this.isTypeAllowed(prefType)) {
      console.log(`Notification type ${prefType} is disabled`);
      return false;
    }

    try {
      await this.serviceWorkerRegistration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/icon-192.png',
        tag: data.tag || `gcr-${data.type}-${Date.now()}`,
        data: data,
        vibrate: data.vibrate || [200, 100, 200],
        requireInteraction: data.requireInteraction || false
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send happy hour notification
  sendHappyHourNotification(business) {
    return this.sendNotification({
      title: '🍹 Happy Hour Alert!',
      body: `${business.name} - Happy hour is starting now!`,
      type: 'happy-hour',
      businessId: business.id,
      businessName: business.name,
      address: business.address,
      requireInteraction: false
    });
  }

  // Send special notification
  sendSpecialNotification(business, special) {
    return this.sendNotification({
      title: '🎉 New Special!',
      body: `${business.name} - ${special.title || 'Check out this deal!'}`,
      type: 'special',
      businessId: business.id,
      businessName: business.name,
      address: business.address,
      specialId: special.id
    });
  }

  // Send event notification
  sendEventNotification(event) {
    return this.sendNotification({
      title: '🎵 Event Starting Soon',
      body: `${event.title} at ${event.venue}`,
      type: 'event',
      eventId: event.id,
      eventName: event.title,
      address: event.address,
      requireInteraction: true
    });
  }

  // Send reservation reminder
  sendReservationReminder(business, reservationTime) {
    return this.sendNotification({
      title: '📅 Reservation Reminder',
      body: `Your reservation at ${business.name} is at ${reservationTime}`,
      type: 'reservation-reminder',
      businessId: business.id,
      businessName: business.name,
      address: business.address,
      requireInteraction: true
    });
  }

  // Send nearby business notification
  sendNearbyNotification(business, distance) {
    return this.sendNotification({
      title: '📍 Nearby',
      body: `${business.name} is ${distance} away!`,
      type: 'nearby',
      businessId: business.id,
      businessName: business.name,
      address: business.address
    });
  }

  // Show notification preferences modal
  showPreferencesModal() {
    // Remove existing modal if any
    const existing = document.getElementById('notification-preferences-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'notification-preferences-modal';
    modal.className = 'notification-preferences-modal';
    modal.innerHTML = `
      <div class="notification-modal-overlay" onclick="document.getElementById('notification-preferences-modal').remove()"></div>
      <div class="notification-modal-content">
        <div class="notification-modal-header">
          <h3>🔔 Notification Preferences</h3>
          <button class="notification-modal-close" onclick="document.getElementById('notification-preferences-modal').remove()">×</button>
        </div>

        <div class="notification-modal-body">
          ${this.renderPermissionSection()}
          ${this.renderNotificationTypes()}
          ${this.renderQuietHours()}
        </div>

        <div class="notification-modal-footer">
          <button class="btn-test-notification" onclick="notificationManager.testNotification()">
            🔔 Send Test Notification
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);

    // Setup event listeners
    this.setupPreferenceListeners();
  }

  renderPermissionSection() {
    const permission = this.getPermissionState();
    const enabled = this.preferences.enabled;

    let statusHTML = '';

    if (permission === 'unsupported') {
      statusHTML = `
        <div class="notification-status notification-unsupported">
          ⚠️ Notifications are not supported on this device
        </div>
      `;
    } else if (permission === 'denied') {
      statusHTML = `
        <div class="notification-status notification-denied">
          🚫 Notifications are blocked. Enable them in your browser settings.
        </div>
      `;
    } else if (permission === 'granted') {
      statusHTML = `
        <div class="notification-status notification-granted">
          ✅ Notifications are enabled
        </div>
        <label class="notification-toggle">
          <input type="checkbox" id="notification-master-toggle" ${enabled ? 'checked' : ''}>
          <span>Enable all notifications</span>
        </label>
      `;
    } else {
      statusHTML = `
        <div class="notification-status notification-default">
          🔔 Enable notifications to receive updates
        </div>
        <button class="btn-enable-notifications" onclick="notificationManager.handleEnableNotifications()">
          Enable Notifications
        </button>
      `;
    }

    return `
      <div class="notification-section">
        <h4>Permission</h4>
        ${statusHTML}
      </div>
    `;
  }

  renderNotificationTypes() {
    if (!this.isEnabled()) {
      return '';
    }

    const types = [
      { key: 'happyHour', label: '🍹 Happy Hour Alerts', description: 'Get notified when happy hour starts nearby' },
      { key: 'specials', label: '🎉 Specials & Deals', description: 'New promotions and limited-time offers' },
      { key: 'events', label: '🎵 Events', description: 'Live music, entertainment, and special events' },
      { key: 'businessUpdates', label: '📢 Business Updates', description: 'Updates from your favorite places' },
      { key: 'reservationReminders', label: '📅 Reservation Reminders', description: 'Reminders for upcoming reservations' },
      { key: 'nearby', label: '📍 Nearby Alerts', description: 'When you\'re near saved favorite places' }
    ];

    return `
      <div class="notification-section">
        <h4>Notification Types</h4>
        <div class="notification-types">
          ${types.map(type => `
            <label class="notification-type-item">
              <div class="notification-type-info">
                <div class="notification-type-label">${type.label}</div>
                <div class="notification-type-description">${type.description}</div>
              </div>
              <input type="checkbox"
                     class="notification-type-checkbox"
                     data-type="${type.key}"
                     ${this.preferences.types[type.key] ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderQuietHours() {
    if (!this.isEnabled()) {
      return '';
    }

    return `
      <div class="notification-section">
        <h4>Quiet Hours</h4>
        <label class="notification-toggle">
          <input type="checkbox" id="quiet-hours-toggle" ${this.preferences.quietHours.enabled ? 'checked' : ''}>
          <span>Enable quiet hours</span>
        </label>
        <div class="quiet-hours-settings" style="display: ${this.preferences.quietHours.enabled ? 'block' : 'none'}">
          <div class="quiet-hours-time">
            <label>
              Start time:
              <input type="time" id="quiet-hours-start" value="${this.preferences.quietHours.start}">
            </label>
            <label>
              End time:
              <input type="time" id="quiet-hours-end" value="${this.preferences.quietHours.end}">
            </label>
          </div>
          <p class="quiet-hours-description">No notifications will be sent during these hours</p>
        </div>
      </div>
    `;
  }

  setupPreferenceListeners() {
    // Master toggle
    const masterToggle = document.getElementById('notification-master-toggle');
    if (masterToggle) {
      masterToggle.addEventListener('change', (e) => {
        this.preferences.enabled = e.target.checked;
        this.savePreferences();
      });
    }

    // Type checkboxes
    document.querySelectorAll('.notification-type-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const type = e.target.dataset.type;
        this.setNotificationType(type, e.target.checked);
      });
    });

    // Quiet hours toggle
    const quietHoursToggle = document.getElementById('quiet-hours-toggle');
    if (quietHoursToggle) {
      quietHoursToggle.addEventListener('change', (e) => {
        this.preferences.quietHours.enabled = e.target.checked;
        this.savePreferences();

        const settings = document.querySelector('.quiet-hours-settings');
        if (settings) {
          settings.style.display = e.target.checked ? 'block' : 'none';
        }
      });
    }

    // Quiet hours times
    const startTime = document.getElementById('quiet-hours-start');
    const endTime = document.getElementById('quiet-hours-end');

    if (startTime) {
      startTime.addEventListener('change', (e) => {
        this.preferences.quietHours.start = e.target.value;
        this.savePreferences();
      });
    }

    if (endTime) {
      endTime.addEventListener('change', (e) => {
        this.preferences.quietHours.end = e.target.value;
        this.savePreferences();
      });
    }
  }

  async handleEnableNotifications() {
    const result = await this.requestPermission();

    if (result.success) {
      // Reload the modal to show enabled state
      this.showPreferencesModal();
    } else if (result.reason === 'denied') {
      alert('Notifications were blocked. Please enable them in your browser settings.');
    } else {
      alert('Could not enable notifications. Please try again.');
    }
  }

  testNotification() {
    this.sendNotification({
      title: '🌊 Test Notification',
      body: 'This is a test notification from Gulf Coast Radar!',
      type: 'general'
    });

    document.getElementById('notification-preferences-modal').remove();
  }
}

// Initialize global notification manager
const notificationManager = new NotificationManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
